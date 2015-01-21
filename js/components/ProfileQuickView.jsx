'use strict';

var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var ProfileQuickView = React.createClass({
  getInitialState: function() {
    return { currentUser: null };
  },

  handleImgError: function() {
    $('.quick-view-image').attr('src', strings.DEFAULT_USER_PIC);
  },

  componentDidMount: function() {
    auth.getCurrentUser(function(user) {
      this.setState({ currentUser: user });
    }.bind(this));
  },

  getExpertCategories: function() {
    var categories = [];
    for (var i = 0; i < this.state.currentUser.categories.length; i++) {
      var category = this.state.currentUser.categories[i];
      categories.push(
        <div className="list-group-item" key={i}>
          <span className="badge">{category.reps} reps</span>
          <Link to="category" params={{category: category.name}}>{category.name}</Link>
        </div>
      );
    }

    if (categories.length === 0) {
      categories.push(<div className="list-group-item">{strings.NO_EXPERT_CATEGORIES}</div>);
    }

    return (
      <div className="list-group">
        <strong>{strings.EXPERT_CATEGORIES_IMPERSONAL}</strong>
        {categories}
      </div>
    );
  },

  getInvestorCategories: function() {
    var categories = [];
    for (var i = 0; i < this.state.currentUser.portfolio.length; i++) {
      var category = this.state.currentUser.portfolio[i];
      categories.push(
        <div className="list-group-item" key={i}>
          <span className="badge">{category.reps} reps</span>
          <Link to="category" params={{category: category.category}}>{category.category}</Link>
        </div>
      );
    }

    if (categories.length === 0) {
      categories.push(<div className="list-group-item">{strings.NO_INVESTOR_CATEGORIES}</div>);
    }

    return (
      <div className="list-group">
        <strong>{strings.INVESTOR_CATEGORIES}</strong>
        {categories}
      </div>
    );
  },

  render: function() {
    var profileLink = '';
    var about = '';
    var imgUrl = strings.DEFAULT_USER_PIC;
    var expertCategories = '';
    var investorCategories = '';
    if (this.state.currentUser) {
      profileLink = <Link to="profile" params={{userId: this.state.currentUser._id}}>{this.state.currentUser.username}</Link>;
      about = this.state.currentUser.about ? this.state.currentUser.about : '';

      if (this.state.currentUser.picture && this.state.currentUser.picture.url) {
        imgUrl = this.state.currentUser.picture.url;
      }

      expertCategories = this.getExpertCategories();
      investorCategories = this.getInvestorCategories();
    }

    return (
      <div className="profileQuickView">
        <div className="panel panel-default">
          <div className="panel-heading">
            <div className="quickview-heading-text">
              <h4>{profileLink}</h4>
              <p>{about}</p>
            </div>
            <img className="quick-view-image img-thumbnail" src={imgUrl} onError={this.handleImgError}></img>
          </div>
          <div className="panel-body">
            {expertCategories}
            {investorCategories}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProfileQuickView;
