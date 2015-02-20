var $ = require('jquery');

var ServerActionCreator = require('./actions/RepcoinServerActionCreator.js');

module.exports = {
  getCategories: function() {
    $.ajax({
      url: '/api/categories',
      success: ServerActionCreator.receiveCategories,
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      },
    })
  }
}
