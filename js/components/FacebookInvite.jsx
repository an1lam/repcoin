'use strict';
var React = require('react');

var FacebookInvite = React.createClass({
  handleClick: function() {
    FB.ui({
      method: 'send',
      link: 'http://repcoin.com',
    });
  },


  render: function() {
    return (
      <button className="facebook-invite btn btn-default" onClick={this.handleClick}>
        Invite your friends
      </button>
    );
  }
});

module.exports = FacebookInvite;
