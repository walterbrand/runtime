angular.module('modal',[]);
angular.module('modal').directive('uiModalContainer', function($compile, $interpolate){
    return {
        restrict : 'E',
        link : function(scope, elem, attr){
            // the templateWrapper wraps the template inside a div and adds the controller
            var templateWrapper = $interpolate("<div ng-controller='{{controller}}' >{{template}}</div>");

            function inactivate (){
                elem.html('');
                elem.addClass('inactive');
            }

            //4. Here we listen for openModal events broadcasted
            scope.$on('openModal',function(evt, data){
                var modal = data.modal,
                    // creating a new scope that will be used to compile the template
                    newScope = scope.$new();

                // adding the deferred object to the scope of the controller,
                // where the name of the modal is used as namespace
                // this way the controller can directly deal with the deferred object
                newScope[modal.name] = data.deferred;

                // adding data to the scope of the controller that is needed inside the
                // controller and/or template, namespaced as 'data'
                newScope.data = data.data

                // do some cleaning up as soon as the promise is resolved or rejected
                data.deferred.promise.finally(function(){
                    inactivate();
                });

                // the templateWapper is interpolated with the modal object (that contains template and controller
                // the result of that is compiled with the newly created scope
                var modalElement = $compile(templateWrapper(modal))(newScope);

                // adding the element inside the modal container
                elem.append(modalElement);

                // by removing the inactive class, the modal becomes visible
                elem.removeClass('inactive');

            });
        },
        controller : function($scope, modal, $q){
            // 2  the listener that returns the promise and starts the modal
            function listener(modal, data){
                var deferred = $q.defer();
                // 3 broadcasting to the directive container to actually change the htmel on the page
                $scope.$broadcast('openModal', {modal:modal, data:data, deferred:deferred})
                return deferred.promise;
            }
            // 1a. register callback van controller
            modal.registerListener(listener)
        }
    }
});

angular.module('modal').provider('modal', function(){
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
        // 1b. register callback van controller
        function registerListener(_listener_){
            listener = _listener_;
        }

        function open(modalName, data){
            var modal = modalRegister[modalName];
            modal.name = modalName
            return listener(modal, data);
        }
        return {
            registerListener : registerListener,
            open : open
        }
    }];

    return {
        register : register,
        $get : $get
    }
});

angular.module('modal').controller('notificationController', function($scope){

    $scope.ok = function(){
        $scope.notification.resolve('Het lukte!')
    }
});

