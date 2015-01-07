'use strict';

var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var Footer = require('./Footer.jsx');
var CategoriesList = require('./CategoriesList.jsx');
var React = require('react');
var Toolbar = require('./Toolbar.jsx');

var CategoriesPage = React.createClass({
  mixins: [AuthenticatedRoute],

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
      <div className="categoriesPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row categories-page-title">
          <h1>Check out all of the existing categories on Repcoin.</h1>
        </div>
        <div className="row">
          <CategoriesList categories={this.state.categories} />
        </div>
        <div className="row">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = CategoriesPage;
