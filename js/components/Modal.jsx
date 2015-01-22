'use strict';

var $ = require('jquery');
var BecomeInvestorPrompt = require('./BecomeInvestorPrompt.jsx');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var Modal = React.createClass({
  mixins: [ModalMixin],

  getInitialState: function() {
    return {
      give: true,
      error: false,
      message: '',
    };
  },

  // Validate a give
  validateAndGive: function(category, amount, anonymous) {
    // Validate that the category is possible
    var category;
    var categories = this.props.user.categories;
    var length = categories.length;
    for (var i = 0; i < length; i++) {
      if (categories[i].name === category) {
        category = categories[i];
        break;
      }
    }
    // If the category was not found, throw an error
    if (!category) {
      this.setState({ error: true, msg: strings.CATEGORY_NOT_FOUND(this.props.user.username) });
      return;
    }

    // Get the portfolio index if the investment is possible
    var portIndex = -1;
    var portfolio = this.props.currentUser.portfolio;
    length = portfolio.length;
    for (var i = 0; i < length; i++) {
      if (portfolio[i].category === category.name) {
        portIndex = i;
      }
    }
    if (portIndex === -1) {
      this.setState({ error: true, message: strings.NOT_AN_INVESTOR(category.name) });
      return;
    }

    // Make sure the investor has enough reps
    if (portfolio[portIndex].reps < amount) {
      this.setState({ error: true, message: strings.NOT_ENOUGH_REPS });
      return;
    }

    this.setState({error: null});
    this.createTransaction(this.props.user, this.props.currentUser,
      category.name, amount, anonymous);
  },


  validateAndRevoke: function(number, amount, anonymous) {
    var investmentList = this.getInvestmentList();
    var number = parseInt(number);
    var investment = investmentList[number-1].investment;
    var category = investmentList[number-1].category;

    // Make sure this investment has at least the amount
    if (investment.amount < amount) {
      this.setState({ error: strings.INVESTMENT_AMOUNT_TOO_SMALL(investment.amount) });
      return;
    }

    var id = investment._id;
    this.setState({error: null });
    this.createTransaction(this.props.user, this.props.currentUser,
      category, amount * -1, anonymous, id);
  },

  // Creates a transaction
  // Amount should be negative if revoke
  createTransaction: function(toUser, fromUser, category, amount, anonymous, investmentId) {
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
        id: investmentId,
      },
      success: function(transaction) {
        $.ajax({
          url: '/api/users/' + fromUser._id,
          type: 'GET',
          success: function(user) {
            var action = strings.SUCCESSFULLY_GAVE(transaction.amount, transaction.to.name);
            if (!this.state.give) {
              action = strings.SUCCESSFULLY_REVOKED(transaction.amount * -1, transaction.to.name);
            }
            this.setState({ error: false, message: action });
            PubSub.publish('profileupdate');
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({ error: true, message: strings.ERROR_CREATING_TRANSACTION });
            console.error(status, err.toString());
          }.bind(this),
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({ error: true, message: strings.ERROR_CREATING_TRANSACTION });
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  handleSubmit: function(event) {
    event.preventDefault();
    var choice = this.refs.choice.getDOMNode().value;
    var anonymous = this.refs.anonymous.getDOMNode().checked;
    var amount = Number(this.refs.amount.getDOMNode().value);

    // Make sure a valid number was entered
    if (isNaN(amount)) {
      this.setState({ error: true, message: strings.INVALID_AMOUNT });
      return;
    }

    // Round the number to the nearest hundredth
    amount = Math.round(amount* 100) / 100;

    // Make sure the amount is not 0
    if (amount <= 0) {
      this.setState({ error: true, message: strings.INVALID_AMOUNT_VALUE  });
      return;
    }

    // Determine if we should give or revoke
    if (this.state.give) {
      this.validateAndGive(choice, amount, anonymous);
    } else {
      this.validateAndRevoke(choice, amount, anonymous);
    }
  },

  clickGive: function(e) {
    this.setState({ give: true });
  },

  clickRevoke: function(e) {
    this.setState({ give: false });
  },

  // Get all of the investments the currentUser has in this user
  getInvestmentList: function() {
    var investmentList = [];
    var length = this.props.currentUser.portfolio.length;
    var portfolio = this.props.currentUser.portfolio;
    for (var i = 0; i < length; i++) {
      var investments = portfolio[i].investments;
      var category = portfolio[i].category;
      var len = investments.length;
      for (var j = 0; j < len; j++) {
        if (investments[j].user === this.props.user.username) {
          investmentList.push({ investment: investments[j], category: category });
        }
      }
    }
    return investmentList;
  },

  // Get the rows for the investment table
  getInvestmentTableRows: function(investmentList) {
    var rows = [];
    var length = investmentList.length;
    var count = 1;
    for (var i = 0; i < length; i++) {
      rows.push(<tr key={investmentList[i]._id}>
        <td>{count}</td>
        <td>{investmentList[i].category}</td>
        <td>{investmentList[i].investment.amount}</td>
        <td>{investmentList[i].investment.dividend}</td>
      </tr>);
      count++;
    }
    return rows;
  },

  getInvestmentNumbers: function(investmentList) {
    var investmentNumbers = [];
    var length = investmentList.length;
    for (var i = 0; i < length; i++) {
      investmentNumbers.push(
        <option key={i+1} value={i+1}>{i+1}</option>
      );
    }
    return investmentNumbers;
  },

  getInvestmentCategories: function() {
    // TODO: use the investmentList to create this and avoid too many loops
    var portfolio = this.props.currentUser.portfolio;
    var categories = this.props.user.categories;
    var portLen = portfolio.length;
    var catLen = categories.length;
    var categoriesList = [];
    for (var i = 0; i < catLen; i++) {
      for (var j = 0; j < portLen; j++) {
        if (portfolio[j].category === categories[i].name && portfolio[j].reps > 0) {
          var key = categories[i].id + portfolio[j].reps;
          categoriesList.push(<option key={key} value={categories[i].name}>{categories[i].name} ({portfolio[j].reps} available)</option>);
        }
      }
    }
    return categoriesList;
  },

  // Determines if the currentUser can invest in any of the user's categories
  noPossibleCategories: function() {
    var categories = this.props.user.categories;
    var portfolio = this.props.currentUser.portfolio;
    var length = categories.length;
    var portfolioLen = portfolio.length;
    for (var i = 0; i < length; i++) {
      for (var j = 0; j < portfolioLen; j++) {
        if (categories[i].name === portfolio[j].category) {
          return false;
        }
      }
    }
    return true;
  },

  render: function() {
    var revokeError = '';
    var modalStyleOverride = {
      'zIndex': 1050,
    };

    var modalContent = '';
    if (this.noPossibleCategories()) {
      var text = strings.NO_MATCHING_CATEGORIES(this.props.user.firstname);
      modalContent = <div className="no-categories">{text}</div>
    } else {
      var action = this.state.give ? 'Give' : 'Revoke'; // The text for the action button
      var clazz = this.state.error ? 'alert alert-danger modal-msg' : 'alert alert-info modal-msg';
      var message = '';
      if (this.state.message.trim().length !== 0) {
        var message = <div className={clazz} role="alert">
            <p>{this.state.message}</p>
          </div>;
      }

      var investmentList = this.getInvestmentList(); // The list of investments
      var categories = this.getInvestmentCategories(); // The valid categories
      var investmentNumbers = this.getInvestmentNumbers(investmentList); // The investment numbers


      // Create the investment table if any investments exist
      var investmentTable = '';
      var investmentTableRows = this.getInvestmentTableRows(investmentList);
      if (investmentTableRows.length > 0) {
        investmentTable = (
          <table className="table table-bordered reps_table-nonfluid">
            <thead>
              <tr>
                <th>No.</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Dividend</th>
              </tr>
            </thead>
            <tbody>
              {investmentTableRows}
            </tbody>
          </table>
        );
      } else {
        if (!this.state.give) {
          var string = strings.NO_INVESTMENTS_TO_REVOKE;
          revokeError = <div className='modal-warning alert alert-info'>{string}</div>;
        }
      }

      // The dropdown box will be investment numbers or categories
      var choiceText = this.state.give ? 'Categories:' : 'Investment Number:';
      var choices = this.state.give ? categories : investmentNumbers;
      var choiceDropdown =
        <div className="choices-dropdown">
          <strong className="modal_text">{choiceText}</strong>
            <select ref="choice" className="form-control">
              {choices}
            </select>
            {revokeError}
        </div>;

      var amountPlaceholder = this.state.give ? strings.AMOUNT_TO_GIVE : strings.AMOUNT_TO_REVOKE;
      modalContent =
        <form onSubmit={this.handleSubmit} className="navbar-form">
          <div className="modal-body">
            <div className="row">
              <div className="btn-group giverevoke" role="group">
                <button type="button" ref="give" className="givebtn btn btn-default givebtn" onClick={this.clickGive}>Give</button>
                <button type="button" ref="revoke" className="revokebtn btn btn-default" onClick={this.clickRevoke}>Revoke</button>
              </div>
              <div className="anonymous">
                <strong>Anonymous</strong>: <input type="checkbox"
                  ref="anonymous" className="reps_checkbox" />
              </div>
            </div>
            <div className="row">
              <div className="menu-options">
                {choiceDropdown}
                <div>
                  <strong className="modal_text">Amount:</strong>
                  <input type="text" placeholder={amountPlaceholder} className="form-control reps_text-input" ref="amount"/>
                </div>
              </div>
              <div className="investmentTable panel panel-default">
                {investmentTable}
              </div>
            </div>
            <div className="row">
              <div className="modal_submit">
                <button type="submit" className="btn btn-lg btn-primary">{action}</button>
              </div>
            </div>
          </div>
        </form>;
    }

    return (
      <div className="modal reps_modal">
        <div className="modal-dialog" style={modalStyleOverride}>
          <div className="modal-content">
            <div className="modal-header">
              {this.renderCloseButton()}
              <span><h3 className="modal-username"> {this.props.user.username} </h3></span>
              {message}
            </div>
            {modalContent}
            <div className="modal-footer investment-modal-footer">
              <BecomeInvestorPrompt user={this.props.user} currentUser={this.props.currentUser}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Modal;
