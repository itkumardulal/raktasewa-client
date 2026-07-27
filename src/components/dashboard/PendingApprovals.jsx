import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { adminColors } from "../../theme/adminTheme";

/**
 * Pending approvals cards — counts from existing list endpoints; actions navigate.
 */
export default function PendingApprovals({
  pendingDonors = 0,
  organizations = 0,
  pendingRequests = 0,
  users = 0,
  loading = false,
  onApproveDonor,
}) {
  const cards = [
    {
      title: "Pending Donors",
      count: pendingDonors,
      icon: <PersonOutlineIcon fontSize="small" />,
      to: "/pending-donors",
      color: adminColors.warning,
      approve: Boolean(onApproveDonor && pendingDonors > 0),
    },
    {
      title: "Organizations",
      count: organizations,
      icon: <BusinessOutlinedIcon fontSize="small" />,
      to: "/organization",
      color: adminColors.info,
    },
    {
      title: "Pending Requests",
      count: pendingRequests,
      icon: <AssignmentLateOutlinedIcon fontSize="small" />,
      to: "/unsettled-requests",
      color: adminColors.primary,
    },
    {
      title: "User Accounts",
      count: users,
      icon: <ManageAccountsOutlinedIcon fontSize="small" />,
      to: "/user-accounts",
      color: adminColors.success,
    },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Pending Approvals
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Jump to queues that need admin attention.
      </Typography>

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: `1px solid ${adminColors.border}`,
                bgcolor: "background.paper",
                transition: "transform 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: card.color,
                },
              }}
            >
              <CardContent>
                {loading ? (
                  <Skeleton variant="rounded" height={88} />
                ) : (
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: `${card.color}22`,
                          color: card.color,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography variant="h4" fontWeight={800}>
                        {card.count}
                      </Typography>
                    </Stack>
                    <Typography fontWeight={700}>{card.title}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        component={RouterLink}
                        to={card.to}
                        size="small"
                        variant="outlined"
                        fullWidth
                      >
                        Review
                      </Button>
                      {card.approve ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={onApproveDonor}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          Approve
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
