var COOKIE_DOMAIN_REGEX, rewriteHost, rewriteRequestHeaders, rewriteResponseHeaders,
  __slice = [].slice;

COOKIE_DOMAIN_REGEX = /domain\s*=\s*[.]?([^\s^;]*)/gi;

rewriteRequestHeaders = function(req, removeHost) {
  var HOST_HEADERS, URL_HEADERS, header, _i, _j, _len, _len1, _results;
  HOST_HEADERS = ['host'];
  URL_HEADERS = ['referer', 'origin'];
  for (_i = 0, _len = HOST_HEADERS.length; _i < _len; _i++) {
    header = HOST_HEADERS[_i];
    if (header in req.headers) {
      req.headers[header] = removeHost(req.headers[header]);
    }
  }
  _results = [];
  for (_j = 0, _len1 = URL_HEADERS.length; _j < _len1; _j++) {
    header = URL_HEADERS[_j];
    if (header in req.headers) {
      _results.push(req.headers[header] = removeHost(req.headers[header], {
        url: true
      }));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

rewriteResponseHeaders = function(res, addHost) {
  var URL_HEADERS, writeHead;
  URL_HEADERS = ['location'];
  writeHead = res.writeHead;
  return res.writeHead = function() {
    var access_control_allow_origin, cookie, cookies, header, headers, newCookies, reason, statusCode, _i, _j, _len;
    statusCode = arguments[0], reason = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), headers = arguments[_i++];
    if (headers == null) {
      headers = {};
    }
    reason = reason[0];
    for (_j = 0, _len = URL_HEADERS.length; _j < _len; _j++) {
      header = URL_HEADERS[_j];
      if (header in res.headers) {
        headers[header] = addHost(headers[header], {
          url: true
        });
      }
    }
    if ('access-control-allow-origin' in headers) {
      access_control_allow_origin = headers['access-control-allow-origin'].trim();
      if (access_control_allow_origin !== '*') {
        headers['access-control-allow-origin'] = addHost(access_control_allow_origin, {
          url: true
        });
      }
    }
    if ('set-cookie' in headers) {
      cookies = headers['set-cookie'];
      newCookies = (function() {
        var _k, _len1, _results;
        _results = [];
        for (_k = 0, _len1 = cookies.length; _k < _len1; _k++) {
          cookie = cookies[_k];
          cookie = cookie.replace(COOKIE_DOMAIN_REGEX, function(matched, domain) {
            return "domain=." + (addHost(domain, {
              prefix: false,
              port: false
            }));
          });
          _results.push(cookie.replace(/Secure/i, ""));
        }
        return _results;
      })();
      headers['set-cookie'] = newCookies;
    }
    if (reason) {
      return writeHead.call(res, statusCode, reason, headers);
    } else {
      return writeHead.call(res, statusCode, headers);
    }
  };
};

module.exports = rewriteHost = function(addHost, removeHost) {
  return function(req, res, next) {
    rewriteRequestHeaders(req, removeHost);
    rewriteResponseHeaders(res, addHost);
    return next();
  };
};