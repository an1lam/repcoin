'use strict';

var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var AboutPage = React.createClass({
  render: function() {
    return (
      <div className="aboutPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row col-md-8 col-md-offset-1 aboutContent">
          <h1>Repcoin FAQ</h1>
          <p>{strings.TEAM_PART_2}</p>
          <p>{strings.TEAM_PART_3}</p>
          <p>{strings.TEAM_PART_4}</p>
          <p>{strings.TEAM_PART_5}</p>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = AboutPage;
