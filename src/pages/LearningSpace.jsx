import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

import { useAuth } from "../context/AuthContext";

export default function LearningSpace() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [vocab, setVocab] = useState("");

  useEffect(() => {
    if (!profile?.level) return;
    const q = query(collection(db, `spaces/${profile.level}/posts`), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    await addDoc(collection(db, `spaces/${profile.level}/posts`), {
      content: text,
      vocabulary: vocab.split(','),
      author: profile.cityName,
      timestamp: serverTimestamp(),
    });
    
    // Logic here to update user streak/vocab count in profile...
    setText(""); setVocab("");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Level {profile?.level} Space</h1>
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow space-y-3">
          <textarea 
            className="w-full border p-2 rounded h-32" 
            placeholder="Write in Polish..." 
            value={text} 
            onChange={(e) => setText(e.target.value)}
          />
          <input 
            className="w-full border p-2 rounded" 
            placeholder="New vocabulary (comma separated)" 
            value={vocab}
            onChange={(e) => setVocab(e.target.value)}
          />
          <button className="w-full bg-red-600 text-white py-2 rounded">Submit Progress</button>
        </form>
      </div>
      
      <div className="md:w-1/3 bg-gray-100 p-4 rounded h-[500px] overflow-y-auto">
        <h3 className="font-bold mb-2">Live Writing Feed</h3>
        {posts.map(p => (
          <div key={p.id} className="bg-white p-2 mb-2 rounded shadow-sm text-sm">
            <span className="text-red-500 font-bold">{p.author}:</span> {p.content}
          </div>
        ))}
      </div>
    </div>
  );
}