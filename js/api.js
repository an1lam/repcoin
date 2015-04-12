var $ = require('jquery');

var ServerActionCreator = require('./actions/RepcoinServerActionCreator.js');
var strings = require('./lib/strings_utils.js');

module.exports = {
  getCurrentCategory: function(category) {
    $.ajax({
      url: '/api/categories/' + category ,
      success: ServerActionCreator.receiveCurrentCategory,
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        ServerActionCreator.receiveCurrentCategoryError(xhr.reponseText);
      }
    });
  },

  getCategories: function() {
    $.ajax({
      url: '/api/categories',
      success: ServerActionCreator.receiveCategories,
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }
    });
  },

  getCurrentUserAndNotifications: function() {
    $.ajax({
      url:  '/api/user',
      success: function(user) {
        var url = '/api/notifications/user/' + user._id + '/unread';
        $.ajax({
          url: url,
          success: function(notifications) {
            ServerActionCreator.receiveCurrentUserAndNotifications(
              user, notifications);
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(xhr.responseText);
          }.bind(this)
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        ServerActionCreator.receiveCurrentUser(null);
      }.bind(this)
    });
  },

  getNotifications: function(userId) {
    var url = '/api/notifications/user/' + userId + '/unread';
    $.ajax({
      url: url,
      success: ServerActionCreator.receiveNotifications,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  getCurrentUser: function() {
    $.ajax({
      url:  '/api/user',
      success: ServerActionCreator.receiveCurrentUser,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        ServerActionCreator.receiveCurrentUser(null);
      }.bind(this)
    });
  },

  getLoggedIn: function() {
    $.ajax({
      url:  '/api/loggedin',
      success: ServerActionCreator.receiveLoggedIn,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
        ServerActionCreator.receiveLoggedIn(false);
      }.bind(this)
    });
  },

  setNotificationsRead: function(currentUserId, notificationIds) {
    var url = '/api/notifications/user/' + currentUserId + '/markread';
    var data = { notificationIds: notificationIds };
    $.ajax({
      url: url,
      type: 'PUT',
      data: data,
      success: ServerActionCreator.receiveNotificationsRead,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }
    });
  },

  getTotalRepsTraded: function() {
    $.ajax({
      url: '/api/transactions/totaltraded',
      success: ServerActionCreator.receiveTotalTraded,
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }
    });
  },

  signUpUser: function(data) {
    $.ajax({
      url: '/api/users',
      type: 'POST',
      data: data,
      success: ServerActionCreator.verificationEmailSent,
      error: function(xhr, status, err) {
        if (xhr.responseText !== 'Error') {
          ServerActionCreator.signUpFailed(xhr.responseText);
        }
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  loginUser: function(email, password) {
    $.ajax({
      type: 'POST',
      url: '/api/login',
      data: {
        email: email,
        password: password
      },
      success: ServerActionCreator.receiveCurrentUserAndLogin,
      error: function(xhr, status, err) {
        ServerActionCreator.loginFailed(xhr.responseText);
      }.bind(this)
    });
  },

  logoutUser: function() {
    $.ajax({
      url: 'api/logout',
      type: 'POST',
      success: ServerActionCreator.logoutUser,
      error: function(xhr, status, err) {
        ServerActionCreator.logoutFailed(xhr.responseText);
      }.bind(this),
    });
  },

  sendPasswordResetEmail: function(email) {
    $.ajax({
      type: 'POST',
      url: '/api/users/sendPasswordResetEmail',
      data: {
        'email': email
      },

      success: function() {
        ServerActionCreator.passwordResetEmailSent(email);
      }.bind(this),
      error: function(xhr, status, err) {
        ServerActionCreator.passwordResetEmailFailed(xhr.responseText);
      }.bind(this)
    });
  },

  getHotCategoriesAndUsers: function() {
    $.ajax({
      url: '/api/categories/hot',
      success: ServerActionCreator.receiveHotCategoriesAndUsers,
      error: function(xhr, status, err) {
        ServerActionCreator.receiveHotCategoriesAndUsersError(
          xhr.responseText);
      }.bind(this)
    });
  },

  setViewedUser: function(userId) {
    $.ajax({
      url: '/api/users/' + userId,
      success: ServerActionCreator.receiveViewedUser,
      error: function(xhr, status, err) {
        console.error(userId, status, err.toString());
      }.bind(this)
    });
  },

  deleteExpertCategory: function(userId, categoryName) {
    var url = '/api/users/' + userId + '/' + categoryName + '/expert/delete';
    $.ajax({
      url: url,
      type: 'PUT',
      success: ServerActionCreator.categoryDeleted,
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  addExpertCategory: function(userId, name, context) {
    $.ajax({
      url: '/api/users/' + userId + '/addexpert/' + name,
      type: 'PUT',
      success: function(user) {
        var msg;

        // If the user was not returned, the category is waiting approval
        if (!user) {
          context.setMessage(strings.EXPERT_CATEGORY_PENDING(name), true);
          context.onReset();
        } else {
          context.setMessage(strings.NOW_AN_EXPERT(name), true);
          context.onReset();
          ServerActionCreator.receiveViewedUser(user);

        }

      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText === 'Already an expert') {
          context.setMessage(strings.ALREADY_AN_EXPERT(name), true);
        } else if (xhr.responseText === 'Inappropriate content detected.') {
          context.setMessage(strings.INAPPROPRIATE_CATEGORY, true);
        }

        console.error(status, err.toString());
        this.props.onReset();
      }.bind(this)
    });
  },

  addInvestorCategory: function(userId, name, context) {
    $.ajax({
      url: '/api/users/' + userId + '/addinvestor/' + name,
      type: 'PUT',
      success: function(user) {
        // If the user was not returned, the category is waiting approval
        if (!user) {
          context.setMessage(strings.INVESTOR_CATEGORY_PENDING(name), false);
          context.onReset();
        } else {
          context.setMessage(strings.NOW_AN_INVESTOR(name), false);
          context.onReset();
          ServerActionCreator.receiveViewedUser(user);
        }

        // this.props.setMessage(msg, false);
        // this.props.onReset();
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText === 'Already an investor') {
          context.setMessage(strings.ALREADY_AN_INVESTOR(name), false);
        } else if (xhr.responseText === 'Inappropriate content detected.') {
          context.setMessage(strings.INAPPROPRIATE_CATEGORY, false);
        }

        console.error(status, err.toString());
        context.onReset();
      }.bind(this)
    });
  },

  getInvestors: function(idList, categoryName) {
    var url = '/api/users/list/byids';
    var data = { idList: idList };
    $.ajax({
      url: url,
      data: data,
      success: function(investors) {
        ServerActionCreator.receiveInvestors(categoryName, investors);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText, err.toString());
      }.bind(this)
    });
  },

  facebook: {
    authorize: function(hash, id) {
      function responseHandler(res) {
        if (res.status === 'connected') {
          this.loginUser(res.authResponse.accessToken, hash, id);
        } else if (res.status === 'not_authorized') {
          ServerActionCreator.signUpFailed(
            strings.FACEBOOK_UNAUTHORIZED_CREDENTIALS);
        } else {
          ServerActionCreator.signUpFailed(
            strings.ERROR_LOGGING_INTO_FACEBOOK);
        }
      }

      FB.login(
        responseHandler.bind(this), { scope: 'email', return_scopes: true });
    },

    loginUser: function(accessToken, hash, id) {
      $.ajax({
        url: '/api/login/facebook',
        type: 'POST',
        data: {
          access_token: accessToken,
          hash: hash,
          inviterId: id
        },
        success: function(user) {
          // Only rewrite the picture if it is not there
          if (!user.picture) {
            this.getFacebookProfilePicture(user);
          }

          ServerActionCreator.receiveCurrentUserAndLogin(user);
        }.bind(this),
        error: function(xhr, status, err) {
          if (xhr.responseText !== 'Error') {
            ServerActionCreator.signUpFailed(xhr.responseText);
          } else {
            ServerActionCreator.signUpFailed(
              'Unspecified Error occurred');
          }
          console.error(xhr.responseText);
        }.bind(this)
      });
    },

    getFacebookProfilePicture: function(user) {
      FB.api('/me/picture',
        {
          'redirect': false,
          'type': 'normal',
          'width': 200,
          'height': 200
        },
        function (response) {
          if (response && !response.error) {
            this.saveFacebookPhoto(user, response.data.url);
          }

        }.bind(this)
      );
    },

    saveFacebookPhoto: function(user, link, cb) {
      var url = '/api/users/'+ user._id;

      // Mark facebook pictures as such with the special public_id
      user.picture = { url: link, public_id: 'FACEBOOK' };
      $.ajax({
        url: url,
        type: 'PUT',
        data: user,
        error: function(xhr, status, err) {
          console.error(status, err.toString());
        }.bind(this)
      });
    }
  }
};
