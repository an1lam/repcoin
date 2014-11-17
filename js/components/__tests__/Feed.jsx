/** @jsx React.DOM */
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var TestHelper = require('test_helpers.jsx');

describe('Render the Feed', function() {
  var Feed = require('components/Feed.jsx');
  var auth = require('auth.jsx');
  var responses = {
    '/api/transactions': [{'_id': 'testId1', 'category': 'testing', 'from': {'name': 'foo', 'id': 'foo'}, 'to': {'id': 'testId2', 'name': 'bar'}}]
  };
  beforeEach(function() {
    spyOn($, "ajax").and.callFake(function(params) {
      params.success(responses[params.url]);
    });
    spyOn(auth, "getCurrentUser").and.returnValue({'userId': 'foo'});
    TestFeed = TestHelper.makeStubbedDescriptor(Feed, {'userId': 'foo', 'parent': 'HomePage'});
    feedPage = TestUtils.renderIntoDocument(TestFeed);
  });
  it('Has a header with four select buttons', function() {
    var feedHeaderButtons = TestUtils.scryRenderedDOMComponentsWithClass(feedPage, "btn");
    expect(feedHeaderButtons.length).toEqual(4);
    expect(feedHeaderButtons[0].getDOMNode().value).toEqual("all");
    expect(feedHeaderButtons[1].getDOMNode().value).toEqual("to");
    expect(feedHeaderButtons[2].getDOMNode().value).toEqual("from");
    expect(feedHeaderButtons[3].getDOMNode().value).toEqual("us");
  });

  it('Has a list of transactions with correct from and to users', function() {
    var fromNames = TestUtils.scryRenderedDOMComponentsWithClass(feedPage, "fromName");
    var toNames = TestUtils.scryRenderedDOMComponentsWithClass(feedPage, "toName");
    expect(fromNames[0].getDOMNode().textContent).toEqual('foo');
    expect(toNames[0].getDOMNode().textContent).toEqual('bar');
  });

});
