## React下载组件

- #### HOC
```javascript
import withDownloader from 'react-downloader'

@withDownloader({ path: '', name: '' })
class Comp extends React.Component {
  onClick = () => {
    // 注入了downloader属性
    this.props.downloader.download()
  }
  render() {
    return <button onClick={this.onClick}>下载</button>
  }
}
```