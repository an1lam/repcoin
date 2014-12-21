'use strict';

// Modules
var crypto = require('crypto');
var nodeUtil = require('util');

// Models
var Category = require('../models/Category.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');
var VerificationToken = require('../models/VerificationToken.js');

// Config
var verificationEmailConfig = require('../../config/mailer.js').verificationEmail;
var urlConfig = require('../../config/url.js');

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
  // The expert keeps the reps it had from that investment
  removeInvestor: function(expert, categoryName, userId) {
    var l = expert.categories.length;
    for (var j = 0; j < l; j++) {

      // If the category matches, search the investors
      if (expert.categories[j].name === categoryName) {
        var newInvestors = [];
        var z = expert.categories[j].investors.length;
        for (var p = 0; p < z; p++) {

          // Copy over the investor unless it is the one we want to remove
          var investor = expert.categories[j].investors[p];
          if (String(investor.id) !== String(userId)) {
            newInvestors.push(investor);
          }
        }
        expert.categories[j].investors = newInvestors;
      }
    }
    return expert;
  },

  // Given an investor, category, and expertId, remove investments in that expert
  // Reimburse the investor for the valuation of those investments
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
            // Give the investor the valuation
            investor.portfolio[j].reps += investment.valuation;
          } else {
            newInvestments.push(investment);
          }
        }
        investor.portfolio[j].investments = newInvestments;
      }
    }
    return investor;
  },

  // Given experts ids invested by an investor
  // For each expert, remove investments from that investor
  updateInvestorsExperts: function(expertIds, categoryName, investorId, cb) {
    // If the list of experts is empty, simply return
    if (expertIds.length === 0) {
      return cb(null);
    }
    var self = this;

    // Update each user
    User.find({ '_id': { $in: expertIds }}, function(err, experts) {
      if (err) {
        return cb(err);
      } else {
        var newExperts = [];
        // Search through each expert's portfolio
        var length = experts.length;
        for (var i = 0; i < length; i++) {
          var expert = experts[i];
          newExperts.push(self.removeInvestor(expert, categoryName, investorId));
        }

        // Finally, save all the modified investors
        self.saveAll(newExperts, function(errs) {
          if (errs.length > 0) {
            return cb(errs);
          } else {
            return cb(null);
          }
        });
      }
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
            return cb(errs);
          } else {
            return cb(null);
          }
        });
      }
    });
  },

  // Get an investor's experts' ids for a given category
  getInvestorsExperts: function(user, categoryName) {
    var expertIds = {};
    var length = user.portfolio.length;
    for (var i = 0; i < length; i++) {
      if (categoryName === user.portfolio[i].category) {
        var len = user.portfolio[i].investments.length;
        for (var j = 0; j < len; j++) {
          var id = user.portfolio[i].investments[j].userId;
          if (!(id in expertIds)) {
            expertIds[id] = true;
          }
        }
      }
    }
    var ids = [];
    for (var key in expertIds) {
      ids.push(key);
    }
    return ids;
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

  // Delete an investor category
  deleteInvestorCategory: function(user, categoryName) {
    var length = user.portfolio.length;
    var newPortfolio = [];
    for (var i = 0; i < length; i++) {
      if (categoryName !== user.portfolio[i].category) {
        newPortfolio.push(user.portfolio[i]);
      }
    }
    user.portfolio = newPortfolio;
    return user;
  },

  // Delete an expert category
  deleteExpertCategory: function(user, categoryName) {
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

  // Validate the inputs for /users/:categoryName/leaders/:count
  validateLeadersCountInputs: function(req) {
    if (isNaN(parseInt(req.params.count))) {
      return false;
    }
    return true;
  },

  // Validate inputs for /users/:user_id/expert
  validateAddExpertCategoryInputs: function(req) {
    if (!req.body || !req.body.name ) {
      return false;
    }
    return true;
  },

  // Validate inputs for /users/:user_id/investor
  validateAddInvestorCategoryInputs: function(req) {
    if (!req.body || !req.body.category) {
      return false;
    }
    return true;
  },

  // Validate an array of user links
  validateUserLinks: function(links) {
    var length = links.length;
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
    // Check that all of the inputs are presemnt
    if (!req.body.name ||
        !req.body.ownerName ||
        !req.body.quotes) {
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

    // Check that the amount is a valid integer
    var amount = Number(req.body.amount);
    if (isNaN(amount) || amount % 1 !== 0) {
      return false;
    }

    // Check that there a revoke has an associated id
    if (amount < 0 && !req.body.id) {
      return false;
    }
    return true;
  },

  // Sort users by ROI for a given category, increasing order
  getROIComparator: function(category) {
    return function(a, b) {
      var indexA = this.getPortfolioIndex(a, category);
      var indexB = this.getPortfolioIndex(b, category);

      var roiA = a.portfolio[indexA].roi.value;
      var roiB = b.portfolio[indexB].roi.value;
      return roiA - roiB;
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
  getDirectScoreComparator: function(category) {
    return function(a, b) {
      var indexA = this.getCategoryIndex(a, category);
      var indexB = this.getCategoryIndex(b, category);

      var percentileA = a.categories[indexA].percentile;
      var percentileB = b.categories[indexB].percentile;

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
  addInvestorToExpertCategory: function(expert, investorId, investorName, i) {
    var length = expert.categories[i].investors.length;
    for (var j = 0; j < length; j++) {
      if (String(expert.categories[i].investors[j].id) === String(investorId)) {
        return expert;
      }
    }
    var newInvestor = { id: investorId, name: investorName };
    expert.categories[i].investors.push(newInvestor);
    return expert;
  },

  // Update an investor making an investment for a given category,
  // Returns null if the investment is not possible
  updateInvestorPortfolio: function(portfolio, category, toUser, amount, toUserCategoryTotal, id) {
    // Find the portfolio entry that should be updated
    var index = -1;
    var length = portfolio.length;
    for (var i = 0; i < length; i++) {
      if (portfolio[i].category === category) {
        var investments = portfolio[i].investments;
        index = i;
        break;
      }
    }

    // The from user is not an investor for this category (ERROR!)
    if (index === -1) {
      return null;
    }

    // Add the investment to the portfolio
    if (amount > 0) {
      var investment = { userId     : toUser.id,
                         user       : toUser.name,
                         amount     : amount,
                         valuation  : amount,
                         percentage : Number(amount/toUserCategoryTotal * 100) };

      portfolio[index].investments.push(investment);
      portfolio[index].reps -= amount;
    // Otherwise, the investment is a revoke
    } else {
      var j = -1;
      var length = portfolio[index].investments.length;
      for (var i = 0; i < length; i++) {
        if (String(portfolio[index].investments[i]._id) ===  String(id)) {
          j = i;
          break;
        }
      }

      // The investor is trying to revoke an investment that was not found (ERROR!)
      if (j === -1) {
        return null;
      }

      amount *= -1;
      var investment = portfolio[index].investments[j];
      var prevAmount = investment.amount;

      // Revenue is the fraction sold times the valuation
      var revenue = Math.floor(amount/prevAmount * investment.valuation);
      var roi = (revenue - amount)/amount;

      // Adjust the investor's reps
      portfolio[index].reps += revenue;

      // Update the amount
      investment.amount -= amount;

      // If the amount is now zero, remove the investment
      if (investment.amount === 0) {
        portfolio[index].investments.splice(j, 1);
        return portfolio;
      }

      // OldTotal/OldPercentage = newTotal/newPercentage (Proportional)
      investment.percentage = Math.floor((investment.amount * investment.percentage)/prevAmount);

      // New valuation is the portion of the old percentage times category total
      investment.valuation = Math.floor(toUserCategoryTotal * investment.percentage/100);

      // Update the date
      investment.timeStamp = Date.now();

      portfolio[index].investments[j] = investment;
      portfolio[index].roi = this.updateROI(portfolio[index].roi, amount * roi);
    }
    return portfolio;
  },

  // Given a transaction, update all of the percentages for investors
  updateInvestorPercentagesAndValuations: function(investors, expertCategoryTotal, category, username) {
    var investor, j, errs;
    var length = investors.length;
    for (var i = 0; i < length; i++) {
      j = -1;
      investor = investors[i];
      j = this.getPortfolioIndex(investor, category);
      if (j === -1) {
        continue;
      }

      var len = investor.portfolio[j].investments.length;
      for (var q = 0; q < len; q++) {
        var investment = investor.portfolio[j].investments[q];
        if (investment.user === username) {

          // Reset the percentage
          investment.percentage = 100 * investment.amount/expertCategoryTotal;

          // Reset the valuation
          investment.valuation = Math.floor(investment.percentage/100 * expertCategoryTotal);
          investor.portfolio[j].investments[q] = investment;
        }
      }
    }
    return investors;
  },

  // Given a revoke that just happened, update roi
  updateROI: function(oldROI, roiFromRevoke) {
    var newLen = oldROI.length + 1;
    var newVal = (((oldROI.value * oldROI.length + roiFromRevoke)/(newLen)).toFixed(2))/1;
    return { length: newLen, value: newVal };
  },

  // Given a list of investors, update their percentiles
  getInvestorPercentiles: function(investors, category, cb) {
    // Calculates the percentage for a value
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

    // Each unique reps value will have a unique percentage
    var prevROI = investors[0].portfolio[index].roi.value;
    percentileDict[prevROI] = formula(l, s, length);

    for (var i = 1; i < length; i += 1) {
      index = this.getPortfolioIndex(investors[i], category);
      if (index === -1) {
        return cb('Could not find portfolio index for user ' + investors[i].username);
      }
      indexDict[investors[i]._id] = index;

      // If we have seen this value before, increment s
      // Otherwise, we know there are s more numbers less than the current
      //  In that case, we increment l by s and set s back to 1
      var currROI = investors[i].portfolio[index].roi.value;
      if (currROI === prevROI) {
        s += 1;
      } else {
        l += s;
        s = 1;
      }

      //Reset the percentile for the given reps value
      percentileDict[currROI] = formula(l, s, length);
      prevROI = currROI;
    }

    // Go through the results and reset all of the percentiles
    for (var i = 0; i < length; i++) {
      var j = indexDict[investors[i]._id];
      var roiVal = investors[i].portfolio[j].roi.value;
      var percentile = percentileDict[roiVal];
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

  // Given a category name, update the percentiles, percentages, and valuations for all investors
  updateInvestors: function(category, cb, username, expertCategoryTotal) {
    var self = this;
    var investorsPromise = User.findInvestorByCategory(category, function() {});
    investorsPromise.then(function(investors) {

      // If parameters are avaiable, update all the investor percentages and valuations
      if (username && expertCategoryTotal) {
        investors = self.updateInvestorPercentagesAndValuations(investors, expertCategoryTotal, category, username);
      }

      // Sort the investors by roi in increasing order
      var roiComparator = self.getROIComparator(category);
      investors.sort(roiComparator);
      self.getInvestorPercentiles(investors, category, function(err) {
        if (err) {
          return cb(err);
        }
        self.saveAll(investors, function(errs) {
          if (errs.length > 0) {
            return cb(errs);
          } else {
            return cb(null);
          }
        });
      });
    }, function(err) {
      return cb(err);
    });
  },

  // Given a category name, update the percentiles for all the experts in that category
  updateExpertPercentiles: function(category, cb) {
    var self = this;
    var expertsPromise = User.findExpertByCategory(category, function() {});
    expertsPromise.then(function(experts) {
      var repsComparator = self.getRepsComparator(category);
      experts.sort(repsComparator);
      self.getExpertPercentiles(experts, category, function(err) {
        if (err) {
          return cb(err);
        }
        self.saveAll(experts, function(errs) {
          if (errs.length > 0) {
            return cb(errs);
          } else {
            return cb(null);
          }
        });
      });
    }, function(err) {
      return cb(err);
    });
  },

  generateVerificationToken: function() {

    // Generate the token using rand and the username
    return crypto.randomBytes(12).toString('hex');
  },

  generateVerificationEmailOptions: function(email, randomString) {
    var url = urlConfig[process.env.NODE_ENV] + "#/verify/" + randomString;
    return {
      from: verificationEmailConfig.from,
      to: email,
      subject: verificationEmailConfig.subject,
      text: nodeUtil.format(verificationEmailConfig.text, url),
    };
  },

};

module.exports = utils;
