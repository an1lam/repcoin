'use strict';

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
    var newCategory = {
      category: category.name,
      id: category._id,
    };
    $.ajax({
      url: '/api/users/' + this.props.user._id + '/investor',
      type: 'PUT',
      data: newCategory,
      success: function(user) {
        // No user means the user is already an investor
        if (user) {
          auth.storeCurrentUser(user, function(user) {
            return user;
          });
          this.incrementSubscribers(category, true);
          PubSub.publish('profileupdate');
        } else {
          this.props.setError('Already an investor for ' + category.name);
        }
        this.props.onReset();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        this.props.onReset();
      }.bind(this)
    });
  },

  setExpertCategory: function(category) {
    var newCategory = {
      name: category.name,
      id: category._id,
    };
    $.ajax({
      url: '/api/users/' + this.props.user._id + '/expert',
      type: 'PUT',
      data: newCategory,
      success: function(user) {
        // No user means the user is already an expert
        if (user) {
          auth.storeCurrentUser(user, function(user) {
            return user;
          });
          this.incrementSubscribers(category, false);
          PubSub.publish('profileupdate');
        } else {
          this.props.setError('Already an expert in ' + category.name);
        }
        this.props.onReset();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        this.props.onReset();
      }.bind(this)
    });
  },

  incrementSubscribers: function(category, isInvestor) {
    if (isInvestor) {
      category.investors = category.investors + 1;
    } else {
      category.experts = category.experts + 1;
    }
    $.ajax({
      url: '/api/categories/' + category._id,
      type: 'PUT',
      data: category,
      success: function(category) {
        return;
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
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
    var type = this.props.expert ? 'expert' : 'investor';
    return (
      <div className="categoryInput">
        <CategorySearch onReset={this.props.onReset} query={this.state.query} search={this.search} handleClick={this.props.handleClick} getCategory={this.getCategory} setExpertCategory={this.setExpertCategory} setInvestorCategory={this.setInvestorCategory} type={type} />
        <CategorySearchDisplayTable onReset={this.props.onReset} user={this.props.user} data={this.state.filteredData} handleClick={this.handleClick} type={type} />
      </div>
    );
  }
});

module.exports = CategoryInput;
