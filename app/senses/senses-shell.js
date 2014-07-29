angular.module('app',['ui.router','oc.lazyLoad', 'context']);

angular.module('app').directive('nav', function($location){
    return {
        restrict : 'E',
        //template : '<ul><li ng-repeat="item in items" ng-click="navigate(item.url)">{{item.label}}</li></ul>',
        template : '<ul><li ng-repeat="item in items"><a href="#{{item.url}}">{{item.label}}</a> - <span ng-click="navigate(item.url)">{{item.label}}</span></li></ul>',
        link: function(scope){
            scope.items = [
                {label: 'home', url : '/'},
                {label: 'transactions', url : '/tridion/transactions'},
                {label: 'transactions/payments', url : '/tridion/transactions/payments'},
                {label: 'payments', url: '/tridion/payments'},
                {label: 'payments/level', url: '/tridion/payments/level'},
                {label: 'missing-page', url: '/missing-page'},
                {label: 'missing-manifest', url: '/missing-manifest'},
                {label: 'missing-implementation', url: '/missing-implementation'}
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

    var modules	= {};

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
        state.name = url;

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
            //state.views[feature.name + '@' + state.name] = view
            state.views[feature.name + '@' + url] = view
        }
        console.log(state);
        return state;
    }

    function composeStateFromHTML(html, url) {
    	var state	= {};
    	state.name	= url.substring(url.lastIndexOf('/') + 1, url.length);
    	state.name	= url;

        // linking the url with the state
        state.url = url;

        // setting the main template
        state.views = {
            "" : {template: html}
        };

        var features	= html.match(/ui\-view name=["'][^\"\']+['"]/g);
        for (var i=0; i < features.length; i++) {
        	var feature	= features[i].match(/name=["']([^\"\']+)['"]/);
        	var view = {
        		controller : feature[1] + 'MainController',
        		templateUrl : feature[1] + '/main.html'
        	};
        	state.views[feature[1] + '@' + url]	= view;
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
                    $state.go('shell:loading');
if (0) {
                    $http({url: absUrl +  url + '/state.json', method: 'GET'})
                        .success(function(data){
                        	console.log(data);
                            var uiRouterState = composeState(data, url);
                            addState(uiRouterState);
                        data.name	= url;
                            deferred.resolve(data)
                        })
                        .error(function(){deferred.reject()})
} else {
                    $http({url: absUrl +  url + '/page.html', method: 'GET'})
	                    .success(function(html){
	                    	var uiRouterState = composeStateFromHTML(html, url);
	                        addState(uiRouterState);

	                        var data	= {};
	                        data.name	= url.substring(url.lastIndexOf('/') + 1, url.length);
	                        data.name	= url;
	                        data.features	= [];

	                        var promises	= [];
	                        for (var s in uiRouterState.views) {
	                        	var name	= s.replace(/@.+/, '');
	                        	if (s != "" && !(name in modules)) {
	                        		(function(name) {
		                        		promises.push(
		                        			$http({url: absUrl + 'features/' + name + '/' + name + '.json', method: 'GET'})
			                        			.success(function(json) {
			    	                        		data.features.push({
			    	                        			name: name,
			    	                        			files: ['features/' + name + '/' + name + '.js' + '?v=' + json.version]
			    	                        		});
			    	                        		modules[name]	= true;
			                        			})
		                        		);
	                        		})(name);
	                        	}
	                        }

							$q.all(promises).then(function() {
								deferred.resolve(data);
							}, function() {
								deferred.reject();
							});
                    })
                    .error(function(){
                    	deferred.reject()
                    })
}
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

angular.module('app').config(function($stateProvider, lazyStateProvider){
	//$locationProvider.html5Mode(true);

	lazyStateProvider.set$stateProvider($stateProvider);

    lazyStateProvider.addState({
        name: 'home',
        url: '/',
        template: '<div>click <a href="#/tridion/transactions?transactionlist=latest">this link</a> to see the last transaction</div>'
    });

    // Special states
    $stateProvider.state({
        name: 'shell:loading',
        template:'<div style="color:green">Loading the page....</div>'
    });

    $stateProvider.state({
        name: 'shell:error',
        template:'<div style="color:red">Error loading page</div>'
    });
});

angular.module('app').run(function($rootScope, $state, lazyState, $ocLazyLoad, $q, $location, tridionParameters, $timeout){
    var storedSearch = null;

    $rootScope.$on('$locationChangeSuccess', function(event, toState){
        var fileLocation = toState.split('#')[1],
            state = lazyState.getState(fileLocation);

        // stripping parameters from the file location
        if (fileLocation.indexOf('?') > -1) {
            fileLocation = fileLocation.substr(0, fileLocation.indexOf('?'));
            rest = fileLocation.substr(fileLocation.indexOf('?'))
        }
        lazyState.loadState(fileLocation).then(function(state){
            if (state) {
                if (state.parameters) {
                    tridionParameters.set(state.name, state.parameters);
                }
                if (state.features) {
                    var promises = []
                    for (var i=0; i < state.features.length; i++) {
                        promises.push($ocLazyLoad.load(state.features[i]));
                    }
                    $q.all(promises).then(function(){
                        $state.go(state.name);
                    })
                } else {
                    $state.go(state.name)
                }
            }
        }, function() {
            $state.go('shell:error');
        });
    });
/*
    $rootScope.$on('$stateChangeSuccess', function(evt,to){
        // storing search if new state is loading. So when lazy loaded state is done, we can add the old search againg
        if (to.name === 'shell:loading') {
            storedSearch = $location.search()
        } else if(storedSearch !== null) {
            $location.search(storedSearch);
            storedSearch = null;
        }
    })
*/
    // performing a one time check to redirect to the homepage when the location hash is unknown
    if($location.absUrl().indexOf('#')==-1) {
        $location.path('/')
    }
});


