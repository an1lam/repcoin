/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var ProfileBox = require('./ProfileBox.jsx');
var Footer = require('./Footer.jsx');

var mockedUpUser = {
  "name": "Stephen Malina",
  "picture": "https://s.gravatar.com/avatar/eb97527661cf38fc40a6269dea1518bb?s=80",
  "username": "krazemon",
  "website": "krazemon.github.io",
  "github": "https://github.com/krazemon"
};

var ProfilePage = React.createClass({
  render: function() {
    return (
      <div className="profilePage">
        <div id="header">
          <Toolbar />
        </div>
        <div id="content">
          <ProfileBox user={mockedUpUser} />
        </div>        
        <Footer />
    </div>
    );
  }
});

module.exports = ProfilePage;
