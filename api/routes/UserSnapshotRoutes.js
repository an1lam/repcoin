'use strict';

// Handlers
var UserSnapshotHandler = require('../handlers/usersnapshot.js');

module.exports = function(router) {
  router.get('/usersnapshots/:user_id/:category/expert/reps', UserSnapshotHandler.userId.category.expert.reps.get);
  router.get('/usersnapshots/:user_id/:category/expert/ranks', UserSnapshotHandler.userId.category.expert.ranks.get);
  router.get('/usersnapshots/:user_id/:category/expert/volume', UserSnapshotHandler.userId.category.expert.volume.get);
  router.get('/usersnapshots/:user_id/:category/investor/percentreturns', UserSnapshotHandler.userId.category.investor.percentreturns.get);
  router.get('/usersnapshots/:user_id/:category/investor/dividends', UserSnapshotHandler.userId.category.investor.dividends.get);
  router.get('/usersnapshots/:user_id/:category/investor/ranks', UserSnapshotHandler.userId.category.investor.ranks.get);
};
