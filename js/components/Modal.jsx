/** @jsx React.DOM */
"use strict";

var React = require('react');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');

var Modal = React.createClass({
  mixins: [ModalMixin],

  handleSubmit: function(event) {
    event.preventDefault();

  },

  render: function() {
    var modalStyleOverride = {
      'zIndex': 1050,
    };
    var categories = this.props.user.categories.map(function(category) {
      return <option key={category.id} value={category.name}>{category.name}</option>;
    });
    return (
      <div className="modal">
        <div className="modal-dialog" style={modalStyleOverride}>
          <div className="modal-content">
            <div className="modal-header">
              {this.renderCloseButton()}
              <span><h3> {this.props.user.username} </h3></span>
            </div>
            <form onSubmit={this.handleSubmit} className="navbar-form">
            <div className="modal-body container">
                <div className="give-revoke-dropwdown">
                  <select ref="giveOrRevoke" className="form-control">
                    <option value="give">Give</option>
                    <option value="revoke">Revoke</option>
                  </select>
                </div>
                <div className="categories-dropdown">
                  <strong className="reps_form-label">Categories:</strong>
                  <select ref="category" className="form-control">
                    {categories}
                  </select>
                </div>
                <div className="reps_padder">
                  <strong className="reps_form-label">Amount:</strong><input type="text" placeholder="10" className="form-control reps_text-input" ref="amount"></input>
                </div>
                <div>
                  <button type="submit" className="btn btn-lg btn-primary reps_invest-button">Invest</button>
                </div>
            </div>
            </form>
            <div className="modal-footer"></div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Modal;
