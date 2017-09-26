'use strict'

const Alexa = require('alexa-sdk')
const request = require('request')
const util = require('util')

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

const handlers = {
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', '', '')
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', '')
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', '')
  },
  'DestinationIntent': function () {
    const destination = this.event.request.intent.slots.destination.value
    const url = util.format('https://maps.googleapis.com/maps/api/directions/json?origin=Westbahnhof&destination=%s&key=AIzaSyA8VbmLikVyaANslb4CkhZppAl8WlZQtxI&mode=transit&transit_mode=subway', destination)
    const that = this

    request(url, (error, response, body) => {
      body = JSON.parse(body)
      body = body['routes'][0]['legs'][0]['steps']
      body = body.find(isSubwayStep)

      that.emit(':tell', buildAnswer(body))
    })
  },
  'Unhandled': function () {
    const speechOutput = "The skill didn't quite understand what you wanted. Do you want to try something else?"
    this.emit(':ask', speechOutput, speechOutput)
  }
}

module.exports.lookup = (event, context) => {
  const alexa = Alexa.handler(event, context)

  // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
  // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes
  // alexa.resources = languageStrings
  alexa.registerHandlers(handlers)
  alexa.execute()
}
