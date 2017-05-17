module.exports = function(app, passport){

  app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/', failureRedirect: '/'
  }));

  // route for logging out
  app.get('/auth/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  app.get("/loggedin", function(req, res){
    console.log("In loggedin");
    res.send(req.isAuthenticated() ? req.user : '0');
  });

  app.get('/profile', isLoggedIn, function(req, res){
    console.log("Data : ", req.user);
    console.log("Req params : ", req.params);
    res.json(req.user);
  });

};

function isLoggedIn(req, res, next){
  // console.log("In isLogged in ");

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
