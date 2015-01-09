'use strict';

var InvestmentList = require('./InvestmentList');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

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
    var name = this.props.category.category;
    var repsAvailable = '';
    var investments = '';
    if (this.props.privateFields) {
      var repsAvailable = <td>{this.props.category.reps}</td>;
      var investments = <td><InvestmentList investments={this.props.category.investments}/></td>;
    }
    return (
      <tr className="portfolioItem">
        <td>
          <Link to="category" params={{category: name}}>{name}</Link>
          {deleteBtn}
        </td>
        <td>{this.props.category.percentile}</td>
        {repsAvailable}
        {investments}
      </tr>
    );
  }
});

module.exports = PortfolioItem;
