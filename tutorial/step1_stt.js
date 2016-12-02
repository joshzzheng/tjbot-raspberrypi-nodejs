var watson = require('watson-developer-cloud');
var config = require('../config.js');
var mic = require('mic');

var speechToText = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

var micParams = {
  'rate': '44100',
  'channels': '2',
  'debug': false,
  'exitOnSilence': 6
}
var micInstance = mic(micParams);
var micInputStream = micInstance.getAudioStream();
micInstance.start();

console.log('Watson is listening, you may speak now.');

var sttParams = {
  content_type: 'audio/l16; rate=44100; channels=2',
  interim_results: true,
  smart_formatting: true,
};

var textStream = 
	micInputStream.pipe(
	speechToText.createRecognizeStream(sttParams))
	.setEncoding('utf8');

textStream.on('data', function(user_speech) {
  console.log('Watson hears:', user_speech);
});