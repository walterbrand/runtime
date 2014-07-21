angular.module('transactions',[]);

angular.module('transactions').controller('transactionsController',function($scope,modalService){
    $scope.firstName = 'Walter'
    $scope.klik = function(){
        modalService.open('notification', {text:'Dit is een notificatie'}).then(function(data){
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
