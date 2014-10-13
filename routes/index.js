var express = require('express');
var router = express.Router();

var data = {
  title: 'Cloud Proto',
  logo: '/images/favicon.png',
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  navList: [{ name: 'Home'}, {name: 'About'}]
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', data );
});

module.exports = router;