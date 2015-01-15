'use strict';

var React = require('react');
var DEFAULT_LINK = 'http://res.cloudinary.com/repcoin/image/upload/v1419620814/default_profile_od0xw5.jpg';
var CATEGORY_LINK = 'http://res.cloudinary.com/repcoin/image/upload/v1421283105/tag_yib4xo.svg';

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
    $(this.state.imgClass).attr('src', DEFAULT_LINK);
  },

  render: function() {
    var data = this.props.data;
    var img = '';
    var imgUrl = DEFAULT_LINK;
    var itemClass = this.props.type + '-search-item searchItem';
    if (data) {
      if (data.username) {
        if (data.picture && data.picture.url) {
          imgUrl = data.picture.url;
        }
      } else {
        imgUrl = CATEGORY_LINK;
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
