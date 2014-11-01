"use strict";

var React = require('react');

var AboutBox = React.createClass({
  render: function() {
    if (this.props.user.about) {
      return (
        <div className="aboutBox">
          <p>{this.props.user.about}</p>
        </div>
      );
    } else {
      return (
        <div className="aboutBox"></div>
      );
    }
  }
});

module.exports = AboutBox;
