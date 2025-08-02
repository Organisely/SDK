import { OAuthTokenResponse, ApiResponse } from './types'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
}

export class OrganiselyOAuth {
  private config: OAuthConfig

  constructor(config: OAuthConfig) {
    this.config = config
  }

  // Generate authorization URL
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      ...(state && { state })
    })

    return `${this.config.authUrl}?${params.toString()}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<ApiResponse<OAuthTokenResponse>> {
    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.error_description
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token exchange failed'
      }
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<ApiResponse<OAuthTokenResponse>> {
    try {
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.error_description
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      }
    }
  }

  // Revoke access token
  async revokeToken(token: string, tokenType: 'access_token' | 'refresh_token' = 'access_token'): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(this.config.tokenUrl.replace('/token', '/revoke'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          token,
          token_type_hint: tokenType
        })
      })

      if (!response.ok) {
        const data = await response.json()
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token revocation failed'
      }
    }
  }

  // Validate token (if the OAuth provider supports it)
  async validateToken(accessToken: string): Promise<ApiResponse<boolean>> {
    try {
      // This is a generic implementation - specific OAuth providers may have different endpoints
      const response = await fetch(this.config.tokenUrl.replace('/token', '/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          access_token: accessToken
        })
      })

      return {
        success: true,
        data: response.ok
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token validation failed'
      }
    }
  }
} 