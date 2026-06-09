import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDiAkFMiGv-BfuWwFrWz01DKC5F6tCsbt4",
  authDomain: "lmz-app-1bf53.firebaseapp.com",
  projectId: "lmz-app-1bf53",
  storageBucket: "lmz-app-1bf53.firebasestorage.app",
  messagingSenderId: "563468380035",
  appId: "1:563468380035:web:f368983bafef492878f8b6"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
