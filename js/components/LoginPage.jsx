'use strict';
var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var AuthActionCreator = require('../actions/AuthActionCreator.js')
var AuthStore = require('../stores/AuthStore.js');
var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');
var CategoriesStore = require('../stores/CategoriesStore.js');
var Footer = require('./Footer.jsx');
var Login = require('./Login.jsx');
var Signup = require('./Signup.jsx');
var strings = require('../lib/strings_utils.js');

function getStateFromStores() {
  return {
    totalTraded: CategoriesStore.getTotalTraded(),
    showLogin: AuthStore.getShowLogin(),
    loggedIn: AuthStore.getLoggedIn(),
  }
}

var LoginPage = React.createClass({
  mixins: [ Router.Navigation ],

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    CategoriesStore.addTotalTradedChangeListener(this._onChange);
    AuthStore.addLoggedInListener(this._onChange);
    CategoriesActionCreator.getTotalTraded();
    AuthActionCreator.getLoggedIn();
  },

  componentWillUnmount: function() {
    CategoriesStore.removeTotalTradedChangeListener(this._onChange);
    AuthStore.removeLoggedInListener(this._onChange);
  },

  componentWillUpdate: function() {
    if (this.state.loggedIn) {
      this.transitionTo('/home');
    }
  },

  handleLoginClick: function() {
    AuthActionCreator.toggleShowLogin();
  },

  render: function() {
    var login = this.state.showLogin ? <Login /> : '';
    var signUp;
    if (this.props.params.hash && this.props.params.id) {
      signUp = <Signup id={this.props.params.id}
                    hash={this.props.params.hash} />
    } else {
      signUp = <Signup />
    }

    return (
      <div className="loginPage">
        <div className="loginBody">
          <div className="login-form">
            <button onClick={this.handleLoginClick} type="button" ref="login" className="loginButton btn btn-default">Log In</button><br />
            <div className='login-wrapper'>
              {login}
            </div>
          </div>
          <div className="row">
            <div className="logo"><img src="http://res.cloudinary.com/repcoin/image/upload/v1423513285/2RepCoinHeader_mwyh9z.png"></img></div>
          </div>
          <span className="slogan">
            <h1>The only market-based approach to reputation</h1>
          </span>
          <div className="signup-form">
            {signUp}
          </div>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getStateFromStores());
  }
});

module.exports = LoginPage;
