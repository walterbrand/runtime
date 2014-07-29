angular.module('modal',[]);
angular.module('modal').directive('uiModalContainer', function($compile, $interpolate){
    return {
        restrict : 'E',
        link : function(scope, elem, attr){
            // the templateWrapper wraps the template inside a div and adds the controller
            var templateWrapper = $interpolate("<div class='modalPart' ng-controller='{{controller}}' ng-show='showChild({{index}})'>{{template}}</div>");

            var currentIndex = -1;

            function inactivate (){
                if (currentIndex === 0) {
                    elem.html('');
                    elem.addClass('inactive');
                } else {
                    angular.element(elem.children()[currentIndex]).remove()
                }
                currentIndex--;
            }

            scope.showChild = function(index) {
                return index === currentIndex;
            }

            scope.$on('closeModal', function(){
                inactivate();
            })

            //4. Here we listen for openModal events broadcasted
            scope.$on('openModal',function(evt, data){
                var modal = data.modal,
                    // creating a new scope that will be used to compile the template
                    newScope = scope.$new();

                modal.index = ++currentIndex;


                // adding the deferred object to the scope of the controller,
                // where the name of the modal is used as namespace
                // this way the controller can directly deal with the deferred object
                newScope[modal.name] = data.deferred;

                // adding data to the scope of the controller that is needed inside the
                // controller and/or template, namespaced as 'data'
                newScope.data = data.data

                // do some cleaning up as soon as the promise is resolved or rejected


/*
                data.deferred.promise.finally(function(){
                    inactivate();
                });
*/

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
            function listener(task, data){
                //var deferred = $q.defer();
                // 3 broadcasting to the directive container to actually change the htmel on the page

                if (task === "open") {
                    console.log('open')
                    $scope.$broadcast('openModal', {modal:data.modal, data:data.data, deferred:data.deferred, index:data.index})
                } else {
                    console.log('cliose')
                    $scope.$broadcast('closeModal');
                }
                //return deferred.promise;
            }
            // 1a. register callback van controller
            modal.registerListener(listener)
        }
    }
});

angular.module('modal').provider('modal', function(){
    var notificationModal = {
            "name" : "notification",
            "template" : "<span>{{data.text}}<br /><button ng-click='ok()'>Ok!</button><button ng-click='dieper()'>Dieper</button></span>",
            "controller" : "notificationController"
        },
        modalRegister = {};

    function register(modal){
        modalRegister[modal.name] = modal
    }

    register(notificationModal);

    var $get = ['$q', function($q){
        var listener, stack = [];
        // 1b. register callback van controller
        function registerListener(_listener_){
            listener = _listener_;
        }

        function open(modalName, data){
            var modal = modalRegister[modalName];
            var deferred = $q.defer();
            modal.name = modalName
            listener("open", {modal:modal, data:data, deferred: deferred, index: 0});

            deferred.promise.finally(function(){listener("close")});

            return deferred.promise;
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

angular.module('modal').controller('notificationController', function($scope, modal){

    var dieperdata = 'Geen dieper data';

    $scope.ok = function(){
        $scope.notification.resolve('Het lukte! : ' + dieperdata)
    }

    $scope.dieper = function(){
        modal.open('payments_mynotify',{mijntekst:'dieper niveau'}).then(function(data){
            dieperdata = data;
        }, function(data){
            dieperdata = data;
        })
    }
});

