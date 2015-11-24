
import React from 'react';
import ReactDOM from 'react-dom';
import superagent from 'superagent';

/**
 * Generate unique id
 *
 * @return int unique ID on opened page
 */
function uid() {
  if(typeof uid._idx === 'undefined') {
    uid._idx = 1;
  }

  return uid._idx++;
}

class Downloader {
  static download(uri, fileName) {
    var pseudoLink = document.createElement('a');

    if(fileName) {
      pseudoLink.download = 'image.jpg';
    }

    pseudoLink.target = '_blank';
    pseudoLink.href = uri;
    pseudoLink.click();
  }
}

/**
 * @class ImgEntity
 */
class ImgEntity {
  constructor() {
    this.uid = uid();
    this.blob = null;
    this.img = new Image();
  }

  /**
   * @return bool true:ready, false:not ready
   */
  ready() {
    return ((this.blob !== null) && this.img.src && this.img.complete);
  }

  /**
   * @param Blob blob image binary
   */
  set(blob) {
    this.blob = blob;
    this.img.src = window.URL.createObjectURL(blob);
  }

  /**
   *
   */
  destroy() {
    // http://hakuhin.jp/js/blob_url_scheme.html#BLOB_URL_SCHEME_01
    window.URL.createObjectURL(this.img.src);
  }

  /**
   * @param string url Image url
   * @return Promise resolve:fetch complete, reject:fetch faulure
   */
  fetch(url) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', '/proxy?url=' + encodeURIComponent(url), true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        resolve(this);
      };
      xhr.onerror = reject;
      xhr.send();
    });
  }
}

/**
 * @class ImageItem
 */
class ImageItem extends React.Component {
  /**
   * @param object props
   */
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  /**
   *
   */
  handleClose() {
    this.props.onClose(this.props.img);
  }

  /**
   * @param Event event Event object
   */
  handleUrlChange(event) {
    var url = event.target.value;
    this.props.img.fetch(url)
      .then((res) => {
        var blob = new Blob([res.response], { type: res.getResponseHeader('Content-Type') });
        this.props.img.set(blob);
      })
      .catch((err) => {
        this.setState({error: err});
      });
  }

  /**
   * @param Event event Event object
   */
  handleFileChange(event) {
    var r = new FileReader();
    var file = event.target.files[0];

    r.onload = (e) => {
      var blob = new Blob([e.target.result], { type: file.type });
      this.props.img.set(blob);
    };
    r.readAsArrayBuffer(file);
  }

  /**
   * @return ReactElements
   */
  render() {
    return (
      <li>
        <div className="pull-right">
          <button type="button" className="close" aria-label="Close" onClick={this.handleClose}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <label>
          画像{this.props.index}
          {this.state.error
            ? <span className="text-danger">: {this.state.error}</span>
            : ''}
        </label>
        <ul className="nav nav-tabs nav-justified" role="tablist">
          <li role="presentation" className="active">
            <a href={"#via-url-" + this.props.index} aria-controls="via-url" role="tab" data-toggle="tab">URL</a>
          </li>
          <li role="presentation">
            <a href={"#via-file-" + this.props.index} aria-controls="via-file" role="tab" data-toggle="tab">アップロード</a>
          </li>
        </ul>

        <div className="tab-content">
          <div role="tabpanel" className="tab-pane active" id={"via-url-" + this.props.index}>
            <input type="text" className="form-control resource-url" placeholder="http://example.com..." onChange={this.handleUrlChange.bind(this)} />
          </div>
          <div role="tabpanel" className="tab-pane" id={"via-file-" + this.props.index}>
            <input type="file" className="resource-file" placeholder="http://example.com..." onChange={this.handleFileChange.bind(this)} />
          </div>
        </div>
        <hr/>
      </li>
    );
  }
}

/**
 * @class Preview
 */
class Preview extends React.Component {
  /**
   * @param object props
   */
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
    };
  }

  draw(padding) {
    padding = padding || 0;

    var ctx = ReactDOM.findDOMNode(this.refs.imageList).getContext('2d');
    var offset = 0;
    var height = this.props.images.reduce(function(memo, imgEntity) {
      if(!imgEntity.ready()) return memo;

      var mag = Guide.MAX_WIDTH / imgEntity.img.width;
      return memo + (imgEntity.img.height * mag) + padding;
    }, 0);

    this.setState({ width: Guide.MAX_WIDTH, height: height });
    setTimeout(() => {
      var ctx = ReactDOM.findDOMNode(this.refs.imageList).getContext('2d');

      ctx.clearRect(0, 0, Guide.MAX_WIDTH, height);
      this.props.images.forEach(function(imgEntity, i) {
        if(!imgEntity.ready()) return;

        var mag = Guide.MAX_WIDTH / imgEntity.img.width;

        ctx.drawImage(imgEntity.img, 0, offset, Guide.MAX_WIDTH, imgEntity.img.height * mag);
        offset += (imgEntity.img.height * mag) + padding;
      });

      if(height - padding > Guide.MAX_HEIGHT) {
        alert('画像が1200pxより大きいです。赤線を確認して下さい');
      }
    }, 0);
  }

  /**
   * @return ReactElements
   */
  render() {
    return (
      <canvas className="canvas-layer guide" ref="imageList" width={this.state.width} height={this.state.height}></canvas>
    );
  }
}

