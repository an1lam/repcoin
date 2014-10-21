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
    var title = this.refs.description.getDOMNode().value;
    var url = this.refs.url.getDOMNode().value;
    var link = { title: title, url: url };
    this.addLink(this.props.user, link);
  },

  addLink: function(user, link) {
    var url = '/api/users/' + user._id + '/links';
    var links = user.links;
    links.push(link);
    $.ajax({
      url: url,
      type: 'PUT',
      data: JSON.stringify(links),
      dataType: 'json',
      contentType: 'application/json',
      success: function(user) {
        auth.storeCurrentUser(user);
        PubSub.publish('profileupdate');
        this.propogateReset();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        this.propogateReset();
      }.bind(this)
    });
  },

  propogateReset: function() {
    this.props.onReset();
  },

  render: function() {
    return(
      <div className="linkInput">
        <form onSubmit={this.handleSubmit} onReset={this.propogateReset}>
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
