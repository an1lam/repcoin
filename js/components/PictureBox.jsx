'use strict';

var $ = require('jquery');
var DEFAULT_LINK = 'http://res.cloudinary.com/repcoin/image/upload/v1419620814/default_profile_od0xw5.jpg';
var PictureUploadModal = require('./PictureUploadModal');
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
    this.setState({ showModal: false, showEdit: false });
  },

  handleMouseOver: function() {
    this.setState({ showEdit: true });
  },

  handleMouseLeave: function() {
    this.setState({ showEdit: false });
  },

  handleClick: function() {
    this.setState({ showModal: true });
  },

  handleImgError: function() {
    $(".img-thumbnail").attr("src", DEFAULT_LINK);
  },

  render: function() {
    var modal = '';
    if (this.state.showModal) {
      modal = <PictureUploadModal ref="modal" show={true} hide={this.handleHideModal} className="modal-open" user={this.props.user}/>;
    }

    var edit = '';
    if (this.props.currentUser._id == this.props.user._id) {
      if (this.state.showEdit) {
        edit = <div className="editPhoto" onClick={this.handleClick}>
                   <span className="glyphicon glyphicon-camera"></span>
                   <p className="pictureEditText">Update profile picture</p>
                </div>;
      }
    }

    var imgUrl = this.props.user.picture && this.props.user.picture.url || DEFAULT_LINK;
    return (
      <div className="pictureBox" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        <img className="img-thumbnail" src={imgUrl} onError={this.handleImgError} ></img>
      {edit}
      {modal}
      </div>
    );
  }
});

module.exports = PictureBox;
