import { storage } from "./storage";
import { insertSystemLogSchema, type LogCategory, type LogLevel } from "@shared/schema";

export async function logSystemEvent(
    category: LogCategory,
    level: LogLevel,
    message: string,
    details?: any,
    userId?: string,
    deviceId?: string
) {
    try {
        const logData = {
            category,
            level,
            message,
            details: details || null,
            userId: userId || null,
            deviceId: deviceId || null,
            createdAt: new Date(),
        };

        // Validate with schema (optional but good practice)
        const validatedLog = insertSystemLogSchema.parse(logData);

        await storage.createSystemLog(validatedLog);

        // Also log to console for immediate visibility
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${category.toUpperCase()}] [${level.toUpperCase()}]`;
        const consoleMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;

        consoleMethod(`${prefix} ${message}`, details ? JSON.stringify(details) : '');

    } catch (error) {
        // Fallback if database logging fails
        console.error(`[SYSTEM_LOG_FAILURE] Failed to log event: ${message}`, error);
    }
}
