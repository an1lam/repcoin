var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var TestHelper = require('test_helpers.jsx');

describe('Categories Item: ', function() {
  var CategoriesItem = require('components/CategoriesItem.jsx');
  beforeEach(function() {
    TestCategoriesItem = TestHelper.makeStubbedDescriptor(
      CategoriesItem,
      {
        'includeReps': true,
        'category': {
          'name': 'foo',
          'percentile': 10, 'previousPercentile': 11,
          'investors': [{
            'username': 'foo', 'reps': 5,
          }],
        }
      });
    categoriesItemComponent = TestUtils.renderIntoDocument(
      <table><tbody>{TestCategoriesItem}</tbody></table>);
  });
  
  it('generates an item in a table', function() {
    var tableData = TestUtils.scryRenderedDOMComponentsWithTag(
      categoriesItemComponent, 'td');
    expect(tableData.length).toEqual(4);
    expect(tableData[0].getDOMNode().textContent).toEqual('foo ');
  });
  
  it('has a score bar with a current score', function() {
    var scoreBar = TestUtils.findRenderedDOMComponentWithClass(
      categoriesItemComponent, 'scoreBar').getDOMNode();
    expect(scoreBar.children[0].className).toEqual('score foo');
    expect(scoreBar.children[1].textContent).toEqual('10');
    
  })
})
