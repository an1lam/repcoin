/** @jsx React.DOM */
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var TestHelper = require('test_helpers.jsx');


describe('Rendering the CategoryPage', function() {
  var CategoryPage = require('components/CategoryPage.jsx');
  var auth = require('auth.jsx');
  var $ = require('jquery');
  beforeEach(function(){
    spyOn($, "ajax").and.callFake(function(args) {
      return args;
    });
    spyOn(auth, "getCurrentUser").and.returnValue({'userId': 'foo'});
    TestCategoryPage = TestHelper.makeStubbedDescriptor(CategoryPage, {"params": {"category": "foo"}});
    categoryPage = TestUtils.renderIntoDocument(TestCategoryPage);
  });

  it('Should render the CategoryPage and all its child components', function() {
    var feed = TestUtils.findRenderedDOMComponentWithClass(categoryPage, "feed");
    var categoryPageHeader = TestUtils.scryRenderedDOMComponentsWithClass(categoryPage, "categoryPageHeader");
    expect(feed).toBeDefined();
    expect(categoryPageHeader).toBeDefined();

  });

  it('Should call the auth function to get current user', function() {
    expect(auth.getCurrentUser).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('Should ask the backend for the category foo', function () {
    expect($.ajax).toHaveBeenCalledWith({
      url: 'api/categories/foo',
      success: jasmine.any(Function),
      error: jasmine.any(Function)
    });
  });
});
