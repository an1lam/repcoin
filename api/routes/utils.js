'use strict';

// Modules
var crypto = require('crypto');
var nodeUtil = require('util');

// Models
var Category = require('../models/Category.js');
var AddExpertEvent = require('../models/AddExpertEvent.js');
var JoinEvent = require('../models/JoinEvent.js');
var NewCategoryEvent = require('../models/NewCategoryEvent.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var VerificationToken = require('../models/VerificationToken.js');

// Config
var emailConfig = require('../../config/mailer.js');
var urlConfig = require('../../config/url.js');
var winston = require('winston');

var DIVIDEND_RATE = 0.1;

var utils = {
  // Determines if a user is an expert for a given category
  isExpert: function(user, category) {
    var length = user.categories.length;
    for (var i = 0; i < length; i++) {
      if (user.categories[i].name === category) {
        return true;
      }
    }
    return false;
  },

  // Determines if a user is an investor for a given category
  isInvestor: function(user, category) {
    var length = user.portfolio.length;
    for (var i = 0; i < length; i++) {
      if (user.portfolio[i].category === category) {
        return true;
      }
    }
    return false;
  },

  // Given an expert, category, and userId, remove investments from that userId
  // If amount is not present, then expert keeps the reps it had from that investor
  removeInvestor: function(expert, categoryName, userId, amount) {
    var l = expert.categories.length;
    for (var i = 0; i < l; i++) {

      // If the category matches, search the investors
      if (expert.categories[i].name === categoryName) {
        var newInvestors = [];
        var z = expert.categories[i].investors.length;
        for (var j = 0; j < z; j++) {

          // Copy over the investor unless it is the one we want to remove
          var investor = expert.categories[i].investors[j];
          if (String(investor.id) !== String(userId)) {
            newInvestors.push(investor);
          }
        }
        expert.categories[i].investors = newInvestors;

        // If an amount is given, then remove that amount
        if (amount) {
          expert.categories[i].reps -= amount;
        }
      }
    }
    return expert;
  },

  // Given an investor, category, and expertId, remove investments in that expert
  // Reimburse the investor for the amount of those investments
  reimburseInvestor: function(investor, categoryName, expertId) {
    var l = investor.portfolio.length;
    for (var j = 0; j < l; j++) {
      // If the category matches, search the investments
      if (investor.portfolio[j].category === categoryName) {
        var newInvestments = [];
        var z = investor.portfolio[j].investments.length;
        for (var p = 0; p < z; p++) {
          var investment = investor.portfolio[j].investments[p];
          if (String(investment.userId) === String(expertId)) {
            // Give the investor the amount
            investor.portfolio[j].reps += investment.amount;
          } else {
            newInvestments.push(investment);
          }
        }
        investor.portfolio[j].investments = newInvestments;
      }
    }
    return investor;
  },

  // For each investment, decrement that experts reps and remove the investor if necessary
  // Give the investment amounts back to the investor
  // Decrement the investment amounts from the category market size
  undoInvestorActivityForCategory: function(category, investor, cb) {
    // Find the investments that need to be removed
    // Keep remaining portfolio entries in the new portfolio
    var investments;
    var portfolio = investor.portfolio;
    var newPortfolio = [];
    for (var i = 0; i < investor.portfolio.length; i++) {
      if (portfolio[i].category === category.name) {
        investments = portfolio[i].investments;
      } else {
        newPortfolio.push(portfolio[i]);
      }
    }
    if (!investments) {
      return cb('Error finding investments', null);
    }

    // Create a map of users to their respective amounts owed back to the investor
    // Store the total amount of reps to be given back to the investor
    var expertAmounts = {};
    var totalReps = 0;
    var expertId, amount;
    for (var j = 0; j < investments.length; j++) {
      amount = investments[j].amount;
      expertId = investments[j].userId;

      if (expertAmounts.hasOwnProperty(expertId)) {
        expertAmounts[expertId] += amount;
      } else {
        expertAmounts[expertId] = amount;
      }
      totalReps += amount;
    }

    // Give the investor back the total amount and update his portfolio
    investor.reps += totalReps;
    investor.portfolio = newPortfolio;

    // Decrement the total amount being removed from the category
    category.reps -= totalReps;

    var self = this;
    var investorId = investor._id.toString();
    // For each expert in the map, remove those reps and the investor
    User.find({ '_id': { $in: Object.keys(expertAmounts) }}, function(err, experts) {
      if (err) {
        return cb('Error finding investors experts', null);
      }
      var newExperts = [];
      // Search through each expert's portfolio
      var length = experts.length;
      for (var i = 0; i < length; i++) {
        var expert = experts[i];
        newExperts.push(self.removeInvestor(expert, category.name, investorId, expertAmounts[expert._id.toString()]));
      }

      // Finally, save all the modified experts, the investor, and the category
      var newDocs = newExperts.concat(investor).concat(category);
      self.saveAll(newDocs, function(errs) {
        if (errs.length > 0) {
          winston.log('error', 'utils.updateInvestorExperts: error saving documents: %s', errs);
          return cb(errs, null);
        } else {
          return cb(null, investor);
        }
      });
    });
  },

  // Given investors for an expert and category, reimburse them for the category
  reimburseInvestors: function(investors, categoryName, expertId, cb) {
    // If the list of investors is empty, simply return
    if (investors.length === 0) {
      return cb(null);
    }
    var self = this;

    // Get a list of user ids
    var length = investors.length;
    var ids = [];
    for (var i = 0; i < length; i++) {
      ids.push(investors[i].id);
    }

    // Update each user
    User.find({ '_id': { $in: ids }}, function(err, users) {
      if (err) {
        winston.log('error', 'utils.reimburseInvestors: error finding investors: %s', err);
        return cb(err);
      } else {
        var newUsers = [];
        // Search through each user's portfolio
        length = users.length;
        for (var i = 0; i < length; i++) {
          var user = users[i];
          newUsers.push(self.reimburseInvestor(user, categoryName, expertId));
        }

        // Finally, save all the modified investors
        self.saveAll(newUsers, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'utils.reimburseInvestors: error saving investors: %s', errs);
            return cb(errs);
          } else {
            return cb(null);
          }
        });
      }
    });
  },

  // Get investors for a given user and category
  getInvestors: function(user, categoryName) {
    var length = user.categories.length;
    for (var i = 0; i < length; i++) {
      if (categoryName === user.categories[i].name) {
        return user.categories[i].investors;
      }
    }
    return null;
  },

  // Delete an expert category
  deleteExpertCategory: function(user, categoryName) {
    // Check if the category is the user's default
    if (categoryName === user.defaultCategory) {
      user.defaultCategory = undefined;
    }

    var length = user.categories.length;
    var newCategories = [];
    for (var i = 0; i < length; i++) {
      if (categoryName !== user.categories[i].name) {
        newCategories.push(user.categories[i]);
      }
    }
    user.categories = newCategories;
    return user;
  },

  // Validate the inputs to create a new user through a POST /users
  validateCreateUserInputs: function(req) {
    if (!req.body ||
        !req.body.firstname ||
        !req.body.lastname ||
        !req.body.password ||
        !req.body.email) {
      return false;
    }

    var reg = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
    if (!reg.test(req.body.email)) {
      return false;
    }
    return true;
  },

  // Validate the inputs for /users/:categoryName/leaders/:count
  validateLeadersCountInputs: function(req) {
    if (!req.query || req.query.expert === null) {
      return false;
    }

    if (isNaN(parseInt(req.params.count))) {
      return false;
    }
    return true;
  },

  // Validate an array of user links
  validateUserLinks: function(links) {
    var length = links.length;
    if (length === 1 && links[0] === 'EMPTY') {
      return true;
    }

    for (var i = 0; i < length; i++) {
      var link = links[i];

      // Check the title
      if (!link.title || link.title.length > 50 || link.title.trim().length === 0) {
        return false;
      }
      // Check the url
      if (!link.url || link.url.length > 2083 || link.url.trim().length === 0) {
        return false;
      }
    }
    return true;
  },

  // Validate inputs to update a user
  // TODO: Add more checks
  validateUserInputs: function(req) {
    // A valid picture must have both the url and public_id
    if (req.body.picture) {
      if (!req.body.picture.url || !req.body.picture.public_id) {
        return false;
      }
    }

    // Location must be less than 100 characters and cannot be whitespace
    if (req.body.location) {
      if (req.body.location.trim().length === 0 ||
          req.body.location.length > 200) {
        return false;
      }
    }

    // About must be less than 200 characters and cannot be whitespace
    if (req.body.about) {
      if (req.body.about.trim().length === 0 ||
          req.body.about.length > 200) {
        return false;
      }
    }
    return true;
  },

  // Validate inputs to create a new category
  validateCategoryInputs: function(req) {
    // Check that all of the inputs are present
    if (!req.body.name) {
      return false;
    }
    return true;
  },

  // Validate that the transaction inputs are valid
  validateTransactionInputs: function(req) {
    // Check that all of the inputs are present
    if (!req.body.from ||
        !req.body.from.id ||
        !req.body.from.name ||
        !req.body.to ||
        !req.body.to.id ||
        !req.body.to.name ||
        !req.body.amount ||
        !req.body.category) {
      return false;
    }

    var amount = Number(req.body.amount);

    // Check that the amount is a valid number
    if (isNaN(amount)) {
      return false;
    }

    // Check that the amount is not 0
    if (amount === 0) {
      return false;
    }

    // Check that the amount is not past the hundredths place
    if (parseFloat((amount * 100).toPrecision(10)) % 1 !== 0) {
      return false;
    }

    // Check that a revoke has an associated investment id
    if (amount < 0 && !req.body.id) {
      return false;
    }
    return true;
  },

  // Given a portfolio entry, get the total dividends
  getTotalDividends: function(portfolioEntry) {
    var dividends = 0;
    if (!portfolioEntry.investments) {
      return 0;
    };
    var length = portfolioEntry.investments.length;
    var investments = portfolioEntry.investments;
    for (var i = 0; i < length; i++) {
      dividends += investments[i].dividend;
    }
    return dividends;
  },

  // Sort users by dividends for a given category, increasing order
  getDividendsComparator: function(category) {
    return function(a, b) {
      var indexA = this.getPortfolioIndex(a, category);
      var indexB = this.getPortfolioIndex(b, category);

      var dividendsA = this.getTotalDividends(a.portfolio[indexA]);
      var dividendsB = this.getTotalDividends(b.portfolio[indexB]);
      return dividendsA - dividendsB;
    }.bind(this);
  },

  // Sort users by reps for a given category, increasing order
  getRepsComparator: function(category) {
    return function(a, b) {
      var indexA = this.getCategoryIndex(a, category);
      var indexB = this.getCategoryIndex(b, category);

      var repsA = a.categories[indexA].reps;
      var repsB = b.categories[indexB].reps;

      return repsA - repsB;
    }.bind(this);
  },

  // Sort users by direct score for a given category, decreasing order
  // Set expert to true to compare for an expert category, false for investor
  getPercentileComparator: function(category, expert) {
    return function(a, b) {
      var indexA, indexB, percentileA, percentileB;

      if (expert) {
        indexA = this.getCategoryIndex(a, category);
        indexB = this.getCategoryIndex(b, category);

        percentileA = a.categories[indexA].percentile;
        percentileB = b.categories[indexB].percentile;
      } else {
        indexA = this.getPortfolioIndex(a, category);
        indexB = this.getPortfolioIndex(b, category);

        percentileA = a.portfolio[indexA].percentile;
        percentileB = b.portfolio[indexB].percentile;
      }

      return percentileB - percentileA;
    }.bind(this);
  },

  // Save an array of documents
  saveAll: function(docs, cb) {
    var errs = [];
    var done = 0;
    var length = docs.length;
    if (length === 0) {
      cb(errs);
    }

    for (var i = 0; i < length; i++) {
      docs[i].save(function(err) {
        if (err) {
          winston.log('error', 'utils.saveAll: error saving doc: %s', err);
          errs.push(err);
        }
        done++;

        if (done === length) {
          cb(errs);
        }
      });
    }
  },

  // Find the index for a given category for an expert
  getCategoryIndex: function(expert, category) {
    var length = expert.categories.length;
    for (var i = 0; i < length; i++) {
      if (expert.categories[i].name === category) {
        return i;
      }
    }
    return -1;
  },

  // Find the index for a given category for an investor
  getPortfolioIndex: function(investor, category) {
    var length = investor.portfolio.length;
    for (var i = 0; i < length; i++) {
      if (investor.portfolio[i].category === category) {
        return i;
      }
    }
    return -1;
  },

  // Add an investor to an expert's category if not already present
  addInvestorToExpertCategory: function(expert, investor, i) {
    var investorId = investor._id.toString();
    var investorName = investor.username;

    var length = expert.categories[i].investors.length;
    for (var j = 0; j < length; j++) {
      if (String(expert.categories[i].investors[j].id) === investorId) {
        return expert;
      }
    }
    var newInvestor = { id: investorId, name: investorName };
    expert.categories[i].investors.push(newInvestor);
    return expert;
  },

  // Remove an investor from the expert's list of investors if no longer investor
  removeInvestorFromExpertOnRevoke: function(expert, investorId, portfolioEntry) {
    var expertId = (String) (expert._id);
    var investorId = (String) (investorId);
    for (var i = 0; i < portfolioEntry.investments.length; i++) {
      if (portfolioEntry.investments[i].userId === expertId) {
        return expert;
      }
    }
    expert = this.removeInvestor(expert, portfolioEntry.category, investorId);
    return expert;
  },

  // Changes fields for all of the documents necessary for a transaction to occur
  // Returns null if successful, error message otherwise
  processTransaction: function(toUser, fromUser, category, transaction, investmentId) {
    // Round the amount to the nearest hundredth
    transaction.amount = Math.round(transaction.amount * 100) / 100;

    // Update all fields for the toUser
    var toUserReps = this.updateTransactionToUser(toUser, fromUser, category.name, transaction.amount);
    if (toUserReps === null) {
      return 'User is not an expert for category: ' + category.name;
    }

    // Update all fields for the fromUser
    var err = this.updateTransactionFromUser(fromUser, toUser, category, transaction.amount, toUserReps, investmentId);
    if (err) {
      return err;
    }

    // Update the category reps
    category.reps += transaction.amount;
    category.reps = Math.floor(category.reps * 100)/100;
    return null;
  },

  // Update the to user in a transaction
  // Returns toUser's new reps value if successful, null otherwise
  updateTransactionToUser: function(expert, investor, category, amount) {
    var i = this.getCategoryIndex(expert, category);
    if (i === -1) {
      return null;
    }

    // Add the investor to the expert list of investor if not there
    this.addInvestorToExpertCategory(expert, investor, i);

    // Update the expert reps
    expert.categories[i].reps += amount;
    expert.categories[i].reps = Math.round(expert.categories[i].reps * 100) / 100;
    return expert.categories[i].reps;
  },

  getTransactionPortfolioIndex: function(amount, fromUser, toUser, toUserReps, investmentId, category) {

    // Find the portfolio entry that should be updated
    var index = this.getPortfolioIndex(fromUser, category.name);
    if (index !== -1) {
      return index;
    }

    // If the user is not an investor for this category, add it
    fromUser.portfolio.push({ category: category.name, id: category._id, percentile: 0, investments: [] });
    category.investors++;
    return fromUser.portfolio.length-1;
  },

  addTransactionInvestment: function(index, amount, fromUser, toUser, toUserReps, category, investmentId) {
    var portfolio = fromUser.portfolio;
    if (amount > 0) {

      // Make sure the user has enough reps to give
      if (amount > fromUser.reps) {
        return 'Not enough reps to give';
      }

      var percentage = Number(amount/toUserReps);
      var dividend   = Math.round(percentage * toUserReps * DIVIDEND_RATE * 100) / 100;
      var investment = {
        userId     : (String) (toUser._id),
        user       : toUser.username,
        amount     : amount,
        percentage : percentage,
        dividend   : dividend
      };
      portfolio[index].investments.push(investment);
      fromUser.reps -= amount;
      fromUser.reps = Math.floor(fromUser.reps * 100)/100;

    // Otherwise, the investment is a revoke
    } else {
      var j = -1;
      var length = portfolio[index].investments.length;
      for (var i = 0; i < length; i++) {
        if (String(portfolio[index].investments[i]._id) ===  String(investmentId)) {
          j = i;
          break;
        }
      }

      // The investor is trying to revoke an investment that was not found (ERROR!)
      if (j === -1) {
        return 'Investment for revoke was not found';
      }

      var investment = portfolio[index].investments[j];
      amount *= -1;

      // Make sure the investment has enough reps
      if (amount > investment.amount) {
        return 'Investment only has ' + investment.amount + ' reps to revoke';
      }

      // Adjust the investor's reps
      fromUser.reps += amount;
      fromUser.reps = Math.floor(fromUser.reps * 100)/100;

      var prevAmount = investment.amount;
      var prevPercentage = investment.percentage;
      var newAmount = prevAmount - amount;

      // newPercentage / newAmount = prevPercentage / prevAmount (Proportional)
      var newPercentage = newAmount * prevPercentage / prevAmount;

      // If the amount is now zero, remove the investment
      if (newAmount === 0) {
        portfolio[index].investments.splice(j, 1);
        this.removeInvestorFromExpertOnRevoke(toUser, fromUser._id, portfolio[index]);
        // If the portfolio entry now has no investments, remove the entry
        if (portfolio[index].investments.length === 0) {
          portfolio.splice(index, 1);
          category.investors--;
        }
        return null;
      }

      // Update the date
      investment.timeStamp = Date.now();

      // Update the investment's amount, percentage, and dividend
      investment.amount = newAmount;
      investment.amount = Math.round(investment.amount * 100) / 100;
      investment.percentage = newPercentage;
      investment.dividend = Math.round(newPercentage * toUserReps * DIVIDEND_RATE * 100) / 100;
    }
    return null;
  },

  // Update an investor making an investment for a given category
  // Returns null if success, error message otherwise
  updateTransactionFromUser: function(fromUser, toUser, category, amount, toUserReps, investmentId) {
    var index = this.getTransactionPortfolioIndex(amount, fromUser, toUser, toUserReps, investmentId, category);
    return this.addTransactionInvestment(index, amount, fromUser, toUser, toUserReps, category, investmentId);
  },

  // Given a transaction, update all dividends for investors investing in that expert
  updateDividends: function(investors, categoryName, expertName, expertReps) {
    var investor, j, errs;
    var length = investors.length;
    for (var i = 0; i < length; i++) {
      j = -1;
      investor = investors[i];
      j = this.getPortfolioIndex(investor, categoryName);
      if (j === -1) {
        continue;
      }

      // Find the corresponding investment and reset the dividend
      var len = investor.portfolio[j].investments.length;
      for (var q = 0; q < len; q++) {
        var investment = investor.portfolio[j].investments[q];
        if (investment.user === expertName) {
          investment.dividend = Math.round(investment.percentage * expertReps * DIVIDEND_RATE * 100) / 100;
        }
      }
    }
    return investors;
  },

  // Given a list of investors, update their percentiles
  updateInvestorPercentiles: function(investors, category, cb) {
    // Calculates the percentile for a value
    var formula = function (l, s, sampleSize) {
      return Math.floor(100 * ((s * 0.5) + l) / sampleSize);
    };

    var percentileDict = {}; // Maps reps value to percentile
    var indexDict = {}; // Maps user._id to category index

    var l = 0; // Number of items less than current
    var s = 1; // Number of items seen the same as current
    var length = investors.length;

    // Set the index for the 0th expert
    var index = this.getPortfolioIndex(investors[0], category);
    if (index === -1) {
      return cb('Could not find portfolio index for user ' + investors[0].username);
    }
    indexDict[investors[0]._id] = index;

    // Each unique dividends value will have a unique percentage
    var prevDividends = this.getTotalDividends(investors[0].portfolio[index]);
    percentileDict[prevDividends] = formula(l, s, length);

    for (var i = 1; i < length; i += 1) {
      index = this.getPortfolioIndex(investors[i], category);
      if (index === -1) {
        return cb('Could not find portfolio index for user ' + investors[i].username);
      }
      indexDict[investors[i]._id] = index;

      // If we have seen this value before, increment s
      // Otherwise, we know there are s more numbers less than the current
      //  In that case, we increment l by s and set s back to 1
      var currDividends = this.getTotalDividends(investors[i].portfolio[index]);
      if (currDividends === prevDividends) {
        s += 1;
      } else {
        l += s;
        s = 1;
      }

      //Reset the percentile for the given reps value
      percentileDict[currDividends] = formula(l, s, length);
      prevDividends = currDividends;
    }

    // Go through the results and reset all of the percentiles
    for (var i = 0; i < length; i++) {
      var j = indexDict[investors[i]._id];
      var dividendsVal = this.getTotalDividends(investors[i].portfolio[j]);
      var percentile = percentileDict[dividendsVal];
      investors[i].portfolio[j].percentile = percentile;
    }
    return cb(null);
  },

  // Given a list of experts, update their percentiles
  getExpertPercentiles: function(experts, category, cb) {
    // Calculates the percentage for a value
    var formula = function (l, s, sampleSize) {
      return Math.floor(100 * ((s * 0.5) + l) / sampleSize);
    };

    var percentileDict = {}; // Maps reps value to percentile
    var indexDict = {}; // Maps user._id to category index
    var l = 0; // Number of items less than current
    var s = 1; // Number of items seen the same as current
    var length = experts.length;

    // Set the index for the 0th expert
    var index = this.getCategoryIndex(experts[0], category);
    if (index === -1) {
      return cb('Could not find category index for user ' + experts[0].username);
    }
    indexDict[experts[0]._id] = index;

    // Each unique reps value will have a unique percentage
    percentileDict[experts[0].categories[index].reps] = formula(l, s, length);

    for (var i = 1; i < length; i += 1) {
      index = this.getCategoryIndex(experts[i], category);
      if (index === -1) {
        return cb('Could not find category index for user ' + experts[i].username);
      }
      indexDict[experts[i]._id] = index;

      // If we have seen this value before, increment s
      // Otherwise, we know there are s more numbers less than the current
      //  In that case, we increment l by s and set s back to 1
      var currReps = experts[i].categories[index].reps;
      var prevReps = experts[i-1].categories[indexDict[experts[i-1]._id]].reps;
      if (currReps === prevReps) {
        s += 1;
      } else {
        l += s;
        s = 1;
      }

      //Reset the percentile for the given reps value
      percentileDict[currReps] = formula(l, s, length);
    }
    // Go through the results and reset all of the percentiles
    for (var i = 0; i < length; i++) {
      var j = indexDict[experts[i]._id];
      var reps = experts[i].categories[j].reps;
      var percentile = percentileDict[reps];
      experts[i].categories[j].percentile = percentile;
    }
    return cb(null);
  },

  // Given a category name, update the percentiles for all the experts and investors in that category
  // In addition, update the investor dividends
  updatePercentilesAndDividends: function(categoryName, expert, cb) {
    var self = this;

    var username, expertReps;
    if (expert) {
      var i = self.getCategoryIndex(expert, categoryName);
      if (i < 0) {
        return cb('User is not an expert in this category');
      }
      username = expert.username;
      expertReps = expert.categories[i].reps;
    }

    self.updateInvestorPercentilesAndDividends(categoryName, function(err) {
      if (err) {
        return cb(err);
      }
      self.updateExpertPercentiles(categoryName, function(err) {
        if (err) {
          return cb(err);
        }
        return cb(null);
      });
    }, username, expertReps);
  },

  // Given a category name, update the percentiles and dividends, for all investors
  updateInvestorPercentilesAndDividends: function(categoryName, cb, expertName, expertReps) {
    var self = this;
    var investorsPromise = User.findInvestorByCategory(categoryName, function() {});
    investorsPromise.then(function(investors) {
      // If parameters are available, update all the investor percentages
      if (expertName && expertReps) {
        investors = self.updateDividends(investors, categoryName, expertName, expertReps);
      }

      // Sort the investors by dividends in increasing order
      var dividendsComparator = self.getDividendsComparator(categoryName);
      investors.sort(dividendsComparator);
      // Update the investor percentiles for this category
      self.updateInvestorPercentiles(investors, categoryName, function(err) {
        if (err) {
          winston.log('error', 'utils.updateInvestorPercentilesAndDividends: error updating investor percentiles: %s', err);
          return cb(err);
        }
        self.saveAll(investors, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'utils.updateInvestorPercentilesAndDividends: error saving investors: %s', err);
            return cb(errs);
          } else {
            return cb(null);
          }
        });
      });
    }, function(err) {
      winston.log('error', 'utils.updateInvestorPercentilesAndDividends: error getting investorsPromise: %s', err);
      return cb(err);
    });
  },

  // Given a category name, update the percentiles for all the experts in that category
  updateExpertPercentiles: function(categoryName, cb) {
    var self = this;
    var expertsPromise = User.findExpertByCategory(categoryName, function() {});
    expertsPromise.then(function(experts) {
      var repsComparator = self.getRepsComparator(categoryName);
      experts.sort(repsComparator);
      self.getExpertPercentiles(experts, categoryName, function(err) {
        if (err) {
          winston.log('error', 'utils.updateExperts: error getting expert percentiles: %s', err);
          return cb(err);
        }
        self.saveAll(experts, function(errs) {
          if (errs.length > 0) {
            winston.log('error', 'utils.updateExperts: error saving experts: %s', err);
            return cb(errs);
          } else {
            return cb(null);
          }
        });
      });
    }, function(err) {
      winston.log('error', 'utils.updateExperts: error getting expertsPromise: %s', err);
      return cb(err);
    });
  },

  // Generate a random hex token
  getRandomString: function() {
    return crypto.randomBytes(12).toString('hex');
  },

  getVerificationEmailOptions: function(email, randomString) {
    var url = urlConfig[process.env.NODE_ENV] + '#/verify/' + randomString + '/';
    return {
      from: emailConfig.verification.from,
      to: email,
      subject: emailConfig.verification.subject,
      text: nodeUtil.format(emailConfig.verification.text, url),
    };
  },

  // name of category, user requesting, boolean whether requested expert or investor
  getCategoryRequestEmailOptions: function(categoryName, userId, expert) {
    categoryName = categoryName.replace(' ', '%20');
    var approveUrl = urlConfig[process.env.NODE_ENV] + '#/categoryRequest/' + userId + '/' + categoryName + '/approve/' + expert;
    var denyUrl = urlConfig[process.env.NODE_ENV] + '#/categoryRequest/' + userId + '/' + categoryName + '/deny/' + expert;
    return {
      from: emailConfig.categoryRequest.from,
      to: emailConfig.categoryRequest.to,
      subject: nodeUtil.format(emailConfig.categoryRequest.subject, categoryName),
      text: nodeUtil.format(emailConfig.categoryRequest.text, categoryName, approveUrl, denyUrl),
    };
  },

  getPasswordResetEmailOptions: function(email, randomString) {
    var url = urlConfig[process.env.NODE_ENV] + '#/passwordReset/' + randomString;
    return {
      from: emailConfig.passwordReset.from,
      to: email,
      subject: emailConfig.passwordReset.subject,
      text: nodeUtil.format(emailConfig.passwordReset.text, url),
    };
  },

  createEvent: function(type, params) {
    switch (type) {
      case 'join':
        this.createJoinEvent.apply(this, params);
        break;
      case 'newcategory':
        this.createNewCategoryEvent.apply(this, params);
        break;
      case 'addexpert':
        this.createAddExpertEvent.apply(this, params);
        break;

      default: return;
    }
  },

  createAddExpertEvent: function(username, userId, category) {
    var evt = new AddExpertEvent({ username: username, userId: userId, category: category });
    evt.save(function(err, svdEvt) {
      if (err) {
        winston.log('error', 'Error creating addexpert event: %s', err);
        return err;
      }
      return svdEvt;
    });
  },

  createNewCategoryEvent: function(username, userId, category) {
    var evt = new NewCategoryEvent({ username: username, userId: userId, category: category });
    evt.save(function(err, svdEvt) {
      if (err) {
        winston.log('error', 'Error creating newcategory event: %s', err);
        return err;
      }
      return svdEvt;
    });
  },

  createJoinEvent: function(name, id) {
    var evt = new JoinEvent({ name: name, userId: id });
    evt.save(function(err, svdEvt) {
      if (err) {
        winston.log('error', 'Error creating join event: %s', err);
        return err;
      }
      return svdEvt;
    });
  },
};

module.exports = utils;
