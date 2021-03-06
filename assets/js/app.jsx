
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

class Color {
  // http://stackoverflow.com/questions/2819619/validating-html-color-codes-js
  static valid(color) {
    var litmus = 'black';
    var d = document.createElement('div');
    d.style.color = litmus;
    d.style.color = color;
    //Element's style.color will be reverted to litmus or set to '' if an invalid color is given
    if( color !== litmus && (d.style.color === litmus || d.style.color === '')){
        return false;
    }

    return true;
  }
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
   * @return Promise resolve:img load complete, reject:onerror
   */
  set(blob) {
    this.blob = blob;
    this.img.src = window.URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      this.img.addEventListener('load', resolve, false);
      this.img.addEventListener('error', reject, false);
    });
  }

  /**
   *
   */
  destroy() {
    // http://hakuhin.jp/js/blob_url_scheme.html#BLOB_URL_SCHEME_01
    window.URL.revokeObjectURL(this.img.src);
    this.img.src = '';
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

class FormGroup extends React.Component {
  render() {
    var urlClasses = ['form-group'];

    if(this.props.error) {
      urlClasses.push('has-error');
    }
    if(this.props.success) {
      urlClasses.push('has-success');
    }

    return (
      <div className={urlClasses.join(' ')}>
        {this.props.children}
        {this.props.error
          ? (<p className="help-block">
              <span className="text-danger">{this.props.error}</span>
            </p>)
          : ''}
      </div>
    );
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
    if(!event.target.checkValidity()) {
      this.setState({ error: '画像のURLを入力して下さい' });
      return;
    }

    var url = event.target.value;
    this.props.img.fetch(url)
      .then((res) => {
        var blob = new Blob([res.response], { type: res.getResponseHeader('Content-Type') });
        this.props.img.set(blob)
          .then(() => {
            this.setState({completed: true, error: ''});
          })
          .catch((e) => {
            this.setState({completed: false, error: '画像の読込に失敗しました'});
          });

        this.setState({error: ''});
      })
      .catch((err) => {
        this.setState({error: err.message});
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
      this.props.img.set(blob)
        .then(() => {
          this.setState({completed: true, error: ''});
        })
        .catch((e) => {
          this.setState({completed: false, error: '画像の読込に失敗しました'});
        });

    };
    r.readAsArrayBuffer(file);
  }

  handleUp() {
    // 0始まりに直す
    this.props.onMove(this.props.index - 1, -1);
  }

  handleDown() {
    // 0始まりに直す
    this.props.onMove(this.props.index - 1, 1);
  }

  handleClear() {
    this.refs.url.value = '';
    this.handleUrlChange({ target: this.refs.url });
  }

  /**
   * @return ReactElements
   */
  render() {
    return (
      <li>
        <div className="row">
          <div className="col-xs-11 col-sm-11 col-md-11">
            <ul className="nav nav-tabs nav-justified" role="tablist">
              <li role="presentation" className="active">
                <a href={"#via-url-" + this.props.index} tabIndex="-1" aria-controls="via-url" role="tab" data-toggle="tab">URL</a>
              </li>
              <li role="presentation">
                <a href={"#via-file-" + this.props.index} tabIndex="-1" aria-controls="via-file" role="tab" data-toggle="tab">File</a>
              </li>
            </ul>

            <div className="tab-content">
              <div role="tabpanel" className="tab-pane active" id={"via-url-" + this.props.index}>
                <FormGroup error={this.state.error} success={this.state.completed}>
                  <div className="input-group">
                    <input type="url" ref="url" className="form-control" placeholder="http://example.com..." onChange={this.handleUrlChange.bind(this)} required />
                    <div className="input-group-addon" onClick={this.handleClear.bind(this)}>Clear</div>
                  </div>
                </FormGroup>
              </div>
              <div role="tabpanel" className="tab-pane" id={"via-file-" + this.props.index}>
                <FormGroup error={this.state.error} success={this.state.completed}>
                  <input type="file" onChange={this.handleFileChange.bind(this)} required />
                </FormGroup>
              </div>
            </div>
          </div>
        </div>
        <div className="resource-toolbar">
          <button type="button" tabIndex="-1" className="close" aria-label="Close" onClick={this.handleClose.bind(this)}>
            <span aria-hidden="true">&times;</span>
          </button>
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

  draw(padding, bgColor) {
    padding = padding || 0;

    var ctx = ReactDOM.findDOMNode(this.refs.imageList).getContext('2d');
    var offset = 0;
    var isFirst = true;
    var height = this.props.images.reduce(function(memo, imgEntity, i) {
      if(!imgEntity.ready()) return memo;

      var mag = Guide.MAX_WIDTH / imgEntity.img.width;
      var pad = padding;
      if(isFirst) {
        pad = 0;
        isFirst = false;
      }
      return memo + (imgEntity.img.height * mag) + pad;
    }, 0);

    this.setState({ width: Guide.MAX_WIDTH, height: height });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          var ctx = ReactDOM.findDOMNode(this.refs.imageList).getContext('2d');

          ctx.clearRect(0, 0, Guide.MAX_WIDTH, height);
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, Guide.MAX_WIDTH, height);
          this.props.images.forEach(function(imgEntity, i) {
            if(!imgEntity.ready()) return;

            var mag = Guide.MAX_WIDTH / imgEntity.img.width;

            ctx.drawImage(imgEntity.img, 0, offset, Guide.MAX_WIDTH, imgEntity.img.height * mag);
            offset += (imgEntity.img.height * mag) + padding;
          });

          if(height - padding > Guide.MAX_HEIGHT) {
            this.props.onError(new Error('画像が1200pxより大きいです。赤線を確認して下さい'));
          } else {
            this.props.onError(null);
          }

          resolve();
        } catch(e) {
          reject(e);
        }
      }, 0);
    });
  }

  /**
   * @return ReactElements
   */
  render() {
    return (
      <canvas ref="imageList" width={this.state.width} height={this.state.height}></canvas>
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
  }

  componentDidUpdate() {
    this.draw();
  }

  draw() {
    var el = ReactDOM.findDOMNode(this.refs.canvas);
    var ctx = this.refs.canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(Guide.MAX_WIDTH, 0);
    ctx.lineTo(Guide.MAX_WIDTH, el.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillText(Guide.MAX_WIDTH + 'px', Guide.MAX_WIDTH + 5, 20);

    ctx.beginPath();
    ctx.moveTo(0, Guide.MAX_HEIGHT);
    ctx.lineTo(el.width, Guide.MAX_HEIGHT);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillText(Guide.MAX_HEIGHT + 'px', 10, Guide.MAX_HEIGHT + 15);
  }

  /**
   * @return ReactElements
   */
  render() {
    return (
      <canvas className="canvas-layer guide" ref="canvas" key={this.props.id} width={this.state.width} height={this.state.height}></canvas>
    );
  }
}
Guide.MAX_WIDTH = 640;
Guide.MAX_HEIGHT = 1200;

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: []
    };
  }

  reset() {
    this.setState({ errors: [] });
  }

  append(message) {
    var idx = this.state.errors.indexOf(message);
    var clone = this.state.errors.slice();

    if(idx >= 0) {
      var poped = clone.splice(idx, 1);
      clone.unshift(poped[0]);
    } else {
      clone.push(message)
    }

    this.setState({ errors: clone });
  }

  render() {
    return (
      <div className="notifications">
        {this.state.errors.map((msg, i) => {
          return (<div key={i} className="alert alert-warning">
            {msg}
          </div>);
        })}
      </div>
    );
  }
}

