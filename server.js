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
  console.log('Something is happening.');
  next();
});


var orionBareURL = "http://178.62.205.167:1026"

client.registerMethod("orionVersion", ""+orionBareURL+"/version", "GET");
client.registerMethod("queryContext", orionBareURL+"/v1/queryContext", "POST");
// // get tot
// baseurl/scenario
// //get scenario
// baseurl/scenarioN
// //get scenario
// baseurl/scenarioN/attributeM
//
//
//
// baseurl/scenario1/atrribueN
// // set content-type header and data as json in args parameter
// var restCall = {
//   scenarios : {
//     scenario1: {
//       attributeN : '2'
//     },
//
//   },
// }

var getScenario1AnalogIN1 = {
  data: {
    "entities": [
      {
        "type": "Scenario",
        "isPattern": "false",
        "id": "Scenario1"
      }
    ],
    "attributes": [
      "analogIN1"
    ]
  },
  headers: { "Content-Type": "application/json" }
};

var getAllScenariosAnalogIN1 = {
  data: {
    "entities": [
      {
        "type": "Scenario",
        "isPattern": "true",
        "id": "Scenario1"
      }
    ],
    "attributes": [
      "analogIN1"
    ]
  },
  headers: { "Content-Type": "application/json" }
};



router.get('/', function(req, res) {
  console.log("GET /");
  client.methods.orionVersion(function (data, response) {
    console.log("SERVICE CHECK:");
    console.log(data);
    res.json(data);
  });
});

router.route('/scenario')
  .post(function(req, res) {
    res.json({ message: req.body });
  })
  .get(function(req, res) {
    res.json(scenarios);
  });

router.route('/scenario/:scenario_id')
  .get(function(req, res) {
    client.methods.queryContext(getAllScenariosAnalogIN1, function (data, response) {
      console.log("Printing get scenario "+ req.params.scenario_id +", analogIN1:");
      data.contextResponses.forEach(function logArrayElements(element, index, array) {
        console.log("Scenario" +index + "]: ");
        console.log(element);
      });
      console.log(data);
      res.json(data);
    });
  });

// REGISTER OUR ROUTES -------------------------------
// API
app.use('/api', router);
// WEB
app.use(express.static(process.cwd() + '/public'));
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
