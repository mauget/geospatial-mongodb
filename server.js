#!/bin/env node

var express = require('express');
var fs      = require('fs');
var mongodb = require('mongodb');

var App = function(){

  // Scope

  var self = this;

  // Setup

  self.zcache = { 'index.html': '' };
  self.zcache['index.html'] = fs.readFileSync('./index.html');
  
  //self.dbServer = new mongodb.Server(process.env.OPENSHIFT_NOSQL_DB_HOST, parseInt(process.env.OPENSHIFT_NOSQL_DB_PORT));
  self.db  = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, new mongodb.Server(process.env.OPENSHIFT_NOSQL_DB_HOST, 27017, {auto_reconnect: true
}));
  //new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {auto_reconnect: true});
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

  self.routes['asciimo'] = function(req, res){
    var link="https://a248.e.akamai.net/assets.github.com/img/d84f00f173afcf3bc81b4fad855e39838b23d8ff/687474703a2f2f696d6775722e636f6d2f6b6d626a422e706e67";
    res.send("<html><body><img src='" + link + "'></body></html>");
  };

  self.routes['root'] = function(req, res){
    self.db.collection('names').find().toArray(function(err, names) {
        res.header("Content-Type:","text/json");
        res.end(JSON.stringify(names));
    });
  };


  // Webapp

  self.app  = express.createServer();
  self.app.get('/health', self.routes['health']);
  self.app.get('/asciimo', self.routes['asciimo']);
  self.app.get('/', self.routes['root']);

  // Logic

  self.connectDb = function(callback){
    self.db.open(function(err, db){
      if(err){ throw err };
      self.db.authenticate(self.dbUser, self.dbPass, function(err, res){
        if(err){ throw err };
        callback();
      });
    });
  };

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

var app = new App();
app.connectDb(app.startServer);
