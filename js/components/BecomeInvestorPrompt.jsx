'use strict';

var $ = require('jquery');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var BecomeInvestorPrompt = React.createClass({
  setInvestorCategory: function(e) {
    e.preventDefault();
    var name = e.target.value;
    $.ajax({
      url: '/api/users/' + this.props.currentUser._id + '/addinvestor/' + name,
      type: 'PUT',
      success: function(user) {
        // No user means the user is already an investor
        if (user) {
          PubSub.publish('profileupdate');
          return user;
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(xhr.responseText, err.toString());
      }.bind(this)
   });
  },

  getCategoryOptions: function() {
    var options = [];
    var isInvestor = false;
    var category;
    var portfolio = this.props.currentUser.portfolio;
    var categories = this.props.user.categories;
    for (var i = 0; i < categories.length; i++) {
      category = categories[i].name;
      isInvestor = false;
      for (var j = 0; j < portfolio.length; j++) {
        if (category === portfolio[j].category) {
          isInvestor = true;
        }
      }
      if (!isInvestor) {
        options.push(
          <div className="col-md-3 col-sm-3">
            <button value={category} onClick={this.setInvestorCategory} className="btn btn-success investor-prompt-btn">{category}</button>
          </div>
        );
      }
    }
    return options;
  },

  render: function() {
    var categoryOptions = this.getCategoryOptions();
    var promptText = '';
    if (categoryOptions.length > 0) {
      promptText = strings.BECOME_AN_INVESTOR(this.props.user.firstname);
    }
    return (
      <div className="becomeInvestorPrompt">
        <h4 className="investor-prompt-text">{promptText}</h4>
        <div className="container-fluid">
          {categoryOptions}
        </div>
      </div>
    );
  },
});

module.exports = BecomeInvestorPrompt;
