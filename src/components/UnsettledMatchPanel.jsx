import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import BusinessIcon from "@mui/icons-material/Business";
import { fetchAdminMatches } from "../services/requestService";
import { fetchOrganizations } from "../services/organizationService";
import {
  CONTACT_TEMPLATES,
  buildDonorMatchMessage,
  buildEmergencyMessage,
} from "../constants/contactTemplates";
import { openCall, openWhatsApp, cleanPhone } from "../utils/contact";
import ContactActionsDialog, { contactsFromDonor } from "./ContactActions";

function DonorMatchCard({ donor, matchType, request, onCompose }) {
  const phoneOk = Boolean(cleanPhone(donor.phone_number));
  const preset = buildDonorMatchMessage(request, donor);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography fontWeight={700}>{donor.fullname || "Donor"}</Typography>
            <Chip size="small" label={donor.blood_group || "—"} color="error" variant="outlined" />
            <Chip size="small" label={matchType} variant="outlined" />
            {donor.status ? (
              <Chip size="small" label={String(donor.status).toUpperCase()} />
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {donor.phone_number || "No phone"} · {donor.address || "Address n/a"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CallIcon />}
            disabled={!phoneOk}
            onClick={() => openCall(donor.phone_number)}
          >
            Call
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
            disabled={!phoneOk}
            onClick={() => openWhatsApp(donor.phone_number, preset)}
          >
            WhatsApp
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            disabled={!phoneOk}
            onClick={() => onCompose(donor, preset)}
          >
            Custom
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

/**
 * For unsettled requests: show all matching donors + organization emergency outreach.
 */
export default function UnsettledMatchPanel({ request }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [orgMessage, setOrgMessage] = useState("");
  const [composeDonor, setComposeDonor] = useState(null);
  const [composeMessage, setComposeMessage] = useState("");

  useEffect(() => {
    if (!request?.patient_blood_group) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setOrgMessage(buildEmergencyMessage(request));
      try {
        const [matchRes, orgRes] = await Promise.all([
          fetchAdminMatches({
            blood_group: request.patient_blood_group,
            request_id: request.id,
          }),
          fetchOrganizations(),
        ]);
        if (cancelled) return;
        if (matchRes.success) setMatchData(matchRes);
        else setError(matchRes.error || "Failed to load matches");
        if (orgRes.success && Array.isArray(orgRes.organizations)) {
          setOrgs(orgRes.organizations);
          if (orgRes.organizations[0]) {
            setSelectedOrgId(String(orgRes.organizations[0].id));
          }
        }
      } catch (err) {
        if (!cancelled) setError("Unable to load matches or organizations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [request]);

  const selectedOrg = useMemo(
    () => orgs.find((o) => String(o.id) === String(selectedOrgId)) || null,
    [orgs, selectedOrgId]
  );

  const totalMatches = matchData?.totals?.all ?? 0;
  const noDonorOptions = !loading && totalMatches === 0;

  if (!request) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <BloodtypeIcon color="error" fontSize="small" />
        <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
          Matching donors
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Exact group, compatible donors who can give to{" "}
        <strong>{request.patient_blood_group}</strong>
        {matchData?.compatible_groups?.length
          ? ` (from ${matchData.compatible_groups.join(", ")})`
          : ""}
        , plus pending registrations.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {noDonorOptions ? (
            <Alert severity="warning">
              No matching donors found. Contact a partner organization below for emergency
              supply support.
            </Alert>
          ) : null}

          {(matchData?.exact || []).length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Exact match ({matchData.exact.length})
              </Typography>
              <Stack spacing={1}>
                {matchData.exact.map((d) => (
                  <DonorMatchCard
                    key={`exact-${d.id}`}
                    donor={d}
                    matchType="Exact"
                    request={request}
                    onCompose={(donor, msg) => {
                      setComposeDonor(donor);
                      setComposeMessage(msg);
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : null}

          {(matchData?.compatible || []).length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Compatible match ({matchData.compatible.length})
              </Typography>
              <Stack spacing={1}>
                {matchData.compatible.map((d) => (
                  <DonorMatchCard
                    key={`compat-${d.id}`}
                    donor={d}
                    matchType="Compatible"
                    request={request}
                    onCompose={(donor, msg) => {
                      setComposeDonor(donor);
                      setComposeMessage(msg);
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : null}

          {(matchData?.pending || []).length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Pending donors ({matchData.pending.length})
              </Typography>
              <Stack spacing={1}>
                {matchData.pending.map((d) => (
                  <DonorMatchCard
                    key={`pending-${d.id}`}
                    donor={d}
                    matchType="Pending"
                    request={request}
                    onCompose={(donor, msg) => {
                      setComposeDonor(donor);
                      setComposeMessage(msg);
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : null}
        </Stack>
      )}

      <Divider sx={{ my: 2.5 }} />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <BusinessIcon color="primary" fontSize="small" />
        <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
          Organization emergency contact
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        If no donor is available, select an organization and send an emergency WhatsApp or call
        them. You can edit the message before sending.
      </Typography>

      {orgs.length === 0 ? (
        <Alert severity="info">
          No organizations on file. Add partners under Organization, then return here.
        </Alert>
      ) : (
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="org-select-label">Select organization</InputLabel>
            <Select
              labelId="org-select-label"
              label="Select organization"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              {orgs.map((org) => (
                <MenuItem key={org.id} value={String(org.id)}>
                  {org.name}
                  {org.contact_person ? ` · ${org.contact_person}` : ""}
                  {org.phone_number ? ` · ${org.phone_number}` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedOrg ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography fontWeight={700}>{selectedOrg.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedOrg.contact_person || "Contact person n/a"} ·{" "}
                {selectedOrg.phone_number || "No phone"}
              </Typography>
              {selectedOrg.other_info ? (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {selectedOrg.other_info}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          <Typography variant="subtitle2">Message templates</Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ gap: 1 }}>
            <Chip
              size="small"
              label="Emergency details"
              color="error"
              variant="outlined"
              onClick={() => setOrgMessage(buildEmergencyMessage(request))}
            />
            {CONTACT_TEMPLATES.filter((t) => t.id === "org_emergency" || t.id === "availability").map(
              (t) => (
                <Chip
                  key={t.id}
                  size="small"
                  label={t.label}
                  variant="outlined"
                  onClick={() => setOrgMessage(t.body)}
                />
              )
            )}
          </Stack>

          <TextField
            label="Custom / emergency message"
            value={orgMessage}
            onChange={(e) => setOrgMessage(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            helperText="Used for WhatsApp. Call opens the dialer only."
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<CallIcon />}
              disabled={!cleanPhone(selectedOrg?.phone_number)}
              onClick={() => openCall(selectedOrg?.phone_number)}
            >
              Call organization
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              disabled={!cleanPhone(selectedOrg?.phone_number) || !orgMessage.trim()}
              onClick={() => openWhatsApp(selectedOrg?.phone_number, orgMessage)}
            >
              WhatsApp organization
            </Button>
          </Stack>
        </Stack>
      )}

      <ContactActionsDialog
        open={Boolean(composeDonor)}
        onClose={() => setComposeDonor(null)}
        contacts={contactsFromDonor(composeDonor)}
        context={{
          patientName: request.patient_name,
          bloodGroup: request.patient_blood_group,
          status: request.status,
        }}
        initialMessage={composeMessage}
        title="Message matching donor"
      />
    </Box>
  );
}
