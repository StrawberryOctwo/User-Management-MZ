export interface SessionReportData {

    classSessionId: string;
    studentId: string;
    lessonTopic?: string; // Add new fields
    coveredMaterials?: string;
    progress?: string;
    learningAssessment?: string;
    activeParticipation?: boolean;
    concentration?: boolean;
    worksIndependently?: boolean;
    cooperation?: boolean;
    previousHomeworkCompleted?: boolean;
    nextHomework?: string;
    tutorRemarks?: string;
}
