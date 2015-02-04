'use strict';
var Footer = require('./Footer.jsx');
var Toolbar = require('./Toolbar.jsx');
var React = require('react');
var strings = require('../lib/strings_utils.js');

var TeamPage = React.createClass({
  render: function() {
    return (
      <div className="teamPage">
        <div className="row">
          <Toolbar />
        </div>
        <div className="row col-md-8 col-md-offset-1 team-content">
          <h1>The Team</h1>
          <p>{strings.TEAM_PART_1A} <a href="http://krazemon.github.io/">Stephen Malina</a> and <a href="https://www.linkedin.com/profile/public-profile-settings?trk=prof-edit-edit-public_profile">Matt Ritter</a>. {strings.TEAM_PART_1B}</p>
          <img className="team-picture" src={strings.TEAM_PICTURE} />
          <p>{strings.TEAM_PART_2}</p>
          <p>{strings.TEAM_PART_3}</p>
          <p>{strings.TEAM_PART_4}</p>
          <p>{strings.TEAM_PART_5}</p>
        </div>
        <div className="row footerrow">
          <Footer />
        </div>
      </div>
    );
  },
});

module.exports = TeamPage;
