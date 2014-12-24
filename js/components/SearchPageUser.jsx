"use strict";

var DEFAULT_LINK = "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png";
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var SuperScore = require('./SuperScore.jsx');

var SearchPageUser = React.createClass({
  handleImgError: function() {
    $(".img-thumbnail").attr("src", DEFAULT_LINK);
  },

  render: function() {
    var about = this.props.user.about || '';
    var imgUrl = this.props.user.picture && this.props.user.picture.url || DEFAULT_LINK;
    return (
      <div className="searchPageItem searchPageUser">
        <div>
          <img className="img-thumbnail" src={imgUrl} onError={this.handleImgError} ></img>
        </div>
        <div>
          <Link to="profile" params={{userId: this.props.user._id}}>
            <h2>{this.props.user.username}</h2>
          </Link>
          <p>{about}</p>
          <SuperScore user={this.props.user} />
        </div>
      </div>
    );
  }
});

module.exports = SearchPageUser;
