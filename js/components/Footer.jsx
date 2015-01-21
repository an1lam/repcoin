'use strict';

var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var Footer = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false,
    };
  },

  componentDidMount: function() {
    auth.loggedIn(function(loggedIn) {
      this.setState({ loggedIn: loggedIn });
    }.bind(this));
  },

  render: function() {
    var categories = this.state.loggedIn ? <li><Link to="categories">{strings.CATEGORIES}</Link></li> : '';
    var home = this.state.loggedIn ? <li><Link to="home">{strings.HOME}</Link></li> : '';
    return (
<div className="footer navbar navbar-default btn-group navbar-fixed-bottom" role="navigation">
        <div className="container-fluid">
          <ul className="nav navbar-nav navbar-right">
            {home}
            {categories}
            <li><Link to="about">{strings.ABOUT}</Link></li>
            <li><Link to="contactUs">{strings.CONTACT_US}</Link></li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = Footer;
