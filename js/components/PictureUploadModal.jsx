'use strict';

var $ = require('jquery');
var auth = require('../auth.jsx');

var PubSub = require('pubsub-js');
var cropit = require('cropit');
var DEFAULT_LINK = 'http://res.cloudinary.com/repcoin/image/upload/v1419620814/default_profile_od0xw5.jpg';
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');
var React = require('react');

var PictureUploadModal = React.createClass({
  mixins: [ModalMixin],

  componentDidMount: function() {
    var picture = this.props.user.picture;
    var imageSrc = picture ? picture.url : DEFAULT_LINK;
    $(".image-cropper").cropit({
      imageBackground: true,
      imageState: { src: imageSrc },
      exportZoom: 0.56,
      allowCrossOrigin: true
    });
  },

  handleClick: function(e) {
    e.preventDefault();
    this.setState({ pictureSelected: true });
    $('.cropit-image-input').click();
  },

  savePicture: function(uri) {
    var url = '/api/' + this.props.user._id + '/upload';
    var data = { uri: uri };
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      success: function(result) {
        this.updateUserPhoto(result);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  updateUserPhoto: function(result) {
    var user = this.props.user;
    var url = '/api/users/'+ user._id;

    var oldPublicId;
    if (user.picture) {
      var oldPublicId = user.picture.public_id;
    }

    // Give the user the new photo information
    user.picture = { url: result.url, public_id: result.public_id};
    $.ajax({
      url: url,
      type: 'PUT',
      data: user,
      success: function(user) {
        auth.storeCurrentUser(user, function(user) {
          return user;
        });
        this.deleteOldPhoto(oldPublicId, function() {
          PubSub.publish('profileupdate');
          this.props.hide();
        }.bind(this));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  deleteOldPhoto: function(public_id, cb) {
    var url = '/api/' + this.props.user._id + '/remove/' + public_id;
    $.ajax({
      url: url,
      type: 'PUT',
      success: function() {
        cb();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
        PubSub.publish('profileupdate');
        this.props.hide();
      }.bind(this)
    });
  },

  handleSave: function(e) {
    e.preventDefault();
    var uri = $(".image-cropper").cropit('export', {
        type: 'image/jpeg',
        quality: .9,
        originalSize: true,
        allowCrossOrigin: true
      });
    this.savePicture(uri);
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
                <input type="file" className="cropit-image-input" accept="image/*"/>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={this.handleClick} type="button" className="btn btn-default">Select an image</button>
              <button onClick={this.handleSave} type="button" className="btn btn-primary">Save!</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = PictureUploadModal;
