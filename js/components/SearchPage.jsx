'use strict';
var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var Footer = require('./Footer.jsx');
var React = require('react');
var SearchPageCategory = require('./SearchPageCategory.jsx');
var SearchPageFilter = require('./SearchPageFilter.jsx');
var SearchPageUser = require('./SearchPageUser.jsx');
var Toolbar = require('./Toolbar.jsx');

var SearchPage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return {
      totalResults: null,
      filteredResults: null
    };
  },

  componentDidMount: function() {
    this.setResults(this.props.params.query);
  },

  componentWillReceiveProps: function(newProps) {
    this.setResults(newProps.params.query);
  },

  setResults: function(query) {
    var data = { searchTerm: query };
    $.ajax({
      url: '/api/users/',
      data: data,
      success: function(users) {
        $.ajax({
          url: '/api/categories/',
          data: data,
          success: function(categories) {
            var results = (users.concat(categories)).sort(this.compareFunc);
            this.setState({ totalResults: results, filteredResults: results });
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err.toString());
          }.bind(this)
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  // TODO: compare with something more meaningful than the alphabet
  compareFunc: function(a, b) {
    var aName = a.name ? a.name : a.firstname;
    var bName = b.name ? b.name : b.firstname;
    if (aName < bName) {
      return -1;
    }
    if (bName < aName) {
      return 1;
    }
    return 0;
  },

  generateResultList: function() {
    return (
      <ul className="list-group searchlist">
        {this.state.filteredResults.map(function(result) {
        if (result.firstname) {
          return <li key={result._id} className="row list-group-item"><SearchPageUser user={result} /></li>;
        } else {
          return <li key={result._id} className="row list-group-item"><SearchPageCategory category={result} /></li>;
        }
        })}
      </ul>
    );
  },

  filterResults: function(checkedBoxes) {
    if (checkedBoxes.user && checkedBoxes.category ||
      !checkedBoxes.user && !checkedBoxes.category) {
      this.setState({ filteredResults: this.state.totalResults });
    } else if (checkedBoxes.user) {
      this.filterResultsForUsers();
    } else if (checkedBoxes.category) {
      this.filterResultsForCategories();
    }
  },

  filterResultsForUsers: function() {
    var totalResults = this.state.totalResults;
    var newResults = [];
    for (var i = 0; i < totalResults.length; i++) {
      if (totalResults[i].username) {
        newResults.push(totalResults[i]);
      }
    }
    this.setState({ filteredResults: newResults });
  },

  filterResultsForCategories: function() {
    var totalResults = this.state.totalResults;
    var newResults = [];
    for (var i = 0; i < totalResults.length; i++) {
      if (totalResults[i].name) {
        newResults.push(totalResults[i]);
      }
    }
    this.setState({ filteredResults: newResults });
  },

  render: function() {
    var results = '';
    var msg = '';
    var filter = '';
    var filteredResults = this.state.filteredResults;
    if (filteredResults) {
      if (filteredResults.length === 0) {
        msg = 'Sorry, no results were found for \'' + this.props.params.query + '\'';
      } else {
        msg = 'Displaying ' + filteredResults.length + ' results for \'' + this.props.params.query + '\'';
        results = this.generateResultList();
        filter = <SearchPageFilter filterResults={this.filterResults} />
      }
    }

    return (
      <div className="searchPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <h4 className="search-text">{msg}</h4>
          <div className="col-md-3">
            {filter}
          </div>
          <div className="col-md-6">
            {results}
          </div>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = SearchPage;
