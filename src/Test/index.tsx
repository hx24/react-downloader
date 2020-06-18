import React, { useEffect } from 'react'
import withDownloader, { DownloaderProps } from '../react-downloader/HOC'

interface IPrps extends DownloaderProps {
  name: string
}

const Test: React.FC<IPrps> = (props) => {
  useEffect(() => {}, [])
  const click = () => {
    props.downloader.download()
  }
  return <h1 onClick={click}>下载</h1>
}

export default withDownloader({ path: 'http://localhost:8080/1.jpg' })(Test)
