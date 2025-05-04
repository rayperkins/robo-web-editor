export class Logger {
    public static log(message: string, ...args: any[]) {
        console.log(`[otto] ${message}`, ...args);
    }
}