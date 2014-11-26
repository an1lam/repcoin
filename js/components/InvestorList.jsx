"use strict";

var React = require('react');

var InvestorList = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    this.getInvestors(this.props);
  },

  componentWillReceiveProps: function(newProps) {
    this.getInvestors(newProps);
  },

  getInvestors: function(props) {
    var idList = [];
    var length = props.category.investors.length;
    if (length === 0) {
      return;
    }

    for (var i = 0; i < length; i++) {
      idList.push(props.category.investors[i].id);
    }
    var url = '/api/users/list/byids';
    var data = { idList: idList };
    $.ajax({
      url: url,
      data: data,
      success: function(investors) {
        this.setState({ investors: investors });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  generateInvestorList: function() {
    var i = 0;
    var category = this.props.category.name;
    var investors = [];
    if (this.state.investors) {
      var investors = this.state.investors.map(function(investor) {
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
    var i = 0;
    return(
      <ul className="investorList list-group">
        {this.generateInvestorList()}
      </ul>
    );
  }
});

module.exports = InvestorList;
