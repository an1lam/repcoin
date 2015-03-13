'use strict';

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var AuthActionCreator = require('../actions/AuthActionCreator.js');
var AuthStore = require('../stores/AuthStore.js');
var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');
var CategoriesCards = require('./CategoriesCards.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
var Dashboard = require('./Dashboard.jsx');
var FacebookInvite = require('./FacebookInvite.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var ProfileQuickView = require('./ProfileQuickView.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');
var Toolbar = require('./Toolbar.jsx');
var TutorialPanel = require('./TutorialPanel.jsx');

function getStateFromStores() {
  return {
    isNewby: AuthStore.isNewby(),
    currentUser: AuthStore.getCurrentUser(),
  }
}

var HomePage = React.createClass({
  mixins: [AuthenticatedRoute],
  componentDidMount: function() {
    AuthStore.addCurrentUserListener(this._onChange);
    AuthActionCreator.getCurrentUser();
    CategoriesActionCreator.getHotCategoriesAndUsers();
  },

  componentWillUnmount: function() {
    AuthStore.removeCurrentUserListener(this._onChange);
  },

  getInitialState: function() {
    return getStateFromStores();
  },

  startTutorial: function() {
    this.refs.tutorial.show();
  },

  render: function() {
    var toShowTutorial = false;
    var categoriesCards = '';
    var dashboard = '';
    if (this.state.currentUser) {
      dashboard = <Dashboard currentUser={this.state.currentUser} />
    }

    if (this.state.isNewby) {
      categoriesCards = (
        <CategoriesCards currentUser={this.state.currentUser} />
      );
    }

    return (
      <div className="homePage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row">
          <div className="col-md-3">
            <div className="left-panel">
              <FacebookInvite />
              <ProfileQuickView />
            </div>
          </div>
          <div className="col-md-9">
            {categoriesCards}
            <div className="main-dashboard">
              {dashboard}
            </div>
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
  },
});

module.exports = HomePage;
