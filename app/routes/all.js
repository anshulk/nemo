var router = require('express').Router();

router.get('/*', function(req, res){
  res.sendfile('/public/index.html');
});

module.exports = router;