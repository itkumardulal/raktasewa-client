import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useGami } from "../context/GamiContext";

/** Lightweight CSS confetti + achievement / mission popup */
export default function CelebrationModal() {
  const { celebration, dismissCelebration } = useGami();
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!celebration) {
      setPieces([]);
      return;
    }
    const colors = ["#F59E0B", "#22C55E", "#3B82F6", "#EC4899", "#A855F7"];
    setPieces(
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        color: colors[i % colors.length],
        rotate: Math.random() * 360,
      }))
    );
  }, [celebration]);

  if (!celebration) return null;

  return (
    <>
      <Box
        sx={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          overflow: "hidden",
        }}
      >
        {pieces.map((p) => (
          <Box
            key={p.id}
            sx={{
              position: "absolute",
              top: -12,
              left: `${p.left}%`,
              width: 8,
              height: 12,
              bgcolor: p.color,
              borderRadius: 0.5,
              animation: `gamiFall 2.2s ease-in ${p.delay}s forwards`,
              transform: `rotate(${p.rotate}deg)`,
              "@keyframes gamiFall": {
                to: { transform: "translateY(110vh) rotate(720deg)", opacity: 0.2 },
              },
            }}
          />
        ))}
      </Box>
      <Dialog open onClose={dismissCelebration} maxWidth="xs" fullWidth>
        <DialogTitle>Celebration</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {celebration.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep going — your work is moving the mission forward.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={dismissCelebration}>
            Awesome
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
