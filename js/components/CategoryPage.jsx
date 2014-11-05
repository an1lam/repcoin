/** @jsx React.DOM */
"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var CategoryPageHeader = require('./CategoryPageHeader.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var LeaderTable = require('./LeaderTable.jsx');
var React = require('react');
var Toolbar = require('./Toolbar.jsx');

var CategoryPage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    PubSub.subscribe('userupdate', this.resetCurrentUser);
    this.setCategory(this.props.params.category);
    this.resetCurrentUser();
  },

  componentWillReceiveProps: function(newProps) {
    this.setCategory(newProps.params.category);
  },

  setCurrentUser: function(currentUser) {
    this.setState({ currentUser: currentUser });
  },

  resetCurrentUser: function() {
    auth.getCurrentUser.call(this, this.setCurrentUser);
  },

  setCategory: function(category) {
    var url = 'api/categories/' + category;
    $.ajax({
      url: url,
      success: function(category) {
        this.setState({ category: category });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.params.category, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var categoryPageHeader = '';
    if (this.state.category && this.state.currentUser) {
      categoryPageHeader = <CategoryPageHeader category={this.state.category} currentUser={this.state.currentUser} />;
    }
    return (
      <div>
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          {categoryPageHeader}
        </div>
        <div className="row">
          <div className="col-md-3">
            <LeaderTable category={this.props.params.category} />
          </div>
          <div className="col-md-8">
            <Feed category={this.props.params.category} parent="CategoryPage" />
          </div>
        </div>
        <div className="row">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = CategoryPage;
