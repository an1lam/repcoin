process.env.NODE_ENV = 'test';
var utils = require('../api/routes/utils.js');

var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');

describe("Utils: ", function() {
  describe("updateInvestorPortfolio", function() {
    var portfolio, category, toUser, amount, toUserCategoryTotal;

    it('should return null if the user is not an investor for this category', function() {
      portfolio = [{ category: "Ballet" }]; 
      category = "Coding";
      var result = utils.updateInvestorPortfolio(portfolio, category, toUser, amount, toUserCategoryTotal);
      expect(result).toEqual(null);
    });

    it('should add category to the portfolio is investor has never invested int his expert before', function() {
      portfolio = [{ repsAvailable: 100, category: "Coding", investments: [] }];
      amount = 10;
      toUserCategoryTotal = 20;
      toUser = { id: "123", name: "Matt" };
      
      var p = utils.updateInvestorPortfolio(portfolio, category, toUser, amount, toUserCategoryTotal);
      var investment = { user: "Matt", userId: "123", amount: 10, valuation: 10, percentage: 50 }; 
      expect(p[0].investments).toEqual([investment]); 
      expect(portfolio[0].repsAvailable).toEqual(90);
    });

    it('should update the existing investment if it is present', function() {
      var investment = { user: "Matt", userId: "123", amount: 10, valuation: 10, percentage: 50 }; 
      portfolio = [{ repsAvailable: 100, category: "Coding", investments: [investment] }];
      amount = 5;
      toUserCategoryTotal = 20;
      toUser = { id: "123", name: "Matt" };

      var p = utils.updateInvestorPortfolio(portfolio, category, toUser, amount, toUserCategoryTotal);
      expect(p[0].investments.length).toEqual(1);
      expect(p[0].investments[0].amount).toEqual(15);
      expect(p[0].investments[0].percentage).toEqual(75);
      expect(p[0].investments[0].valuation).toEqual(15);
      expect(p[0].repsAvailable).toEqual(95);
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
