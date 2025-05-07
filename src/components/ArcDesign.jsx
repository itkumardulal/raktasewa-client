// src/components/ArcDesign.jsx
import * as React from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

export default function ArcDesign({ value = 0, width = 200, height = 200 }) {
  return (
    <Gauge
      width={width}
      height={height}
      value={value}
      cornerRadius="50%"
      sx={(theme) => ({
        [`& .${gaugeClasses.valueText}`]: {
          fontSize: 40,
        },
        [`& .${gaugeClasses.valueArc}`]: {
          fill: "#52b202",
        },
        [`& .${gaugeClasses.referenceArc}`]: {
          fill: theme.palette.text.disabled,
        },
      })}
    />
  );
}
