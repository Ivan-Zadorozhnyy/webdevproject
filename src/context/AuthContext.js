import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (username, password) => {
        try {
            const response = await fakeLoginApiCall(username, password);
            if (response.token) {
                setUser({ username, token: response.token });
                localStorage.setItem('userToken', response.token); // Simulated token storage
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userToken'); // Clear token storage
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


#DYMMY
const fakeLoginApiCall = async (username, password) => {
    return { token: "fake-jwt-token-for-" + username };
};