/**
 * Built-in Mass Email templates.
 *
 * Body HTML is intentionally editor-safe (headings, paragraphs, lists,
 * links, colored spans) so ReactQuill can load and edit it without mangling.
 * At send time the backend wraps the body in the branded CSF frame
 * (logo header + footer) and greets each recipient by name, so templates
 * only provide the message content itself.
 */

const NAVY = "#173151";
const GOLD = "#b8860b"; // darker gold for text readability in email clients

export const BUILTIN_EMAIL_TEMPLATES = [
  {
    id: "builtin-announcement",
    name: "General Announcement",
    description: "Simple update for parents",
    subject: "An update from Carolina Soccer Factory",
    html: `<h2><strong style="color:${NAVY}">A quick update from CSF</strong></h2><p>We wanted to share some news with you about our soccer programs.</p><p><em>[Write your announcement here — what is changing, when, and what it means for your child.]</em></p><p><strong style="color:${NAVY}">What you need to know:</strong></p><ul><li>[Key point one]</li><li>[Key point two]</li><li>[Key point three]</li></ul><p>Thank you for being part of the CSF family. If you have any questions, just reply to this email.</p>`,
  },
  {
    id: "builtin-schedule",
    name: "Schedule Change",
    description: "Class time/date/location change",
    subject: "Important: schedule change for your child's class",
    html: `<h2><strong style="color:${NAVY}">Schedule change notice</strong></h2><p>Please note the following change to your child's upcoming class:</p><blockquote><strong>Class:</strong> [Class name]<br/><strong>Original:</strong> [Old day, date &amp; time]<br/><strong>New:</strong> <strong style="color:${GOLD}">[New day, date &amp; time]</strong><br/><strong>Location:</strong> [Location — mention if unchanged]</blockquote><p><strong style="color:${NAVY}">Why the change?</strong> [One-sentence reason — weather, field availability, holiday.]</p><p>Everything else about the class stays the same. We apologize for any inconvenience and appreciate your flexibility!</p>`,
  },
  {
    id: "builtin-event",
    name: "Event Invitation",
    description: "Invite families to an event",
    subject: "You're invited! [Event name] 🎉⚽",
    html: `<h2><strong style="color:${NAVY}">You're invited!</strong></h2><p>Join us for <strong style="color:${GOLD}">[Event name]</strong> — a day of soccer, fun, and community for the whole family.</p><p><strong style="color:${NAVY}">The details:</strong></p><ul><li><strong>When:</strong> [Day, date &amp; time]</li><li><strong>Where:</strong> [Venue and address]</li><li><strong>Who:</strong> [Which classes / all families]</li><li><strong>Bring:</strong> [Water, cleats, a friend…]</li></ul><p>[One or two sentences about what makes this event special.]</p><p><strong>Please RSVP by [date]</strong> by replying to this email so we can plan accordingly.</p><p>We can't wait to see you there!</p>`,
  },
  {
    id: "builtin-payment",
    name: "Payment Reminder",
    description: "Friendly billing/registration reminder",
    subject: "A friendly reminder from Carolina Soccer Factory",
    html: `<h2><strong style="color:${NAVY}">Just a friendly reminder</strong></h2><p>Our records show the following item needs your attention:</p><blockquote><strong>Regarding:</strong> [Class name / registration / payment]<br/><strong>Amount:</strong> [$0.00]<br/><strong>Due by:</strong> <strong style="color:${GOLD}">[Date]</strong></blockquote><p>You can take care of this in just a minute by logging into your parent account. If you've already handled it — thank you, and please disregard this note.</p><p>Questions about your account or payment plan? Reply to this email and we'll be happy to help.</p>`,
  },
  {
    id: "builtin-welcome",
    name: "Season Kickoff",
    description: "Welcome families to a new season",
    subject: "Welcome to the new season! Here's everything you need ⚽",
    html: `<h2><strong style="color:${NAVY}">The new season is here!</strong></h2><p>We're thrilled to welcome your family to the <strong style="color:${GOLD}">[Season name, e.g. Fall 2026]</strong> season at Carolina Soccer Factory. Here's everything you need for a great start:</p><p><strong style="color:${NAVY}">First session:</strong></p><ul><li><strong>Starts:</strong> [Date &amp; time]</li><li><strong>Location:</strong> [School / field]</li><li><strong>What to bring:</strong> water bottle, shin guards, sneakers or cleats</li><li><strong>Jerseys:</strong> [Handed out at the first session / details]</li></ul><p><strong style="color:${NAVY}">Good to know:</strong></p><ul><li>Check-in opens 10 minutes before class</li><li>[Weather policy / where updates are posted]</li><li>[Coach name] will be leading the group this season</li></ul><p>Here's to a season full of goals, growth, and grins. See you on the field!</p>`,
  },
];
