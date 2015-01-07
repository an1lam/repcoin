var CategoryPage = require('components/CategoryPage.jsx');
var React = require('react/addons');
var Router = require('react-router'),
    Route = Router.Route;
var TestUtils = React.addons.TestUtils;
var TestHelper = require('test_helpers.jsx');

describe('Categories Item: ', function() {
  var CategoriesItem = require('components/CategoriesItem.jsx');
  beforeEach(function() {
    var props = {
      'includeReps': true,
      'category': {
        'name': 'foo',
        'percentile': 10, 'previousPercentile': 11,
        'investors': [{
          'username': 'foo', 'reps': 5,
        }],
      }
    };

    var routes = [
      <Route name="category" path="/categories/:category" handler={CategoryPage}/>,
      <Route path="/test" handler={CategoriesItem} />
    ];

    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<table><tbody></tbody></table>';
    this.component = TestHelper.getRouterComponent(
      props, routes, wrapper);

  });

  it('generates an item in a table', function() {
    var tableData = TestUtils.scryRenderedDOMComponentsWithTag(
      this.component, 'td');
    expect(tableData.length).toEqual(4);
    expect(tableData[0].getDOMNode().textContent).toEqual('foo');
  });

  it('has a score bar with a current score', function() {
    var scoreBar = TestUtils.findRenderedDOMComponentWithClass(
      this.component, 'scoreBar').getDOMNode();
    expect(scoreBar.children[0].className).toEqual('score foo');
    expect(scoreBar.children[1].textContent).toEqual('10');

  })
})
