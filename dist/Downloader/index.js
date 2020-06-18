export var downloadStatus;
(function (downloadStatus) {
    downloadStatus["WAITING"] = "waiting";
    downloadStatus["DOWNLOADING"] = "downloading";
    downloadStatus["COMPLETE"] = "complete";
    downloadStatus["FAILED"] = "failed";
})(downloadStatus || (downloadStatus = {}));
var max = 5; // 最大并行下载数量
var waitingQueue = []; // 等待下载队列
var downloadingQueue = []; // 正在下载队列
/** 设置最大并行下载数量 */
export function setMax(num) {
    max = num;
}
/** 下载下一张 */
function downloadNext(completedInstance) {
    var index = downloadingQueue.findIndex(function (instance) { return instance === completedInstance; });
    downloadingQueue.splice(index, 1); // 将已完成的任务移除
    var next = waitingQueue.shift();
    next && next.download();
}
function getDefaultName() {
    function add0(n) {
        return n < 10 ? '0' + n : String(n);
    }
    var date = new Date();
    return (date.getFullYear() +
        add0(date.getMonth() + 1) +
        add0(date.getDate()) +
        add0(date.getHours()) +
        add0(date.getMinutes()) +
        add0(date.getSeconds()));
}
var Downloader = /** @class */ (function () {
    function Downloader(_a) {
        var path = _a.path, name = _a.name;
        this.status = downloadStatus.WAITING; // 当前文件下载状态
        this.path = path;
        this.name = name || getDefaultName();
    }
    /**
     * 下载
     * 需要注意的是，由于使用xhr进行get请求，需要地址响应头设置Access-Control-Allow-Origin: *
     */
    Downloader.prototype.download = function () {
        var _this = this;
        if (downloadingQueue.length >= max) {
            waitingQueue.push(this);
            this.updateDownloadStatus(downloadStatus.WAITING);
        }
        else {
            downloadingQueue.push(this);
            this.updateDownloadStatus(downloadStatus.DOWNLOADING);
            var xhr_1 = new XMLHttpRequest();
            // 图片已经通过img标签加载过，浏览器默认会缓存下来，下次使用js方式再去请求，直接返回缓存的图片，
            // 如果缓存中的图片不是通过CORS请求或者响应头中不存在Access-Control-Allow-Origin，都会导致报错。
            xhr_1.open('get', this.path, true); // 使用缓存会造成下载丢失
            xhr_1.responseType = 'blob';
            xhr_1.onprogress = function (e) { return _this.handleProgress(e); };
            xhr_1.onload = function () { return _this.loadFile(xhr_1); };
            xhr_1.onerror = function () { return _this.loadFile(xhr_1); };
            xhr_1.send();
        }
    };
    Downloader.prototype.handleProgress = function (e) {
        if (this.onProgress) {
            var percent = ~~((e.loaded / e.total) * 100);
            this.onProgress(percent);
        }
    };
    /** 数据请求完成，保存到本地 */
    Downloader.prototype.loadFile = function (_a) {
        var httpStatus = _a.status, response = _a.response;
        // 下载下一张
        downloadNext(this);
        if (httpStatus !== 200) {
            return this.updateDownloadStatus(downloadStatus.FAILED);
        }
        this.updateDownloadStatus(downloadStatus.COMPLETE);
        var blob = new Blob([response], {
            type: response.type,
        });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = this.name;
        a.click();
    };
    /** 更新下载状态，执行钩子函数 */
    Downloader.prototype.updateDownloadStatus = function (status) {
        this.status = status;
        if (status === downloadStatus.DOWNLOADING && this.onDownload) {
            this.onDownload();
        }
        if (status === downloadStatus.COMPLETE && this.onComplete) {
            this.onComplete();
        }
        if (status === downloadStatus.WAITING && this.onWaiting) {
            this.onWaiting();
        }
    };
    return Downloader;
}());
export default Downloader;
