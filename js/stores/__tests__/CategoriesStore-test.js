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

  beforeEach(function() {
    AppDispatcher = require('../../dispatcher/RepcoinAppDispatcher');
    CategoriesStore = require('../CategoriesStore');
    callback = AppDispatcher.register.mock.calls[0][0];
  });

  it('registers a callback with the dispatcher', function() {
    expect(AppDispatcher.register.mock.calls.length).toBe(1);
  });

  describe('currentCategory', function() {
    it('should initialize with no category and no error', function() {
      expect(CategoriesStore.getCurrentCategory()).toEqual(null);
      expect(CategoriesStore.getCurrentCategoryError()).toEqual(null);
    });

    it('gets the current category returned from the server', function() {
      var actionReceiveCurrentCategory = {
        source: RepcoinConstants.PayloadSources.SERVER_ACTION,
        action: {
          type: RepcoinConstants.ActionTypes.RECEIVE_CURRENT_CATEGORY,
          currentCategory: {'name': 'foo'}
        }
      };

      callback(actionReceiveCurrentCategory);
      expect(CategoriesStore.getCurrentCategory()).toEqual({ 'name': 'foo' });
      expect(CategoriesStore.getCurrentCategoryError()).toEqual(null);
    });

    it('sets a 404 error if no category is found from the server', function() {
      var actionReceiveCurrentCategory = {
        source: RepcoinConstants.PayloadSources.SERVER_ACTION,
        action: {
          type: RepcoinConstants.ActionTypes.RECEIVE_CURRENT_CATEGORY,
          currentCategory: null
        }
      };

      callback(actionReceiveCurrentCategory);
      expect(CategoriesStore.getCurrentCategory()).toEqual(null);
      expect(CategoriesStore.getCurrentCategoryError()).toEqual(404);
    });

    it('receives error getting a current category', function() {
      var actionReceiveCurrentCategory = {
        source: RepcoinConstants.PayloadSources.SERVER_ACTION,
        action: {
          type: RepcoinConstants.ActionTypes.RECEIVE_CURRENT_CATEGORY_ERROR,
          error: 'ERROR!'
        }
      };

      callback(actionReceiveCurrentCategory);
      expect(CategoriesStore.getCurrentCategory()).toEqual(null);
      expect(CategoriesStore.getCurrentCategoryError()).toEqual('ERROR!');
    });
  });

  it('should initialize with no categories', function() {
    var all = CategoriesStore.getAll();
    expect(all).toEqual([]);
  });

  var actionReceiveCategories = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_CATEGORIES,
      categories: [{'name': 'foo'}, {'name': 'bar'}]
    }
  };

  it('gets the categories returned from the server', function() {
    callback(actionReceiveCategories);

    var all = CategoriesStore.getAll();
    expect(all.length).toBe(2);
    expect(all[0]).toEqual({ name: 'foo'});
  });

  var actionSortCategories = {
    source: RepcoinConstants.PayloadSources.VIEW_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.SORT_CATEGORIES,
      selected: 'Alphabetical'
    }
  };

  it('sorts the categories by selected', function() {
    callback(actionReceiveCategories);
    callback(actionSortCategories);

    var all = CategoriesStore.getAll();
    expect(all.length).toBe(2);
    expect(all[0]).toEqual({ name: 'foo' });
  });

  var actionReceiveTotalTraded = {
    source: RepcoinConstants.PayloadSources.SERVER_ACTION,
    action: {
      type: RepcoinConstants.ActionTypes.RECEIVE_TOTAL_TRADED,
      totalTraded: 1000
    }
  };

  it('stores the total traded from the server', function() {
    callback(actionReceiveTotalTraded);
    expect(CategoriesStore.getTotalTraded()).toEqual('1,000');
  });

  it('stores the hot categories and users from the server', function() {
    var actionReceiveHotCategoriesAndUsers = {
      source: RepcoinConstants.PayloadSources.SERVER_ACTION,
      action: {
        type: RepcoinConstants.ActionTypes.HOT_CATEGORIES_AND_USERS,
        categories: [{
          name: 'testCat',
          users: [{
            name: 'testUser'
          }]
        }]
      }
    };

    callback(actionReceiveHotCategoriesAndUsers);

    expect(CategoriesStore.getHot()).toEqual([{
      name: 'testCat',
      users: [{
        name: 'testUser'
      }]
    }]);
  });

  it('stores the category investor sizes sizes from the server', function() {
    var actionReceiveCategoryInvestorSizes = {
      source: RepcoinConstants.PayloadSources.SERVER_ACTION,
      action: {
        type: RepcoinConstants.ActionTypes.CATEGORY_INVESTOR_SIZES,
        categories: [{
          name: 'testCat',
          experts: 10,
        }]
      }
    };

    callback(actionReceiveCategoryInvestorSizes);
    expect(CategoriesStore.getMembers(false)).toEqual([{
      name: 'testCat',
      investors: 10,
    }]);
  });

  it('stores the category expert sizes sizes from the server', function() {
    var actionReceiveCategoryExpertSizes = {
      source: RepcoinConstants.PayloadSources.SERVER_ACTION,
      action: {
        type: RepcoinConstants.ActionTypes.CATEGORY_EXPERT_SIZES,
        categories: [{
          name: 'testCat',
          experts: 10,
        }]
      }
    };

    callback(actionReceiveCategoryExpertSizes);
    expect(CategoriesStore.getMembers(true)).toEqual([{
      name: 'testCat',
      experts: 10,
    }]);
  });
})
