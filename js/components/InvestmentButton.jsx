/** @jsx React.DOM */
"use strict";

var React = require('react');
var Modal = require('./Modal.jsx');
var $ = require('jquery');

var InvestmentButton = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },

  handleShowModal: function() {
    this.refs.modal.show();
  },

  render: function() {
    var modal = <Modal ref="modal" show={false} user={this.props.user} currentUser={this.props.currentUser} className="modal-open"/>;

    return (
      <div className="InvestmentButton">
        <button onClick={this.handleShowModal} className="btn btn-primary btn-lg">Invest in {this.props.user.username}</button>
        {modal}
      </div>
    );
  }
});

module.exports = InvestmentButton;
