"use strict";

var $ = require('jquery');
var CategoriesHeader = require('./CategoriesHeader');
var CategoriesItem = require('./CategoriesItem');
var CategoryInput = require('./CategoryInput');
var React = require('react');

var CategoriesTable = React.createClass({
  getInitialState: function() {
    return { showInput: false,
             showAddCategory: false,
             error: null };
  },

  handleMouseOver: function() {
    if (!this.state.showInput) {
      this.setState({ showAddCategory: true });
    }
  },

  handleMouseLeave: function() {
    this.setState({ showAddCategory: false });
  },

  handleClick: function() {
    this.setState({ showInput: true, error: null });
  },

  closeInputBox: function() {
    this.setState({ showInput: false });
  },

  setError: function(error) {
    this.setState({ error: error });
  },

  render: function() {
    var error = this.state.error ? <div className="alert alert-info" role="alert">{this.state.error}</div> : '';
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
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              <th>Category</th>
              <th>Direct Rep</th>
              {repsHeader}
            </tr>
            {this.props.user.categories.map(function(category) {
              return <CategoriesItem key={category.id} category={category} includeReps={includeReps} />;
            })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
