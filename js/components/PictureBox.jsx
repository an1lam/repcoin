"use strict";

var $ = require('jquery');
var DEFAULT_LINK = "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png";
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
    this.setState({ showModal: false });
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

    return (
      <div className="pictureBox" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
        <img className="img-thumbnail" src={this.props.user.picture} onError={this.handleImgError} ></img>
      {edit}
      {modal}
      </div>
    );
  }
});

module.exports = PictureBox;
