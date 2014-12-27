'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var CategoryPageHeader = require('./CategoryPageHeader.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var LeaderTable = require('./LeaderTable.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var Toolbar = require('./Toolbar.jsx');

var CategoryPage = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    PubSub.subscribe('userupdate', this.resetCurrentUser);
    this.setCategory(this.props.params.category);
    this.resetCurrentUser();
  },

  componentWillUnmount: function () {
    PubSub.unsubscribe('userupdate', this.resetCurrentUser);
  },

  componentWillReceiveProps: function(newProps) {
    this.setCategory(newProps.params.category);
  },

  setCurrentUser: function(currentUser) {
    this.setState({ currentUser: currentUser });
  },

  resetCurrentUser: function() {
    auth.getCurrentUser.call(this, this.setCurrentUser);
  },

  setCategory: function(category) {
    var url = 'api/categories/' + category;
    $.ajax({
      url: url,
      success: function(category) {
        this.setState({ category: category });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.params.category, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var categoryPageHeader = '';
    if (this.state.category && this.state.currentUser) {
      categoryPageHeader = <CategoryPageHeader category={this.state.category} currentUser={this.state.currentUser} />;
    }
    return (
      <div className="categoryPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row header">
          {categoryPageHeader}
        </div>
        <div className="row">
          <div className="col-md-3">
            <div className="expert-table">
              <LeaderTable category={this.props.params.category} expert={true}/>
            </div>
          </div>
          <div className="col-md-6">
            <div className="feed-table">
              <Feed category={this.props.params.category} parent="CategoryPage" />
            </div>
          </div>
          <div className="col-md-3">
            <div className="investor-table">
              <LeaderTable category={this.props.params.category} expert={false}/>
            </div>
          </div>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  }
});

module.exports = CategoryPage;
