module.exports = function(req, res, next) {      
  if (!req.isAuthenticated()) {
      console.log("Request " + req.body + " is not authorized.");
      res.status(401).end();
  } else {
    next();
  }
}
