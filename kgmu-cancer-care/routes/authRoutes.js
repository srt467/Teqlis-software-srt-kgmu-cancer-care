const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../patients_data.json");
const UPLOAD_DIR = path.join(__dirname, "../uploads/reports");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `KGMU-REP-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// JSON फ़ाइल से डेटा लोड करना (बिना किसी MongoDB के)
const getPatients = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]", "utf8");
    }
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content || "[]");
  } catch (err) {
    return [];
  }
};

// JSON फ़ाइल में डेटा सुरक्षित सेव करना
const savePatients = (patients) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(patients, null, 2), "utf8");
};

// 1. लॉगिन रूट (सीधे JSON फ़ाइल से चेक)
router.post("/login", (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "विवरण और पासवर्ड दर्ज करें!" });
    }

    const patients = getPatients();
    const cleanId = identifier.trim().toLowerCase();

    const patient = patients.find(
      (p) =>
        (p.phone === identifier.trim() ||
          (p.email && p.email.toLowerCase() === cleanId) ||
          (p.registrationId && p.registrationId.toLowerCase() === cleanId)) &&
        p.password === password
    );

    if (!patient) {
      return res.status(401).json({ success: false, message: "अमान्य विवरण या गलत पासवर्ड!" });
    }

    return res.status(200).json({ success: true, message: "लॉगिन सफल!", patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. साइन अप रूट
router.post("/signup", (req, res) => {
  try {
    const { name, phone, email, password, address, problem, department, doctor } = req.body;
    if (!name || !phone || !email || !password || !address || !problem || !department || !doctor) {
      return res.status(400).json({ success: false, message: "सभी फ़ील्ड भरना अनिवार्य है!" });
    }

    const patients = getPatients();
    const existing = patients.find(
      (p) => p.phone === phone.trim() || p.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ success: false, message: "यह फोन या ईमेल पहले से पंजीकृत है!" });
    }

    const registrationId = `KGMU-ONCO-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPatient = {
      id: Date.now().toString(),
      registrationId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      address: address.trim(),
      problem: problem.trim(),
      department,
      doctor,
      role: "Patient",
      createdAt: new Date().toISOString(),
      appointments: [],
      reports: [
        {
          id: "REP-INIT-01",
          title: "प्रारंभिक क्लिनिकल मूल्यांकन एवं हिस्ट्री",
          department: department === "Radiation" ? "Radiation Oncology" : "Medical Oncology",
          category: "Biopsy / Histopathology",
          date: new Date().toISOString().split("T")[0],
          doctorName: doctor,
          hospitalName: "King George's Medical University, Lucknow",
          diagnosis: problem.trim(),
          medicines: "Tab Paracetamol 650mg, Antacid, Multivitamins",
          problemHistory: problem.trim(),
          treatmentDetails: "प्रारंभिक ओपीडी परामर्श",
          uploadedBy: "KGMU Registration Desk",
          uploadDate: new Date().toISOString(),
          verificationStatus: "Verified",
          verifiedBy: doctor,
          files: [],
          auditLog: [{ action: "Created", by: "System", timestamp: new Date().toISOString() }],
          versionHistory: [{ version: 1, modifiedAt: new Date().toISOString(), note: "Initial Record" }]
        }
      ]
    };

    patients.push(newPatient);
    savePatients(patients);

    return res.status(201).json({ success: true, message: "पंजीकरण सफल!", patient: newPatient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. अपॉइंटमेंट बुकिंग
router.post("/book-appointment", (req, res) => {
  const { registrationId, doctor, department, date, timeSlot, note } = req.body;
  const patients = getPatients();
  const idx = patients.findIndex((p) => p.registrationId === registrationId);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: "मरीज नहीं मिला!" });
  }

  const newAppt = {
    id: `APT-${Date.now()}`,
    doctor,
    department,
    date,
    timeSlot,
    note: note || "नियमित फॉलो-अप",
    status: "कन्फर्म"
  };

  patients[idx].appointments = patients[idx].appointments || [];
  patients[idx].appointments.unshift(newAppt);
  savePatients(patients);

  return res.status(200).json({ success: true, message: "अपॉइंटमेंट दर्ज!", patient: patients[idx] });
});

