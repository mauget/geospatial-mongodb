#!/bin/env node

//  OpenShift Geospatial Node application
var express = require('express');
var fs      = require('fs');
var mongodb = require('mongodb');

/**
 *  Define the nodejs application.
 */
var NodeApp = function() {

	//  Scope.
	var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {

		// Mongo environment variables
		
		self.dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST,
	                              parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT));

		self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {auto_reconnect: true, safe: false});

		self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
		self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
		
		self.coll = 'zips';
		
		//  Web app environment variables

		self.ipaddress = process.env.OPENSHIFT_INTERNAL_IP;
		self.port      = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

		if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_INTERNAL_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
		};

	}; /* setupVariables */

    /**
     *  Populate the cache.
     */
    self.populateCache = function() {

        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
        self.zcache['app.js'] = fs.readFileSync('./scripts/app.js');
		self.zcache['jquery.ui.map.full.min.js'] = fs.readFileSync('./scripts/jquery.ui.map.full.min.js);

    }; /* populate cache */

    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    }; /* terminator */

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    }; /* termination handlers */


    /*  ================================================================  */
    /*  App server functions (main app logic).                            */
    /*  ================================================================  */

    /**
     *  Create the routing table entries with handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        // Routes for /health, /asciimo /scrips, and /
        self.routes['/health'] = function(req, res) {
            res.send('1');
        }; /* health */

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        }; /* asciimo */

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        }; /* root */

		self.routes['/scripts/app.js'] = function(req, res) {
			res.setHeader('Content-Type', 'text/javascript');
			res.send(self.cache_get('app.js') );
		}; /* scripts */
		
		self.routes['/scripts/jquery.ui.map.full.min.js'] = function(req, res) {
			res.setHeader('Content-Type', 'text/javascript');
			res.send(self.cache_get('jquery.ui.map.full.min.js') );
		}; /* scripts */


		self.routes['/near/zip/:zip'] = function(req, res) {

			// Fuquay record
			// db.zips.find({loc: {$near: [ 35.579952, 78.780807 ]}}) -->

			var zipCode = req.params.zip;

			self.db.collection( self.coll ).find( {zip: zipCode}).toArray( function( err, center)  {
				if (center && center.length > 0){
					var record = center[0];
					var y =  record.loc.y;
					var x =  record.loc.x;
					res.redirect("/near/lat/"+y+"/lon/"+x);
				} else {
					res.redirect("/");
				}
			});

		}; /* nearZip */
		
		self.routes['/near/lat/:lat/lon/:lon'] = function(req, res) {

			var limit = 25;
			var lat =  Number(req.params.lat);
			var lon =  Number(req.params.lon);
			var query = {loc: {$near: [ lat, lon ] } };

			self.db.collection( self.coll ).find( query ).limit( limit ).toArray( function( err, locations ) {
				if (!locations ) {
					res.send('{err: "Nothing found"}');
				} else {
					res.send(locations);
				}
			});	
	  	}; /* nearLatLon */
	
		
		self.routes['/cities/:like'] = function(req, res) {
		
			var limit = 25;
			var like = req.params.like;
			
			if (!like) {
				res.send('{err: "Bad input"}');
			} else {
				// db.zips.find({city: {$regex: '^fuquay.*', $options: 'i' }}  )
				var query = {city: { $regex: ('^%s.*', like), $options: 'i' } };
			
				self.db.collection( self.coll ).find( query ).limit( limit ).toArray( function( err, cities ) {
					if (!cities ) {
						res.send('{err: "Nothing found"}');
					} else {
						res.send(cities);
					}
				});	
			}		
		}; /* cities search */

    }; /* create routes */


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    }; /* initialize server */


    /**
     *  Initialize application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();

	//	console.log(jade);
		
    }; /* initialize app */


	/**
	  *  Start the server and the application.
	  */
	self.start = function() {

		//  Start the app on the specific interface (and port).
		console.log('%s self.start entered', Date(Date.now()) );

		self.app.listen(self.port, self.ipaddress, function() {
			console.log('%s: Node server started on %s:%d ...',
				Date(Date.now() ), self.ipaddress, self.port);
		});
	}; /* app start */

	/**
	 *  Connect db and then callback to start the application.
	 */
	self.connectDb = function(appStart) {
		self.db.open(function(err, db) {
			if (err) { throw err; }
			self.db.authenticate(self.dbUser, self.dbPass,  function(err, result) {
				if (err) { throw err; }
			});
			appStart();
		});
	}; /* Connect db */


};   /* Application.  */

/*  ================================================================  */
/*  Main                                                              */
/*  ================================================================  */
var theApp = new NodeApp();
theApp.initialize();
theApp.connectDb(theApp.start);

