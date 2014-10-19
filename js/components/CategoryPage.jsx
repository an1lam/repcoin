/** @jsx React.DOM */
"use strict";

var $ = require('jquery');
var React = require('react');
var Feed = require('./feed.jsx');
var Footer = require('./footer.jsx');
var Toolbar = require('./toolbar.jsx');

var CategoryPage = React.createClass({
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
