import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    auth,
    db 
} from '../firebase/config';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para registro
    async function signup(email, password, role, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Guardar información adicional del usuario
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email,
                role,
                ...userData,
                createdAt: new Date().toISOString()
            });

            return userCredential.user;
        } catch (error) {
            throw error;
        }
    }

    // Función para login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Función para logout
    function logout() {
        return signOut(auth);
    }

    // Observer para cambios en el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Obtener datos adicionales del usuario desde Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                setCurrentUser({ ...user, ...userDoc.data() });
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}