
//TODO:
// - to check orion connection errors when querying
// - to define POST routes for modifying specific attributes
// - to decide if response from Orion (JSON) should be filtered/prepared

var Client      = require('node-rest-client').Client;
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');

var client = new Client();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();
// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('New query:');
  next();
});


//var orionBaseURL = "http://178.62.205.167:1026"
var orionBaseURL = "http://192.168.99.100:1026"

client.registerMethod("orionVersion", ""+orionBaseURL+"/version", "GET");
client.registerMethod("queryContext", orionBaseURL+"/v1/queryContext", "POST");
client.registerMethod("updateContext", orionBaseURL+"/v1/updateContext", "POST");

//////////
// ROUTES
//////////
// Root API route: orionVersion
router.get('/', function(req, res) {
  console.log("GET /");
  client.methods.orionVersion(function (data, response) {
    console.log("SERVICE CHECK:");
    console.log(data);
    res.json(data);
  });
});

// API GET routes
router.get('/cbodies', function(req, res) {
  console.log("Redirect from scenario");
  translateGETQueryToOrion('all','all','all','all', function(response){
      res.json(response);
  });
});
router.get('/cbodies/:scenario_id', function(req, res) {
  console.log("Redirect from scenario");
  translateGETQueryToOrion(req.params.scenario_id,'all','all','all', function(response){
      res.json(response);
  });
});
router.get('/cbodies/:scenario_id/:sensortype', function(req, res) {
  console.log("Redirect from sensortype");
  translateGETQueryToOrion(req.params.scenario_id,req.params.sensortype,'all','all', function(response){
      res.json(response);
  });
});
router.get('/cbodies/:scenario_id/:sensortype/:pintype', function(req, res) {
  console.log("Redirect from pintype");
  translateGETQueryToOrion(req.params.scenario_id,req.params.sensortype,req.params.pintype,'all', function(response){
      res.json(response);
  });
});
router.get('/cbodies/:scenario_id/:sensortype/:pintype/:pin', function(req, res) {
  console.log("Redirect from pintype");
  translateGETQueryToOrion(req.params.scenario_id,req.params.sensortype,req.params.pintype,req.params.pin, function(response){
      res.json(response);
  });
});

// API POST routes
router.post('/cbodies/update', function(req, res) {
  console.log("Redirect from pintype");
  console.log(req.body);
  translatePOSTQueryToOrion(req.body, function(response){
      res.json(response);
  });
});

var translatePOSTQueryToOrion = function(queryObject, callback){
  callback = callback || function(){};
  var queryRequest = {
  	data: queryObject,
  	headers: { "Content-Type": "application/json" }
  };
  client.methods.updateContext(queryRequest, function (data, response) {
    console.log("POST:");
    console.log(queryObject);
    console.log(queryObject.contextElements[0].attributes);
    console.log("RESPONSE:");
    console.log(data.contextResponses[0].contextElement.attributes);


    // {
    //     "contextResponses": [
    //         {
    //             "contextElement": {
    //                 "attributes": [
    //                     {
    //                         "name": "analogIN1",
    //                         "type": "float",
    //                         "value": ""
    //                     },
    //                     {
    //                         "name": "digitalIN1",
    //                         "type": "integer",
    //                         "value": ""
    //                     }
    //                 ],
    //                 "id": "Scenario1",
    //                 "isPattern": "false",
    //                 "type": "Scenario"
    //             },
    //             "statusCode": {
    //                 "code": "200",
    //                 "reasonPhrase": "OK"
    //             }
    //         }
    //     ]
    // }


    // console.log("POST scenario: " + scenario +
    //             ", sensortype: " + sensortype +
    //             ", pintype: " + pintype +
    //             ", pin: " + pin );
    callback(data);
  });

};
// Generic API callback Orion GET queries translator
var translateGETQueryToOrion = function(scenario,sensortype,pintype,pin,callback){
  callback = callback || function(){};

  if ( scenario == "all" ) scenario = '1:2:3';
  if ( sensortype == "all" ) sensortype = 'analog:digital';
  if ( pintype == "all" ) pintype = 'IN:OUT';
  if ( pin == "all" ) pin = '1:2:3:4';

  arrScenarios = scenario.split(':');
  arrSensors = sensortype.split(':');
  arrPinTypes = pintype.split(':');
  arrPins = pin.split(':');

  var entities = [];
  var attributes = [];
  var queryObject = { headers: { "Content-Type": "application/json" }, data: {} };
  var queryObjectIndex = 0;

  arrScenarios.forEach( function(item,index,arr) {
    entities[index] = { "type": "Scenario", "isPattern": "false", "id": "Scenario"+item};
  });
  arrSensors.forEach( function(sensorItem,sensorIndex,arr) {
    arrPinTypes.forEach( function(pintypeItem,pintypeIndex,arr) {
      arrPins.forEach( function(pinItem,pinIndex,arr) {
          attributes[queryObjectIndex++] = sensorItem+pintypeItem+pinItem;
      });
    });
  });
  queryObject.data.entities = entities;
  queryObject.data.attributes = attributes;

  client.methods.queryContext(queryObject, function (data, response) {
    console.log("Get scenario: " + scenario +
                ", sensortype: " + sensortype +
                ", pintype: " + pintype +
                ", pin: " + pin );
    callback(data);
  });
};

//////////
// TESTS
//////////
var getTests = {
  headers: { "Content-Type": "application/json" },
  data: {
    "entities": [
      {
        "type": "Scenario",
        "isPattern": "false",
        "id": "Scenario2"
      },
      {
        "type": "Scenario",
        "isPattern": "false",
        "id": "Scenario1"
      }
    ],
    "attributes": [
      "analogIN3","analogIN1"
    ]
  }
};
router.route('/cbodies/test')
  .post(function(req, res) {
    res.json({ message: req.body });
  })
  .get(function(req, res) {
    //delete json[key];
    client.methods.queryContext(getTests, function (data, response) {
      console.log("Get TEST");
      res.json(data);
    });
  });
// END TESTS

// REGISTER ROUTES -------------------------------
// API
app.use('/api', router);
// WEB
app.use(express.static(process.cwd() + '/public'));
app.use(function(req, res){
      res.json({ error : "404"});
  });
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
