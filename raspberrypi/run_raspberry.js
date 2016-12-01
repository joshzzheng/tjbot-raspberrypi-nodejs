var watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
var config = require("./config.js") // to get our credentials and the attention word from the config.js files
var exec = require('child_process').exec;
var fs = require('fs');
var player = require('play-sound')(opts = {})

var speech_to_text = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

var conversation = watson.conversation({
  username: config.ConUsername,
  password: config.ConPassword,
  version: 'v1',
  version_date: '2016-07-11'
});

var text_to_speech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

var attentionWord = config.attentionWord; //you can change the attention word in the config file

var mic = require('mic');
var micInstance = mic({ 'rate': '44100', 'channels': '2', 'debug': false, 'exitOnSilence': 6 });
var micInputStream = micInstance.getAudioStream();
micInstance.start();
console.log("TJ is listening, you may speak now.");

var textStream = micInputStream.pipe(speech_to_text.createRecognizeStream({
  content_type: 'audio/l16; rate=44100; channels=2',
  interim_results: true,
  keywords: [attentionWord],
  smart_formatting: 'true',
  keywords_threshold: 0.5
})).setEncoding('utf8');


var context = null;
var conversation_response = "";

textStream.on('data', function(speech) {
  speech = speech.toLowerCase();
  if (context) {
    console.log("Recorded: " + speech);
    conversation.message({
      workspace_id: config.ConWorkspace,
      input: {'text': speech},
      context: context
    },  function(err, response) {
      if (err) {
        console.log('error:', err);
      } else {
        context = response.context;
        conversation_response =  response.output.text[0]  ;
        if (conversation_response != undefined ){
          var params = {
            text: response.output.text[0],
            voice: config.voice,
            accept: 'audio/wav'
          };

          console.log("Result from conversation:", conversation_response);
          /*********************************************************************
          Step #5: Speak out the response
          *********************************************************************
          In this step, we text is sent out to Watsons Text to Speech service and result is piped to wave file.
          Wave files are then played using alsa (native audio) tool.
          */
          
          text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {
            //var create_audio = exec('aplay output.wav', function (error, stdout, stderr) {
            //  if (error !== null) {
            //    console.log('exec error: ' + error);
            //  }
            //});
            player.play('output.wav');
          });
        } else {
          console.log("The response (output) text from your conversation is empty. Please check your conversation flow \n" + JSON.stringify( response))
        }

      }
    })    
  } else if (!context && speech.indexOf(attentionWord.toLowerCase()) >= 0) {
    console.log("msg sent to conversation:" ,speech);
    conversation.message({
      workspace_id: config.ConWorkspace,
      input: {'text': speech},
      context: context
    },  function(err, response) {
      if (err) {
        console.log('error:', err);
      } else {
        context = response.context;
        conversation_response =  response.output.text[0]  ;
        if (conversation_response != undefined ){
          var params = {
            text: response.output.text[0],
            voice: config.voice,
            accept: 'audio/wav'
          };

          console.log("Result from conversation:", conversation_response);
          /*********************************************************************
          Step #5: Speak out the response
          *********************************************************************
          In this step, we text is sent out to Watsons Text to Speech service and result is piped to wave file.
          Wave files are then played using alsa (native audio) tool.
          */
          
          text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav')).on('close', function() {
            //var create_audio = exec('aplay output.wav', function (error, stdout, stderr) {
            //  if (error !== null) {
            //    console.log('exec error: ' + error);
            //  }
            //});
            player.play('output.wav');
          });
        } else {
          console.log("The response (output) text from your conversation is empty. Please check your conversation flow \n" + JSON.stringify( response))
        }

      }

    })
  } else {
    console.log("Waiting to hear", attentionWord);
  }
});

textStream.on('error', function(err) {
  console.log(' ===== An Error has occurred ===== \nYou may have exceeded your payload quota.\n ' + JSON.stringify(err) + "\n Press <ctrl>+C to exit.") ; // handle errors
});
