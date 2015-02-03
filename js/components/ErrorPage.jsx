'use strict';

var $ = require('jquery');
var React = require('react');

var ErrorPage = React.createClass({
  render: function() {
    return (
      <div className='error-page'>
        <h2>Sorry, this page isn't available.</h2>
        You tried to go to a non-existent page! The link you followed was
        broken or the page you tried to access was removed.
        <br/>
        Here's a link back to the <a href={'/'}>home page</a>.
      </div>
    );
  }
});

module.exports = ErrorPage;
