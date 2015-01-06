var utils = require('./utils.js');

module.exports = function(agenda) {
  agenda.define('incrementInvestorReps', utils.incrementInvestorReps);

  agenda.define('setPreviousPercentileToCurrent', utils.setPreviousPercentileToCurrent);

  agenda.every('0 0 * * *', 'incrementInvestorReps');
  agenda.every('0 0 * * *', 'setPreviousPercentileToCurrent');
};
