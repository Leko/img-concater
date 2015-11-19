{{template "header.tpl" .}}

<h1>画像くっつけるツール</h1>

<div class="col-md-3">
  <p>画像URLを入力して下さい。上から順に画像を結合します。<br>画像を右クリックしてダウンロードできます</p>

  <div id="resource-urls">
    <div class="form-group">
      <label for="">画像URL1</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL2</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL3</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL4</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL5</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL6</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL7</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL8</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL9</label>
      <input type="text" class="form-control resource-url">
    </div>
    <div class="form-group">
      <label for="">画像URL10</label>
      <input type="text" class="form-control resource-url">
    </div>
  </div>

  <div class="clearfix">
    <div class="pull-right">
      <button id="more" class="btn btn-primary">+</button>
    </div>
  </div>

  <h3>設定</h3>
  <form class="form-inline">
    <div class="form-group form-group-sm">
      <div class="col-sm-6">
        <label for="each-padding">画像と画像の余白</label>
      </div>
      <div class="input-group col-sm-6">
        <input type="number" class="form-control" id="each-padding" placeholder="0">
        <div class="input-group-addon">px</div>
      </div>
    </div>
  </form>

</div>

<div class="col-md-9">
  <h2>
    プレビュー
    <div class="pull-right">
      <button id="download" class="btn btn-default">
        ダウンロードする
        <i class="glyphicon glyphicon-download-alt"></i>
      </button>
    </div>
  </h2>
  <div id="preview-wrap">
    <canvas id="preview"></canvas>
    <canvas id="guide"></canvas>
  </div>
</div>

{{template "footer.tpl" .}}
