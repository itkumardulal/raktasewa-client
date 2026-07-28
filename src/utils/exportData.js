/** Client-side export helpers (CSV for Excel + printable PDF). */

export function downloadCsv(filename, rows, columns) {
  const cols =
    columns ||
    (rows[0]
      ? Object.keys(rows[0]).map((key) => ({ key, header: key }))
      : []);

  const escape = (value) => {
    const str = value == null ? "" : String(value);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const lines = [
    cols.map((c) => escape(c.header)).join(","),
    ...rows.map((row) => cols.map((c) => escape(row[c.key])).join(",")),
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printPdfTable(title, rows, columns) {
  const cols =
    columns ||
    (rows[0]
      ? Object.keys(rows[0]).map((key) => ({ key, header: key }))
      : []);

  const head = cols.map((c) => `<th>${escapeHtml(c.header)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${cols
          .map((c) => `<td>${escapeHtml(row[c.key] ?? "")}</td>`)
          .join("")}</tr>`
    )
    .join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p { color: #555; font-size: 12px; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; font-size: 11px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>Generated ${new Date().toLocaleString()} · ${rows.length} row(s)</p>
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body || `<tr><td colspan="${cols.length}">No rows</td></tr>`}</tbody>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    window.alert("Please allow pop-ups to export PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sortByLatest(rows, dateField = "created_at") {
  return [...(rows || [])].sort((a, b) => {
    const ta = new Date(a?.[dateField] || 0).getTime();
    const tb = new Date(b?.[dateField] || 0).getTime();
    return tb - ta;
  });
}

export function daysUntil(dateValue) {
  if (!dateValue) return null;
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}
