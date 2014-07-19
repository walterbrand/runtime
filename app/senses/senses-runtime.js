angular.module('app',['ui.router','oc.lazyLoad']);

angular.module('app').directive('nav', function($location){
    return {
        restrict : 'E',
        template : '<ul><li ng-repeat="item in items" ng-click="navigate(item.url)">{{item.label}}</li></ul>',
        link: function(scope){
            scope.items = [
                {label: 'home', url : '/'},
                {label : 'multiview', url : '/tridion/multiview'}
            ]
            scope.navigate = function(url){
                $location.path(url)
            }
        }
    }
});

angular.module('app').provider('lazyState', function(){
    var $stateProvider = null;
    var stateRegister = {}

    function state(state) {
        if (stateRegister[state.url]) {
            return;
        }
        stateRegister[state.url] = state;
        $stateProvider.state(state);
    }


    return {
        set$stateProvider : function(_$stateProvider_){$stateProvider = _$stateProvider_},
        state : state,
        $get : ['$http', '$q', function($http, $q){
            function loadState(url) {
                var deferred = $q.defer();
                if (angular.isDefined(stateRegister[url])) {
                    deferred.resolve();
                } else {
                    $http({url: url + '/state.json', method: 'GET'})
                        .success(function(data){
                            state(data)
                            deferred.resolve(data)
                        })
                        .error(function(){deferred.reject()})
                }

                return deferred.promise;
            }

            return {
                loadState : loadState
            }
        }]
    }
});

angular.module('app').config(function($stateProvider, $urlRouterProvider,lazyStateProvider){
    lazyStateProvider.set$stateProvider($stateProvider);

    //$urlRouterProvider.otherwise('/');

    lazyStateProvider.state({
        name: 'home',
        url: '/',
        template: '<b>Home template :{{data.stateName}} <g bc="ab" ng-controller="econ" name="naam"></g>  </b>'
    });


});

angular.module('app').run(function($rootScope, $state, lazyState, $ocLazyLoad, $q){
    var viewScopes = [];

    $rootScope.$on('$locationChangeStart', function(event){
        for (var i=0; i < viewScopes.length; i++) {
            if (viewScopes[i].onViewChange) {
                viewScopes[i].onViewChange(event);
            }
        }
    });

    $rootScope.$on('$locationChangeSuccess', function(event, toState){
        viewScopes = [];
        var fileLocation = toState.split('#')[1];
        lazyState.loadState(fileLocation).then(function(state){
            if (state) {
                if (state.features) {
                    var promises = []
                    for (var i=0; i < state.features.length; i++) {
                        promises.push($ocLazyLoad.load(state.features[i]))
                    }
                    $q.all(promises).then(function(){
                        $state.go(state.name)
                    })
                } else {
                    $state.go(state.name)
                }
            }
        });
    });
    $rootScope.$on('$viewContentLoaded', function(view){
        if (view.targetScope) {
            viewScopes.push(view.targetScope)
        }
    });
});

angular.module('app').directive('g', function(){
    return {
        restrict: 'E',
        template : '<b>wer</b>',

        link: {pre: function preLink(scope, elem, attr){
                var name = attr.name
                if (name) {
                    elem.scope()[name] = {c:8}
                }
            }

        }
    }
});

angular.module('app').controller('econ', function($scope){
    $scope.u = 9
    console.log($scope)
});