/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  source?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      source: typeof window !== 'undefined' ? 'client' : 'server',
    };
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      const entry = this.formatMessage('debug', message, data);
      console.debug(`[DEBUG] ${entry.timestamp} - ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      const entry = this.formatMessage('info', message, data);
      console.info(`[INFO] ${entry.timestamp} - ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    const entry = this.formatMessage('warn', message, data);
    console.warn(`[WARN] ${entry.timestamp} - ${message}`, data || '');
    
    // In production, you might want to send warnings to monitoring service
    if (this.isProduction) {
      this.sendToMonitoringService(entry);
    }
  }

  error(message: string, error?: Error | any, data?: any) {
    const entry = this.formatMessage('error', message, { error: error?.message || error, ...data });
    console.error(`[ERROR] ${entry.timestamp} - ${message}`, error || '', data || '');
    
    // Always report errors in production
    if (this.isProduction) {
      this.sendToErrorReporting(entry, error);
    }
  }

  // Performance monitoring
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // API request logging
  apiRequest(method: string, url: string, status?: number, duration?: number) {
    const message = `${method} ${url}${status ? ` - ${status}` : ''}${duration ? ` (${duration}ms)` : ''}`;
    
    if (status && status >= 400) {
      this.warn(`API Error: ${message}`);
    } else if (this.isDevelopment) {
      this.debug(`API: ${message}`);
    }
  }

  // Database operation logging
  dbOperation(operation: string, collection: string, duration?: number, error?: Error) {
    const message = `DB ${operation} on ${collection}${duration ? ` (${duration}ms)` : ''}`;
    
    if (error) {
      this.error(`Database Error: ${message}`, error);
    } else if (this.isDevelopment) {
      this.debug(message);
    }
  }

  // User action logging
  userAction(action: string, userId?: string, data?: any) {
    if (this.isDevelopment) {
      this.info(`User Action: ${action}${userId ? ` by ${userId}` : ''}`, data);
    }
  }

  private sendToMonitoringService(entry: LogEntry) {
    // TODO: Implement monitoring service integration (e.g., DataDog, New Relic)
    // This would be implemented based on your monitoring service of choice
  }

  private sendToErrorReporting(entry: LogEntry, error?: Error) {
    // TODO: Implement error reporting service integration (e.g., Sentry, Bugsnag)
    // This would be implemented based on your error reporting service of choice
    if (typeof window !== 'undefined') {
      // Client-side error reporting
      // Example: Sentry.captureException(error);
    } else {
      // Server-side error reporting
      // Example: Send to logging service
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions for common patterns
export const logApiCall = (method: string, endpoint: string) => {
  const start = Date.now();
  return {
    success: (status: number = 200) => {
      logger.apiRequest(method, endpoint, status, Date.now() - start);
    },
    error: (status: number, error?: Error) => {
      logger.apiRequest(method, endpoint, status, Date.now() - start);
      if (error) {
        logger.error(`API Error in ${method} ${endpoint}`, error);
      }
    }
  };
};

export const logDbCall = (operation: string, collection: string) => {
  const start = Date.now();
  return {
    success: () => {
      logger.dbOperation(operation, collection, Date.now() - start);
    },
    error: (error: Error) => {
      logger.dbOperation(operation, collection, Date.now() - start, error);
    }
  };
};

// Export default logger
export default logger; 