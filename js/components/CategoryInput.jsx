'use strict';

var CategorySearch = require('./CategorySearch.jsx');
var CategorySearchDisplayTable = require('./CategorySearchDisplayTable.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

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
    var name = $(event.currentTarget).attr('href');
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
        var msg;
        // If the user was not returned, the category is waiting approval
        if (!user) {
          msg = strings.INVESTOR_CATEGORY_PENDING(name);
        } else {
          msg = strings.NOW_AN_INVESTOR(name);
          PubSub.publish('profileupdate');
        }
        this.props.setMessage(msg, false);
        this.props.onReset();
        return user;
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText === 'Already an investor') {
          this.props.setMessage(strings.ALREADY_AN_INVESTOR(name), true);
        } else if (xhr.responseText === 'Inappropriate content detected.') {
          this.props.setMessage(strings.INAPPROPRIATE_CATEGORY, true);
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
        var msg;
        // If the user was not returned, the category is waiting approval
        if (!user) {
          msg = strings.EXPERT_CATEGORY_PENDING(name);
        } else {
          msg = strings.NOW_AN_EXPERT(name);
          PubSub.publish('profileupdate');
        }
        this.props.setMessage(msg, false);
        this.props.onReset();
        return user;
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText === 'Already an expert') {
          this.props.setMessage(strings.ALREADY_AN_EXPERT(name), true);
        } else if (xhr.responseText === 'Inappropriate content detected.') {
          this.props.setMessage(strings.INAPPROPRIATE_CATEGORY, true);
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
