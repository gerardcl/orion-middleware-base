
//TODO:
// - check orion connection errors when querying

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


//var orionBareURL = "http://178.62.205.167:1026"
var orionBareURL = "http://192.168.99.100:1026"

client.registerMethod("orionVersion", ""+orionBareURL+"/version", "GET");
client.registerMethod("queryContext", orionBareURL+"/v1/queryContext", "POST");

var baseGetScenarios = {
  data: {
      "entities": [
          {
              "type": "Scenario",
              "isPattern": "true",
              "id": "Scenario.*"
          }
      ]
      ,
      "attributes": [
          "analogIN1"
      ]
  },
  headers: { "Content-Type": "application/json" }
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

//////////
// ROUTES
//////////
router.get('/', function(req, res) {
  console.log("GET /");
  client.methods.orionVersion(function (data, response) {
    console.log("SERVICE CHECK:");
    console.log(data);
    res.json(data);
  });
});

router.route('/cbodies/:scenario_id/:sensortype/:pintype/:pin')
  .post(function(req, res) {
    res.json({ message: req.body });
  })
  .get(function(req, res) {
    if ( req.params.scenario_id == "all" ) req.params.scenario_id = '1:2:3';
    if ( req.params.sensortype == "all" ) req.params.sensortype = 'analog:digital';
    if ( req.params.pintype == "all" ) req.params.pintype = 'IN:OUT';
    if ( req.params.pin == "all" ) req.params.pin = '1:2:3:4';

    arrScenarios = req.params.scenario_id.split(':');
    arrSensors = req.params.sensortype.split(':');
    arrPinTypes = req.params.pintype.split(':');
    arrPins = req.params.pin.split(':');

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
      console.log("Get scenario: " + req.params.scenario_id +
                  ", sensortype: " + req.params.sensortype +
                  ", pintype: " + req.params.pintype +
                  ", pin: " + req.params.pin );
      res.json(data);
    });
  });

//
// OLD ROUTES
//
// router.route('/cbodies/:scenario_id')
//   .post(function(req, res) {
//     res.json({ message: req.body });
//   })
//   .get(function(req, res) {
//     baseGetScenarios.data.entities[0].id = req.params.scenario_id == "all" ? "Scenario.*" : "Scenario"+req.params.scenario_id ;
//     client.methods.queryContext(baseGetScenarios, function (data, response) {
//       console.log("Get scenario " + req.params.scenario_id);
//       res.json(data);
//     });
//   });
//
// WORKING GET SPECIFIC ATTRIBUTE
//
// router.route('/cbodies/:scenario_id/:sensortype/:pintype/:pin')
//   .post(function(req, res) {
//     res.json({ message: req.body });
//   })
//   .get(function(req, res) {
//     baseGetScenarios.data.entities[0].id = req.params.scenario_id == "all" ? "Scenario.*" : "Scenario"+req.params.scenario_id ;
//     baseGetScenarios.data.attributes[0] = req.params.sensortype+req.params.pintype+req.params.pin ;
//     client.methods.queryContext(baseGetScenarios, function (data, response) {
//       console.log("Get scenario: " + req.params.scenario_id +
//                   ", sensortype: " + req.params.sensortype +
//                   ", pintype: " + req.params.pintype +
//                   ", pin: " + req.params.pin );
//
//       res.json(data);
//     });
//   });

// REGISTER ROUTES -------------------------------
// API
app.use('/api', router);
// WEB
app.use(express.static(process.cwd() + '/public'));
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
