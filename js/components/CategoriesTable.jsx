'use strict';

var $ = require('jquery');
var CategoriesHeader = require('./CategoriesHeader');
var CategoriesItem = require('./CategoriesItem');
var CategoryInput = require('./CategoryInput');
var CategoryDelete = require('./CategoryDelete.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var CategoriesTable = React.createClass({
  getInitialState: function() {
    return {
      addMode: false,
      editHover: false,
      deleteMode: false,
      showDeleteBox: false,
      categoryToDelete: '',
      message: null,
      error: false,
    };
  },

  resetState: function() {
    this.setState({
      addMode: false,
      editHover: false,
      deleteMode: false,
      showDeleteBox: false,
      categoryToDelete: '',
      message: null,
      error: false,
    });
  },

  componentWillReceiveProps: function(newProps) {
    if (newProps.user._id !== this.props.user._id) {
      this.resetState();
      this.getCategoryExpertSizes(newProps.user.categories);
    }
  },

  getCategoryExpertSizes: function(categories) {
    var list = [];
    for (var i = 0; i < categories.length; i++) {
      list.push(categories[i].name);
    }
    CategoriesActionCreator.getSizes(list, true);
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
    this.setState({ addMode: true, editHover: false, deleteMode: false, showDeleteBox: false, message: null });
  },

  handleDeleteClick: function() {
    this.setState({ deleteMode: true, editHover: false, addMode: false, showDeleteBox: false, message: null });
  },

  handleCancelClick: function() {
    this.setState({ deleteMode: false, addMode: false, showDeleteBox: false, message: null });
  },

  showDeleteBox: function(categoryToDelete) {
    this.setState({ categoryToDelete: categoryToDelete,
                    showDeleteBox: true,
                    message: null });
  },

  closeInputBox: function() {
    this.setState({ addMode: false });
  },

  closeDeleteBox: function() {
    this.setState({ showDeleteBox: false, deleteMode: false });
  },

  deleteExpertCategory: function(e) {
    e.preventDefault();
    var url = '/api/users/' + this.props.currentUser._id + '/'
      + this.state.categoryToDelete.name + '/expert/delete';
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

  setMessage: function(message, error) {
    this.setState({ message: message, error: error, addMode: false });
  },

  // Get the categories rows for the table
  getCategoriesItems: function() {
    var categoriesItems = [];
    var length = this.props.user.categories.length;
    var category;
    for (var i = 0; i < length; i++) {
      var category = this.props.user.categories[i];
      categoriesItems.push(
        <CategoriesItem userId={this.props.user._id} category={category}
          deleteMode={this.state.deleteMode} showDeleteBox={this.showDeleteBox} />
      );
    }
    return categoriesItems;
  },

  render: function() {
    var isSelf = this.props.currentUser._id === this.props.user._id;
    var message = '';
    if (this.state.message) {
      if (this.state.error) {
        message = <div className="alert alert-danger added-cat-msg" role="alert">{this.state.message}</div>;
      } else {
        message = <div className="alert alert-info added-cat-msg" role="alert">{this.state.message}</div>;
      }
    }
    var edit = '';
    var addCategory = '';
    var deleteCategory= '';

    if (isSelf) {
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
        deleteCategory = <CategoryDelete onReset={this.closeDeleteBox} investor={false}
          onDelete={this.deleteExpertCategory} name={this.state.categoryToDelete.name}/>;
      }

      if (this.state.addMode) {
        addCategory = <CategoryInput user={this.props.user} onReset={this.closeInputBox} expert={true} setMessage={this.setMessage} />;
      }
    }

    // The key for the expert table will change if a category is deleted
    var length = this.props.user.categories.length;
    var key = this.props.user._id + length;
    var categoryRows = this.getCategoriesItems();
    var addCategoriesText = '';
    if (length === 0) {
      if (isSelf) {
        var text = strings.YOU_ARE_NOT_EXPERT_IN_ANY_CATEGORIES;
          addCategoriesText =
            <div className="add-category-text">
              {text}
              <button className="no-cat-btn btn btn-primary" onClick={this.handleAddClick}>Add Categories</button>
            </div>;
      } else {
        var text = strings.USER_IS_NOT_EXPERT_IN_ANY_CATEGORIES(this.props.user.username);
        addCategoriesText = <div className="add-category-text">{text}</div>;
      }
    }

    return (
      <div key={key} className="categoriesTable panel panel-default" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        <CategoriesHeader user={this.props.user} />
        {edit}
        {message}
        {addCategory}
        {deleteCategory}
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              <th>Category</th>
              <th>Rank</th>
              <th>Reps Received</th>
              <th>Top Investors (Rank)</th>
            </tr>
            {categoryRows}
          </tbody>
        </table>
        <p>{addCategoriesText}</p>
      </div>
    );
  }
});

module.exports = CategoriesTable;
