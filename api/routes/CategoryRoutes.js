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
        } else {
          res.json(categories);
        }
      });
    })

    // Create a new category
    .post(isAuthenticated, function(req, res) {
      var category = new Category({
        name        : req.body.name,
        color       : req.body.color,
        ownerName   : req.body.ownerName,
        quotes      : req.body.quotes
      });
      category.save( function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(category);
        }
      });  
    });

///////// Routes taht have /categories/:category_id ////////
  router.route('/categories/:category_id')
    // Get the category with this id
    .get(function(req, res) {
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(category);
        }
      });
    })

    // Update the category with this id
    .put( function(req, res) {
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          res.status(400).send(err);
        } else {
          category.name       = req.body.name;
          category.color      = req.body.color;
          category.ownerName  = req.body.ownerName;
          category.quotes     = req.body.quotes;
          category.save(function(err) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.send(category);
            }
          });
        }
      });
    })      

   // Delete the category with this id
   .delete(function(req, res) {
      // Remove the category
      Category.remove({ _id: req.params.category_id }, function(err, category) {
        if (err) {
          res.send(err);
        } else {
          res.send('Successfully deleted category');
        }
      });
   });
};

