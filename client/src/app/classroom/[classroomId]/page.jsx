'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Clock, CheckCircle, Play, UserMinus } from "lucide-react";
import { db, auth } from '@/config/firebase'; 
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot 
} from 'firebase/firestore';

const ClassroomPage = ({ params }) => {
  const { classroomId } = params;
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tests, setTests] = useState({
    upcoming: [],
    live: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);

  // Check if current user is the teacher of this classroom
  useEffect(() => {
    console.log('Starting auth check...');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        setCurrentUser(user);
        
        if (classroom?.teacherId === user.uid) {
          console.log('User is the teacher of this classroom');
          setIsTeacher(true);
        } else {
          console.log('User is not the teacher of this classroom');
          setIsTeacher(false);
        }
      } else {
        console.log('No authenticated user');
        setCurrentUser(null);
        setIsTeacher(false);
      }
    });

    return () => unsubscribe();
  }, [classroom]);

  // Fetch classroom data
  useEffect(() => {
    if (!classroomId) {
      console.log('No classroomId provided');
      return;
    }

    console.log('Fetching classroom data for:', classroomId);
    const classroomRef = doc(db, 'classrooms', classroomId);
    const unsubscribe = onSnapshot(classroomRef, async (docSnap) => {
      if (docSnap.exists()) {
        const classroomData = docSnap.data();
        console.log('Classroom data received:', classroomData);
        setClassroom(classroomData);
        
        // Fetch students details
        if (classroomData.students?.length) {
          console.log('Fetching students data...');
          try {
            const studentsQuery = query(
              collection(db, 'users'),
              where('userId', 'in', classroomData.students)
            );
            const studentDocs = await getDocs(studentsQuery);
            const studentsData = studentDocs.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            console.log('Students data fetched:', studentsData.length, 'students');
            setStudents(studentsData);
          } catch (error) {
            console.error('Error fetching students:', error);
          }
        } else {
          console.log('No students in classroom');
          setStudents([]);
        }

        // Fetch tests
        if (classroomData.tests?.length) {
          console.log('Fetching tests data...');
          try {
            const testsQuery = query(
              collection(db, 'tests'),
              where('testId', 'in', classroomData.tests)
            );
            const testDocs = await getDocs(testsQuery);
            const testsData = testDocs.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Categorize tests
            const now = new Date();
            const categorizedTests = {
              upcoming: testsData.filter(test => new Date(test.startTime) > now),
              live: testsData.filter(test => {
                const startTime = new Date(test.startTime);
                const endTime = new Date(startTime.getTime() + test.duration * 60000);
                return startTime <= now && now <= endTime;
              }),
              completed: testsData.filter(test => {
                const startTime = new Date(test.startTime);
                const endTime = new Date(startTime.getTime() + test.duration * 60000);
                return now > endTime;
              })
            };
            console.log('Tests categorized:', categorizedTests);
            setTests(categorizedTests);
          } catch (error) {
            console.error('Error fetching tests:', error);
          }
        } else {
          console.log('No tests in classroom');
        }
      } else {
        console.log('Classroom not found');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [classroomId]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!isTeacher) {
      console.log('Unauthorized attempt to add student');
      alert('Only teachers can add students to the classroom');
      return;
    }

    console.log('Attempting to add student:', newStudentEmail);
    try {
      // Check if user exists
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', newStudentEmail)
      );
      const userDocs = await getDocs(userQuery);
      
      if (userDocs.empty) {
        console.log('No user found with email:', newStudentEmail);
        alert('No user found with this email');
        return;
      }

      const userData = userDocs.docs[0];
      const userId = userData.id;
      console.log('Found user:', userId);

      // Check if student is already in classroom
      if (classroom.students?.includes(userId)) {
        console.log('Student already in classroom');
        alert('This student is already in the classroom');
        return;
      }

      // Update classroom
      const classroomRef = doc(db, 'classrooms', classroomId);
      await updateDoc(classroomRef, {
        students: arrayUnion(userId)
      });
      console.log('Added student to classroom');

      // Update user's classrooms
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        classrooms: arrayUnion(classroomId)
      });
      console.log('Added classroom to student profile');

      setNewStudentEmail('');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!isTeacher) {
      console.log('Unauthorized attempt to remove student');
      alert('Only teachers can remove students from the classroom');
      return;
    }

    console.log('Attempting to remove student:', studentId);
    try {
      const classroomRef = doc(db, 'classrooms', classroomId);
      await updateDoc(classroomRef, {
        students: arrayRemove(studentId)
      });
      console.log('Removed student from classroom');

      const userRef = doc(db, 'users', studentId);
      await updateDoc(userRef, {
        classrooms: arrayRemove(classroomId)
      });
      console.log('Removed classroom from student profile');
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Failed to remove student');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{classroom?.name}</h1>
          <p className="text-gray-600">Teacher: {classroom?.teacher?.name}</p>
        </div>
        {isTeacher && (
          <Button className="flex items-center gap-2">
            <Plus size={20} /> Create Test
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="live">Live</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                {['upcoming', 'live', 'completed'].map((status) => (
                  <TabsContent key={status} value={status}>
                    <div className="space-y-4">
                      {tests[status].map(test => (
                        <Card key={test.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <h3 className="font-semibold">{test.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                {status === 'upcoming' && <Clock size={16} />}
                                {status === 'live' && <Play size={16} />}
                                {status === 'completed' && <CheckCircle size={16} />}
                                <span>
                                  {status === 'live' ? 
                                    `Duration: ${test.duration} minutes` :
                                    new Date(test.startTime).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button variant={status === 'live' ? 'default' : 'outline'}>
                              {status === 'live' ? 'Join Test' : 'View Details'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Students Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Students ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTeacher && (
                <form onSubmit={handleAddStudent} className="flex gap-2 mb-4">
                  <Input
                    type="email"
                    placeholder="Add student by email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                  />
                  <Button type="submit">Add</Button>
                </form>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map(student => (
                  <div key={student.id} 
                       className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Tests taken: {student.performance?.testsTaken || 0}
                        <span className="mx-2">•</span>
                        Avg. score: {student.performance?.averageScore || 0}%
                      </div>
                    </div>
                    {isTeacher && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus size={18} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;