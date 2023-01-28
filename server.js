var express = require('express');
var cors = require('cors');
var fetch = require("node-fetch").default;
var app = express();
// var WORDS = require("./words.js")


app.use(cors())

app.get('/getWord', function (req, res, next) {
    fetch("https://random-word-api.herokuapp.com/word?number=1&length=5").then((response) => {
        return response.json();
    }).then((data) => {
        answer = data[0];
        console.log(answer);
        res.send(answer);
    }).catch((err) => {
        // var randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        res.send('TESTS');
        // res.send(randomWord);
    });
});


app.listen(80, function () {
    console.log('CORS-enabled web server listening on port 80')
})