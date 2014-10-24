/** @jsx React.DOM */
"use strict"; 
var React = require('react');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var $ = require('jquery');

var LinkInput = React.createClass({
  getInitialState: function() {
    return {};
  },

  handleSubmit: function(event) {
    event.preventDefault();
    this.addLink({ title: this.refs.description.getDOMNode().value, url: this.refs.url.getDOMNode().value });
  },

  addLink: function(link) {
    var url = '/api/users/' + this.props.user._id;
    var links = this.props.user.links;
    links.push(link);
    var user = this.props.user;
    user.links = links; 
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
    return(
      <div className="linkInput">
        <form onSubmit={this.handleSubmit} onReset={this.propagateReset}>
          <div>
            <input type="text" ref="description" className="form-control" placeholder="Description"></input>
            <p> : </p>
            <input type="text" ref="url" className="form-control" placeholder="URL"></input>
          </div>
          <button type="submit" className="btn btn-success">Save</button> 
          <button type="reset" className="btn btn-default">Cancel</button> 
        </form>
      </div>
    );
  }  
});

module.exports = LinkInput;
