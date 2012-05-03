var http = require('http'),
 	lightnode = require('lightnode'),
	sys      = require('sys'),
	mongoose = require('mongoose');



// 1 - create and start the node ip server
var server = new http.Server(); server.listen(8081)
		
// 2 - create the file server for the root directory
var website = new lightnode.FileServer('/Users/jeremyclewell/Desktop/SOOOOORRRTT/Portfolio/')

// when a request comes to the ip server
server.addListener('request', function(req, resp) {
	
	// 3 - requests starting with path '/api' are sent to the api server
	
	if (req.url.indexOf('/api') == 0){
		apiHandler(req, resp)
	}
	
	// 4 - serve all other requests with the file server
	
	else {
		website.receiveRequest(req, resp)
		console.log(req.url);
	}
	
})


// this is run when the given request must be handled by the API
function apiHandler(req, resp) {

	resp.writeHead(200, {
		'content-type': 'text/javascript'
	});

	mongoose.connect('mongodb://localhost:27017/mydb');
	console.log("DB connected");
	var Schema = mongoose.Schema;
	var Thumbnail = new Schema({
		title		: String,
		image		: String
	});
	var PortfolioEntry = new Schema({
		title		: String,
		byline		: String,
		liveLink	: String,
		body		: String,
		date		: { type: Date, default: Date.now },
		thumbnails	: [Thumbnail]
	});
	mongoose.model('Thumbnail', Thumbnail);
	mongoose.model('PortfolioEntry', PortfolioEntry);
	var entryModel = mongoose.model('PortfolioEntry');
	entryModel.find({}, function(err, entries) {
		if (err) { throw err; }
		resp.write(JSON.stringify(entries));
		mongoose.disconnect();
		resp.end();
	})
}

function saveEntry() {
	mongoose.connect('mongodb://localhost:27017/mydb');
	var Schema = mongoose.Schema;
	var Thumbnail = new Schema({
		title		: String,
		image		: String
	});
	var PortfolioEntry = new Schema({
		title		: String,
		byline		: String,
		liveLink	: String,
		body		: String,
		date		: { type: Date, default: Date.now },
		thumbnails	: [Thumbnail]	
	});
	mongoose.model('Thumbnail', Thumbnail);
	mongoose.model('PortfolioEntry', PortfolioEntry);
	var entry = new PortfolioEntry();
	entry.title = title;
	entry.byline = byline;
	entry.liveLink = liveLink;
	entry.body = body;
	//var thumbnailArray = [];
	//for (thumbnail in thumbnails) thumbnailArray.push();
	entry.thumbnails = thumbnails;
	entry.save(function(err) {
		if (err) { throw err; }
		console.log("Saved!!");
		mongoose.disconnect();
	});
}