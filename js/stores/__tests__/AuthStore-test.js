jest.dontMock('../../constants/RepcoinConstants.js');
jest.dontMock('../AuthStore.js');
jest.dontMock('../../lib/strings_utils.js')
jest.dontMock('object-assign');
jest.dontMock('keymirror');
jest.dontMock('react/lib/merge');


describe('CategoriesStore', function() {

  var RepcoinConstants = require('../../constants/RepcoinConstants.js');
  var AppDispatcher;
  var AuthStore;
  var cb;

  var actionReceiveCurrentUser = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS,
      user: {username: 'Test User'},
      notifications: [],
    }
  };

  var actionReceiveLoggedIn = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_LOGGED_IN,
      loggedIn: true
    }
  }

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

  it('gets the current user after it\'s received from the server', function() {
    callback(actionReceiveCurrentUser);
    var user = AuthStore.getCurrentUser();
    expect(user).toEqual({username: 'Test User'});
  })

  it('gets loggedIn after it\'s received from the server', function() {
    callback(actionReceiveLoggedIn);
    var loggedIn = AuthStore.getLoggedIn();
    expect(loggedIn).toEqual(true);
  })
});
