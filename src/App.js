import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useEffect } from 'react';
import { useState } from 'react';

import { useAuthState } from 'react-firebase-hooks/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBdZahUPvZRzgQgUHyIQ8oFPEZ801QIIRw",
  authDomain: "fb-docs-tutorial.firebaseapp.com",
  projectId: "fb-docs-tutorial",
  storageBucket: "fb-docs-tutorial.appspot.com",
  messagingSenderId: "466768871111",
  appId: "1:466768871111:web:31adc24dcafbc3441c48e2",
  measurementId: "G-30JNWCDW7T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SignIn = () => {
  const singInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(result => {
        console.log("Signed in:", result);
      })
      .catch(err => {
        console.log("Error signing in:", err);
      });
  }
  return <button onClick={singInWithGoogle}>Sign in with Google</button>;
}

const SignOut = () => {
  return auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>;
}

const ChatMessage = ({ message }) => {
  return <p>{message}</p>;
}

const ChatRoom = () => {
  const getMessages = async () => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt'), limit(25));
    const docsSnapshot = await getDocs(q);

    const messages = [];
    docsSnapshot.forEach(doc => {
      const message = doc.data();
      messages.push(message);
    });
    return messages;
  }

  const [messages, setMessages] = useState([]);
  useEffect(() => {
    getMessages().then(setMessages).catch(console.error);
  }, []);

  return (
    <div>
      {messages && messages.map((message, idx) => (<ChatMessage key={idx} message={message.text} />))}
    </div>
  )
};

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
