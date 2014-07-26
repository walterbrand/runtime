angular.module('context',[]).factory('tridionParameters',function($state){
    var stateParameters = {}
    function get(){
        return stateParameters[$state.current.name] || {};
    }

    function set(stateName, parameters) {
        stateParameters[stateName] = parameters;
    }

    return {
        get : get,
        set : set
    }
});
