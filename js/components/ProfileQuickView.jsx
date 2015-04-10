'use strict';

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var ProfileQuickView = React.createClass({
  handleImgError: function() {
    $('.quick-view-image').attr('src', strings.DEFAULT_USER_PIC);
  },

  getExpertCategories: function() {
    var categories = [];
    for (var i = 0; i < this.props.currentUser.categories.length; i++) {
      var category = this.props.currentUser.categories[i];
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
    for (var i = 0; i < this.props.currentUser.portfolio.length; i++) {
      var category = this.props.currentUser.portfolio[i];
      categories.push(
        <div className="list-group-item" key={i}>
          <span className="badge">{category.investments.length} investments</span>
          <Link to="category" params={{category: category.category}}>{category.category}</Link>
        </div>
      );
    }

    if (categories.length === 0) {
      categories.push(<div className="list-group-item">{strings.NO_INVESTOR_CATEGORIES}</div>);
    }

    return (
      <div className="list-group">
        <strong>{strings.INVESTOR_CATEGORIES} ( {this.props.currentUser.reps} reps )</strong>
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

    profileLink = <Link to="profile" params={{userId: this.props.currentUser._id}}>{this.props.currentUser.username}</Link>;
    about = this.props.currentUser.about ? this.props.currentUser.about : '';

    if (this.props.currentUser.picture && this.props.currentUser.picture.url) {
      imgUrl = this.props.currentUser.picture.url;
    }

    expertCategories = this.getExpertCategories();
    investorCategories = this.getInvestorCategories();

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
