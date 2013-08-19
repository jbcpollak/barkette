var FS, NO_TRANSFORM, Rewriter, captureResponse, outputTag, randomCats, _ref;

FS = require('fs');

captureResponse = require('./../capture');

_ref = require('./../rewrite'), Rewriter = _ref.Rewriter, NO_TRANSFORM = _ref.NO_TRANSFORM, outputTag = _ref.outputTag;

module.exports = randomCats = function(path) {
  /*
  RewriteHTML middleware.
  
  Rewrites response HTML's Urls, so they point a new Urls given by `rewriteUrl`
  argument.
  */

  var getKittyURL, kitties, kittiesRaw, kitty, transform, _i, _len;
  kittiesRaw = FS.readFileSync(path, 'utf8').split("\n");
  kitties = [];
  for (_i = 0, _len = kittiesRaw.length; _i < _len; _i++) {
    kitty = kittiesRaw[_i];
    kitty = kitty.replace(/(#.*)/, "");
    kitty = kitty.replace(/\s+/g, "");
    if (kitty) {
      kitties.push(kitty);
    }
  }
  getKittyURL = function() {
    var index;
    index = Math.floor(Math.random() * kitties.length);
    return kitties[index];
  };
  transform = function(el) {
    /*
    Inserts Cats
    
    Looks in:
        - img (src)
    */

    var random;
    if (el.name === 'img') {
      var proxyRe = RegExp(".*assets/css/img.*");
    
      if (el.attribs.class === 'toplogo') {
        console.log("swapping logo");
        el.attribs.src = '/barkette.jpg';
        return outputTag(el);
      } else if (proxyRe.test(el.attribs.src)) {
        console.log("skipping app link");
        return NO_TRANSFORM;
      }

      if ((el.attribs == null) || !el.attribs.src || (Math.random() > 10)) {
        return NO_TRANSFORM;
      }
      random = Math.random().toString().slice(2, 7);
      el.attribs.src = getKittyURL();
      return outputTag(el);
    } else {
      return NO_TRANSFORM;
    }
  };
  return function(req, res, next) {
    var buffer, newRes, transformResponse, _ref1;
    _ref1 = captureResponse(res, function(statusCode, reason, headers) {
      return transformResponse(statusCode, reason, headers);
    }), buffer = _ref1[0], newRes = _ref1[1];
    buffer.pause();
    transformResponse = function(statusCode, reason, headers) {
      var ajax, html, jsonp, okay, rw;
      html = /html/.test(headers['content-type']);
      ajax = headers['x-requested-with'];
      jsonp = /callback=/i.test(req.url);
      okay = statusCode === 200;
      if (html && !ajax && !jsonp && okay) {
        rw = new Rewriter(transform);
        buffer.pipe(rw).pipe(newRes);
      } else {
        buffer.pipe(newRes);
      }
      return buffer.resume();
    };
    return next();
  };
};