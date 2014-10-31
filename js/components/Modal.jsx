/** @jsx React.DOM */
"use strict";

var React = require('react');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');

var Modal = React.createClass({
  mixins: [ModalMixin],

  render: function() {
    var modalStyleOverride = {
      'zIndex': 1050,
    };
    return (
      <div className="modal">
        <div className="modal-dialog" style={modalStyleOverride}>
          <div className="modal-content">
            <div className="modal-header">
              {this.renderCloseButton()}
              <strong>Header</strong>
            </div>
            <div className="modal-body">Body</div>
            <div className="modal-footer">Footer</div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Modal;