/**
 * @class App
 */
class App extends React.Component {
  /**
   * @param object props
   */
  constructor(props) {
    super(props);

    var defaultInputs = 3;
    var images = [];

    while(defaultInputs--) {
      images.push(this.getEntity());
    }
    this.state = {
      images,
      padding: 0,
      bgColor: '#ffffff',
    };
  }

  getEntity() {
    var entity = new ImgEntity();
    entity.img.addEventListener('load', this.handleRefresh.bind(this), false);
    entity.img.addEventListener('error', this.handleRefresh.bind(this), false);

    return entity;
  }

  /**
   * @return ReactElements
   */
  handleAddInput() {
    var images = this.state.images.concat([this.getEntity()]);
    this.setState({images: images});
  }

  /**
   * @param ImageItem
   * @return ReactElements
   */
  handleClose(img) {
    var idx = this.state.images.indexOf(img);
    var copy = this.state.images.slice();
    var removed = copy.splice(idx, 1);

    removed[0].destroy();
    this.setState({images: copy});
  }

  // direction: 1 or -1
  handleMove(index, direction) {
    if(index + direction < 0 || index + direction >= this.state.images.length) {
      return;
    }

    var clone = this.state.images.slice();
    var tmp = clone[index];
    clone[index] = clone[index + direction];
    clone[index + direction] = tmp;

    this.setState({ images: clone });
    this.handleRefresh();
  }

