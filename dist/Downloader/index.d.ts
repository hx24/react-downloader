export declare enum downloadStatus {
    WAITING = "waiting",
    DOWNLOADING = "downloading",
    COMPLETE = "complete",
    FAILED = "failed"
}
/** 设置最大并行下载数量 */
export declare function setMax(num: number): void;
export declare type downloaderParams = {
    path: string;
    name?: string;
};
export default class Downloader {
    status: downloadStatus;
    path: string;
    name?: string;
    onDownload?: () => {};
    onComplete?: () => {};
    onWaiting?: () => {};
    onProgress?: (percent: number) => {};
    constructor({ path, name }: downloaderParams);
    /**
     * 下载
     * 需要注意的是，由于使用xhr进行get请求，需要地址响应头设置Access-Control-Allow-Origin: *
     */
    download(): void;
    handleProgress(e: ProgressEvent): void;
    /** 数据请求完成，保存到本地 */
    loadFile({ status: httpStatus, response }: XMLHttpRequest): void;
    /** 更新下载状态，执行钩子函数 */
    updateDownloadStatus(status: downloadStatus): void;
}
