/** @jsx React.DOM */
"use strict";

var React = require('react');
var PortfolioItem = require('./PortfolioItem.jsx');
var PortfolioHeader = require('./PortfolioHeader.jsx');

var PortfolioTable = React.createClass({
  getInitialState: function() {
    return { showInput: false, showAddPortfolio: false };
  },

  handleMouseOver: function() {
    if (!this.state.showInput) {
      this.setState({ showAddPortfolio: true });
    }
  },

  handleMouseLeave: function() {
    this.setState({ showAddPortfolio: false });
  },

  handleClick: function() {
    this.setState({ showInput: true });
  },

  closeInputBox: function() {
    this.setState({ showInput: false });
  },

  render: function() {
    var edit = '';
    var addCategory = '';
    
    if (this.props.currentUser._id === this.props.user._id) {
      if (this.state.showAddCategory) {
        edit = <div className="editBox" onClick={this.handleClick}>
                 <button className="btn btn-default btn-small">
                   <span className="glyphicon glyphicon-plus"></span>
                 </button>
               </div>;
      }
      
      if (this.state.showInput) {
        addCategory = <CategoryInput user={this.props.user} onReset={this.closeInputBox} portfolio={true}/>;
      }
    }

    return (
      <div className="categoriesTable panel panel-default">
        <PortfolioHeader />
        <table className="table table-bordered table-striped">
          <tr className="PortfolioHeader">
            <th>Category</th>
            <th>Reps Available</th>
            <th>
              <div>Investments</div>
              <div className="subtitle">User / Amount / Valuation</div>
            </th>
          </tr>
          <tbody>
          {this.props.user.portfolio.map(function(category) {
            return <PortfolioItem key={category.category} category={category} />;
          })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = PortfolioTable;
