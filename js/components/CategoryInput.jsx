'use strict';

var AuthActionCreator = require('../actions/AuthActionCreator.js');
var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');
var CategoriesStore = require('../stores/CategoriesStore.js');
var CategorySearch = require('./CategorySearch.jsx');
var CategorySearchDisplayTable = require('./CategorySearchDisplayTable.jsx');
var InputMixin = require('../mixins/InputMixin.jsx');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var CategoryInput = React.createClass({
  mixins: [InputMixin],
  getInitialState: function() {
    return {
      context: {
        msg: ''
      },
      query: '',
      filteredCategories: [],
      totalCategories: CategoriesStore.getAll()
    }
  },

  componentDidMount: function() {
    CategoriesStore.addChangeListener(this._onChange);
    CategoriesActionCreator.getCategories();
  },

  componentWillUnmount: function() {
    CategoriesStore.removeChangeListener(this._onChange);
  },

  handleClick: function(event) {
    event.preventDefault();
    var name = $(event.currentTarget).attr('href');
    if (this.props.expert) {
      this.setExpertCategory(name);
    } else {
      this.setInvestorCategory(name);
    }
  },

  setInvestorCategory: function(name) {
    name = this.sanitizeInput(name);

    AuthActionCreator.addInvestorCategory(this.props.user._id, name, this.props);
  },

  setExpertCategory: function(name) {
    name = this.sanitizeInput(name);

    AuthActionCreator.addExpertCategory(this.props.user._id, name, this.props)
  },

  search: function(query) {
    this.setState({ query: query });
    if (query.trim().length === 0) {
      this.setState({ filteredCategories: [] });
      return;
    }

    this.getFilteredCategories(query);
  },

  getFilteredCategories: function(query) {
    var totalCategories = this.state.totalCategories;
    var length = totalCategories.length;
    var filteredCategories = [];
    for (var i = 0; i < length; i++) {
      var regexp = new RegExp('\\b' + query, 'i');
      var name = totalCategories[i].name;
      if (regexp.test(name)) {
        filteredCategories.push(totalCategories[i]);
      }
    }

    this.setState({ filteredCategories: filteredCategories });
  },

  render: function() {
    var type = this.props.expert ? 'expert' : 'investor';
    return (
      <div className="categoryInput">
        <CategorySearch onReset={this.props.onReset} query={this.state.query} search={this.search} handleClick={this.props.handleClick} getCategory={this.getCategory} setExpertCategory={this.setExpertCategory} setInvestorCategory={this.setInvestorCategory} type={type} />
        <CategorySearchDisplayTable onReset={this.props.onReset} user={this.props.user} data={this.state.filteredCategories} handleClick={this.handleClick} type={type} />
      </div>
    );
  },

  _onChange: function() {
    this.setState({
      totalCategories: CategoriesStore.getAll()
    });
  }
});

module.exports = CategoryInput;
