import Papa from 'papaparse';
import { Product, Category } from '../types';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQIRPeu6kQW0Tg2kZm6hg_nb4iLQyrOHJ5OTsu9wAlqHpWdJvPklp7yDk3GK4bvfmvoL3nIMDCe4Y1m/pub?output=csv';

interface SheetRow {
    ID: string;
    Nombre: string;
    Categoria: string;
    Precio: string;
    'URL Imagen': string;
    Disponible: string;
}

export const fetchCatalog = async (): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<SheetRow>(SHEET_CSV_URL, {
            download: true,
            header: true,
            complete: (results) => {
                const products: Product[] = results.data
                    .filter((row) => row.ID && row.Nombre) // Ensure valid row
                    .map((row) => ({
                        id: row.ID,
                        name: row.Nombre,
                        category: row.Categoria as Category,
                        price: parseFloat(row.Precio) || 0,
                        imageUrl: row['URL Imagen'] || '',
                        available: row.Disponible?.toUpperCase() === 'SI',
                    }));
                resolve(products);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};
