angular.module('transactions',[]);

angular.module('transactions').controller('transactionsController',function($scope){
    $scope.name = 'Walter'
    $scope.$on('$locationChangeStart',function(evt){
        //evt.preventDefault();
    })
});