export class MikrotikService {
  private baseUrl: string
  private headers: Headers

  constructor(host: string, port: number = 443, private user: string, private pass: string) {
    // Determine protocol based on port (443 or similar -> HTTPS, others -> HTTP or custom)
    // RouterOS REST API usually runs on 443 (HTTPS) or 80 (HTTP)
    const protocol = port === 443 ? 'https' : 'http'
    this.baseUrl = `${protocol}://${host}:${port}/rest`
    
    // Create Basic Auth header
    const auth = Buffer.from(`${user}:${pass}`).toString('base64')
    this.headers = new Headers({
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    })
  }

  // --- Core Methods ---

  public async request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    try {
      // In development, handle self-signed certificates
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
      
      const options: RequestInit = {
        method,
        headers: this.headers,
        signal: controller.signal,
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      // Note: Node's fetch doesn't support 'agent' option easily without undici or similar if dealing with strict SSL.
      // But in Next.js 13+ (Node 18+), fetch is global. 
      // To ignore SSL in dev, we might need process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' temporarily or configure a custom agent.
      // For now, we assume valid certs or HTTP for simplicity in this initial version. 
      // If user has issues, we can add https-agent.

      const response = await fetch(`${this.baseUrl}${endpoint}`, options)
      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMsg = `MikroTik API Error: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.detail || errorData.message) {
             errorMsg += ` - ${errorData.detail || errorData.message}`
          }
        } catch {}
        throw new Error(errorMsg)
      }

      return await response.json() as T
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Connection timed out')
      }
      throw error
    }
  }

  // --- Features ---

  async checkConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Fetch system resource as a lightweight check
      const data = await this.request<any>('/system/resource')
      return { success: true, message: 'Connected successfully', data }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  // Hotspot Users
  async getHotspotUsers() {
    return this.request('/ip/hotspot/user')
  }

  async addHotspotUser(name: string, password?: string, profile?: string, comment?: string) {
    return this.request('/ip/hotspot/user', 'PUT', { name, password, profile, comment })
  }

  async removeHotspotUser(id: string) {
    return this.request(`/ip/hotspot/user/${id}`, 'DELETE')
  }

  // Active Users
  async getActiveUsers() {
    return this.request('/ip/hotspot/active')
  }

  async removeActiveUser(id: string) {
    return this.request(`/ip/hotspot/active/${id}`, 'DELETE')
  }

  // Profiles
  async getProfiles() {
    return this.request('/ip/hotspot/user/profile')
  }

  // Logs
  async getLogs() {
    // return this.request('/log?topics=hotspot,info,account') // Filter example
     return this.request('/log')
  }
}
