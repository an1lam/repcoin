'use strict';

var CategorySearch = require('./CategorySearch.jsx');
var CategorySearchDisplayTable = require('./CategorySearchDisplayTable.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

var CategoryInput = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      filteredCategories: [],
      totalCategories: []
    }
  },

  componentDidMount: function() {
    var url = '/api/categories/';
    $.ajax({
      url: url,
      success: function(totalCategories) {
        this.setState({ totalCategories: totalCategories });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  handleClick: function(event) {
    event.preventDefault();
    var name = $(event.currentTarget).attr('href').toLowerCase();
    debugger;
    console.log(name);
    if (this.props.expert) {
      this.setExpertCategory(name);
    } else {
      this.setInvestorCategory(name);
    }
  },

  setInvestorCategory: function(name) {
    $.ajax({
      url: '/api/users/' + this.props.user._id + '/addinvestor/' + name,
      type: 'PUT',
      success: function(user) {
        var msg = 'You are now an investor in ' + name + '. You have received 5 reps to start, ' +
          'and you will get 5 more overnight once you\'ve spent those!';
        this.props.setMessage(msg);
        PubSub.publish('profileupdate');
        this.props.onReset();
        return user;
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText === 'Already an investor') {
          this.props.setMessage('Already an investor in ' + name);
        }
        console.error(status, err.toString());
        this.props.onReset();
      }.bind(this)
    });
  },

  setExpertCategory: function(name) {
    $.ajax({
      url: '/api/users/' + this.props.user._id + '/addexpert/' + name,
      type: 'PUT',
      success: function(user) {
        var msg = 'You are now an expert in ' + name;
        this.props.setMessage(msg);
        PubSub.publish('profileupdate');
        this.props.onReset();
        return user;
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText === 'Already an expert') {
          this.props.setMessage('Already an expert in ' + name);
        }
        console.error(status, err.toString());
        this.props.onReset();
      }.bind(this)
    });
  },

  search: function(query) {
    this.setState({ query: query });
    if (query.trim().length === 0) {
      this.setState({ filteredCategories: [] });
      return;
    }

    this.getFilteredCategories(query);
  },

  getFilteredCategories: function(query) {
    var totalCategories = this.state.totalCategories;
    var length = totalCategories.length;
    var filteredCategories = [];
    for (var i = 0; i < length; i++) {
      var regexp = new RegExp('\\b' + query, 'i');
      var name = totalCategories[i].name;
      if (regexp.test(name)) {
        filteredCategories.push(totalCategories[i]);
      }
    }
    this.setState({ filteredCategories: filteredCategories });
  },

  render: function() {
    var type = this.props.expert ? 'expert' : 'investor';
    return (
      <div className="categoryInput">
        <CategorySearch onReset={this.props.onReset} query={this.state.query} search={this.search} handleClick={this.props.handleClick} getCategory={this.getCategory} setExpertCategory={this.setExpertCategory} setInvestorCategory={this.setInvestorCategory} type={type} />
        <CategorySearchDisplayTable onReset={this.props.onReset} user={this.props.user} data={this.state.filteredCategories} handleClick={this.handleClick} type={type} />
      </div>
    );
  }
});

module.exports = CategoryInput;
