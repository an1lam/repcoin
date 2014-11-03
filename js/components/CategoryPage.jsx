/** @jsx React.DOM */
"use strict";

var $ = require('jquery');
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
    this.setCategory(this.props.params.category);
  },

  componentWillReceiveProps: function(newProps) {
    this.setCategory(newProps.params.category);
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
    var categoryPageHeader = this.state.category ? <CategoryPageHeader category={this.state.category} /> : '';
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
