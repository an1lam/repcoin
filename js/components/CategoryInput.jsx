'use strict';

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
        // No user means the user is already an investor
        if (user) {
          var msg = 'You are now an investor in ' + name + '. You have received 5 reps to start, ' +
            'and you will get 5 more overnight once you\'ve spent those!';
          this.props.setMessage(msg);
          PubSub.publish('profileupdate');
          return user;
        } else {
          this.props.setMessage('Already an investor for ' + name);
        }
        this.props.onReset();
      }.bind(this),
      error: function(xhr, status, err) {
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
        // No user means the user is already an expert
        if (user) {
          var msg = 'You are now an expert in ' + name;
          this.props.setMessage(msg);
          PubSub.publish('profileupdate');
          return user;
        } else {
          this.props.setMessage('Already an expert in ' + name);
        }
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
