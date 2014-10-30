/** @jsx React.DOM */
"use strict";

var React = require('react');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');

var Modal = React.createClass({
  mixins: [ModalMixin],
 
  render: function() {
    return (
      <div className="modal fade">
        <div className="modal-dialog">
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
