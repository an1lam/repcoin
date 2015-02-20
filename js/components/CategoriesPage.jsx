'use strict';

var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var CategoriesList = require('./CategoriesList.jsx');
var CategoriesPageFilter = require('./CategoriesPageFilter.jsx');
var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');
var CategoriesStore = require('../stores/CategoriesStore.js');
var Footer = require('./Footer.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');
var Toolbar = require('./Toolbar.jsx');

function getStateFromStores() {
  console.log(CategoriesStore.getAll());
  return {
    categories: CategoriesStore.getAll()
  };
}

var CategoriesPage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    CategoriesStore.addChangeListener(this._onChange);
    CategoriesActionCreator.getCategories();
  },

  render: function() {
    return (
      <div className="categoriesPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <h1 className="col-md-8 categories-page-title">
            {strings.CHECK_OUT_EXISTING_CATEGORIES}
          </h1>
          <div className="col-md-3 cat-page-filter">
            <CategoriesPageFilter onFilter={this._onFilter} />
          </div>
        </div>
        <div className="row">
          <CategoriesList categories={this.state.categories} />
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  },

  _onFilter: function(evt) {
    CategoriesActionCreator.sortCategories(evt.target.value);
  },
});

module.exports = CategoriesPage;
