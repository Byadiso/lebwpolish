// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react"; // 1. Added useContext
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
export const AuthContext = createContext(null);

// 2. Add this custom hook here!
export const useAuth = () => {
  return useContext(AuthContext);
};
export const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));
  useEffect(() => {
    if (!auth) return;
    let stopProfile = () => {};
    const unsubscribe = onAuthStateChanged(auth, authUser => {
      stopProfile();
      setUser(authUser);
      setProfile(null);
      setLoading(false);
      if (authUser) {
        stopProfile = onSnapshot(doc(db, "users", authUser.uid), snap => {
          setProfile(snap.exists() ? snap.data() : null);
        }, error => console.warn('Profile could not sync:', error.code));
      }
    }, () => setLoading(false));
    return () => {
      unsubscribe();
      stopProfile();
    };
  }, []);
  return <AuthContext.Provider value={{
    user,
    profile,
    loading
  }}>
      {loading ? <div className="app-loading" role="status">Opening your learning space…</div> : children}
    </AuthContext.Provider>;
};
