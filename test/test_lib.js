// A library for integration test functions
// WARNING: Due to Javascript scopes, primitive values must be wrapped
// around objects to be globally updated

// Creates a user and stores the user's id in userId
createUser = function(app, request, user, userId, cb) {
  request(app)
    .post('/api/users')
    .send(user)
    .end(function(err, res) {
      if (err) {
        if (cb) {
          cb();
        }
      } else {
        userId.toString = userId.valueOf = userId.toSource = res.body._id; 
        if (cb) {
          cb();
        }
      }
  }); 
};
