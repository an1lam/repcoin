'use strict';

var $ = require('jquery');
var React = require('react');
var UserTableItem = require('./UserTableItem.jsx');

var UserTable = React.createClass({
  getInitialState: function() {
    return {
      users: [],
    };
  },

  componentDidMount: function() {
    this.getUsers('/api/users/leading/expertreps/high');
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

  getUserTableRows: function() {
    var userTableRows = [];
    for (var i = 0; i < this.state.users.length; i++) {
      userTableRows.push(<UserTableItem key={i} user={this.state.users[i]} currentUser={this.props.user} />);
    }

    return userTableRows;
  },

  onFilter: function(e) {
    var selected = e.target.value;
    var url;
    switch (selected) {
      case 'Reps Given (High to Low)':
        url = '/api/users/leading/expertreps/high';
        break;

      case 'Reps Given (Low to High)':
        url = '/api/users/leading/expertreps/low';
        break;

      case 'Trending (High to Low)':
        url = '/api/users/trending/experts/high';
        break;

      case 'Trending (Low to High)':
        url = '/api/users/trending/experts/low';
        break;

      case 'Newest':
        url = '/api/users/leading/timestamp/high';
        break;

      case 'Oldest':
        url = '/api/users/leading/timestamp/low';
        break;

      default:
        url = '/api/users/leading/expertreps/high';
        break;
    }

    this.getUsers(url);
  },

  render: function() {
    var userTableRows = this.getUserTableRows();
    return (
      <div className="userTable">
        <div className="user-table-filter">Sort by:
          <select className="user-table-select" onChange={this.onFilter}>
            <option>Reps Given (High to Low)</option>
            <option>Reps Given (Low to High)</option>
            <option>Trending (High to Low)</option>
            <option>Trending (Low to High)</option>
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
                <th>Top Expert (Rank)</th>
                <th>Top Investor (Rank)</th>
              </tr>
              {userTableRows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

module.exports = UserTable;
