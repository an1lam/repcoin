'use strict';

var GoogleLineChart = require('./GoogleLineChart.jsx');
var React = require('react');
var PanelInvestor = React.createClass({
  getInitialState: function() {
    return {
      selectedPortfolio: null,
      sortedPortfolio: [],
      newBy: false,
    };
  },

  componentDidMount: function() {
    if (this.props.user.portfolio.length > 0) {
      var sortedPortfolio = this.props.user.portfolio.sort(
        this.getPortfolioComparator()
      );

      this.setState({
        selectedPortfolio: sortedPortfolio[0].category,
        sortedPortfolio: sortedPortfolio,
      });
    } else {
      this.setState({ newBy: true });
    }
  },

  getPortfolioComparator: function() {
    return function(a, b) {
      if (a.rank > b.rank) {
        return -1;
      }
      if (a.rank < b.rank) {
        return 1;
      }
      return 0;
    }
  },

  getPortfolioOptions: function() {
    var portfolio = [];
    if (this.state.sortedPortfolio.length === 0) {
      return portfolio;
    }

    var name;
    for (var i = 0; i < this.state.sortedPortfolio.length; i++) {
      name = this.state.sortedPortfolio[i].category;
      portfolio.push(<option key={i} value={name}>{name}</option>);
    }
    return portfolio;
  },

  switchPortfolio: function(e) {
    this.setState({ selectedPortfolio: e.target.value });
  },

  render: function() {
    var content = '';
    var selectBox = '';

    // Show a special message for newbies
    if (this.state.newBy) {
      content =
        <div className="alert alert-info content">
          This panel will track progress on your investments. Make some investments to start seeing results!
        </div>;
    } else {
      selectBox =
        <select className="graph-switch form-control" onChange={this.switchPortfolio}>
          {this.getPortfolioOptions()}
        </select>;

      if (!this.state.selectedPortfolio) {
        return (<div className="panel-all"></div>);
      }

      content =
        <div className="content">
          <div className="col-md-4">
            <GoogleLineChart user={this.props.user} category={this.state.selectedPortfolio} datatype='ranks' usertype='investor' />
          </div>
          <div className="col-md-4">
            <GoogleLineChart user={this.props.user} category={this.state.selectedPortfolio} datatype='dividends' usertype='investor' />
          </div>
          <div className="col-md-4">
            <GoogleLineChart user={this.props.user} category={this.state.selectedPortfolio} datatype='percentreturns' usertype='investor' />
          </div>
        </div>;
    }
    return (
      <div className="panel-all">
        <div className="row panel-header">
          <div className="col-md-5">
            <h1>Investor Dashboard</h1>
            {selectBox}
          </div>
        </div>
        {content}
      </div>
    );
  }
});

module.exports = PanelInvestor;

