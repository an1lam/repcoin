'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var PortfolioTable = require('./PortfolioTable.jsx');
var ProfileBox = require('./ProfileBox.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var Toolbar = require('./Toolbar.jsx');

var ProfilePage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return {};
  },

  updateUser: function() {
    this.setUser('/api/users/' + this.props.params.userId);
  },

  setCurrentUser: function(currentUser) {
    this.setState({ currentUser: currentUser });
  },

  resetCurrentUser: function() {
    auth.getCurrentUser.call(this, this.setCurrentUser);
  },

  componentWillReceiveProps: function(newProps) {
    this.setUser('/api/users/' + newProps.params.userId);
  },

  componentDidMount: function() {
    PubSub.subscribe('profileupdate', this.updateUser);
    PubSub.subscribe('profileupdate', this.resetCurrentUser);
    this.resetCurrentUser();
    this.updateUser();
  },

  componentWillUnmount: function () {
    PubSub.unsubscribe('profileupdate', this.updateUser);
    PubSub.unsubscribe('profileupdate', this.resetCurrentUser);
  },

  setUser: function(url) {
    $.ajax({
      url: url,
      success: function(user) {
        if (this.isMounted()) {
          this.setState({ user: user });
        } else {
          console.log("ProfilePage not mounted.");
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.userId, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var categoriesTable = '';
    var feed = '';
    var portfolio = '' ;
    var profileBox = '';

    if (this.state.user && this.state.currentUser) {
      var isSelf = this.state.currentUser._id === this.state.user._id;

      categoriesTable = <CategoriesTable currentUser={this.state.currentUser} user={this.state.user} />;
      feed = <Feed parent="ProfilePage" userId={this.state.user._id} filter={"all"} isSelf={isSelf}/>;
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
  }
});

module.exports = ProfilePage;
