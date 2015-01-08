'use strict';

var $ = require('jquery');
var CategoryDelete = require('./CategoryDelete.jsx');
var CategoryInput = require('./CategoryInput');
var PortfolioHeader = require('./PortfolioHeader.jsx');
var PortfolioItem = require('./PortfolioItem.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

var PortfolioTable = React.createClass({
  getInitialState: function() {
    return { addMode: false,
             editHover: false,
             deleteMode: false,
             showDeleteBox: false,
             categoryToDelete: '',
             error: null };
  },

  handleMouseOver: function() {
    if (!this.state.showDeleteBox && !this.state.addMode && !this.state.deleteMode) {
      this.setState({ editHover: true });
    }
  },

  handleMouseLeave: function() {
    this.setState({ editHover: false });
  },

  handleAddClick: function() {
    this.setState({ addMode: true, editHover: false, deleteMode: false, showDeleteBox: false, error: null });
  },

  handleDeleteClick: function() {
    this.setState({ deleteMode: true, editHover: false, addMode: false, showDeleteBox: false, error: null });
  },

  handleCancelClick: function() {
    this.setState({ deleteMode: false, addMode: false, showDeleteBox: false, error: null });
  },

  showDeleteBox: function(categoryToDelete) {
    this.setState({ categoryToDelete: categoryToDelete,
                    showDeleteBox: true,
                    error: null });
  },

  closeInputBox: function() {
    this.setState({ addMode: false });
  },

  closeDeleteBox: function() {
    this.setState({ showDeleteBox: false, deleteMode: false });
  },

  deleteInvestorCategory: function(e) {
    e.preventDefault();
    var url = '/api/users/' + this.props.currentUser._id + '/'
      + this.state.categoryToDelete.category + '/investor/delete';
    $.ajax({
      url: url,
      type: 'PUT',
      success: function(user) {
        PubSub.publish('profileupdate');
        this.setState({ deleteMode: false, showDeleteBox: false });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  setError: function(error) {
    this.setState({ error: error });
  },

  getPortfolioItems: function() {
    var portfolioItems = [];
    var length = this.props.user.portfolio.length;
    for (var i = 0; i < length; i++) {
      var category = this.props.user.portfolio[i];
      portfolioItems.push(
        <PortfolioItem key={category.category} category={category}
          deleteMode={this.state.deleteMode} showDeleteBox={this.showDeleteBox}/>
      );
    }
    return portfolioItems;
  },

  render: function() {
    var error = this.state.error ? <div className="alert alert-info" role="alert">{this.state.error}</div> : '';
    var edit = '';
    var addCategory = '';
    var deleteCategory = '';

    if (this.props.currentUser._id === this.props.user._id) {
      if (this.state.editHover) {
        edit = <div className="editCategoriesBtn">
          <a onClick={this.handleAddClick}><span className="pencil glyphicon glyphicon-plus"></span></a>
          <p className="divider"> | </p>
          <a onClick={this.handleDeleteClick}><span className="remove glyphicon glyphicon-remove"></span></a>
        </div>;
       } else if (this.state.addMode || this.state.deleteMode || this.state.showDeleteBox) {
        edit = <div className="editCategoriesBtn">
          <button className="btn btn-default" onClick={this.handleCancelClick}>Cancel</button>
        </div>;
      }

      if (this.state.showDeleteBox) {
        deleteCategory = <CategoryDelete onReset={this.closeDeleteBox} investor={true}
          onDelete={this.deleteInvestorCategory} name={this.state.categoryToDelete.category}/>;
      }

      if (this.state.addMode) {
        addCategory = <CategoryInput user={this.props.user} onReset={this.closeInputBox} expert={false} setError={this.setError} />;
      }
    }

    var portfolioRows = this.getPortfolioItems();
    var addCategoriesText = '';
    if (this.props.user.portfolio.length === 0) {
      var text = 'You are not an investor for any categories yet! Click the "+" ' +
        'in the top right to add some. You can create any categories that you do not find.';
      addCategoriesText = <div className="add-category-text">{text}</div>;
    }

    return (
      <div className="categoriesTable panel panel-default" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave} >
        <PortfolioHeader name={this.props.user.username}/>
        {edit}
        {error}
        {addCategory}
        {deleteCategory}
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
            {portfolioRows}
          </tbody>
        </table>
        {addCategoriesText}
      </div>
    );
  }
});

module.exports = PortfolioTable;
