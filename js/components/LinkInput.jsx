/** @jsx React.DOM */
"use strict";

var React = require('react');

var LinkInput = React.createClass({
  render: function() {
    return(
      <div className="linkInput">
        <form>
          <div>
            <input type="text" className="description form-control" placeholder="Description"></input>
            <p> : </p>
            <input type="text" className="url form-control" placeholder="URL"></input>
          </div>
          <button type="submit" className="btn btn-success">Save</button> 
          <button type="submit" className="btn btn-default">Cancel</button> 
        </form>
      </div>
    );
  }  
});

module.exports = LinkInput;
