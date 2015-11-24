<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ .title }}</title>
  <link rel="stylesheet" href="/css/all.css">
  <style>
#preview-wrap {
  position: relative;
}
.canvas-layer {
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
}
#resources {
  padding: 0;
}
#resources li {
  list-style-type: none;
}
.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.loading i {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -40px;
  margin-left: -40px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  font-size: 80px;
}
.spin {
  -webkit-animation: spin 3s infinite linear;
  -moz-animation: spin 3s infinite linear;
  -o-animation: spin 3s infinite linear;
  animation: spin 3s infinite linear;
}
@-moz-keyframes spin {
  from {
    -moz-transform: rotate(0deg);
  }
  to {
    -moz-transform: rotate(360deg);
  }
}
@-webkit-keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tab-content {
  padding: 10px 0 0;
}
input[type="file"] {
  padding: 7px 0;
}
.nav-tabs > li > a {
  padding-top: 4px;
  padding-bottom: 4px;
}

  </style>
</head>
<body>
  <div class="container-fluid">
