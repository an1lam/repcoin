'use strict';

var React = require('react');
var strings = require('../lib/strings_utils.js');

var SearchItem = React.createClass({
  getInitialState: function() {
    return { imgClass: null };
  },

  getDefaultProps: function() {
    return {
      type: 'user',
      data: {},
    };
  },

  componentDidMount: function() {
    this.setState({ imgClass: 'searchBarImg ' + this.props.data._id });
  },

  handleImgError: function() {
    $(this.state.imgClass).attr('src', strings.DEFAULT_USER_PIC);
  },

  render: function() {
    var data = this.props.data;
    var img = '';
    var imgUrl = strings.DEFAULT_USER_PIC;
    var itemClass = this.props.type + '-search-item searchItem';
    if (data) {
      if (data.username) {
        if (data.picture && data.picture.url) {
          imgUrl = data.picture.url;
        }
      } else {
        imgUrl = strings.DEFAULT_CATEGORY_PIC;
      }
    }

    img = <img className={this.state.imgClass} src={imgUrl} onError={this.handleImgError}></img>;

    var name = data.username ? data.username : data.name;
    return (
      <div className={itemClass}>
        {img}
        {name}
      </div>
    );
  }
});

module.exports = SearchItem;
