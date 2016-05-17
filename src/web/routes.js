var config = require('./config/config.js');

function parseCookies (request) {
	var list = {},
	rc = request.headers.cookie;

	rc && rc.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return list;
}

module.exports = function(app) {

	// First, checks if it isn't implemented yet.
	if (!String.prototype.format) {
		String.prototype.format = function() {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function(match, number) { 
				return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
			});
		};
	}

	app.locals.signinUrl = config.untappd.signin_url.format(process.env.CLIENT_ID, process.env.REDIRECT_URL);

	app.use(function (request, response, next) {
		console.log('Page: ' + request.originalUrl)

		var cookies = parseCookies(request);
		var accessToken = cookies.accessToken;
		var firstName = cookies.firstName;
		var lastName = cookies.lastName;
		var userName = cookies.userName;

		response.locals.accessToken = accessToken;
		response.locals.firstName = firstName;
		response.locals.lastName = lastName;
		response.locals.userName = userName;

		console.log('  cookies: ' + JSON.stringify(cookies)); 
		console.log('  accessToken: ' + accessToken);
		console.log('  firstName :' + firstName);
		console.log('  lastName: ' + lastName);
		console.log('  userName: ' + userName);

		next();
	})

	// index.ejs
	app.get('/', function(request, response) {

		response.render('pages/index', {});
	});

	// profile.ejs
	app.get('/profile', function(request, response) {

		var profile = require('./apis/profile');
		profile.get(request, response);

	});

	app.post('/profile', function(request, response) {

		var profile = require('./apis/profile');
		profile.post(request, response);

	});

	// trigger
	app.get('/trigger', function(request, response) {

		var trigger = require('./apis/trigger');
		trigger.get();

		response.send('ok');
	});

	app.get('/webhook', function(request, response) {

		response.send('ok');
	});

	// oauth callback
	app.get('/callback', function(request, response) {

		var callback = require('./apis/callback');
		callback.get(request, response);

	});

	// logout
	app.get('/logout', function(request, response) {

		response.clearCookie('accessToken');
		response.clearCookie('firstName');
		response.clearCookie('lastName');
		response.clearCookie('userName');

		response.locals.accessToken = '';
		response.locals.firstName = '';
		response.locals.lastName = '';
		response.locals.userName = '';

		response.redirect('/');
	});
};