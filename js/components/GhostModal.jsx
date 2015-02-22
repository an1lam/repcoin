'use strict';

var $ = require('jquery');

var PubSub = require('pubsub-js');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var GhostModal = React.createClass({
  mixins: [ModalMixin],

  getInitialState: function() {
    return {
      error: false,
      msg: null
    };
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var ghostFirstName = this.refs.ghostFirstName.getDOMNode().value.trim();
    var ghostLastName = this.refs.ghostLastName.getDOMNode().value.trim();
    var ghostAbout = this.refs.ghostAbout.getDOMNode().value.trim();
    if (!ghostFirstName || !ghostLastName || !ghostAbout) {
      this.setState({ error: true, msg: 'Missing fields' });
      return;
    }

    var url = '/api/users/' + this.props.currentUser._id
        + '/ghost'
        + '/' + ghostFirstName
        + '/' + ghostLastName
        + '/' + ghostAbout;
    $.ajax({
      url: url,
      type: 'POST',
      success: function(msg) {
        this.setState({ error: false, msg: msg });
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseText !== 'Error') {
          this.setState({ error: true, msg: xhr.responseText });
        }
        console.error(xhr.responseText);
      }.bind(this)
    });
  },

  render: function() {
    var msg = '';
    if (this.state.msg) {
      var clazz = this.state.error ? 'alert alert-danger' : 'alert alert-info';
      var msg = <div className={clazz} role="alert">
        <p>{this.state.msg}</p></div>;
    }

    var modalStyleOverride = {
      'zIndex': 1050,
    };

    return (
      <div className="modal">
        <div className="modal-dialog" style={modalStyleOverride}>
          <div className="modal-content">
            <div className="modal-header">
              {this.renderCloseButton()}
            </div>
            <div className="modal-body">
              <h3>Ghost Profiles</h3>
              <p>{strings.CREATE_A_GHOST}</p>
              {msg}
              <form onSubmit={this.handleSubmit}>
                <input type="text" className="form-control" ref="ghostFirstName" placeholder="Ghost first name" />
                <input type="text" className="form-control" ref="ghostLastName" placeholder="Ghost last name" />
                <input type="text" className="form-control" ref="ghostAbout" placeholder="Ghost about (max 200 characters)" />
                <button className="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = GhostModal;
