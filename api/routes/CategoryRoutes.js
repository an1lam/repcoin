// api/routes/CategoryRouter.js
// Routes to manipulate categories

var Category = require('../models/Category.js');

// Routes that end in /categories
// -------------------------------------------------------------

module.exports = function(router, isAuthenticated) {
  router.route('/categories')
    // Get all the categories
    .get(isAuthenticated, function(req, res) {
      Category.find(function(err, categories) {
        if (err) {
          res.send(err);
        }
        res.json(categories);
      });
    });
};

