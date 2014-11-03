"use strict";

var React = require('react');

var AboutBox = React.createClass({
  render: function() {
    var aboutBox = '';
    if (this.props.user.about) {
      aboutBox = <p>{this.props.user.about}</p>;
    } else if (this.props.user._id === this.props.currentUser._id) {
      aboutBox = <em>Add a brief description of yourself!</em>;
    }
    return (
      <div className="aboutBox">
        {aboutBox}
      </div>
    );    
  }
});

module.exports = AboutBox;
