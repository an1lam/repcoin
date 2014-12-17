'use strict';

var $ = require('jquery');
var CategoriesHeader = require('./CategoriesHeader');
var CategoriesItem = require('./CategoriesItem');
var CategoryInput = require('./CategoryInput');
var ExpertCategoryDelete = require('./ExpertCategoryDelete.jsx');
var React = require('react');

var CategoriesTable = React.createClass({
  getInitialState: function() {
    return { showAddCategory: false,
             showAddCategoryBtn: false,
             showDeleteCategory: false,
             categoryToDelete: '',
             error: null };
  },

  handleMouseOver: function() {
    if (!this.state.showDeleteCategory) {
      this.setState({ showAddCategoryBtn: true });
    }
  },

  handleMouseLeave: function() {
    this.setState({ showAddCategoryBtn: false });
  },

  handleClick: function() {
    this.setState({ showAddCategory: true, error: null });
  },

  showDeleteCategory: function(categoryToDelete) {
    this.setState({ categoryToDelete: categoryToDelete,
                    showDeleteCategory: true,
                    error: null });
  },

  closeInputBox: function() {
    this.setState({ showAddCategory: false });
  },

  closeDeleteBox: function() {
    this.setState({ showDeleteCategory: false });
  },

  deleteExpertCategory: function() {
    console.log("DELETING " + this.state.categoryToDelete.name);
    this.setState({ showDeleteCategory: false });
  },

  setError: function(error) {
    this.setState({ error: error });
  },

  render: function() {
    var error = this.state.error ? <div className="alert alert-info" role="alert">{this.state.error}</div> : '';
    var edit = '';
    var addCategory = '';
    var deleteCategory= '';
    
    if (this.props.currentUser._id === this.props.user._id) {
      if (this.state.showAddCategoryBtn) {
        edit = <div className="addCategoryBox" onClick={this.handleClick}>
                 <button className="btn btn-default btn-small">
                   <span className="glyphicon glyphicon-plus"></span>
                 </button>
               </div>;
      }

      if (this.state.showDeleteCategory) {
        deleteCategory = <ExpertCategoryDelete onReset={this.closeDeleteBox} onDelete={this.deleteExpertCategory} name={this.state.categoryToDelete.name}/>;
      }
     
      if (this.state.showAddCategory) {
        addCategory = <CategoryInput user={this.props.user} onReset={this.closeInputBox} expert={true} setError={this.setError} />;
      }
    }

    var includeReps = false;
    var repsHeader = '';
    if (this.props.currentUser.username === this.props.user.username) {
        includeReps = true;
        repsHeader = <th>Reps</th>;
    }
    return (
      <div key={this.props.user._id} className="categoriesTable panel panel-default" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        <CategoriesHeader user={this.props.user} />
        {edit}
        {error}
        {addCategory}
        {deleteCategory}
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              <th>Category</th>
              <th>Percentile</th>
              <th>Top Investors</th>
              {repsHeader}
            </tr>
            {this.props.user.categories.map(function(category) {
              return <CategoriesItem key={category.id} category={category} includeReps={includeReps}
                loggedIn={true} showDeleteCategory={this.showDeleteCategory} deletePrompt={this.state.showDeleteCategory}/>;
            }.bind(this))}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