/**
 * @class Guide
 */
class Guide extends React.Component {
  /**
   * @param object props
   */
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
    };
  }

  /**
   *
   */
  componentDidMount() {
    var w = $('#preview-wrap').width();
    var h = 2000;

    this.setState({ width: w, height: h });

    // setState後の再描画は非同期なのでこっちも非同期化して処理キューに詰める
    setTimeout(() => {
      var ctx = this.refs.canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(Guide.MAX_WIDTH, 0);
      ctx.lineTo(Guide.MAX_WIDTH, h);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(Guide.MAX_WIDTH + 'px', Guide.MAX_WIDTH + 5, 20);

      ctx.beginPath();
      ctx.moveTo(0, Guide.MAX_HEIGHT);
      ctx.lineTo(w, Guide.MAX_HEIGHT);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(Guide.MAX_HEIGHT + 'px', 10, Guide.MAX_HEIGHT + 15);
    });
  }

  /**
   * @return ReactElements
   */
  render() {
    return (
      <canvas ref="canvas" key={this.props.id} width={this.state.width} height={this.state.height}></canvas>
    );
  }
}
Guide.MAX_WIDTH = 640;
Guide.MAX_HEIGHT = 1200;

/**
 * @class App
 */
class App extends React.Component {
  /**
   * @param object props
   */
  constructor(props) {
    super(props);
    this.state = {
      images: [new ImgEntity, new ImgEntity, new ImgEntity, ],
    };
  }

  /**
   * @return ReactElements
   */
  handleClick() {
    var images = this.state.images.concat([new ImgEntity]);
    this.setState({images: images});
  }

  /**
   * @param ImageItem
   * @return ReactElements
   */
  handleClose(img) {
    var idx = this.state.images.indexOf(img);
    var copy = this.state.images.slice();
    copy.splice(idx, 1);

    this.setState({images: copy});
  }

  handleRefresh() {
    this.refs.preview.draw();
  }

  handleExport() {
    var canvas = ReactDOM.findDOMNode(this.refs.preview);
    var type = 'image/jpeg';
    var url = canvas.toDataURL(type);

    // 新窓でかつファイル名を指定するには擬似的にAタグをクリックするしか無い・・・？
    Downloader.download(url, 'image.jpg');
  }

  /**
   * @return ReactElements
   */
  render() {
    // FIXME: split component
    return (
      <div className="row">
        <div className="col-md-3">
          <p>画像URLを入力して下さい。上から順に画像を結合します。</p>

          <ul id="resources">{this.state.images.map((img, i) => {
            return (<ImageItem key={img.uid} img={img} index={i+1} onClose={this.handleClose} />);
          })}</ul>

          <div className="clearfix">
            <div className="pull-right">
              <button id="more" className="btn btn-primary" onClick={this.handleClick}>+</button>
            </div>
          </div>

          <h3>設定</h3>
          <form className="form-inline">
            <div className="form-group form-group-sm">
              <div className="col-sm-6">
                <label htmlFor="each-padding">画像と画像の余白</label>
              </div>
              <div className="input-group col-sm-6">
                <input type="number" className="form-control" id="each-padding" placeholder="0" />
                <div className="input-group-addon">px</div>
              </div>
            </div>
          </form>
        </div>

        <div className="col-md-9">
          <h2>
            プレビュー
            <div className="pull-right">
              <button className="btn btn-default" onClick={this.handleRefresh.bind(this)}>
                <i className="glyphicon glyphicon-refresh"></i>
              </button>
              <button className="btn btn-default" onClick={this.handleExport.bind(this)}>
                ダウンロードする
                <i className="glyphicon glyphicon-download-alt"></i>
              </button>
            </div>
          </h2>
          <div id="preview-wrap">
            <Preview images={this.state.images} ref="preview" />
            <Guide id={uid()} />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('app')
);
