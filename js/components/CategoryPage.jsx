'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var CategoryDashboard = require('./CategoryDashboard.jsx');
var CategoryPageHeader = require('./CategoryPageHeader.jsx');
var ErrorPage = require('./ErrorPage.jsx');
var Feed = require('./Feed.jsx');
var Footer = require('./Footer.jsx');
var LeaderTable = require('./LeaderTable.jsx');
var TrendingTable = require('./TrendingTable.jsx');
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
        if (category) {
          this.setState({ category: category, error: null });
        } else {
          this.setState({ error: 404 });
        }
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({ error: status });
        console.error(this.props.params.category, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    var categoryPageHeader = '';
    var leaderTable = '';
    var trendingTable = '';
    var investorTable = '';
    if (this.state.category && this.state.currentUser) {
      categoryPageHeader = <CategoryPageHeader category={this.state.category} currentUser={this.state.currentUser} />;
    }
    if (this.state.category) {
      trendingTable = <TrendingTable category={this.state.category} />
      leaderTable = <LeaderTable category={this.state.category} expert={true}/>
      investorTable = <LeaderTable category={this.state.category} expert={false}/>
    }

    if (this.state.error) {
      var mainBody = <ErrorPage type={this.state.error} />

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
                {leaderTable}
              </div>
            </div>
            <div className="col-md-6">
              <div className="feed-table">
                <CategoryDashboard category={this.props.params.category} />
              </div>
            </div>
            <div className="col-md-3">
              <div className="investor-table">
                {investorTable}
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
  }
});

module.exports = CategoryPage;
