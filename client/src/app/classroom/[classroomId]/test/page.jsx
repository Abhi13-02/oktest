"use client"

import { useParams, useRouter } from 'next/navigation';
import PDFExtractor from '../../../../components/test/QuestionSection'
import React from 'react'

function test() {
  const { classroomId } = useParams();
  return (
    <div>
      <PDFExtractor classroomID={classroomId} />
    </div>
  )
}

export default test