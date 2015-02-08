'use strict';

var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var CategoriesList = require('./CategoriesList.jsx');
var CategoriesPageFilter = require('./CategoriesPageFilter.jsx');
var Footer = require('./Footer.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');
var Toolbar = require('./Toolbar.jsx');

var CategoriesPage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return {
      categories : [],
      sortedCategories: [],
    };
  },

  componentDidMount: function() {
    $.ajax({
      url : '/api/categories',
      dataType : 'json',
      success: function(categories) {
        this.setState({ categories : categories, sortedCategories: categories });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  sortResults: function(selected) {
    var comparator;
    switch(selected) {
      case strings.ALPHABETICAL:
        comparator = this.getAlphabeticalComparator();
        break;
      case strings.MARKET_SIZE_HIGH_TO_LOW:
        comparator = this.getMarketComparator(true);
        break;
      case strings.MARKET_SIZE_LOW_TO_HIGH:
        comparator = this.getMarketComparator(false);
        break;
      case strings.EXPERTS_HIGH_TO_LOW:
        comparator = this.getExpertComparator();
        break;

      case strings.INVESTORS_HIGH_TO_LOW:
        comparator = this.getInvestorComparator();
        break;

      default:
        comparator = this.getAlphabeticalComparator();
        break;
    }
    this.setState({ sortedCategories: this.state.sortedCategories.sort(comparator) });
  },

  getExpertComparator: function() {
    return function(a, b) {
      if (a.experts > b.experts) {
        return -1;
      }
      if (a.experts < b.experts) {
        return 1;
      }
      return 0;
    }
  },

  getInvestorComparator: function() {
    return function(a, b) {
      if (a.investors > b.investors) {
        return -1;
      }
      if (a.investors < b.investors) {
        return 1;
      }
      return 0;
    }
  },

  getAlphabeticalComparator: function() {
    return function(a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    }
  },

  getMarketComparator: function(high) {
    return function(a, b) {
      if (high) {
        return b.reps - a.reps;
      }
      return a.reps - b.reps;
    }
  },

  render: function() {
    return (
      <div className="categoriesPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <h1 className="col-md-8 categories-page-title">{strings.CHECK_OUT_EXISTING_CATEGORIES}</h1>
          <div className="col-md-3 cat-page-filter">
            <CategoriesPageFilter sortResults={this.sortResults}/>
          </div>
        </div>
        <div className="row">
          <CategoriesList categories={this.state.sortedCategories} />
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = CategoriesPage;
