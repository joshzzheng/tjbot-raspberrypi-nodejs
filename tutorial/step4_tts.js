var watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
var config = require("./config.js") // to get our credentials and the attention word from the config.js files
var fs = require('fs');
var player = require('play-sound')(opts = {})

var text_to_speech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

text = "Hello World"

var params = {
  text: text,
  voice: config.voice,
  accept: 'audio/wav'
};

text_to_speech.synthesize(params)
.pipe(fs.createWriteStream('output.wav'))
.on('close', function() {
  player.play('output.wav');
});