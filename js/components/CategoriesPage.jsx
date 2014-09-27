/** @jsx React.DOM */
"use strict";

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
  render: function() {
    return (
      <div>
        <CategoriesList categories={mockedUpCategories} />
      </div>
    );
  }
});

module.exports = CategoriesPage;
