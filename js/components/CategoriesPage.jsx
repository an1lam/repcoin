/** @jsx React.DOM */
"use strict";

var $ = require('jquery');
var React = require('react');
var CategoriesList = require('./CategoriesList.jsx');

var CategoriesPage = React.createClass({
  getInitialState: function() {
    return { categories : [] };
  },

  componentDidMount: function() {
    $.ajax({
      url : '/api/categories',
      dataType : 'json',
      success: function(categories) {
        this.setState({ categories : categories });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div>
        <CategoriesList categories={this.state.categories} />
      </div>
    );
  }
});

module.exports = CategoriesPage;
