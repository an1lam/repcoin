'use strict';

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var Footer = React.createClass({
  render: function() {
    return (
      <div className="footer navbar navbar-default btn-group navbar-fixed-bottom" role="navigation">
        <div className="container-fluid">
          <ul className="nav navbar-nav navbar-right">
            <li><Link to="home">{strings.HOME}</Link></li>
            <li><Link to="categories">{strings.CATEGORIES}</Link></li>
            <li><Link to="faq">FAQ</Link></li>
            <li><Link to="team">{strings.TEAM}</Link></li>
            <li><Link to="contactUs">{strings.CONTACT_US}</Link></li>
            <li><Link to="termsOfService">{strings.TERMS_OF_SERVICE}</Link></li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = Footer;
