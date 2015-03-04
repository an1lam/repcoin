'use strict';

var InvestmentList = require('./InvestmentList');
var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var PortfolioItem = React.createClass({

  render: function() {
    var name = this.props.category.category;
    var investments = '';
    if (this.props.privateFields) {
      var investments = <td><InvestmentList investments={this.props.category.investments}/></td>;
    }

    var rank = '';
    if (this.props.size) {
      rank = this.props.category.rank + ' / ' + this.props.size;
    }

    return (
      <tr className="portfolioItem">
        <td>
          <Link to="category" params={{category: name}}>{name}</Link>
        </td>
        <td>{rank}</td>
        {investments}
      </tr>
    );
  }
});

module.exports = PortfolioItem;
