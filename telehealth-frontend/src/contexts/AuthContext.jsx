// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, signup as apiSignupForService } from '../api/authService'; // Renamed to avoid conflict
import { getMyProfile } from '../api/userService';
import api from '../api'; // For direct access to axios instance to update headers

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async (currentToken) => {
        if (currentToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
            try {
                const profile = await getMyProfile();
                setUser(profile);
                setRole(profile.role);
                setIsAuthenticated(true);
                return profile; // Return profile on success
            } catch (error) {
                console.error("Failed to load user profile with token:", error);
                localStorage.removeItem('authToken');
                setToken(null);
                setUser(null);
                setRole(null);
                setIsAuthenticated(false);
                delete api.defaults.headers.common['Authorization'];
                throw error; // Re-throw to indicate failure
            }
        }
        return null; // No token, no user
    }, []);


    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                setToken(storedToken); // Set token state
                try {
                    await loadUser(storedToken);
                } catch (error) {
                    // Error already handled in loadUser
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, [loadUser]);


    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const { token: newToken, ...userData } = await apiLogin(credentials); // Assuming login returns token and user data
            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            // Instead of calling getMyProfile again if login returns user data:
            if (userData && userData.username) { // Check if userData is valid
                setUser(userData);
                setRole(userData.role);
                setIsAuthenticated(true);
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            } else { // Fallback if login doesn't return full user data
                await loadUser(newToken);
            }
        } catch (error) {
            console.error("Login failed", error);
            // Clear auth state on login failure
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            setRole(null);
            setIsAuthenticated(false);
            delete api.defaults.headers.common['Authorization'];
            throw error; // Re-throw to handle in component
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (userData) => { // This is the signup exposed by AuthContext
        setIsLoading(true);
        try {
            // Call the authService's signup function
            await apiSignupForService(userData);
            // After successful signup, user usually needs to login.
            // Or, if your signup endpoint returns a token and logs the user in:
            // const { token: newToken, ...newUserData } = await apiSignupForService(userData);
            // localStorage.setItem('authToken', newToken);
            // setToken(newToken);
            // await loadUser(newToken); // This will set user, role, isAuthenticated
        } catch (error) {
            console.error("Signup failed in AuthContext", error);
            throw error; // Re-throw to be handled in the component
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
        delete api.defaults.headers.common['Authorization'];
        // Optionally redirect here or let the component handle redirection
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, role, login, signup, logout, isLoading, loadUser }}>
            {!isLoading && children}         </AuthContext.Provider>
    );
};