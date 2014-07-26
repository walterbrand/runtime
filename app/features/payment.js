angular.module('payment',['modal']);

angular.module('payment').run(function($templateCache){
    $templateCache.put('payments/main.html','<div>Payments: {{data.payment}} times</div>')
})
angular.module('payment').controller('paymentsMainController', ['$scope', function($scope){
    $scope.data ={
        payment: 10
    }
}]);


