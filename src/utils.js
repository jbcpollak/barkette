var Url, getHostUtilities, __;

Url = require('url');

__ = require('underscore');

/*
Url Options
    url (default false)
        If the string is a URL, not a host string.


    port (default true, unless port 80)
        If the string should contain a port.
    
    prefix (default true)
        If we should pre-pended the protocol prefix.
*/


exports.getHostUtilities = getHostUtilities = function(domain, port, prefix) {

  //var HOST_REGEX = new RegExp("^" + prefix + "(s)?[.](.*)[.]" + domain + "(:\\d+)?", "i");

  var isHostSecure;
  if (port == null) {
    port = 80;
  }
  if (prefix == null) {
    prefix = "http";
  }

  var addHost = function(url, options) {
    console.log("in addHost");
    var addHostToHost, urlobj;
    if (options == null) {
      options = {};
    }
    options = __.defaults(options, {
      port: true,
      prefix: true,
      url: false
    });
    console.log("addHost for " + url);
    addHostToHost = function(host, secure) {
      console.log("addHostToHost for " + url + " host: " + host);
      var newHost = "";
      // if (options.prefix && secure) {
      //   newHost += "" + prefix + "s.";
      // } else if (options.prefix && !secure) {
      //   newHost += "" + prefix + ".";
      // }
      // newHost += "" + host + "." + domain;
      newHost = domain;
      if (options.port && port !== 80) {
        newHost += ":" + port;
      }
      return newHost;
    };
    if (options.url) {
      urlobj = Url.parse(url, false, true);
      if (urlobj.host) {
        urlobj.host = addHostToHost(urlobj.host, urlobj.protocol === 'https:');
        urlobj.protocol = "http:";
      }
      return Url.format(urlobj);
    } else {
      return addHostToHost(url);
    }
  };
  
  var removeHost = function(url, options) {
    var host, removeHostFromHost, secure, urlobj, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    options = __.defaults(options, {
      port: true,
      prefix: true,
      url: false
    });
    removeHostFromHost = function(host) {
      //var match = host.match(HOST_REGEX);
      //if (match) {
        return {
          //host: match[2],
          //match[1] === 's'
          host: 'snapette.com',
          secure: true
        };
      //} else {
      //   console.log("Error transforming host: " + host);
      //   return host;
      // }
    };
    if (options.url) {
      urlobj = Url.parse(url, false, true);
      _ref = removeHostFromHost(urlobj.host), host = _ref.host, secure = _ref.secure;
      urlobj.host = host;
      urlobj.protcol = secure ? "https:" : "http:";
      url = Url.format(urlobj);
      console.log(url);
      return url;
    } else {
      _ref1 = removeHostFromHost(url), host = _ref1.host, secure = _ref1.secure;
      return host;
    }
  };
  isHostSecure = function(host) {
    // var match;
    // match = host.match(HOST_REGEX);
    // if (match[1] === 's') {
      return true;
    // } else {
      // return false;
    // }
  };
  return [addHost, removeHost, isHostSecure];
};