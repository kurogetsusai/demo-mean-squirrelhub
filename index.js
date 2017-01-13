const express = require('express');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
	helpers: {
		angular: param => param.fn()
	}
});

// all the db magic
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/squirrelhub');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.on('open', function () {
	console.log('MongoDB: Connected to the Mongo daemon.');

//// toggle these to reset the db
//	Picture.remove({}, function (err, pictures) {
//		if (err)
//			console.error(err);
//	});

	Picture.find(function (err, pictures) {
		if (err)
			console.error(err);

		if (pictures.length == 0) {
			var data = require('./data.json');
			data.forEach(function (picture) {
				(new Picture(picture)).save(function (err, pictures) {
					if (err)
						console.error(err);
				});
			});
		}
	});
});

var pictureSchema = mongoose.Schema({
	title: String,
	filename: String,
	author: String,
	license: String,
	source: String,
	favorites: Number
});

var Picture = mongoose.model('Picture', pictureSchema);

// express stuff
const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 8000);
app.use(express.static(__dirname + '/public'));

app.get('/', function (request, response) {
	response.render('home');
});

app.get('/rest/get/:param1', function (request, response, next) {
	var entity = request.params.param1;

	switch (entity) {
	case 'pictures':
		Picture.find(function (err, pictures) {
			if (err) {
				console.error(err);
				response.send('[]');
				return;
			}

			response.send(pictures);
		});
		break;
	}
});

app.get('/rest/set/:param1/:param2/:param3/:param4', function (request, response, next) {
	var entity = request.params.param1;
	var entityId = request.params.param2;
	var entityProperty = request.params.param3;
	var entityValue = request.params.param4;

	switch (entity) {
	case 'picture':
		var query = {_id: entityId};
		var update = {};
		update[entityProperty] = entityValue;
		Picture.update(query, {$set: update}, function (err, pictures) {
			if (err) {
				console.error(err);
				response.send('[]');
				return;
			}

			response.send('ok');
		});
		break;
	}
});

app.listen(app.get('port'), function () {
	console.log('Listening on port ' + app.get('port') + '.');
});
