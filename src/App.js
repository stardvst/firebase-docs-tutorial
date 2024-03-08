import React from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
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
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

const ChatMessage = ({ message }) => {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt={'profile pic'} />
      <p>{text}</p>
    </div>
  );
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

  const sendMessage = async (text) => {
    if(!auth.currentUser) {
      console.error("User is not authenticated.");
      return;
    }

    const { uid, photoURL } = auth.currentUser;
    console.log(uid, photoURL, db);

    try {
      await addDoc(collection(db, "messages"), {
        text,
        createdAt: serverTimestamp(),
        uid,
        photoURL
      });
    } catch(error) {
      console.error("Error sending message:", error);
    }

    setFormMessage('');
  }

  const [formMessage, setFormMessage] = useState('');
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    getMessages().then(setMessages).catch(console.error);
  }, []);

  return (
    <React.Fragment>
      <div>
        {messages && messages.map((message, idx) => (<ChatMessage key={idx} message={message} />))}
      </div>

      <form onSubmit={e => {
        e.preventDefault();
        sendMessage(formMessage);
      }}>
        <input type="text" value={formMessage} onChange={e => setFormMessage(e.target.value)} />
        <button type="submit">🕊️</button>
      </form>
    </React.Fragment>
  )
};

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header>
        <h1>⚛️🔥💬</h1>
        {auth.currentUser && <SignOut />}
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
