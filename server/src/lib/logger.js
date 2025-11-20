const isDev = process.env.NODE_ENV !== "production";

const logger = {
  info: (msg, ...optionalParams) => {
    if (isDev) console.log("[INFO]:", msg, ...optionalParams);
  },
  warn: (msg, ...optionalParams) => {
    if (isDev) console.warn("[WARN]:", msg, ...optionalParams);
  },
error: (msg, ...optionalParams) => {
    if (isDev) console.error("[ERROR]:", msg, ...optionalParams);
  },
  debug: (msg, ...optionalParams) => {
    if (isDev) console.debug("[DEBUG]:", msg, ...optionalParams);
  },
};

export default logger;
