const express = require('express');
const mongoose= require('mongoose');
const {get} = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');

//models
const Music = require('./models/music.models');

require('dotenv').config();

//urls
const youtubeUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLw3w4Jq1Z09nrYhE3xPaG8t5lfkxrmoqO&key=${process.env.YOUTUBE_API_KEY}` ;


const app = express();



//fetch playlist data
const getYoutubePlaylist = async () => {
    const playlistData = await get(youtubeUrl , {
        header:{
            Authorization: `Bearer ${process.env.YOUTUBE_CLIENT_ID}`,
            Accept: 'application/json'
        }
    })
    const playlistDetail = playlistData.data.items;
    
    playlistDetail.forEach(detail => {
        const musicTitle = detail.snippet.title.split('-')[1].split('(')[0].trim();
        const artist = detail.snippet.title.split('-')[0].trim();
        const music = new Music({
            title: musicTitle,
            artist: artist
        })

        music.save()
        .then(
            console.log('saved')
        ).catch(
            err => console.log('error: query already exists')
        )
    })
}

//spotify
// const scopes = ['user-read-private', 'user-read-email'];
// const state = 'some-state-of-my-choice';

const spotifyApi = new SpotifyWebApi({
    clientId: `${process.env.SPOTIFY_CLIENT_ID}` ,
    clientSecret: `${process.env.SPOTIFY_CLIENT_SECRET}`,
    accessToken: `${process.env.SPOTIFY_ACCESS_TOKEN}`,
    redirectUri: 'https://google.com',
});

spotifyApi.setCredentials({
    accessToken: `${process.env.SPOTIFY_ACCESS_TOKEN}`,
    refreshToken: `${process.env.SPOTIFY_REFRESH_TOKEN}`,
    redirectUri: 'https://google.com',
    'clientId ': `${process.env.SPOTIFY_CLIENT_ID}`,
    clientSecret: `${process.env.SPOTIFY_CLIENT_SECRET}`,
  });


//array to add music uri
const playlistArray = [];

//adding music to playlist
const addToPlaylist = async (title , artist) => {
    const track = await spotifyApi.searchTracks(`track:${title} artist:${artist}`);
    const trackUri = track.body.tracks.items[0].uri;
    playlistArray.push(trackUri);
    console.log(playlistArray)
     await spotifyApi.addTracksToPlaylist('2anSbUyqv82OQpPR1YZq3C', playlistArray)
     .then(console.log('Added to Playlist'))
     .catch(err => console.log(err));
}

//main function
const main = async () => {
    await getYoutubePlaylist();
    Music.find()
    .then(
        music => {
            music.forEach(
                song => {
                    addToPlaylist(song.title, song.artist)
                }
            )
        }
    )
    .catch(err => console.log(err));
}
//error handling
try{
    main();
} catch{
    err => console.log('error')
}


const port = process.env.PORT || 4000

mongoose.connect('mongodb://localhost:27017/youtubedb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(
    app.listen(port,() => console.log(`listening on port: ${4000}`))
) .catch(
    err => console.log(err, 'not connected! ')
)