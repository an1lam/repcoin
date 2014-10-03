/** @jsx React.DOM */
"use strict";

var React = require('react');
var LoginPage = require('./components/LoginPage.jsx');
var HomePage = require('./components/HomePage.jsx');
var ProfilePage = require('./components/ProfilePage.jsx');
var CategoriesPage = require('./components/CategoriesPage.jsx');
var AboutPage = require('./components/AboutPage.jsx');
var ContactUsPage = require('./components/ContactUsPage.jsx');

var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var Link = Router.Link;
var DefaultRoute = Router.DefaultRoute;

var RepsApp = React.createClass({
  render: function() {
    return (
      <div className="repsApp">
        {this.props.activeRouteHandler()}
      </div>
    );
  }
});

// TODO: Make multiple top level routes (Feed, Profile, About, etc.)
var routes = (
  <Routes>
    <DefaultRoute handler={LoginPage} />
    <Route name="login" handler={LoginPage} />
    <Route name="home" handler={HomePage} />
    <Route name="categories" handler={CategoriesPage} />
    {/* TODO: Make this not link to itself */}
    <Route name="category" path="/category/:category" handler={CategoriesPage}/>
    <Route name="profile" path="/user/:userId" handler={ProfilePage}/>
    <Route name="about" handler={AboutPage} />
    <Route name="contactUs" handler={ContactUsPage} />
  </Routes>
);


React.renderComponent(routes, document.getElementById('repsapp'));
