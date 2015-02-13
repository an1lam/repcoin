'use strict';

var $ = require('jquery');
var CategoryDelete = require('./CategoryDelete.jsx');
var CategoryInput = require('./CategoryInput');
var PortfolioHeader = require('./PortfolioHeader.jsx');
var PortfolioItem = require('./PortfolioItem.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var PortfolioTable = React.createClass({
  componentDidMount: function() {
    $('.dividend-info').popover({ trigger: 'hover focus' });
  },

  getPortfolioItems: function(privateFields) {
    var portfolioItems = [];
    var length = this.props.user.portfolio.length;
    for (var i = 0; i < length; i++) {
      var category = this.props.user.portfolio[i];
      portfolioItems.push(
        <PortfolioItem key={category.category} category={category}
          deleteMode={this.state.deleteMode} showDeleteBox={this.showDeleteBox} privateFields={privateFields} />
      );
    }
    return portfolioItems;
  },

  render: function() {
    var isSelf = this.props.currentUser._id === this.props.user._id;

    // Determine whether to display private or public rows
    var privateFields = false;
    var investmentHeader = '';
    var repsAvailable = -1;
    if (isSelf) {
      repsAvailable = this.props.user.reps;
      privateFields = true;
      investmentHeader =
        <th>
          <div>{strings.INVESTMENTS}</div>
          <div className="subtitle">{strings.USER_AMOUNT_DIVIDEND}
            <span className="dividend-info glyphicon glyphicon-info-sign" data-toggle="popover" data-placement="top" title={strings.DIVIDEND_INFO_TITLE} data-content={strings.DIVIDEND_INFO_CONTENT}></span>
          </div>
        </th>;
    }

    var portfolioRows = this.getPortfolioItems(privateFields);
    var addCategoriesText = '';

    if (this.props.user.portfolio.length === 0) {
      if (isSelf) {
        var text = strings.NO_EXISTING_INVESTMENTS;
      } else {
        var text = strings.NO_EXISTING_INVESTMENTS(this.props.user.username);
        addCategoriesText = <div className="add-category-text">{text}</div>;
      }
    }

    return (
      <div key={this.props.user._id} className="categoriesTable panel panel-default">
        <PortfolioHeader name={this.props.user.username} reps={repsAvailable} />
        <table className="table table-bordered table-striped">
          <tr className="PortfolioHeader">
            <th>Category</th>
            <th>Percentile</th>
            {investmentHeader}
          </tr>
          <tbody>
            {portfolioRows}
          </tbody>
        </table>
        {addCategoriesText}
      </div>
    );
  }
});

module.exports = PortfolioTable;
