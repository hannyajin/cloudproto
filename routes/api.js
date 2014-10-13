var express = require('express');
var router = express.Router();

var jthumb = require('jin-thumb');
var parseuri = require('parseuri');
var http = require('http');


var cache = {
};
var count = 0;
var limit = 100;

/* POST */
router.post('/upload', function(req, res) {
  var json = JSON.parse(req.body);

  console.log(json);
  res(200);
});
router.post('/get', function(req, res) {
  var json = JSON.parse(req.body);

  console.log(json);
  res(200);
});

/* GET users listing. */
router.get('/thumbnail/:url', function(req, res) {
  
  var url = req.params.url;

  console.log("URL: " + url);

  if (!url) {
    res.end(404);
    return;
  }

  if (!cache[url] || !cache[url].data) {
    // cache link
    cache[url] = {
      url: url,
      hits: 0,
      created: new Date().getTime()
    }

    jthumb.getSiteThumbnail(url, function(err, data) {
      if (err) {
        console.log(err);
        res.end(400);
        return;
      }

      // cache it
      var obj = cache[url];
      obj.data = data;
      obj.hits++;

      count++;

      res.end(data, 'binary');
    })
  } else { // link already cached.
    var obj = cache[url];
    obj.hits++;
    res.end(obj.data, 'binary');
  }
});


var descRegex = /<meta\s+.*["']description["']\s+content=["']([^"']*)["']\s+\/?>/im;
//var titleRegex = /<meta\s+[property=]?[]?\s+content=["'](*)["']/;
var titleRegex = /<title>\s*(.*)\s*<\s*\/title>/im;

router.get('/info/:url', function(req, res) {
  var url = req.params.url;

  console.log("URL: " + url);

  if (!url) {
    res.end(404);
    return;
  }

  if (!(cache[url] && cache[url].desc && cache[url].title)) {

    var pu = parseuri(url);

    var opts = {
      host: (~pu.host.indexOf('www.')) ? pu.host : 'www.' + pu.host,
      path: pu.relative || pu.patch
    };

    http.request(opts, function(hresp) {
      var str = '';

      hresp.on('data', function(chunk) {
        str += chunk;
      });

      hresp.on('end', function() {
        // check for description
        var descArr = descRegex.exec(str);
        var titleArr = titleRegex.exec(str);

        if (!cache[url]) {
          cache[url] = {
            url: url,
            hits: 0,
            created: new Date().getTime()
          }
        }

        if (descArr)
          cache[url].desc = descArr[1] || null;
        if (titleArr)
          cache[url].title = titleArr[1] || null;

        console.log(cache[url].desc);
        console.log(cache[url].title);

        // send the info
        res.send({
          desc: cache[url].desc || "No description found.",
          title: cache[url].title || "No Title found."
        });
        res.end();
      })
    }).end();

  } else {
    // send the info
    res.send({
      desc: cache[url].desc,
      title: cache[url].title
    });
    res.end();
  }
});


var liteCache = {};
var liteCacheNeedsUpdate = true;

router.get('/cache', function(req, res) {

  if (liteCacheNeedsUpdate) {
    liteCacheNeedsUpdate = false;
    liteCache = {};

    for (var key in cache) {
      if (cache.hasOwnProperty(key)) {
        var o = cache[key];
        liteCache[key] = {
          url: o.url,
          hits: o.hits,
          created: o.created
        }
      }
    }

    if (liteCache) {
      res.send(liteCache);
      res.end();
    } else {
      res.end(404);
    }
    return;
  }

});


module.exports = router;
