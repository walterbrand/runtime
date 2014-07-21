angular.module('transactions',[]);

angular.module('transactions').config(function(modalProvider){

    modalProvider.register({
        name: 'mynotify',
        template : '<div>{{data.text}}<button ng-click="myklik()">Ok</button></div>',
        controller : 'mynotifyController'
    })

});

angular.module('transactions').controller('transactionsController',function($scope,modal){
    $scope.firstName = 'Walter'
    $scope.klik = function(){
        modal.open('mynotify', {text:'Dit is een notificatie'}).then(function(data){
            console.log('controller: ontvangen data: ',data);
        });
    }

    $scope.onViewChange = function(event){
        //event.preventDefault();
    }
});

angular.module('transactions').factory('smb',function(){
    var register = {}
    function sub(eventName, callback){
        register[eventName] = callback;
    }
    function pub(eventName, data){
        register[eventName].call(null,data);
    }
    return {
        pub : pub,
        sub : sub
    }
});

angular.module('transactions').controller('mynotifyController', function($scope){
    $scope.myklik = function(){
        $scope.mynotify.resolve('Success');
    }
})
