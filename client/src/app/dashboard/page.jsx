"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../config/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  query,
  where,
  documentId,
} from "firebase/firestore";

// Shadcn UI components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardTitle } from "../../components/ui/card";

function Dashboard() {
  const router = useRouter();
  const user = auth.currentUser;
  
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classroomName, setClassroomName] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  // Redirect if no authenticated user
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch user data (including role and classrooms) from Firestore
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setRole(data.role);
            setUserData(data);
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to fetch user data.");
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // For teachers: fetch classrooms where teacherId === user.uid
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

  // For students: fetch classrooms from userData.classrooms array
  useEffect(() => {
    if (user && role === "student" && userData?.classrooms?.length > 0) {
      const fetchStudentClassrooms = async () => {
        try {
          const classroomsRef = collection(db, "classrooms");
          // Query using documentId in the array of classroom IDs
          const q = query(
            classroomsRef,
            where(documentId(), "in", userData.classrooms)
          );
          const querySnapshot = await getDocs(q);
          const classroomList = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
          }));
          setClassrooms(classroomList);
        } catch (err) {
          console.error("Error fetching student classrooms:", err);
          setError("Failed to load classrooms.");
        }
      };
      fetchStudentClassrooms();
    } else if (role === "student") {
      // If the student has no classrooms enrolled.
      setClassrooms([]);
    }
  }, [user, role, userData]);

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
      
      // Refresh classrooms list for teacher
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
    console.log("Navigating to classroom:", classroomId);
    router.push(`/classroom/${classroomId}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {role === "teacher" ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Teacher Dashboard</h2>
          <form
            onSubmit={handleCreateClassroom}
            className="flex flex-col sm:flex-row gap-4 mb-6 items-center"
          >
            <div className="flex flex-col w-full">
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
            <h3 className="text-xl font-semibold mb-3">Your Classrooms</h3>
            {classrooms.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {classrooms.map((room) => (
                  <Card
                    key={room.classroomId}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => handleClassroomClick(room.classroomId)}
                  >
                    <CardTitle>{room.name}</CardTitle>
                    <CardContent className="text-sm text-gray-600">
                      <p>
                        <strong>ID:</strong> {room.classroomId}
                      </p>
                      <p>
                        <strong>Teacher:</strong> {room.teacherId}
                      </p>
                      <p>
                        <strong>Students:</strong>{" "}
                        {room.students?.length > 0
                          ? room.students.join(", ")
                          : "None"}
                      </p>
                      <p>
                        <strong>Tests:</strong>{" "}
                        {room.tests?.length > 0 ? room.tests.join(", ") : "None"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No classrooms found.</p>
            )}
          </div>
        </div>
      ) : role === "student" ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Student Dashboard</h2>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Classrooms</h3>
            {classrooms.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {classrooms.map((room) => (
                  <Card
                    key={room.classroomId}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => handleClassroomClick(room.classroomId)}
                  >
                    <CardTitle>{room.name}</CardTitle>
                    <CardContent className="text-sm text-gray-600">
                      <p>
                        <strong>ID:</strong> {room.classroomId}
                      </p>
                      <p>
                        <strong>Teacher:</strong> {room.teacherId}
                      </p>
                      <p>
                        <strong>Students:</strong>{" "}
                        {room.students?.length > 0
                          ? room.students.join(", ")
                          : "None"}
                      </p>
                      <p>
                        <strong>Tests:</strong>{" "}
                        {room.tests?.length > 0 ? room.tests.join(", ") : "None"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You are not enrolled in any classrooms.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Role not defined.</p>
      )}
    </div>
  );
}

export default Dashboard;
