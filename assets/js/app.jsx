
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
      urlClasses.push('has-feedback');
      urlClasses.push('has-error');
    }
    if(this.props.success) {
      urlClasses.push('has-feedback');
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
        {this.props.error
          ? <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>
          : ''}
        {this.props.success
          ? <span className="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>
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

  /**
   * @return ReactElements
   */
  render() {
    var urlClasses = ['form-group'];

    if(this.state.error) {
      urlClasses.push('has-feedback');
      urlClasses.push('has-error');
    }
    if(this.state.completed) {
      urlClasses.push('has-feedback');
      urlClasses.push('has-success');
    }

    return (
      <li>
        <div className="pull-right">
          <button type="button" tabIndex="-1" className="close" aria-label="Close" onClick={this.handleClose.bind(this)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <label>画像{this.props.index}</label>
        <ul className="nav nav-tabs nav-justified" role="tablist">
          <li role="presentation" className="active">
            <a href={"#via-url-" + this.props.index} tabIndex="-1" aria-controls="via-url" role="tab" data-toggle="tab">URL</a>
          </li>
          <li role="presentation">
            <a href={"#via-file-" + this.props.index} tabIndex="-1" aria-controls="via-file" role="tab" data-toggle="tab">アップロード</a>
          </li>
        </ul>

        <div className="tab-content">
          <div role="tabpanel" className="tab-pane active" id={"via-url-" + this.props.index}>
            <FormGroup error={this.state.error} success={this.state.completed}>
              <input type="url" className="form-control" placeholder="http://example.com..." onChange={this.handleUrlChange.bind(this)} required />
            </FormGroup>
          </div>
          <div role="tabpanel" className="tab-pane" id={"via-file-" + this.props.index}>
            <FormGroup error={this.state.error} success={this.state.completed}>
              <input type="file" onChange={this.handleFileChange.bind(this)} required />
            </FormGroup>
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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          var ctx = ReactDOM.findDOMNode(this.refs.imageList).getContext('2d');

          ctx.clearRect(0, 0, Guide.MAX_WIDTH, height);
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

    setTimeout(() => this.handleRefresh.bind(this));
  }

  handleRefresh() {
    this.refs.preview.draw();
  }

  handleExport() {
    // 強制的に再描画をかけて再DL
    this.refs.preview.draw()
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
            return (<ImageItem key={img.uid} img={img} index={i+1} onClose={this.handleClose.bind(this)} />);
          })}</ul>

          <div className="clearfix">
            <div className="pull-right">
              <button id="more" className="btn btn-primary" onClick={this.handleAddInput.bind(this)}>+</button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <Notifications ref="notifications" />
          <h2>
            プレビュー
            <div className="pull-right">
              <button className="btn btn-default" onClick={this.handleExport.bind(this)}>
                ダウンロードする
                <i className="glyphicon glyphicon-download-alt"></i>
              </button>
            </div>
          </h2>
          <div id="preview-wrap">
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
