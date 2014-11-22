"use strict";

var Category = require('../models/Category.js');
var Transaction = require('../models/Transaction.js');
var User = require('../models/User.js');

var utils = {
  // Save an array of documents
  saveAll: function(docs, cb) {
    var errs = [];
    var done = 0;
    for (var i = 0; i < docs.length; i++) {
      docs[i].save(function(err) {
        if (err) {
          errs.push(err);
        }
        done++;

        if (done === docs.length) {
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
      if (expert.categories[i].investors[j].id === investorId) {
        return expert;
      }
    }
    var newInvestor = { id: investorId, name: investorName };
    expert.categories[i].investors.push(newInvestor);
    return expert;
  },

  // Update an investor making an investment for a given category,
  // Returns null if the investment is not possible
  updateInvestorPortfolio: function(portfolio, category, toUser, amount, toUserCategoryTotal) {
    // Find the portfolio entry that should be updated
    var indexI = -1;
    var indexJ = -1;
    var length = portfolio.length;
    for (var i = 0; i < length; i++) {
      if (portfolio[i].category === category) {
        var investments = portfolio[i].investments;
        indexI = i;
        for (var j = 0; j < investments.length; j++) {
          if (investments[j].user === toUser.name) {
            indexJ = j;
          }
        }
      }
    }

    // The from user is not an investor for this category (ERROR!)
    if (indexI === -1) {
      return null;
    }
    // The from user has never invested in this user before
    if (indexJ === -1) {
      var investment = { userId     : toUser.id,
                         user       : toUser.name,
                         amount     : amount,
                         valuation  : amount,
                         percentage : Number(amount/toUserCategoryTotal * 100) };
      portfolio[indexI].investments.push(investment);
    } else {
      // Update the existing investment
      var investment = portfolio[indexI].investments[indexJ];
      var roiForRevoke = (investment.valuation - investment.amount)/investment.amount;
      investment.amount += amount;
      investment.percentage = Number(investment.amount/toUserCategoryTotal * 100)
      var valuation = investmentpercentage/100 * toUserCategoryTotal;
      investment.valuation = Math.floor(valuation);
      portfolio[indexI].investments[indexJ] = investment;

      // Update the roi for this category if we made a revoke
      if (amount < 0) {
        portfolio[indexI].roi = this.updateROI(portfolio[indexI].roi, amount * -1 * roiForRevoke);
      }
    }

    // Update the portfolio entry for this category
    portfolio[indexI].repsAvailable -= amount;
    return portfolio;
  },

  // Given a revoke that just happened, update roi
  updateROI: function(oldROI, revoke) {
    var newLen = oldROI.length + 1;
    var newVal = (oldROI.value * old.length + revoke)/(newLen);
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
      return cb("Could not find portfolio index for user " + investors[0].username);
    }
    indexDict[investors[0]._id] = index;

    // Each unique reps value will have a unique percentage
    var prevROI = investors[0].portfolio[index].roi.value;
    percentileDict[prevROI] = formula(l, s, length);

    for (var i = 1; i < length; i += 1) {
      index = this.getPortfolioIndex(investors[i], category);
      if (index === -1) {
        return cb("Could not find portfolio index for user " + investors[i].username);
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
      cb("Could not find category index for user " + experts[0].username);
    }
    indexDict[experts[0]._id] = index;

    // Each unique reps value will have a unique percentage
    percentileDict[experts[0].categories[index].reps] = formula(l, s, length);

    for (var i = 1; i < length; i += 1) {
      index = this.getCategoryIndex(experts[i], category);
      if (index === -1) {
        cb("Could not find category index for user " + experts[i].username);
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
      experts[i].categories[j].directScore = percentile;
    }
    cb(null);
  },

  // Given a category name, update the percentiles for all the investors in that category
  updateInvestorPercentiles: function(category, cb) {
    var self = this;
    var investorsPromise = User.findInvestorByCategoryIncOrder(category, function() {});
    investorsPromise.then(function(investors) {
      self.getInvestorPercentiles(investors, category, function(err) {
        if (err) {
          cb("Error calculating investor percentiles");
        }
        self.saveAll(investors, function(errs) {
          if (errs.length > 0) {
            cb(errs);
          } else {
            cb(null);
          }
        });
      });
    }, function(err) {
      cb(err);
    });
  },

  // Given a category name, update the percentiles for all the experts in that category
  updateExpertPercentiles: function(category, cb) {
    var self = this;
    var expertsPromise = User.findExpertByCategoryIncOrder(category, function() {});
    expertsPromise.then(function(experts) {
      self.getExpertPercentiles(experts, category, function(err) {
        if (err) {
          cb(err);
        }
        self.saveAll(experts, function(errs) {
          if (errs.length > 0) {
            cb(errs);
          } else {
            cb(null);
          }
        });
      });
    }, function(err) {
      cb(err);
    });
  }
};

module.exports = utils;
