/*********************************************************************
 *  #### JS Motion Visualiser ####
 *  Coded by Jason Mayes. www.jasonmayes.com
 *  Please keep this disclaimer with my code if you use it anywhere.
 *  Thanks. :-)
 *  Got feedback or questions, ask here:
 *  Github: https://github.com/jasonmayes/JS-Motion-Detection/
 *  Updates will be posted to this site.
 *********************************************************************/

// Cross browser support to fetch the correct getUserMedia object.
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

// Cross browser support for window.URL.
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

let MotionDetector = (function () {
  let alpha = 0.5;
  let greyScale = false;
  let frameShift = 10;

  let canvas = document.getElementById("canvas");
  let canvasFinal = document.getElementById("canvasFinal");
  let video = document.getElementById("camStream");
  let ctx = canvas.getContext("2d", { willReadFrequently: true });
  let ctxFinal = canvasFinal.getContext("2d", { willReadFrequently: true });
  let localStream = null;
  let imgData = null;
  let imgDataPrev = [];

  function success(stream) {
    localStream = stream;
    // Create a new object URL to use as the video's source.
    video.srcObject = stream;
    video.play();
  }

  function handleError(error) {
    console.error(error);
  }

  function snapshot() {
    if (localStream) {
      canvas.width = canvasFinal.width = video.offsetWidth;
      canvas.height = canvasFinal.height = video.offsetHeight;

      let { width: w, height: h } = canvas;

      ctx.drawImage(video, 0, 0);

      // Must capture image data in new instance as it is a live reference.
      // Use alternative live referneces to prevent messed up data.
      imgDataPrev.push(ctx.getImageData(0, 0, w, h));

      let preData = imgDataPrev[imgDataPrev.length - 1];
      if (imgDataPrev.length > frameShift) {
        preData = imgDataPrev.shift();
      }

      imgData = ctx.getImageData(0, 0, w, h);

      let length = imgData.data.length;
      let x = 0;
      while (x < length) {
        if (!greyScale) {
          // Alpha blending formula: out = (alpha * new) + (1 - alpha) * old.
          for (let j = 0; j < 3; j++) {
            imgData.data[x + j] =
              alpha * (255 - imgData.data[x + j]) +
              (1 - alpha) * preData.data[x + j];
          }
          imgData.data[x + 3] = 255;
        } else {
          // GreyScale.
          let av =
            (imgData.data[x] + imgData.data[x + 1] + imgData.data[x + 2]) / 3;
          let av2 =
            (preData.data[x] + preData.data[x + 1] + preData.data[x + 2]) / 3;
          let blended = alpha * (255 - av) + (1 - alpha) * av2;
          imgData.data[x] = blended;
          imgData.data[x + 1] = blended;
          imgData.data[x + 2] = blended;
          imgData.data[x + 3] = 255;
        }
        x += 4;
      }
      ctxFinal.putImageData(imgData, 0, 0);
    }
  }

  function init_() {
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true }, success, handleError);
    } else {
      console.error("Your browser does not support getUserMedia");
    }
    window.setInterval(snapshot, 1000 / 60);
  }

  return {
    init: init_,
  };
})();

MotionDetector.init();
