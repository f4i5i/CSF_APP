/**
 * Built-in Mass Email templates — five distinct THEMES.
 *
 * Authored strictly with editor-safe markup (headings, alignment, colored /
 * highlighted spans, lists, blockquotes, emoji) so ReactQuill can load and
 * edit them without mangling — and email clients render them faithfully.
 * At send time the backend wraps the body in the branded CSF frame
 * (logo header + "Hi {name}," greeting + footer), so templates provide
 * only the message content.
 */

const NAVY = "#173151";
const GOLD = "#b8860b"; // readable gold for text
const GOLD_BG = "#fff3cd"; // soft gold highlight
const RED = "#c0392b";
const RED_BG = "#fdecea";

export const BUILTIN_EMAIL_TEMPLATES = [
  {
    id: "builtin-letter",
    name: "Classic Letter",
    description: "Content-first, personal update",
    headerSubtitle: "Announcement",
    accent: "#173151",
    includeClosing: true,
    subject: "An update from Carolina Soccer Factory",
    html:
      `<h2><strong style="color:${NAVY}">A quick update from CSF</strong></h2>` +
      `<p>We wanted to share some news with you about our soccer programs.</p>` +
      `<p><em>[Write your update here — what is happening, when, and what it means for your child.]</em></p>` +
      `<p><strong style="color:${NAVY}">What you need to know:</strong></p>` +
      `<ul><li>[Key point one]</li><li>[Key point two]</li><li>[Key point three]</li></ul>` +
      `<p>Thank you for being part of the CSF family.</p>`,
  },
  {
    id: "builtin-poster",
    name: "Event Poster",
    description: "Big, bold, centered — like a flyer",
    headerSubtitle: "You're Invited",
    accent: "#b8860b",
    includeClosing: false,
    subject: "⚽ [EVENT NAME] — Save the date!",
    html:
      `<p style="text-align:center">⚽🏆⚽</p>` +
      `<h1 style="text-align:center"><strong style="color:${NAVY}">[EVENT NAME]</strong></h1>` +
      `<h3 style="text-align:center"><em style="color:${GOLD}">[One exciting tagline goes here]</em></h3>` +
      `<p style="text-align:center">──────────</p>` +
      `<h2 style="text-align:center"><strong style="background-color:${GOLD_BG};color:${NAVY}">&nbsp;[SATURDAY, SEPT 00]&nbsp;</strong></h2>` +
      `<h3 style="text-align:center"><strong style="color:${NAVY}">[0:00 PM – 0:00 PM]</strong></h3>` +
      `<p style="text-align:center"><strong>📍 [Venue name &amp; address]</strong></p>` +
      `<p style="text-align:center"><em>🖼️ [Add your event photo here — click the image icon in the toolbar]</em></p>` +
      `<p style="text-align:center">──────────</p>` +
      `<p style="text-align:center">[Two lines about what's happening: games, prizes, food trucks, family fun.]</p>` +
      `<p style="text-align:center"><strong style="color:${GOLD}">FREE FOR ALL CSF FAMILIES</strong></p>` +
      `<p style="text-align:center"><em>RSVP by [date] — just reply to this email!</em></p>`,
  },
  {
    id: "builtin-social",
    name: "Social Blast",
    description: "Short, punchy, emoji-forward",
    headerSubtitle: "News Flash",
    accent: "#173151",
    includeClosing: false,
    subject: "🔥 Big news from CSF!",
    html:
      `<h2 style="text-align:center"><strong style="color:${NAVY}">📣 [YOUR BIG NEWS IN ONE LINE!]</strong></h2>` +
      `<p style="text-align:center">[One short punchy sentence. That's it. Keep it snappy.]</p>` +
      `<p style="text-align:center">✅ [Cool thing one]<br/>✅ [Cool thing two]<br/>✅ [Cool thing three]</p>` +
      `<p style="text-align:center"><strong style="background-color:${GOLD_BG};color:${NAVY}">&nbsp;👉 [WHAT TO DO NOW — e.g. "Spots are limited, register today!"] 👈&nbsp;</strong></p>` +
      `<p style="text-align:center"><em style="color:${GOLD}">#CarolinaSoccerFactory #YouthSoccer #[YourTag]</em></p>`,
  },
  {
    id: "builtin-newsletter",
    name: "Newsletter Digest",
    description: "Sectioned monthly-style roundup",
    headerSubtitle: "Monthly Newsletter",
    accent: "#1e7e34",
    includeClosing: false,
    subject: "CSF Monthly Kickaround — [Month] edition 🗞️",
    html:
      `<h2><strong style="color:${NAVY}">The CSF Kickaround</strong> <em style="color:${GOLD}">— [Month] edition</em></h2>` +
      `<p><em>Everything happening around the academy, in two minutes.</em></p>` +
      `<h3><strong style="background-color:${GOLD_BG};color:${NAVY}">&nbsp;⚽ On the field&nbsp;</strong></h3>` +
      `<p>[What the kids have been working on — skills, highlights, coach shoutouts.]</p>` +
      `<h3><strong style="background-color:${GOLD_BG};color:${NAVY}">&nbsp;📅 Mark your calendar&nbsp;</strong></h3>` +
      `<ul><li><strong>[Date]</strong> — [Event or deadline]</li><li><strong>[Date]</strong> — [Event or deadline]</li></ul>` +
      `<h3><strong style="background-color:${GOLD_BG};color:${NAVY}">&nbsp;⭐ Player spotlight&nbsp;</strong></h3>` +
      `<p>[Celebrate a player, a team, or a milestone this month.]</p>` +
      `<p><em>🖼️ [Add a photo of the moment — click the image icon in the toolbar]</em></p>` +
      `<h3><strong style="background-color:${GOLD_BG};color:${NAVY}">&nbsp;📝 Reminders&nbsp;</strong></h3>` +
      `<ul><li>[Reminder one]</li><li>[Reminder two]</li></ul>` +
      `<p>See you on the pitch! ⚽</p>`,
  },
  {
    id: "builtin-alert",
    name: "Urgent Alert",
    description: "Weather / cancellation notice",
    headerSubtitle: "Urgent Notice",
    accent: "#c0392b",
    includeClosing: false,
    subject: "⚠️ Important: [Class name] — [today's date]",
    html:
      `<h2 style="text-align:center"><strong style="background-color:${RED_BG};color:${RED}">&nbsp;⚠️ IMPORTANT NOTICE ⚠️&nbsp;</strong></h2>` +
      `<h3 style="text-align:center"><strong style="color:${NAVY}">[CLASS IS CANCELLED / DELAYED / MOVED INDOORS]</strong></h3>` +
      `<blockquote><strong>Affected:</strong> [Class name &amp; location]<br/><strong>Date:</strong> [Today's date]<br/><strong>Reason:</strong> [Weather / field conditions / facility]</blockquote>` +
      `<p><strong style="color:${NAVY}">What happens next:</strong> [Make-up session details, or "this session will be credited automatically."]</p>` +
      `<p>We never cancel lightly — safety first, always. Thank you for understanding, and we'll see the kids at the next session!</p>` +
      `<p><em>Questions? Reply to this email and we'll get right back to you.</em></p>`,
  },
];
