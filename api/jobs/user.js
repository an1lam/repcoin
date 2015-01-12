var utils = require('./utils.js');

module.exports = function(agenda) {
  // Jobs scheduled to run nightly
  agenda.define('incrementInvestorReps', utils.incrementInvestorReps);
  agenda.define('setPreviousPercentileToCurrent', utils.setPreviousPercentileToCurrent);
  agenda.define('payDividends', utils.payDividends);

  agenda.every('0 0 * * *', 'incrementInvestorReps');
  agenda.every('0 0 * * *', 'setPreviousPercentileToCurrent');
  agenda.every('0 0 * * *', 'payDividends');

  // Migrations
  agenda.define('migratePercentagesAndDividends', utils.migratePercentagesAndDividends);
  agenda.now('migratePercentagesAndDividends');
};
