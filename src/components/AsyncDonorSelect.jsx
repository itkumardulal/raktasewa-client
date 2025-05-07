import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { debounce } from "lodash"; // npm i lodash
import api from "../lib/axiosInstance";

export default function AsyncDonorSelect({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useMemo(
    () =>
      debounce(async (keyword, controller) => {
        if (!keyword) {
          setOptions([]);
          return;
        }

        const url = `/donors/search/${encodeURIComponent(keyword)}`;

        const { data } = await api.post(url, {}, { signal: controller.signal });

        // Enhance label to avoid duplicates
        setOptions(
          data.donors.map((donor) => ({
            ...donor,
            label: `${donor.fullname} (ID: ${donor.id})`,
          }))
        );
      }, 300),
    []
  );

  useEffect(() => () => fetchOptions.cancel(), [fetchOptions]);

  const handleInputChange = (_e, keyword, reason) => {
    if (reason !== "input") return;

    setLoading(true);
    const controller = new AbortController();

    (async () => {
      try {
        await fetchOptions(keyword, controller);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  };

  return (
    <Autocomplete
      sx={{ width: "100%", padding: "5px" }}
      options={options}
      value={value || null}
      loading={loading}
      getOptionLabel={(opt) => opt.label || opt.fullname} // fallback for initial `value`
      isOptionEqualToValue={(o, v) => o.id === v.id}
      onChange={(_e, newVal) => onChange(newVal)}
      onInputChange={handleInputChange}
      renderInput={(params) => {
        const newParams = {
          ...params,
          InputProps: {
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          },
        };

        return (
          <TextField {...newParams} size="small" placeholder="Search donor…" />
        );
      }}
    />
  );
}
