import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

const initialMembers = [
  {
    id: 1,
    membershipType: "Couple",
    name: "Margaret Thompson",
    email: "margaret.thompson@email.com",
    idType: "Driver's License",
    idNumber: "DL-4821-TX",
    idPhotoFile: null, idPhotoFileName: "margaret_dl.jpg",
    spouseName: "Robert Thompson",
    spouseEmail: "robert.thompson@email.com",
    spousePhone: "+1 (555) 012-7777",
    spouseIdType: "Driver's License",
    spouseIdNumber: "DL-3301-TX",
    spouseIdPhotoFile: null, spouseIdPhotoFileName: "",
    family: [
      { name: "Claire Thompson", dob: "2002-06-14" },
      { name: "Jake Thompson", dob: "2005-11-03" },
    ],
    phone: "+1 (555) 012-3456",
    address: "142 Elmwood Drive, Austin, TX 78701",
    payment: "Paid",
    amountPaid: "150.00",
    receiptNumber: "RCP-2024-001",
    date: "2024-03-15",
    applicationFile: null, applicationFileName: "margaret_application.pdf",
    beneficiaryName: "Claire Thompson",
    beneficiaryPhone: "+1 (555) 012-9999",
    beneficiaryAddress: "142 Elmwood Drive, Austin, TX 78701",
    notes: "Annual dues",
  },
  {
    id: 2,
    membershipType: "Single",
    name: "David Okafor",
    email: "d.okafor@gmail.com",
    idType: "Government ID",
    idNumber: "GOV-7734-NY",
    idPhotoFile: null, idPhotoFileName: "",
    spouseName: "", spouseEmail: "", spousePhone: "",
    spouseIdType: "Driver's License", spouseIdNumber: "",
    spouseIdPhotoFile: null, spouseIdPhotoFileName: "",
    family: [{ name: "Linda Okafor", dob: "1985-03-22" }],
    phone: "+1 (555) 987-6543",
    address: "88 Park Avenue, New York, NY 10001",
    payment: "Not Paid",
    amountPaid: "",
    receiptNumber: "RCP-2024-002",
    date: "2024-03-20",
    applicationFile: null, applicationFileName: "",
    beneficiaryName: "Linda Okafor",
    beneficiaryPhone: "+1 (555) 987-0001",
    beneficiaryAddress: "88 Park Avenue, New York, NY 10001",
    notes: "",
  },
];

const PAYMENT_OPTIONS = ["Paid", "Pending", "Partial", "Waived", "Not Paid"];
const ID_TYPES = ["Driver's License", "Government ID", "Passport", "State ID", "Other"];
const MEMBERSHIP_TYPES = ["Single", "Couple"];

const BASE_SECTIONS = [
  { key: "personal", label: "Personal Info", icon: "👤" },
  { key: "identity", label: "Identity", icon: "🪪" },
  { key: "payment", label: "Payment", icon: "💳" },
  { key: "family", label: "Family", icon: "👨‍👩‍👧" },
  { key: "beneficiary", label: "Beneficiary", icon: "🤝" },
  { key: "documents", label: "Documents", icon: "📄" },
];
const COUPLE_SECTION = { key: "spouse", label: "Spouse", icon: "💍" };

const baseInp = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", background: "#f8fafc",
  color: "#1e293b", outline: "none", boxSizing: "border-box",
};
const lbl = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#64748b",
  textTransform: "uppercase", marginBottom: 6, display: "block",
};
const errStyle = { fontSize: 11, color: "#ef4444", marginTop: 4 };

