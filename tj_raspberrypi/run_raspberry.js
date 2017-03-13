const watson = require('watson-developer-cloud');
const config = require('./config.js')
const exec = require('child_process').exec;
const fs = require('fs');
const mic = require('mic');
const probe = require('node-ffprobe');

const attentionWord = config.attentionWord;

/******************************************************************************
* Create Watson Services
*******************************************************************************/
const speechToText = watson.speech_to_text({
  username: config.STTUsername,
  password: config.STTPassword,
  version: 'v1'
});

const toneAnalyzer = watson.tone_analyzer({
  username: config.ToneUsername,
  password: config.TonePassword,
  version: 'v3',
  version_date: '2016-05-19'
});

const conversation = watson.conversation({
  username: config.ConUsername,
  password: config.ConPassword,
  version: 'v1',
  version_date: '2016-07-11'
});

const textToSpeech = watson.text_to_speech({
  username: config.TTSUsername,
  password: config.TTSPassword,
  version: 'v1'
});

/******************************************************************************
* Configuring the Microphone
*******************************************************************************/
const micParams = { 
  rate: 44100, 
  channels: 2, 
  debug: false, 
  exitOnSilence: 6
}
const micInstance = mic(micParams);
const micInputStream = micInstance.getAudioStream();

let pauseDuration = 0;
micInputStream.on('pauseComplete', ()=> {
  console.log('Microphone paused for', pauseDuration, 'seconds.');
  setTimeout(function() {
      micInstance.resume();
      console.log('Microphone resumed.')
  }, Math.round(pauseDuration * 1000)); //Stop listening when speaker is talking
});

micInstance.start();
console.log('TJ is listening, you may speak now.');

/******************************************************************************
* Speech To Text
*******************************************************************************/
const textStream = micInputStream.pipe(
  speechToText.createRecognizeStream({
    content_type: 'audio/l16; rate=44100; channels=2',
  })).setEncoding('utf8');

/******************************************************************************
* Get Emotional Tone
*******************************************************************************/
const getEmotion = (text) => {
  return new Promise((resolve) => {
    let maxScore = 0;
    let emotion = null;
    toneAnalyzer.tone({text: text}, (err, tone) => {
      let tones = tone.document_tone.tone_categories[0].tones;
      for (let i=0; i<tones.length; i++) {
        if (tones[i].score > maxScore){
          maxScore = tones[i].score;
          emotion = tones[i].tone_id;
        }
      }
      resolve({emotion, maxScore});
    })
  })
};


/******************************************************************************
* Text To Speech
*******************************************************************************/
const speakResponse = (text) => {
  const params = {
    text: text,
    voice: config.voice,
    accept: 'audio/wav'
  };
  textToSpeech.synthesize(params)
  .pipe(fs.createWriteStream('output.wav'))
  .on('close', () => {
    probe('output.wav', (err, probeData) => {
      pauseDuration = probeData.format.duration + 0.2;
      micInstance.pause();
      exec('aplay output.wav', (error, stdout, stderr) => {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    });
  });
}

/******************************************************************************
* Conversation
******************************************************************************/
let start_dialog = false;
let context = {};
let watson_response = '';

speakResponse('Hi there, I am awake.');
textStream.on('data', (user_speech_text) => {
  user_speech_text = user_speech_text.toLowerCase();
  console.log('Watson hears: ', user_speech_text);
  if (user_speech_text.indexOf(attentionWord.toLowerCase()) >= 0) {
    start_dialog = true;
  }

  if (start_dialog) {
    getEmotion(user_speech_text).then((detectedEmotion) => {
      context.emotion = detectedEmotion.emotion;
      conversation.message({
        workspace_id: config.ConWorkspace,
        input: {'text': user_speech_text},
        context: context
      }, (err, response) => {
        context = response.context;
        watson_response =  response.output.text[0];
        speakResponse(watson_response);
        console.log('Watson says:', watson_response);
        if (context.system.dialog_turn_counter == 2) {
          context = {};
          start_dialog = false;
        }
      });
    });  
  } else {
    console.log('Waiting to hear the word "', attentionWord, '"');
  }
});