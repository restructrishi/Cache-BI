import { read, utils } from 'xlsx';

export interface DatasetColumn {
    id: string;
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
}

export interface Dataset {
    id: string;
    name: string;
    columns: DatasetColumn[];
    data: any[];
}

// Sample Financials Dataset
export const FINANCIALS_DATASET: Dataset = {
    id: 'financials',
    name: 'Financials Sample',
    columns: [
        { id: 'segment', name: 'Segment', type: 'string' },
        { id: 'country', name: 'Country', type: 'string' },
        { id: 'product', name: 'Product', type: 'string' },
        { id: 'discount_band', name: 'Discount Band', type: 'string' },
        { id: 'units_sold', name: 'Units Sold', type: 'number' },
        { id: 'manufacturing_price', name: 'Manufacturing Price', type: 'number' },
        { id: 'sale_price', name: 'Sale Price', type: 'number' },
        { id: 'gross_sales', name: 'Gross Sales', type: 'number' },
        { id: 'sales', name: 'Sales', type: 'number' },
        { id: 'cogs', name: 'COGS', type: 'number' },
        { id: 'profit', name: 'Profit', type: 'number' },
        { id: 'date', name: 'Date', type: 'date' },
        { id: 'month_number', name: 'Month Number', type: 'number' },
        { id: 'month_name', name: 'Month Name', type: 'string' },
        { id: 'year', name: 'Year', type: 'string' }
    ],
    data: [
        // Mock Data Rows will be generated or hardcoded short list
        // 20 rows of sample data
        { segment: 'Government', country: 'Canada', product: 'Carretera', discount_band: 'None', units_sold: 1618.5, manufacturing_price: 3, sale_price: 20, gross_sales: 32370, sales: 32370, cogs: 16185, profit: 16185, date: '2014-01-01', month_number: 1, month_name: 'January', year: '2014' },
        { segment: 'Government', country: 'Germany', product: 'Carretera', discount_band: 'None', units_sold: 1321, manufacturing_price: 3, sale_price: 20, gross_sales: 26420, sales: 26420, cogs: 13210, profit: 13210, date: '2014-01-01', month_number: 1, month_name: 'January', year: '2014' },
        { segment: 'Midmarket', country: 'France', product: 'Carretera', discount_band: 'None', units_sold: 2178, manufacturing_price: 3, sale_price: 15, gross_sales: 32670, sales: 32670, cogs: 21780, profit: 10890, date: '2014-06-01', month_number: 6, month_name: 'June', year: '2014' },
        { segment: 'Midmarket', country: 'Germany', product: 'Carretera', discount_band: 'None', units_sold: 888, manufacturing_price: 3, sale_price: 15, gross_sales: 13320, sales: 13320, cogs: 8880, profit: 4440, date: '2014-06-01', month_number: 6, month_name: 'June', year: '2014' },
        { segment: 'Channel Partners', country: 'Canada', product: 'Carretera', discount_band: 'None', units_sold: 2518, manufacturing_price: 3, sale_price: 12, gross_sales: 30216, sales: 30216, cogs: 7554, profit: 22662, date: '2014-06-01', month_number: 6, month_name: 'June', year: '2014' },
        { segment: 'Government', country: 'Germany', product: 'Paseo', discount_band: 'Low', units_sold: 1000, manufacturing_price: 10, sale_price: 20, gross_sales: 20000, sales: 19000, cogs: 10000, profit: 9000, date: '2014-07-01', month_number: 7, month_name: 'July', year: '2014' },
        { segment: 'Midmarket', country: 'USA', product: 'VTT', discount_band: 'Medium', units_sold: 2500, manufacturing_price: 250, sale_price: 15, gross_sales: 37500, sales: 35000, cogs: 25000, profit: 10000, date: '2014-07-01', month_number: 7, month_name: 'July', year: '2014' },
        { segment: 'Government', country: 'France', product: 'Velo', discount_band: 'High', units_sold: 1500, manufacturing_price: 120, sale_price: 120, gross_sales: 180000, sales: 160000, cogs: 120000, profit: 40000, date: '2014-08-01', month_number: 8, month_name: 'August', year: '2014' },
    ]
};

export const DatasetService = {
    getSampleDataset: () => FINANCIALS_DATASET,

    parseExcel: async (file: File): Promise<{ sheets: string[], workbook: any }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = read(data, { type: 'array' });
                    resolve({
                        sheets: workbook.SheetNames,
                        workbook
                    });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    extractSheetData: (workbook: any, sheetName: string): Dataset => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
        
        if (!jsonData || jsonData.length === 0) {
            throw new Error("Empty sheet");
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        // Infer types based on first row of data
        const firstRow = rows[0] as any[];
        const columns: DatasetColumn[] = headers.map((header, index) => {
            const val = firstRow ? firstRow[index] : null;
            let type: 'string' | 'number' | 'date' | 'boolean' = 'string';
            
            if (typeof val === 'number') type = 'number';
            else if (typeof val === 'boolean') type = 'boolean';
            // Simple date check (can be improved)
            else if (typeof val === 'string' && !isNaN(Date.parse(val)) && val.length > 5 && (val.includes('-') || val.includes('/'))) type = 'date';

            // Sanitizing header to be id-friendly
            const id = (header || `col_${index}`).toLowerCase().replace(/[^a-z0-9]/g, '_');

            return { id, name: header || `Column ${index + 1}`, type };
        });

        // Map rows to objects
        const data = rows.map((row: any) => {
            const obj: any = {};
            columns.forEach((col, index) => {
                 obj[col.id] = row[index];
            });
            return obj;
        });

        return {
            id: crypto.randomUUID(),
            name: sheetName,
            columns,
            data
        };
    }
};
