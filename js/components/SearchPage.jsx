'use strict';
var $ = require('jquery');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var Footer = require('./Footer.jsx');
var React = require('react');
var SearchPageCategory = require('./SearchPageCategory.jsx');
var SearchPageUser = require('./SearchPageUser.jsx');
var Toolbar = require('./Toolbar.jsx');

var SearchPage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return {};
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
            this.setState({ results: results });
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
        {this.state.results.map(function(result) {
        if (result.firstname) {
          return <li key={result._id} className="row list-group-item"><SearchPageUser user={result} /></li>;
        } else {
          return <li key={result._id} className="row list-group-item"><SearchPageCategory category={result} /></li>;
        }
        })}
      </ul>
    );
  },

  render: function() {
    var results = '';
    if (this.state.results) {
      if (this.state.results.length === 0) {
        results = <div><p className="no-results">Sorry, no results were found for '{this.props.params.query}'</p></div>;
      } else {
        results = this.generateResultList();
      }
    }
    return (
      <div className="searchPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
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
