/** @jsx React.DOM */
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var assert = require('chai').assert;
var jsdom = require('jsdom').jsdom;

// TODO: Abstract out these functions into a helper modules
global.initDOM = function () {
    var jsdom = require('jsdom').jsdom;
    global.window = jsdom().createWindow('<html><body></body></html>');
    global.document = window.document;
    global.navigator = window.navigator;
}

global.cleanDOM = function() {
    delete global.window;
    delete global.document;
    delete global.navigator;
}

describe('Test modules we need', function() {
  describe('Testing chai', function() {
    it ('should pass', function() {
      assert.equal(true, true);
      assert.equal(false, false);
    });
  });

  describe('Testing jsdom', function() {
    beforeEach(function() {
      initDOM();
    });

    afterEach(function() {
      cleanDOM();
    });

    it ('should pass', function() {
      var testDOMElement = TestUtils.renderIntoDocument(<div>We doing some testing</div>);
      assert.equal(testDOMElement.props.children, 'We doing some testing');
      assert.equal(window.document.body.innerHTML, '');
    });
  });
});
