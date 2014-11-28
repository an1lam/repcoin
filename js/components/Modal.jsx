"use strict";

var React = require('react');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var $ = require('jquery');

var Modal = React.createClass({
  mixins: [ModalMixin],

  getInitialState: function() {
    return { error: "" };
  },

  validateAndCreateTransaction: function(
    categoryName, reps, anonymous, giveOrRevoke
  ) {
    var transactionCategory;
    for (var i = 0; i < this.props.user.categories.length; i++) {
      var currentCategory = this.props.user.categories[i];
      if (currentCategory.name === categoryName) {
        transactionCategory = currentCategory;
      }
    }
    if (giveOrRevoke === 'give') {
      if (!transactionCategory || transactionCategory.reps < reps) {
        this.setState({error: true});
      } else {
        this.setState({error: false});
        this.createTransaction(
          this.props.user, this.props.currentUser, categoryName, reps,
          anonymous);
      }
    } else {
      var currentUserPortfolio = this.props.currentUser.portfolio;
      for (var i = 0; i < currentUserPortfolio.length; i++) {
        if (currentUserPortfolio[i].category === categoryName) {
          var categoryInvestments = currentUserPortfolio[i].investments;
          for (var j = 0; j < categoryInvestments.length; j++) {
            // Confirm that the amount we are revoking is equal
            // to some fraction of the valuation that matches reps values
            var isValidSellAmount = reps % (categoryInvestments[i].valuation / categoryInvestments[i].amount) === 0;
            if (
              categoryInvestments[j].user === this.props.user.username &&
              categoryInvestments[j].valuation > reps &&
              isValidSellAmount && transactionCategory
            ) {
              this.setState({error: false});
              this.createTransaction(
                this.props.user, this.props.currentUser, categoryName, -reps,
                anonymous);
              return;
            }
          }
        }
      }
      this.setState({error: true});
    }
  },

  createTransaction: function(toUser, fromUser, category, amount, anonymous) {
    var to = { "name": toUser.username, "id": toUser._id };
    var from = { "name": fromUser.username, "anonymous": anonymous, "id": fromUser._id };
    $.ajax({
      url: '/api/transactions',
      type: 'POST',
      data: {
        to: to,
        from: from,
        category: category,
        amount: amount,
        anonymous: anonymous,
      },
      success: function(transaction) {
        $.ajax({
          url: '/api/users/' + fromUser._id,
          type: 'GET',
          success: function(user) {
            auth.storeCurrentUser(user, function(user) {
              return user;
            });
            PubSub.publish('profileupdate');
            this.props.hide();
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err.toString());
          },
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var reps = Number(this.refs.amount.getDOMNode().value);
    var categoryName = this.refs.category.getDOMNode().value;
    var anonymous = this.refs.anonymous.getDOMNode().checked;
    var giveOrRevoke = this.refs.giveOrRevoke.getDOMNode().value;
    this.validateAndCreateTransaction(
      categoryName, reps, anonymous, giveOrRevoke);
  },

  render: function() {
    var modalStyleOverride = {
      'zIndex': 1050,
    };

    var error = this.state.error ? 'You don\'t have that many reps in that category':'';
    var currentUserPortfolio = this.props.currentUser.portfolio;
    var valuationTable = '';
    var valuationData = [];
    var categories = this.props.user.categories.map(function(category) {
      for (var i = 0; i < currentUserPortfolio.length; i++) {
        if (currentUserPortfolio[i].category === category.name && currentUserPortfolio[i].reps > 0) {
          var categoryInvestments = currentUserPortfolio[i].investments;
          for (var j = 0; j < categoryInvestments.length; j++) {
            if (categoryInvestments[j].user === this.props.user.username) {
              valuationData.push(<tr key={category.id}>
                <td>{category.name}</td>
                <td>{categoryInvestments[j].amount}</td>
                <td>{categoryInvestments[j].valuation}</td>
              </tr>);
            }
          }
          return <option key={category.id} value={category.name}>{category.name} ({currentUserPortfolio[i].reps})</option>;
        }
      }
    }.bind(this));
    if (valuationData.length > 0) {
      valuationTable = (
        <table className="table table-bordered reps_table-nonfluid">
          <thead>
            <tr><th>Category</th><th>Amount</th><th>Valuation</th></tr>
          </thead>
          <tbody>
            {valuationData}
          </tbody>
        </table>
      );
    }
    return (
      <div className="modal reps_modal">
        <div className="modal-dialog" style={modalStyleOverride}>
          <div className="modal-content">
            <div className="modal-header">
              {this.renderCloseButton()}
              <span><h3> {this.props.user.username} </h3></span>
            </div>
            <form onSubmit={this.handleSubmit} className="navbar-form">
            <div className="modal-body container">
                <div className="give-revoke-dropwdown">
                  <select ref="giveOrRevoke"
                    className="form-control give-revoke-select">
                    <option value="give">Give</option>
                    <option value="revoke">Revoke</option>
                  </select>
                </div>
                <div className="categories-dropdown">
                  <div className="reps_padder">
                    <strong>Anonymous</strong>: <input type="checkbox"
                      ref="anonymous" className="reps_checkbox" />
                  </div>
                  <strong className="reps_form-label">Categories:</strong>
                  <select ref="category" className="form-control">
                    {categories}
                  </select>
                  <div className="reps_padder">
                    <strong className="reps_form-label">Amount:</strong>
                    <input
                      type="text" placeholder="10"
                      className="form-control reps_text-input" ref="amount">
                    </input>
                  </div>
                  <div>
                    <button type="submit" className="btn btn-lg btn-primary reps_invest-button">Invest</button>
                  </div>

                </div>
                {valuationTable}
                <div className="error">
                  {error}
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
