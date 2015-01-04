'use strict';

var Footer = require('./Footer.jsx');
var React = require('react');
var Toolbar = require('./Toolbar.jsx');

var ContactUsPage = React.createClass({
  render: function() {
    return (
      <div>
        <Toolbar />
        <div className="container-fluid">
          <p>If you have questions, comments or concerns, please email&nbsp;
          <a href="mailto:stephenmalina@gmail.com?Subject=Reps%20Contact" target="_top">Stephen</a>
          &nbsp;or&nbsp;
          <a href="mailto:mritter123@gmail.com?Subject=Reps%20Contact" target="_top">Matt</a>&nbsp;
            and we will do our best to get back to you ASAP.</p>
        </div>
        <Footer />
      </div>
    );
  }
});

module.exports = ContactUsPage;
