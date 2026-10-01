// src/lib/linkedin.ts
// LINKER - LinkedIn API integration
// Uses ONLY official OAuth 2.0 and LinkedIn Share API (v2/ugcPosts)
// Tokens are NEVER exposed to the client.
// Honest state when credentials are not configured.

export interface LinkedInConnectionState {
  isConfigured: boolean;
  isConnected: boolean;
  displayName: string | null;
  expiresAt: Date | null;
  isExpired: boolean;
  scope: string[];
  missingConfig: string[];
}

export interface LinkedInPublishResult {
  success: boolean;
  linkedinPostId?: string;
  errorMessage?: string;
  providerResponse?: unknown;
}

// ── Check if LinkedIn credentials are configured ─────────────
export function isLinkedInConfigured(): boolean {
  return !!(
    process.env.LINKEDIN_CLIENT_ID &&
    process.env.LINKEDIN_CLIENT_SECRET
  );
}

export function getLinkedInMissingConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.LINKEDIN_CLIENT_ID) missing.push('LINKEDIN_CLIENT_ID');
  if (!process.env.LINKEDIN_CLIENT_SECRET) missing.push('LINKEDIN_CLIENT_SECRET');
  return missing;
}

// ── Publish a post to LinkedIn using official Share API ──────
// References: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api
export async function publishToLinkedIn(params: {
  accessToken: string;
  linkedinUserId: string;
  content: string;
}): Promise<LinkedInPublishResult> {
  const { accessToken, linkedinUserId, content } = params;

  // LinkedIn character limit check
  if (content.length > 3000) {
    return {
      success: false,
      errorMessage: `Content exceeds LinkedIn's 3000 character limit (current: ${content.length} characters).`,
    };
  }

  const body = {
    author: `urn:li:person:${linkedinUserId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  try {
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        errorMessage: `LinkedIn API error ${res.status}: ${JSON.stringify(responseData)}`,
        providerResponse: responseData,
      };
    }

    // Extract the post ID from the LinkedIn response header or body
    const postId =
      (responseData as Record<string, string>).id ??
      res.headers.get('X-RestLi-Id') ??
      undefined;

    return {
      success: true,
      linkedinPostId: postId,
      providerResponse: responseData,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Unknown error contacting LinkedIn API',
    };
  }
}

// ── Get LinkedIn profile info ─────────────────────────────────
export async function getLinkedInProfile(accessToken: string): Promise<{
  id: string;
  displayName: string;
  profilePicture?: string;
} | null> {
  try {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      sub: string;
      name: string;
      picture?: string;
    };

    return {
      id: data.sub,
      displayName: data.name,
      profilePicture: data.picture,
    };
  } catch {
    return null;
  }
}

// ── Verify stored token is still valid ───────────────────────
export async function verifyLinkedInToken(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
