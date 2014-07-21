angular.module('app').directive('uiModal', function($compile, $interpolate){
    return {
        restrict : 'E',
        link : function(scope, elem, attr){

            var template = $interpolate("<div ng-controller='{{controller}}' >{{template}}</div>");
            scope.$on('openModal',function(evt, data){
                var modal = data.modal,
                    newScope = scope.$new();

                newScope[modal.name] = data.deferred;
                newScope.data = data.data
                data.deferred.promise.then(function(){
                    console.log('De modal weer inactief maken')
                    elem.html('')
                    elem.addClass('inactive')
                });

                var modalElement = $compile(template(modal))(newScope)
                elem.append(modalElement)
                elem.removeClass('inactive')

            });
        },
        controller : function($scope, modal, $q){
            function listener(modal, data){
                var deferred = $q.defer();
                $scope.$broadcast('openModal', {modal:modal, data:data, deferred:deferred})
                return deferred.promise;
            }
            modal.register(listener)
        }
    }
});

angular.module('app').provider('modal', function(){
    var notificationModal = {
            "name" : "notification",
            "template" : "<span>{{data.text}}<br /><button ng-click='ok()'>Ok!</button></span>",
            "controller" : "notificationController"
        },
        modalRegister = {};

    function register(modal){
        modalRegister[modal.name] = modal
    }

    register(notificationModal);

    var $get = ['$state', '$timeout',  function($state, $timeout){
        var listener;
        function register(_listener_){
            listener = _listener_;
        }

        function open(modalName, data){
            var modal = modalRegister[modalName];
            modal.name = modalName
            return listener(modal, data);
        }
        return {
            register : register,
            open : open
        }
    }];

    return {
        register : register,
        $get : $get
    }
});

angular.module('app').controller('notificationController', function($scope){

    $scope.ok = function(){
        $scope.notification.resolve('Het lukte!')
    }
});

