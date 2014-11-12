"use strict";

var AboutPage = require('./components/AboutPage.jsx');
var auth = require('./auth.jsx');
var ContactUsPage = require('./components/ContactUsPage.jsx');
var CategoriesPage = require('./components/CategoriesPage.jsx');
var CategoryPage = require('./components/CategoryPage.jsx');
var HomePage = require('./components/HomePage.jsx');
var LoginPage = require('./components/LoginPage.jsx');
var ProfilePage = require('./components/ProfilePage.jsx');
var React = require('react');
var SearchPage = require('./components/SearchPage.jsx');

var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var Link = Router.Link;
var DefaultRoute = Router.DefaultRoute;

var RepsApp = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: auth.loggedIn()
    };
  },

  setStateOnAuth: function(loggedIn) {
    this.setState({
      loggedIn: loggedIn
    });
  },

  componentWillMount: function() {
    auth.onChange = this.setStateOnAuth;
  },

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
    <Route name="about" handler={AboutPage} />
    <Route name="contactUs" handler={ContactUsPage} />
    <Route name="categories" handler={CategoriesPage} />
    <Route name="category" path="/categories/:category" handler={CategoryPage}/>
    <Route name="home" handler={HomePage} />
    <Route name="login" handler={LoginPage} />
    <Route name="profile" path="/user/:userId" handler={ProfilePage}/>
    <Route name="search" path="/search/:query" handler={SearchPage}/>
  </Routes>
);


React.renderComponent(routes, document.getElementById('repsapp'));
