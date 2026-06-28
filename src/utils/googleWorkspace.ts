import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Request requested scopes for gmail, calendar and contacts
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/contacts",
  "https://www.googleapis.com/auth/contacts.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

const provider = new GoogleAuthProvider();
GOOGLE_SCOPES.forEach(scope => provider.addScope(scope));

// Enable prompt to make sure it handles account selections smoothly
provider.setCustomParameters({
  prompt: "select_account"
});

// Cache variables
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

// Initialize Google OAuth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear tokens when state is active but no token cache (e.g. refreshed page)
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in via Google Auth Pop-up window
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    if (!token) {
      throw new Error("Failed to retrieve Google Access Token during verification step.");
    }

    cachedAccessToken = token;
    currentUser = result.user;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error("Firebase Login Verification Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  currentUser = null;
};

// ==========================================
// Gmail API Services
// ==========================================

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
  body?: string;
}

export const fetchGmailInbox = async (token: string, query: string = ""): Promise<GmailMessage[]> => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Gmail API inbox fetch failure: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.messages) return [];

  // Fetch details in parallel up to limit for full usability experience
  const detailPromises = data.messages.slice(0, 6).map(async (msg: { id: string }) => {
    try {
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
      const detailRes = await fetch(detailUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!detailRes.ok) return null;
      
      const detailData = await detailRes.json();
      const headers = detailData.payload.headers as Array<{ name: string; value: string }>;
      const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
      const dateHeader = headers.find((h) => h.name.toLowerCase() === "date")?.value || "";

      return {
        id: detailData.id,
        threadId: detailData.threadId,
        snippet: detailData.snippet || "",
        subject,
        from,
        date: dateHeader
      };
    } catch {
      return null;
    }
  });

  const detailedMessages = await Promise.all(detailPromises);
  return detailedMessages.filter(Boolean) as GmailMessage[];
};

// Safe construct base64 RFC2822 parameters
export const buildRfc2822Message = (to: string, subject: string, htmlMessage: string) => {
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    htmlMessage
  ];
  
  const email = emailLines.join("\r\n");
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const sendGmailMessage = async (
  token: string,
  to: string,
  subject: string,
  htmlMessage: string
): Promise<any> => {
  const rawMessage = buildRfc2822Message(to, subject, htmlMessage);
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: rawMessage })
  });

  if (!response.ok) {
    throw new Error(`Gmail API send failure: ${response.statusText}`);
  }

  return response.json();
};

// ==========================================
// Google People / Contacts API Services
// ==========================================

export interface ContactItem {
  resourceName: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export const fetchGoogleContacts = async (token: string): Promise<ContactItem[]> => {
  const url = "https://people.googleapis.com/v1/people/me/connections?pageSize=50&personFields=names,emailAddresses,phoneNumbers,photos";
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`People API connection collection failure: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.connections) return [];

  return data.connections.map((c: any) => {
    const nameObj = c.names?.[0];
    const name = nameObj?.displayName || "Unnamed Contact";
    const email = c.emailAddresses?.[0]?.value || "";
    const phoneNumber = c.phoneNumbers?.[0]?.value || "";
    const avatarUrl = c.photos?.[0]?.url || "";

    return {
      resourceName: c.resourceName,
      name,
      email,
      phoneNumber,
      avatarUrl
    };
  }).filter((item: ContactItem) => item.email !== ""); // Filter out contacts without emails for simplicity
};

export const createGoogleContact = async (
  token: string,
  name: string,
  email: string,
  phone: string = ""
): Promise<ContactItem> => {
  const url = "https://people.googleapis.com/v1/people:createContact";
  
  const body = {
    names: [
      {
        givenName: name,
        displayName: name
      }
    ],
    emailAddresses: [
      {
        value: email,
        type: "home"
      }
    ],
    ...(phone ? {
      phoneNumbers: [
        {
          value: phone,
          type: "mobile"
        }
      ]
    } : {})
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`People API contact creation failure: ${response.statusText}`);
  }

  const c = await response.json();
  return {
    resourceName: c.resourceName,
    name: c.names?.[0]?.displayName || name,
    email: c.emailAddresses?.[0]?.value || email,
    phoneNumber: c.phoneNumbers?.[0]?.value || "",
    avatarUrl: c.photos?.[0]?.url || ""
  };
};

// ==========================================
// Google Calendar API Services
// ==========================================

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  htmlLink?: string;
  location?: string;
}

export const fetchCalendarEvents = async (token: string): Promise<CalendarEvent[]> => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(new Date().toISOString())}&maxResults=20`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Calendar API event query failure: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.items) return [];

  return data.items.map((e: any) => ({
    id: e.id,
    summary: e.summary || "Unnamed Schedule Event",
    description: e.description || "",
    start: {
      dateTime: e.start?.dateTime || e.start?.date || "",
      timeZone: e.start?.timeZone
    },
    end: {
      dateTime: e.end?.dateTime || e.end?.date || "",
      timeZone: e.end?.timeZone
    },
    htmlLink: e.htmlLink,
    location: e.location
  }));
};

export const createCalendarEvent = async (
  token: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  location: string = "Linzo Store"
): Promise<CalendarEvent> => {
  const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
  
  const body = {
    summary,
    description,
    location,
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Calendar Event publish failure: ${response.statusText}`);
  }

  return response.json();
};

export const deleteCalendarEvent = async (token: string, eventId: string): Promise<void> => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Calendar Event delete failure: ${response.statusText}`);
  }
};
