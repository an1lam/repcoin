// api/routes/CategoryRoutes.js
// Routes to manipulate categories

var Category = require('../models/Category.js');

// Routes that end in /categories
// -------------------------------------------------------------
module.exports = function(router, isAuthenticated) {
  router.route('/categories')
    // Get all the categories
    .get(isAuthenticated, function(req, res) {
      if (req.query.searchTerm) {
        Category.findBySearchTerm(req.query.searchTerm).then(function(categories) {
          res.json(categories);
          return;
        }, function(err) {
          res.status(501).send(err);
        });
      } else {
        Category.find().exec().then(function(categories) {
          res.json(categories);
          return;
        }, function(err) {
          res.status(501).send(err);
          return;
        });
      }
    })

    // Create a new category
    .post(isAuthenticated, function(req, res) {
      var category = new Category({
        name        : req.body.name,
        ownerName   : req.body.ownerName,
        quotes      : req.body.quotes
      });

      // If there is no specified color, Mongoose will give it the default
      if (req.body.color) {
        category.color = req.body.color;
      }

      category.save( function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(category);
        }
      });
    });

///////// Routes that have /categories/:categoryName ///////
router.route('/categories/:categoryName')
  // Get the category with this name
  .get(isAuthenticated, function(req, res) {
    Category.findByName(req.params.categoryName).then(function(category) {
      res.send(category);
    }, function(err) {
      res.status(501).send(err);
    });
  });

///////// Routes that have /categories/:category_id ////////
  router.route('/categories/:category_id/public')
    // Update the category with this id, only public fields are possible
    .put(isAuthenticated, function(req, res) {
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          return res.status(503).send(err);
        } else if (!catgory) {
          return res.status(503).send('No category was found');
        } else {
          category.color      = req.body.color || category.color;
          category.ownerName  = req.body.ownerName || category.ownerName;
          category.quotes     = req.body.quotes || category.quotes;
          category.save(function(err) {
            if (err) {
              return res.status(503).send(err);
            } else {
              return res.status(200).send(category);
            }
          });
        }
      });
    })

  router.route('/categories/:category_id')
    // Get the category with this id
    .get(isAuthenticated, function(req, res) {
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.send(category);
        }
      });
    })

    // Update the category with this id
    .put(isAuthenticated, function(req, res) {
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          res.status(400).send(err);
        } else {
          category.name       = req.body.name || category.name;
          category.color      = req.body.color || category.color;
          category.ownerName  = req.body.ownerName || category.ownerName;
          category.quotes     = req.body.quotes || category.quotes;
          category.experts    = req.body.experts || category.experts;
          category.investors  = req.body.investors || category.investors; 
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
    .delete(isAuthenticated, function(req, res) {
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

