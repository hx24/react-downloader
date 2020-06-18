export enum downloadStatus {
  WAITING = 'waiting',
  DOWNLOADING = 'downloading',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

let max: number = 5 // 最大并行下载数量
let waitingQueue: Downloader[] = [] // 等待下载队列
let downloadingQueue: Downloader[] = [] // 正在下载队列

/** 设置最大并行下载数量 */
export function setMax(num: number) {
  max = num
}

/** 下载下一张 */
function downloadNext(completedInstance: Downloader) {
  const index: number = downloadingQueue.findIndex(
    (instance: Downloader) => instance === completedInstance
  )
  downloadingQueue.splice(index, 1) // 将已完成的任务移除
  const next: Downloader | undefined = waitingQueue.shift()
  next && next.download()
}

function getDefaultName(): string {
  function add0(n: number): string {
    return n < 10 ? '0' + n : String(n)
  }
  const date = new Date()
  return (
    date.getFullYear() +
    add0(date.getMonth() + 1) +
    add0(date.getDate()) +
    add0(date.getHours()) +
    add0(date.getMinutes()) +
    add0(date.getSeconds())
  )
}

export type downloaderParams = {
  path: string
  name?: string
}

export default class Downloader {
  status: downloadStatus = downloadStatus.WAITING // 当前文件下载状态
  path: string // 文件路径
  name?: string // 文件名
  onDownload?: () => {}
  onComplete?: () => {}
  onWaiting?: () => {}
  onProgress?: (percent: number) => {}

  constructor({ path, name }: downloaderParams) {
    this.path = path
    this.name = name || getDefaultName()
  }

  /**
   * 下载
   * 需要注意的是，由于使用xhr进行get请求，需要地址响应头设置Access-Control-Allow-Origin: *
   */
  download() {
    if (downloadingQueue.length >= max) {
      waitingQueue.push(this)
      this.updateDownloadStatus(downloadStatus.WAITING)
    } else {
      downloadingQueue.push(this)
      this.updateDownloadStatus(downloadStatus.DOWNLOADING)
      let xhr = new XMLHttpRequest()
      // 图片已经通过img标签加载过，浏览器默认会缓存下来，下次使用js方式再去请求，直接返回缓存的图片，
      // 如果缓存中的图片不是通过CORS请求或者响应头中不存在Access-Control-Allow-Origin，都会导致报错。
      xhr.open('get', this.path, true) // 使用缓存会造成下载丢失
      xhr.responseType = 'blob'

      xhr.onprogress = (e) => this.handleProgress(e)
      xhr.onload = () => this.loadFile(xhr)
      xhr.onerror = () => this.loadFile(xhr)
      xhr.send()
    }
  }

  handleProgress(e: ProgressEvent) {
    if (this.onProgress) {
      var percent: number = ~~((e.loaded / e.total) * 100)
      this.onProgress(percent)
    }
  }

  /** 数据请求完成，保存到本地 */
  loadFile({ status: httpStatus, response }: XMLHttpRequest) {
    // 下载下一张
    downloadNext(this)
    if (httpStatus !== 200) {
      return this.updateDownloadStatus(downloadStatus.FAILED)
    }

    this.updateDownloadStatus(downloadStatus.COMPLETE)
    const blob = new Blob([response], {
      type: response.type,
    })
    const a: HTMLAnchorElement = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = this.name as string
    a.click()
  }

  /** 更新下载状态，执行钩子函数 */
  updateDownloadStatus(status: downloadStatus) {
    this.status = status
    if (status === downloadStatus.DOWNLOADING && this.onDownload) {
      this.onDownload()
    }
    if (status === downloadStatus.COMPLETE && this.onComplete) {
      this.onComplete()
    }
    if (status === downloadStatus.WAITING && this.onWaiting) {
      this.onWaiting()
    }
  }
}
