import { NextResponse } from "next/server";

import type { CheckoutIntent } from "@/lib/checkout-intents";
import { createRequestContext } from "@/lib/api-logging";
import { getCentralStorageStatus, listSalesRecords } from "@/lib/sales-db";
import { fullRegistrationExport } from "@/lib/registration-form";

type FileEntry = {
  name: string;
  data: string | Uint8Array;
};

function crc32(input: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = Math.max(date.getFullYear() - 1980, 0);
  return { date: (year << 9) | (month << 5) | day, time };
}

function uint16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value);
  return buffer;
}

function zipStore(files: FileEntry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const stamp = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data)
      ? file.data
      : file.data instanceof Uint8Array
        ? Buffer.from(file.data)
        : Buffer.from(file.data, "utf8");
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(stamp.time),
      uint16(stamp.date),
      uint32(crc),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      name
    ]);

    localParts.push(localHeader, data);
    centralParts.push(
      Buffer.concat([
        uint32(0x02014b50),
        uint16(20),
        uint16(20),
        uint16(0x0800),
        uint16(0),
        uint16(stamp.time),
        uint16(stamp.date),
        uint32(crc),
        uint32(data.length),
        uint32(data.length),
        uint16(name.length),
        uint16(0),
        uint16(0),
        uint16(0),
        uint16(0),
        uint32(0),
        uint32(offset),
        name
      ])
    );
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0)
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnName(index: number) {
  let name = "";
  let value = index + 1;
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function cellXml(value: unknown, rowIndex: number, columnIndex: number, style = 0) {
  const ref = `${columnName(columnIndex)}${rowIndex}`;
  const styleAttr = style ? ` s="${style}"` : "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"${styleAttr}><v>${value}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t>${xmlEscape(value)}</t></is></c>`;
}

function worksheetXml(headers: string[], rows: Array<Array<string | number | undefined>>, title: string) {
  const titleRow = [title, ...headers.slice(1).map(() => "")];
  const allRows = [titleRow, headers, ...rows];
  const lastCol = columnName(headers.length - 1);
  const widths = headers
    .map((header, index) => {
      const maxLength = Math.max(String(header).length, ...rows.map((row) => String(row[index] ?? "").length));
      const width = Math.min(Math.max(maxLength + 3, index === 0 ? 18 : 12), 42);
      return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    })
    .join("");
  const rowsXml = allRows
    .map((row, rowIndex) => {
      const excelRow = rowIndex + 1;
      const cells = headers
        .map((header, columnIndex) => {
          const value = row[columnIndex] ?? "";
          const style = rowIndex <= 1 ? 1 : header === "Amount Paid" ? 2 : 0;
          return cellXml(value, excelRow, columnIndex, style);
        })
        .join("");
      return `<row r="${excelRow}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView rightToLeft="1" workbookViewId="0"><pane ySplit="2" topLeftCell="A3" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${widths}</cols>
<sheetData>${rowsXml}</sheetData>
<autoFilter ref="A2:${lastCol}${Math.max(allRows.length, 2)}"/>
</worksheet>`;
}

function workbookBuffer(headers: string[], rows: Array<Array<string | number | undefined>>) {
  const sheetName = "Updated Event List";
  const worksheet = worksheetXml(headers, rows, "רשימת אירוע מעודכנת");
  return zipStore([
    {
      name: "[Content_Types].xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`
    },
    {
      name: "_rels/.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
    },
    {
      name: "xl/workbook.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEscape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
    },
    {
      name: "xl/styles.xml",
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="₪#,##0"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFC1121F"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD0D0D0"/></left><right style="thin"><color rgb="FFD0D0D0"/></right><top style="thin"><color rgb="FFD0D0D0"/></top><bottom style="thin"><color rgb="FFD0D0D0"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top"/></xf></cellXfs></styleSheet>`
    },
    { name: "xl/worksheets/sheet1.xml", data: worksheet }
  ]);
}

