/** @jsx React.DOM */
"use strict";

var React = require('react');
var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');

var AboutPage = React.createClass({
  render: function() {
    return (
      <div className="aboutPage">
        <Toolbar />
        <div className="aboutContent text-center container-fluid">
          <h2>About Reps</h2>
          <div className="aboutReps">
            <p>Reps are the canonical source of reputation for the digital age.</p>

            <p>On the Reps site, we allow users to allocate their Reps to other users for different categories based on
            their knowledge of that users expertise in a category.</p>

            <p>Each user possesses three scores, the Direct Score, the Crowd Score, and the Expert Score.</p>

            <p><h4>The Direct Score</h4></p>
            <p>The Direct score consists of the number of Reps other users have allocated towards you in a given category.</p>
            <p><h4>The Expert Score</h4></p>
            <p>The Expert score consists of the accuracy of your Rep allocations.</p>
            <p><h4>The Crowd Score</h4></p>
            <p>The Crowd score is determined by measuring the notoriety of the users who rate you and applying a scaling factor
            to your Direct Score based on that metric.</p>

          </div>
        </div>
        <Footer />
      </div>
    );
  }
});

module.exports = AboutPage;
