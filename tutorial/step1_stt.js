const watson = require('watson-developer-cloud');
const mic = require('mic');
const config = require('../config.js');

const micParams = {
  rate: 44100,
  channels: 2,
  debug: false,
  exitOnSilence: 6
}
const micInstance = mic(micParams);
const micInputStream = micInstance.getAudioStream();
micInstance.start();

console.log('Watson is listening, you may speak now.');

const speechToText = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

const textStream = micInputStream.pipe(
  speechToText.createRecognizeStream({
    content_type: 'audio/l16; rate=44100; channels=2'
  })).setEncoding('utf8');

textStream.on('data', (user_speech_text) => {
  console.log('Watson hears:', user_speech_text);
});