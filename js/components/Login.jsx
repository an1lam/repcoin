/** @jsx React.DOM */
"use strict";

var React = require('react');

var Login = React.createClass({
  render: function() {
    return (
      <div className="login">
        <form>
          <input type="text" className="loginControl form-control" placeholder="Username"></input>
          <input type="text" className="loginControl form-control" placeholder="Password"></input>
          <button type="submit" className="loginSubmit btn btn-default">Login</button>
        </form>
      </div>
    );
  }
});

module.exports = Login;
