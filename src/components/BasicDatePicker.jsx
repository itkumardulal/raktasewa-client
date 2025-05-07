import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";

/**
 * Simple Day-js-powered date picker that forwards props.
 * Usage: <BasicDatePicker label="Date of birth" value={value} onChange={fn} />
 */
export default function BasicDatePicker(props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker"]}>
        <DatePicker {...props} />
      </DemoContainer>
    </LocalizationProvider>
  );
}
