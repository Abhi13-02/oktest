{
  "users": {
    "fields": {
      "userId": "String",
      "name": "String",
      "email": "String",
      "role": "String",
      "classrooms": "Array[String]",
      "badges": "Array[String]",
      "streak": "Number",
      "leaderboardScore": "Number",
      "performance": {
        "testsTaken": "Number",
        "averageScore": "Number",
        "accuracy": "Number",
        "frequentMistakes": "Array[String]"
      }
    }
  },
  "classrooms": {
    "fields": {
      "classroomId": "String",
      "name": "String",
      "teacherId": "String",
      "students": "Array[String]",
      "tests": "Array[String]"
    }
  },
  "tests": {
    "fields": {
      "testId": "String",
      "classroomId": "String",
      "title": "String",
      "description": "String",
      <!-- timer -->
      'test time':'Timestamp',
      "teacherId": "String",
      "testType": "String",
      "duration": "Number",
      "questions": "Array[String]",
      "difficulty": "String",
      "createdAt": "Timestamp",
      "leaderboard": "Array[String]",
      "adaptive": "Boolean"
    }
  },
  "testTaken": {
    "fields": {
      "testId": "String",
      "classroomId": "String",
      "title": "String",
      "description": "String",
      "teacherId": "String",
      "testType": "String",
      "duration": "Number",
      "questions": "Array[String]",
      "difficulty": "String",
      "createdAt": "Timestamp",
      "leaderboard": "Array[Users]",
      "adaptive": "Boolean"
    }
  },
  "questions": {
    "fields": {
      "questionId": "String",
      "testId": "String",
      "questionText": "String",
      "answer": "String",
      "options": "Array[String]",
      "questionType": "String",
      "difficulty": "String",
      "correctAnswerCount": "Number",
      "incorrectAnswerCount": "Number"
    }
  },
  "answers": {
    "fields": {
      "answerId": "String",
      "testId": "String",
      "studentId": "String",
      "questionId": "String",
      "submittedAnswer": "String",
      "isCorrect": "Boolean",
      "timeTaken": "Number"
    }
  },
  "testAttempts": {
    "fields": {
      "attemptId": "String",
      "testId": "String",
      "studentId": "String",
      "score": "Number",
      "totalQuestions": "Number",
      "correctAnswers": "Number",
      "incorrectAnswers": "Number",
      "startTime": "Timestamp",
      "endTime": "Timestamp"
    }
  },
  "badges": {
    "fields": {
      "badgeId": "String",
      "name": "String",
      "description": "String",
      "condition": {
        "score": "Number"
      }
    }
  },
  "discussions": {
    "fields": {
      "discussionId": "String",
      "testId": "String",
      "questionId": "String",
      "createdBy": "String",
      "content": "String",
      "replies": "Array[Map]",
      "replies.replyId": "String",
      "replies.userId": "String",
      "replies.content": "String"
    }
  },
  "leaderboards": {
    "fields": {
      "leaderboardId": "String",
      "testId": "String",
      "classroomId": "String",
      "rankings": {
        "studentId": "String",
        "score": "Number",
        "rank": "Number"
      }
    }
  },
  "adaptiveSessions": {
    "fields": {
      "adaptiveSessionId": "String",
      "studentId": "String",
      "testId": "String",
      "currentDifficulty": "String",
      "correctCount": "Number",
      "incorrectCount": "Number"
    }
  }
}