function MemberTypeBadge({ type }) {
  const isCo = type === "Couple";
  return (
    <span style={{
      background: isCo ? "#fdf4ff" : "#f0fdf4",
      color: isCo ? "#a21caf" : "#15803d",
      border: `1px solid ${isCo ? "#e879f9" : "#4ade80"}`,
      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, fontFamily: "'DM Mono', monospace",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {isCo ? "👫" : "🧍"} {type}
    </span>
  );
}

function PaymentBadge({ status }) {
  const colors = {
    Paid: { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    Pending: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    Partial: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    Waived: { bg: "#f3e8ff", color: "#6b21a8", border: "#c4b5fd" },
    "Not Paid": { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  };
  const s = colors[status] || colors.Pending;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700,
      letterSpacing: 0.5, fontFamily: "'DM Mono', monospace",
    }}>{status}</span>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ paddingBottom: 12, marginBottom: 16, borderBottom: "1.5px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</span>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, marginLeft: 26 }}>{subtitle}</div>}
    </div>
  );
}

function DetailRow({ icon, label: lb, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{lb}</div>
        <div style={{ fontSize: 13, color: "#1e293b", marginTop: 1, lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  );
}

function UploadZone({ file, fileName, onFile, onRemove, accept, icon, label: zonelabel, preview }) {
  const ref = useRef();
  const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  return (
    <div>
      <input ref={ref} type="file" accept={accept} onChange={onFile} style={{ display: "none" }} />
      {file && isImage && preview ? (
        <div style={{ position: "relative", marginBottom: 10 }}>
          <img src={file} alt="Preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 12, border: "2px solid #e2e8f0" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)", display: "flex", alignItems: "flex-end", padding: 10 }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{fileName}</span>
          </div>
          <button onClick={onRemove} style={{ position: "absolute", top: 8, right: 8, background: "rgba(239,68,68,0.9)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>✕ Remove</button>
          <button onClick={() => ref.current.click()} style={{ position: "absolute", top: 8, left: 8, background: "rgba(14,165,233,0.9)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>↺ Replace</button>
        </div>
      ) : (
        <div onClick={() => ref.current.click()} style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: "20px 16px", textAlign: "center", cursor: "pointer", background: "#f8fafc", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.background = "#f0f9ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}>
          {fileName ? (
            <><div style={{ fontSize: 26, marginBottom: 5 }}>{icon}</div><div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{fileName}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Click to replace</div></>
          ) : (
            <><div style={{ fontSize: 28, marginBottom: 5 }}>⬆️</div><div style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>{zonelabel}</div><div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>JPG, PNG, PDF supported</div></>
          )}
        </div>
      )}
      {fileName && !isImage && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, background: "#f8fafc", borderRadius: 10, padding: "8px 12px", border: "1.5px solid #e2e8f0" }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{fileName}</span>
          <button onClick={onRemove} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✕</button>
        </div>
      )}
    </div>
  );
}

function Modal({ member, onClose, onSave }) {
  const empty = {
    membershipType: "Single",
    name: "", email: "", idType: "Driver's License", idNumber: "",
    idPhotoFile: null, idPhotoFileName: "",
    spouseName: "", spouseEmail: "", spousePhone: "",
    spouseIdType: "Driver's License", spouseIdNumber: "",
    spouseIdPhotoFile: null, spouseIdPhotoFileName: "",
    family: [], phone: "", address: "",
    payment: "Pending", receiptNumber: "", date: new Date().toISOString().slice(0, 10), amountPaid: "",
    applicationFile: null, applicationFileName: "",
    beneficiaryName: "", beneficiaryPhone: "", beneficiaryAddress: "",
    notes: "",
  };

  const [form, setForm] = useState(
    member ? { ...empty, ...member, family: (member.family || []).map((f) => typeof f === "string" ? { name: f, dob: "" } : { ...f }) } : { ...empty }
  );
  const [familyInput, setFamilyInput] = useState({ name: "", dob: "" });
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("personal");

  const isCouple = form.membershipType === "Couple";
  const sections = isCouple
    ? [BASE_SECTIONS[0], COUPLE_SECTION, ...BASE_SECTIONS.slice(1)]
    : BASE_SECTIONS;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // If switching away from Couple, jump off spouse tab
  const handleTypeChange = (t) => {
    set("membershipType", t);
    if (t === "Single" && activeSection === "spouse") setActiveSection("personal");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.date) e.date = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (isCouple && form.spouseEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.spouseEmail)) e.spouseEmail = "Invalid email";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.name || e.email || e.phone) setActiveSection("personal");
      else if (e.spouseEmail) setActiveSection("spouse");
      else if (e.date) setActiveSection("payment");
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => { if (validate()) onSave(form); };
  const addFamily = () => {
    const n = familyInput.name.trim();
    if (n && !form.family.find((f) => f.name === n)) {
      set("family", [...form.family, { name: n, dob: familyInput.dob || "" }]);
      setFamilyInput({ name: "", dob: "" });
    }
  };
  const makeFileHandler = (fileKey, nameKey) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set(nameKey, file.name);
    const reader = new FileReader();
    reader.onload = (ev) => set(fileKey, ev.target.result);
    reader.readAsDataURL(file);
  };

  const sectionContent = {
    personal: (
      <div style={{ display: "grid", gap: 16 }}>
        <SectionHeader icon="👤" title="Personal Information" />
        <div>
          <label style={lbl}>Membership Type</label>
          <div style={{ display: "flex", gap: 10 }}>
            {MEMBERSHIP_TYPES.map((t) => {
              const active = form.membershipType === t;
              const isCo = t === "Couple";
              return (
                <button key={t} onClick={() => handleTypeChange(t)} style={{
                  flex: 1, padding: "14px 10px", borderRadius: 14, border: "2px solid",
                  borderColor: active ? (isCo ? "#e879f9" : "#4ade80") : "#e2e8f0",
                  background: active ? (isCo ? "#fdf4ff" : "#f0fdf4") : "#f8fafc",
                  color: active ? (isCo ? "#a21caf" : "#15803d") : "#94a3b8",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: 26 }}>{isCo ? "👫" : "🧍"}</span>
                  <span>{t}</span>
                </button>
              );
            })}
          </div>
        </div>
        {isCouple && (
          <div style={{ background: "linear-gradient(135deg, #fdf4ff, #fce7ff)", border: "1.5px solid #e879f9", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>💍</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#a21caf" }}>Couple Membership</div>
              <div style={{ fontSize: 12, color: "#c026d3", marginTop: 1 }}>A <strong>Spouse</strong> tab has been added — fill in your partner's details there.</div>
            </div>
          </div>
        )}
        <div>
          <label style={lbl}>Full Name *</label>
          <input style={{ ...baseInp, borderColor: errors.name ? "#ef4444" : "#e2e8f0" }}
            value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jane Smith" />
          {errors.name && <div style={errStyle}>{errors.name}</div>}
        </div>
        <div>
          <label style={lbl}>Email Address</label>
          <input type="email" style={{ ...baseInp, borderColor: errors.email ? "#ef4444" : "#e2e8f0" }}
            value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" />
          {errors.email && <div style={errStyle}>{errors.email}</div>}
        </div>
        <div>
          <label style={lbl}>Phone Number *</label>
          <input style={{ ...baseInp, borderColor: errors.phone ? "#ef4444" : "#e2e8f0" }}
            value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
          {errors.phone && <div style={errStyle}>{errors.phone}</div>}
        </div>
        <div>
          <label style={lbl}>Home Address</label>
          <textarea style={{ ...baseInp, minHeight: 72, resize: "vertical" }}
            value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, City, State, ZIP" />
        </div>
        <div>
          <label style={lbl}>Notes</label>
          <textarea style={{ ...baseInp, minHeight: 56, resize: "vertical" }}
            value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes…" />
        </div>
      </div>
    ),

    spouse: (
      <div style={{ display: "grid", gap: 16 }}>
        <SectionHeader icon="💍" title="Spouse / Partner Information" subtitle="Details for the second member of this couple membership" />

        {/* Spouse personal */}
        <div style={{ background: "#fdf4ff", borderRadius: 14, padding: "16px", border: "1.5px solid #f0abfc", display: "grid", gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a21caf", textTransform: "uppercase", letterSpacing: 1 }}>👤 Spouse Personal Details</div>
          <div>
            <label style={lbl}>Spouse Full Name</label>
            <input style={baseInp} value={form.spouseName}
              onChange={(e) => set("spouseName", e.target.value)} placeholder="e.g. Robert Smith" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Spouse Email</label>
              <input type="email" style={{ ...baseInp, borderColor: errors.spouseEmail ? "#ef4444" : "#e2e8f0" }}
                value={form.spouseEmail} onChange={(e) => set("spouseEmail", e.target.value)} placeholder="spouse@example.com" />
              {errors.spouseEmail && <div style={errStyle}>{errors.spouseEmail}</div>}
            </div>
            <div>
              <label style={lbl}>Spouse Phone</label>
              <input style={baseInp} value={form.spousePhone}
                onChange={(e) => set("spousePhone", e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>

        {/* Spouse ID */}
        <div style={{ background: "#faf5ff", borderRadius: 14, padding: "16px", border: "1.5px solid #d8b4fe", display: "grid", gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7e22ce", textTransform: "uppercase", letterSpacing: 1 }}>🪪 Spouse Identity Document</div>
          <div>
            <label style={lbl}>ID Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ID_TYPES.map((t) => (
                <button key={t} onClick={() => set("spouseIdType", t)} style={{
                  padding: "7px 14px", borderRadius: 20, border: "2px solid",
                  borderColor: form.spouseIdType === t ? "#a855f7" : "#e2e8f0",
                  background: form.spouseIdType === t ? "#f3e8ff" : "#f8fafc",
                  color: form.spouseIdType === t ? "#7e22ce" : "#64748b",
                  fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>ID / License Number</label>
            <input style={baseInp} value={form.spouseIdNumber}
              onChange={(e) => set("spouseIdNumber", e.target.value)} placeholder="e.g. DL-5678-TX" />
          </div>
          <div>
            <label style={lbl}>ID / License Photo</label>
            <UploadZone
              file={form.spouseIdPhotoFile}
              fileName={form.spouseIdPhotoFileName}
              onFile={makeFileHandler("spouseIdPhotoFile", "spouseIdPhotoFileName")}
              onRemove={() => { set("spouseIdPhotoFile", null); set("spouseIdPhotoFileName", ""); }}
              accept=".jpg,.jpeg,.png,.pdf"
              icon="🪪"
              label="Upload spouse ID or License photo"
              preview={true}
            />
          </div>
        </div>
      </div>
    ),

    identity: (
      <div style={{ display: "grid", gap: 16 }}>
        <SectionHeader icon="🪪" title="Primary Member Identity" />
        <div>
          <label style={lbl}>ID Type</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ID_TYPES.map((t) => (
              <button key={t} onClick={() => set("idType", t)} style={{
                padding: "8px 16px", borderRadius: 20, border: "2px solid",
                borderColor: form.idType === t ? "#0ea5e9" : "#e2e8f0",
                background: form.idType === t ? "#e0f2fe" : "#f8fafc",
                color: form.idType === t ? "#0369a1" : "#64748b",
                fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={lbl}>ID / License Number</label>
          <input style={baseInp} value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} placeholder="e.g. DL-1234-TX" />
        </div>
        <div>
          <label style={lbl}>ID / License Photo</label>
          <UploadZone
            file={form.idPhotoFile} fileName={form.idPhotoFileName}
            onFile={makeFileHandler("idPhotoFile", "idPhotoFileName")}
            onRemove={() => { set("idPhotoFile", null); set("idPhotoFileName", ""); }}
            accept=".jpg,.jpeg,.png,.pdf" icon="🪪" label="Upload ID or License photo" preview={true}
          />
        </div>
      </div>
    ),

    payment: (
      <div style={{ display: "grid", gap: 16 }}>
        <SectionHeader icon="💳" title="Payment Details" />
        <div>
          <label style={lbl}>Payment Status</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PAYMENT_OPTIONS.map((opt) => {
              const isActive = form.payment === opt;
              const isNotPaid = opt === "Not Paid";
              return (
                <button key={opt} onClick={() => set("payment", opt)} style={{
                  padding: "9px 18px", borderRadius: 20, border: "2px solid",
                  borderColor: isActive ? (isNotPaid ? "#fca5a5" : "#0ea5e9") : "#e2e8f0",
                  background: isActive ? (isNotPaid ? "#fee2e2" : "#e0f2fe") : "#f8fafc",
                  color: isActive ? (isNotPaid ? "#991b1b" : "#0369a1") : "#64748b",
                  fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{opt}</button>
              );
            })}
          </div>
        </div>
        <div>
          <label style={lbl}>Amount Paid</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: 700, fontSize: 15 }}>$</span>
            <input
              type="number" min="0" step="0.01"
              style={{ ...baseInp, paddingLeft: 28 }}
              value={form.amountPaid}
              onChange={(e) => set("amountPaid", e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={lbl}>Receipt #</label>
            <input style={baseInp}
              value={form.receiptNumber} onChange={(e) => set("receiptNumber", e.target.value)} placeholder="RCP-2024-000" />
          </div>
          <div>
            <label style={lbl}>Date *</label>
            <input type="date" style={{ ...baseInp, borderColor: errors.date ? "#ef4444" : "#e2e8f0" }}
              value={form.date} onChange={(e) => set("date", e.target.value)} />
            {errors.date && <div style={errStyle}>{errors.date}</div>}
          </div>
        </div>
      </div>
    ),

    family: (
      <div style={{ display: "grid", gap: 16 }}>
        <SectionHeader icon="👨‍👩‍👧" title="Family Members" />
        <div>
          <label style={lbl}>Add Family Member</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>Full Name</div>
              <input
                style={{ ...baseInp }}
                value={familyInput.name}
                onChange={(e) => setFamilyInput((fi) => ({ ...fi, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addFamily()}
                placeholder="e.g. Emma Smith"
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>Date of Birth</div>
              <input
                type="date"
                style={{ ...baseInp, width: "auto", minWidth: 150 }}
                value={familyInput.dob}
                onChange={(e) => setFamilyInput((fi) => ({ ...fi, dob: e.target.value }))}
              />
            </div>
            <button onClick={addFamily} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#0ea5e9", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 20, height: 42 }}>+</button>
          </div>
        </div>
        {form.family.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {form.family.map((fm, i) => {
              const age = fm.dob ? Math.floor((Date.now() - new Date(fm.dob)) / 31557600000) : null;
              return (
                <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {fm.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{fm.name}</div>
                      {fm.dob ? (
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          🎂 {new Date(fm.dob + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          <span style={{ marginLeft: 6, background: "#e0f2fe", color: "#0369a1", borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{age} yrs</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontStyle: "italic" }}>No date of birth</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => set("family", form.family.filter((_, idx) => idx !== i))}
                    style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, color: "#ef4444", cursor: "pointer", padding: "4px 10px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}
                  >✕</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "28px", color: "#94a3b8", fontSize: 13, background: "#f8fafc", borderRadius: 12, border: "1.5px dashed #e2e8f0" }}>No family members added yet</div>
        )}
      </div>
    ),

    beneficiary: (
      <div style={{ display: "grid", gap: 16 }}>
        <SectionHeader icon="🤝" title="Beneficiary Contact" />
        <div>
          <label style={lbl}>Beneficiary Full Name</label>
          <input style={baseInp} value={form.beneficiaryName} onChange={(e) => set("beneficiaryName", e.target.value)} placeholder="e.g. John Smith" />
        </div>
        <div>
          <label style={lbl}>Beneficiary Phone</label>
          <input style={baseInp} value={form.beneficiaryPhone} onChange={(e) => set("beneficiaryPhone", e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
        <div>
          <label style={lbl}>Beneficiary Address</label>
          <textarea style={{ ...baseInp, minHeight: 80, resize: "vertical" }}
            value={form.beneficiaryAddress} onChange={(e) => set("beneficiaryAddress", e.target.value)} placeholder="Street, City, State, ZIP" />
        </div>
      </div>
    ),

    documents: (
      <div style={{ display: "grid", gap: 20 }}>
        <SectionHeader icon="📄" title="Paper Application" />
        <UploadZone
          file={form.applicationFile} fileName={form.applicationFileName}
          onFile={makeFileHandler("applicationFile", "applicationFileName")}
          onRemove={() => { set("applicationFile", null); set("applicationFileName", ""); }}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" icon="📄" label="Upload paper application" preview={false}
        />
        {form.applicationFile && form.applicationFileName?.match(/\.(jpg|jpeg|png)$/i) && (
          <img src={form.applicationFile} alt="App Preview" style={{ width: "100%", borderRadius: 10, border: "1.5px solid #e2e8f0", maxHeight: 200, objectFit: "cover" }} />
        )}
      </div>
    ),
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.62)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 640, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,0.28)" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0f172a" }}>
                {member ? "Edit Member" : "New Member"}
              </h2>
              {form.membershipType && <div style={{ marginTop: 6 }}><MemberTypeBadge type={form.membershipType} /></div>}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 1 }}>
            {sections.map((s) => {
              const isSpouse = s.key === "spouse";
              const isActive = activeSection === s.key;
              return (
                <button key={s.key} onClick={() => setActiveSection(s.key)} style={{
                  padding: "8px 11px", borderRadius: "10px 10px 0 0", border: "none",
                  background: isActive ? (isSpouse ? "#fdf4ff" : "#f0f9ff") : "transparent",
                  color: isActive ? (isSpouse ? "#a21caf" : "#0369a1") : "#94a3b8",
                  fontWeight: isActive ? 700 : 500, fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  borderBottom: isActive ? `2.5px solid ${isSpouse ? "#e879f9" : "#0ea5e9"}` : "2.5px solid transparent",
                  whiteSpace: "nowrap", transition: "all 0.15s",
                  position: "relative",
                }}>
                  {s.icon} {s.label}
                  {isSpouse && <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, background: "#e879f9", borderRadius: "50%" }} />}
                </button>
              );
            })}
          </div>
          <div style={{ height: 1, background: "#e2e8f0" }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>
          {sectionContent[activeSection]}
        </div>

        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "11px 22px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Cancel</button>
          <button onClick={handleSubmit} style={{ padding: "11px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, boxShadow: "0 4px 15px rgba(99,102,241,0.35)" }}>
            {member ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isCouple = member.membershipType === "Couple";
  const hasSpouse = isCouple && member.spouseName;

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden", transition: "box-shadow 0.2s, transform 0.2s", boxShadow: expanded ? "0 10px 35px rgba(0,0,0,0.09)" : "0 2px 8px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.09)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = expanded ? "0 10px 35px rgba(0,0,0,0.09)" : "0 2px 8px rgba(0,0,0,0.04)"; }}>

      {/* Card top */}
      <div style={{ padding: "18px 22px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => setExpanded((v) => !v)}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Avatar(s) */}
          {hasSpouse ? (
            <div style={{ position: "relative", width: 52, height: 46, flexShrink: 0 }}>
              <div style={{ position: "absolute", left: 0, width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Playfair Display', serif", border: "2px solid #fff", top: 5 }}>
                {member.name.charAt(0)}
              </div>
              <div style={{ position: "absolute", right: 0, width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #e879f9, #a21caf)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Playfair Display', serif", border: "2px solid #fff", top: 5 }}>
                {member.spouseName.charAt(0)}
              </div>
            </div>
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Playfair Display', serif" }}>
              {member.name.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {member.name}
              {hasSpouse && <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>& {member.spouseName}</span>}
              <MemberTypeBadge type={member.membershipType || "Single"} />
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {member.phone && <span>📞 {member.phone}</span>}
              {member.email && <span>✉️ {member.email}</span>}
              {member.idNumber && <span style={{ fontFamily: "'DM Mono', monospace" }}>🪪 {member.idNumber}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <PaymentBadge status={member.payment} />
          <span style={{ color: "#94a3b8", fontSize: 18, display: "inline-block", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "20px 22px" }} onClick={(e) => e.stopPropagation()}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <DetailRow icon="🪪" label="ID Type" value={member.idType} />
              <DetailRow icon="🔢" label="ID Number" value={member.idNumber} />
              <DetailRow icon="🏠" label="Address" value={member.address} />
              <DetailRow icon="🧾" label="Receipt #" value={member.receiptNumber} />
              <DetailRow icon="💵" label="Amount Paid" value={member.amountPaid ? `$${parseFloat(member.amountPaid).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""} />
              <DetailRow icon="📅" label="Date" value={member.date ? new Date(member.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""} />
              {member.notes && <DetailRow icon="📝" label="Notes" value={member.notes} />}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <DetailRow icon="🤝" label="Beneficiary" value={member.beneficiaryName} />
              <DetailRow icon="📞" label="Ben. Phone" value={member.beneficiaryPhone} />
              <DetailRow icon="📍" label="Ben. Address" value={member.beneficiaryAddress} />
            </div>
          </div>

          {/* Spouse block */}
          {isCouple && (
            <div style={{ background: "linear-gradient(135deg, #fdf4ff, #faf5ff)", border: "1.5px solid #e9d5ff", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#7e22ce", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>💍</span> Spouse / Partner
              </div>
              {member.spouseName ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <DetailRow icon="👤" label="Name" value={member.spouseName} />
                  <DetailRow icon="✉️" label="Email" value={member.spouseEmail} />
                  <DetailRow icon="📞" label="Phone" value={member.spousePhone} />
                  <DetailRow icon="🪪" label="ID Type" value={member.spouseIdType} />
                  <DetailRow icon="🔢" label="ID Number" value={member.spouseIdNumber} />
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#c084fc", fontStyle: "italic" }}>No spouse information added yet.</div>
              )}
              {member.spouseIdPhotoFile && member.spouseIdPhotoFileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Spouse ID Photo</div>
                  <img src={member.spouseIdPhotoFile} alt="Spouse ID" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 10, border: "1.5px solid #d8b4fe" }} />
                </div>
              )}
            </div>
          )}

          {/* Primary ID Photo */}
          {member.idPhotoFile && member.idPhotoFileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Primary ID Photo</div>
              <img src={member.idPhotoFile} alt="ID" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 10, border: "1.5px solid #e2e8f0" }} />
            </div>
          )}

          {/* Family */}
          {member.family?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Family Members ({member.family.length})</div>
              <div style={{ display: "grid", gap: 8 }}>
                {member.family.map((fm, i) => {
                  const name = typeof fm === "string" ? fm : fm.name;
                  const dob = typeof fm === "string" ? null : fm.dob;
                  const age = dob ? Math.floor((Date.now() - new Date(dob)) / 31557600000) : null;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", borderRadius: 10, padding: "9px 12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{name}</div>
                        {dob && (
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                            🎂 {new Date(dob + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            <span style={{ marginLeft: 6, background: "#e0f2fe", color: "#0369a1", borderRadius: 8, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{age} yrs</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Application doc */}
          {member.applicationFileName && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Application Document</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", borderRadius: 10, padding: "10px 14px", border: "1.5px solid #e2e8f0" }}>
                <span style={{ fontSize: 20 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{member.applicationFileName}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Application on file</div>
                </div>
                {member.applicationFile && <a href={member.applicationFile} download={member.applicationFileName} style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 700, textDecoration: "none" }}>⬇ Download</a>}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 14, borderTop: "1px solid #f8fafc" }}>
            <button onClick={() => onEdit(member)} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>✏️ Edit</button>
            <button onClick={() => onDelete(member.id)} style={{ padding: "8px 20px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>🗑 Remove</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [modal, setModal] = useState(null);
  const [nextId, setNextId] = useState(3);
  const [xlsxReady, setXlsxReady] = useState(!!window.XLSX);

  useEffect(() => {
    if (window.XLSX) { setXlsxReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => setXlsxReady(true);
    document.head.appendChild(script);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter((m) => {
      const matchSearch = !q ||
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.includes(q) ||
        m.idNumber?.toLowerCase().includes(q) ||
        m.receiptNumber?.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q) ||
        m.beneficiaryName?.toLowerCase().includes(q) ||
        m.spouseName?.toLowerCase().includes(q) ||
        m.spouseEmail?.toLowerCase().includes(q) ||
        m.spousePhone?.includes(q) ||
        m.spouseIdNumber?.toLowerCase().includes(q) ||
        m.family?.some((f) => (typeof f === "string" ? f : f.name).toLowerCase().includes(q));
      const matchPayment = filterPayment === "All" || m.payment === filterPayment;
      const matchType = filterType === "All" || m.membershipType === filterType;
      return matchSearch && matchPayment && matchType;
    });
  }, [members, search, filterPayment, filterType]);

  const stats = useMemo(() => ({
    total: members.length,
    singles: members.filter((m) => m.membershipType === "Single").length,
    couples: members.filter((m) => m.membershipType === "Couple").length,
    paid: members.filter((m) => m.payment === "Paid").length,
    pending: members.filter((m) => m.payment === "Pending" || m.payment === "Not Paid").length,
  }), [members]);

  const handleSave = (form) => {
    if (modal && typeof modal === "object") {
      setMembers((ms) => ms.map((m) => m.id === modal.id ? { ...form, id: modal.id } : m));
    } else {
      setMembers((ms) => [...ms, { ...form, id: nextId }]);
      setNextId((n) => n + 1);
    }
    setModal(null);
  };

  const exportToExcel = () => {
    const XLSX = window.XLSX;
    if (!XLSX) { alert("Excel library still loading, please try again."); return; }
    const wb = XLSX.utils.book_new();
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // ── Sheet 1: Members ──────────────────────────────────────────
    const memberRows = members.map((m) => ({
      "Member ID": m.id,
      "Membership Type": m.membershipType || "Single",
      "Full Name": m.name,
      "Email": m.email || "",
      "Phone": m.phone || "",
      "Address": m.address || "",
      "ID Type": m.idType || "",
      "ID Number": m.idNumber || "",
      "Payment Status": m.payment,
      "Amount Paid": m.amountPaid ? parseFloat(m.amountPaid) : "",
      "Receipt #": m.receiptNumber,
      "Date": m.date || "",
      "Notes": m.notes || "",
      "Beneficiary Name": m.beneficiaryName || "",
      "Beneficiary Phone": m.beneficiaryPhone || "",
      "Beneficiary Address": m.beneficiaryAddress || "",
      "Spouse Name": m.membershipType === "Couple" ? (m.spouseName || "") : "N/A",
      "Spouse Email": m.membershipType === "Couple" ? (m.spouseEmail || "") : "N/A",
      "Spouse Phone": m.membershipType === "Couple" ? (m.spousePhone || "") : "N/A",
      "Spouse ID Type": m.membershipType === "Couple" ? (m.spouseIdType || "") : "N/A",
      "Spouse ID Number": m.membershipType === "Couple" ? (m.spouseIdNumber || "") : "N/A",
      "Has ID Photo": m.idPhotoFile ? "Yes" : "No",
      "Has Application Doc": m.applicationFileName ? "Yes" : "No",
    }));
    const wsMembers = XLSX.utils.json_to_sheet(memberRows);
    wsMembers["!cols"] = [
      {wch:10},{wch:16},{wch:24},{wch:28},{wch:18},{wch:36},{wch:18},{wch:18},
      {wch:14},{wch:16},{wch:14},{wch:24},{wch:24},{wch:18},{wch:36},
      {wch:24},{wch:28},{wch:18},{wch:18},{wch:18},{wch:14},{wch:18},
    ];
    XLSX.utils.book_append_sheet(wb, wsMembers, "Members");

    // ── Sheet 2: Family Members ───────────────────────────────────
    const familyRows = [];
    members.forEach((m) => {
      (m.family || []).forEach((fm) => {
        const name = typeof fm === "string" ? fm : fm.name;
        const dob = typeof fm === "string" ? "" : (fm.dob || "");
        const age = dob ? Math.floor((Date.now() - new Date(dob)) / 31557600000) : "";
        familyRows.push({
          "Member ID": m.id,
          "Member Name": m.name,
          "Family Member Name": name,
          "Date of Birth": dob,
          "Age": age,
        });
      });
    });
    const wsFamily = XLSX.utils.json_to_sheet(familyRows.length ? familyRows : [{ "Note": "No family members recorded" }]);
    wsFamily["!cols"] = [{wch:10},{wch:24},{wch:24},{wch:16},{wch:8}];
    XLSX.utils.book_append_sheet(wb, wsFamily, "Family Members");

    // ── Sheet 3: Summary ─────────────────────────────────────────
    const summaryData = [
      ["WALIA ASSOCIATION — Member Report"],
      ["Generated:", now],
      [""],
      ["MEMBERSHIP SUMMARY"],
      ["Total Members", members.length],
      ["Single Members", members.filter(m => m.membershipType === "Single").length],
      ["Couple Members", members.filter(m => m.membershipType === "Couple").length],
      ["Total Family Members", members.reduce((acc, m) => acc + (m.family?.length || 0), 0)],
      [""],
      ["PAYMENT SUMMARY"],
      ["Paid", members.filter(m => m.payment === "Paid").length],
      ["Pending", members.filter(m => m.payment === "Pending").length],
      ["Partial", members.filter(m => m.payment === "Partial").length],
      ["Waived", members.filter(m => m.payment === "Waived").length],
      ["Not Paid", members.filter(m => m.payment === "Not Paid").length],
      [""],
      ["AMOUNT COLLECTED"],
      ["Total Amount Paid", members.reduce((acc, m) => acc + (parseFloat(m.amountPaid) || 0), 0)],
      [""],
      ["DOCUMENT STATUS"],
      ["Members with ID Photo", members.filter(m => m.idPhotoFile).length],
      ["Members with Application", members.filter(m => m.applicationFileName).length],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{wch:30},{wch:20}];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    XLSX.writeFile(wb, `WALIA_Association_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleDelete = (id) => {
    if (confirm("Remove this member?")) setMembers((ms) => ms.filter((m) => m.id !== id));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f4f8; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        input:focus, textarea:focus { outline: none; border-color: #0ea5e9 !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f9ff 0%, #f8f4ff 100%)", fontFamily: "'DM Sans', sans-serif", paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "32px 24px 28px", color: "#fff" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#94a3b8", fontWeight: 700, marginBottom: 6 }}>Members Organizer</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>WALIA ASSOCIATION</h1>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={exportToExcel} disabled={!xlsxReady} style={{ padding: "12px 20px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.2)", background: xlsxReady ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", color: xlsxReady ? "#e2e8f0" : "#64748b", fontWeight: 700, cursor: xlsxReady ? "pointer" : "not-allowed", fontSize: 14, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(8px)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { if (xlsxReady) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = xlsxReady ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"; }}>
                  📊 {xlsxReady ? "Download Report" : "Loading…"}
                </button>
                <button onClick={() => setModal("new")} style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>+ New Member</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 28 }}>
              {[
                { label: "Total", value: stats.total, color: "#38bdf8" },
                { label: "Singles 🧍", value: stats.singles, color: "#4ade80" },
                { label: "Couples 👫", value: stats.couples, color: "#e879f9" },
                { label: "Paid", value: stats.paid, color: "#fb923c" },
                { label: "Pending", value: stats.pending, color: "#fbbf24" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 24px 0" }}>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94a3b8" }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, spouse, email, ID, phone, address, beneficiary…"
              style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", outline: "none" }} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", background: "#fff", borderRadius: 10, padding: "6px 10px", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Type:</span>
              {["All", "Single", "Couple"].map((opt) => (
                <button key={opt} onClick={() => setFilterType(opt)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "1.5px solid",
                  borderColor: filterType === opt ? (opt === "Couple" ? "#e879f9" : opt === "Single" ? "#4ade80" : "#0ea5e9") : "#e2e8f0",
                  background: filterType === opt ? (opt === "Couple" ? "#fdf4ff" : opt === "Single" ? "#f0fdf4" : "#e0f2fe") : "#f8fafc",
                  color: filterType === opt ? (opt === "Couple" ? "#a21caf" : opt === "Single" ? "#15803d" : "#0369a1") : "#64748b",
                  fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{opt === "Single" ? "🧍" : opt === "Couple" ? "👫" : ""} {opt}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", background: "#fff", borderRadius: 10, padding: "6px 10px", border: "1.5px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>Payment:</span>
              {["All", ...PAYMENT_OPTIONS].map((opt) => (
                <button key={opt} onClick={() => setFilterPayment(opt)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "1.5px solid",
                  borderColor: filterPayment === opt ? "#0ea5e9" : "#e2e8f0",
                  background: filterPayment === opt ? "#e0f2fe" : "#f8fafc",
                  color: filterPayment === opt ? "#0369a1" : "#64748b",
                  fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{opt}</button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 12, marginBottom: 16 }}>
            {filtered.length === members.length ? `Showing all ${members.length} members` : `Showing ${filtered.length} of ${members.length} members`}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "1.5px dashed #e2e8f0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#64748b" }}>No members found</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Try adjusting your search or filters</div>
              </div>
            ) : filtered.map((m) => (
              <MemberCard key={m.id} member={m} onEdit={(m) => setModal(m)} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <Modal member={typeof modal === "object" ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </>
  );
}
