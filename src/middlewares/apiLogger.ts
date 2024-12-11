import { Request, Response, NextFunction } from 'express';

// Define log colors for better readability in console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

// Check if we're in production (Render) or development
const isDevelopment = process.env.NODE_ENV !== 'production';

export const apiLogger = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();

        // Log request
        const logRequest = () => {
            const user = (req as any).user;
            const userId = user?.id || 'anonymous';
            const userEmail = user?.email || 'anonymous';
            const userRoles = user?.roles?.map((role: any) => role.name).join(', ') || 'none';

            const logMessage = isDevelopment ? `
${colors.bright}[API Request] ${new Date().toISOString()}${colors.reset}
${colors.cyan}Method:${colors.reset} ${req.method}
${colors.cyan}Path:${colors.reset} ${req.path}
${colors.cyan}User ID:${colors.reset} ${userId}
${colors.cyan}User Email:${colors.reset} ${userEmail}
${colors.cyan}User Roles:${colors.reset} ${userRoles}
${colors.cyan}IP:${colors.reset} ${req.ip || req.socket.remoteAddress}
${colors.cyan}Query Params:${colors.reset} ${JSON.stringify(req.query)}
${colors.cyan}Body:${colors.reset} ${req.method !== 'GET' ? JSON.stringify(req.body) : 'N/A'}
` :
                // Simplified JSON format for production (Render)
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    type: 'request',
                    method: req.method,
                    path: req.path,
                    userId,
                    userEmail,
                    userRoles,
                    ip: req.ip || req.socket.remoteAddress,
                    query: req.query,
                    body: req.method !== 'GET' ? req.body : null
                });

            console.log(logMessage);
        };

        // Log response
        const logResponse = () => {
            const duration = Date.now() - startTime;

            const logMessage = isDevelopment ? `
${colors.bright}[API Response] ${new Date().toISOString()}${colors.reset}
${colors.cyan}Path:${colors.reset} ${req.path}
${colors.cyan}Status:${colors.reset} ${res.statusCode < 400 ? colors.green : colors.red}${res.statusCode}${colors.reset}
${colors.cyan}Duration:${colors.reset} ${duration}ms
${'='.repeat(80)}
` :
                // Simplified JSON format for production (Render)
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    type: 'response',
                    path: req.path,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`
                });

            console.log(logMessage);
        };

        // Log request immediately
        logRequest();

        // Override response methods to log response
        const originalSend = res.send;
        res.send = function (body: any): Response {
            logResponse();
            return originalSend.call(this, body);
        };

        next();
    };
};