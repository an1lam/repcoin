var React = require('react');

var InputMixin = {
  sanitizeInput: function (input) {
    return input.replace(/[^\w\s]/gi, '')
  }
}

module.exports = InputMixin;
