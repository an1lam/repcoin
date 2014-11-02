"use strict";

var $ = require('jquery');
var AboutBox = require('./AboutBox.jsx');
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
        <div className="col-md-3">
          <div className="row">
            <div className="profileUsername">{this.props.user.username}</div>
          </div>
          <div className="row">
            <AboutBox user={this.props.user}/>
          </div>
          <div className="row">
            <div className="superScorePanel"><SuperScore user={this.props.user} currentUser={this.props.currentUser} /></div>
          </div>
        </div>
        <div className="col-md-7">
          <LinksBox currentUser={this.props.currentUser} user={this.props.user} links={this.props.user.links} />
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
