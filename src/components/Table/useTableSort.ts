// src/hooks/useTableSort.ts

import { useState } from 'react';

type Order = 'asc' | 'desc';

const useTableSort = (defaultOrderBy: string) => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<string>(defaultOrderBy);

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getComparator = (order: Order, orderBy: string) => {
        return (a: any, b: any): number => {
            const valueA = a[orderBy];
            const valueB = b[orderBy];

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return order === 'asc'
                    ? valueA.localeCompare(valueB, undefined, { sensitivity: 'base' })
                    : valueB.localeCompare(valueA, undefined, { sensitivity: 'base' });
            }

            // Fallback to basic comparison for other data types
            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        };
    };


    const sortData = (data: any[]) => {
        const comparator = getComparator(order, orderBy);
        const stabilizedArray = data.map((el, index) => [el, index] as [any, number]);

        stabilizedArray.sort((a, b) => {
            const comparison = comparator(a[0], b[0]);
            return comparison !== 0 ? comparison : a[1] - b[1];
        });

        return stabilizedArray.map((el) => el[0]);
    };

    return { order, orderBy, handleRequestSort, sortData };
};

export default useTableSort;
