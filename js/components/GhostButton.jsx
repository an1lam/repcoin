'use strict';

var $ = require('jquery');
var GhostModal = require('./GhostModal.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var GhostButton = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },

  handleShowModal: function() {
    this.refs.modal.show();
  },

  render: function() {
    var modal = <GhostModal ref="modal" show={false} currentUser={this.props.currentUser} className="modal-open"/>;

    return (
      <div className="GhostButton">
        <button onClick={this.handleShowModal} className="btn btn-default">New Ghost</button>
        {modal}
      </div>
    );
  }
});

module.exports = GhostButton;
