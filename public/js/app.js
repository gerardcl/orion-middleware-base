angular.module('cBodies', []);

angular.module('cBodies').controller('CbodiesController', function($rootScope,$scope,$interval,$http,cBodiesService){
    $scope.count = 0;
    $scope.printedData = "No data yet...";
    $scope.getCbodies = function() {
        $scope.printedData = "Fetching . . .";
        cBodiesService.getCbodies($scope.city, $scope.country).then(function(data) {
          $scope.printedData = data;
        }, function() {
          $scope.printedData = "Could not obtain data";
        });
    }

    $scope.fetchMessage = function(/* reuse this or reimplement with sensor ID... */) {
      $interval(function(prevGreeting) {
        $scope.getCbodies();
      }, 200);
    }
  }
);

angular.module('cBodies').factory('cBodiesService', function($http) {
  return {
    getCbodies: function(city, country) {
      //var query = city + ',' + country;
      //console.log("Using Service cBodiesService");
      return $http.get('/api/cbodies/1/analog/IN/1'
      // , {
      //   params: {
      //     q: query
      //   }
      // }
       ).then(function(response) { //then() returns a promise whichis resolved with return value of success callback
         //console.log("GOT RESPONSE Using Service cBodiesService");
         //return response.data.weather[0].description; ///extractweather data
         return response.data; ///extractweather data
      });
    }
  }
});

angular.module('cBodies').directive('analogSensor', function($http) {
  return {
    restrict: 'AEC',
    scope : {
      label:'@sensorAttr'
    },
    replace: true,
    //template: '<canvas nx="slider" min="0" label="{{label}}" max="255" id="{{label}}"></canvas>',
    template: '<input type="text" ng-model="analogValue">',
    link: function(scope, elem, attrs) {
      console.log(elem);
      scope.$watch('analogValue', function(value) {
        if (value == undefined) value = 2;
        console.log('Analog value changed!' + value);
        var data = {"contextElements":[{"type": "Scenario","isPattern": "false","id": "Scenario1",
                                        "attributes": [
                                            {
                                                "name": "analogIN1",
                                                "type": "float",
                                                "value": value
                                            }
                                        ]
                                    }],
                    "updateAction": "UPDATE"
                };
        console.log("ATTRIBUTE: ");
        console.log(data.contextElements[0].attributes[0].value);
        $http.post('/api/cbodies/update',data).success(function(response, status) {
          console.log(response);
        });
        // this does another call? just in case gloabl object does not work
        // and it is required to work in a per sensor/object basis calls
      });
      // scope.clearMessage = function() {
      //   scope.message = '';
      // }
      elem.bind('mouseover', function() {
        console.log("MOUSOVER "+scope.label);
        //elem.colors.accent("#ffffff");
      });

    }
  }
});
