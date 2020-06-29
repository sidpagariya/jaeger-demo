const opentracing = require('opentracing')
const tracer = opentracing.globalTracer()

function formatGreeting(req, res) {
  const span = tracer.startSpan('format-greeting', { childOf: req.span })
  // Parse the handler input
  const name = req.query.name
  span.log({ event: 'format', message: `formatting message remotely for name ${name}` })
  const response = `Hello from service-c ${name}!`
  const baggage = span.getBaggageItem('my-baggage')
  span.log({ event: 'baggage', message: `this is baggage ${baggage}` })
  span.finish()
  res.send(response)
}
module.exports = formatGreeting
