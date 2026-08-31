const firebase = require('firebase/compat/app');
require('firebase/compat/database');

const config = {
    apiKey: 'AIzaSyBMuMzSDklOoE5dfjirxKJaw2m5ru-TkP8',
    databaseURL: 'https://elkhotta-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'elkhotta'
};
firebase.initializeApp(config);
const db = firebase.database();

db.ref('Exams').once('value').then(snap => {
    let count = 0;
    const updates = {};
    snap.forEach(child => {
        // If it's a direct child exam (old format)
        const val = child.val();
        if (val && typeof val === 'object' && !Array.isArray(val) && (val.title || val.name || val.examName)) {
            updates[child.key] = null;
            count++;
        }
    });

    if (count > 0) {
        db.ref('Exams').update(updates).then(() => {
            console.log('DELETED ' + count + ' OLD EXAMS');
            process.exit(0);
        }).catch(err => {
            console.error('ERROR:', err);
            process.exit(1);
        });
    } else {
        console.log('NO OLD EXAMS FOUND');
        process.exit(0);
    }
});
