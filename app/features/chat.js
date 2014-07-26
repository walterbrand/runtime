angular.module('chat',['context']).run(function($templateCache){
    $templateCache.put('chat/main.html', '<i>Chat: {{data.settings}}</i>')
});

angular.module('chat').controller('chatMainController', function($scope, tridionParameters){
    function getSettings() {
        var tridionParams = tridionParameters.get();
        return tridionParams.chat || 'no values'
    }
    $scope.data = {
        settings : getSettings()
    }
});