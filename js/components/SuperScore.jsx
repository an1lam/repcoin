"use strict";

var $ = require('jquery');
var React = require('react');

var SuperScore = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentDidMount: function() {
    this.setCategoryAndRep(this.props);
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
    var superScore = '';
    if (this.state.category) {
        superScore = <div className="panel panel-primary">
          <div className="panel-heading">
            <div className="superText">{this.state.category}</div>
            <div className="superText">:</div>
            <div className="superText">{this.state.defaultDirectRep}</div>
          </div> 
        </div>;
    } else if (this.props.currentUser && this.props.currentUser._id === this.props.user._id) {
      superScore = <div className="defaultPanel panel panel-default">
        <div className="panel-body">
          <em>Choose a default category!</em>
        </div>
      </div>;
    }
    
    return (
      <div className="superScore">
        {superScore}
      </div>
    );
  }
});

module.exports = SuperScore;
