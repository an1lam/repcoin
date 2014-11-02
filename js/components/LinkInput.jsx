"use strict"; 

var $ = require('jquery');
var auth = require('../auth.jsx');
var PubSub = require('pubsub-js');
var React = require('react');

var LinkInput = React.createClass({

  handleSubmit: function(event) {
    event.preventDefault();
    this.updateLinks({ title: this.refs.description.getDOMNode().value, url: this.refs.url.getDOMNode().value });
  },

  getNewLinks: function(userLinks, link) {
    for (var i = 0; i < userLinks.length; i++) {
      var l = userLinks[i];
      if (this.props.title == l.title && this.props.url == l.url) {
        userLinks[i].title = link.title.length > 0 ? link.title : userLinks[i].title;
        userLinks[i].url = link.url.length > 0 ? link.url : userLinks[i].url;
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
    return (
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
