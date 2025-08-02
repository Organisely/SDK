import { OAuthTokenResponse, ApiResponse } from './types';
export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
}
export declare class OrganiselyOAuth {
    private config;
    constructor(config: OAuthConfig);
    generateAuthUrl(state?: string): string;
    exchangeCodeForToken(code: string): Promise<ApiResponse<OAuthTokenResponse>>;
    refreshToken(refreshToken: string): Promise<ApiResponse<OAuthTokenResponse>>;
    revokeToken(token: string, tokenType?: 'access_token' | 'refresh_token'): Promise<ApiResponse<void>>;
    validateToken(accessToken: string): Promise<ApiResponse<boolean>>;
}
//# sourceMappingURL=oauth.d.ts.map