'use strict';

var MiniInvestButton = require('./MiniInvestButton.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var UserTableItem = React.createClass({

  // Return the top 3 expert categories for a user
  getTopCategories: function(expert) {
    var categoriesItems = [];
    var categories = expert ? this.props.user.categories : this.props.user.portfolio;
    var sortedCategories = categories.concat().sort(this.getCategoriesComparator());

    var name;
    var perc;
    for (var i = 0; i < sortedCategories.length && i < 3; i++) {
      name = expert ? sortedCategories[i].name : sortedCategories[i].category;
      perc = sortedCategories[i].rank;
      categoriesItems.push(
        <div className="list-group-item" key={i}>
          <Link to="category" params={{category: name}}>{name}</Link>
          , ({perc})
        </div>
      );
    }

    return <div className="list-group">{categoriesItems}</div>;
  },

  getCategoriesComparator: function() {
    return function(a, b) {
      if (a.rank < b.rank) {
        return -1;
      }

      if (a.rank > b.rank) {
        return 1;
      }

      return 0;
    }
  },

  render: function() {
    var user = this.props.user;
    var investmentButton = '';
    if (
      this.props.currentUser &&
      this.props.currentUser._id !== this.props.user._id) {
      investmentButton = (
        <MiniInvestButton user={this.props.user}
          currentUser={this.props.currentUser}/>
      );
    }

    var img = '';
    if (user.picture && user.picture.url) {
      img = <img className="user-table-img" src={user.picture.url}></img>;
    } else {
      img = <img className="user-table-img" src={strings.DEFAULT_USER_PIC}></img>;
    }

    return (
      <tr>
        <td>
          {investmentButton}
          <Link to="profile" params={{userId: user._id}}>{user.username}</Link>
          {img}
        </td>
        <td>{user.about}</td>
        <td>{this.getTopCategories(true)}</td>
        <td>{this.getTopCategories(false)}</td>
      </tr>
    );
  }
});

module.exports = UserTableItem;
