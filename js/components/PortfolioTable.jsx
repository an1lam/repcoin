/** @jsx React.DOM */
"use strict";

var React = require('react');
var $ = require('jquery');
var PubSub = require('pubsub-js');
var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.jsx');
var PortfolioItem = require('./PortfolioItem.jsx');
var PortfolioHeader = require('./PortfolioHeader.jsx');

var PortfolioTable = React.createClass({
  mixins: [AuthenticatedRoute],

  render: function() {
    return (
      <div className="categoriesTable panel panel-default">
        <table className="table table-bordered table-striped">
          <PortfolioHeader />
          <tbody>
          {this.props.user.portfolio.map(function(investment) {
            return <PortfolioItem user={investment.user} category={investment.category} amount={investment.amount} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = PortfolioTable;
