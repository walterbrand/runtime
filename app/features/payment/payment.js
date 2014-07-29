angular.module('payment',[]);

angular.module('payment').config(function() {
	console.log('config:payment');
});

angular.module('payment').run(function($templateCache){
    $templateCache.put('payment/main.html','<div>Payments: {{data.payment}} times</div>')
})
angular.module('payment').controller('paymentMainController', ['$scope', function($scope){
    $scope.data ={
        payment: 10
    }
}]);


