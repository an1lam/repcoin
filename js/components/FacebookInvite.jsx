'use strict';

var $ = require('jquery');
var React = require('react');

var auth = require('../auth.jsx')

var FacebookInvite = React.createClass({
  getInitialState: function() {
    return {
      shareLink: null,
    };
  },

  componentDidMount: function() {
    this.generateShareLink()
  },

  componentWillMount: function(newProps) {
    this.generateShareLink()
  },

  handleClick: function() {
    if (this.state.shareLink) {
      FB.ui({
        method: 'send',
        link: this.state.shareLink,
        picture: "http://res.cloudinary.com/repcoin/image/upload/v1423513285/2RepCoinHeader_mwyh9z.png",
      });
    }
  },

  generateShareLink: function() {
    $.ajax({
      url: '/api/users/share/',
      success: function(shareLink) {
        this.setState({
          shareLink: shareLink,
        })
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(err);
        this.setState({
          shareLink: null,
        })
      }.bind(this),
    })
  },

  render: function() {
    return (
        <button className="facebook-invite btn btn-default"
          onClick={this.handleClick}>
          Invite your friends
        </button>
    );

  }
});

module.exports = FacebookInvite;
