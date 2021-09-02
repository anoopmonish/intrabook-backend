var express = require('express');
var router = express.Router();

const { EventHubProducerClient } = require("@azure/event-hubs");

const connectionString = "Endpoint=sb://intrabook.servicebus.windows.net/;SharedAccessKeyName=intrabook-manager;SharedAccessKey=c/+lcRcSqiM4fA64XjurBFp8GjeADpKDrTtItU9GMKo=;EntityPath=intrahub-datasource";
const eventHubName = "intrahub-datasource";

async function sendEvent() {

  // Create a producer client to send messages to the event hub.
  const producer = new EventHubProducerClient(connectionString, eventHubName);

  // Prepare a batch of three events.
  const batch = await producer.createBatch();
  batch.tryAdd({ body: "First event" });
  batch.tryAdd({ body: "Second event" });
  batch.tryAdd({ body: "Third event" });    

  // Send the batch to the event hub.
  await producer.sendBatch(batch);

  // Close the producer client.
  await producer.close();

  console.log("A batch of three events have been sent to the event hub");
}

/* GET users listing. */
router.get('/', function(req, res, next) {
	sendEvent();
  res.send('respond with a resource');
});

module.exports = router;
