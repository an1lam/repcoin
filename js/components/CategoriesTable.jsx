"use strict";

var auth = require('../auth.jsx');
var CategoryInput = require('./CategoryInput');
var React = require('react');
var CategoriesItem = require('./CategoriesItem');
var CategoriesHeader = require('./CategoriesHeader');
var $ = require('jquery');

var CategoriesTable = React.createClass({
  getInitialState: function() {
    return { showInput: false, showAddCategory: false };
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
        addCategory = <CategoryInput user={this.props.user} onReset={this.closeInputBox}/>;
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
        {addCategory}
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              <th>Category</th>
              <th>Direct Rep</th>
              <th>Crowd Rep</th>
              {repsHeader}
            </tr>
            {this.props.user.categories.map(function(category) {
              return <CategoriesItem key={category.id} category={category.name} directRep={category.directScore} prevDirectRep={category.previousDirectScore} crowdRep={category.crowdScore} reps={category.reps} includeReps={includeReps} />;
            })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = CategoriesTable;
