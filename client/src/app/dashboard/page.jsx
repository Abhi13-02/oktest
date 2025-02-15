"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/config/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  query,
  where,
} from "firebase/firestore";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

function Dashboard() {
  const router = useRouter();
  const user = auth.currentUser;
  
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classroomName, setClassroomName] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

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

  useEffect(() => {
    if (user && role === "teacher") {
      const fetchClassrooms = async () => {
        try {
          const classroomsRef = collection(db, "classrooms");
          const q = query(classroomsRef, where("teacherId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const classroomList = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
          }));
          setClassrooms(classroomList);
        } catch (err) {
          console.error("Error fetching classrooms:", err);
          setError("Failed to load classrooms.");
        }
      };
      fetchClassrooms();
    }
  }, [user, role]);

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    if (!classroomName.trim()) return;
    try {
      const newDocRef = doc(collection(db, "classrooms"));
      await setDoc(newDocRef, {
        classroomId: newDocRef.id,
        name: classroomName,
        teacherId: user.uid,
        students: [],
        tests: [],
      });
      setClassroomName("");
      setError(null);
      
      const classroomsRef = collection(db, "classrooms");
      const q = query(classroomsRef, where("teacherId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const classroomList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      setClassrooms(classroomList);
    } catch (err) {
      console.error("Error creating classroom:", err);
      setError("Failed to create classroom.");
    }
  };

  const handleClassroomClick = (classroomId) => {
    console.log('Navigating to classroom:', classroomId);
    router.push(`/classroom/${classroomId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {role === "teacher" ? (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Teacher Dashboard</h2>
          <form onSubmit={handleCreateClassroom} className="flex gap-2 mb-4 items-center">
            <div className="flex flex-col flex-grow justify-center items-center">
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
                  <Card 
                    key={room.classroomId} 
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => handleClassroomClick(room.classroomId)}
                  >
                    <CardTitle>{room.name}</CardTitle>
                    <CardContent>
                      <p>Classroom ID: {room.classroomId}</p>
                      <p>Teacher ID: {room.teacherId}</p>
                      <p>
                        Students: {room.students?.length > 0 ? room.students.join(", ") : "None"}
                      </p>
                      <p>
                        Tests: {room.tests.length > 0 ? room.tests.join(", ") : "None"}
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
        </div>
      ) : (
        <p>Role not defined.</p>
      )}
    </div>
  );
}

export default Dashboard;