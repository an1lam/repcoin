var api = require('../api.js');
var RepcoinAppDispatcher = require('../dispatcher/RepcoinAppDispatcher.js');
var RepcoinConstants = require('../constants/RepcoinConstants.js');
var strings = require('../lib/strings_utils.js');

var ActionTypes = RepcoinConstants.ActionTypes;

module.exports = {
  forgotPassword: function() {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.FORGOT_PASSWORD
    });
  },

  // This method gets both notifications and the current user
  // because it's the best way within the Flux architecture to
  // get notifications AFTER we get the current user
  getCurrentUserAndNotifications: function() {
    api.getCurrentUserAndNotifications();
  },

  getCurrentUser: function() {
    api.getCurrentUser();
  },

  getLoggedIn: function() {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.GET_LOGGED_IN
    });

    api.getLoggedIn();
  },

  toggleShowLogin: function() {
    RepcoinAppDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_SHOW_LOGIN
    });
  },

  signUpUser: function(
    firstname, lastname, email, email2, password, password2, hash, id) {
    var error = null;
    if (!firstname || !lastname || !email || !email2 || !password || !password2) {
      error = strings.FIELDS_BLANK;
    }

    if (email !== email2) {
      error = strings.EMAILS_DO_NOT_MATCH;
    }

    if (password !== password2) {
      error = strings.PASSWORDS_DO_NOT_MATCH;
    }

    if (error) {
      RepcoinAppDispatcher.handleViewAction({
        type: ActionTypes.SIGN_UP_FAILED,
        error: error
      });
    } else {
      var data = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        hash: hash,
        invitedId: id
      };

      RepcoinAppDispatcher.handleViewAction({
        type: ActionTypes.SIGN_UP_USER,
        data: data
      });

      api.signUpUser(data);
    }

  },

  loginUser: function(email, password) {
    api.loginUser(email, password);
  },

  logoutUser: function() {
    api.logoutUser();
  },

  loginWithFacebook: function(hash, id) {
    api.facebook.authorize(hash, id);
  },

  sendPasswordResetEmail: function(email) {
    api.sendPasswordResetEmail(email);
  },

  deleteExpertCategory: function(userId, categoryName) {
    api.deleteExpertCategory(userId, categoryName);
  },

  addExpertCategory: function(userId, name, context) {
    api.addExpertCategory(userId, name, context);
  },

  addInvestorCategory: function(userId, name, context) {
    api.addInvestorCategory(userId, name, context);
  }

};