  handleRefresh() {
    this.refs.preview.draw(this.state.padding, this.state.bgColor);
  }

  handleExport() {
    // 強制的に再描画をかけて再DL
    this.refs.preview.draw(this.state.padding, this.state.bgColor)
      .then(() => {
        var canvas = ReactDOM.findDOMNode(this.refs.preview);
        var type = 'image/jpeg';
        var url = canvas.toDataURL(type);

        // 新窓でかつファイル名を指定するには擬似的にAタグをクリックするしか無い・・・？
        Downloader.download(url, 'image.jpg');
      });
  }

  handlePreviewError(e) {
    if(e === null) {
      this.refs.notifications.reset();
    } else {
      this.refs.notifications.append(e.message);
    }
  }

  handlePaddingChange(e) {
    this.setState({ padding: +e.target.value });
    setTimeout(this.handleRefresh.bind(this));
  }

  handleBackgroundChange(e) {
    if(Color.valid(e.target.value)) {
      this.setState({ bgColor: e.target.value });
      setTimeout(this.handleRefresh.bind(this));
    }
  }

  /**
   * @return ReactElements
   */
  render() {
    // FIXME: split component
    return (
      <div className="row">
        <div className="col-md-3">
          <ul id="resources">{this.state.images.map((img, i) => {
            return (<ImageItem key={img.uid} img={img} index={i+1} onClose={this.handleClose.bind(this)} onMove={this.handleMove.bind(this)} />);
          })}</ul>

          <div className="btn-toolbar" role="toolbar" aria-label="toolbar">
            <div className="btn-group" role="group" aria-label="操作">
              <button id="more" className="btn btn-primary" onClick={this.handleAddInput.bind(this)}>+</button>
            </div>
            <div className="btn-group" role="group" aria-label="ダウンロード">
              <button className="btn btn-default" onClick={this.handleExport.bind(this)}>
                ダウンロードする
                <i className="glyphicon glyphicon-download-alt"></i>
              </button>
            </div>
          </div>

          <h3>設定</h3>
          <div className="form-horizontal">
            <FormGroup>
              <label htmlFor="" className="control-label col-md-4">画像間の余白</label>
              <div className="col-md-8" role="group" aria-label="設定">
                <div className="input-group">
                  <input type="number" step="1" min="0" defaultValue="0" ref="configPadding" className="form-control" onChange={this.handlePaddingChange.bind(this)} />
                  <div className="input-group-addon">px</div>
                </div>
              </div>
            </FormGroup>
            <FormGroup>
              <label htmlFor="" className="control-label col-md-4">背景色</label>
              <div className="col-md-8" role="group" aria-label="設定">
                <input type="text" defaultValue="#ffffff" ref="configBackground" className="form-control" onChange={this.handleBackgroundChange.bind(this)} />
              </div>
            </FormGroup>
          </div>

        </div>

        <div className="col-md-9">
          <Notifications ref="notifications" />
          <div id="preview-wrap">
            <h2>プレビュー</h2>
            <Preview images={this.state.images} ref="preview" onError={this.handlePreviewError.bind(this)} />
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
