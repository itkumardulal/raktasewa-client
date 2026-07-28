import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ADMIN_HOW_IT_WORKS } from "../data/howItWorksManual";
import { adminColors } from "../theme/adminTheme";

export default function HowItWorksManual() {
  const m = ADMIN_HOW_IT_WORKS;

  return (
    <Box sx={{ p: 3, maxWidth: 960 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        {m.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.75 }}>
        {m.subtitle}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: `1px solid ${adminColors.border}`,
          bgcolor: `${adminColors.primary}14`,
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.75 }}>
          {m.disclaimer}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: `1px solid ${adminColors.warning}66` }}
      >
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          {m.emergencyTitle}
        </Typography>
        <Stack spacing={0.5}>
          <MuiLink href={`tel:${m.emergencyPhone}`} fontWeight={700}>
            {m.emergencyPhone}
          </MuiLink>
          <MuiLink href={`mailto:${m.emergencyEmail}`}>{m.emergencyEmail}</MuiLink>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: `1px solid ${adminColors.border}` }}>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          End-to-end flow
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
          {m.flowDiagram.map((line) => (
            <Typography component="li" key={line} variant="body2" sx={{ mb: 0.75, lineHeight: 1.7 }}>
              {line}
            </Typography>
          ))}
        </Box>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }} useFlexGap flexWrap="wrap">
        {m.quickCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              p: 1.75,
              flex: "1 1 200px",
              border: `1px solid ${adminColors.border}`,
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 0.75 }}>
              {card.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {card.body}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {m.sections.map((section, index) => (
        <Accordion
          key={section.title}
          defaultExpanded={index < 3}
          disableGutters
          elevation={0}
          sx={{
            mb: 1,
            border: `1px solid ${adminColors.border}`,
            borderRadius: 2,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {section.steps.map((step) => (
                <Typography
                  component="li"
                  key={step.slice(0, 40)}
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, lineHeight: 1.75 }}
                >
                  {step}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Public visitors see the same journey on the website at /how-it-works (English / Nepali).
      </Typography>
    </Box>
  );
}
