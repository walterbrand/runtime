angular.module('transactions',[]);

angular.module('transactions').run(function($templateCache){
        $templateCache.put('transactions/main.html', '<div>Transactionlist: {{data.listType}}</div>');
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
