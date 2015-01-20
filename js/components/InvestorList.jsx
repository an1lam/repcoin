'use strict';

var React = require('react');

var InvestorList = React.createClass({

  generateInvestorList: function() {
    var i = 0;
    var category = this.props.category.name;
    var investors = [];
    if (this.props.investors) {
      var investors = this.props.investors.map(function(investor) {
        var percentile = 0;
        var length = investor.portfolio.length;
        for (var j = 0; j < length; j++) {
          if (investor.portfolio[j].category === category) {
            percentile = investor.portfolio[j].percentile;
          }
        }
        if (i < 3) {
          i++;
          return (
            <li key={investor._id} className="list-group-item">{investor.username} ({percentile})</li>
          );
        }
      });
    }
    return investors;
  },

  render: function() {
    return(
      <ul className="investorList list-group">
        {this.generateInvestorList()}
      </ul>
    );
  }
});

module.exports = InvestorList;
