const opentracing = require('opentracing')
const tracer = opentracing.globalTracer()

function formatGreeting(req, res) {
  const span = tracer.startSpan('format-greeting', { childOf: req.span })
  // Parse the handler input
  const name = req.query.name
  span.log({ event: 'format', message: `formatting message remotely for name ${name}` })
  const response = `Hello from service-b ${name}!`
  const baggage = span.getBaggageItem('my-baggage')
  span.log({ event: 'baggage', message: `this is baggage ${baggage}` })
  span.finish()
  res.send(response)
}

const bent = require('bent')

async function formatGreetingRemote(req, res) {
  const span = tracer.startSpan('format-greeting-remote', { childOf: req.span })
  // Parse the handler input
  const name = req.query.name
  span.log({ event: 'format', message: `formatting message remotely for name ${name}` })
  const service = process.env.SERVICE_FORMATTER || 'localhost'
  const servicePort = process.env.SERVICE_FORMATTER_PORT || '8082'
  const url = `http://${service}:${servicePort}/formatGreeting?name=${name}`
  console.log(url)
  const headers = {}
  tracer.inject(span, opentracing.FORMAT_HTTP_HEADERS, headers)
  const request = bent('string', headers)
  const response = await request(url)
  const baggage = span.getBaggageItem('my-baggage')
  span.log({ event: 'baggage', message: `this is baggage ${baggage}` })
  span.finish()
  res.send(response)
}
module.exports = formatGreetingRemote
