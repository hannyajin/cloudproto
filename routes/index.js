var express = require('express');
var router = express.Router();

var data = {
  title: 'Cloud Proto',
  logo: '/images/favicon.png',
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  navList: [{ name: 'Home'}, {name: 'About'}],
  sampleList: [
    {url: 'http://www.theuselessweb.com/'},
    {url: 'http://imgur.com/r/puppies'},
    {url: 'http://www.reddit.com/r/javascript'},
    {url: 'http://www.thetimes.co.uk/tto/news/'},
    {url: 'http://www.iltasanomat.fi/'},
    {url: 'https://www.youtube.com/watch?v=57-0adg5g3U'},
    {url: 'http://tinysong.com/#/share/Savant - Melody Circus/37735522'},
    {url: 'https://www.youtube.com/watch?v=QTzyMxfTZv0'}
  ],
  footer: "© jin.fi"
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', data );
});

module.exports = router;