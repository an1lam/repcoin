'use strict';

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var SearchPageUser = React.createClass({
  handleImgError: function() {
    $(".img-thumbnail").attr("src", strings.DEFAULT_USER_PIC);
  },

  render: function() {
    var about = this.props.user.about || '';
    var imgUrl = strings.DEFAULT_USER_PIC;
    if (this.props.user.picture && this.props.user.picture.url) {
      imgUrl = this.props.user.picture.url;
    }
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
        </div>
      </div>
    );
  }
});

module.exports = SearchPageUser;
