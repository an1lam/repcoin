'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthActionCreator = require('../actions/AuthActionCreator.js');
var AuthStore = require('../stores/AuthStore.js');
var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');
var CategoriesTable = require('./CategoriesTable.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var PortfolioTable = require('./PortfolioTable.jsx');
var ProfileBox = require('./ProfileBox.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var UserActionCreator = require('../actions/UserActionCreator.js');
var UserStore = require('../stores/UserStore.js');

function getStateFromStores() {
  return {
    currentUser: AuthStore.getCurrentUser(),
    user: UserStore.getViewedUser()
  }
}

var ProfilePage = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  updateUser: function() {
    UserActionCreator.setViewedUser(this.props.params.userId);
  },

  resetCurrentUser: function() {
    AuthActionCreator.getCurrentUser();
  },

  componentWillReceiveProps: function(newProps) {
    UserActionCreator.setViewedUser(newProps.params.userId);
  },

  componentDidMount: function() {
    AuthStore.addCurrentUserListener(this._onChange);
    UserStore.addChangeListener(this._onChange);
    AuthActionCreator.getCurrentUser();
    UserActionCreator.setViewedUser(this.props.params.userId);
    CategoriesActionCreator.getCategories();
    PubSub.subscribe('profileupdate', this.updateUser);
    PubSub.subscribe('profileupdate', this.resetCurrentUser);
  },

  componentWillUnmount: function() {
    PubSub.unsubscribe('profileupdate', this.updateUser);
    PubSub.unsubscribe('profileupdate', this.resetCurrentUser);
    AuthStore.removeCurrentUserListener(this._onChange);
    UserStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var categoriesTable = '';
    var feed = '';
    var portfolio = '' ;
    var profileBox = '';

    if (this.state.user) {
      var isSelf = this.state.currentUser && this.state.currentUser._id === this.props.params.userId;
      var isPublicUser = this.state.currentUser ? true : false;
      categoriesTable = <CategoriesTable currentUser={this.state.currentUser} user={this.state.user} />;
      feed = <Feed parent='ProfilePage' userId={this.props.params.userId}
        filter={'all'} isSelf={isSelf} isPublicUser={isPublicUser}/>;

      profileBox = <ProfileBox currentUser={this.state.currentUser} user={this.state.user} />;
      portfolio = <PortfolioTable user={this.state.user} currentUser={this.state.currentUser}/>;
    }

    return (
      <div className="profilePage container-fluid">
        <div id="header">
          <Toolbar />
        </div>
        <div id="content">
          <div className="row profileBox">
            {profileBox}
          </div>
          <div className="row">
            <div className="col-md-6">
              {categoriesTable}
              {portfolio}
            </div>
            <div className="col-md-6">
              {feed}
            </div>
          </div>
          <div className="row">
            <Footer />
          </div>
        </div>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  }
});

module.exports = ProfilePage;
