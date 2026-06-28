import React, { useState, useEffect } from "react";
import { 
  getAccessToken, 
  googleSignIn, 
  logout, 
  initAuth, 
  fetchGmailInbox, 
  sendGmailMessage, 
  fetchGoogleContacts, 
  createGoogleContact, 
  fetchCalendarEvents, 
  createCalendarEvent, 
  deleteCalendarEvent,
  GmailMessage,
  ContactItem,
  CalendarEvent
} from "../utils/googleWorkspace";
import { 
  Mail, 
  Users, 
  Calendar, 
  Send, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  User, 
  UserPlus,
  Clock, 
  AlertCircle, 
  LogOut, 
  Search, 
  ExternalLink,
  Sparkles,
  Award,
  Bell,
  Ticket
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";

export default function WorkspaceHub() {
  const { addNotification } = useApp();

  // Authentication states
  const [token, setToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"gmail" | "contacts" | "calendar">("gmail");

  // Loading indicator states
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);

  // Workspace Data states
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Search/Filters query states
  const [emailSearch, setEmailSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");

  // Expands
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  // Form states - Create Event
  const [eventSummary, setEventSummary] = useState("Weekly FF Diamonds Recharge Reminder");
  const [eventDescription, setEventDescription] = useState("Load weekly diamond membership via Linzo Store to secure topup rewards!");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("18:00");
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Form states - Add Contact
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  // Form states - Compose Email
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("GIFT: Premium Game Top-up activation voucher!");
  const [composeBody, setComposeBody] = useState("<div style='font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'><h2 style='color:#4f46e5;'>Linzo Store - Premium Gift Card Delivers!</h2><p>Your friend has gifted you a game top-up card voucher via Linzo Store!</p><p style='font-size:18px; font-weight:bold; color:#10b981; background:#f0fdf4; padding:10px 15px; border-radius:6px; display:inline-block;'>Voucher Code: LZ-DIAMONDS-88229F</p><p style='font-size:12px; color:#64748b;'>To redeem, load Linzo Store or access game activation terminal directly.</p></div>");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Auto detect session on component mounts
  useEffect(() => {
    const unsub = initAuth(
      (user, cachedToken) => {
        setToken(cachedToken);
        setGoogleUser(user);
        setNeedsAuth(false);
      },
      () => {
        setToken(null);
        setGoogleUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, []);

  // Fetch all Workspace Data
  const loadWorkspaceData = async (activeToken: string) => {
    if (!activeToken) return;
    setLoadingWorkspace(true);
    try {
      // Load and swallow failures individually so one broken API scope doesn't freeze components
      try {
        const inbox = await fetchGmailInbox(activeToken);
        setEmails(inbox);
      } catch (err) {
        console.error("Inbox load failure:", err);
      }

      try {
        const connections = await fetchGoogleContacts(activeToken);
        setContacts(connections);
      } catch (err) {
        console.error("Contacts load failure:", err);
      }

      try {
        const calendarEvents = await fetchCalendarEvents(activeToken);
        setEvents(calendarEvents);
      } catch (err) {
        console.error("Calendar load failure:", err);
      }
    } catch (e: any) {
      console.error("Google APIs pull batch failure:", e);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  // Re-load trigger on token acquisition or active tab updates
  useEffect(() => {
    if (token) {
      loadWorkspaceData(token);
    }
  }, [token]);

  // Login handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setGoogleUser(result.user);
        setNeedsAuth(false);
        addNotification(
          "🔒 Google Workspace Connected",
          "Google account synchronized with secure Gmail, Contacts, and Calendar access nodes.",
          "system"
        );
      }
    } catch (err: any) {
      console.error("Login authorization flow failure:", err);
      alert("Verification could not complete. This may occur if your browser popup is blocked or workspace permissions are not fully configured.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    const confirmSignout = window.confirm("Are you sure you want to log out and revoke local permissions?");
    if (!confirmSignout) return;
    
    try {
      await logout();
      setToken(null);
      setGoogleUser(null);
      setNeedsAuth(true);
      setEmails([]);
      setContacts([]);
      setEvents([]);
      addNotification("🔓 Google Account Disconnected", "Revoked in-memory token permissions successfully.", "system");
    } catch (err) {
      console.error("Logout failure:", err);
    }
  };

  // Compose / Giga Email Sender
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!composeTo || !composeSubject || !composeBody) {
      alert("Please fill in all email compose parameters.");
      return;
    }

    // MANDATORY Explicit user confirmation guard
    const isConfirmed = window.confirm(
      `MANDATORY TRANSACTION SHIELD:\n\nAre you sure you want to send this email via Gmail on your behalf to: ${composeTo}?`
    );
    if (!isConfirmed) return;

    setSendingEmail(true);
    try {
      await sendGmailMessage(token, composeTo, composeSubject, composeBody);
      addNotification("✉️ Custom Email Sent", `Successfully mailed voucher code details directly to ${composeTo}!`, "order");
      setComposeTo("");
      // Refresh inbox
      const inbox = await fetchGmailInbox(token);
      setEmails(inbox);
    } catch (err: any) {
      console.error("Failed to mail coupon code details:", err);
      alert(`API execution error: ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Dynamic Contact Creator
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!newContactName || !newContactEmail) {
      alert("Please enter both contact Name and valid Email address.");
      return;
    }

    // MANDATORY Explicit user confirmation guard
    const isConfirmed = window.confirm(
      `SAFE WRITER SHIELD:\n\nDo you want to create and add "${newContactName}" (${newContactEmail}) directly to your Google Contacts directory?`
    );
    if (!isConfirmed) return;

    setAddingContact(true);
    try {
      const added = await createGoogleContact(token, newContactName, newContactEmail, newContactPhone);
      setContacts(prev => [added, ...prev]);
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      addNotification("👥 Contact Generated", `Added "${added.name}" to Google Contacts directory successfully.`, "loyalty");
    } catch (err: any) {
      console.error("Failed to construct contact connection:", err);
      alert(`API execution error: ${err.message}`);
    } finally {
      setAddingContact(false);
    }
  };

  // Dynamic Calendar Event Scheduler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!eventDate || !eventTime) {
      alert("Please designate a target Date and Time for your recharge reminder!");
      return;
    }

    // MANDATORY Explicit user confirmation guard
    const isConfirmed = window.confirm(
      `SCHEDULER TRANSACT GUARD:\n\nDo you want to schedule and append the calendar event "${eventSummary}" directly onto your primary Google Calendar account?`
    );
    if (!isConfirmed) return;

    setCreatingEvent(true);
    try {
      const startIso = `${eventDate}T${eventTime}:00`;
      const endDateVal = new Date(`${eventDate}T${eventTime}:00`);
      endDateVal.setHours(endDateVal.getHours() + 1); // Default to 1-hour span
      const endIso = endDateVal.toISOString().replace(/\.\d+Z$/, "");

      const created = await createCalendarEvent(token, eventSummary, eventDescription, startIso, endIso);
      setEvents(prev => [created, ...prev]);
      setEventDate("");
      addNotification("📅 Calendar Reminder Logged", `Scheduled "${eventSummary}" event on Google Calendar successfully!`, "loyalty");
    } catch (err: any) {
      console.error("Failed to log calendar event reminder:", err);
      alert(`Calendar schedule error: ${err.message}`);
    } finally {
      setCreatingEvent(false);
    }
  };

  // Event deletion remover
  const handleDeleteEvent = async (eventId: string, summary: string) => {
    if (!token) return;

    // MANDATORY Explicit user confirmation guard
    const isConfirmed = window.confirm(
      `DESTRUCTION PREVENTION SHIELD:\n\nAre you sure you want to permanently delete the event "${summary}" from your Google Calendar?`
    );
    if (!isConfirmed) return;

    try {
      await deleteCalendarEvent(token, eventId);
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      addNotification("🗑️ Calendar Event Deleted", `Permanently removed "${summary}" from Google Calendar listings.`, "system");
    } catch (err: any) {
      console.error("Could not remove designated event:", err);
      alert(`Calendar update error: ${err.message}`);
    }
  };

  // Autofill recipient email details when clicked from Contact checklist
  const handleAutofillGifting = (email: string) => {
    setComposeTo(email);
    setActiveSubTab("gmail");
    addNotification("🎯 Contact Recipient Set", `Recipient field auto-assigned to ${email}.`, "system");
  };

  // Preset generator for scheduling top-ups instantly
  const handleSetQuickReminder = (daysAhead: number, title: string) => {
    const today = new Date();
    today.setDate(today.getDate() + daysAhead);
    
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    
    setEventDate(`${year}-${month}-${day}`);
    setEventTime("12:00");
    setEventSummary(title);
    setEventDescription(`Automated gaming top-up reminder via Linzo Hub! Check out secure packages direct at Linzo Store.`);
    setActiveSubTab("calendar");
    
    addNotification("⏳ Presetted Template Created", `Designated a custom "${title}" event template. Complete fields with dates to schedule details.`, "system");
  };

  // Filter lists based on query
  const filteredEmails = emails.filter(m => 
    m.subject?.toLowerCase().includes(emailSearch.toLowerCase()) ||
    m.from?.toLowerCase().includes(emailSearch.toLowerCase()) ||
    m.snippet?.toLowerCase().includes(emailSearch.toLowerCase())
  );

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  // Sign in component
  if (needsAuth) {
    return (
      <div className="premium-glass-panel rounded-3xl border border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
        
        {/* Soft atmospheric gradient */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-pink-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center animate-pulse-slow mb-6">
          <Sparkles size={30} />
        </div>

        <h2 className="font-display font-black text-2xl text-white tracking-widest uppercase">
          LINZO GOOGLE WORKSPACE HUB
        </h2>
        
        <p className="text-xs text-slate-400 max-w-md mt-3 mb-8 leading-relaxed font-medium">
          Connect your secure Google Account with permission from the app's users to unlock superpowered gaming integrations! Draft custom diamond vouchers, list contacts, or set game-period recharge calendars directly.
        </p>

        <div className="premium-glass-panel p-4 rounded-2xl border border-slate-800 text-left max-w-md w-full mb-8 font-serif leading-normal space-y-2.5 text-xs text-slate-300">
          <p className="font-sans font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Check size={11} className="text-emerald-400" /> Integrated Workflows
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 font-sans text-[11px] leading-relaxed">
            <li><strong>Gmail API</strong>: Auto-draft or email digital vouchers, promo receipts, and codes directly to your inboxes.</li>
            <li><strong>People API (Contacts)</strong>: Sync friend rosters and select users instantly to complete direct checkout gifting.</li>
            <li><strong>Calendar API</strong>: Bind automated upcoming package reminders so you never trail tournament flash sales.</li>
          </ul>
        </div>

        {/* Official-looking GSI button styling */}
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="relative inline-flex items-center justify-center tracking-wide font-bold bg-white text-slate-900 px-6 py-3.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer pointer-events-auto shadow-lg text-sm select-none"
        >
          {isLoggingIn ? (
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="animate-spin text-indigo-600" />
              <span>Verifying authorization...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }} className="w-[18px] h-[18px]">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Connect with Google Workspace</span>
            </div>
          )}
        </button>

        <p className="text-[10px] text-slate-500 mt-4">
          See the card below to authenticate Gmail, Contacts & Calendar access securely.
        </p>
      </div>
    );
  }

  // Active Authenticated Hub View
  return (
    <div className="space-y-6">
      
      {/* Top Banner Auth Profile Container */}
      <div className="premium-glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950/40">
        <div className="flex items-center gap-3">
          {googleUser?.photoURL ? (
            <img 
              src={googleUser.photoURL} 
              alt={googleUser.displayName || "Google User"} 
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-white font-bold uppercase">
              {googleUser?.displayName?.slice(0, 2) || "GU"}
            </div>
          )}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider text-[9px] border border-emerald-500/20">Authorized Sync</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Linzo Hub</span>
            </div>
            <h2 className="font-display font-semibold text-lg text-white mt-1 leading-snug">{googleUser?.displayName || "Google Workspace User"}</h2>
            <p className="text-xs text-slate-400 font-mono">{googleUser?.email}</p>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadWorkspaceData(token!)}
            disabled={loadingWorkspace}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 border border-slate-800/80 transition-all duration-200 cursor-pointer pointer-events-auto"
            title="Force refresh workspace APIs"
          >
            <RefreshCw size={15} className={loadingWorkspace ? "animate-spin text-indigo-400" : ""} />
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer pointer-events-auto border border-transparent hover:border-red-500/15"
          >
            <LogOut size={13} />
            <span>Revoke Sync</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation Sidebar Drawer */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 p-1.5 bg-slate-950/40 border border-slate-800/60 rounded-2xl shrink-0">
          {[
            { id: "gmail", label: "Gmail Box & Compose", icon: Mail, desc: "Draft and send diamond codes" },
            { id: "contacts", label: "Google Contacts", icon: Users, desc: "Recipients & gifting contacts" },
            { id: "calendar", label: "Recharge Calendar", icon: Calendar, desc: "Reminders & flash sales tracker" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 text-left flex items-center lg:items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer pointer-events-auto ${
                  isSel 
                    ? "bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 shadow-md"
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-white border border-transparent"
                }`}
              >
                <Icon size={15} className={`shrink-0 mt-0.5 ${isSel ? "text-indigo-400 animate-pulse-slow" : "text-slate-400"}`} />
                <div className="hidden lg:block">
                  <p className="font-bold text-xs">{tab.label}</p>
                  <p className="text-[9px] text-slate-500 font-medium leading-none mt-0.5">{tab.desc}</p>
                </div>
                <span className="lg:hidden font-bold text-xs">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}

          <div className="hidden lg:block pt-4 border-t border-slate-800/60 mt-4 p-3 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Quick Templates</span>
            <button
              onClick={() => handleSetQuickReminder(7, "Free Fire Weekly Diamonds Recharge")}
              className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/50 text-[10px] text-slate-400 flex items-center justify-between transition-all font-mono pointer-events-auto"
            >
              <span>Weekly FF Remind</span>
              <Plus size={10} className="text-indigo-400" />
            </button>
            <button
              onClick={() => handleSetQuickReminder(30, "PUBG Mobile Prime Plus Renewal Reminder")}
              className="w-full text-left p-2 rounded-lg bg-slate-900/40 hover:bg-slate-800 border border-slate-800/50 text-[10px] text-slate-400 flex items-center justify-between transition-all font-mono pointer-events-auto"
            >
              <span>Monthly PUBG Renew</span>
              <Plus size={10} className="text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Active Sub Tab Component Content Area */}
        <div className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: GMAIL */}
            {activeSubTab === "gmail" && (
              <motion.div
                key="gmail"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                
                {/* Compose Form */}
                <div className="premium-glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800/60">
                    <Send size={14} className="text-indigo-400" />
                    Send Top-Up Code Voucher or Payment Receipt
                  </h3>
                  
                  <form onSubmit={handleSendEmail} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recipient To address</label>
                      <input 
                        type="email"
                        required
                        placeholder="recipient@example.com"
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                      <p className="text-[9px] text-slate-500 leading-normal">Enter friend email address or select and click on any saved connection in Contacts tab to autofill instantly.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Subject Title</label>
                      <input 
                        type="text"
                        required
                        placeholder="Gifting item confirmation"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Message HTML Body markup</label>
                      <textarea
                        rows={5}
                        required
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-indigo-500/50 font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingEmail}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer pointer-events-auto transition-all shadow-md select-none"
                      >
                        {sendingEmail ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Mailing secure data...</span>
                          </>
                        ) : (
                          <>
                            <Mail size={13} />
                            <span>Send Email via Gmail</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Inbox summaries */}
                <div className="premium-glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                    <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <Mail size={14} className="text-indigo-400" />
                      Recent Inbox Messages ({emails.length})
                    </h3>
                    
                    <div className="relative flex items-center w-full sm:w-60 bg-slate-950/40 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px]">
                      <Search size={12} className="text-slate-400 mr-1.5" />
                      <input 
                        type="text"
                        placeholder="Search emails..."
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        className="bg-transparent text-[11px] outline-none text-slate-300 placeholder-slate-500 w-full"
                      />
                    </div>
                  </div>

                  {loadingWorkspace ? (
                    <div className="text-center py-8">
                      <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto mb-2" />
                      <span className="text-xs text-slate-400">Loading secure inbox messages...</span>
                    </div>
                  ) : filteredEmails.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No emails matching current filters.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                      {filteredEmails.map((email) => {
                        const isExpanded = expandedEmailId === email.id;
                        return (
                          <div 
                            key={email.id}
                            className={`p-3 rounded-xl border transition-all duration-200 select-none ${
                              isExpanded 
                                ? "bg-slate-900 border-indigo-500/20 shadow-lg" 
                                : "bg-slate-950/20 border-slate-800 hover:border-slate-700 hover:bg-slate-950/40"
                            }`}
                          >
                            <div 
                              onClick={() => setExpandedEmailId(isExpanded ? null : email.id)}
                              className="flex items-start justify-between gap-2 cursor-pointer font-sans"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-200 line-clamp-1">{email.subject}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">From: {email.from}</p>
                              </div>
                              <span className="text-[9px] font-mono text-slate-500 shrink-0 mt-0.5">{email.date?.split(",")[0] || email.date}</span>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed max-h-[150px] overflow-y-auto font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                                {email.snippet}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB 2: CONTACTS */}
            {activeSubTab === "contacts" && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-6"
              >
                
                {/* Left hand list of Google Contacts */}
                <div className="md:col-span-3 premium-glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                    <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <Users size={14} className="text-indigo-400" />
                      Google connections ({contacts.length})
                    </h3>
                    
                    <div className="relative flex items-center bg-slate-950/40 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] w-full sm:w-44">
                      <Search size={12} className="text-slate-400 mr-1.5" />
                      <input 
                        type="text"
                        placeholder="Search contacts..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="bg-transparent text-[11px] outline-none text-slate-300 placeholder-slate-500 w-full"
                      />
                    </div>
                  </div>

                  {loadingWorkspace ? (
                    <div className="text-center py-10">
                      <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto mb-2" />
                      <span className="text-xs text-slate-400">Syncing contact connections...</span>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">Google account connections book is empty or filtered to zero.</p>
                  ) : (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                      {filteredContacts.map((contact) => (
                        <div 
                          key={contact.resourceName}
                          className="p-3 rounded-xl bg-slate-950/10 border border-slate-800 hover:border-slate-700 hover:bg-slate-950/30 transition-all flex items-center justify-between gap-3 font-sans"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {contact.avatarUrl ? (
                              <img 
                                src={contact.avatarUrl} 
                                alt={contact.name} 
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                                {contact.name.slice(0,2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-white truncate">{contact.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{contact.email}</p>
                              {contact.phoneNumber && <p className="text-[9px] text-slate-500 mt-0.5">{contact.phoneNumber}</p>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleAutofillGifting(contact.email)}
                              className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white border border-indigo-600/20 text-indigo-400 font-bold text-[9px] uppercase rounded-lg transition-all cursor-pointer pointer-events-auto"
                            >
                              Gift Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right hand add contact form */}
                <div className="md:col-span-2 premium-glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 h-fit">
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800/60 font-sans">
                    <UserPlus size={14} className="text-indigo-400" />
                    Add Friend Contact
                  </h3>

                  <form onSubmit={handleAddContact} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Display Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="John Doe"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
                      <input 
                        type="email"
                        required
                        placeholder="john.doe@gmail.com"
                        value={newContactEmail}
                        onChange={(e) => setNewContactEmail(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mobile Number (Optional)</label>
                      <input 
                        type="tel"
                        placeholder="+880 1700-000000"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="w-full bg-[#0E1322] border border-slate-800 text-xs rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingContact}
                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase py-2.5 rounded-xl cursor-pointer pointer-events-auto transition-all shadow-md select-none"
                    >
                      {addingContact ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Generating Contact...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={13} />
                          <span>Add Contact to Google</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </motion.div>
            )}

            {/* TAB 3: CALENDAR */}
            {activeSubTab === "calendar" && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-6"
              >
                
                {/* Active calendar events */}
                <div className="md:col-span-3 premium-glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
                  <div className="pb-2 border-b border-slate-800/60 flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <Calendar size={14} className="text-indigo-400" />
                      Scheduled reminders ({events.length})
                    </h3>
                  </div>

                  {loadingWorkspace ? (
                    <div className="text-center py-10">
                      <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto mb-2" />
                      <span className="text-xs text-slate-400">Syncing calendar list...</span>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <span className="text-xs text-slate-500 block">No upcoming reminders on your Google Calendar.</span>
                      <p className="text-[10px] text-slate-600">Quickly use the template scheduler panel on the right to log diamond recharge timers.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 no-scrollbar text-left font-sans">
                      {events.map((ev) => (
                        <div 
                          key={ev.id}
                          className="p-3 rounded-xl bg-slate-950/15 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <p className="font-bold text-xs text-white leading-snug">{ev.summary}</p>
                            {ev.description && <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal">{ev.description}</p>}
                            
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-2 font-mono">
                              <Clock size={10} className="text-indigo-400" />
                              <span>{new Date(ev.start.dateTime).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {ev.htmlLink && (
                              <a 
                                href={ev.htmlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-550 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-all"
                                title="View in Google Calendar browser"
                              >
                                <ExternalLink size={11} />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.summary)}
                              className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer pointer-events-auto"
                              title="Revoke and cancel event reminder"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scheduler Creation Panel */}
                <div className="md:col-span-2 premium-glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 h-fit">
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800/60 font-sans">
                    <Plus size={14} className="text-indigo-400" />
                    Log Recharge Event
                  </h3>

                  <form onSubmit={handleCreateEvent} className="space-y-3.5 text-left font-sans">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Event Header Title</label>
                      <input 
                        type="text"
                        required
                        value={eventSummary}
                        onChange={(e) => setEventSummary(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                      <textarea 
                        rows={2}
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Date</label>
                        <input 
                          type="date"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2 px-2 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time</label>
                        <input 
                          type="time"
                          required
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="w-full bg-slate-950/40 border border-slate-800 text-xs rounded-lg py-2 px-2 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={creatingEvent}
                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase py-2.5 rounded-xl cursor-pointer pointer-events-auto transition-all shadow-md select-none"
                    >
                      {creatingEvent ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Publishing event...</span>
                        </>
                      ) : (
                        <>
                          <Calendar size={13} />
                          <span>Schedule on Calendar</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
