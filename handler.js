'use strict'

const Alexa = require('alexa-sdk')
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

const handlers = {
  'AMAZON.HelpIntent': function () {
    const speechOutput = ''
    const reprompt = ''
    this.emit(':ask', speechOutput, reprompt)
  },
  'AMAZON.CancelIntent': function () {
    const speechOutput = ''
    this.emit(':tell', speechOutput)
  },
  'AMAZON.StopIntent': function () {
    const speechOutput = ''
    this.emit(':tell', speechOutput)
  },
  'DestinationIntent': function () {
    const that = this

    request(url, (error, response, body) => {
      body = JSON.parse(body)
      body = body['routes'][0]['legs'][0]['steps']
      body = body.find(isSubwayStep)

      that.emit(':tell', buildAnswer(body))
    })
  },
  'Unhandled': function () {
    const speechOutput = "The skill didn't quite understand what you wanted.  Do you want to try something else?"
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
