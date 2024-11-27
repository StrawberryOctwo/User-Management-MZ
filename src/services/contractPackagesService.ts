import { api } from './api'; // Assuming `api` is the configured Axios instance

// Fetch all contract packages with pagination
export const fetchContractPackages = async (page: number, limit: number, franchiseId?: number) => {
    try {
        const response = await api.get('/contract-packages', {
            params: { page, limit, franchiseId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching contract packages:', error);
        throw error;
    }
};

export const fetchContractPackageById = async (contractId?: string) => {
    try {
        const response = await api.get(`/contract-package/${contractId}`, {
            params: { contractId },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching contract packages:', error);
        throw error;
    }
};

export const fetchContractPackagesByEntity = async (page: number, limit: Number, search) => {
    try {
        const response = await api.get('/contract-packages/franchises', {
            params: { page, limit, search },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching contract packages:', error);
        throw error;
    }
};

export const assignStudentToContract = async (studentId: number, contractId: Number) => {
    try {
        const response = await api.post('/assign/student/contract', { studentId, contractId });
        return response.data;
    } catch (error) {
        console.error('Error assigning contract to student:', error);
        throw error;
    }
};


// Fetch all session types
export const fetchSessionTypes = async (page?: number, limit?: number, search?) => {
    try {
        const response = await api.get('/session-types', {
            params: { page, limit, search },
        }); // Adjust endpoint as necessary
        return response.data;
    } catch (error) {
        console.error('Error fetching session types:', error);
        throw error;
    }
};

// Fetch all discounts
export const fetchDiscounts = async () => {
    try {
        const response = await api.get('/discounts'); // Adjust endpoint as necessary
        return response.data;
    } catch (error) {
        console.error('Error fetching discounts:', error);
        throw error;
    }
};


// Fetch contract packages by franchise ID with pagination
export const fetchContractPackagesByFranchise = async (franchiseId: number, page: number, limit: number, search: '') => {
    try {
        const response = await api.get(`/contract-packages/franchise/${franchiseId}`, {
            params: { page, limit, search },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching contract packages by franchise:', error);
        throw error;
    }
};

// Add a new contract package
export const addContractPackage = async (contractPackageData: any) => {
    try {
        const response = await api.post('/contract-packages', contractPackageData);
        return response.data;
    } catch (error) {
        console.error('Error adding contract package:', error);
        throw error;
    }
};

// Edit a contract package by ID
export const editContractPackage = async (id: string, contractPackageData: any) => {
    try {
        const response = await api.put(`/contract-packages/${id}`, contractPackageData);
        return response.data;
    } catch (error) {
        console.error('Error editing contract package:', error);
        throw error;
    }
};

// Delete multiple contract packages by IDs
export const deleteContractPackages = async (ids: string[]) => {
    try {
        const response = await api.delete('/contract-packages', {
            data: { ids },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting contract packages:', error);
        throw error;
    }
};
