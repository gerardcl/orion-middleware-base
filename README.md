# ORION MIDDLEWARE BASE

Translates/simplifies ORION API through GET queries for specific scenario/context defined.

- API:

  host:port/api/cbodies/:scenario_id/:sensortype/:pintype/:pin

- Param values:

  - :scenario_id:
    - all
    - specific value (i.e.: 2)
    - set of values (i.e: 1:3:2 <-- element 1, 3 and 2)
  - :sensortype:
    - all
    - specific value (i.e.: digital)
    - set of values (i.e: analog:digital <-- same as all)
  - :pintype: all, 1, 1:3:5
    - all
    - specific value (i.e.: OUT)
    - set of values (i.e: OUT:IN <-- same as all)
  - :pin: all, 1, 1:3:5
    - all
    - specific value (i.e.: 3)
    - set of values (i.e: 1:2 <-- element 1 and 2)
# INSTALLATION

npm install

# RUN

npm start
