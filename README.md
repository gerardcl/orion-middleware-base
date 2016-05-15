# ORION MIDDLEWARE BASE

Translates/simplifies ORION API through GET queries for specific scenario/context defined.

- API:

  host:port/api/cbodies/:scenario_id/:sensortype/:pintype/:pin

- Param values:

  - :scenario_id
    - all
    - specific value (i.e.: 2)
    - set of values (i.e: 1:3:2 <-- element 1, 3 and 2)
  - :sensortype
    - all
    - specific value (i.e.: digital)
    - set of values (i.e: analog:digital <-- same as all)
  - :pintype
    - all
    - specific value (i.e.: OUT)
    - set of values (i.e: OUT:IN <-- same as all)
  - :pin
    - all
    - specific value (i.e.: 3)
    - set of values (i.e: 1:2 <-- element 1 and 2)

# INSTALLATION

    npm install

Note: It is required to modify variable "orionBaseURL" at server.js in order to point to your Orion working instance.

# RUN

    npm start

Note: By default the server listens on port 8080, so go browsing to http://localhost:8080/api
