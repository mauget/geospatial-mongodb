#!/bin/env node

var express = require('express');
var fs      = require('fs');
var mongodb = require('mongodb');

var App = function(){

  // Scope

  var self = this;

  // Setup
  
  self.dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST, parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT));
  self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {auto_reconnect: true});
  self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
  self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

  self.ipaddr  = process.env.OPENSHIFT_INTERNAL_IP;
  self.port    = parseInt(process.env.OPENSHIFT_INTERNAL_PORT) || 8080;

  if (typeof self.ipaddr === "undefined") {
    console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
  };

  self.coll = 'zips';


  // Web app logic
  self.routes = {};
  self.routes['health'] = function(req, res){ res.send('1'); };

  self.routes['root'] = function(req, res){
	var arg = '95123';
	var query = {zip: arg};
    self.db.collection( self.coll ).find( query ).toArray(function(err, locations) {
 //       res.header("Content-Type:","text/json");
 //       res.end(JSON.stringify(locations));
	
	//	res.header("Content-Type:","text/html");
		var s = "Zip Code "+arg+ " not found";
		if (locations != "undefined") {
			for (rec in locations) {
				var rec = locations[0];
				var s = '<h4>Location of ZIP '+rec.zip+'</h4>';
				s += '<p>City, state: '+rec.city+', '+rec.state+' ';
				s += 'Lat, long: ('+rec.loc.x+','+rec.loc.y+')</p>';
			}
			res.send(s);
		} 
		res.end();
    });
  };

  // Webapp urls
  
  self.app  = express.createServer();
  self.app.get('/health', self.routes['health']);
  self.app.get('/', self.routes['root']);
 

  // Logic to open a database connection. We call this outside of app so it is available to all our functions inside.

  self.connectDb = function(callback){
    self.db.open(function(err, db){
      if(err){ throw err };
      self.db.authenticate(self.dbUser, self.dbPass, {authdb: "admin"},  function(err, res){
        if(err){ throw err };
        callback();
      });
    });
  };
  
  
  // Start nodejs server with express

  self.startServer = function(){
    self.app.listen(self.port, self.ipaddr, function(){
      console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddr, self.port);
    });
  }

  // Destructors

  self.terminator = function(sig) {
    if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...', Date(Date.now()), sig);
      process.exit(1);
    };
    console.log('%s: Node server stopped.', Date(Date.now()) );
  };

  process.on('exit', function() { self.terminator(); });

  self.terminatorSetup = function(element, index, array) {
    process.on(element, function() { self.terminator(element); });
  };

  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'].forEach(self.terminatorSetup);

};

// Intialization:

//make a new express app
var app = new App();

//call the connectDb function and pass in the start server command
app.connectDb(app.startServer);
