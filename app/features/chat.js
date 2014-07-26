angular.module('chat',['context']);

angular.module('chat').controller('chatMainController', function($scope, tridionParameters){
    function getSettings() {
        var tridionParams = tridionParameters.get();
        return tridionParams.chat || 'no values'
    }
    $scope.data = {
        settings : getSettings()
    }
});