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
    var ghostName = this.refs.ghostName.getDOMNode().value.trim();
    if (!ghostName) {
      this.setState({ error: true, msg: 'No name provided' });
      return;
    }

    $.ajax({
      url: '/api/users/' + this.props.currentUser._id + '/ghost/' + ghostName,
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
                <input type="text" className="form-control" ref="ghostName" placeholder="Enter ghost name" />
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
