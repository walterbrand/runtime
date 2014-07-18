angular.module('app').directive('uiModal', function($compile, $interpolate){
    return {
        restrict : 'E',
        link : function(scope, elem, attr){
/*
            var compiled = $compile(modal.template);
            elem.html(compiled($scope.$new()))
*/
            var template = $interpolate("<div ng-controller='{{controller}}' >{{template}}</div>");
            scope.$on('openModal',function(evt, data){
                var modal = data.modal
                var newScope = scope.$new()
                newScope[modal.name] = data.deferred;
                data.deferred.promise.then(function(){
                    console.log('Ook hier')
                })
                var ccomp = $compile(template(modal))(newScope)
                elem.append(ccomp)

                var tpm = $interpolate("<div ab='{{dit}}'>{{dat}}</div>");
                console.log(tpm({dit:'DITTE', dat:'datte'}))

            });
        },
        controller : function($scope, modalService, $q){
            function listener(modal){
                var deferred = $q.defer();
                $scope.$broadcast('openModal', {modal:modal, deferred:deferred})
                return deferred.promise;
            }
            modalService.registerListener(listener)
        }
    }
});

angular.module('app').factory('modalService', ['$state', '$timeout',  function($state, $timeout){
    var listener;
    function registerListener(_listener_){
        listener = _listener_;
    }

    function open(modalName){
        var modal = $state.current.modals[modalName];
        modal.name = modalName
        return listener(modal);
    }
    return {
        registerListener : registerListener,
        open : open
    }
}]);

