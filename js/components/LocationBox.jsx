'use strict';

var LocationInput = require('./LocationInput.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var LocationBox = React.createClass({
  getInitialState: function() {
    return {
      showInput: false,
      showEdit: false
    };
  },

  resetState: function() {
    this.setState({
      showInput: false,
      showEdit: false
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
    var locationBox = this.props.user.location ? <em>Lives in {this.props.user.location}</em> : '';
    var edit = '';

    if (this.props.currentUser._id === this.props.user._id) {
      if (this.state.showInput) {
        locationBox = <LocationInput currentUser={this.props.currentUser} user={this.props.user} onReset={this.closeInputBox} />
      } else {
        locationBox = this.props.user.location ? <em>Lives in {this.props.user.location}</em> : <em>{strings.ADD_LOCATION}</em>;
      }

      if (this.state.showEdit) {
        edit = <div className="edit">
          <a onClick={this.handleEditClick}><span className="pencil glyphicon glyphicon-pencil"></span></a>
        </div>;
      }
    }

    return (
      <div className="locationBox" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        {edit}
        {locationBox}
      </div>
    );
  }
});

module.exports = LocationBox;
