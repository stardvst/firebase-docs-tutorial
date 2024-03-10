const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const Filter = require('bad-words');
const filter = new Filter();

exports.detectEvilUsers = functions.firestore.document('/messages/{msgId}').onCreate((snapshot, context) => {
  const message = snapshot.data();
  const text = message.text;
  const uid = message.uid;
  console.log('New message created:', text, uid);

  if(filter.isProfane(text)) {
    const cleaned = filter.clean(text);
    console.log(cleaned);
  }
});
