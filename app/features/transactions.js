angular.module('transactions',[]);

angular.module('transactions').config(function(modalProvider){

    modalProvider.register({
        name: 'mynotify',
        template : '<div>{{data.text}}<button ng-click="myklik()">Ok</button></div>',
        controller : 'mynotifyController'
    })

});

angular.module('transactions').controller('transactionsMainController',function($scope,$location){
    $scope.firstName = 'Walter'

    var listType = $location.search().transactionlist || 'Default list'
    $scope.data = {
        listType : listType
    }

    $scope.onViewChange = function(event){
        //event.preventDefault();
    }
});
