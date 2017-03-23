// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our user model
var userSchema = mongoose.Schema({
  name: String, email: String, picture: String, facebook: {
    id: String, token: String, email: String, name: String, picture: String,
  },
  responses: [{movie_id: String, response: Number}]
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.saveResponse = function(response){
  console.log(response);
  var found = _.find(this.responses, {'movie_id' : response.movie_id.toString()});
  console.log("Found : ", found);
  if(found){
    this.responses = _.map(this.responses, function(res){
      if(res.movie_id == response.movie_id){
        res.response = response.response;
      }
      return res;
    });
  } else {
    this.responses.push(response);
  }
  
  console.log(this);
  this.save();
  return this;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);