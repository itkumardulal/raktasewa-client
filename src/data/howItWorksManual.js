/**
 * Admin copy of the RaktaSewa operations manual (English).
 * Keep in sync with website how-it-works narrative.
 */
export const ADMIN_HOW_IT_WORKS = {
  title: "How RaktaSewa works — Operations manual",
  subtitle:
    "Single reference for admins: donor & requester journeys, how data is recorded, New vs Unsettled vs Settled, matching, recognition, and what to do when no donor is found.",
  disclaimer:
    "RaktaSewa is not a blood bank. We coordinate people. Final medical eligibility is always decided at the hospital.",
  emergencyTitle: "Emergency admin contact (share with requesters when needed)",
  emergencyPhone: "9741667448",
  emergencyEmail: "support@raktasewa.com",
  flowDiagram: [
    "Donor form → Pending → Admin call/check → Available",
    "Request form → New (≈3 days) → Match / Call / WhatsApp → Donate at hospital → Settle",
    "If still open → Unsettled → keep outreach + organizations",
    "Settle saves donor↔request → Assigned waiting days → Website recognition tiers",
  ],
  sections: [
    {
      title: "1. Become a donor — data path",
      steps: [
        "Website Become a Donor form saves the person as Pending.",
        "Admin opens Pending Donors, calls them, verifies details.",
        "Mark Available → appears in Enrolled / matching searches.",
        "Private phones stay for coordination; public recognition hides contacts.",
      ],
    },
    {
      title: "2. Request blood — data path",
      steps: [
        "Requester submits blood group, urgency, hospital, city/district, phones.",
        "Request starts as New in admin.",
        "Match by exact + compatible blood groups among Available donors.",
        "Use city/district & hospital address to prefer nearby people (GPS distance can improve later; area fields are the current location signal).",
        "Call / WhatsApp donor and requester from Contact tools.",
        "After real hospital donation → Settle with the correct donor.",
      ],
    },
    {
      title: "3. New vs Unsettled vs Settled",
      steps: [
        "New: recent open requests (about last 3 days) — work these first.",
        "Unsettled: still needs blood; includes aged New requests and other open cases — continue matching and org outreach.",
        "Settled: donation completed and recorded (who donated for which request + when).",
        "Assigned: donor who just settled enters waiting counter (~90 days men / ~120 days women).",
      ],
    },
    {
      title: "4. If no donor is found",
      steps: [
        "Tell family: hospital care first — never replace emergency medicine with the app.",
        "Share admin phone/email for backup coordination.",
        "Use Unsettled match panel + Organization emergency WhatsApp/call with custom message.",
        "Update urgency/location if it changes; refresh and try again.",
      ],
    },
    {
      title: "5. Recognition & rewards",
      steps: [
        "Only settled donations increase public donation counts and tiers.",
        "Website Donor Recognition and home highlights read settled activity.",
        "Never settle for “points” — settle only after confirmed donation.",
        "Celebrate safe return after waiting days, not rushed re-donation.",
      ],
    },
    {
      title: "6. Admin menu map",
      steps: [
        "Pending Donors → approve new applicants.",
        "New Request (3 days) → fast match + settle.",
        "Unsettled → deep outreach + organizations.",
        "Assigned Donors → waiting days + make available again.",
        "All / Settled / Reports → full history and CSV/PDF export.",
        "Notifications bell → Refresh for new requests & donor applications.",
      ],
    },
  ],
  quickCards: [
    {
      title: "Donor pipeline",
      body: "Form → Pending → call → Available → (after settle) Assigned → waiting → Available again.",
    },
    {
      title: "Request pipeline",
      body: "Form → New → match/contact → Settle or age into Unsettled → keep working until Settled.",
    },
    {
      title: "Record of truth",
      body: "settled_requests links donor_id + request_id + settled_at. That powers recognition.",
    },
    {
      title: "No-match playbook",
      body: "Hospital first → admin line → org emergency message → update request → retry matches.",
    },
  ],
};
