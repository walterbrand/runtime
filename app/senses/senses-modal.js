angular.module('app').directive('uiModal', function($compile, $interpolate){
    return {
        restrict : 'E',
        link : function(scope, elem, attr){

            var template = $interpolate("<div ng-controller='{{controller}}' >{{template}}</div>");
            scope.$on('openModal',function(evt, data){
                var modal = data.modal
                var newScope = scope.$new()
                newScope[modal.name] = data.deferred;
                newScope.data = data.data
console.log(newScope)
                data.deferred.promise.then(function(){
                    console.log('Ook hier')
                    elem.html('')
                    elem.addClass('inactive')
                })
                console.log(template(modal))
                var ccomp = $compile(template(modal))(newScope)
                elem.append(ccomp)
                elem.removeClass('inactive')

            });
        },
        controller : function($scope, modalService, $q){
            function listener(modal, data){
                var deferred = $q.defer();
                $scope.$broadcast('openModal', {modal:modal, data:data, deferred:deferred})
                return deferred.promise;
            }
            modalService.registerListener(listener)
        }
    }
});

angular.module('app').provider('modalService', function(){
    var notificationModal = {
            "name" : "notification",
            "template" : "<span>{{data.text}}<br /><button ng-click='ok()'>Ok!</button></span>",
            "controller" : "notificationController"
        },
        modalRegister = {};

    function registerModal(modal){
        modalRegister[modal.name] = modal
    }

    registerModal(notificationModal);

    var $get = ['$state', '$timeout',  function($state, $timeout){
        var listener;
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
        registerModal : registerModal,
        $get : $get
    }
});

