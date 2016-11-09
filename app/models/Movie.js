var mongoose = require('mongoose');

module.exports = mongoose.model('Movie',
  {
    'json' : mongoose.Schema.Types.Mixed
  }
);