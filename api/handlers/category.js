'use strict';

var assign = require('object-assign')
var Q = require('q');
var winston = require('winston');

var Category = require('../models/Category.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var utils = require('../routes/utils.js');

var CategoryHandler = {
  // Routes with the url /categories
  categories: {
    getMembers: function(req, res) {
      if (!req.query || !req.query.categories) {
        return res.status(412).send('Invalid inputs');
      }

      var expert = req.params.expert == '1';
      Category.getMembers(req.query.categories, expert).then(function(categories) {
        return res.status(200).send(categories);
      }, function(err) {
        winston.log('error', 'Error fetching category members: %s', err.toString());
        return res.status(503).send(err);
      });
    },

    getHot: function(req, res) {
      var hotCategoriesAndUsers = [];
      Transaction.getHotCategories().then(function(categories) {
        return Q.all(categories.map(function(category) {
          var newCategory = {
            name: category._id,
            users: []
          };

          return Transaction.getHotUsersInCategory(category._id).then(
            function(users) {
              return Q.all(users.map(function(user1) {
                return Q(User.getUserPictureAboutCategories(user1._id.id)).then(
                  function(user2) {
                    newCategory.users.push({
                      name: user1._id.name,
                      id: user1._id.id,
                      picture: {
                        url: user2.picture.url
                      },
                      about: user2.about,
                      categories: user2.categories
                    });
                }, function(error) {
                  winston.log('error', error.toString());
                });
              })).fin(function() {
                hotCategoriesAndUsers.push(newCategory);
              });
          });
        })).then(function() {
          return res.status(200).send(hotCategoriesAndUsers);
        }, function(error) {
          winston.log('error', error.toString());
          return res.status(404).send(error);
        });
      });
    },
  },
}

module.exports = CategoryHandler;
