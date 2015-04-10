'use strict';

var $ = require('jquery');
var AboutPage = require('./components/AboutPage.jsx');
var auth = require('./auth.jsx');
var PubSub = require('pubsub-js');
var ContactUsPage = require('./components/ContactUsPage.jsx');
var CategoriesPage = require('./components/CategoriesPage.jsx');
var CategoryRequestPage = require('./components/CategoryRequestPage.jsx');
var CategoryPage = require('./components/CategoryPage.jsx');
var HomePage = require('./components/HomePage.jsx');
var LoginPage = require('./components/LoginPage.jsx');
var PasswordResetPage = require('./components/PasswordResetPage.jsx');
var ProfilePage = require('./components/ProfilePage.jsx');
var React = require('react');
var SearchPage = require('./components/SearchPage.jsx');
var TeamPage = require('./components/TeamPage.jsx');
var TermsOfServicePage = require('./components/TermsOfServicePage.jsx');
var VerificationPage = require('./components/VerificationPage.jsx');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var Routes = Router.Routes;
var strings = require('./lib/strings_utils.js');
var State = Router.State;
var Link = Router.Link;
var DefaultRoute = Router.DefaultRoute;

var RepsApp = React.createClass({
  mixins: [State],

  componentDidMount: function() {
    // Configure to work with localhost or repcoin.com
    var appId;
    if (document.domain === 'localhost') {
      appId = strings.FACEBOOK_APP_ID_LOCALHOST;
    } else {
      appId = strings.FACEBOOK_APP_ID_PRODUCTION;
    }

    // Load the Facebook API
    window.fbAsyncInit = function() {
      FB.init({
        appId      : appId,
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.1' // use version 2.1
      });
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Load the Google Charts API
    window.googleLoaded = false;
    var options = {
      dataType: 'script',
      cache: true,
      url: 'https://www.google.com/jsapi',
    };
    $.ajax(options).done(function(){
      google.load('visualization', '1.', {
        packages:['corechart'],
        callback: function() {
          googleLoaded = true;
          PubSub.publish('googlecharts');
        }
      });
    });
  },

  componentWillMount: function() {
    // Make sure search results are only shown if actively searching
    $(document).click(function() {
      // Start by hiding everything
      $('.searchDisplayTable').hide();

      // Check if expert search is being used
      if ( $('.expertsearch').is(':focus') || $('.expertSearchResults').is(':focus') ) {
        $('.expertSearchTable').show();

      // Check if investor search is being used
      } else if ( $('.investorsearch').is(':focus') || $('.investorSearchResults').is(':focus') ) {
        $('.investorSearchTable').show();

      // Check if the top search bar is being used
      } else if ( $('.mainSearch').is(':focus') || $('.mainSearchTable').is(':focus') ) {
        $('.mainSearchTable').show();
      }
    });
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
    <Route name="faq" handler={AboutPage} />
    <Route name="categories" handler={CategoriesPage} />
    <Route name="category" path="/categories/:category" handler={CategoryPage}/>
    <Route name="categoryRequest" path="/categoryRequest/:userId/:categoryName/:action/:expert" handler={CategoryRequestPage} />
    <Route name="contactUs" handler={ContactUsPage} />
    <Route name="home/:firstTime" handler={HomePage} />
    <Route name="home" handler={HomePage} />
    <Route name="login" handler={LoginPage} />
    <Route name="profile" path="/user/:userId" handler={ProfilePage}/>
    <Route name="search" path="/search/:query" handler={SearchPage}/>
    <Route name="/login/:id/:hash" handler={LoginPage} />
    <Route name="passwordReset" path="/passwordReset/:token" handler={PasswordResetPage} />
    <Route name="team" handler={TeamPage} />
    <Route name="termsOfService" handler={TermsOfServicePage} />
    <Route name="verification" path="/verify/:token/" handler={VerificationPage} />
    <Route name="verificationWithInvite" path="/verify/:token/:inviterId/:hash" handler={VerificationPage} />
  </Route>
);

Router.run(routes, function (Handler, state) {
  React.render(<Handler params={state.params} query={state.query} />, document.getElementById('repsapp'));
 });
