'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import { firebaseApp } from '@/firebase'; 
const Avatar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setUser(userSnapshot.data());
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div className="relative">
      <div className="relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-11 md:w-11">
        <Image alt="Avatar" src={user.image || '/images/avatar.jpg'} fill />
      </div>
    </div>
  );
};

export default Avatar;
