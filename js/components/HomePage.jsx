'use strict';

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
var FacebookInvite = require('./FacebookInvite.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var ProfileQuickView = require('./ProfileQuickView.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');
var Toolbar = require('./Toolbar.jsx');

var HomePage = React.createClass({
  mixins: [AuthenticatedRoute],
  render: function() {
    return (
      <div className="homePage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <div className="col-md-3">
            <ProfileQuickView />
          </div>
          <div className="col-md-6">
            <Feed parent="HomePage" />
          </div>
          <div className="col-md-2">
            <FacebookInvite />
          </div>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = HomePage;
