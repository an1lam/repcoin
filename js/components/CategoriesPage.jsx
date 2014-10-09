/** @jsx React.DOM */
"use strict";

var $ = require('jquery');
var React = require('react');
var CategoriesList = require('./CategoriesList.jsx');

var mockedUpCategories = [
  {
    "title": "Haxxing",
    "quotes": [
      "I like to hack into computers while I drink chocolate milk",
      "I've been a hacker since before I could walk"
    ]
  },
  {
    "title": "Reading",
    "quotes": [
      "Reading is like a box of chocolates",
      "I love books more than my wife"
    ]
  }

];

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
