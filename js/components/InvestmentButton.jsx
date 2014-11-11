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
    this.setState({ showModal: true });
  },

  handleHideModal: function() {
    $('body').removeClass('modal-open');
    this.setState({ showModal: false });
  },

  render: function() {
    var modal = '';
    if (this.state.showModal) {
      modal = <Modal ref="modal" show={true} hide={this.handleHideModal} user={this.props.user} currentUser={this.props.currentUser} className="modal-open"/>;
    }

    return (
      <div className="InvestmentButton">
        <button onClick={this.handleShowModal} className="btn btn-default">Invest</button>
        {modal}
      </div>
    );
  }
});

module.exports = InvestmentButton;
