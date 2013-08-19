var util = require('util');

var NO_TRANSFORM, Rewriter, captureResponse, connect, outputTag, rewriteHTML, transformUrl, _ref;

connect = require('connect');

captureResponse = require('./../capture');

_ref = require('./../rewrite'), Rewriter = _ref.Rewriter, NO_TRANSFORM = _ref.NO_TRANSFORM, outputTag = _ref.outputTag;

transformUrl = function(el, addHost) {
  /*
  Calls `addHost` for any URL found in the
  HTML source, replacing it's value.
  
  Looks in:
      - a (href)
      - link (href)
      - img (src)
      - style (src)
      - script (src)
      - form (action)
  */

  if (el.name === 'script' || el.name === 'link') {
    return NO_TRANSFORM;
  }
  if (el.name === 'a') {
    console.log("anchor");
    if ((el.attribs == null) || !el.attribs.href) {
      return NO_TRANSFORM;
    }
    el.attribs.href = addHost(el.attribs.href, {
      url: true
    });
    return outputTag(el);
  } else if (el.name === 'img' || el.name === 'style' || el.name === 'iframe') {
    if ((el.attribs == null) || !el.attribs.src) {
      return NO_TRANSFORM;
    } else {
      el.attribs.src = addHost(el.attribs.src, {
        url: true
      });  
    }
    return outputTag(el);
  } else if (el.name === 'form') {
    console.log("form");
    if ((el.attribs == null) || !el.attribs.action) {
      return NO_TRANSFORM;
    }
    el.attribs.action = addHost(el.attribs.action, {
      url: true
    });
    return outputTag(el);
  } else {
    console.log("NO_TRANSFORM");
    return NO_TRANSFORM;
  }
};

module.exports = rewriteHTML = function(addHost) {
  /*
  RewriteHTML middleware.
  
  Rewrites response HTML's Urls, so they point a new Urls given by `addHost`
  argument.
  */

  console.log("in rewriteHTML");
  
  var transform = function(el) {
    return transformUrl(el, addHost);
  };

  return function(req, res, next) {
    var buffer, newRes, transformResponse, _ref1;
    _ref1 = captureResponse(res, function(statusCode, reason, headers) {
      return transformResponse(statusCode, reason, headers);
    }), buffer = _ref1[0], newRes = _ref1[1];
    buffer.pause();
    req.on("close", function() {
      if (buffer) {
        return buffer.destroy();
      }
    });
    buffer.on("end", function() {
      if (buffer) {
        return buffer = null;
      }
    });
    buffer.on("close", function() {
      if (buffer) {
        return buffer = null;
      }
    });
    transformResponse = function(statusCode, reason, headers) {
      var ajax, html, jsonp, okay, rw;
      html = /html/.test(headers['content-type']);
      ajax = headers['x-requested-with'];
      jsonp = /callback=/i.test(req.url);
      okay = statusCode === 200;
      if (html && !ajax && !jsonp && okay) {
        console.log("is html");
        rw = new Rewriter(transform);
        buffer.pipe(rw).pipe(newRes);
      } else {
        console.log("is newRes");
        buffer.pipe(newRes);
      }
      return buffer.resume();
    };
    return next();
  };
};