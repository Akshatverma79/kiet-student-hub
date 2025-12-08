export interface LoginResponse {
    data: {
        token: string;
    };
}

export interface AttendanceDataSummaryResponse {
    data: {
        presentPerc: number;
        absentPerc: number;
    };
}

export interface DaywiseReportProps {
    token: string;
    payload: {
        courseCompId: number;
        courseId: number;
        sessionId: number | null;
        studentId: number | string;
    };
}

export interface LectureListProps {
    planLecDate: string;
    dayName: string;
    timeSlot: string;
    attendance: "PRESENT" | "ADJUSTED" | "ABSENT";
}

export interface AttendanceApiResponse {
    data: {
        lectureList: LectureListProps[];
    }[];
}

export interface AttendanceResponse {
    data: {
        fullName: string;
        registrationNumber: string;
        rollNumber: string;
        sectionName: string;
        branchShortName: string;
        degreeName: string;
        semesterName: string;
        admissionBatchName: string;
        academicSessionName: string;
        attendanceCourseComponentInfoList: {
            courseName: string;
            courseCode: string;
            courseId: number;
            attendanceCourseComponentNameInfoList: {
                courseComponentId: number;
                numberOfExtraAttendance: number;
                componentName: string;
                numberOfPeriods: number;
                numberOfPresent: number;
                presentPercentage: number | null;
                presentPercentageWith: string;
            }[];
        }[];
    };
    message: string;
}

export interface ScheduleEntry {
    id: string | null;
    start: string;
    end: string;
    title: string;
    courseName: string;
    courseCode: string;
    courseCompName: string;
    facultyName: string;
    lectureDate: string;
    type: "CLASS" | "HOLIDAY";
}

export interface ScheduleResponse {
    data: ScheduleEntry[];
    message: string;
}
