'use strict'

const request = require('request')
const util = require('util')

const url = 'https://maps.googleapis.com/maps/api/directions/json?origin=Westbahnhof&destination=Sch%C3%B6nbrunn&key=AIzaSyA8VbmLikVyaANslb4CkhZppAl8WlZQtxI&mode=transit&transit_mode=subway'

const isSubwayStep = step => {
  if (step['transit_details'] && step['transit_details']['line']) {
    return step['transit_details']['line']['vehicle']['type'] === 'SUBWAY'
  }

  return false
}

const buildAnswer = step => {
  const departureTime = step['transit_details']['departure_time']['text']
  const headsign = step['transit_details']['headsign']
  const shortName = step['transit_details']['line']['short_name']

  return util.format('You have to leave at %s to catch %s to %s', departureTime, shortName, headsign)
}

module.exports.lookup = (event, context, callback) => {
  request(url, (error, response, body) => {
    body = JSON.parse(body)
    body = body['routes'][0]['legs'][0]['steps']
      .find(isSubwayStep)
    body = buildAnswer(body)

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(body)
    })
  })

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
}
