process.env.NODE_ENV = 'test';
var utils = require('../api/routes/utils.js');

var Category = require('../api/models/Category.js');
var Transaction = require('../api/models/Transaction.js');
var User = require('../api/models/User.js');

describe("Utils: ", function() {
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

  describe('saveAll: ', function() {
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
