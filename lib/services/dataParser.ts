import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';

export const parseFile = (buffer: Buffer, mimeType: string): any[] => {
    if (mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel') {
        const records = parse(buffer, {
            columns: true,
            skip_empty_lines: true
        });
        return records;
    } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.ms-excel'
    ) {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(sheet);
    }
    throw new Error('Unsupported file format');
};
