'use strict';

var $ = require('jquery');
var React = require('react');
var CategoryExpertTableItem = require('./CategoryExpertTableItem.jsx');

var CategoryExpertTable = React.createClass({
  getInitialState: function() {
    return {
      users: [],
    };
  },

  componentDidMount: function() {
    console.log(this.props.category);
    this.getUsers('/api/users/leading/experts/reps/high/' + this.props.category);
  },

  getUsers: function(url) {
    console.log(url);
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

  getCategoryExpertTableRows: function() {
    var userTableRows = [];
    for (var i = 0; i < this.state.users.length; i++) {
      userTableRows.push(<CategoryExpertTableItem key={i} user={this.state.users[i]} currentUser={this.props.user} />);
    }
    return userTableRows;
  },

  onFilter: function(e) {
    var selected = e.target.value;
    var name = this.props.category;
    var url;
    switch(selected) {
      case 'Reps Given (High to Low)':
        url = '/api/users/leading/experts/reps/high/' + name;
        break;

      case 'Reps Given (Low to High)':
        url = '/api/users/leading/experts/reps/low/' + name;
        break;

      case 'Trending (High to Low)':
        url = '/api/users/trending/experts/high/' + name;
        break;

      case 'Trending (Low to High)':
        url = '/api/users/trending/experts/low/' + name;
        break;

      case 'Newest':
        url = '/api/users/leading/experts/timestamp/high/' + name;
        break;

      case 'Oldest':
        url = '/api/users/leading/experts/timestamp/low/' + name;
        break;

      default:
        url = '/api/users/leading/experts/reps/high/' + name;
        break;
    }

    this.getUsers(url);
  },

  render: function() {
    var userTableRows = this.getCategoryExpertTableRows();
    return (
      <div className="categoryExpertTable">
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

module.exports = CategoryExpertTable;
