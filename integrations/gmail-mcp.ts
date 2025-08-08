import { OrganiselyBot } from '..';
import { google } from 'googleapis';

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

export class GmailMcpBot extends OrganiselyBot {
  private gmail = google.gmail('v1');
  private auth: any;
  private oauth2Config: GmailOAuth2Config;

  constructor(config: GmailMcpConfig) {
    super();
    
    // Set up OAuth2 configuration
    this.oauth2Config = {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.GMAIL_REDIRECT_URI || '',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
    };
    
    // Register MCP tools
    this.registerMcpTools();
  }

  // Method to get OAuth2 configuration for client
  getOAuth2Config(): GmailOAuth2Config {
    return this.oauth2Config;
  }

  // Method to set tokens after OAuth2 flow
  setTokens(accessToken: string, refreshToken: string) {
    this.auth = new google.auth.OAuth2(
      this.oauth2Config.clientId,
      this.oauth2Config.clientSecret,
      this.oauth2Config.redirectUri
    );

    this.auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // Set the auth for googleapis
    google.options({ auth: this.auth });
  }

  // Method to check if integration is authenticated
  isAuthenticated(): boolean {
    return this.auth && this.auth.credentials && this.auth.credentials.access_token;
  }

  private registerMcpTools(): void {
    // Register Gmail search tool
    this.registerMcpTool('gmail_search', {
      description: 'Search for emails in Gmail',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (Gmail search syntax)'
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10)'
          },
          includeSpamTrash: {
            type: 'boolean',
            description: 'Include spam and trash in search results (default: false)'
          }
        },
        required: ['query']
      }
    });

    // Register Gmail read message tool
    this.registerMcpTool('gmail_read_message', {
      description: 'Read a specific email message from Gmail',
      inputSchema: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            description: 'ID of the message to read'
          },
          format: {
            type: 'string',
            enum: ['full', 'minimal', 'raw'],
            description: 'Format of the message to return (default: full)'
          }
        },
        required: ['messageId']
      }
    });

    // Register Gmail list messages tool
    this.registerMcpTool('gmail_list_messages', {
      description: 'List messages from Gmail inbox or specific label',
      inputSchema: {
        type: 'object',
        properties: {
          labelIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Label IDs to filter by (e.g., ["INBOX", "SENT"])'
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of results to return (default: 10)'
          },
          pageToken: {
            type: 'string',
            description: 'Token for the next page of results'
          }
        }
      }
    });

    // Register Gmail send message tool
    this.registerMcpTool('gmail_send_message', {
      description: 'Send an email message via Gmail',
      inputSchema: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Recipient email address'
          },
          subject: {
            type: 'string',
            description: 'Email subject'
          },
          body: {
            type: 'string',
            description: 'Email body content'
          },
          cc: {
            type: 'string',
            description: 'CC recipient email address (optional)'
          },
          bcc: {
            type: 'string',
            description: 'BCC recipient email address (optional)'
          }
        },
        required: ['to', 'subject', 'body']
      }
    });

    // Register Gmail labels tool
    this.registerMcpTool('gmail_list_labels', {
      description: 'List all Gmail labels',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    });
  }

  async executeMcpTool(toolId: string, params: any): Promise<any> {
    switch (toolId) {
      case 'gmail_search':
        return await this.executeGmailSearch(params);
      case 'gmail_read_message':
        return await this.executeGmailReadMessage(params);
      case 'gmail_list_messages':
        return await this.executeGmailListMessages(params);
      case 'gmail_send_message':
        return await this.executeGmailSendMessage(params);
      case 'gmail_list_labels':
        return await this.executeGmailListLabels(params);
      default:
        throw new Error(`Unknown tool: ${toolId}`);
    }
  }

  private async executeGmailSearch(params: any): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Gmail integration not authenticated. Please complete OAuth2 flow first.');
    }

    const { query, maxResults = 10, includeSpamTrash = false } = params;
    
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
        includeSpamTrash
      });

      return response.data;
    } catch (error) {
      console.error('Gmail search error:', error);
      throw error;
    }
  }

  private async executeGmailReadMessage(params: any): Promise<any> {
    const { messageId, format = 'full' } = params;
    
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format
      });

      const data = response.data;
      
      // Format the response based on the requested format
      if (format === 'minimal') {
        return {
          id: data.id,
          threadId: data.threadId,
          labelIds: data.labelIds,
          snippet: data.snippet,
          historyId: data.historyId,
          internalDate: data.internalDate
        };
      }
      
      return data;
    } catch (error) {
      console.error('Gmail read message error:', error);
      throw error;
    }
  }

  private async executeGmailListMessages(params: any): Promise<any> {
    const { labelIds = ['INBOX'], maxResults = 10, pageToken } = params;
    
    try {
      const response = await fetch(`${this.mcpServerUrl}/gmail/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.botApiConfig.apiKey}`
        },
        body: JSON.stringify({
          labelIds,
          maxResults,
          pageToken,
          projectId: this.botApiConfig.projectId
        })
      });

      if (!response.ok) {
        throw new Error(`Gmail list messages failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gmail list messages error:', error);
      throw error;
    }
  }

  private async executeGmailSendMessage(params: any): Promise<any> {
    const { to, subject, body, cc, bcc } = params;
    
    try {
      const response = await fetch(`${this.mcpServerUrl}/gmail/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.botApiConfig.apiKey}`
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          cc,
          bcc,
          projectId: this.botApiConfig.projectId
        })
      });

      if (!response.ok) {
        throw new Error(`Gmail send message failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gmail send message error:', error);
      throw error;
    }
  }

  private async executeGmailListLabels(params: any): Promise<any> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/gmail/labels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.botApiConfig.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Gmail list labels failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gmail list labels error:', error);
      throw error;
    }
  }

  // Convenience methods for direct use
  async searchEmails(query: string, maxResults = 10): Promise<any[]> {
    const result = await this.executeMcpTool('gmail_search', { query, maxResults });
    return result.messages || [];
  }

  async readEmail(messageId: string, format = 'full'): Promise<any> {
    return await this.executeMcpTool('gmail_read_message', { messageId, format });
  }

  async listMessages(labelIds = ['INBOX'], maxResults = 10): Promise<any> {
    return await this.executeMcpTool('gmail_list_messages', { labelIds, maxResults });
  }

  async sendEmail(to: string, subject: string, body: string, cc?: string, bcc?: string): Promise<any> {
    return await this.executeMcpTool('gmail_send_message', { to, subject, body, cc, bcc });
  }

  async listLabels(): Promise<any[]> {
    const result = await this.executeMcpTool('gmail_list_labels', {});
    return result.labels || [];
  }
}

export function createGmailMcpBot(config: GmailMcpConfig): GmailMcpBot {
  return new GmailMcpBot(config);
} 