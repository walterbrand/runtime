angular.module('app',['ui.router','oc.lazyLoad', 'context']);

angular.module('app').directive('nav', function($location){
    return {
        restrict : 'E',
        template : '<ul><li ng-repeat="item in items" ng-click="navigate(item.url)">{{item.label}}</li></ul>',
        link: function(scope){
            scope.items = [
                {label: 'home', url : '/'},
                {label : 'transactions', url : '/tridion/transactions'},
                {label: 'payments', url: '/tridion/payments'}
            ]
            scope.navigate = function(url){
                $location.path(url)
                $location.search({});
            }
        }
    }
});

angular.module('app').provider('lazyState', function(){
    var $stateProvider = null;
    var stateRegister = {}

    function addState(state) {
        if (stateRegister[state.url]) {
            return;
        }
        stateRegister[state.url] = state;
        $stateProvider.state(state);
    }

    function getState(url) {
        return stateRegister[url];
    }

    function composeState(rawState, url) {
        var state = {};
        state.name = rawState.name;

        // linking the url with the state
        state.url = url;

        // setting the main template
        state.views = {
            "" : {template: rawState.composition}
        };

        // creating nested views based on name conventions
        for (var i=0; i < rawState.features.length; i++) {
            var feature = rawState.features[i];
            var view = {
                controller : feature.name + 'MainController',
                templateUrl : feature.name + '/main.html'
            }
            state.views[feature.name + '@' + state.name] = view
        }

        return state;
    }

    return {
        set$stateProvider : function(_$stateProvider_){$stateProvider = _$stateProvider_},
        addState : addState,
        $get : ['$http', '$q', '$location','$state', function($http, $q, $location, $state){

            // getting the exact location of where the app lives
            var domain = $location.port() !== "" ? $location.host() + ':' + $location.port() : $location.host();
            var absUrl = $location.absUrl().substr($location.absUrl().indexOf(domain)+ domain.length)
            absUrl = absUrl.substr(0, absUrl.indexOf('index.html'));

            function loadState(url) {
                var deferred = $q.defer();
                if (angular.isDefined(stateRegister[url])) {
                    deferred.resolve();
                } else {
                    // show some sort of loading page just before fetching the actual page
                    $state.go('loading');

                    $http({url: absUrl +  url + '/state.json', method: 'GET'})
                        .success(function(data){
                            var uiRouterState = composeState(data, url);
                            addState(uiRouterState);
                            deferred.resolve(data)
                        })
                        .error(function(){deferred.reject()})
                }

                return deferred.promise;
            }

            return {
                loadState : loadState,
                addState : addState,
                getState : getState
            }
        }]
    }
});

angular.module('app').config(function($stateProvider, $urlRouterProvider,lazyStateProvider){
    lazyStateProvider.set$stateProvider($stateProvider);

    lazyStateProvider.addState({
        name: 'home',
        url: '/',
        template: '<div>click <a href="#/tridion/transactions?transactionlist=latest">this link</a> to see the last transaction</div>'

    });

    lazyStateProvider.addState({
        name:'loading',
        urls : '/loading',
        template:'<div>Loading the page....</div>'
    })

});

angular.module('app').run(function($rootScope, $state, lazyState, $ocLazyLoad, $q, $location, tridionParameters){
    $rootScope.$on('$locationChangeSuccess', function(event, toState){
        var fileLocation = toState.split('#')[1],
            state = lazyState.getState(fileLocation);

        // stripping parameters from the file location
        if (fileLocation.indexOf('?') > -1) {
            fileLocation = fileLocation.substr(0, fileLocation.indexOf('?'));
        }
        lazyState.loadState(fileLocation).then(function(state){
            if (state) {
                if (state.parameters) {
                    tridionParameters.set(state.name, state.parameters);
                }
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

    // performing a one time check to redirect to the homepage when the location hash is unknown
    if($location.absUrl().indexOf('#')==-1) {
        $location.path('/')
    }
});


