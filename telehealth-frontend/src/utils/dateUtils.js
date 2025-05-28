// src/utils/dateUtils.js
import { format } from 'date-fns';

export const formatDateSafe = (dateString, formatPattern, defaultString = "N/A") => {
    if (!dateString) return defaultString;
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) {
            console.warn(`Invalid date string encountered for formatting: ${dateString}`);
            return "Invalid Date";
        }
        return format(dateObj, formatPattern);
    } catch (e) {
        console.error(`Error formatting date: ${dateString}`, e);
        return "Error in Date";
    }
};