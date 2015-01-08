'use strict';

var AboutPage = require('./components/AboutPage.jsx');
var auth = require('./auth.jsx');
var ContactUsPage = require('./components/ContactUsPage.jsx');
var CategoriesPage = require('./components/CategoriesPage.jsx');
var CategoryPage = require('./components/CategoryPage.jsx');
var HomePage = require('./components/HomePage.jsx');
var LoginPage = require('./components/LoginPage.jsx');
var PasswordResetPage = require('./components/PasswordResetPage.jsx');
var ProfilePage = require('./components/ProfilePage.jsx');
var React = require('react');
var SearchPage = require('./components/SearchPage.jsx');
var VerificationPage = require('./components/VerificationPage.jsx');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var Routes = Router.Routes;
var State = Router.State;
var Link = Router.Link;
var DefaultRoute = Router.DefaultRoute;

var RepsApp = React.createClass({
  mixins: [State],
  getInitialState: function() {
    return { loggedIn: false };
  },

  componentWillMount: function() {
    auth.loggedIn(function(loggedIn) {
      this.setState({ loggedIn: loggedIn });
    }.bind(this));
  },

  render: function() {
    return (
      <div className="repsApp">
        <RouteHandler {...this.props} />
      </div>
    );
  }
});

var routes = (
  <Route handler={RepsApp}>
    <DefaultRoute handler={LoginPage} />
    <Route name="about" handler={AboutPage} />
    <Route name="categories" handler={CategoriesPage} />
    <Route name="category" path="/categories/:category" handler={CategoryPage}/>
    <Route name="contactUs" handler={ContactUsPage} />
    <Route name="home" handler={HomePage} />
    <Route name="login" handler={LoginPage} />
    <Route name="profile" path="/user/:userId" handler={ProfilePage}/>
    <Route name="search" path="/search/:query" handler={SearchPage}/>
    <Route name="passwordReset" path="/passwordReset/:token" handler={PasswordResetPage} />
    <Route name="verification" path="/verify/:token/" handler={VerificationPage} />
  </Route>
);
Router.run(routes, function (Handler, state) {
  React.render(<Handler params={state.params} query={state.query} />, document.getElementById('repsapp'));
 });
