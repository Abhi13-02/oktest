"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/config/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

function Dashboard() {
  const router = useRouter();
  const user = auth.currentUser;
  
  const [role, setRole] = useState(null); // "teacher" or "student"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For teacher: manage classroom creation and live updates
  const [classroomName, setClassroomName] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch the current user's role from Firestore
  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setRole(userData.role);
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setError("Failed to fetch user data.");
        } finally {
          setLoading(false);
        }
      };
      fetchUserRole();
    }
  }, [user]);

  // For teachers: subscribe to live updates of their classrooms
  useEffect(() => {
    if (user && role === "teacher") {
      const classroomsRef = collection(db, "classrooms");
      const q = query(
        classroomsRef,
        where("teacherId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const classroomList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setClassrooms(classroomList);
        },
        (err) => {
          console.error("Error fetching classrooms:", err);
          setError("Failed to load classrooms.");
        }
      );
      return () => unsubscribe();
    }
  }, [user, role]);

  // Handler for creating a new classroom (for teachers)
  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!classroomName.trim()) return;
    try {
      await addDoc(collection(db, "classrooms"), {
        teacherId: user.uid,
        classroomName: classroomName,
        createdAt: new Date(),
      });
      setClassroomName("");
      setError(null);
    } catch (err) {
      console.error("Error creating classroom:", err);
      setError("Failed to create classroom.");
    }
  };

  if (loading) return <div>Loading...</div>;


  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {role === "teacher" ? (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Teacher Dashboard</h2>
          <form onSubmit={handleCreateClassroom} className="flex gap-2 mb-4">
            <div className="flex flex-col flex-grow">
              <Label htmlFor="classroomName" className="mb-1">
                Classroom Name
              </Label>
              <Input
                id="classroomName"
                type="text"
                placeholder="Enter classroom name"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
              />
            </div>
            <Button type="submit" className="whitespace-nowrap">
              Create Classroom
            </Button>
          </form>
          <div>
            <h3 className="text-xl font-semibold mb-2">Your Classrooms</h3>
            {classrooms.length > 0 ? (
              <div className="grid gap-4">
                {classrooms.map((room) => (
                  <Card key={room.id} className="p-4">
                    <CardTitle>{room.classroomName}</CardTitle>
                    <CardContent>
                      <p>
                        Created at:{" "}
                        {new Date(room.createdAt.seconds * 1000).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No classrooms found.</p>
            )}
          </div>
        </div>
      ) : role === "student" ? (
        <div>
          <h2 className="text-2xl font-semibold">Student Dashboard</h2>
          <p>Welcome to your dashboard, student!</p>
          {/* Add additional student-specific content here */}
        </div>
      ) : (
        <p>Role not defined.</p>
      )}
    </div>
  );
}

export default Dashboard;
