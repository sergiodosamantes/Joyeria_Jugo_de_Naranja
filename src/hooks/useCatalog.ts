import { useState, useEffect } from 'react';
import { Product } from '../types';
import { fetchCatalog } from '../services/googleSheets';

export const useCatalog = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await fetchCatalog();
                setProducts(data);
            } catch (err: any) {
                setError(err.message || 'Error loading catalog');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { products, loading, error };
};
