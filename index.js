var request = require('request');
var cheerio = require('cheerio');
var colors = require('colors');
var express = require('express');
var config = require('./config.json');


var app = express();

var http = require('http').Server(app);

var auth = "Basic " + new Buffer(config.wlc.username + ":" + config.wlc.password).toString("base64");

var url =  config.wlc.end_point_url + '/screens/base/monitor_summary.html';

app.get('/', function (req, res) {
  request.get({
      url : url,
      headers : {
          "Authorization" : auth
      }
    }, 
    function(error, response, body) { 
      var t = cheerio.load(body);
      var n = t('input[name="1.0.1.wlan_no_of_clients"]').val();
      
      console.log(n);

      var r = {
        clients: n
      }

      res.json(r);
    }
  );
});

http.listen(4000, function () {
    console.log(colors.rainbow("Listening..."));
});

process.on('exit', function(code) {
    http.close();
    console.log(colors.rainbow("Quitting..."));
});