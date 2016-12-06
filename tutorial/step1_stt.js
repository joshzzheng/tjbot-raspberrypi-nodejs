const watson = require('watson-developer-cloud');
const config = require('../config.js');
const mic = require('mic');

const micParams = {
  rate: '44100',
  channels: '2',
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

const sttParams = {
  content_type: 'audio/l16; rate=44100; channels=2',
  interim_results: false,
  smart_formatting: true,
};

const textStream = 
	micInputStream.pipe(
	  speechToText.createRecognizeStream(sttParams))
	.setEncoding('utf8');

textStream.on('data', function(user_speech) {
  console.log('Watson hears:', user_speech);
});