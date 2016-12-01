var watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
var config = require("../config.js") // to get our credentials and the attention word from the config.js files
var mic = require('mic');

var speech_to_text = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

var micInstance = mic({ 'rate': '44100', 'channels': '2', 'debug': false, 'exitOnSilence': 6 });
var micInputStream = micInstance.getAudioStream();
micInstance.start();

console.log("TJ is listening, you may speak now.");

var params = {
  content_type: 'audio/l16; rate=44100; channels=2',
  interim_results: true,
  smart_formatting: true,
};

var textStream = 
	micInputStream.pipe(
	speech_to_text.createRecognizeStream(params))
	.setEncoding('utf8');

textStream.on('data', function(user_speech) {
  console.log(user_speech);
});