import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DayDetail {
  startTime: string;
  duration: number;
}

interface Session {
  name: string;
  startDate: Date;
  endDate: Date;
  note: string;
  sessionType: string;
  isHolidayCourse: boolean;
  teacherId: number;
  topicId: number;
  locationId: number;
  studentIds: number[];
  dayDetails: { [key: string]: DayDetail };
  recurrenceOption: string;
}

interface SessionContextProps {
  session: Session;
  setSession: React.Dispatch<React.SetStateAction<Session>>;
  setSessionField: (field: keyof Session, value: any) => void;
  setDayDetail: (day: string, field: keyof DayDetail, value: any) => void;
  resetDayDetails: () => void;
  clearSession: () => void;
  mode: 'create' | 'edit';
  setMode: React.Dispatch<React.SetStateAction<'create' | 'edit'>>;
}

const defaultSession: Session = {
  name: '',
  startDate: new Date(),
  endDate: (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  })(),
  note: '',
  sessionType: '',
  isHolidayCourse: false,
  teacherId: 0,
  topicId: 0,
  locationId: 0,
  studentIds: [],
  dayDetails: {},
  recurrenceOption: 'weekly'
};

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session>(defaultSession);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  const setSessionField = (field: keyof Session, value: any) => {
    setSession((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const setDayDetail = (day: string, field: keyof DayDetail, value: any) => {
    setSession((prev) => ({
      ...prev,
      dayDetails: {
        ...prev.dayDetails,
        [day]: {
          ...prev.dayDetails[day],
          [field]: value
        }
      }
    }));
  };

  const resetDayDetails = () => {
    setSession((prev) => ({
      ...prev,
      dayDetails: {}
    }));
  };

  const clearSession = () => {
    setSession(defaultSession);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        setSessionField,
        setDayDetail,
        resetDayDetails,
        clearSession,
        mode,
        setMode
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
