"use strict";

var AboutInput = require('./AboutInput.jsx');
var React = require('react');

var AboutBox = React.createClass({
  getInitialState: function() {
    return { 
      showInput: false,
      showEdit: false
    };
  },

  handleEditClick: function() {
    this.setState({ showEdit: false, showInput: true });
  },

  handleMouseOver: function() {
    if (!this.state.showInput) {
      this.setState({ showEdit: true });
    }
  },

  handleMouseLeave: function() {
    this.setState({ showEdit: false });
  },

  closeInputBox: function() {
    this.setState({ showInput: false });
  },

  render: function() {
    var aboutBox = this.props.user.about ? <p>{this.props.user.about}</p> : '';
    var edit = '';

    if (this.props.currentUser._id === this.props.user._id) {
      if (this.state.showInput) {
        aboutBox = <AboutInput currentUser={this.props.currentUser} user={this.props.user} onReset={this.closeInputBox} text={this.props.about} /> 
      } else {
        aboutBox = this.props.user.about ? <p>{this.props.user.about}</p> : <em>Add a brief description of yourself!</em>; 
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
