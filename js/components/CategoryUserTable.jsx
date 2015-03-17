'use strict';

var $ = require('jquery');
var React = require('react');
var CategoryUserTableItem = require('./CategoryUserTableItem.jsx');

var CategoryUserTable = React.createClass({
  getInitialState: function() {
    return {
      users: [],
    };
  },

  componentDidMount: function() {
    this.getUsers('/api/users/leading/timestamp/high/' + this.props.category);
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

  getCategoryUserTableRows: function() {
    var userTableRows = [];
    for (var i = 0; i < this.state.users.length; i++) {
      userTableRows.push(<CategoryUserTableItem key={i} user={this.state.users[i]} currentUser={this.props.user} />);
    }
    return userTableRows;
  },

  onFilter: function(e) {
    var selected = e.target.value;
    var name = this.props.category;
    var url;
    switch(selected) {
      case 'Reps Given (High to Low)':
        url = '/api/users/leading/expertreps/high/' + name;
        break;

      case 'Reps Given (Low to High)':
        url = '/api/users/leading/expertreps/low/' + name;
        break;

      case 'Trending (High to Low)':
        url = '/api/users/trending/experts/high/' + name;
        break;

      case 'Trending (Low to High)':
        url = '/api/users/trending/experts/low/' + name;
        break;

      case 'Newest':
        url = '/api/users/leading/timestamp/high/' + name;
        break;

      case 'Oldest':
        url = '/api/users/leading/timestamp/low/' + name;
        break;

      default:
        url = '/api/users/leading/expertreps/high/' + name;
        break;
    }

    this.getUsers(url);
  },

  render: function() {
    var userTableRows = this.getCategoryUserTableRows();
    return (
      <div className="categoryUserTable">
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
                <th>Rank</th>
                <th>Reps</th>
              </tr>
              {userTableRows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

module.exports = CategoryUserTable;
