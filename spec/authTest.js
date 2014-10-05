/** @jsx React.DOM */
"use strict";
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

jest.dontMock('../js/auth.jsx');
jest.dontMock('superagent-browserify');
var auth = require('../js/auth.jsx');

describe('Authentication: Logging In', function() {
  beforeEach(function() {
    mockLocalStorage = {"token": undefined}
  });

  it('Doesn\' currently have a logged in user', function () {
    expect(auth.loggedIn(mockLocalStorage)).toEqual(false);
    mockLocalStorage.token = {
      "username": "krazemon",
      "password": "barbaz"
    }
    expect(auth.loggedIn(mockLocalStorage)).toEqual(true);
  });

  it('returns True when we login with a username and password stored in our token', function () {
    mockLocalStorage.token = {
      "username": "krazemon",
      "password": "barbaz"
    }
    expect(auth.logIn("krazemon", "barbaz", mockLocalStorage, function(bool) {
      return bool
    })).toBe(true);

  });
});
