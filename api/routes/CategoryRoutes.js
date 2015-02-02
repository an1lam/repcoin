// api/routes/CategoryRoutes.js
// Routes to manipulate categories

var Category = require('../models/Category.js');
var utils = require('./utils.js');
var winston = require('winston');

// Routes that end in /categories
// -------------------------------------------------------------
module.exports = function(router, isAuthenticated, acl, censor) {
  router.route('/categories')
    // Get all the categories
    .get(isAuthenticated, function(req, res) {
      if (req.query.searchTerm) {
        Category.findBySearchTerm(req.query.searchTerm).then(function(categories) {
          return res.status(200).send(categories);
        }, function(err) {
          winston.log('error', 'Error finding categories using searchTerm %s: %s', req.query.searchTerm, err);
          return res.status(503).send(err);
        });
      } else {
        Category.find().sort({ name: 1 }).exec().then(function(categories) {
          return res.status(200).send(categories);
        }, function(err) {
          winston.log('error', 'Error finding all categories: %s', err);
          return res.status(503).send(err);
        });
      }
    })

    // Create a new category
    .post(isAuthenticated, censor.isNaughty, function(req, res) {

      // Validate the inputs
      if (!utils.validateCategoryInputs(req)) {
        winston.log('info', 'Invalid inputs to create category');
        return res.status(412).send('Invalid inputs');
      }

      // Values will either be assigned defaults or undefined if nothing present
      var category = new Category({ name : req.body.name });

      category.save( function(err) {
        if (err) {
          winston.log('error', 'Error creating category: %s', err);
          return res.status(503).send(err);
        } else {
          return res.status(200).send(category);
        }
      });
    });

///////// Routes that have /categories/:categoryName ///////
router.route('/categories/:categoryName')
  // Get the category with this name
  .get(isAuthenticated, function(req, res) {
    var categoryName = req.params.categoryName;
    Category.findByName(categoryName).then(function(category) {
      return res.status(200).send(category);
    }, function(err) {
      winston.log('error', 'Error finding category: %s', err);
      return res.status(503).send(err);
    });
  });

  router.route('/categories/:category_id')
    // Get the category with this id
    .get(isAuthenticated, function(req, res) {
      var categoryId = req.params.category_id;
      Category.findById(categoryId, function(err, category) {
        if (err) {
          winston.log('error', 'Error finding category with id: %s', categoryId);
          return res.status(503).send(err);
        } else {
          return res.status(200).send(category);
        }
      });
    })

    // Delete the category with this id
    .delete(isAuthenticated, acl.isAdmin, function(req, res) {
       // Remove the category
       Category.remove({ _id: req.params.category_id }, function(err, category) {
         if (err) {
           winston.log('error', 'Error deleting category: %s', err);
           return res.status(503).send(err);
         } else {
           return res.status(200).send('Successfully deleted category');
         }
       });
    });
};