// 4. रिपोर्ट व फाइल अपलोड
router.post("/upload-report", upload.array("files", 5), (req, res) => {
  try {
    const { registrationId, department, category, title, doctorName, hospitalName, diagnosis, medicines, problemHistory, treatmentDetails, uploadedByRole } = req.body;
    const patients = getPatients();
    const idx = patients.findIndex((p) => p.registrationId === registrationId);

    if (idx === -1) {
      if (req.files) req.files.forEach((f) => fs.unlinkSync(f.path));
      return res.status(404).json({ success: false, message: "मरीज नहीं मिला!" });
    }

    const uploadedFiles = (req.files || []).map((f) => ({
      originalName: f.originalname,
      fileName: f.filename,
      size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      mimeType: f.mimetype,
      downloadUrl: `/api/auth/download-file/${f.filename}`
    }));

    const newReport = {
      id: `REP-${Date.now()}`,
      registrationId,
      department: department || "Medical Oncology",
      category: category || "Biopsy / Histopathology",
      title: title || "चिकित्सा रिपोर्ट",
      date: new Date().toISOString().split("T")[0],
      doctorName: doctorName || patients[idx].doctor,
      hospitalName: hospitalName || "King George's Medical University, Lucknow",
      diagnosis: diagnosis || patients[idx].problem,
      medicines: medicines || "सलाह अनुसार",
      problemHistory: problemHistory || "निगरानी में",
      treatmentDetails: treatmentDetails || "मानक प्रोटोकॉल",
      uploadedBy: uploadedByRole || "Medical Staff",
      uploadDate: new Date().toISOString(),
      verificationStatus: "Pending Verification",
      verifiedBy: null,
      files: uploadedFiles,
      auditLog: [{ action: "Uploaded", by: uploadedByRole || "Staff", timestamp: new Date().toISOString() }],
      versionHistory: [{ version: 1, modifiedAt: new Date().toISOString(), note: "Upload" }]
    };

    patients[idx].reports = patients[idx].reports || [];
    patients[idx].reports.unshift(newReport);
    savePatients(patients);

    return res.status(201).json({ success: true, message: "रिपोर्ट अपलोड सफल!", patient: patients[idx], report: newReport });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. फ़ाइल डाउनलोड/व्यू
router.get("/download-file/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("फ़ाइल नहीं मिली!");
  res.sendFile(filePath);
});

// 6. वेरिफिकेशन
router.post("/verify-report", (req, res) => {
  const { registrationId, reportId, userRole, verifiedByName } = req.body;
  const patients = getPatients();
  const pIdx = patients.findIndex((p) => p.registrationId === registrationId);
  if (pIdx === -1) return res.status(404).json({ success: false, message: "मरीज नहीं मिला!" });

  const rIdx = patients[pIdx].reports.findIndex((r) => r.id === reportId);
  if (rIdx === -1) return res.status(404).json({ success: false, message: "रिपोर्ट नहीं मिली!" });

  patients[pIdx].reports[rIdx].verificationStatus = "Verified";
  patients[pIdx].reports[rIdx].verifiedBy = verifiedByName || "Dr. KGMU Consultant";
  patients[pIdx].reports[rIdx].auditLog.push({ action: "Verified", by: userRole, timestamp: new Date().toISOString() });
  savePatients(patients);

  return res.status(200).json({ success: true, message: "सत्यापित संपन्न!", patient: patients[pIdx] });
});


// सभी मरीजों की पूरी सूची व उनकी रिपोर्ट्स (एडमिन के लिए)
router.get("/all-patients", (req, res) => {
  try {
    const patients = getPatients();
    const safeList = patients.map(({ password, ...rest }) => rest);
    return res.status(200).json({ success: true, patients: safeList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;