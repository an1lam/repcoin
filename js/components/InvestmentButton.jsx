/** @jsx React.DOM */
"use strict";

var React = require('react');
var Modal = require('./Modal.jsx');

var InvestmentButton = React.createClass({

  handleShowModal: function() {
    this.refs.modal.show();
  },

  render: function() {
    return (
      <div className="InvestmentButton">
        <button onClick={this.handleShowModal} className="btn btn-default">Invest</button>
        <Modal ref="modal"
          show={false} />
      </div>
    );
  }
});

module.exports = InvestmentButton;
