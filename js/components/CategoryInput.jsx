"use strict";

var auth = require('../auth.jsx');
var CategorySearch = require('./CategorySearch.jsx');
var CategorySearchDisplayTable = require('./CategorySearchDisplayTable.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

var CategoryInput = React.createClass({
  getInitialState: function() {
    return {
      query: '',
      filteredData: []
    }
  },

  handleClick: function(event) {
    event.preventDefault();
    var name = $(event.currentTarget).attr('href');
    var cb = this.props.expert ? this.setExpertCategory : this.setInvestorCategory;
    this.getCategory(name, cb);
  },

  // Create a new category
  createCategory: function(categoryName, cb) {
    var category = { name: categoryName,
                     ownerName: this.props.user.username }; 
    $.ajax({
      url: '/api/categories/',
      type: 'POST',
      data: category,
      success: function(category) {
        return cb(category);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(categoryName, status, err.toString());
      }.bind(this)
    });
  },

  // Get the category if one exists. Otherwise, create it.
  getCategory: function(categoryName, cb) {
    $.ajax({
      url: '/api/categories/' + categoryName,
      success: function(category) {
        if (category) {
          return cb(category);
        } else {
          return this.createCategory(categoryName, cb);
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(categoryName, status, err.toString());
      }.bind(this)
    }); 
  },

  setInvestorCategory: function(category) {
    var user = this.props.user;
    var newPortfolioCategory = {
      repsAvailable: 0,
      category: category.name,
      id: category._id,
      investments: []
    };
    user.portfolio.push(newPortfolioCategory);
    $.ajax({
      url: '/api/users/' + this.props.user._id,
      type: 'PUT',
      data: user,
      success: function(user) {
        auth.storeCurrentUser(user, function(user) {
          return user;
        });
        PubSub.publish('profileupdate');
        this.props.onReset();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        this.props.onReset();
      }.bind(this)
    });  
  },

  setExpertCategory: function(category) {
    var user = this.props.user;
    var newExpertCategory = {
      name: category.name,
      id: category._id,
    };
    user.categories.push(newExpertCategory);
    $.ajax({
      url: '/api/users/' + this.props.user._id,
      type: 'PUT',
      data: user,
      success: function(user) {
        auth.storeCurrentUser(user, function(user) {
          return user;
        });
        PubSub.publish('profileupdate');
        this.props.onReset();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        this.props.onReset();
      }.bind(this)
    });
  },

  search: function(query) {
    var url = '/api/categories/';
    var data = { searchTerm: query };
    if (query.length === 0) {
      this.setState({
        query: query,
        filteredData: []
      });
      return;
    }

    $.ajax({
      url: url,
      data: data,
      success: function(results) {
        this.setState({
          query: query,
          filteredData: results
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this) 
    });
  },

  render: function() {
    var type = this.props.expert ? "expert" : "investor";
    return (
      <div className="categoryInput">
        <CategorySearch onReset={this.props.onReset} query={this.state.query} search={this.search} handleClick={this.props.handleClick} getCategory={this.getCategory} setExpertCategory={this.setExpertCategory} setInvestorCategory={this.setInvestorCategory} type={type} />
        <CategorySearchDisplayTable onReset={this.props.onReset} user={this.props.user} data={this.state.filteredData} handleClick={this.handleClick} type={type} />
      </div>
    );
  }
});

module.exports = CategoryInput;
