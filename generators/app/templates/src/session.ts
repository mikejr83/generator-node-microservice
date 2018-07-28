export interface IOidcOptions {
    state: string;
    nonce: string;
}

export interface IUserInfo {
    legacy_password: string;
    practice_id: string;
    site_id: string;
    sub: string;
    user_id: string;
    username: string;

}

export interface ISession extends Express.Session {
    isUserLoggedIn?: boolean;
    oidc?: IOidcOptions;
    userInfo?: IUserInfo;
}
