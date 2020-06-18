import React from 'react';
import Downloader, { downloaderParams } from './Downloader';
export interface DownloaderProps {
    downloader: Downloader;
}
export default function withDownloader(params: downloaderParams): <P extends object>(WrappedComponent: React.ComponentType<P>) => React.FC<Pick<P, Exclude<keyof P, "downloader">>>;
