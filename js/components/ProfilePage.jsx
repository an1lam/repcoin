/** @jsx React.DOM */
"use strict";

var React = require('react');
var Toolbar = require('./Toolbar.jsx');
var ProfileBox = require('./ProfileBox.jsx');
var Footer = require('./Footer.jsx');
var Feed = require('./Feed.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
var DonationBox = require('./DonationBox.jsx');
var $ = require('jquery');

var ProfilePage = React.createClass({
  render: function() {
    var url = '/api/transactions/users/' + this.props.params.userId + '/all/public';
    return (
      <div className="profilePage container-fluid">
        <div id="header">
          <Toolbar />
        </div>
        <div id="content">
          <div className="row">
            <ProfileBox userId={this.props.params.userId} />
          </div>
          <div className="row">
            <div className="col-md-4 profilePageCategoriesTable"><CategoriesTable userId={this.props.params.userId} /></div>
            <div className="col-md-7 profilePageFeed">
              <div className="profileDonationBox"><DonationBox userId={this.props.params.userId} /></div>
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
