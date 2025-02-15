"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "../../../config/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const Login = () => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper to check if user exists in Firestore
  const checkUserInFirestore = async (uid) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists();
  };

  // Email/Password login helper
  const loginHelper = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Sign in with Firebase Auth using email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if the user exists in Firestore
      const exists = await checkUserInFirestore(user.uid);
      if (!exists) {
        // If not found, sign out and show error message
        await signOut(auth);
        setError("User not found in database. Please sign up.");
        setLoading(false);
        return;
      }
      
      console.log("User logged in:", user);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error logging in:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login helper
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if the user exists in Firestore
      const exists = await checkUserInFirestore(user.uid);
      if (!exists) {
        // If not found, sign out and show error message
        await signOut(auth);
        setError("User not found in database. Please sign up.");
        setLoading(false);
        return;
      }
      
      console.log("User logged in with Google:", user);
      router.push("/dashboard");
    } catch (err) {
      console.error("Error logging in with Google:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Log In</h2>
      <form onSubmit={loginHelper} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          {loading ? "Logging In..." : "Log In"}
        </button>
      </form>

      <div className="my-4 text-center">
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          {loading ? "Processing..." : "Log In with Google"}
        </button>
      </div>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <Link href="/signUp" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;