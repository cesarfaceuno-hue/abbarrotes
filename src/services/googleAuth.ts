/**
 * Client-side Google Auth wrapper using Google Identity Services (GSI).
 * 
 * SECURITY NOTICE:
 * To maintain security, Service Account identities and credentials MUST NOT be
 * included in client-side code. This wrapper handles client-side token acquisition
 * for user-authorized actions. 
 * 
 * Service Account interactions (using abarrotes1-sheets-agent-754@gen-lang-client-0510827236.iam.gserviceaccount.com) 
 * MUST be performed exclusively within the server-side API routes (/api/*) to
 * protect the integrity of the ABARROTES1 backend.
 */

export const getGoogleAccessToken = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // @ts-ignore - Google Identity Services client implementation
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse: { error?: string; access_token: string }) => {
        if (tokenResponse.error) {
          reject(tokenResponse);
        } else {
          resolve(tokenResponse.access_token);
        }
      },
    });

    client.requestAccessToken();
  });
};
