define(["support", "unsafeWindow"], function(support, uw){
  function each(obj, callback) {
    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        if (callback(i, obj[i]) === true) break;
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (callback(key, obj[key]) === true) break;
        }
      }
    }
  }
  
  function isArray(arr) {
    return Object.prototype.toString.call(arr) === "[object Array]";
  }
  
  function asyncCall(scope, callback) {
    return setTimeout(bind.apply(null, [scope, callback].concat(Array.prototype.slice.call(arguments, 2))), 0);
  }
  
  function bind(scope, func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
      return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
    };
  }
  function trimLeft(obj){
    return obj.replace(/^\s+/, "");
  }
  function trimRight(obj){
    return obj.replace(/\s+$/, "");
  }
  function map(obj, callback, thisArg) {
    for (var i = 0, n = obj.length, a = []; i < n; i++) {
      if (i in obj) a[i] = callback.call(thisArg, obj[i]);
    }
    return a;
  }
  
  function defineLockedProperty(obj, key, setter, getter) {
    if (typeof obj !== "object") obj = {};
    if (ie || typeof Object.defineProperty === "function") {
      Object.defineProperty(obj, key, {
        get: getter,
        set: setter
      });
      return obj;
    } else {
      obj.__defineGetter__(key, getter);
      obj.__defineSetter__(key, setter);
      return obj;
    }
  }
  
  function addEventListener(elm, event, callback, useCapture) {
    if (elm.addEventListener) {
      elm.addEventListener(event, callback, useCapture || false);
    } else if (elm.attachEvent) {
      elm.attachEvent("on" + event, callback);
    }
  }
  
  function removeEventListener(elm, event, callback, useCapture) {
    if (elm.removeEventListener) {
      elm.removeEventListener(event, callback, useCapture || false);
    } else if (elm.detachEvent) {
      elm.detachEvent("on" + event, callback);
    }
  }
  
  var ie = (function(){
    for (var v = 3, el = document.createElement('b'), all = el.all || []; el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
    return v > 4 ? v : !!document.documentMode;
  }());
  
  var now = Date.now || function () {
    return +new Date;
  };
  
  /* Cookies */
  function setCookie(name, value, domain, path, expires) {
    domain = domain ? ";domain=" + encodeURIComponent(domain) : "";
    path = path ? ";path=" + encodeURIComponent(path) : "";
    expires = 0 > expires ? "" : 0 == expires ? ";expires=" + (new Date(1970, 1, 1)).toUTCString() : ";expires=" + (new Date(now() + 1E3 * expires)).toUTCString();
    
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + domain + path + expires;
  }
  
  function getCookie(key) {
    return getCookies()[key];
  }
  
  function getCookies() {
    var c = document.cookie, v = 0, cookies = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
      c = RegExp.$1;
      v = 1;
    }
    if (v === 0) {
      map(c.split(/[,;]/), function(cookie) {
        var parts = cookie.split(/=/, 2),
            name = decodeURIComponent(trimLeft(parts[0])),
            value = parts.length > 1 ? decodeURIComponent(trimRight(parts[1])) : null;
        cookies[name] = value;
      });
    } else {
      map(c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g), function($0, $1) {
        var name = $0, value = $1.charAt(0) === '"' ? $1.substr(1, -1).replace(/\\(.)/g, "$1") : $1;
        cookies[name] = value;
      });
    }
    return cookies;
  }
  
  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
  
  function inject(func) {
    var script = document.createElement("script"),
        p = (document.body || document.head || document.documentElement);
    if (!p) {
      throw "Could not inject!!!";
    }
    script.setAttribute("type", "text/javascript");
    script.appendChild(document.createTextNode("(" + func + ")(" + buildArgumentList.apply(null, [false].concat(Array.prototype.slice.call(arguments, 1))) + ");"));
    p.appendChild(script);
    p.removeChild(script);
  }
  
  function buildArgumentList(wrap) {
    var list = [];
    var args = Array.prototype.slice.call(arguments, 1);
    
    for (var i = 0, len = args.length; i < len; i++) {
      if (typeof args[i] === "string") {
        list.push("\"" + args[i].replace(/\\/, "\\\\").replace(/"/g, "\\\"") + "\"");
      } else if (typeof args[i] === "object") {
        list.push(JSON.stringify(args[i]));
      } else {
        list.push(args[i]);
      }
    }
    if (wrap) {
      return "(" + list.join(",") + ")";
    } else {
      return list.join(",");
    }
  }
  
  function isJSONString(json) {
    try {
      JSON.parse(json);
    } catch (e) {
      return false;
    }
    return true;
  }
  
  function xhr(details) {
    var xmlhttp;
    if (typeof XMLHttpRequest !== "undefined") {
      xmlhttp = new XMLHttpRequest();
    } else if (typeof opera !== "undefined" && typeof opera.XMLHttpRequest !== "undefined") {
      xmlhttp = new opera.XMLHttpRequest();
    } else {
      if (details["onerror"]) {
        details["onerror"]();
      }
      
      return;
    }
    xmlhttp.onreadystatechange = function(){
      var responseState = {
        responseXML:(xmlhttp.readyState == 4 ? xmlhttp.responseXML : ''),
        responseText:(xmlhttp.readyState == 4 ? xmlhttp.responseText : ''),
        readyState:xmlhttp.readyState,
        responseHeaders:(xmlhttp.readyState == 4 ? xmlhttp.getAllResponseHeaders() : ''),
        status:(xmlhttp.readyState == 4 ? xmlhttp.status : 0),
        statusText:(xmlhttp.readyState == 4 ? xmlhttp.statusText : ''),
        finalUrl:(xmlhttp.readyState == 4 ? xmlhttp.finalUrl : '')
      };
      if (details["onreadystatechange"]) {
        details["onreadystatechange"](responseState);
      }
      if (xmlhttp.readyState == 4) {
        if (details["onload"] && xmlhttp.status >= 200 && xmlhttp.status < 300) {
          details["onload"](responseState);
        }
        if (details["onerror"] && (xmlhttp.status < 200 || xmlhttp.status >= 300)) {
          details["onerror"](responseState);
        }
      }
    };
    try {
      xmlhttp.open(details.method, details.url);
    } catch(e) {
      if(details["onerror"]) {
        details["onerror"]({responseXML:'',responseText:'',readyState:4,responseHeaders:'',status:403,statusText:'Forbidden'});
      }
      return;
    }
    if (details.headers) {
      for (var prop in details.headers) {
        xmlhttp.setRequestHeader(prop, details.headers[prop]);
      }
    }
    xmlhttp.send((typeof(details.data) != 'undefined') ? details.data : null);
  }
  
  // Used for the message module (should probably move to another place)
  // It replaces a property in the obj to a predefined function, where the arguments will be callbackId, target, referer
  function bindFunctionCallbacks(obj, func, target, referer) {
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "obj") {
          bindFunctionCallbacks(obj[key]);
        } else if (typeof obj[key] === "string") {
          if (obj[key].indexOf("@/(message.callback)/") === 0) {
            var callbackId = obj[key].split("@/(message.callback)/")[1];
            obj[key] = bind(null, func, callbackId, target, referer);
          }
        }
      }
    }
  }
  
  function extend(obj, defaults, deep) {
    if (typeof obj !== "object") throw new TypeError("Unsupported type for obj.");
    if (typeof defaults !== "object") throw new TypeError("Unsupported type for defaults.");
    for (var key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && typeof defaults[key] === "object" && deep) {
          extend(obj[key], defaults[key], deep);
        } else if (!obj.hasOwnProperty(key)) {
          obj[key] = defaults[key];
        }
      }
    }
    return obj;
  }
  
  function inArray(key, arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i] === key) {
        return true;
      }
    }
    return false;
  }
  
  function listClasses(el) {
    if (!el || !el.className) return [];
    return el.className.split(" ");
  }
  
  function addClass(el, className) {
    var classes = listClasses(el);
    var addList = className.split(" ");
    
    for (var i = 0, len = addList.length; i < len; i++) {
      if (!inArray(addList[i], classes)) {
        el.className += " " + addList[i];
      }
    }
    return el.className;
  }
  
  function removeClass(el, className) {
    var classes = listClasses(el);
    var removeList = className.split(" ");
    
    var buffer = [];
    for (var i = 0, len = classes.length; i < len; i++) {
      if (!inArray(classes[i], removeList)) {
        buffer.push(classes[i]);
      }
    }
    return el.className = buffer.join(" ");
  }
  
  function hasClass(el, className) {
    return inArray(className, listClasses(el));
  }
  
  function throttle(func, delay, options){
    function timeout() {
      previous = options.leading === false ? 0 : new Date;
      timer = null;
      result = func.apply(context, args);
    }
    var context, args, result, timer = null, previous = 0;
    options = options || {};
    return function(){
      var now = new Date, dt;
      
      context = this;
      args = arguments;
      
      if (!previous && options.leading === false) previous = now;
      dt = delay - (now - previous);
      
      if (dt <= 0) {
        clearTimeout(timer);
        timer = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timer && options.trailing !== false) {
        timer = setTimeout(timeout, dt);
      }
      return result;
    };
  }
  
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  function removeDuplicates(arr) {
    var uniqueArr = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      if (!inArray(uniqueArr, arr[i])) {
        uniqueArr.push(arr[i]);
      }
    }
    
    return uniqueArr;
  }
  
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }
  
  function toBlob(bytes, contentType) {
    contentType = contentType || "text/plain";
    var sliceSize = 512;
    
    var bytesLength = bytes.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    
    var byteArrays = new Array(slicesCount);
    
    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);
      
      var sliceBytes = new Array(end - begin);
      for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
        sliceBytes[i] = bytes[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(sliceBytes);
    }
    
    return new Blob(byteArrays, { type: contentType });
  }
  
  function createObjectURL(blob) {
    if (support.createObjectURL) {
      if (support.webkitURL) {
        return uw.webkitURL.createObjectURL(blob);
      } else {
        return uw.URL.createObjectURL(blob);
      }
    } else {
      throw "createObjectURL is not supported by the browser!";
    }
  }
  
  function revokeObjectURL(url) {
    if (support.revokeObjectURL) {
      if (support.webkitURL) {
        return uw.webkitURL.revokeObjectURL(url);
      } else {
        return uw.URL.revokeObjectURL(url);
      }
    } else {
      throw "revokeObjectURL is not supported by the browser!";
    }
  }
  
  // Returns a random number between min and max
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  // Returns a random integer between min (included) and max (excluded)
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  // Returns a random string of characters of chars with the length of length
  function generateToken(chars, length) {
    if (typeof chars !== "string") chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    if (typeof length !== "number") length = 64;
    
    var charsLength = chars.length;
    
    var token = "";
    for (var i = 0; i < length; i++) {
      token += chars[getRandomInt(0, charsLength)];
    }
    
    return token;
  }
  
  function escapeECMAVariable(key, defaultKey) {
    key = key.replace(/[^0-9a-zA-Z_\$]/g, "");
    while (/$[0-9]/g.test(key) && key.length > 0) {
      if (key === "") return defaultKey;
      key = key.substring(1);
    }
    return key;
  }
  
  function indexOfArray(value, arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i] === value) {
        return i;
      }
    }
    return -1;
  }
  
  function getKeys(obj) {
    var keys = [];
    each(obj, function(key){
      keys.push(key);
    });
    return keys;
  }
  
  return {
    hasClass: hasClass,
    removeClass: removeClass,
    addClass: addClass,
    each: each,
    isArray: isArray,
    inArray: inArray,
    bind: bind,
    asyncCall: asyncCall,
    defineLockedProperty: defineLockedProperty,
    ie: ie,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    now: now,
    trimLeft: trimLeft,
    trimRight: trimRight,
    map: map,
    setCookie: setCookie,
    getCookie: getCookie,
    getCookies: getCookies,
    endsWith: endsWith,
    inject: inject,
    isJSONString: isJSONString,
    xhr: xhr,
    buildArgumentList: buildArgumentList,
    bindFunctionCallbacks: bindFunctionCallbacks,
    extend: extend,
    throttle: throttle,
    clone: clone,
    removeDuplicates: removeDuplicates,
    escapeRegExp: escapeRegExp,
    toBlob: toBlob,
    createObjectURL: createObjectURL,
    revokeObjectURL: revokeObjectURL,
    getRandomArbitrary: getRandomArbitrary,
    getRandomInt: getRandomInt,
    generateToken: generateToken,
    escapeECMAVariable: escapeECMAVariable,
    indexOfArray: indexOfArray,
    getKeys: getKeys
  };
});