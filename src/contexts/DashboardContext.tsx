import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react';
import {
  fetchFranchiseCount,
  fetchSessionAnalytics,
  fetchInvoiceAnalytics,
  fetchStudentAnalytics
} from 'src/services/dashboardService';
import { fetchFranchises } from 'src/services/franchiseService';
import { fetchToDosByAssignedBy } from 'src/services/todoService';

interface InvoiceAnalyticsData {
  periods: string[];
  income: number[];
  expense: number[];
  netIncome: number[];
  totalIncome: number;
  totalExpense: number;
  netIncomePercentage: string;
  totalInvoices: number;
}

interface DashboardContextProps {
  counts: {
    franchises: number;
    locations: number;
    teachers: number;
    students: number;
  };
  sessionAnalytics: any[];
  invoiceAnalytics: InvoiceAnalyticsData;
  selectedFranchise: string;
  setSelectedFranchise: (franchise: string) => void;
  analyticsFilter: string;
  setAnalyticsFilter: (filter: string) => void;
  invoiceFilter: string;
  setInvoiceFilter: (filter: string) => void;
  franchises: any[];
  loadingCounts: boolean;
  loadingAnalytics: boolean;
  loadingInvoices: boolean;
  error: any;
  filterParams: any; // To store additional filter parameters for invoice analytics
  setFilterParams: (params: any) => void;
  studentAnalytics: any[];
  setStudentAnalytics: (data: any[]) => void;
  studentFilter: string;
  setStudentFilter: (filter: string) => void;
  studentAnalyticsLoading: boolean;
  setStudentAnalyticsLoading: (loading: boolean) => void;
  todos: any[];
  todoPage: number;
  setTodoPage: (page: number) => void;
  todoLimit: number;
  setTodoLimit: (limit: number) => void;
}

const DashboardContext = createContext<DashboardContextProps | null>(null);

