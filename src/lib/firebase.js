import firebase from 'firebase/compat/app'
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_SENDERID,
    appId: process.env.NEXT_PUBLIC_APPID
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const getAuth = () => firebase.auth();
export const getGoogleAuthProvider = () => new firebase.auth.GoogleAuthProvider();

export const getFirestore = () => firebase.firestore();
export const getFromMillis = () => firebase.firestore.Timestamp.fromMillis;
export const getServerTimestamp = () => firebase.firestore.FieldValue.serverTimestamp;
export const getIncrement = () => firebase.firestore.FieldValue.increment;

export const getStorage = () => firebase.storage();
export const getStateChanged = () => firebase.storage.TaskEvent.STATE_CHANGED;