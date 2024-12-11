export const NotificationTexts = {
  classSession: {
    title: (topicName: string) =>
      `New Class Session: ${topicName || "Unknown Topic"}`,
    message: (sessionType: string) =>
      `You have been added to the class session "${sessionType}".`,
    eventType: "class-session",
  },
  studentAbsence: {
    title: "Student Absence Alert",
    message: (studentName: string, topicName: string) =>
      `The student ${studentName} has been absent from ${
        topicName || "Unknown Topic"
      } for 4 consecutive sessions.`,
    eventType: "student_absence",
  },
  classSessionDeactivation: {
    title: "Class Session Canceled",
    message: (topicName: string) =>
      `The class session "${topicName}" has been canceled.`,
    eventType: "class-session-deactivation",
  },
  sessionReport: {
    title: () => "New Session Report Added",
    message: (lessonTopic: string) =>
      `A new session report for the lesson "${lessonTopic}" has been added. Please check the details.`,
    eventType: "session_report_added",
  },
  invoice: {
    parent: {
      title: "Monthly Invoice Generated",
      message: (studentName: string, totalAmount: number) =>
        `A monthly invoice for ${studentName} has been generated. The total amount is €${totalAmount.toFixed(
          2
        )}.`,
      eventType: "monthly-invoice",
    },
    teacher: {
      title: "Monthly Invoice Generated",
      message: (totalAmount: number) =>
        `Your monthly invoice has been generated. The total amount is €${totalAmount.toFixed(
          2
        )}.`,
      eventType: "monthly-invoice",
    },
  },
  classSessionUpdate: {
    title: (topicName: string) =>
      `Class Session Updated: ${topicName || "Unknown Topic"}`,
    // message: (sessionType: string) =>
    //   `The class session "${sessionType}" has been updated.`,
    eventType: "class-session-update",
  },
};