export const DashboardProvider: React.FC = ({ children }) => {
  // State Definitions
  const [counts, setCounts] = useState({
    franchises: 0,
    locations: 0,
    teachers: 0,
    students: 0
  });
  const [selectedFranchise, setSelectedFranchise] = useState('All Franchises');
  const [franchises, setFranchises] = useState([]);
  const [sessionAnalytics, setSessionAnalytics] = useState([]);
  const [invoiceAnalytics, setInvoiceAnalytics] =
    useState<InvoiceAnalyticsData>({
      periods: [],
      income: [],
      expense: [],
      netIncome: [],
      totalIncome: 0,
      totalExpense: 0,
      netIncomePercentage: '0.00',
      totalInvoices: 0
    });

  // Separate Filters for Analytics and Invoices
  const [analyticsFilter, setAnalyticsFilter] = useState('month'); // Default filter for session analytics
  const [invoiceFilter, setInvoiceFilter] = useState('month'); // Default filter for invoice analytics

  const [studentFilter, setStudentFilter] = useState('location'); // Default filter for student analytics
  const [studentAnalytics, setStudentAnalytics] = useState([]);
  const [studentAnalyticsLoading, setStudentAnalyticsLoading] = useState(false);

  const [todos, setTodos] = useState([]);
  const [todoPage, setTodoPage] = useState(1);
  const [todoLimit, setTodoLimit] = useState(5);

  // Additional Filter Parameters for Invoice Analytics
  const [filterParams, setFilterParams] = useState<any>({});

  // Loading States
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Error State
  const [error, setError] = useState(null);

  // Pagination States for Franchises
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Fetch List of Franchises
  const fetchFranchiseList = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const data = await fetchFranchises(page, limit);
      setFranchises(data.data);
    } catch (err) {
      console.error('Error fetching franchises:', err);
      setError(err);
    } finally {
      setLoadingCounts(false);
    }
  }, [page, limit]);

  // Fetch Counts Based on Selected Franchise
  const fetchCounts = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const franchiseId =
        selectedFranchise === 'All Franchises' ? undefined : selectedFranchise;
      const data = await fetchFranchiseCount(franchiseId);
      setCounts(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching counts:', err);
    } finally {
      setLoadingCounts(false);
    }
  }, [selectedFranchise]);

  // Fetch Session Analytics Based on Analytics Filter and Selected Franchise
  const fetchSessionAnalyticsData = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const franchiseId =
        selectedFranchise === 'All Franchises' ? undefined : selectedFranchise;
      const data = await fetchSessionAnalytics(analyticsFilter, franchiseId);
      setSessionAnalytics(data.analytics);
    } catch (err) {
      console.error('Error fetching session analytics:', err);
      setError(err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [analyticsFilter, selectedFranchise]);

  // Fetch Invoice Analytics Based on Invoice Filter, Selected Franchise, and Filter Params
  const fetchInvoiceAnalyticsData = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const franchiseId =
        selectedFranchise === 'All Franchises' ? undefined : selectedFranchise;
      console.log('Fetching invoice analytics with params:', {
        franchiseId,
        invoiceFilter,
        filterParams
      });
      const data = await fetchInvoiceAnalytics(
        franchiseId,
        invoiceFilter,
        filterParams
      );
      setInvoiceAnalytics(data);
    } catch (err) {
      console.error('Error fetching invoice analytics:', err);
      setError(err);
    } finally {
      setLoadingInvoices(false);
    }
  }, [invoiceFilter, selectedFranchise, filterParams]);

  const fetchStudentAnalyticsData = useCallback(async () => {
    setStudentAnalyticsLoading(true);
    try {
      const franchiseId =
        selectedFranchise === 'All Franchises' ? undefined : selectedFranchise;
      const data = await fetchStudentAnalytics(franchiseId, studentFilter);
      setStudentAnalytics(data);
    } catch (err) {
      console.error('Error fetching student analytics:', err);
      setError(err);
    } finally {
      setStudentAnalyticsLoading(false);
    }
  }, [studentFilter]);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await fetchToDosByAssignedBy(todoPage, todoLimit);
      console.log('Fetched todos:', data);
      setTodos(data.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError(error);
    }
  }, []);

  // Initial Fetch for Franchise List on Component Mount
  useEffect(() => {
    fetchFranchiseList();
  }, [fetchFranchiseList]);

  // Fetch Counts When Selected Franchise Changes
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Fetch Session Analytics When Analytics Filter or Selected Franchise Changes
  useEffect(() => {
    fetchSessionAnalyticsData();
  }, [fetchSessionAnalyticsData]);

  // Fetch Invoice Analytics When Invoice Filter, Selected Franchise, or Filter Params Change
  useEffect(() => {
    // Only fetch if filterParams are not empty
    if (Object.keys(filterParams).length > 0) {
      fetchInvoiceAnalyticsData();
    }
  }, [fetchInvoiceAnalyticsData, filterParams]);

  useEffect(() => {
    fetchStudentAnalyticsData();
  }, [fetchStudentAnalyticsData]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      studentAnalytics,
      setStudentAnalytics,
      studentFilter,
      setStudentFilter,
      studentAnalyticsLoading,
      setStudentAnalyticsLoading,
      counts,
      sessionAnalytics,
      invoiceAnalytics,
      selectedFranchise,
      setSelectedFranchise,
      analyticsFilter,
      setAnalyticsFilter,
      invoiceFilter,
      setInvoiceFilter,
      franchises,
      loadingCounts,
      loadingAnalytics,
      loadingInvoices,
      error,
      filterParams,
      setFilterParams,
      todos,
      todoPage,
      setTodoPage,
      todoLimit,
      setTodoLimit
    }),
    [
      counts,
      sessionAnalytics,
      invoiceAnalytics,
      selectedFranchise,
      setSelectedFranchise,
      analyticsFilter,
      setAnalyticsFilter,
      invoiceFilter,
      setInvoiceFilter,
      franchises,
      loadingCounts,
      loadingAnalytics,
      loadingInvoices,
      error,
      filterParams,
      setFilterParams,
      studentAnalytics,
      setStudentAnalytics,
      studentFilter,
      setStudentFilter,
      studentAnalyticsLoading,
      setStudentAnalyticsLoading,
      todos,
      todoPage,
      setTodoPage,
      todoLimit,
      setTodoLimit
    ]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
