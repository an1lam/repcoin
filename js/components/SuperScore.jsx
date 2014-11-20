"use strict";

var $ = require('jquery');
var React = require('react');
var SuperScoreInput = require('./SuperScoreInput.jsx');

var SuperScore = React.createClass({
  getInitialState: function() {
    return {
      showEdit: false,
      showInput: false
    };
  },

  handleEditClick: function() {
    this.setState({ showEdit: false, showInput: true });
  },

  handleMouseOver: function() {
    if (!this.state.showInput) {
      this.setState({ showEdit: true });
    }
  },

  handleMouseLeave: function() {
    this.setState({ showEdit: false });
  },

  componentDidMount: function() {
    this.setCategoryAndRep(this.props);
  },

  closeInputBox: function() {
    this.setState({ showInput: false });
  },

  componentWillReceiveProps: function(newProps) {
    this.setCategoryAndRep(newProps);
  },

  setCategoryAndRep: function(props) {
    var categories = props.user.categories;
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].name === props.user.defaultCategory) {
        this.setState({ defaultDirectRep: categories[i].directScore });
        this.setState({ category: categories[i].name });
        return;
      }
    } 
    this.setState({ category: null, defaultDirectRep: null });
  },

  render: function() {
    var mypage = this.props.currentUser && this.props.currentUser._id === this.props.user._id;
    var edit = '';
    var superScore = '';
    if (mypage) {
      if (this.state.showEdit) {
       edit = <div className="edit">
        <a onClick={this.handleEditClick}><span className="pencil glyphicon glyphicon-pencil"></span></a></div>;
      }

      if (this.state.showInput) {
        superScore = <SuperScoreInput user={this.props.user} onReset={this.closeInputBox} />
      } else if (this.state.category) {
         superScore = <div className="panel panel-primary">
          {edit}
          <div className="panel-heading">
            <div className="superText">{this.state.category}</div>
            <div className="superText">:</div>
            <div className="superText">{this.state.defaultDirectRep}</div>
          </div> 
        </div>;
      } else {
        superScore = <div className="defaultPanel panel panel-default">
          {edit}
          <div className="panel-body">
            <em>Choose a default category!</em>
          </div>
        </div>;
      }
    } else {
      if (this.state.category) {
        superScore = <div className="panel panel-primary">
          {edit}
          <div className="panel-heading">
            <div className="superText">{this.state.category}</div>
            <div className="superText">:</div>
            <div className="superText">{this.state.defaultDirectRep}</div>
          </div> 
        </div>;
      }
    }
    
    return (
      <div className="superScore" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        {superScore}
      </div>
    );
  }
});

module.exports = SuperScore;
