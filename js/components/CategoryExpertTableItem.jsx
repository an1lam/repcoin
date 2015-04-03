'use strict';

var MiniInvestButton = require('./MiniInvestButton.jsx');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var strings = require('../lib/strings_utils.js');

var CategoryExpertTableItem = React.createClass({

  render: function() {
    var user = this.props.user;

    // When we create the investment button, we pass in the user id
    // Each TableItem really has a fake user that is truncated
    // The MiniInvestmentButton will fetch the full one based on the id
    var investmentButton = '';
    if (this.props.currentUser && this.props.currentUser._id !== this.props.user._id) {
      console.log('redoing investment button for expert table');
      investmentButton = <MiniInvestButton userId={this.props.user._id} currentUser={this.props.currentUser}/>;
    }

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
