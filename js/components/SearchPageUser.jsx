"use strict";

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
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
          <Link to="profile" params={{userId: this.props.user._id}}>
            <h2>{this.props.user.username}</h2>
          </Link>
          <p>{about}</p>
          <SuperScore user={this.props.user} />
        </div>
      </div>
    );
  }
});

module.exports = SearchPageUser;
