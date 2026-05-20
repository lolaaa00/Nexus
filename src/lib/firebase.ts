import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAQPpvIutXtwMuEwPsG2fd3-xp5r6pJwc0',
  authDomain: 'rialaii.firebaseapp.com',
  databaseURL: 'https://rialaii-default-rtdb.firebaseio.com',
  projectId: 'rialaii',
  storageBucket: 'rialaii.firebasestorage.app',
  messagingSenderId: '845743912736',
  appId: '1:845743912736:web:6e469ce3cd3eb772844945',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
