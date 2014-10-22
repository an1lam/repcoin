/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var ProfileBox = require('./ProfileBox.jsx');
var Footer = require('./Footer.jsx');
var Feed = require('./Feed.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
var DonationBox = require('./DonationBox.jsx');
var $ = require('jquery');
var PubSub = require('pubsub-js');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');

var ProfilePage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return { user: {} };
  },

  updateUser: function(userId) {
    this.setUser('/api/users/' + userId);
  },

  componentDidMount: function() {
    PubSub.subscribe('profileupdate', this.updateUser(this.props.params.userId));
    this.updateUser(this.props.params.userId);
  },

  componentWillReceiveProps: function(newProps) {
    this.updateUser(newProps.params.userId);
  },

  setUser: function(url) {
    $.ajax({
      url: url,
      success: function(user) {
        this.setState({ user: user });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.userId, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var filter = "all";
    return (
      <div className="profilePage container-fluid">
        <div id="header">
          <Toolbar />
        </div>
        <div id="content">
          <div className="row">
            <ProfileBox user={this.state.user} />
          </div>
          <div className="row">
            <div className="col-md-4 profilePageCategoriesTable"><CategoriesTable userId={this.props.params.userId} /></div>
            <div className="col-md-7 profilePageFeed">
              <div className="profileDonationBox"><DonationBox userId={this.props.params.userId} /></div>
            <Feed userId={this.props.params.userId} filter={filter} />
            </div>
          </div>
          <div className="row">
            <div className="profilePageFooter"><Footer /></div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProfilePage;
