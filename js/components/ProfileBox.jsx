/** @jsx React.DOM */
"use strict";

var React = require('react');
var LinksBox = require('./LinksBox.jsx');
var $ = require('jquery');

var ProfileBox = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
    return (
      <div className="profileBox">
        <img className="profilePicture img-responsive img-thumbnail col-md-2" src={this.props.user.picture}></img>
        <div className="profileData">
          <h3 className="profileUsername">{this.props.user.username}</h3>
          <div><LinksBox userId={this.props.user._id} links={this.props.user.links} /></div>
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
