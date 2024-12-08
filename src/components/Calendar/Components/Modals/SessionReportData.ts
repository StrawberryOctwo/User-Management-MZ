export interface SessionReportData {
    classSessionId: string;
    studentId: string;
    lessonTopic?: string;
    coveredMaterials?: string;
    progress?: string;
    learningAssessment?: string;
    activeParticipation?: boolean;
    participationNotes?: string;
    concentration?: boolean;
    concentrationNotes?: string;
    worksIndependently?: boolean;
    independentWorkNotes?: string;
    cooperation?: boolean;
    cooperationNotes?: string;
    previousHomeworkCompleted?: boolean;
    nextHomework?: string;
    tutorRemarks?: string;
}