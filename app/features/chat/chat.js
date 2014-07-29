angular.module('chat',['context']);

angular.module('chat').config(function() {
	console.log('chat:payment config');
});

angular.module('chat').run(function($templateCache){
	console.log('chat:payment run');
    $templateCache.put('chat/main.html', '<i>Chat: {{data.settings}}</i>')
//    $cssCache.put('chat/main.css', '.asdasd{}')
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