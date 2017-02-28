export const ENV = process.env.NODE_ENV;

export const CONTROLLER_HOST = ENV === 'production'?'https://hoth.southbanksoftware.com':'localhost:3000';