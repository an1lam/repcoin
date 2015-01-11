var utils = require('./utils.js');

module.exports = function(agenda) {
  agenda.define('incrementInvestorReps', utils.incrementInvestorReps);
  agenda.define('setPreviousPercentileToCurrent', utils.setPreviousPercentileToCurrent);
  agenda.define('payDividends', utils.payDividends);

  agenda.every('0 0 * * *', 'incrementInvestorReps');
  agenda.every('0 0 * * *', 'setPreviousPercentileToCurrent');
  agenda.every('0 0 * * *', 'payDividends');
};
