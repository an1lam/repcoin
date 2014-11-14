"use strict";

var React = require('react');
var SuperScore = require('./SuperScore.jsx');

var SearchPageUser = React.createClass({
  render: function() {
    var about = this.props.user.about || '';
    return (
      <div className="searchPageItem searchPageUser">
        <div>
          <img className="img-thumbnail" src={this.props.user.picture}></img>
        </div>
        <div>
          <h2>{this.props.user.username}</h2>
          <p>{about}</p>
          <SuperScore user={this.props.user} currentUser={this.props.currentUser} />
        </div>
      </div>
    );
  }
});

module.exports = SearchPageUser;
