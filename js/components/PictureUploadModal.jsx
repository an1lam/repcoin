"use strict";

global.jQuery = global.$ = require('jquery');
require('cropit');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');
var React = require('react');

var PictureUploadModal = React.createClass({
  mixins: [ModalMixin],

  componentDidMount: function() {
    debugger;
    $(".image-cropper").cropit({ imageBackground: true });
  },

  render: function() {
    var modalStyleOverride = {
      'zIndex': 1050,
    };

    return (
      <div className="modal">
        <div className="modal-dialog" style={modalStyleOverride}>
          <div className="modal-content">
            <div className="modal-header">
              {this.renderCloseButton()}
            </div>
            <div className="modal-body">
              <div className="image-cropper">
                <div className="cropit-image-preview-container">
                  <div className="cropit-image-preview"></div>
                </div>
                
                <input type="range" className="cropit-image-zoom-input" />

                <input type="file" className="cropit-image-input" />
                <div className="select-image-btn">Select an image</div>
              </div>
            </div> 
            <div className="modal-footer">
            </div>
          </div>
        </div>
      </div>
    );
  }
  
});

module.exports = PictureUploadModal;
