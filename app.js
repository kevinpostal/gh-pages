(function() {
  var main = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://demo.castlabs.com/tmp/text0.mp4', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      processFile(xhr.response);
    }
    xhr.send();
    var makeString = function(data) {
      var result = "";
      for (var i = 0; i < data.length; i++) {
        result += String.fromCharCode(data[i]);
      }
      return result;
    }
    var arraysEqual = function(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length != b.length) return false;
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    var checkType = function(fileTypeArray) {
      isMfhd = [109, 102, 104, 100]
      isTraf = [116, 114, 97, 102]
      isTfhd = [116, 102, 104, 100]
      isTrun = [116, 114, 117, 110]
      isUuid = [117, 117, 105, 100]
      if (arraysEqual(isMfhd, fileTypeArray)) {
        return true
      }
      if (arraysEqual(isTraf, fileTypeArray)) {
        return true
      }
      if (arraysEqual(isTfhd, fileTypeArray)) {
        return true
      }
      if (arraysEqual(isTrun, fileTypeArray)) {
        return true
      }
      if (arraysEqual(isUuid, fileTypeArray)) {
        return true
      }
      return false
    }
    var processImage = function(buffer, moofSize) {
      var basedata = new Uint8Array(buffer, moofSize + 8);
      var boxtype = new Uint8Array(buffer, moofSize + 4, 4)
      var size = new Uint8Array(buffer, moofSize, 4)
      var b64size = "%1%2".replace("%1", size[2].toString(16)).replace("%2", size[3].toString(16))
      var oParser = new DOMParser();
      var oDOM = oParser.parseFromString(makeString(basedata), "text/xml");
      var contentDiv = document.getElementById("content");
      console.log("Found box of type " + makeString(boxtype) + " and size " + parseInt(b64size, 16))
      console.log("Content of mdat box is:", makeString(basedata));
      images = oDOM.documentElement.getElementsByTagName('image')
      for (var i = 0; i < images.length; i++) {
        img = new Image();
        img.src = "data:image/png;base64, " + images[i].innerHTML
        contentDiv.appendChild(img);
      }
    }
    var processMoof = function(buffer) {
      var data = new Uint8Array(buffer, 8);
      for (var i = 0; i < data.length; i++) {
        if (i % 4 == 0) {
          var boxtype = data.subarray(i + 4, i + 8);
          var boxsize = data.subarray(i, i + 4); // last item is size (3)
          if (checkType(boxtype) === true) {
            console.log("Found box of type " + makeString(boxtype) + " and size " + boxsize[3])
          }
        }
      }
    }
    var processFile = function(buffer) {
      var dv = new DataView(buffer)
      var fileTypeArray = new Uint8Array(4)
      var moofSize = dv.getUint8(3)
      var isMoof = [109, 111, 111, 102] // moof filetype
      for (var i = 0; i < fileTypeArray.byteLength; i++) {
        fileTypeArray[i] = dv.getUint8(i + 4)
      }
      if (!arraysEqual(isMoof, fileTypeArray)) {
        return
      } else {
        console.log("Successfully loaded file http://demo.castlabs.com/tmp/text0.mp4")
      }
      console.log("Found box of type " + makeString(fileTypeArray) + " and size " + moofSize)
      processMoof(buffer, parseInt(moofSize))
      processImage(buffer, parseInt(moofSize))
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    main();
  }, false);
})();