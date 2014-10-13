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
  var json = JSON.stringify(req.body);
  console.log(json);

  // test data
  var data = {
    imgsrc: "http://i.imgur.com/aKndIcZ.jpg",
    title: "Some Title",
    desc: "Lorem Ipsum..."
  }

  // fetch the url data

  json = JSON.parse(json);

  if (json.url) {

      getImgInfo(json.url, function(err, info) {
        if (err) {
          console.log(err);
          res.status(500);
          res.end();
          return;
        }

        var msg = {
          title: info.title || "No Title Found.",
          desc: info.desc || "No Description Found.",
          imgsrc: "/api/thumbnail/" + parseuri(json.url).host
        }

        res.send(msg)
        res.end();
      });

  } else {
    res.status(400).end();
  }

});

router.get('/upload', function(req, res) {
});

function getImgData(url, callback) {
  console.log("Geting image data!");

  if (!cache[url] || !cache[url].data) {
    // cache link
    cache[url] = {
      url: url,
      hits: 0,
      created: new Date().getTime()
    }

    jthumb.getSiteThumbnail(url, function(err, data) {
      console.log("Using J-Thumb!");

      if (err) {
        console.log(err);
        callback(err);
        return;
      }

      // cache it
      var obj = cache[url];
      obj.data = data;
      obj.hits++;

      count++;

      callback(null, data);
    });
  } else { // link already cached.
    var obj = cache[url];
    obj.hits++;
    callback(null, obj.data);
  }
}

/* GET users listing. */
router.get('/thumbnail/:url', function(req, res) {
  
  var url = req.params.url;

  console.log("URL: " + url);

  if (!url) {
    res.status(404).end();
    return;
  }

  getImgData(url, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).end();
      return;
    }

    res.end(data, 'binary');
  });
});


var descRegex = /<meta\s+.*["']description["']\s+content=["']([^"']*)["']\s+\/?>/im;
//var titleRegex = /<meta\s+[property=]?[]?\s+content=["'](*)["']/;
var titleRegex = /<title>\s*(.*)\s*<\s*\/title>/im;

function getImgInfo(url, callback) {
  if (!(cache[url] && cache[url].desc && cache[url].title)) {

    var pu = parseuri(url);

    var opts = {
      host: (~pu.host.indexOf('www.')) ? pu.host : 'www.' + pu.host,
      path: pu.relative || pu.patch
    };

    var req = http.request(opts, function(res) {
      var str = '';

      res.on('data', function(chunk) {
        str += chunk;
      });

      res.on('end', function() {
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
        callback(null, {
          desc: cache[url].desc || (pu.host + pu.path) || "No description found.",
          title: cache[url].title || pu.host || "No Title found."
        });
      })
    });

    req.on('error', function(err) {
      console.log('req problem: ' + err.message);
    });

    req.end();
  } else {
    // send the info
    callback(null, {
      desc: cache[url].desc,
      title: cache[url].title
    });
  }
}

router.get('/info/:url', function(req, res) {
  var url = req.params.url;

  console.log("URL: " + url);

  if (!url) {
    res.end(404);
    return;
  }

  getImgInfo(url, function(err, data) {
    if (err) {
      console.log(err);
      res.status(500).end();
      return;
    }

    res.send(data);
    res.end();
  })
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
