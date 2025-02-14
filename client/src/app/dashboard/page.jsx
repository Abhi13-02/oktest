"use client"

import React, { useEffect } from 'react'
import {auth} from "@/config/firebase"

import { useRouter } from 'next/navigation'

function dashboard() {

    const user = auth.currentUser;
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
          }
    },[user])

  return (
    <div>dashboard</div>
  )
}

export default dashboard