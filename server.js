#!/bin/env node

var express = require('express');
var fs      = require('fs');
var mongodb = require('mongodb');

var App = function(){

  // Scope

  var self = this;

  // Setup
  
  self.dbServer = new mongodb.Server(process.env.OPENSHIFT_NOSQL_DB_HOST, parseInt(process.env.OPENSHIFT_NOSQL_DB_PORT));
  self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {auto_reconnect: true});
  self.dbUser = process.env.OPENSHIFT_NOSQL_DB_USERNAME;
  self.dbPass = process.env.OPENSHIFT_NOSQL_DB_PASSWORD;

  self.ipaddr  = process.env.OPENSHIFT_INTERNAL_IP;
  self.port    = parseInt(process.env.OPENSHIFT_INTERNAL_PORT) || 8080;

  if (typeof self.ipaddr === "undefined") {
    console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
  };
  
  
   

  // Web app logic
  self.routes = {};
  self.routes['health'] = function(req, res){ res.send('1'); };

  self.routes['root'] = function(req, res){
    self.db.collection('names').find().toArray(function(err, names) {
        res.header("Content-Type:","text/json");
        res.end(JSON.stringify(names));
    });
  };

    // Webapp urls
  
  self.app  = express.createServer();
  self.app.get('/health', self.routes['health']);
  self.app.get('/', self.routes['root']);
 



  // Logic to open a database connection. We are going to call this outside of app so it is available to all our functions inside.

  self.connectDb = function(callback){
    self.db.open(function(err, db){
      if(err){ throw err };
      self.db.authenticate(self.dbUser, self.dbPass, {authdb: "admin"},  function(err, res){
        if(err){ throw err };
        callback();
      });
    });
  };
  
  
  //starting the nodejs server with express

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

//make a new express app
var app = new App();

//call the connectDb function and pass in the start server command
app.connectDb(app.startServer);
