const express = require('express');
const app = express();
const RSS = require('rss');
const fs = require('fs');
	
	app.use(express.static('public'));


	app.get('/', (req, res) => {
		res.sendFile('./public/index.html');
	});

	const startTime = Date.now();

	const posts = require('./posts.json');

	const rowData = [];

	const rowsNeeded = Math.ceil(posts.length/3);

	console.log(rowsNeeded);

	for(var i = 0; i < rowsNeeded; i++){
		rowData.push([]);
	}

	let currentRow = 0;
	let currPostCount = 0;

	for(let post in posts){
		
		var cardTemplate = fs.readFileSync('./stage/card-template.html');

		cardTemplate = cardTemplate.toString();

		cardTemplate = cardTemplate.replaceAll('%title%', posts[post].title);
		cardTemplate = cardTemplate.replaceAll('%desc%', posts[post].description);
		cardTemplate = cardTemplate.replaceAll('%date%', posts[post].date);

		cardTemplate = cardTemplate.replaceAll('<div class="card-title">', '        <div class="card-title">');
		cardTemplate = cardTemplate.replaceAll('<div class="card-description">', '        <div class="card-description">');
		cardTemplate = cardTemplate.replaceAll('\n</div>', '\n        </div>\n');
		cardTemplate = cardTemplate.replaceAll('<br>', '        <br>');

		if(currPostCount == 3){ 
			currentRow++;
			currPostCount = 0;
		}

		currPostCount++;

		rowData[currentRow].push(cardTemplate);
	}

	let cardData = [];

	for(let row of rowData){
		let rowRaw = ['\n    <div class="row">\n    ', "", "\n</div>"];
		rowRaw[1] = "    " + row.join('');
		cardData.push(rowRaw.join(''));
	}

	let indexTemplate = fs.readFileSync('./stage/index.html');
	
	indexTemplate = indexTemplate.toString();
	indexTemplate = indexTemplate.replace('%carddata%', cardData.join(''));
	
	fs.writeFileSync('./public/index.html', indexTemplate);

	const millis = Date.now() - startTime;

	console.log('Generated index.html in ' + Math.floor(millis / 1000) + ' seconds');

	var feed = new RSS({
		title: 'Threat Intelligence and Security Suggestions',
		description: 'A list of critical threats and check-up suggestions',
		feed_url: 'http://kwright02.com/feed.xml',
		site_url: 'http://kwright02.com/',
		image_url: 'https://solarustech.com/wp-content/uploads/2019/11/SECURE.png',
		managingEditor: 'Kyle Wright',
		webMaster: 'Kyle Wright',
		copyright: '2021 Kyle Wright',
		language: 'en',
		categories: ['Critital Threats', 'Security Check-Up Suggestions'],
		pubDate: 'September 22, 2021, 02:50:00 CST',
		ttl: '60',
	});

	for(let post of posts){
		feed.item({
			title: post.title,
			description: post.description,
			url: 'http://kwright02.com/',
			guid: posts.indexOf(post),
			author: 'Kyle Wright',
			date: post.date,
		});
	}

	var xml = feed.xml();

	fs.writeFileSync("./public/feed.xml", xml);


app.listen('8080', console.log("Listening for RSS requests"));
