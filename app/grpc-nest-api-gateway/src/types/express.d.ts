export {};

declare global {
  namespace Express {
    interface Request {
      user?: import('../entities/User').default;
    }
  }
}
