'use strict';

var MiniInvestButton = require('./MiniInvestButton.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var CategoryExpertTableItem = React.createClass({

  render: function() {
    var user = this.props.user;
    var investmentButton = '';
    //if (this.props.currentUser._id !== this.props.user._id) {
    //  investmentButton = <MiniInvestButton user={this.props.user} currentUser={this.props.currentUser}/>;
    //}
    var img = '';
    if (user.picture && user.picture.url) {
      img = <img className="user-table-img" src={user.picture.url}></img>;
    } else {
      img = <img className="user-table-img" src={strings.DEFAULT_USER_PIC}></img>;
    }
    return (
      <tr>
        <td>
          {investmentButton}
          <Link to="profile" params={{userId: user._id}}>{user.username}</Link>
          {img}
        </td>
        <td><div className="about-column">{user.about}</div></td>
        <td>{user.rank}</td>
        <td>{user.reps}</td>
      </tr>
    );
  },
});

module.exports = CategoryExpertTableItem;
