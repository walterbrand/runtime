angular.module('modal',[]);
angular.module('modal').directive('uiModalContainer', function($compile, $interpolate,$timeout){
    return {
        restrict : 'E',
        scope: {id:'@'},
        link : function(scope, elem, attr){
            // the templateWrapper wraps the template inside a div and adds the controller
            var templateWrapper = $interpolate("<div class='modalPart' ng-controller='{{controller}}' ng-show='showChild({{index}})'>{{template}}</div>");

            var counter = -1;
            var current = -1;
            var currentIndex = -1;
            var stack = [];

            function inactivate (){
                var next = stack.shift();
                if (stack.length === 0) {
                    elem.html('');
                    elem.addClass('inactive');
                } else {
                    if (stack[0].deferred) {
                        $timeout(function(){stack[0].deferred.resolve();console.log('Ik sluit automatisch')},1000)
                    }
                    $timeout(function(){
                        // wrapping the destroy in a timeout to force it to be handled in the next digest cycle
                        // otherwise it interferes with actually removing the element from the dom.
                        next.scope.$destroy();
                    })
                    angular.element(elem.children()[currentIndex]).remove()
                }
            }

            scope.showChild = function(index) {
                if (stack.length === 0) return false;
                return index === stack[0].id;
                //return index === currentIndex;
            }

            scope.$on('closeModal', function(){
                inactivate();
            })

            //4. Here we listen for openModal events broadcasted
            scope.$on('openModal',function(evt, data){
                var modal = data.modal,
                    // creating a new scope that will be used to compile the template
                    newScope = scope.$new();

                //modal.index = ++currentIndex;
                modal.index = ++counter;

                var domModal = {id:modal.index};
                domModal.scope = newScope;
                if (scope.id === 'notification') {
                    if (data.autoclose) {
                        domModal.deferred = data.deferred;
                    }
                    stack.push(domModal);
                } else {
                    stack.unshift(domModal);
                }


                // adding the deferred object to the scope of the controller,
                // where the name of the modal is used as namespace
                // this way the controller can directly deal with the deferred object
                newScope[modal.name] = data.deferred;

                // adding data to the scope of the controller that is needed inside the
                // controller and/or template, namespaced as 'data'
                newScope.data = data.data

                // the templateWapper is interpolated with the modal object (that contains template and controller
                // the result of that is compiled with the newly created scope
                var modalElement = $compile(templateWrapper(modal))(newScope);

                // adding the element inside the modal container

                elem.append(modalElement);

                // by removing the inactive class, the modal becomes visible
                elem.removeClass('inactive');
                scope.$on('$destroy', function(){
                    console.log('ik mag niet kapot')
                })

            });
        },
        controller : function($scope, modal){
            // 2  the listener that returns the promise and starts the modal
            function listener(task, data){
                // 3 broadcasting to the directive container to actually change the htmel on the page

                if (task === "open") {
                    $scope.$broadcast('openModal', {modal:data.modal, data:data.data, deferred:data.deferred, autoclose:data.autoclose})
                } else {
                    $scope.$broadcast('closeModal');
                }
                //return deferred.promise;
            }
            // 1a. register callback van controller
            modal.registerListener(listener, $scope.id)
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
        var listeners= {}, stack = [];
        // 1b. register callback van controller
        function registerListener(_listener_, id){
            listeners[id] = _listener_;
        }

        function open(modalName, data){
            var modal = modalRegister[modalName];
            var deferred = $q.defer();
            modal.name = modalName
            listeners.modal("open", {modal:modal, data:data, deferred: deferred, index: 0});

            deferred.promise.finally(function(){listeners.modal("close")});

            return deferred.promise;
        }
        function notification(modalName, data, autoclose) {
            var modal = modalRegister[modalName];
            var deferred = $q.defer();
            modal.name = modalName
            listeners.notification("open", {modal:modal, data:data, deferred: deferred, autoclose: autoclose});

            deferred.promise.finally(function(){listeners.notification("close")});

            return deferred.promise;

        }
        return {
            registerListener : registerListener,
            open : open,
            notification : notification
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

