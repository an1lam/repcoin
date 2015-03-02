'use strict';

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var AuthStore = require('../stores/AuthStore.js');
var CategoriesCards = require('./CategoriesCards.jsx');
var CategoriesTable = require('./CategoriesTable.jsx');
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
  getInitialState: function() {
    return getStateFromStores();
  },

  startTutorial: function() {
    this.refs.tutorial.show();
  },

  render: function() {
    var categoriesCards = '';

    console.log(this.state.isNewby);
    if (this.state.isNewby) {
      console.log(this.state.currentUser);
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
            <ProfileQuickView />
          </div>
          <div className="col-md-6">
            {categoriesCards}
            <Feed parent="HomePage" />
          </div>
          <div className="col-md-2">
            <FacebookInvite />
            <div className="tutorial">
              <button className="btn btn-default" onClick={this.startTutorial}>
                Take a Tour of the Site
              </button>
              <TutorialPanel show={false} key="tutorial-panel-1"
                title={strings.FEED_INFO_TITLE}
                content={strings.FEED_INFO_CONTENT} ref="tutorial"
                clazz={"feed-tutorial-panel"} className={"modal-open"} />
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