function formatDate(value: string | undefined) {
  if (!value) return "לא הוזן";
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function calculateAge(dateOfBirth: string | undefined) {
  if (!dateOfBirth) return "לא הוזן";
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return Number.isFinite(age) ? String(age) : "לא הוזן";
}

function displayBoolean(value: boolean | undefined) {
  if (typeof value !== "boolean") return "לא הוזן";
  return value ? "Yes" : "No";
}

function paymentMethod(intent: CheckoutIntent) {
  return intent.paymentMethod ?? (intent.paymentProvider === "cash" ? "Cash" : "Grow");
}

function paymentStatus(intent: CheckoutIntent) {
  if (intent.status === "pending_cash") return "Pending Cash";
  if (intent.status === "paid" && paymentMethod(intent) === "Cash") return "Cash Paid";
  if (intent.status === "paid") return "Paid";
  if (intent.status === "pending_payment") return "Pending Payment";
  return intent.status;
}

function registrationSource(intent: CheckoutIntent): NonNullable<CheckoutIntent["registrationSource"]> {
  if (intent.registrationSource) return intent.registrationSource;
  if (intent.sourcePage === "/checkin" && paymentMethod(intent) === "Cash") return "Cash / Walk-in";
  if (intent.checkinFormCompleted && intent.paymentProvider === "grow") return "Missing Forms Completion";
  return "Website Purchase";
}

function eventLabel(intent: CheckoutIntent) {
  return intent.selectedEvents.map((event) => `${event.city} / ${event.venue} / ${event.date}`).join(" | ") || "לא הוזן";
}

function matchesFilters(intent: CheckoutIntent, params: URLSearchParams) {
  const query = String(params.get("query") ?? "").trim().toLowerCase();
  const event = params.get("event") ?? "all";
  const status = params.get("status") ?? "all";
  const missing = params.get("missing") ?? "all";
  const source = params.get("source") ?? "all";

  const matchesQuery =
    !query || [intent.fullName, intent.phone, intent.email, intent.checkoutReference].join(" ").toLowerCase().includes(query);
  const matchesEvent = event === "all" || intent.selectedEventIds.includes(event);
  const matchesStatus =
    status === "all" ||
    (status === "cash_paid" ? intent.status === "paid" && paymentMethod(intent) === "Cash" : intent.status === status);
  const matchesMissing =
    missing === "all" ||
    (missing === "missing_health" ? intent.compliance?.healthDeclarationCompleted !== true : intent.compliance?.termsAccepted !== true);
  const matchesSource = source === "all" || registrationSource(intent) === source;

  return matchesQuery && matchesEvent && matchesStatus && matchesMissing && matchesSource;
}

export async function GET(request: Request) {
  const context = createRequestContext("/api/admin/event-checkin-export");

  if (!getCentralStorageStatus().configured) {
    context.log(503, { reason: "central_storage_not_configured" });
    return NextResponse.json({ error: "Central sales database is not configured.", requestId: context.requestId }, { status: 503 });
  }

  const url = new URL(request.url);
  const purchases = (await listSalesRecords()).filter((intent) => matchesFilters(intent, url.searchParams));
  const full = url.searchParams.get("full") === "true";
  const fullExport = fullRegistrationExport();
  const fullHeaders = fullExport.headers;
  const fullRows = purchases.map(fullExport.row);
  const headers = [
    "Full name",
    "Age",
    "Phone",
    "Email",
    "Ticket type",
    "Event",
    "Payment method",
    "Payment status",
    "Health declaration",
    "Terms accepted",
    "Registration source",
    "Submission date",
    "Notes"
  ];
  const rows = purchases.map((intent) => [
    intent.fullName,
    calculateAge(intent.dateOfBirth),
    intent.phone,
    intent.email,
    intent.ticketName,
    eventLabel(intent),
    paymentMethod(intent),
    paymentStatus(intent),
    displayBoolean(intent.compliance?.healthDeclarationCompleted),
    displayBoolean(intent.compliance?.termsAccepted),
    registrationSource(intent),
    formatDate(intent.createdAt),
    intent.notes
  ]);

  context.log(200, { count: rows.length });
  return new NextResponse(workbookBuffer(full ? fullHeaders : headers, full ? fullRows : rows), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${full ? "pushtakim-full-registration-forms" : "pushtakim-updated-event-list"}.xlsx"`,
      "Cache-Control": "no-store"
    }
  });
}
