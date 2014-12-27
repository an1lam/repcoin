'use strict';

var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');
var React = require('react');

var AboutPage = React.createClass({
  render: function() {
    return (
      <div className="aboutPage">
        <Toolbar />
        <div className="aboutContent container-fluid">
          <h2>About Repcoin</h2>
          <div className="aboutReps">
            <p>Repcoin is the first market-based approach to reputation. Use it to discover talent and prove yourself in your field.</p>

            <p>Repcoin hosts a centralized, unbiased source of reputation for experts and investors on countless topics.</p>
            <p>Sign up as an expert and showcase your talent for a given skill. Sign up as an investor and prove your eye for the best in the field.</p>

            <p>Repcoin ranks experts and investors within a given category on a bell curve. Your expert percentile is determined by the investments you receive, and your investor percentile is derived from the return on your investments.</p>

            <p>Your Repcoin reputation is portable. Display it on third party sites and use it as a pure rating for your skill.</p>

            <p>Choose your categories and start contributing to the purest metric of success on the web!</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
});

module.exports = AboutPage;
