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
  return {
    categories: CategoriesStore.getAll()
  };
}

var CategoriesPage = React.createClass({
  mixins: [AuthenticatedRoute],

  /* This is the typical pattern for retrieving state in a Flux app.
      We ask different stores for different bags of data
  */
  getInitialState: function() {
    return getStateFromStores();
  },

  /* Once the component mounts, we want to retrieve our categories, so we
     create an Action that's going to trigger an api request. We also listen
     to our Store's event stream waiting for it to emit changes.

     In practice, we'll create Actions which do something and then trigger
     events on different Stores through the Dispatcher. The View will then
     update when the Store emits an event for which it's listening.

     In this case, we create an Action to retrieve Categories from the server
     and wait for our CategoriesStore to tell us that it's retrieved this data.
  */
  componentDidMount: function() {
    CategoriesStore.addChangeListener(this._onChange);
    CategoriesActionCreator.getCategories();
  },

  componentWillUnmount: function() {
    CategoriesStore.removeChangeListener(this._onChange);
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
