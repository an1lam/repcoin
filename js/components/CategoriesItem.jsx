'use strict';

var ExpertCategoryDelete = require('./ExpertCategoryDelete.jsx');
var InvestorList = require('./InvestorList.jsx');
var React = require('react');
var ScoreBar = require('./ScoreBar.jsx');

var CategoriesItem = React.createClass({

  handleClick: function() {
    this.props.showDeleteBox(this.props.category);
  },

  render: function() {
    var deleteBtn = ''; // The delete option that pops up on hover

    if (this.props.deleteMode) {
      deleteBtn = <div onClick={this.handleClick}>
        <button className="btn btn-danger del-expert-cat-btn">Delete</button>
      </div>;
    }

    var reps = this.props.includeReps ? (<td>{this.props.category.reps}</td>) : '';
    return (
    <tr>
      <tr className="categoriesItem">
        <td>{this.props.category.name} {deleteBtn}</td>
        <td><ScoreBar percentile={this.props.category.percentile}
          previousPercentile={this.props.category.previousPercentile} category={this.props.category.name}/></td>
        <td>
          <InvestorList category={this.props.category}/>
        </td>
        {reps}
      </tr>
    </tr>
    );
  }
});

module.exports = CategoriesItem;
