/** @jsx React.DOM */
"use strict";

var React = require('react');
var PictureBox = require('./PictureBox.jsx');
var LinksBox = require('./LinksBox.jsx');
var $ = require('jquery');
var auth = require('../auth.jsx');

var ProfileBox = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
    return (
      <div className="profileBox">
        <div className="col-md-2">
          <PictureBox currentUser={this.props.currentUser} user={this.props.user} />
        </div>
        <div className="profileData">
          <h3 className="profileUsername">{this.props.user.username}</h3>
          <div className="col-md-6"><LinksBox currentUser={this.props.currentUser} user={this.props.user} links={this.props.user.links} /></div>
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
