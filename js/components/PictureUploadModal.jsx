"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

var PubSub = require('pubsub-js');
var cropit = require('cropit');
var ModalMixin = require('../mixins/BootstrapModalMixin.jsx');
var React = require('react');

var PictureUploadModal = React.createClass({
  mixins: [ModalMixin],

  componentDidMount: function() {
    var imageSrc = this.props.user.picture;
    $(".image-cropper").cropit({
      imageBackground: true,
      imageState: { src: imageSrc },
      exportZoom: 0.56
    });
  },

  handleClick: function(e) {
    e.preventDefault();
    $('.cropit-image-input').click();
  },

  dataURItoBlob: function(dataURI) {
    var type = dataURI.split(';')[0].split(":")[1];
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: type});
  },

  savePicture: function(uri) {
    var blob = this.dataURItoBlob(uri);
    if (!blob) {
      console.error("Unable to convert data URI to file");
      return;
    }
    var url = '/api/upload';
    var data = new FormData();
    var date = new Date();
    var type = blob.type.split('/')[1];
    data.append(this.props.user._id + date.getTime() + '.' + type, blob);
    $.ajax({
      url: url,
      cache: false,
      processData: false,
      contentType: false,
      type: 'POST',
      data: data,
      success: function(pictureLink) {
        this.updateUserPhoto(pictureLink);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  updateUserPhoto: function(pictureLink) {
    var url = '/api/users/' + this.props.user._id;
    var oldLink = this.props.user.picture;
    var user = this.props.user;
    user.picture = pictureLink;
    $.ajax({
      url: url,
      type: 'PUT',
      data: user,
      success: function(user) {
        auth.storeCurrentUser(user, function(user) {
          return user;
        });
        this.deleteOldPhoto(oldLink, function() {
          PubSub.publish('profileupdate');
          this.props.hide();
        }.bind(this));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },

  deleteOldPhoto: function(link, cb) {
    var url = '/api/remove';
    var data = { filename: link };
    $.ajax({
      url: url,
      type: 'PUT',
      data: data,
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
        originalSize: true
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
                <input type="file" className="cropit-image-input" />
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
