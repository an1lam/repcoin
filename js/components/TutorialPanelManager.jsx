var React = require('react');
var TutorialPanel = require('./TutorialPanel.jsx');
var strings = require('../lib/strings_utils.js');

var TutorialManager = React.createClass({
  getInitialState: function() {
    return {
      currentPanel: 0,
    }
  },

  startTutorial: function() {
    this.refs.panel1.show();
  },

  render: function() {
    return (
      <div className="tutorial-manager">
        <button className="btn btn-default" onClick={this.startTutorial}>Take a Tour of the Site</button>
        <TutorialPanel show={false} key="tutorial-panel-1" title={strings.FEED_INFO_TITLE} content={strings.FEED_INFO_CONTENT} clazz={"feed-tutorial-panel"} ref="panel1" className="modal-open" />
      </div>)
  }

});

module.exports = TutorialManager;
