'use strict';

var AboutInput = require('./AboutInput.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var AboutBox = React.createClass({
  getInitialState: function() {
    return {
      showInput: false,
      showEdit: true
    };
  },

  resetState: function() {
    this.setState({
      showInput: false,
      showEdit: true
    });
  },

  componentWillReceiveProps: function(newProps) {
    if (this.props.user._id !== newProps.user._id) {
      this.resetState();
    }
  },

  handleEditClick: function() {
    this.setState({ showEdit: false, showInput: true });
  },

  closeInputBox: function() {
    this.setState({ showEdit: true, showInput: false });
  },

  render: function() {
    var aboutBox = this.props.user.about ? <p>{this.props.user.about}</p> : '';
    var edit = '';

    if (this.props.currentUser && this.props.currentUser._id === this.props.user._id) {
      if (this.state.showInput) {
        aboutBox = <AboutInput currentUser={this.props.currentUser} user={this.props.user} onReset={this.closeInputBox} text={this.props.about} />
      } else {
        aboutBox = this.props.user.about ? <p>{this.props.user.about}</p> : <em>{strings.ADD_BRIEF_DESCRIPTION}</em>;
      }

      if (this.state.showEdit) {
        edit = <div className="edit">
          <a onClick={this.handleEditClick}><span className="pencil glyphicon glyphicon-pencil"></span></a>
        </div>;
      }
    }

    return (
      <div className="aboutBox" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        {edit}
        {aboutBox}
      </div>
    );
  }
});

module.exports = AboutBox;
