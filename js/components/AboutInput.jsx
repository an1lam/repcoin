"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

var AboutInput = React.createClass({
  handleSubmit: function(event) {
    event.preventDefault();
    this.updateAbout(this.refs.about.getDOMNode().value);
  },

  updateAbout: function(text) {
    var url = '/api/users/' + this.props.user._id;
    var user = this.props.user;
    user.about = text;
    $.ajax({
      url: url,
      type: 'PUT',
      data: user,
      success: function(user) {
        auth.storeCurrentUser(user, function(user) {
          return user;
        });
        PubSub.publish('profileupdate');
        this.propagateReset();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        this.propagateReset();
      }.bind(this)
    });
  },

  propagateReset: function() {
    this.props.onReset();
  },

  render: function() {
    var about = this.props.user.about || "Add short description of yourself!";
    return (
      <div className="aboutInput">
        <form onSubmit={this.handleSubmit} onReset={this.propagateReset}>
          <textarea ref="about" rows="2" className="form-control" placeholder={about}></textarea>
          <button type="submit" className="btn btn-success">Save</button> 
          <button type="reset" className="btn btn-default">Cancel</button> 
        </form>
      </div>
    );
  }
});

module.exports = AboutInput;
