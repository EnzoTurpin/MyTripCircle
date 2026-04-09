const IS_PROD = process.env.NODE_ENV === "production";

const logger = {
  debug: (...args: unknown[]) => { if (!IS_PROD) console.log("[debug]", ...args); },
  info:  (...args: unknown[]) => { if (!IS_PROD) console.log("[info]",  ...args); },
  warn:  (...args: unknown[]) => console.warn("[warn]",  ...args),
  error: (...args: unknown[]) => console.error("[error]", ...args),
};

export default logger;
