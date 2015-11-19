  </div><!-- .container-fluid -->

  <script src="//cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react.min.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-dom.min.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>
  <script type="text/babel" src="/js/app.jsx"></script>
  <script>
// var MAX_WIDTH = 640;
// var MAX_HEIGHT = 1200;

// var w = $('#preview-wrap').width(),
//     h = 2000,
//     padding = 0,
//     guide = $('#guide')
//       .attr({width: w, height: h})
//       .get(0).getContext('2d'),
//     preview = $('#preview')
//       .attr({width: MAX_WIDTH, height: h})
//       .get(0).getContext('2d');

// var images = [];

// function draw() {
//   var offset = 0;
//   var height = images.reduce(function(memo, img) {
//     var mag = MAX_WIDTH / img.width;
//     return memo + (img.height * mag) + padding;
//   }, 0);

//   preview = $('#preview')
//     .attr({height: height})
//     .get(0).getContext('2d');

//   preview.clearRect(0, 0, w, h);
//   images.forEach(function(img, i) {
//     var mag = MAX_WIDTH / img.width;

//     preview.drawImage(img, 0, offset, MAX_WIDTH, img.height * mag);
//     offset += (img.height * mag) + padding;
//   });

//   if(height - padding > MAX_HEIGHT) {
//     alert('画像が1200pxより大きいです。赤線を確認して下さい');
//   }
// }

// $(document).on('change', '#each-padding', function() {
//   padding = +$(this).val();
//   draw();
// });

// $(document).on('change', '.resource-url', function() {
//   var idx = $(this).closest('.form-group').index(),
//       img = new Image();

//   img.onload = draw;
//   img.src = $(this).val();
//   images[idx] = img;
// });

// // $(document).on('click', '#download', function() {
// //   var url = document.querySelector('#preview').toDataURL('image/jpeg');
// //   window.open(url);
// // });

// guide.beginPath();
// guide.moveTo(MAX_WIDTH, 0);
// guide.lineTo(MAX_WIDTH, h);
// guide.strokeStyle = 'red';
// guide.lineWidth = 1;
// guide.stroke();
// guide.fillText(MAX_WIDTH + 'px', MAX_WIDTH + 5, 20);

// guide.beginPath();
// guide.moveTo(0, MAX_HEIGHT);
// guide.lineTo(w, MAX_HEIGHT);
// guide.strokeStyle = 'red';
// guide.lineWidth = 1;
// guide.stroke();
// guide.fillText(MAX_HEIGHT + 'px', 10, MAX_HEIGHT + 15);
  </script>
</body>
</html>
