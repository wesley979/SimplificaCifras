import React, { createContext, useState, useEffect } from 'react';
import { auth, loginUser, registerUser, logoutUser, onAuthChange, db, doc, getDoc } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isMaster, setIsMaster] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      if (currentUser) {
        try {
          // Atualiza informações do usuário logado
          await currentUser.reload();

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || '',
          });

          // Busca dados adicionais no Firestore
          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setIsMaster(userData.isMaster === true);
          } else {
            setIsMaster(false);
          }
        } catch (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          setIsMaster(false);
        }
      } else {
        setUser(null);
        setIsMaster(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => loginUser(email, password);
  const register = (email, password) => registerUser(email, password); // só registra, não muda estado
  const logout = async () => {
    await logoutUser();
    setUser(null);
    setIsMaster(false);
  };

  return (
    <AuthContext.Provider value={{ user, isMaster, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
