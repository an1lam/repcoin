var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var TestHelper = require('test_helpers.jsx');
  
describe('Rendering the Modal', function() {
  var Modal = require('components/Modal.jsx');
  var auth = require('auth.jsx');
  var $ = require('jquery');
  var mockAjaxResponses = TestHelper.mockAjaxResponses;

  beforeEach(function() {
    spyOn($, "ajax").and.callFake(function(args) {
      args.success(mockAjaxResponses[args.url]);
    });

      mockHideFunction = jasmine.createSpy();
      TestModal = TestHelper.makeStubbedDescriptor(
        Modal,
        {
          'hide': mockHideFunction,
          'currentUser': TestHelper.mockUsers.from,
          'user': TestHelper.mockUsers.to,
        }
      );
      ModalComponent = TestUtils.renderIntoDocument(TestModal);
  });

  it('renders one transaction in the table', function() {
    // Get the cells in the table that shows the currentUser's current portfolio
    // Make sure that the table has rendered mock currentUser's transactions
    var cells = TestUtils.scryRenderedDOMComponentsWithTag(
      ModalComponent, 'td');
    expect(cells[0].getDOMNode().textContent).toEqual("1");
    expect(cells[1].getDOMNode().textContent).toEqual("testing");
    expect(cells[2].getDOMNode().textContent).toEqual("10");
    expect(cells[3].getDOMNode().textContent).toEqual("100");
  });
  
  it('renders the correct category-to-invest-in', function() {
    // Category-to-invest in renders our testing category
    var options = TestUtils.scryRenderedDOMComponentsWithTag(
      ModalComponent, 'option');
    expect(options[0].getDOMNode().textContent).toEqual("testing (3 available)")
  });

  it('creates a give transaction correctly', function () {
    // Simulate creating a transaction where currentUser gives to another user
    var amountInput = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'reps_text-input').getDOMNode();
    amountInput.value = 1;
    var error = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'modal_error').getDOMNode();
    var form = TestUtils.findRenderedDOMComponentWithTag(ModalComponent, 'form')
      .getDOMNode();
    TestUtils.Simulate.submit(form);
    expect(error.textContent).toEqual('');
    expect($.ajax).toHaveBeenCalledWith({
      url: '/api/transactions',
      type: 'POST',
      data: {
        to: jasmine.any(Object),
        from: jasmine.any(Object),
        category: 'testing',
        amount: 1,
        anonymous: false,
        id: undefined,
      },
      success: jasmine.any(Function),
      error: jasmine.any(Function)
    })
    expect(mockHideFunction).toHaveBeenCalled();
  });

  it('creates a revoke transaction correctly', function () {
    // Simulate creating a transaction where currentUser revokes to another user
    var amountInput = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'reps_text-input').getDOMNode();
    amountInput.value = 10;
    var error = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'modal_error').getDOMNode();

    var revokeButton = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'revokebtn').getDOMNode();
    TestUtils.Simulate.click(revokeButton);   

    var form = TestUtils.findRenderedDOMComponentWithTag(ModalComponent, 'form')
      .getDOMNode();
    TestUtils.Simulate.submit(form);

    var id = TestHelper.mockUsers.from.portfolio[0].investments[0]._id;
    expect(error.textContent).toEqual('');
    expect($.ajax).toHaveBeenCalledWith({
      url: '/api/transactions',
      type: 'POST',
      data: {
        to: jasmine.any(Object),
        from: jasmine.any(Object),
        category: 'testing',
        amount: -10,
        anonymous: false,
        id: id,
      },
      success: jasmine.any(Function),
      error: jasmine.any(Function)
    })
    expect(mockHideFunction).toHaveBeenCalled();
  });
  
  it('does not allow the user to revoke reps unless the amount is valid',
  function() {
    var amountInput = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'reps_text-input').getDOMNode();
    amountInput.value = 100;
    var error = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'modal_error').getDOMNode();
    var revokeButton = TestUtils.findRenderedDOMComponentWithClass(
      ModalComponent, 'revokebtn').getDOMNode();
    TestUtils.Simulate.click(revokeButton);
    var form = TestUtils.findRenderedDOMComponentWithTag(ModalComponent, 'form')
      .getDOMNode();
    TestUtils.Simulate.submit(form);

    var amount = TestHelper.mockUsers.from.portfolio[0].investments[0].amount;
    var msg = 'That investment only has ' + amount + ' reps in it';
    expect(error.textContent).toEqual(msg);
    expect(mockHideFunction).not.toHaveBeenCalled();
  });
});
