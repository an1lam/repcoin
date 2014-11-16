
var calculatePercentiles = function (numberArray) {
        
    var copy, dictionary, formula, i, length, result;
    
    formula = function (rank, sampleSize) {
        return (rank - 0.5) / sampleSize;
    };
    
    length = numberArray.length;
    copy = numberArray.slice(0);
    copy.sort();
    
    dictionary = {};
    for (i = 0; i < length; i += 1) {
        dictionary[copy[i]] = formula(i + 1, length);
    }
    
    result = [];
    for (i = 0; i < length; i += 1) {
        result.push({
            id : i,
            value : numberArray[i],
            percentile : dictionary[numberArray[i]]
        });
        
    }
    return result;
};

var numberArray = [1, 2, 3, 4];
console.log(calculatePercentiles(numberArray))