var request = require("request");
var dotenv  = require("dotenv").config();
var keys    = require("./keys.js");
var Twitter = require("twit");
var Spotify = require("node-spotify-api");
//var apiNode = require("spotify-web-api-node");
//var apiJs = require("spotify-web-api-js");

var defaultSong  = "The Sign";
var defaultMovie = "Mr. Nobody";

var spotify = new Spotify(keys.spotify);
var client  = new Twitter(keys.twitter);

var command;

if ( (process.argv[2] !== undefined) && (process.argv[2] !== null)
  && (process.argv[2] !== '') ) {
  command = process.argv[2].toLowerCase().trim();
} else {
  console.log( "Usage is: node liri.js <command> <argument>" );
  console.log( "  Commands: my-tweets  spotify-this-song  movie-this  do-what-it-says" );
  process.exit();
}

/* *************Example Code start************************************** */
/* *************Example Code end**************************************** */

switch (command) {

  case 'my-tweets' :
    var params = {
                   q: 'BrutusShark',
                   count: 20
                 }

    client.get('search/tweets', params, searchedData);

    function searchedData(err, data, response) {
      var created;
      var tweet;

      var tweetArray = data.statuses;
      var tweetCount = tweetArray.length;

      for (var i = 0; i < tweetCount; i++) {
        created = tweetArray[i].created_at;
        tweet   = tweetArray[i].text; 
        console.log(created);
        console.log(tweet);
        console.log(" ");
      }
    }

    break;


  // Actual documentation for node-spotify-api
  // https://www.npmjs.com/package/node-spotify-api

  case 'spotify-this-song' :
    var songName;
    if ( (process.argv[3] !== undefined) && (process.argv[3] !== null)
      && (process.argv[3] !== '') ) {
      var songName = process.argv[3].trim();
    } else {
      songName = defaultSong;
    }

    // Note; type is artist OR album OR track
    spotify.search( { type: 'track', query: songName }, 
                    function(err, data) {
                            if (err) {
                              return console.log("Error occured: " + err);
                            }

                            console.log(data);

                            var objAry = data.tracks.items;
                            var objCount = objAry.length;
                            for (i = 0; i < objCount; i++) {
				console.log(objAry[i]);
                            }
                    });


    break;

  case 'movie-this' :
    break;

  case 'do-what-it-says' :
      break;

  default :
      console.log(command + ' is not a valid command.');
      console.log('Valid commands are: my-tweets  spotify-this-song  movie-this  do-what-it-says');
      process.exit();
    break;
}