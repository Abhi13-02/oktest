"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/config/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const SignUp = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // New state for role selection (default is "student")
  const [role, setRole] = useState("student");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Email/Password sign-up helper
  const signUpHelper = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the display name
      await updateProfile(user, { displayName });

      // Save user data in Firestore, including the selected role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email: user.email,
        role, // Store the role field (teacher or student)
        createdAt: new Date(),
      });

      console.log("User signed up and stored in Firestore.");

      // Redirect to /dashboard after successful sign-up
      router.push("/dashboard");
    } catch (err) {
      console.error("Error signing up: ", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google sign-up helper
  const signUpWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        // Save user data in Firestore, including the selected role
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          role, // Store the role field (teacher or student)
          createdAt: new Date(),
        });
      }

      console.log("User signed up with Google and stored in Firestore.");

      // Redirect to /dashboard after successful sign-up
      router.push("/dashboard");
    } catch (err) {
      console.error("Error signing up with Google: ", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      <form onSubmit={signUpHelper} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
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
        {/* Role selection */}
        <div>
          <p className="block text-sm font-medium text-gray-700">Role</p>
          <div className="flex space-x-4 mt-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === "student"}
                onChange={(e) => setRole(e.target.value)}
                className="mr-1"
              />
              Student
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === "teacher"}
                onChange={(e) => setRole(e.target.value)}
                className="mr-1"
              />
              Teacher
            </label>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      <div className="my-4 text-center">
        <button
          onClick={signUpWithGoogle}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          {loading ? "Processing..." : "Sign Up with Google"}
        </button>
      </div>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;