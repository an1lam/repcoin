/** @jsx React.DOM */
"use strict";

var $ = require('jquery');
var React = require('react');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');

var CategoryPage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return {};
  },

  render: function() {
    return (
      <div>
        <div className="row categoryPageHeader">
          <Toolbar />
        </div>
        <div className="col-md-6 col-md-offset-3"><Feed category={this.props.params.category}/></div>
        <div className="row">
          <div className="row categoryPageFooter">
            <Footer />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CategoryPage;
