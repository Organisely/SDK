import { OrganiselyBot } from '..';
export interface GmailMcpConfig {
    mcpServerUrl: string;
}
export interface GmailOAuth2Config {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    authUrl: string;
}
export declare class GmailMcpBot extends OrganiselyBot {
    private gmail;
    private auth;
    private oauth2Config;
    constructor(config: GmailMcpConfig);
    getOAuth2Config(): GmailOAuth2Config;
    setTokens(accessToken: string, refreshToken: string): void;
    isAuthenticated(): boolean;
    private registerMcpTools;
    executeMcpTool(toolId: string, params: any): Promise<any>;
    private executeGmailSearch;
    private executeGmailReadMessage;
    private executeGmailListMessages;
    private executeGmailSendMessage;
    private executeGmailListLabels;
    searchEmails(query: string, maxResults?: number): Promise<any[]>;
    readEmail(messageId: string, format?: string): Promise<any>;
    listMessages(labelIds?: string[], maxResults?: number): Promise<any>;
    sendEmail(to: string, subject: string, body: string, cc?: string, bcc?: string): Promise<any>;
    listLabels(): Promise<any[]>;
}
export declare function createGmailMcpBot(config: GmailMcpConfig): GmailMcpBot;
//# sourceMappingURL=gmail-mcp.d.ts.map