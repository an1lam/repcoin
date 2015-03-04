'use strict';

var $ = require('jquery');
var Modal = require('./Modal.jsx');
var React = require('react');

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
      <div className="mini-invest-button">
        <button onClick={this.handleShowModal} className="btn btn-primary">Invest</button>
        {modal}
      </div>
    );
  }
});

module.exports = InvestmentButton;
