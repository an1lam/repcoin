'use strict';

var $ = require('jquery');
var React = require('react');
var CategoryInvestorTableItem = require('./CategoryInvestorTableItem.jsx');

var CategoryInvestorTable = React.createClass({
  getInitialState: function() {
    return {
      users: [],
    };
  },

  componentDidMount: function() {
    this.getUsers('/api/users/leading/investors/rank/low/' + this.props.category);
  },

  getUsers: function(url) {
    $.ajax({
      url: url,
      success: function(users) {
        this.setState({ users: users });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  getCategoryInvestorTableRows: function() {
    var userTableRows = [];
    for (var i = 0; i < this.state.users.length; i++) {
      userTableRows.push(<CategoryInvestorTableItem key={i} user={this.state.users[i]} currentUser={this.props.user} />);
    }
    return userTableRows;
  },

  onFilter: function(e) {
    var selected = e.target.value;
    var name = this.props.category;
    var url;
    switch(selected) {
      case 'Rank (Top to Bottom)':
        url = '/api/users/leading/investors/rank/low/' + name;
        break;

      case 'Rank (Bottom to Top)':
        url = '/api/users/leading/investors/rank/high/' + name;
        break;

      case 'Dividends (High to Low)':
        url = '/api/users/leading/investors/dividends/high/' + name;
        break;

      case 'Dividends (Low to High)':
        url = '/api/users/leading/investors/dividends/low/' + name;
        break;

      case 'Returns (High to Low)':
        url = '/api/users/leading/investors/returns/high/' + name;
        break;

      case 'Returns (Low to High)':
        url = '/api/users/leading/investors/returns/low/' + name;
        break;

      case 'Newest':
        url = '/api/users/leading/investors/timeStamp/high/' + name;
        break;

      case 'Oldest':
        url = '/api/users/leading/investors/timeStamp/low/' + name;
        break;

      default:
        url = '/api/users/leading/investors/rank/high/' + name;
        break;
    }

    this.getUsers(url);
  },

  render: function() {
    var userTableRows = this.getCategoryInvestorTableRows();
    return (
      <div className="categoryExpertTable">
        <div className="user-table-filter">Sort by:
          <select className="user-table-select" onChange={this.onFilter}>
            <option>Rank (High to Low)</option>
            <option>Rank (Low to High)</option>
            <option>Dividends (High to Low)</option>
            <option>Dividends (Low to High)</option>
            <option>Returns (High to Low)</option>
            <option>Returns (Low to High)</option>
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
        <div className="panel panel-default">
          <table className="table table-bordered table-striped">
            <tbody>
              <tr>
                <th>User</th>
                <th className="about-column">About</th>
                <th>Rank</th>
                <th>Dividends</th>
                <th>Average Return</th>
              </tr>
              {userTableRows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

module.exports = CategoryInvestorTable;
