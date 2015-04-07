jest.dontMock('../../constants/RepcoinConstants.js');
jest.dontMock('../AuthStore.js');
jest.dontMock('../../lib/strings_utils.js')
jest.dontMock('object-assign');
jest.dontMock('keymirror');
jest.dontMock('react/lib/merge');

describe('CategoriesStore', function() {

  var RepcoinConstants = require('../../constants/RepcoinConstants.js');
  var strings = require('../../lib/strings_utils.js');
  var AppDispatcher;
  var AuthStore;
  var cb;

  beforeEach(function() {
    AppDispatcher = require('../../dispatcher/RepcoinAppDispatcher');
    AuthStore = require('../AuthStore');
    callback = AppDispatcher.register.mock.calls[0][0];
  });

  it('registers a callback with the dispatcher', function() {
    expect(AppDispatcher.register.mock.calls.length).toBe(1);
  });

  it('initializes with no user and logged in as false', function() {
    var user = AuthStore.getCurrentUser();
    var loggedIn = AuthStore.getLoggedIn();
    expect(user).toEqual(null);
    expect(loggedIn).toEqual(false);
  });

  var actionReceiveCurrentUser = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS,
      user: {username: 'Test User', portfolio: []},
      notifications: [],
    }
  };

  it('gets the current user after it\'s received from the server', function() {
    callback(actionReceiveCurrentUser);
    var user = AuthStore.getCurrentUser();
    expect(user).toEqual({
      username: 'Test User',
      portfolio: []
    });
  });

  it('recognizes that the user is a newby', function() {
    callback(actionReceiveCurrentUser);
    expect(AuthStore.isNewby()).toEqual(true);
  });

  var actionReceiveCurrentUserWithPortfolio = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS,
      user: {username: 'Test User', portfolio: [{test: 'test'}]},
      notifications: [],
    }
  }
  it('recognizes that the user is no longer a newby', function() {
    callback(actionReceiveCurrentUserWithPortfolio);
    expect(AuthStore.isNewby()).toEqual(false);
  })

  var actionReceiveLoggedIn = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_LOGGED_IN,
      loggedIn: true
    }
  };

  it('gets loggedIn after it\'s received from the server', function() {
    callback(actionReceiveLoggedIn);
    var loggedIn = AuthStore.getLoggedIn();
    expect(loggedIn).toEqual(true);
  });

  var actionLoginFailed = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.LOGIN_FAILED,
      error: 'Error!'
    }
  };

  it('logs out the user', function() {
    var logout = {
      source: RepcoinConstants.PayloadSources.SERVER_ACTION,
      action: {
        type: RepcoinConstants.ActionTypes.LOGOUT_USER,
      }
    };

    callback(logout);
    expect(AuthStore.getLogoutStatus()).toEqual(null);
    expect(AuthStore.getLogoutStatusError()).toEqual(false);
    expect(AuthStore.getLoggedIn()).toEqual(false);
    expect(AuthStore.getCurrentUser()).toEqual(null);
  });

  it('handles error logging out the user', function() {
    var logoutFailed = {
      source: RepcoinConstants.PayloadSources.SERVER_ACTION,
      action: {
        type: RepcoinConstants.ActionTypes.LOGOUT_FAILED,
        error: 'Error!'
      }
    };

    callback(logoutFailed);
    expect(AuthStore.getLogoutStatus()).toEqual('Error!');
    expect(AuthStore.getLogoutStatusError()).toEqual(true);
  });

  it('handles errors from the server when logging in', function() {
    callback(actionLoginFailed);
    var error = AuthStore.getLoginError();
    var msg = AuthStore.getLoginStatus();
    expect(error).toEqual(true);
    expect(msg).toEqual('Error!');
  });

  var actionForgotPassword = {
    source: RepcoinConstants.PayloadSources.VIEW_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.FORGOT_PASSWORD,
    }
  };

  var actionToggleShowLogin = {
    source: RepcoinConstants.PayloadSources.VIEW_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.TOGGLE_SHOW_LOGIN
    }
  };

  it('toggles forgot password and show login', function() {
    callback(actionForgotPassword);
    callback(actionToggleShowLogin);

    expect(AuthStore.getShowLogin()).toEqual(true);
    expect(AuthStore.getForgotPassword()).toEqual(true);
  });

  var actionVerificationEmailSent = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.VERIFICATION_EMAIL_SENT
    }
  };

  it('alerts the user the verification email has been sent', function() {
    callback(actionVerificationEmailSent);

    expect(AuthStore.getSignUpError()).toEqual(false);
    expect(AuthStore.getSignUpStatus()).toEqual(strings.VERIFICATION_EMAIL_SENT);
  });

  var actionSignUpFailed = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.SIGN_UP_FAILED,
      error: 'Error!'
    }
  };

  it('handles errors from the server when signing up', function() {
    callback(actionSignUpFailed);

    expect(AuthStore.getSignUpError()).toEqual(true);
    expect(AuthStore.getSignUpStatus()).toEqual('Error!');
  });


  var actionSigningUpUser = {
    source: RepcoinConstants.PayloadSources.VIEW_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.SIGN_UP_USER
    }
  };

  it('alerts the user that their account is being validated', function() {
    callback(actionSigningUpUser);

    expect(AuthStore.getSignUpError()).toEqual(false);
    expect(AuthStore.getSignUpStatus()).toEqual(strings.VALIDATING);
  });

  var actionResetUserPasswordSuccess = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.PASSWORD_RESET_EMAIL_SENT,
      email: 'a@b.com'
    }
  };

  var actionResetUserPasswordFail = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.PASSWORD_RESET_EMAIL_FAILED,
      msg: 'Unrecognized email address.'
    }
  };

  it('handles success and failure cases for password reset emails',
    function() {
    callback(actionResetUserPasswordFail);

    expect(AuthStore.getPasswordResetStatus()).toEqual(
      'Unrecognized email address.');
    expect(AuthStore.getPasswordResetError()).toEqual(true);

    callback(actionResetUserPasswordSuccess);
    expect(AuthStore.getPasswordResetStatus()).toEqual(
      'An email has been sent to a@b.com with a link to reset your password.');
    expect(AuthStore.getPasswordResetError()).toEqual(false);
  });
});
