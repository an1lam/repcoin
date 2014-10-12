/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var ProfileBox = require('./ProfileBox.jsx');
var Footer = require('./Footer.jsx');
var Feed = require('./Feed.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
var DonationBox = require('./DonationBox.jsx');

var mockedUpUser = {
  "name": "Stephen Malina",
  "picture": "https://s.gravatar.com/avatar/eb97527661cf38fc40a6269dea1518bb?s=80",
  "username": "krazemon",
  "website": "krazemon.github.io",
  "github": "https://github.com/krazemon"
};

var ProfilePage = React.createClass({
  render: function() {
    var url = mockedUpUser.name;
    return (
      <div className="profilePage container-fluid">
        <div id="header">
          <Toolbar />
        </div>
        <div id="content">
          <div className="row">
            <ProfileBox user={mockedUpUser} />
          </div>
          <div className="row">
            <div className="col-md-4 profilePageCategoriesTable"><CategoriesTable /></div>
            <div className="col-md-7 profilePageFeed">
              <div className="profileDonationBox"><DonationBox user={mockedUpUser} /></div>  
            <Feed url={url} />
            </div>
          </div>
          <div className="row">      
            <div className="profilePageFooter"><Footer /></div>
          </div>  
        </div>
      </div>
    );
  }
});

module.exports = ProfilePage;
