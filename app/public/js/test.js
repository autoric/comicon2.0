var myobj = function() {
    var intToStr = {}
    var strToInt = {};

    function put(str, i) {
        if(getByStr(str) === undefined) return new Error('strings must be unique');
        strToInt[str] =i;
        return intToStr[i] = str;
    }

    function getByInt(i) {
        return intToStr[i];
    }

    function getByStr(str){
        return strToInt[str];
    }

    return {
        put: put,
        getByInt: getByInt,
        getByStr: getByStr
    }
}