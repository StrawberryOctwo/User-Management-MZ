import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchFranchiseCount, fetchSessionAnalytics } from 'src/services/dashboardService';
import { fetchFranchises } from 'src/services/franchiseService';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [counts, setCounts] = useState({
    franchises: 0,
    locations: 0,
    teachers: 0,
    students: 0,
  });
  const [selectedFranchise, setSelectedFranchise] = useState('All Franchises');
  const [franchises, setFranchises] = useState([]);
  const [sessionAnalytics, setSessionAnalytics] = useState([]);
  const [filter, setFilter] = useState('month'); // Default filter
  const [loadingCounts, setLoadingCounts] = useState(false); // Separate loading for counts
  const [loadingAnalytics, setLoadingAnalytics] = useState(false); // Separate loading for analytics
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Fetch list of franchises for dropdown
  const fetchFranchiseList = async () => {
    setLoadingCounts(true);
    try {
      const data = await fetchFranchises(page, limit);
      setFranchises(data.data);
    } catch (err) {
      console.error('Error fetching franchises:', err);
    } finally {
      setLoadingCounts(false);
    }
  };

  // Fetch counts for selected franchise
  const fetchCounts = async () => {
    setLoadingCounts(true);
    try {
      const franchiseId = selectedFranchise === 'All Franchises' ? undefined : selectedFranchise;
      const data = await fetchFranchiseCount(franchiseId);
      setCounts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingCounts(false);
    }
  };

  // Fetch session analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const franchiseId = selectedFranchise === 'All Franchises' ? undefined : selectedFranchise;
      const data = await fetchSessionAnalytics(filter, franchiseId); // Pass filter and franchiseId
      setSessionAnalytics(data.analytics);
    } catch (err) {
      console.error('Error fetching session analytics:', err);
      setError(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchFranchiseList(); // Fetch franchise list once on mount
  }, []);

  useEffect(() => {
    fetchCounts(); // Refetch counts whenever selectedFranchise changes
  }, [selectedFranchise]);

  useEffect(() => {
    fetchAnalytics(); // Refetch analytics whenever filter or selectedFranchise changes
  }, [filter, selectedFranchise]);

  return (
    <DashboardContext.Provider
      value={{
        counts,
        sessionAnalytics,
        selectedFranchise,
        setSelectedFranchise,
        filter,
        setFilter,
        franchises,
        loadingCounts,
        loadingAnalytics,
        error,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
