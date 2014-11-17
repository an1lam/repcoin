"use strict";

var $ = require('jquery');
var auth = require('../auth.jsx');
var cropit = require('cropit');
var PictureUploadModal = require('./PictureUploadModal');
var PubSub = require('pubsub-js');
var React = require('react');

var PictureBox = React.createClass({

  getInitialState: function() {
    return { showEdit: false, showModal: false };
  },

  handleShowModal: function() {
    this.setState({ showModal: true });
  },

  handleHideModal: function() {
    $('body').removeClass('modal-open');
    this.setState({ showModal: false });
  },

  handleChange: function(e) {
    e.preventDefault();
    var file = e.target.files[0];
    var url = '/api/upload';
    var data = new FormData();
    var date = new Date();
    data.append(this.props.user._id + + date.getTime() + '.' + file.name.split('.')[1], file);
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
        });
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
      }.bind(this)
    });
  },

  handleMouseOver: function() {
    this.setState({ showEdit: true });
  },

  handleMouseLeave: function() {
    this.setState({ showEdit: false });
  },

  handleClick: function() {
    this.setState({ showModal: true }); 
    $('.pictureUpload').trigger('click');
  },

  render: function() {
    var modal = '';
    if (this.state.showModal) {
      modal = <PictureUploadModal ref="modal" show={true} hide={this.handleHideModal} className="modal-open"/>;
    }

    var edit = '';
    if (this.props.currentUser._id == this.props.user._id) {
      if (this.state.showEdit) {
        edit = <div className="editPhoto">
                 <div className="editPhotoForm">
                   <form action="/api/upload" name="form" encType="multipart/form-data" method="post">
                     <input id="file" name="file" className="pictureUpload" type="file" accept="image/*" onChange={this.handleChange} />
                   </form>
                 </div>
                 <div className="editPhotoDisplay" onClick={this.handleClick}>
                   <span className="glyphicon glyphicon-camera"></span>
                   <p className="pictureEditText">Update profile picture</p>
                </div>  
              </div>;
      }
    }

    return (
      <div className="pictureBox" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        <img className="img-thumbnail" src={this.props.user.picture}></img>
      {edit}
      {modal}
      </div>
    );
  }

});

module.exports = PictureBox;
