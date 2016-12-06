const watson = require('watson-developer-cloud'); //to connect to Watson developer cloud
const config = require('../config.js') // to get our credentials and the attention word from the config.js files
const prompt = require('prompt');

const conversation = watson.conversation({
  username: config.ConUsername,
  password: config.ConPassword,
  version: 'v1',
  version_date: '2016-07-11'
});

prompt.start();

let context = {};
let converse = () => 
  prompt.get('input', (err, result) => {

    context.emotion = 'anger'; //replace with results from Tone Analzyer
    conversation.message({
      workspace_id: config.ConWorkspace,
      input: {'text': result.input},
      context: context
    }, function(err, response) {
      context = response.context;
      watson_response =  response.output.text[0];
      console.log('Watson says:', watson_response);
    });

    converse();
  })

converse();