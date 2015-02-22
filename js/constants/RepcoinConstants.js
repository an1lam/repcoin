var keyMirror = require('keymirror');

module.exports = {
  ActionTypes: keyMirror({
    GET_CATEGORIES: null,
    RECEIVE_CATEGORIES: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
};
