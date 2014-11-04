"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

var AboutInput = React.createClass({
  getInitialState: function() {
    return { error: null };
  },

  handleSubmit: function(event) {
    event.preventDefault();

    // Validate input
    var text = this.refs.about.getDOMNode().value;
    if (text.length > 200) {
      this.setState({ error: "Text cannot be longer than 200 characters" });
    } else if (text.trim().length === 0) {
      this.setState({ error: "Text cannot be blank" });
    } else { 
      this.setState({ error: null });
      this.updateAbout(this.refs.about.getDOMNode().value);
    }
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
    var error = this.state.error ? <div className="alert alert-danger" role="alert">{this.state.error}</div> : '';
    var about = this.props.user.about || "Add short description of yourself!";
    return (
      <div className="aboutInput">
        <form onSubmit={this.handleSubmit} onReset={this.propagateReset}>
          <textarea ref="about" rows="2" className="form-control" placeholder={about}></textarea>
          <button type="submit" className="btn btn-success">Save</button> 
          <button type="reset" className="btn btn-default">Cancel</button> 
        </form>
        {error}
      </div>
    );
  }
});

module.exports = AboutInput;
