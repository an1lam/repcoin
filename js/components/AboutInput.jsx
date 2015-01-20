'use strict';

var $ = require('jquery');
var PubSub = require('pubsub-js');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var AboutInput = React.createClass({
  getInitialState: function() {
    return { error: null };
  },

  componentDidMount: function() {
    if (this.props.user.about) {
      $(".about-form").val(this.props.user.about);
    }
  },

  handleSubmit: function(event) {
    event.preventDefault();

    // Validate input
    var text = this.refs.about.getDOMNode().value;
    if (text.length > 200) {
      this.setState({ error: strings.TEXT_LONGER_THAN_200 });
    } else if (text.trim().length === 0) {
      this.setState({ error: strings.TEXT_BLANK });
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
    var about = this.props.user.about || strings.ADD_BRIEF_DESCRIPTION;
    return (
      <div className="aboutInput">
        <form onSubmit={this.handleSubmit} onReset={this.propagateReset}>
          <textarea ref="about" rows="2" className="form-control about-form" placeholder={about}></textarea>
          <button type="submit" className="btn btn-success">Save</button>
          <button type="reset" className="btn btn-default">Cancel</button>
        </form>
        {error}
      </div>
    );
  }
});

module.exports = AboutInput;
