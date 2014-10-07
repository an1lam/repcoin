/** @jsx React.DOM */
"use strict";
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;


describe('Authentication: Logging In', function() {
  it('Doesn\'t currently have a logged in user', function () {
    var $ = require('jquery');
    jest.dontMock('../js/auth.jsx');
    var auth = require('../js/auth.jsx');
    auth.loggedIn();
    expect($.ajax).toBeCalledWith({
      url: 'api/loggedIn',
      type: 'GET',
      error: jasmine.any(Function),
      success: jasmine.any(Function)
    });
  });

});
