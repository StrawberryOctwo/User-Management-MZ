import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchFranchiseCount } from 'src/services/dashboardService';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  // Fetch list of franchises for dropdown
  const fetchFranchiseList = async () => {
    setLoading(true);
    try {
        const data = await fetchFranchises(page, limit);   
              setFranchises(data.data);
    } catch (err) {
      console.error('Error fetching franchises:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts for selected franchise
  const fetchCounts = async () => {
    setLoading(true);
    try {
      const franchiseId = selectedFranchise === 'All Franchises' ? undefined : selectedFranchise;
      const data = await fetchFranchiseCount(franchiseId);
      setCounts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchiseList();
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [selectedFranchise]);

  return (
    <DashboardContext.Provider
      value={{
        counts,
        selectedFranchise,
        setSelectedFranchise,
        franchises,
        loading,
        error,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
