/*
 Hi Ramin,

 ik heb het voorbeeld van het triggeren van de modal van comments voorzien, zodat het duidelijker wordt waar een en ander in elkaar grijpt.

 Allereerst is een feature genaamd 'payments' die wordt geladen op de home. Deze kan twee modals triggeren. Een die is voorgedefinieerd en een die in payments is gedefinieerd.

 Het managen van de modals gebeurt in senses-modal.js
 Hierin zitten nu drie angular artifacts:
 - de uiModalContainer directive
 - de modal provider
 - de controller die hoort bij de voorgedefinieerde modal (die in de provider is voorgedefinieerd)

 Modals worden getriggerd door hun naam. Op regel 13 van paymentController (wat de controller is van de feature die op home staat) zie je hoe de ingebouwde controller wordt geopend op basis van zijn naam. Als tweede argument geeft je data mee die nodig is om de modal van de juiste informatie te voorzien.

 De buitenwereld communiceert via de provider(service) door middel van de functie open(). Deze retourneert een promise waarmee verder kan worden gewerkt. De modal service gaat vervolgens de controller van de uiModalContainer directive aanspreken (2) via de listener callback die vooraf al is gedefinieerd (zie 1a. en 1b.);

 Deze listener (2) broadcast op zijn beurt (3) weer naar de directive die hier naar luistert (4). De uiteindelijke promise (die wordt doorgegeven door open) wordt aangemaakt in de controller. Het deferred object zelf wordt via de broadcast doorgegeven aan de modalContainer. Deze creëert een modal in beeld.

 In (5) is een custom modal gedefinieerd, die bij (6) wordt geactiveerd. De werking is verder precies hetzelfde.
 */


angular.module('payments',['modal']);

angular.module('payments').config(function(modalProvider){

    //5. register a custom modal
    modalProvider.register({
        name : "payments_mynotify",
        template : "<div>{{data.mijntekst}} <br /><span ng-controller='depcontr'></span><button ng-click='myok()'>Ok</button><button ng-click='myNotok()'>Cancel</button></div>",
        controller : "mynotiController"
    })

    modalProvider.register({
        name: 'newone',
        template : '<div>Melding: {{data.tekst}}</div>',
        controller: 'mynotiController'
    })
})

angular.module('payments').controller('paymentController', ['$scope', 'modal', function($scope, modal){
    $scope.openNotification = function(){

        modal.open('notification', {text:'Ik ben een notificatie'}).then(function(data){
            console.log('de notificatie is weer gesloten en ik ontving: ' + data)
        });

        modal.notification('notification', {text:'Ik ben een echte notificatie'}).then(function(){

        })
        modal.notification('newone', {tekst: 'Ik sluit vanzelf na 5 seconden'}, true)
    };

    $scope.openCustom = function(){
        //6. opening the custom modal
        modal.open('payments_mynotify', {mijntekst:'hier staat mijn tekst'}).then(function(data){
            // here we can check out the data that is returned by the modal
            console.log(data);
        },function(data){
            // here we can check out the data that is returned by the modal
            console.log(data);
        })
    }
}]);

angular.module('payments').controller('mynotiController', ['$scope', function($scope){
    // the $scope is enhanced with resolve() and reject() that will fulfill the promise returned by the modal service

    $scope.myok = function(){
        console.log('HIER')
        $scope.payments_mynotify.resolve('Het is ok');
        //$scope.$broadcast('$destroy')
        //$scope.$destroy();
    }

    $scope.myNotok = function(){
        $scope.payments_mynotify.reject('Het is NIET ok');
    }
}]);

angular.module('payments').controller('depcontr', function($scope){
    $scope.$on('$destroy', function(){
        console.log('ik MOET weg');
    })
})

