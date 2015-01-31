'use strict';

var $ = require('jquery');
var Modal = require('./Modal.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var InvestmentButton = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },

  componentDidMount: function() {
    $('.investment-button-info').popover({ trigger: 'hover focus' });
  },

  handleShowModal: function() {
    this.refs.modal.show();
  },

  render: function() {
    var modal = <Modal ref="modal" show={false} user={this.props.user} currentUser={this.props.currentUser} className="modal-open"/>;

    return (
      <div className="InvestmentButton">
        <button onClick={this.handleShowModal} className="btn btn-primary btn-lg">{strings.INVEST_IN_USER(this.props.user.username)}</button>
        <span className="investment-button-info glyphicon glyphicon-info-sign" data-toggle="popover" data-placement="bottom" data-content={strings.INVESTMENT_BUTTON_INFO_CONTENT}></span>
        {modal}
      </div>
    );
  }
});

module.exports = InvestmentButton;
