/** Prefill templates for WhatsApp / outreach messages */
export const CONTACT_TEMPLATES = [
  {
    id: "availability",
    label: "Availability check",
    body: "Hi! This is Raktasewa (Emergency Blood Supply). Are you available to donate blood today?",
  },
  {
    id: "request_update",
    label: "Request update",
    body: "Hi! We are contacting you regarding an active blood request. Could you please share an update on the patient's status?",
  },
  {
    id: "donor_assign",
    label: "Donor assignment",
    body: "Hi! We may have a matching blood donation request. Please reply if you can donate. Thank you.",
  },
  {
    id: "confirm_donation",
    label: "Confirm donation",
    body: "Hi! Please confirm if the blood donation was completed successfully so we can update our records.",
  },
  {
    id: "thank_you",
    label: "Thank you",
    body: "Thank you for supporting emergency blood needs through Raktasewa. Your help saves lives.",
  },
];

export const DEFAULT_CONTACT_MESSAGE =
  "Hi! We are contacting you regarding a blood donation request from Raktasewa (Emergency Blood Supply).";
