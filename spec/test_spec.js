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

    it('should add category to the portfolio if investor has never invested in this expert before', function() {
      existingPortfolio = [{ repsAvailable: 100, category: "Coding", investments: [] }];
      amount = 10;
      toUserCategoryTotal = 20;
      toUser = { id: "123", name: "Matt" };
      
      var p = utils.updateInvestorPortfolio(existingPortfolio, category, toUser, amount, toUserCategoryTotal);
      var newInvestment = { user: "Matt", userId: "123", amount: 10, valuation: 10, percentage: 50 }; 
      expect(p[0].investments).toEqual([newInvestment]); 
      expect(p[0].repsAvailable).toEqual(90);
    });

    it('should update the existing investment if it is present', function() {
      var existingInvestment = { user: "Matt", userId: "123", amount: 10, valuation: 10, percentage: 50 }; 
      existingPortfolio = [{ repsAvailable: 100, category: "Coding", investments: [existingInvestment] }];
      amount = 5;
      toUserCategoryTotal = 20;
      toUser = { id: "123", name: "Matt" };

      var p = utils.updateInvestorPortfolio(existingPortfolio, category, toUser, amount, toUserCategoryTotal);
      expect(p[0].investments.length).toEqual(1);
      expect(p[0].investments[0].amount).toEqual(15);
      expect(p[0].investments[0].percentage).toEqual(75);
      expect(p[0].investments[0].valuation).toEqual(15);
      expect(p[0].repsAvailable).toEqual(95);
    }); 
  });

  describe("addInvestorToExpertCategory", function() {
    var investorName = "Bob";
    var investorId = "123";
    var i, categories, expert, investors;

    it('should return the expert unchanged if the investor was present', function() {
      investors = [{ name: "Bob", id: "123" }];
      categories = [{ name: "Coding", investors: investors }];
      expert = { categories: categories };
      i = 0;
      var e = utils.addInvestorToExpertCategory(expert, investorId, investorName, i);
      expect(e.categories[i].investors).toEqual(investors);
    });

    it('should add the investor to the category if the investor was not present', function() {
      categories = [{ name: "Coding", investors: [] }];
      expert = { categories: categories };
      i = 0;
      var e = utils.addInvestorToExpertCategory(expert, investorId, investorName, i);
      expect(e.categories[i].investors).toEqual([{ name: "Bob", id: "123" }]);
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
