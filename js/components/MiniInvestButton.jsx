'use strict';

var $ = require('jquery');
var Modal = require('./Modal.jsx');
var React = require('react');

var MiniInvestButton = React.createClass({
  getInitialState: function() {
    return {
      showModal: false,
      user: null
    };
  },

  handleShowModal: function() {
    // In some cases, we may not be given a user.
    // We will need to fetch the user ourselves
    // In this case, we will have to have a userId prop
    if (this.props.user) {
      this.refs.modal.show();
    } else {
      $.ajax({
        url: '/api/users/' + this.props.userId,
        success: function(user) {
          this.setState({ user: user });
          this.refs.modal.show();
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(xhr.responseText, err.toString());
        }.bind(this)
      });
    }
  },

  render: function() {
    var user = this.props.user || this.state.user;
    var modal = '';
    if (user) {
      modal = <Modal ref="modal" show={false} user={user} currentUser={this.props.currentUser} className="modal-open"/>;
    }

    return (
      <div className="mini-investmentButton">
        <button onClick={this.handleShowModal} className="btn btn-primary">Invest</button>
        {modal}
      </div>
    );
  }
});

module.exports = MiniInvestButton;
