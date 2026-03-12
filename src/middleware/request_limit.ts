import rateLimit from "express-rate-limit";

export const req_rate_limit = ({ milisec = 1 * 60 * 1000, req_limit = 5, message = "Too many requests have been made. Please try again after a minute." }: { milisec?: number, req_limit?: number, message?: string } = {}) => {
    return rateLimit({
        windowMs: milisec, // default 1 minute
        max: req_limit,                   // default 5 requests per IP
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
            const error = new Error(message) as any;
            error.statusCode = 429;
            error.isRateLimit = true;
            next(error);
        },
    });
}
