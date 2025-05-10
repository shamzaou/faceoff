declare module 'passport-oauth2' {
  import { Strategy } from 'passport';
  
  export class Strategy extends Strategy {
    constructor(
      options: {
        authorizationURL: string;
        tokenURL: string;
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        passReqToCallback?: boolean;
      },
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any, info?: any) => void
      ) => void
    );
  }
}