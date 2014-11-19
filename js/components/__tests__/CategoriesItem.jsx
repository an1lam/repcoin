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
          'name': 'foo', 'reps': 5,
          'directScore': 10, 'previousDirectScore': 11,
        }
      });
    categoriesItemComponent = TestUtils.renderIntoDocument(
      <table><tbody>{TestCategoriesItem}</tbody></table>);
  });
  
  it('generates an item in a table', function() {
    var tableData = TestUtils.scryRenderedDOMComponentsWithTag(
      categoriesItemComponent, 'td');
    expect(tableData.length).toEqual(3);
    expect(tableData[0].getDOMNode().textContent).toEqual('foo');
    expect(tableData[2].getDOMNode().textContent).toEqual('5');
  });
  
  it('has a score bar with a current score', function() {
    var scoreBar = TestUtils.findRenderedDOMComponentWithClass(
      categoriesItemComponent, 'scoreBar').getDOMNode();
    expect(scoreBar.children[0].className).toEqual('score foo');
    expect(scoreBar.children[1].textContent).toEqual('10');
    
  })
})