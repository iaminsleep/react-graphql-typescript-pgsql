export const __prod__ = process.env.NODE_ENV === 'production'
export const __port__ = process.env.APP_PORT
export const __user__ = process.env.DB_USER
export const __pass__ = process.env.DB_PASS

export const COOKIE_NAME = 'qid'
export const FORGET_PASSWORD_PREFIX = 'forget-password:';