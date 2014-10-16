/** @jsx React.DOM */
"use strict";

var React = require('react');
var CategoriesItem = require('./CategoriesItem');
var CategoriesHeader = require('./CategoriesHeader');
var $ = require('jquery');

var CategoriesTable = React.createClass({
  getInitialState: function() {
    return {
      categories: []
    };
  },

  componentDidMount: function() {
    this.setCategories(this.props.userId);
  },

  componentWillReceiveProps: function(newProps) {
    this.setCategories(newProps.userId);
  },

  setCategories: function(userId) {
    $.ajax({
      url: '/api/users/' + userId,
      success: function(user) {
        this.setState({ categories: user.categories || [] });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.userId, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="categoriesTable panel panel-default">
        <table className="table table-bordered table-striped">
          <CategoriesHeader category="Category" directRep="Direct Rep" crowdRep="Crowd Rep" />
          <tbody>
          {this.state.categories.map(function(category) {
            return <CategoriesItem category={category.name} directRep={category.directScore} crowdRep={category.crowdScore} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
