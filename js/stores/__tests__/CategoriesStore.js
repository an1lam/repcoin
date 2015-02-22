jest.dontMock('../../constants/RepcoinConstants.js');
jest.dontMock('../CategoriesStore.js');
jest.dontMock('../../lib/strings_utils.js')
jest.dontMock('object-assign');
jest.dontMock('keymirror');
jest.dontMock('react/lib/merge');

describe('CategoriesStore', function() {

  var RepcoinConstants = require('../../constants/RepcoinConstants.js');
  var AppDispatcher;
  var CategoriesStore;
  var cb;

  var actionReceiveCategories = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_CATEGORIES,
      categories: [{'name': 'foo'}, {'name': 'bar'}]
    }
  };

  var actionSortCategories = {
    source: RepcoinConstants.PayloadSources.VIEW_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.SORT_CATEGORIES,
      selected: 'Alphabetical'
    }
  };

  beforeEach(function() {
    AppDispatcher = require('../../dispatcher/RepcoinAppDispatcher');
    CategoriesStore = require('../CategoriesStore');
    callback = AppDispatcher.register.mock.calls[0][0];
  });

  it('registers a callback with the dispatcher', function() {
    expect(AppDispatcher.register.mock.calls.length).toBe(1);
  });

  it('should initialize with no categories', function() {
    var all = CategoriesStore.getAll();
    expect(all).toEqual([]);
  });

  it('gets the categories returned from the server', function() {
    callback(actionReceiveCategories);
    var all = CategoriesStore.getAll();
    expect(all.length).toBe(2);
    expect(all[0]).toEqual({ name: 'foo'});
  })

  it('sorts the categories by selected', function() {
    callback(actionReceiveCategories);
    callback(actionSortCategories);
    var all = CategoriesStore.getAll();
    expect(all.length).toBe(2);
    expect(all[0]).toEqual({ name: 'bar' });
  })

})
