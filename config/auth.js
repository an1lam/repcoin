module.exports = {
  isAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(401).end();
    } else {
      next();
    }
  }
}
