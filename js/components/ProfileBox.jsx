'use strict';

var $ = require('jquery');
var AboutBox = require('./AboutBox.jsx');
var auth = require('../auth.jsx');
var InvestmentButton = require('./InvestmentButton.jsx');
var LinksBox = require('./LinksBox.jsx');
var LocationBox = require('./LocationBox.jsx');
var PictureBox = require('./PictureBox.jsx');
var React = require('react');

var ProfileBox = React.createClass({
  render: function() {
    var investmentButton = '';
    if (this.props.currentUser._id !== this.props.user._id) {
      investmentButton = <InvestmentButton user={this.props.user} currentUser={this.props.currentUser}/>;
    }

    var profileUsername = '';
    if (this.props.user.ghost) {
      profileUsername =
        <div className="profileUsername">{this.props.user.username}
          <span className="glyphicon glyphicon-sunglasses"></span>
        </div>;
    } else {
      profileUsername = <div className="profileUsername">{this.props.user.username}</div>;
    }

    return (
      <div className="profileBox">
        <div className="col-md-2">
          <PictureBox currentUser={this.props.currentUser} user={this.props.user} />
        </div>
        <div className="col-md-3">
          <div className="row">
            {profileUsername}
          </div>
          <div className="row">
            <AboutBox user={this.props.user} currentUser={this.props.currentUser}/>
            <LocationBox user={this.props.user} currentUser={this.props.currentUser}/>
            {investmentButton}
          </div>
        </div>
        <div className="col-md-7">
          <LinksBox currentUser={this.props.currentUser} user={this.props.user} />
        </div>
      </div>
    );
  }
});

module.exports = ProfileBox;
