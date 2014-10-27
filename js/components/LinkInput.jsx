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
    this.updateLinks({ title: this.refs.description.getDOMNode().value, url: this.refs.url.getDOMNode().value });
  },

  getNewLinks: function(userLinks, link) {
    for (var i = 0; i < userLinks.length; i++) {
      var l = userLinks[i];
      if (this.props.title == l.title && this.props.url == l.url) {
        if (link.title.length !== 0) {
          userLinks[i].title = link.title;
        }
        if (link.url.length !== 0) {
          userLinks[i].url = link.url;
        }
        return userLinks;
      }
    }
    userLinks.push(link);
    return userLinks; 
  },

  updateLinks: function(link) {
    var url = '/api/users/' + this.props.user._id;
    var links = this.getNewLinks(this.props.user.links, link);
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
    var title = this.props.title || "Description";
    var url = this.props.url || "URL";
    return(
      <div className="linkInput">
        <form onSubmit={this.handleSubmit} onReset={this.propagateReset}>
          <div>
            <input type="text" ref="description" className="form-control" placeholder={title}></input>
            <p> : </p>
            <input type="text" ref="url" className="form-control" placeholder={url}></input>
          </div>
          <button type="submit" className="btn btn-success">Save</button> 
          <button type="reset" className="btn btn-default">Cancel</button> 
        </form>
      </div>
    );
  }  
});

module.exports = LinkInput;
