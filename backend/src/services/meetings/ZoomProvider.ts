import { MeetingProvider, MeetingDetails, MeetingResult } from "./MeetingProvider";

export class ZoomProvider implements MeetingProvider {
  private accountId = process.env.ZOOM_ACCOUNT_ID;
  private clientId = process.env.ZOOM_CLIENT_ID;
  private clientSecret = process.env.ZOOM_CLIENT_SECRET;
  
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.accountId || !this.clientId || !this.clientSecret) {
      throw new Error("Zoom credentials are not configured in environment variables.");
    }

    const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    
    const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get Zoom access token: ${errorText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Zoom token typically expires in 3599 seconds, we subtract a small buffer (60s)
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return this.accessToken as string;
  }

  async createMeeting(details: MeetingDetails): Promise<MeetingResult> {
    const token = await this.getAccessToken();

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: details.topic,
        type: 2, // Scheduled meeting
        start_time: details.startTime.toISOString(),
        duration: details.durationMinutes,
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          jbh_time: 0,
          mute_upon_entry: true,
          waiting_room: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Zoom meeting: ${errorText}`);
    }

    const data = await response.json();

    return {
      joinUrl: data.join_url,
      hostUrl: data.start_url,
      meetingId: data.id.toString(),
      provider: "zoom",
    };
  }
}
