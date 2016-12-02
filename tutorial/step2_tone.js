var watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
var config = require('./config.js') // to get our credentials and the attention word from the config.js files

var tone_analyzer = watson.tone_analyzer({
  username: config.ToneUsername,
  password: config.TonePassword,
  version: 'v3',
  version_date: '2016-05-19'
});

var text = 'I love you watson'
tone_analyzer.tone({text: text}, function(err, tone) {
  console.log(JSON.stringify(tone, null, 2));
});

/*
var max_score = 0;
var detectedEmotion = null;
tone_analyzer.tone({text: text}, function(err, tone) {
  var tones = tone.document_tone.tone_categories[0].tones;
  for (var i=0; i<tones.length; i++) {
    if (tones[i].score > max_score){
      max_score = tones[i].score;
      detectedEmotion = tones[i].tone_id;
    }
  }
  console.log('Detected Emotion:", detectedEmotion);
});
*/