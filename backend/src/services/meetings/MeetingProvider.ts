export interface MeetingDetails {
  topic: string;
  startTime: Date;
  durationMinutes: number;
}

export interface MeetingResult {
  joinUrl: string;
  hostUrl?: string; // Some providers give a specific start URL for the host
  meetingId: string;
  provider: "zoom" | "teams";
}

export interface MeetingProvider {
  /**
   * Generates a unique meeting link for the given details
   */
  createMeeting(details: MeetingDetails): Promise<MeetingResult>;
}
