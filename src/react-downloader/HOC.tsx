import React, { useRef } from 'react'
import Downloader, { downloaderParams } from './Downloader'

export interface DownloaderProps {
  downloader: Downloader
}

export default function withDownloader(params: downloaderParams) {
  return <P extends object>(
    WrappedComponent: React.ComponentType<P>
  ): React.FC<Omit<P, 'downloader'>> => (props) => {
    const downloader: Downloader = useRef<Downloader>(new Downloader(params)).current
    const transProps: P = { ...props, downloader } as P
    return <WrappedComponent {...transProps} />
  }
}
