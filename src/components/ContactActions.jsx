import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ChatIcon from "@mui/icons-material/Chat";
import {
  CONTACT_TEMPLATES,
  DEFAULT_CONTACT_MESSAGE,
} from "../constants/contactTemplates";
import { openCall, openWhatsApp, cleanPhone } from "../utils/contact";

/**
 * Compact Call / WhatsApp / Compose icons for table cells.
 */
export function ContactQuickButtons({
  phone,
  name,
  role,
  defaultMessage = DEFAULT_CONTACT_MESSAGE,
  context = {},
  size = "small",
}) {
  const [open, setOpen] = useState(false);
  const hasPhone = Boolean(cleanPhone(phone));

  return (
    <>
      <Stack direction="row" spacing={0.25} alignItems="center" component="span">
        <Tooltip title={hasPhone ? "Call" : "No phone"}>
          <span>
            <IconButton
              size={size}
              color="primary"
              disabled={!hasPhone}
              aria-label="Call"
              onClick={() => openCall(phone)}
            >
              <CallIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={hasPhone ? "WhatsApp (default message)" : "No phone"}>
          <span>
            <IconButton
              size={size}
              color="success"
              disabled={!hasPhone}
              aria-label="WhatsApp"
              onClick={() => openWhatsApp(phone, defaultMessage)}
            >
              <WhatsAppIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Custom message">
          <span>
            <IconButton
              size={size}
              color="secondary"
              disabled={!hasPhone}
              aria-label="Custom message"
              onClick={() => setOpen(true)}
            >
              <ChatIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <ContactActionsDialog
        open={open}
        onClose={() => setOpen(false)}
        contacts={[
          {
            id: "primary",
            role: role || "Contact",
            name: name || "Contact",
            phone,
          },
        ]}
        context={context}
        initialMessage={defaultMessage}
      />
    </>
  );
}

/**
 * Full Contact & message dialog — Call / WhatsApp with editable message + templates.
 */
export default function ContactActionsDialog({
  open,
  onClose,
  contacts = [],
  context = {},
  initialMessage = DEFAULT_CONTACT_MESSAGE,
  title = "Contact & message",
}) {
  const [message, setMessage] = useState(initialMessage);
  const [activeId, setActiveId] = useState(contacts[0]?.id || null);

  useEffect(() => {
    if (open) {
      setMessage(initialMessage);
      setActiveId(contacts[0]?.id || null);
    }
  }, [open, initialMessage, contacts]);

  const active = useMemo(
    () => contacts.find((c) => c.id === activeId) || contacts[0] || null,
    [contacts, activeId]
  );

  const contextLine = [
    context.patientName && `Patient: ${context.patientName}`,
    context.bloodGroup && `Blood: ${context.bloodGroup}`,
    context.status && `Status: ${String(context.status).toUpperCase()}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {contextLine ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {contextLine}
          </Typography>
        ) : null}

        {contacts.length === 0 ? (
          <Typography color="text.secondary">No contacts available.</Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {contacts.map((c) => {
              const ok = Boolean(cleanPhone(c.phone));
              const selected = (active?.id || null) === c.id;
              return (
                <Box
                  key={c.id}
                  onClick={() => ok && setActiveId(c.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: selected ? "primary.main" : "divider",
                    bgcolor: selected ? "action.selected" : "transparent",
                    cursor: ok ? "pointer" : "not-allowed",
                    opacity: ok ? 1 : 0.55,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    gap={1}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {c.role}
                      </Typography>
                      <Typography fontWeight={700}>{c.name || "—"}</Typography>
                      <Typography variant="body2">{c.phone || "No phone on file"}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CallIcon />}
                        disabled={!ok}
                        onClick={(e) => {
                          e.stopPropagation();
                          openCall(c.phone);
                        }}
                      >
                        Call
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<WhatsAppIcon />}
                        disabled={!ok}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveId(c.id);
                          openWhatsApp(c.phone, message);
                        }}
                      >
                        WhatsApp
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Message templates
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 2, gap: 1 }}>
          {CONTACT_TEMPLATES.map((t) => (
            <Chip
              key={t.id}
              label={t.label}
              size="small"
              onClick={() => setMessage(t.body)}
              variant="outlined"
            />
          ))}
        </Stack>

        <TextField
          label="Custom message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          helperText="Used when you tap WhatsApp. Call opens the dialer only."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          startIcon={<CallIcon />}
          disabled={!cleanPhone(active?.phone)}
          onClick={() => openCall(active?.phone)}
        >
          Call selected
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
          disabled={!cleanPhone(active?.phone) || !message.trim()}
          onClick={() => openWhatsApp(active?.phone, message)}
        >
          Send on WhatsApp
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Build contacts array from a blood request row (admin lists). */
export function contactsFromRequest(row) {
  if (!row) return [];
  const list = [];
  if (row.requester_phone || row.requester_name) {
    list.push({
      id: "requester",
      role: "Requester / Receiver",
      name: row.requester_name || "Requester",
      phone: row.requester_phone || row.requester_alt_phone,
    });
  }
  if (row.requester_alt_phone && row.requester_alt_phone !== row.requester_phone) {
    list.push({
      id: "alt",
      role: "Alternate phone",
      name: row.requester_name || "Requester",
      phone: row.requester_alt_phone,
    });
  }
  if (row.donor_phone || row.donor_name) {
    list.push({
      id: "donor",
      role: "Donor",
      name: row.donor_name || "Donor",
      phone: row.donor_phone || row.phone_number,
    });
  }
  return list;
}

/** Build contacts from a donor row. */
export function contactsFromDonor(row) {
  if (!row) return [];
  return [
    {
      id: "donor",
      role: "Donor",
      name: row.fullname || "Donor",
      phone: row.phone_number,
    },
  ];
}

export function contextFromRequest(row) {
  if (!row) return {};
  return {
    patientName: row.patient_name,
    bloodGroup: row.patient_blood_group,
    status: row.status,
  };
}
