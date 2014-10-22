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
    return { user: { categories: [], links: [], username: '' } };
  },

  updateUser: function() {
    this.setUser('/api/users/' + this.props.params.userId);
  },

  componentWillReceiveProps: function(newProps) {
    this.setUser('/api/users/' + newProps.params.userId);
  },

  componentDidMount: function() {
    PubSub.subscribe('profileupdate', this.updateUser);
    this.updateUser();
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
    var feed = this.state.user._id ? <Feed userId={this.state.user._id} filter={"all"} /> : '';
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
            <div className="col-md-4 profilePageCategoriesTable"><CategoriesTable categories={this.state.user.categories} /></div>
            <div className="col-md-7 profilePageFeed">
              <div className="profileDonationBox"><DonationBox user={this.state.user} /></div>
            {feed}
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
