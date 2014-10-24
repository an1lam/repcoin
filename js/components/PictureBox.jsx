/** @jsx React.DOM */
"use strict";

var React = require('react');
var auth = require('../auth.jsx');

var PictureBox = React.createClass({
  getInitialState: function() {
    return { showEdit: false, currentUser: null };
  },

  componentDidMount: function() {
    auth.getCurrentUser.call(this, this.setUser);
  },

  setUser: function(currentUser) {
    this.setState({ currentUser: currentUser });
  },

  handleMouseOver: function() {
    this.setState({ showEdit: true });
  },

  handleMouseLeave: function() {
    this.setState({ showEdit: false });
  },

  render: function() {
    var edit = '';
    if (this.state.currentUser && this.state.currentUser._id == this.props.user._id) {
      if (this.state.showEdit) {
        edit = <div className="editPhoto">
                <span className="glyphicon glyphicon-camera"></span>
                <p className="pictureEditText" >Update profile picture</p>
               </div>;
      }
    }

    return (
      <div className="pictureBox" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        <img className="img-thumbnail" src={this.props.user.picture}></img>
      {edit}
      </div>
    );
  }

});

module.exports = PictureBox;
