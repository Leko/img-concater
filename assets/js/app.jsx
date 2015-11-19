
function uid() {
  if(typeof uid._idx === 'undefined') {
    uid._idx = 1;
  }

  return uid._idx++;
}

class Img {
  constructor() {
    this.uid = uid();
    this.blob = null;
  }

  ready() {
    return (this.blob === null);
  }

  set(blob) {
    this.blob = blob;
  }

  fetch(url) {
    return new Promise((resolve, reject) => {
      superagent.get('/proxy')
        .query({url: url})
        .on('error', reject)
        .end((err, res) => {
          if(err !== null) {
            reject(err);
          }

          resolve(res.body);
        });
    });
  }
}

var ImageItem = React.createClass({
  getInitialState: function() {
    return {
      error: null,
    };
  },

  handleClose: function() {
    this.props.onClose(this.props.img);
  },

  handleUrlChange: function(event) {
    var url = event.target.value;
    this.props.img.fetch(url)
      .then((obj) => {
        console.log('OK:', obj);
      })
      .catch((obj) => {
        console.log('ERROR:', obj);
      });
  },

  handleFileChange: function(event) {
    var r = new FileReader();
    var file = event.target.files[0];

    r.onload = (e) => {
      this.props.img.set(e.target.result);
    };
    r.readAsBinaryString(file);
  },

  render: function() {
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
            <input type="text" className="form-control resource-url" placeholder="http://example.com..." onChange={this.handleUrlChange} />
          </div>
          <div role="tabpanel" className="tab-pane" id={"via-file-" + this.props.index}>
            <input type="file" className="resource-file" placeholder="http://example.com..." onChange={this.handleFileChange} />
          </div>
        </div>
        <hr/>
      </li>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      images: [new Img, new Img, new Img, ],
    };
  },

  handleClick: function() {
    var images = this.state.images.concat([new Img]);
    this.setState({images: images});
  },

  handleClose: function(img) {
    var idx = this.state.images.indexOf(img);
    var copy = this.state.images.slice();
    copy.splice(idx, 1);

    this.setState({images: copy});
  },

  render: function() {
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
                <label for="each-padding">画像と画像の余白</label>
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
              <button id="download" className="btn btn-default">
                ダウンロードする
                <i className="glyphicon glyphicon-download-alt"></i>
              </button>
            </div>
          </h2>
          <div id="preview-wrap">
            <canvas id="preview"></canvas>
            <canvas id="guide"></canvas>
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <App/>,
  document.getElementById('app')
);
