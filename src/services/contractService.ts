import { api } from './api'; // Assuming you have an API instance

// Fetch all contracts with pagination
// export const fetchContracts = async (page: number, limit: number, searchQuery: string = '') => {
//     try {
//         const response = await api.get('/contracts', {
//             params: { page, limit, searchQuery },
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching contracts:', error);
//         throw error;
//     }
// };

export const fetchContracts = async (page: number, limit: number, searchQuery: string = '') => {
    try {
        // Filter and paginate contracts
        const filteredContracts = dummyContracts.filter(contract =>
            contract.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const start = (page - 1) * limit;
        const paginatedContracts = filteredContracts.slice(start, start + limit);

        return {
            data: paginatedContracts,
            total: filteredContracts.length,
        };
    } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
    }
};

export const fetchSessionTypes = async () => {
    try {
        const sessionTypes = [
            { id: 1, name: "Basic Session", price: 100 },
            { id: 2, name: "Advanced Session", price: 200 },
            { id: 3, name: "Premium Session", price: 300 },
        ];
        return sessionTypes;
    } catch (error) {
        console.error('Error fetching session types:', error);
        throw error;
    }
};


export const fetchDiscounts = async () => {
    try {
        const discounts = [
            { id: 1, name: "Promotional", price: 50 },
            { id: 1, name: "Siblings", price: 75 },
            { id: 1, name: "Holiday", price: 100 },
        ];
        return discounts;
    } catch (error) {
        console.error('Error fetching discounts:', error);
        throw error;
    }
};

// Dummy contract data without `price`
const dummyContracts = [
    {
        name: "6 Months Contract",
        session_ids: [1, 2],
        discount_id: 1,
        discount_value: 50,
        monthly_fee: null,
        one_time_fee: 450,
        isVatExempt: false,
        vat_percentage: 19,
    },
    {
        name: "1 Year Contract",
        session_ids: [2, 3],
        discount_id: 2,
        discount_value: 100,
        monthly_fee: 100,
        one_time_fee: null,
        isVatExempt: true,
        vat_percentage: 0,
    },
    {
        name: "3 Months Contract",
        session_ids: [1],
        discount_id: null,
        discount_value: 0,
        monthly_fee: 100,
        one_time_fee: null,
        isVatExempt: false,
        vat_percentage: 19,
    }
];
