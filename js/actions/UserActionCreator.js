var api = require('../api.js');

module.exports = {
  setViewedUser: function(userId) {
    api.setViewedUser(userId);
  },

  getInvestors: function(idList, categoryName) {
    api.getInvestors(idList, categoryName);
  }
};
