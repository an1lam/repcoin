'use strict';

var $ = require('jquery');
var AuthActionCreator = require('../actions/AuthActionCreator.js');
var AuthStore = require('../stores/AuthStore.js');
var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');
var CategoriesStore = require('../stores/CategoriesStore.js');
var CategoryDashboard = require('./CategoryDashboard.jsx');
var CategoryPageHeader = require('./CategoryPageHeader.jsx');
var ErrorPage = require('./ErrorPage.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var TrendingTable = require('./TrendingTable.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var Toolbar = require('./Toolbar.jsx');

function getStateFromStores() {
  return {
    category: CategoriesStore.getCurrentCategory(),
    currentCategoryError: CategoriesStore.getCurrentCategoryError(),
    currentUser: AuthStore.getCurrentUser(),
  }
}

var CategoryPage = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    AuthStore.addCurrentUserListener(this._onChange);
    AuthActionCreator.getCurrentUser();
    CategoriesStore.addChangeListener(this._onChange);
    CategoriesActionCreator.getCurrentCategory(this.props.params.category);
  },

  componentWillUnmount: function() {
    AuthStore.removeCurrentUserListener(this._onChange);
    CategoriesStore.removeChangeListener(this._onChange);
  },

  componentWillReceiveProps: function(newProps) {
    CategoriesActionCreator.getCurrentCategory(newProps.params.category);
  },

  render: function() {
    var categoryPageHeader = '';
    var trendingTable = '';
    var categoryDashboard = '';

    // We check for the currentUser in each of these components
    if (this.state.category) {
      categoryPageHeader = <CategoryPageHeader category={this.state.category} currentUser={this.state.currentUser} />;
      trendingTable = <TrendingTable category={this.state.category} currentUser={this.state.currentUser} />
      categoryDashboard = <CategoryDashboard category={this.props.params.category} currentUser={this.state.currentUser} />;
    }

    if (this.state.currentCategoryError) {
      var mainBody = <ErrorPage type={this.state.currentCategoryError} />

    } else {
      var mainBody = (
        <div>
          <div className="row header">
            {categoryPageHeader}
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="expert-table">
                {trendingTable}
              </div>
            </div>
            <div className="col-md-8">
              <div className="feed-table" key={this.props.params.category}>
                {categoryDashboard}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="categoryPage">
        <div className="row">
          <Toolbar />
        </div>
        {mainBody}
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

module.exports = CategoryPage;
