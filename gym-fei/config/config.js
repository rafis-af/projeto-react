// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvhkBtcx1h9oNUNJShIzY8chj3r-vDRek",
  authDomain: "gym-fei.firebaseapp.com",
  databaseURL: "https://gym-fei-default-rtdb.firebaseio.com",
  projectId: "gym-fei",
  storageBucket: "gym-fei.firebasestorage.app",
  messagingSenderId: "764258833226",
  appId: "1:764258833226:web:2332f7d1c67b425cb967b3"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;