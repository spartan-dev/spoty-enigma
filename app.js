require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
//config partials
hbs.registerPartials(__dirname + "/views/partials");

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant() //se comunica con spoty
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );
// Our routes go here:
app.get("/", (req, res, next) => {
  res.render("home");
});
app.get("/artist-search", (req, res, next) => {
  //console.log(req.query, "si llegamos man 🔥");
  const { search } = req.query; //destructuring
  req.nameArtist = search;
  spotifyApi
    .searchArtists(search) //este es el nombre solito
    .then((data) => {
      // console.log("The received data from the API: ", data.body.artists.items);
      res.render("artist-search-results", {
        albums: data.body.artists.items,
        search,
      });
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:id/:name", (req, res, next) => {
  const { id, name } = req.params;
  console.log("si lo tenemos bich", req.nameArtist);
  spotifyApi.getArtistAlbums(id).then(
    function (data) {
      console.log(data.body);
      console.log("Artist albums", data.body.items);
      res.render("albums", { albums: data.body.items, name });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get("/tracks/:albumId", (req, res, next) => {
  const { albumId } = req.params;
  spotifyApi
    .getAlbumTracks(albumId)
    .then((data) => {
      console.log("los tracks", data.body.items);
      res.render("tracks", { track: data.body.items });
    })
    .catch((error) => {
      console.log("error", error);
      res.send("error ");
    });
});
app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
