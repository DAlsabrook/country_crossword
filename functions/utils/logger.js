const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create logger
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        colorize(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' })
    ]
});

module.exports = logger;
