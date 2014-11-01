"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var LinksBox = require('./LinksBox.jsx');
var PictureBox = require('./PictureBox.jsx');
var React = require('react');
var SuperScore = require('./SuperScore.jsx');

var ProfileBox = React.createClass({

  render: function() {
    return (
      <div className="profileBox">
        <div className="col-md-2">
          <PictureBox currentUser={this.props.currentUser} user={this.props.user} />
        </div>
        <div className="profileData col-md-10">
          <div className="row">
            <div className="profileUsername col-md-3">{this.props.user.username}</div>
          </div>
          <div className="row">
            <div className="superScorePanel col-md-3"><SuperScore user={this.props.user} /></div>
          </div>
          <div className="row">
            <div className="col-md-6"><LinksBox currentUser={this.props.currentUser} user={this.props.user} links={this.props.user.links} /></div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
