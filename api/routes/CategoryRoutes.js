// api/routes/CategoryRoutes.js
// Routes to manipulate categories

var Category = require('../models/Category.js');
var utils = require('./utils.js');
var winston = require('winston');

// Routes that end in /categories
// -------------------------------------------------------------
module.exports = function(router, isAuthenticated, acl) {
  router.route('/categories')
    // Get all the categories
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /categories');
      if (req.query.searchTerm) {
        winston.log('info', 'Finding categories using searchTerm: %s', req.query.searchTerm);
        Category.findBySearchTerm(req.query.searchTerm).then(function(categories) {
          return res.status(200).send(categories);
        }, function(err) {
          winston.log('error', 'Error finding categories using searchTerm %s: %s', req.query.searchTerm, err);
          return res.status(503).send(err);
        });
      } else {
        winston.log('info', 'Finding all categories');
        Category.find().exec().then(function(categories) {
          return res.status(200).send(categories);
        }, function(err) {
          winston.log('error', 'Error finding all categories: %s', err);
          return res.status(503).send(err);
        });
      }
    })

    // Create a new category
    .post(isAuthenticated, function(req, res) {
      winston.log('info', 'POST /categories');

      // Validate the inputs
      if (!utils.validateCategoryInputs(req)) {
        winston.log('info', 'Invalid inputs to create category');
        return res.status(412).send('Invalid inputs');
      }

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
          winston.log('error', 'Error creating category: %s', err);
          return res.status(503).send(err);
        } else {
          winston.log('info', 'Successfully created category: %s', category.name);
          return res.status(200).send(category);
        }
      });
    });

///////// Routes that have /categories/:categoryName ///////
router.route('/categories/:categoryName')
  // Get the category with this name
  .get(isAuthenticated, function(req, res) {
    var categoryName = req.params.categoryName;
    winston.log('info', 'GET /categories/%s', categoryName);
    Category.findByName(categoryName).then(function(category) {
      if (category) {
        winston.log('info', 'Found category: %s', category.name);
      } else {
        winston.log('info', 'No category found named: %s', categoryName);
      }
      return res.status(200).send(category);
    }, function(err) {
      winston.log('error', 'Error finding category: %s', err);
      return res.status(503).send(err);
    });
  });

///////// Routes that have /categories/:category_id ////////
  router.route('/categories/:category_id/public')
    // Update the category with this id, only public fields are possible
    .put(isAuthenticated, function(req, res) {
      winston.log('info', 'PUT /categories/%s/public', req.params.category_id);
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          winston.log('error', 'Error finding category: %s', err);
          return res.status(503).send(err);
        } else if (!category) {
          winston.log('info', 'No category found for id: %s', req.params.category_id);
          return res.status(503).send('No category was found');
        } else {
          winston.log('info', 'Updating category: %s', category.name);
          category.color      = req.body.color || category.color;
          category.ownerName  = req.body.ownerName || category.ownerName;
          category.quotes     = req.body.quotes || category.quotes;
          category.save(function(err) {
            if (err) {
              winston.log('error', 'Error saving category: %s', err);
              return res.status(503).send(err);
            } else {
              winston.log('info', 'Saved category: %s', category.name);
              return res.status(200).send(category);
            }
          });
        }
      });
    });

  router.route('/categories/:category_id')
    // Get the category with this id
    .get(isAuthenticated, function(req, res) {
      winston.log('info', 'GET /categories/:%s', req.params.category_id);
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          winston.log('error', 'Error finding category with id: %s', req.params.category_id);
          return res.status(503).send(err);
        } else {
          winston.log('info', 'Found category: %s', category.name);
          return res.status(200).send(category);
        }
      });
    })

    // Update the category with this id
    // TODO: Create separate routes so some users can update safe category parts
    .put(isAuthenticated, function(req, res) {
      winston.log('info', 'PUT /categories/%s', req.params.category_id);
      Category.findById(req.params.category_id, function(err, category) {
        if (err) {
          winston.log('error', 'Error finding category: %s', err);
          return res.status(503).send(err);
        } else if (!category) {
          winston.log('info', 'No category found with id: %s', req.params.category_id);
          return res.status(503).send('No category was found');
        } else {
          category.name       = req.body.name || category.name;
          category.color      = req.body.color || category.color;
          category.ownerName  = req.body.ownerName || category.ownerName;
          category.quotes     = req.body.quotes || category.quotes;
          category.experts    = req.body.experts || category.experts;
          category.investors  = req.body.investors || category.investors;
          category.save(function(err) {
            if (err) {
              winston.log('error', 'Error saving category: %s', err);
              return res.status(503).send(err);
            } else {
              winston.log('info', 'Saved category: %s', category.name);
              return res.status(200).send(category);
            }
          });
        }
      });
    })

    // Delete the category with this id
    .delete(isAuthenticated, acl.isAdmin, function(req, res) {
        winston.log('info', 'DELETE /categories/%s', req.params.category_id);
       // Remove the category
       Category.remove({ _id: req.params.category_id }, function(err, category) {
         if (err) {
           winston.log('error', 'Error deleting category: %s', err);
           return res.status(503).send(err);
         } else {
           winston.log('info', 'Deleted category: %s', req.params.category_id);
           return res.status(200).send('Successfully deleted category');
         }
       });
    });
};

