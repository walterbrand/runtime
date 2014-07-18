angular.module('transactions',[]);

angular.module('transactions').controller('transactionsController',function($scope,modalService){
    $scope.name = 'Walter'
    $scope.$on('$locationChangeStart',function(evt){
        //evt.preventDefault();
    })
    $scope.klik = function(){
        modalService.open('notification').then(function(data){
            console.log(data);
        });
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

angular.module('transactions').controller('notificationController', function($scope){

    $scope.ok = function(){
        $scope.notification.resolve('Het lukte!')
    }
});