var request = require('request');
var cheerio = require('cheerio');
var colors = require('colors');
var express = require('express');
var Phant = require('phant-client').Phant;
var config = require('./config.json');


var app = express();
var phant = new Phant();

var http = require('http').Server(app);

app.get('/wifi', function (req, res) {
  getWLCdata(config.wlc, function(data){
    res.json(data);
  });
});

getWLCdata(config.wlc, function(data){
  phant.add(config.store.phant, { clients: data.clients });
});

setInterval(function() {
  getWLCdata(config.wlc, function(data){
    phant.add(config.store.phant, { clients: data.clients });
  });
}, config.store.query_time);

http.listen(4000, function () {
    console.log(colors.rainbow("Listening..."));
});

process.on('exit', function(code) {
    http.close();
    console.log(colors.rainbow("Quitting..."));
});


function getWLCdata (wlc, callback) {
  request.get({
      url : config.wlc.end_point_url + '/screens/base/monitor_summary.html',
      headers : {
          "Authorization" : "Basic " + new Buffer(config.wlc.username + ":" + config.wlc.password).toString("base64")
      }
    }, 
    function(error, response, body) { 
      var t = cheerio.load(body);
      var r = {
        clients: Number(t('input[name="1.0.1.wlan_no_of_clients"]').val()),
        ap: {
          up: Number(t('input[name="current_up_aps"]').val()),
          down: Number(t('input[name="current_down_aps"]').val())
        }
      }
      callback(r);
    }
  );
}