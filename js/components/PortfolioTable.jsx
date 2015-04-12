'use strict';

var $ = require('jquery');
var CategoryDelete = require('./CategoryDelete.jsx');
var CategoryInput = require('./CategoryInput');
var CategoriesStore = require('../stores/CategoriesStore.js');
var PortfolioHeader = require('./PortfolioHeader.jsx');
var PortfolioItem = require('./PortfolioItem.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

function getStateFromStores() {
  return {
    sizes: CategoriesStore.getSizes()
  }
}

var PortfolioTable = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    $('.dividend-info').popover({ trigger: 'hover focus' });
    CategoriesStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    CategoriesStore.removeChangeListener(this._onChange);
  },

  getPortfolioItems: function(privateFields) {
    var portfolioItems = [];
    var portfolio = this.props.user.portfolio;
    var sortedPortfolio = this.props.user.portfolio.concat().sort(this.getPortfolioComparator());
    for (var i = 0; i < sortedPortfolio.length; i++) {
      var category = sortedPortfolio[i];

      var size;

      // Go through all of the category members to find the size
      for (var j = 0; j < this.state.sizes.length; j++) {
        if (this.state.sizes[j].name === category.category) {
          size = this.state.sizes[j].investors;
          break;
        }
      }

      portfolioItems.push(
        <PortfolioItem size={size} category={category} privateFields={privateFields} />
      );
    }

    return portfolioItems;
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

  getTotalDividends: function() {
    var length = this.props.user.portfolio.length;
    var totalDividends = 0;
    for (var i = 0; i < length; i++) {
      var category = this.props.user.portfolio[i];
      if (!category.investments) {
        continue;
      }

      for (var j = 0; j < category.investments.length; j++) {
        totalDividends += category.investments[j].dividend;
      }
    }

    totalDividends = Math.floor(totalDividends * 100) / 100;
    return totalDividends;
  },

  render: function() {
    var isSelf = this.props.currentUser && this.props.currentUser._id === this.props.user._id;

    // Determine whether to display private or public rows
    var privateFields = false;
    var investmentHeader = '';
    var repsAvailable = -1;
    if (isSelf) {
      repsAvailable = this.props.user.reps;
    }

    var portfolioRows = this.getPortfolioItems(privateFields);
    var totalDividends = this.getTotalDividends();
    var addCategoriesText = '';

    if (this.props.user.portfolio.length === 0) {
      if (isSelf) {
        var text = strings.NO_EXISTING_INVESTMENTS;
      } else {
        var text = strings.NO_EXISTING_INVESTMENTS_IMPERSONAL(this.props.user.username);
        addCategoriesText = <div className="add-category-text">{text}</div>;
      }
    }

    return (
      <div key={this.props.user._id} className="categoriesTable panel panel-default">
        <PortfolioHeader name={this.props.user.username} reps={repsAvailable}
          dividends={totalDividends} />
        <table className="table table-bordered table-striped">
          <thead>
          <tr className="PortfolioHeader">
            <th>Category</th>
            <th>Rank</th>
            {investmentHeader}
          </tr>
          </thead>
          <tbody>
            {portfolioRows}
          </tbody>
        </table>
        {addCategoriesText}
      </div>
    );
  },

  _onChange: function() {
    this.setState(getStateFromStores())
  }
});

module.exports = PortfolioTable;
