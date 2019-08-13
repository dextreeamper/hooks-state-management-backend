const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
const dateFns = require('date-fns/format');
let config = require('./config/index.js');
const songs = require('./models/Song');

class HandlerGenerator {
  login (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    console.log(req.body);
    // For the given username fetch user from DB
    let mockedUsername = 'admin';
    let mockedPassword = 'password';

    if (username && password) {
      if (username === mockedUsername && password === mockedPassword) {
        let token = jwt.sign({username: username},
          config.secret,
          { expiresIn: '24h' // expires in 24 hours
          }
        );
        // return the JWT token for the future API calls
        res.json({
          success: true,
          message: 'Authentication successful!',
          token: token,
          user: {
            firstName: "Admin",
            lastName: "User"
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Incorrect username or password'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Authentication failed! Please check the request'
      });
    }
  }
  index (req, res) {
    return res.json({
      success: true,
      message: 'Index page'
    });
  }

  getSongs (req, res) {
    return res.json(songs);
  }

  getOneSong (req, res) {
    const { id } = req.params;
    const songIndex = songs.findIndex(s => s.id == id);
    console.log(songIndex);
    if (songIndex === -1) return res.status(404).json({message: 'Song not found'});
    const song = songs[songIndex];
    return res.status(201).json(song);
  }

  addSong (req, res) {
    const song = {
      id: songs[songs.length - 1].id + 1,
      name: req.body.title,
      albumArt: req.body.imageUrl,
      artist: req.body.artist,
      rating: 5,
      createdAt: dateFns(Date.now(), "YYYY-MM-ddTHH:mm:ss"),
      updatedAt: dateFns(Date.now(), "YYYY-MM-ddTHH:mm:ss")
    };

    songs.push(song);
    return res.status(201).json(song);
  }

  editSong (req, res) {
    const { id } = req.params;
    const songIndex = songs.findIndex(s => s.id == id);
    console.log(songIndex);
    if (songIndex === -1) return res.status(404).json({message: 'Song not found'});
    const song = songs[songIndex];

    const updatedSong = {
      id: song.id,
      name: req.body.title,
      albumArt: req.body.imageUrl,
      artist: req.body.artist,
      rating: song.rating,
      createdAt: song.createdAt,
      updatedAt: dateFns(Date.now(), "YYYY-MM-ddTHH:mm:ss")
    };
    songs[songIndex] = updatedSong;
    return res.status(201).json(updatedSong);
  };

  deleteSong (req, res) {
    const { id } = req.params;
    const songIndex = songs.findIndex(s => s.id == id);
    console.log(songIndex);
    if (songIndex === -1) return res.status(404).json({message: 'Song not found'});
    songs.splice(songIndex, 1);
    return res.status(200).json({
      message: 'Song deleted successfully'
    });
  }
}

// Starting point of the server
function main () {
  let app = express(); // Export app for other routes to use
  app.use(cors());
  let handlers = new HandlerGenerator();
  const port = process.env.PORT || 8000;
  app.use(bodyParser.urlencoded({ // Middleware
    extended: true
  }));
  app.use(bodyParser.json());
  // Routes & Handlers
  app.get('/api/', handlers.index);
  app.get('/api/songs/:id', handlers.getOneSong);
  app.get('/api/songs', handlers.getSongs);
  app.post('/api/songs', handlers.addSong);
  app.put('/api/songs/:id', handlers.editSong);
  app.delete('/api/songs/:id', handlers.deleteSong);
  app.listen(port, () => console.log(`Server is listening on port: ${port}`));
}

main();
