import { MeetingProvider, MeetingDetails, MeetingResult } from "./MeetingProvider";

export class TeamsProvider implements MeetingProvider {
  private tenantId = process.env.MS_TEAMS_TENANT_ID;
  private clientId = process.env.MS_TEAMS_CLIENT_ID;
  private clientSecret = process.env.MS_TEAMS_CLIENT_SECRET;
  private hostUserId = process.env.MS_TEAMS_USER_ID; // The AAD User ID holding the Teams license
  
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.tenantId || !this.clientId || !this.clientSecret || !this.hostUserId) {
      throw new Error("Microsoft Teams credentials are not configured in environment variables.");
    }

    const url = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: "https://graph.microsoft.com/.default",
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get Teams access token: ${errorText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return this.accessToken as string;
  }

  async createMeeting(details: MeetingDetails): Promise<MeetingResult> {
    const token = await this.getAccessToken();

    // End time is startTime + duration
    const endDateTime = new Date(details.startTime.getTime() + details.durationMinutes * 60000);

    const url = `https://graph.microsoft.com/v1.0/users/${this.hostUserId}/onlineMeetings`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDateTime: details.startTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        subject: details.topic,
        isEntryExitAnnounced: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Teams meeting: ${errorText}`);
    }

    const data = await response.json();

    return {
      joinUrl: data.joinWebUrl,
      meetingId: data.id,
      provider: "teams",
    };
  }
}
