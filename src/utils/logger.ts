export class Logger {
    private static readonly isDev = process.env.NODE_ENV !== 'production';
    private readonly prefix: string;

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    debug(...args: any[]) {
        if (Logger.isDev) {
            console.log(`[${this.prefix}]`, ...args);
        }
    }

    info(...args: any[]) {
        if (Logger.isDev) {
            console.info(`[${this.prefix}]`, ...args);
        }
    }

    warn(...args: any[]) {
        if (Logger.isDev) {
            console.warn(`[${this.prefix}]`, ...args);
        }
    }

    error(...args: any[]) {
        if (Logger.isDev) {
            console.error(`[${this.prefix}]`, ...args);
        }
    }
}