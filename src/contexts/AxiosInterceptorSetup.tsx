import React, { useEffect } from 'react';
// import { useAxiosInterceptors } from '../services/api';

const AxiosInterceptorSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // useAxiosInterceptors(); // Apply the interceptors here

    return <>{children}</>; // Render the child components
};

export default AxiosInterceptorSetup;
