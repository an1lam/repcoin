var BootstrapModalMixin = require('../mixins/BootstrapModalMixin.jsx');
var strings = require('../lib/strings_utils.js');
var React = require('react');

var TutorialPanel = React.createClass({
  mixins: [BootstrapModalMixin],
  propTypes: {
    title: React.PropTypes.string,
    content: React.PropTypes.string,
    clazz: React.PropTypes.string,
  },

  getInitialState: function() {
    return {
      step: 0,
    };
  },

  goToNext: function() {
    var nextStep = this.state.step + 1;
    if (nextStep < strings.TUTORIAL_CONTENTS.length) {
      this.setState({ step: nextStep });
    } else {
      this.setState({ step: 0 });
    }
  },

  render: function() {
    var modalStyleOverride = {
      'zIndex': 1050,
    };
    var header = strings.TUTORIAL_CONTENTS[this.state.step].TITLE;
    var content = strings.TUTORIAL_CONTENTS[this.state.step].CONTENT;
    var classes1 = "tutorial-panel modal reps_modal modal-open " + strings.TUTORIAL_CONTENTS[this.state.step].CLASS + "-explanation";
    var classes2 = "modal-dialog " + strings.TUTORIAL_CONTENTS[this.state.step].CLASS + "-position";

    return (
      <div className={classes1} >
        <div className={classes2} style={modalStyleOverride}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{header}</h3>
            </div>
            <div className="tutorial-text">
              {content}
            </div>
            <div className="modal-footer">
              <button onClick={this.goToNext}>Next</button>
            </div>
          </div>
        </div>
      </div>

    );
  },

});

module.exports = TutorialPanel;
