"use strict";

var React = require('react');

var InvestorList = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    if (this.props.investors.length !== 0) {
      this.getInvestors(this.props);
    }
  },

  componentWillReceiveProps: function(newProps) {
    this.getInvestors(newProps);
  },

  getInvestors: function(props) {
    var idList = [];
    var length = props.investors.length;
    for (var i = 0; i < length; i++) {
      idList.push(this.props.investors[i].id);
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
    if (this.state.investors) {
      var investors = this.state.investors.map(function(investor) {
        var percentile = investor.percentile || 0;
        if (i < 3) {
          i++;
          return (
            <li key={investor._id} className="list-group-item">{investor.username} ({percentile})</li>
          );
        }
      });
    } else {
      var investors = this.props.investors.map(function(investor) {
        if (i < 3) {
          i++;
          return (
            <li key={investor.id} className="list-group-item">{investor.name}</li>
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
