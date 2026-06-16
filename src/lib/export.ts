import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  header: string;
  key: string;
}

export type ExportRow = Record<string, string | number>;

export interface ExportSummaryLine {
  label: string;
  value: string | number;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv(
  title: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  summary?: ExportSummaryLine[],
) {
  const lines: string[] = [];
  lines.push(csvEscape(title));
  lines.push("");
  lines.push(columns.map((c) => csvEscape(c.header)).join(","));
  rows.forEach((row) => {
    lines.push(columns.map((c) => csvEscape(row[c.key] ?? "")).join(","));
  });
  if (summary && summary.length > 0) {
    lines.push("");
    summary.forEach((s) => lines.push(`${csvEscape(s.label)},${csvEscape(s.value)}`));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${slugify(title)}_${Date.now()}.csv`);
}

export function exportToPdf(
  title: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  summary?: ExportSummaryLine[],
) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 15);

  autoTable(doc, {
    startY: 22,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  if (summary && summary.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 30;
    let y = finalY + 10;
    doc.setFontSize(11);
    summary.forEach((s) => {
      doc.text(`${s.label}: ${s.value}`, 14, y);
      y += 7;
    });
  }

  doc.save(`${slugify(title)}_${Date.now()}.pdf`);
}

export function exportToExcel(
  title: string,
  columns: ExportColumn[],
  rows: ExportRow[],
  summary?: ExportSummaryLine[],
) {
  const wsData: (string | number)[][] = [];
  wsData.push([title]);
  wsData.push([]);
  wsData.push(columns.map((c) => c.header));
  rows.forEach((row) => {
    wsData.push(columns.map((c) => row[c.key] ?? ""));
  });
  if (summary && summary.length > 0) {
    wsData.push([]);
    summary.forEach((s) => wsData.push([s.label, s.value]));
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${slugify(title)}_${Date.now()}.xlsx`);
}

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
