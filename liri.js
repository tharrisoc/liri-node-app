var request = require("request");
var dotenv  = require("dotenv").config();
var keys    = require("./keys.js");
var Twitter = require("twit");
var Spotify = require("node-spotify-api");
var fs      = require("fs");

var spotify = new Spotify(keys.spotify);
var client  = new Twitter(keys.twitter);

var defaultSong  = "The+Sign";
var defaultMovie = "Mr.+Nobody";

var command;
var argument;

var movieName;
var songName;

var songMatch;

if ( (process.argv[2] !== undefined) && (process.argv[2] !== null)
  && (process.argv[2] !== '') ) {
  command = process.argv[2].toLowerCase().trim();
} else {
  usage();
}

if ( (command === 'spotify-this-song') || (command === 'movie-this') ) {
  var numArgs = process.argv.length - 2;
  if (numArgs === 1) {
    argument = process.argv[3];
  } else if (numArgs > 1) {
    argument = process.argv.slice(3).join('+');
  } else {
    argument = '';
  }
}


theSwitch:
switch (command) {

  // TODO: this case does not work yet. However, the code that implements
  //       it does exist. [see function doWhatItSays()]
  //       What I wanted to do here was to change the text of the command
  //       and then fall through the remaining cases with the new command

  case 'do-what-it-says' :
      doWhatItSays();
console.log(command);  // DEBUG
console.log(argument);  // DEBUG
      if ( command === null ) {
        break;
      }
      
      break theSwitch;  // This would not be here if fall through was working

  case 'my-tweets' :
      getTweets();
      break;

  case 'spotify-this-song' :
      if ( (argument !== '') && (argument !== undefined) ) {
        songName = argument;
      } else {
        songName = defaultSong;
        songName = songName.replace('+', ' ');
      }

      songMatch = songName.replace( /\+/g, " ");

      searchSpotify();
      break;

  case 'movie-this' :
      if ( (argument !== '') && (argument !== undefined) ) {
        movieName = argument;
      } else {
        movieName = defaultMovie;
      }

      searchOMDB();
      break;

  default :
      console.log(command + ' is not a valid command.');
      console.log('Valid commands are: my-tweets  spotify-this-song  movie-this  do-what-it-says');
      process.exit();
      break;
}


// **************************** Tweets **********************************
function getTweets() {
  var params = {
     q: 'BrutusShark',
     count: 20
  };

  client.get('search/tweets', params, searchedData);
}

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


// **************************** Spotify *********************************
function searchSpotify() {
  // Note: type is artist OR album OR track
  spotify.search(
     { type: 'track', query: songName },
     function(err, data) {
       if (err) {
         // Note: this statement gets executed regardless of whether the
         //       error occurred on the server, or occurred in this block
         //       after the data is returned.
         return console.log("Error occured: " + err);
       }
       else {
	 // data was returned
	   var objAry = data.tracks.items;
           var objCount = objAry.length;
           var numArtists = 0;
           var artistNames = [];
           var nameOfSong = '';
           var previewLink = '';
           var albumName = '';
           
           for ( i = 0; i < objCount; i++ ) {
             numArtists = objAry[i].artists.length;
             
             for ( j = 0; j < numArtists; j++ ) {
	       artistNames.push(objAry[i].artists[j].name);
             }

             nameOfSong  = objAry[i].name;
             previewLink = objAry[i].preview_url;
             albumName   = objAry[i].album.name;

             // The returned data can include songs whose titles do not even
             // remotely match the title that the user entered. Try to display
             // only those songs whose title at least contains the user's
             // choice as a substring.
             // TODO: Fix the problem with the regular expression. For now,
             //       use indexOf. However, this means that the match will
             //       be case sensitive.
/*           var result = nameOfSong.search(new RegExp(songName, "i"));
             if ( result !== -1 ) { */

             var result = nameOfSong.indexOf(songMatch);
             if ( result !== -1 ) {
	       // match on title
	       console.log( "Song: " + nameOfSong );
               console.log( "Album: " + albumName );
               console.log( "Artist(s): ");
               for( k = 0; k < numArtists; k++ ) {
		 console.log("  " + artistNames[k]);
               }
               console.log("Preview: " + previewLink);
               console.log(" ");
             }
           }
       }  // else !err
     } // function(err, data()
  );  // spotify.search()
} // function searchSpotify()


// **************************** OMDB ************************************
function searchOMDB() {
  var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
  request( queryUrl, 
     function(error, response, body) {
       if( error ) {
	 return console.log(error);
       }

       // If the request is successful
       if ( response.statusCode === 200 ) {
         console.log("Title: " + JSON.parse(body).Title);
         console.log("Release Year: " + JSON.parse(body).Year);
         console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
         console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
         console.log("Country: " + JSON.parse(body).Country);
         console.log("Language: " + JSON.parse(body).Language);
         console.log("Plot: " + JSON.parse(body).Plot);
         console.log("Actors: " + JSON.parse(body).Actors);
      }
   });
}

// **************************** do-what-it-says  ************************

function doWhatItSays() {
    data = fs.readFileSync( "random.txt", "utf8" );

    var contents = data.split(',');
    var cmd = contents[0].trim();
    var arg = contents[1].trim();

    if( (cmd !== 'my-tweets') && (cmd !== 'spotify-this-song')
     && (cmd !== 'movie-this') ) {
       command = null;  // global variable
       return
    }

    // Change the command from do-what-it-says to whatever command is
    // in the file
    command = cmd; // global variable

    if ( (arg === undefined) || (arg === "") ) {
      argument = ''; // global variable
      return;
    }

    arg = arg.replace( /\"/g, '' );   // remove the quotation marks
    arg = arg.replace( /\s/g, '+' );  // TODO: this won't handle multiple consecutive spaces
    argument = arg;  // global variable
}


// **************************** Usage ***********************************
function usage() {
  console.log( "Usage is: node liri.js <command> <argument>" );
  console.log( "  Commands: my-tweets  spotify-this-song  movie-this  do-what-it-says" );
  process.exit();
}
