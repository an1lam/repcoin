process.env.NODE_ENV = 'test';
var utils = require('../api/routes/utils.js');

var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');

describe("Utils: ", function() {
  describe('getInvestorPercentiles: ', function() {
    var investors, category, cb;
    
    beforeEach(function() {
      cb = jasmine.createSpy();
    });

    it('should give all investors a percentile of 50 if ROIs are the same', function() {
      category = "Coding";
      investors = [
        { _id: "1", portfolio: [ { category: category, roi: { value: 10, length: 2 } }] },
        { _id: "2", portfolio: [ { category: category, roi: { value: 10, length: 2 } }] },
      ];

      utils.getInvestorPercentiles(investors, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(investors[0].portfolio[0].percentile).toEqual(50);
      expect(investors[1].portfolio[0].percentile).toEqual(50);
    });

    it('should give all investors correct percentiles if ROIs are different', function() {

      category = "Coding";
      investors = [
        { _id: "1", portfolio: [ { category: category, roi: { value: 10, length: 2 } }] },
        { _id: "2", portfolio: [ { category: category, roi: { value: 13, length: 2 } }] },
        { _id: "3", portfolio: [ { category: category, roi: { value: 19, length: 2 } }] },
        { _id: "4", portfolio: [ { category: category, roi: { value: 20, length: 2 } }] },
      ];

      utils.getInvestorPercentiles(investors, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(investors[0].portfolio[0].percentile).toEqual(12);
      expect(investors[1].portfolio[0].percentile).toEqual(37);
      expect(investors[2].portfolio[0].percentile).toEqual(62);
      expect(investors[3].portfolio[0].percentile).toEqual(87);
    });

    it('should give a single investor a percentile of 50', function() {
      category = "Coding";
       var investments = [
        { valuation: 40, amount: 10 },
      ];

      investors = [
        { _id: "1", portfolio: [ { category: category, roi: { value: 10, length: 2 } }] },
      ];

      utils.getInvestorPercentiles(investors, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(investors[0].portfolio[0].percentile).toEqual(50);
    });

    it('should return an error if the first investor does not have the category', function() {
      category = "Coding";
      investors = [
        { _id: "1", portfolio: [ { category: "A", roi: { value: 10, length: 2 } }], username: "Matt Ritter" },
      ];
      utils.getInvestorPercentiles(investors, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith("Could not find portfolio index for user Matt Ritter");
    });

    it('should return an error if any investor does not have the category', function() {
      category = "Coding";
      investors = [
        { _id: "1", username: "Matt Ritter", portfolio: [ { category: category, roi: { value: 10, length: 2 } }], username: "Matt Ritter" },
        { _id: "2", username: "Bob", portfolio: [ { category: "A", roi: { value: 10, length: 2 } }] },
      ];

      utils.getInvestorPercentiles(investors, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith("Could not find portfolio index for user Bob");
    });
  });

  describe("getCategoryIndex: ", function() {
    var categories = [
      { name: "Ballet" },
      { name: "Coding" },
    ]
    var expert = { categories: categories };
    it('should return the index of the category if present', function() {
      var i = utils.getCategoryIndex(expert, "Coding");
      expect(i).toEqual(1);
    });

    it('should return -1 when the category is not present', function() {
      var i = utils.getCategoryIndex(expert, "Foo");
      expect(i).toEqual(-1);
    });

    it('should return -1 if the expert has no categories', function() {
      var emptyExpert = { categories: [] };
      var i = utils.getCategoryIndex(emptyExpert, "Coding");
      expect(i).toEqual(-1);
    });
  });

  describe("getPortfolioIndex: ", function() {
    var portfolio = [
      { category: "Ballet" },
      { category: "Coding" },
    ]
    var investor = { portfolio: portfolio };
    it('should return the index of the category if present', function() {
      var i = utils.getPortfolioIndex(investor, "Coding");
      expect(i).toEqual(1);
    });

    it('should return -1 when the category is not present', function() {
      var i = utils.getPortfolioIndex(investor, "Foo");
      expect(i).toEqual(-1);
    });

    it('should return -1 if the investor has no categories', function() {
      var emptyInvestor = { portfolio: [] };
      var i = utils.getPortfolioIndex(emptyInvestor, "Coding");
      expect(i).toEqual(-1);
    });
  });

  describe("saveAll: ", function() {
    beforeEach(function() {
      jasmine.Clock.useMock();
      saveLogic = jasmine.createSpy();
      mainCB = jasmine.createSpy();
    });

    it('should not call the callback until the docs have been saved', function() {
      var mockSave = function(cb) {
        setTimeout(function() {
          saveLogic();
          cb();
        }, 100);
      };

      docs = [
        {save: mockSave},
        {save: mockSave},
      ];

      utils.saveAll(docs, mainCB);

      expect(saveLogic.callCount).toEqual(0);
      expect(mainCB.callCount).toEqual(0);

      jasmine.Clock.tick(101);

      expect(saveLogic.callCount).toEqual(2);
      expect(mainCB.callCount).toEqual(1);
    });

    it('should accumulate errors and pass them to the callback', function() {
      var i = 0;
      var errors = ["1", "2"];
      var mockSave = function(cb) {
        setTimeout(function() {
          saveLogic();
          cb(errors[i]);
          i++;
        }, 100);
      };

      docs = [
        {save: mockSave},
        {save: mockSave},
      ];

      utils.saveAll(docs, mainCB);
      jasmine.Clock.tick(101);

      expect(mainCB).toHaveBeenCalledWith(["1", "2"]);
    });
  });
});
