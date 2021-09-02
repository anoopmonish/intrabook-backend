var express = require('express');
var router = express.Router();

const { EventHubConsumerClient } = require("@azure/event-hubs");
const { ContainerClient } = require("@azure/storage-blob");

const { EventHubProducerClient } = require("@azure/event-hubs");

const consumerGroup = "$Default";

const postEventConn = "Endpoint=sb://intrabook.servicebus.windows.net/;SharedAccessKeyName=intrabook-posts;SharedAccessKey=HQ32Pn8uUVXVf4p+ovDOTRg+hyIwPUZstT+IAfVRH1o=;EntityPath=intrabook-posts";
const postEventName = "intrabook-posts";
const postProducer = new EventHubProducerClient(postEventConn, postEventName);

const commentEventConn = "Endpoint=sb://intrabook.servicebus.windows.net/;SharedAccessKeyName=intrabook-comments;SharedAccessKey=wBysH4ZyIMsiMtQJUnAmtEaz25JhqRZ/1wdNMsvHfFw=;EntityPath=intrabook-comments";
const commentEventName = "intrabook-comments";
const commentProducer = new EventHubProducerClient(commentEventConn, commentEventName);

let postSequence = 4;
let posts = [
	{
	    postId: 1,
		userId: 'anoop',
		body: 'Hello Good Morning Folks',
		comments: [
			{postId: 1, userId: 'srejith', message: 'True that bro!', time: 'Sept 1st 2020'}
		]
	}, {
	    postId: 2,
		userId: 'srejith',
		body: 'Hello Good Afternoon Folks',
		comments: [
			{postId: 2, userId: 'anoop', message: 'Life is so tiring!', time: 'Sept 1st 2020'}
		]
	}, {
	    postId: 3,
		userId: 'sreyas',
		body: 'Hello Good Evening Folks',
		comments: [
			{postId: 3, userId: 'anoop', message: 'Office meetings completed.. Whoohoo!', time: 'Sept 1st 2020'},
			{postId: 3, userId: 'srejith', message: 'Kick back and relax dude!', time: 'Sept 1st 2020'}
		]
	}
];

/* GET users listing. */
router.get('/new/user/:userId/body/:body', function(req, res, next) {
	let newPoster = {
		userId: req.params.userId,
		postId: postSequence++,
		body: req.params.body,
		comments: []
	};
	posts.push(newPoster);

	sendPostEvent(newPoster);

	res.send(newPoster);
});

router.get('/', function(req, res, next) {
	
	res.send(posts);
});

router.get('/:postId/user/:userId/message/:message', function(req, res, next) {
	const newComm = {
		postId: req.params.postId,
		userId: req.params.userId,
		message: req.params.message,
		time: new Date()
	};
	const foundPost = posts.find(p => Number(p.postId) === Number(newComm.postId));
	foundPost.comments.push(newComm);

	sendCommentEvent(newComm);

	res.send(newComm);
});

async function sendPostEvent(newPoster) {
	// Sending the event to kafka
	const batch = await postProducer.createBatch();
    batch.tryAdd(newPoster);
	await postProducer.sendBatch(batch);
	//await postProducer.close();
}

async function sendCommentEvent(newComm) {
	// Sending the event to kafka
	const batch = await commentProducer.createBatch();
    batch.tryAdd(newComm);
	await commentProducer.sendBatch(batch);
	//await commentProducer.close();
}

module.exports = router;
