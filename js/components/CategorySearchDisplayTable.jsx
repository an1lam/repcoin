"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var Router = require('react-router');
var SearchItem = require('./SearchItem.jsx');

var Link = Router.Link;

var CategorySearchDisplayTable = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    this.setState({
      index: 0,
      maxindex: this.props.data.length - 1
    });
  },

  componentWillReceiveProps: function(newProps) {
    this.setState({
      index: 0,
      maxIndex: newProps.data.length - 1
    });
  },

  handleKeyDown: function(event) {
    switch (event.keyCode) {
      case 38: // up
        if (this.state.index === 0) {
          $(".categorySearchBarInput").focus();
        }

        else if (this.state.index > 0) {
          var i = this.state.index-1;
          this.setState({ index: i });
          $(".categorySearchItem-" + i).focus();
        }
      break;
      
      case 40: // down
        if (this.state.index < this.state.maxIndex) {
          var i = this.state.index+1;
          this.setState({ index: i });
          $(".categorySearchItem-" + i).focus();
        }
      break;
      
      default: return;
    }
    event.preventDefault();
  },

  handleClick: function(event) {
    event.preventDefault();
    var name = $(event.currentTarget).attr('href');
    this.getCategory(name, this.setExpertCategory);
  },

  getCategory: function(categoryName, cb) {
    $.ajax({
      url: '/api/categories/' + categoryName,
      success: function(category) {
        return cb(category);
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

  render: function() {
    var i = 0;
    return (
      <div className="searchDisplayTable">
        <ul className="list-group">
          {this.props.data.map(function(datum) {
            var name = "categorySearchItem-" + i;
            i += 1;
            return <li key={datum._id} className="list-group-item"> 
              <a href={datum.name} onClick={this.handleClick} onKeyDown={this.handleKeyDown} className={name}>
                <SearchItem name={datum.name} index={i-1}/>
              </a>
              </li>;
          }.bind(this))}
        </ul> 
      </div>
    );
  } 
});

module.exports = CategorySearchDisplayTable;
