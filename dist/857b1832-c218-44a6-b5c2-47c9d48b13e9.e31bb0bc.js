// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
// Set your secret key here
var convertApiSecret = "secret_ncYHQpF4DAZws63p";
// DOM element selectors
var uploadArea = document.querySelector("#uploadArea");
var workArea = document.querySelector("#workArea");
var loadingText = document.querySelector("#loadingText");
var fileInput = document.querySelector("#fileInput");
var downloadPanel = document.querySelector("#downloadPanel");
var toolTipData = document.querySelector(".upload-area__tooltip-data");
var resultDownloadLink = document.querySelector("#resultDownload");
var resultFileName = document.querySelector("#resultFileName");
var destinationFormatBtn = document.querySelectorAll(".select-converter .grid a");
var convertAgainBtn = document.querySelector(".convert-again");

// Accepted document types
var documentTypes = ["pdf", "doc", "docx", "odt", "xls", "xlsx", "ppt", "pptx", "key", "numbers", "slides", "odt", "txt", "rtf", "jpeg", "png"];

// Append doc types to array for the tooltip data
toolTipData.innerHTML = [].concat(documentTypes).join(", .");

// When (work-area) has (dragover) event
workArea.addEventListener("dragover", function (event) {
  event.preventDefault();
  workArea.classList.add("work-area--over");
});

// When (work-area) has (dragleave) event
workArea.addEventListener("dragleave", function (event) {
  workArea.classList.remove("work-area--over");
});

// When (work-area) has (drop) event
workArea.addEventListener("drop", function (event) {
  event.preventDefault();
  workArea.classList.remove("work-area--over");
  uploadFile(event.dataTransfer.files[0]);
});

// When (work-area) has (click) event
workArea.addEventListener("click", function (event) {
  // if file not uploaded
  if (!workArea.classList.contains("work-area--Uploaded")) fileInput.click();
});

// When (fileInput) has (change) event
fileInput.addEventListener("change", function (event) {
  var file = event.target.files[0];
  uploadFile(file);
});

// reload on Convert again click
convertAgainBtn.addEventListener("click", function (event) {
  // prevent file download
  event.preventDefault();
  // reload the page
  location.reload();
});

// add event listeners for destination format buttons
for (var i = 0; i < destinationFormatBtn.length; i++) {
  destinationFormatBtn[i].addEventListener("click", function (event) {
    // call uploadFile function again with correct destination format
    uploadFile(fileInput.files[0], event.target.innerHTML);
    // hide the destination select buttons
    workArea.classList.remove("work-area--Select-destination");
  });
}

// File upload function
function uploadFile(file) {
  var destination = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "pdf";
  // get file extension
  var extension = file.name.split(".").pop();
  // get file size
  var fileSize = file.size;
  // If uploaded document is PDF and destination is not set
  if (extension === "pdf" && !workArea.classList.contains("work-area--Select-destination")) {
    // show destination extension buttons
    workArea.className += " work-area--Select-destination work-area--Uploaded";
  } else {
    // Check if file is valid
    if (fileValidate(extension, fileSize)) {
      // Add class (work-area--Uploaded) on (work-area)
      workArea.classList.add("work-area--Uploaded");
      // Show loading text and cursor
      loadingText.style.display = "block";
      // Attempt to convert a file
      convertFile(file, extension, destination);
    } else {
      // in case invalid file was uploaded - reset form
      location.reload();
    }
  }
}
function convertFile(file, extension, destination) {
  // Initialize ConvertAPI with your secret key
  var convertApi = ConvertApi.auth({
    secret: convertApiSecret
  });
  // Create conversion parameters object
  var params = convertApi.createParams();
  // set uploaded file as one of the parameters
  params.add("file", file);
  // execute the conversion
  convertApi.convert(extension, destination, params).then(function (x) {
    var result = x.dto;
    // check if success
    if (result.Files) {
      // Hide loading-text (please-wait) element
      loadingText.style.display = "none";
      // Set result file download URL
      resultDownloadLink.setAttribute("href", result.Files[0].Url);
      // Set result file name
      resultFileName.innerHTML = result.Files[0].FileName;
      // Show download panel
      downloadPanel.style.display = "block";
      workArea.classList.add("show-result");
    } else {
      // handle error
      if (result.Code === 4010) loadingText.innerHTML = 'Please enter your ConvertAPI secret key in index.js file. You can find the API secret in your <a href="https://www.convertapi.com/a" target="_blank">account dashboard</a>.';else loadingText.textContent = "Ooops! ".concat(result.Message);
      loadingText.classList.add("error-message");
    }
  }, function (error) {
    // Throw a network-related error here
    throw error;
  });
}

// File validation function
function fileValidate(fileType, fileSize) {
  // File type validation
  var isDocument = documentTypes.filter(function (type) {
    return fileType.indexOf(type) !== -1;
  });
  // If uploaded file is a valid document
  if (isDocument.length !== 0) {
    // Check if file size is 2MB or less
    if (fileSize <= 2000000) {
      return true;
    } else {
      // Show the file size validation error
      return alert("Max file size is 2 MB");
    }
  } else {
    // Show the file type validation error
    return alert("Please make sure to upload a document. Supported formats are:\r\n.".concat([].concat(documentTypes).join(", ."), "."));
  }
}
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55052" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/857b1832-c218-44a6-b5c2-47c9d48b13e9.e31bb0bc.js.map