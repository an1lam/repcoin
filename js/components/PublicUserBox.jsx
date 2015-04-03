'use strict';

var auth = require('../auth.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var PublicUserBox = React.createClass({

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

module.exports = PublicUserBox;
