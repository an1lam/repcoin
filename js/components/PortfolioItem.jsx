'use strict';

var InvestmentList = require('./InvestmentList');
var React = require('react');

var PortfolioItem = React.createClass({

  handleClick: function() {
    this.props.showDeleteBox(this.props.category);
  },

  render: function() {
    var deleteBtn = ''; // The delete option that pops up on hover

    if (this.props.deleteMode) {
      deleteBtn = <div onClick={this.handleClick}>
        <button className="btn btn-danger del-expert-cat-btn">Delete</button>
      </div>;
    }

    return (
      <tr className="portfolioItem">
        <td>{this.props.category.category} {deleteBtn}</td>
        <td>{this.props.category.reps}</td>
        <td><InvestmentList investments={this.props.category.investments}/></td>
      </tr>
    );
  }
});

module.exports = PortfolioItem;
