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
  {
    id: "org_emergency",
    label: "Org emergency",
    body: "EMERGENCY: We need blood support for a patient through Raktasewa. Please reply if your organization can help arrange supply today.",
  },
];

export const DEFAULT_CONTACT_MESSAGE =
  "Hi! We are contacting you regarding a blood donation request from Raktasewa (Emergency Blood Supply).";

/** Build an emergency outreach message from an unsettled request row */
export function buildEmergencyMessage(row = {}) {
  const lines = [
    "🚨 EMERGENCY BLOOD NEED — Raktasewa",
    row.patient_name ? `Patient: ${row.patient_name}` : null,
    row.patient_blood_group ? `Blood group needed: ${row.patient_blood_group}` : null,
    row.blood_amount_needed ? `Amount: ${row.blood_amount_needed}` : null,
    row.urgency_level ? `Urgency: ${row.urgency_level}` : null,
    row.hospital_name ? `Hospital: ${row.hospital_name}` : null,
    row.hospital_address ? `Address: ${row.hospital_address}` : null,
    row.city_district ? `Area: ${row.city_district}` : null,
    row.required_datetime ? `Needed by: ${row.required_datetime}` : null,
    row.requester_name ? `Requester: ${row.requester_name}` : null,
    row.requester_phone ? `Requester phone: ${row.requester_phone}` : null,
    "",
    "Please reply ASAP if you can help arrange blood. Thank you.",
  ];
  return lines.filter((line) => line !== null).join("\n");
}

export function buildDonorMatchMessage(row = {}, donor = {}) {
  const lines = [
    "Hi! This is Raktasewa (Emergency Blood Supply).",
    "We have an unsettled blood request that may match you.",
    row.patient_blood_group ? `Needed blood group: ${row.patient_blood_group}` : null,
    donor.blood_group ? `Your group on file: ${donor.blood_group}` : null,
    row.hospital_name ? `Hospital: ${row.hospital_name}` : null,
    row.city_district ? `Area: ${row.city_district}` : null,
    row.urgency_level ? `Urgency: ${row.urgency_level}` : null,
    "",
    "Please reply if you can donate safely. Thank you for saving lives.",
  ];
  return lines.filter((line) => line !== null).join("\n");
}
