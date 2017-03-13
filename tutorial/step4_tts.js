const watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
const config = require('../config.js') // to get our credentials and the attention word from the config.js files
const fs = require('fs');
const player = require('play-sound')(opts = {})

const text_to_speech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

let text = 'Hey guys, I am Watson'

const params = {
  text: text,
  voice: config.voice,
  accept: 'audio/wav'
};

text_to_speech.synthesize(params)
  .pipe(fs.createWriteStream('output.wav'))
  .on('close', () => {
    player.play('output.wav');
  });