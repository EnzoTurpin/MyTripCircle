const logger = {
  debug: (...args: unknown[]) => {
    if (__DEV__) console.log("[debug]", ...args);
  },
  info: (...args: unknown[]) => {
    if (__DEV__) console.log("[info]", ...args);
  },
  warn: (...args: unknown[]) => console.warn("[warn]", ...args),
  error: (...args: unknown[]) => console.error("[error]", ...args),
};

export default logger;
