process.env.NODE_ENV = 'test';
var utils = require('../api/routes/utils.js');

var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');

describe("Utils: ", function() {
  describe('updateROI: ', function() {
    it('should correctly update roi when it starts as 0', function() {
      var oldROI = { length: 0, value: 0 };
      var roiFromRevoke = 5;
      var roi = utils.updateROI(oldROI, roiFromRevoke);
      expect(roi).toEqual({ length: 1, value: 5 });
    });

    it('should correctly update roi when it has an arbitrary value', function() {
      var oldROI = { length: 4, value: 2.5 };
      var roiFromRevoke = 1.2
      var roi = utils.updateROI(oldROI, roiFromRevoke);
      expect(roi).toEqual({ length: 5, value: 2.24 });
    });

  });

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

  describe('getExpertPercentiles: ', function() {
    var experts, category, cb;
    beforeEach(function() {
      cb = jasmine.createSpy();
    });

    it('should give all experts a percentile of 50 if reps are the same', function() {
      category = "Coding";
      experts = [
        { _id: "1", categories: [ { name: category, reps: 10 }] },
        { _id: "2", categories: [ { name: category, reps: 10 }] },
      ];
      utils.getExpertPercentiles(experts, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(experts[0].categories[0].directScore).toEqual(50);
      expect(experts[1].categories[0].directScore).toEqual(50);
    });

    it('should give all experts correct percentiles if reps are different', function() {
      category = "Coding";
      experts = [
        { _id: "1", categories: [ { name: category, reps: 10 }] },
        { _id: "2", categories: [ { name: category, reps: 12 }] },
        { _id: "3", categories: [ { name: category, reps: 14 }] },
        { _id: "4", categories: [ { name: category, reps: 16 }] },
      ];
      utils.getExpertPercentiles(experts, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(experts[0].categories[0].directScore).toEqual(12);
      expect(experts[1].categories[0].directScore).toEqual(37);
      expect(experts[2].categories[0].directScore).toEqual(62);
      expect(experts[3].categories[0].directScore).toEqual(87);
    });

    it('should give a single expert a percentile of 50', function() {
      category = "Coding";
      experts = [
        { _id: "1", categories: [ { name: category, reps: 10 }] },
      ];
      utils.getExpertPercentiles(experts, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith(null);
      expect(experts[0].categories[0].directScore).toEqual(50);
    });

    it('should return an error if the first expert does not have the category', function() {
      category = "Coding";
      experts = [
        { _id: "1", username: "Matt Ritter", categories: [] },
      ];
      utils.getExpertPercentiles(experts, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith("Could not find category index for user Matt Ritter");
    });

    it('should return an error if any expert does not have the category', function() {
      category = "Coding";
      experts = [
        { _id: "1", username: "Matt Ritter", categories: [{ name: category, reps: 10 }] },
        { _id: "2", username: "Bob", categories: [] },
      ];
      utils.getExpertPercentiles(experts, category, cb); 
      expect(cb.callCount).toEqual(1);
      expect(cb).toHaveBeenCalledWith("Could not find category index for user Bob");
    });
  });

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
      existingPortfolio = [{ repsAvailable: 100, category: "Coding", roi: { value: 0, length: 0 }, investments: [existingInvestment] }];
      amount = 5;
      toUserCategoryTotal = 20;
      toUser = { id: "123", name: "Matt" };
      var expectedROI =  { value: 0, length: 0 };

      var p = utils.updateInvestorPortfolio(existingPortfolio, category, toUser, amount, toUserCategoryTotal);
      expect(p[0].investments.length).toEqual(1);
      expect(p[0].investments[0].amount).toEqual(15);
      expect(p[0].investments[0].percentage).toEqual(75);
      expect(p[0].investments[0].valuation).toEqual(15);
      expect(p[0].roi).toEqual(expectedROI);
      expect(p[0].repsAvailable).toEqual(95);
    }); 

    it('should update the existing investment and roi if revoke', function() {
      var existingInvestment = { user: "Matt", userId: "123", amount: 10, valuation: 20, percentage: 50 }; 
      existingPortfolio = [{ repsAvailable: 100, category: "Coding", roi: { value: 0, length: 0 }, investments: [existingInvestment] }];
      amount = -5;
      toUserCategoryTotal = 20;
      toUser = { id: "123", name: "Matt" };
      var expectedROI =  { length: 1, value: 5 };

      var p = utils.updateInvestorPortfolio(existingPortfolio, category, toUser, amount, toUserCategoryTotal);
      expect(p[0].investments.length).toEqual(1);
      expect(p[0].investments[0].amount).toEqual(5);
      expect(p[0].investments[0].percentage).toEqual(25);
      expect(p[0].investments[0].valuation).toEqual(5);
      expect(p[0].roi).toEqual(expectedROI);
      expect(p[0].repsAvailable).toEqual(105);
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
