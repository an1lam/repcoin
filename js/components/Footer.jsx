'use strict';

var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Footer = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: false,
    };
  },

  componentDidMount: function() {
    this.setState({ loggedIn: auth.loggedIn() });
  },

  render: function() {
    var categories = this.state.loggedIn ? <li><Link to="categories">Categories</Link></li> : '';
    var home = this.state.loggedIn ? <li><Link to="home">Home</Link></li> : '';
    return (
<div className="footer navbar navbar-default btn-group navbar-fixed-bottom" role="navigation">
        <div className="container-fluid">
          <ul className="nav navbar-nav navbar-right">
            {home}
            {categories}
            <li><Link to="about">About</Link></li>
            <li><Link to="contactUs">Contact Us</Link></li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = Footer;
