"use strict";

var React = require('react');

var InvestorList = React.createClass({
  render: function() {
    var i = 0;
    return(
      <ul className="investorList list-group">
        {this.props.investors.map(function(investor) {
          if (i < 3) {
            i += 1;
            return <li key={investor._id} className="list-group-item">{investor.name}</li>;
          }
        })}
      </ul>
    );
  }
});

module.exports = InvestorList;
