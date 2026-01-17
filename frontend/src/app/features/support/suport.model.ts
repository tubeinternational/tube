export interface ContactUsPayload {
  fullName: string;
  email: string;
  message: string;
}

export interface ContentRemovalPayload {
  fullName: string;
  email: string;
  contentUrl: string;
  reason: string;
}
