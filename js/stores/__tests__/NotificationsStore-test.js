jest.dontMock('../../constants/RepcoinConstants.js');
jest.dontMock('../NotificationsStore.js');
jest.dontMock('../../lib/strings_utils.js')
jest.dontMock('object-assign');
jest.dontMock('keymirror');
jest.dontMock('react/lib/merge');


describe('NotificationsStore', function() {

  var RepcoinConstants = require('../../constants/RepcoinConstants.js');
  var AppDispatcher;
  var NotificationsStore;
  var cb;

  var actionReceiveCurrentUserAndNotifications = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_CURRENT_USER_AND_NOTIFICATIONS,
      user: {username: 'Test User'},
      notifications: [{_id: 'id', user: {'name': 'foo'}, message: 'I\'m a notification'}],
    }
  };

  var actionReceiveNotificationsRead = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_NOTIFICATIONS_READ
    }
  };

  var actionToggleNotificationsDisplay = {
    source: RepcoinConstants.PayloadSources.VIEW_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.TOGGLE_NOTIFICATIONS_DISPLAY
    }
  }

  beforeEach(function() {
    AppDispatcher = require('../../dispatcher/RepcoinAppDispatcher');
    NotificationsStore = require('../NotificationsStore');
    callback = AppDispatcher.register.mock.calls[0][0];
  });

  it('registers a callback with the dispatcher', function() {
    expect(AppDispatcher.register.mock.calls.length).toBe(1);
  });

  it('initializes with no notifications', function() {
    var notifications = NotificationsStore.getAll();
    expect(notifications).toEqual([]);
  });

  it('gets the notifications received from the server', function() {
    callback(actionReceiveCurrentUserAndNotifications);
    var notifications = NotificationsStore.getAll();
    expect(notifications.length).toBe(1);
    expect(notifications[0].user.name).toEqual('foo');
  });

  it('returns the notification\'s Ids correctly', function() {
    callback(actionReceiveCurrentUserAndNotifications);
    var notificationIds = NotificationsStore.getAllIds();
    expect(notificationIds.length).toBe(1);
    expect(notificationIds[0]).toEqual('id');
  });

  it('marks all of the notifications as read once the server knows ' +
    'they\'ve been read', function() {
    callback(actionReceiveCurrentUserAndNotifications);
    var notifications1 = NotificationsStore.getAll();
    expect(notifications1.length).toEqual(1);
    callback(actionReceiveNotificationsRead);
    var notifications2 = NotificationsStore.getAll();
    expect(notifications2.length).toEqual(0);

  })

});
