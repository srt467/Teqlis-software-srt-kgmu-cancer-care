const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../patients_data.json");
const UPLOAD_DIR = path.join(__dirname, "../uploads/reports");

// सुरक्षित प्राइवेट अपलोड फोल्डर सुनिश्चित करें
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer स्टोरेज कॉन्फ़िगरेशन (वास्तविक PDF, JPG, JPEG, PNG फाइलें)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `KGMU-REP-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("केवल JPG, PNG और PDF फाइलें मान्य हैं!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB अधिकतम सीमा प्रति फाइल
});

// हेल्पर: मरीजों का डेटा पढ़ना
const getPatients = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), "utf8");
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
};

// हेल्पर: मरीजों का डेटा सेव करना
const savePatients = (patients) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(patients, null, 2), "utf8");
};

// -------------------------------------------------------------
// मौजूदा साइन अप, लॉगिन और अपॉइंटमेंट रूट्स (यथावत सुरक्षित)
// -------------------------------------------------------------
router.post("/signup", (req, res) => {
  const { name, phone, email, password, address, problem, department, doctor } = req.body;
  if (!name || !phone || !email || !password || !address || !problem || !department || !doctor) {
    return res.status(400).json({ success: false, message: "सभी फ़ील्ड भरना अनिवार्य है!" });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "कृपया 10-अंकों का भारतीय मोबाइल नंबर भरें!" });
  }
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    return res.status(400).json({ success: false, message: "ईमेल केवल @gmail.com मान्य है!" });
  }

  const patients = getPatients();
  if (patients.find(p => p.phone === phone || p.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: "फोन या ईमेल पहले से पंजीकृत है!" });
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
        title: "प्रारंभिक ओपीडी परामर्श एवं बायोप्सी मूल्यांकन",
        department: "Medical Oncology",
        category: "Biopsy / Histopathology",
        date: "2026-10-15",
        doctorName: doctor,
        hospitalName: "KGMU Radiotherapy & Oncology Center",
        diagnosis: problem.trim(),
        medicines: "Tab Paracetamol 650mg SOS, Multivitamins, Antacid",
        problemHistory: problem.trim(),
        treatmentDetails: "प्रारंभिक रक्त परीक्षण एवं बायोप्सी परामर्श",
        uploadedBy: "Dr. KGMU Oncology Staff",
        uploadDate: new Date().toISOString(),
        verificationStatus: "Verified",
        verifiedBy: "Dr. Rajiv Gupta (HOD)",
        files: [],
        auditLog: [
          { action: "Created", by: "System", timestamp: new Date().toISOString() }
        ],
        versionHistory: [
          { version: 1, modifiedAt: new Date().toISOString(), note: "Initial Record" }
        ]
      }
    ]
  };

  patients.push(newPatient);
  savePatients(patients);
  return res.status(201).json({ success: true, message: "पंजीकरण सफल!", patient: newPatient });
});

router.post("/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "विवरण और पासवर्ड भरें!" });
  }
  const patients = getPatients();
  const cleanId = identifier.trim().toLowerCase();
  const patient = patients.find(
    p => (p.phone === identifier.trim() || p.email.toLowerCase() === cleanId || p.registrationId.toLowerCase() === cleanId) && p.password === password
  );

  if (!patient) {
    return res.status(401).json({ success: false, message: "अमान्य विवरण या पासवर्ड!" });
  }
  return res.status(200).json({ success: true, message: "लॉगिन सफल!", patient });
});

router.post("/book-appointment", (req, res) => {
  const { registrationId, doctor, department, date, timeSlot, note } = req.body;
  const patients = getPatients();
  const idx = patients.findIndex(p => p.registrationId === registrationId);
  if (idx === -1) return res.status(404).json({ success: false, message: "मरीज नहीं मिला!" });

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

// -------------------------------------------------------------
// 3. अपग्रेडेड वास्तविक मल्टीपल रिपोर्ट फाइल अपलोड API
// -------------------------------------------------------------
router.post("/upload-report", upload.array("files", 5), (req, res) => {
  try {
    const {
      registrationId,
      department,
      category,
      title,
      doctorName,
      hospitalName,
      diagnosis,
      medicines,
      problemHistory,
      treatmentDetails,
      uploadedByRole
    } = req.body;

    const patients = getPatients();
    const idx = patients.findIndex(p => p.registrationId === registrationId);
    if (idx === -1) {
      // अगर मरीज नहीं मिला तो अपलोड हुई फाइलें डिलीट करें
      if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
      return res.status(404).json({ success: false, message: "मरीज का रिकॉर्ड नहीं मिला!" });
    }

    const uploadedFiles = (req.files || []).map(f => ({
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
      verificationStatus: "Pending Verification", // नई रिपोर्ट डिफ़ॉल्ट रूप से पेंडिंग रहेगी
      verifiedBy: null,
      files: uploadedFiles,
      auditLog: [
        {
          action: "Uploaded",
          by: uploadedByRole || "Staff",
          timestamp: new Date().toISOString(),
          note: `${uploadedFiles.length} फाइलें अपलोड की गईं`
        }
      ],
      versionHistory: [
        { version: 1, modifiedAt: new Date().toISOString(), note: "प्रारंभिक फाइल अपलोड" }
      ]
    };

    patients[idx].reports = patients[idx].reports || [];
    patients[idx].reports.unshift(newReport);
    savePatients(patients);

    return res.status(201).json({
      success: true,
      message: "रिपोर्ट एवं फाइलें सफलतापूर्वक अपलोड और सुरक्षित सेव हो गईं!",
      patient: patients[idx],
      report: newReport
    });
  } catch (error) {
    if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
    return res.status(500).json({ success: false, message: error.message || "अपलोड विफल रहा!" });
  }
});

// 4. सुरक्षित प्राइवेट फाइल डाउनलोड/प्रीव्यू एंडपॉइंट
router.get("/download-file/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("फाइल सर्वर पर नहीं मिली!");
  }
  res.sendFile(filePath);
});

// 5. रिपोर्ट सत्यापन (Verification) API - केवल अधिकृत यूजर के लिए
router.post("/verify-report", (req, res) => {
  const { registrationId, reportId, userRole, verifiedByName } = req.body;
  
  // रोल वैलिडेशन
  const allowedRoles = ["Super Admin", "Administrator", "Doctor", "Radiation Oncologist"];
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, message: "अनुमति अस्वीकृत! केवल अधिकृत डॉक्टर ही सत्यापित कर सकते हैं।" });
  }

  const patients = getPatients();
  const pIdx = patients.findIndex(p => p.registrationId === registrationId);
  if (pIdx === -1) return res.status(404).json({ success: false, message: "मरीज नहीं मिला!" });

  const rIdx = patients[pIdx].reports.findIndex(r => r.id === reportId);
  if (rIdx === -1) return res.status(404).json({ success: false, message: "रिपोर्ट नहीं मिली!" });

  patients[pIdx].reports[rIdx].verificationStatus = "Verified";
  patients[pIdx].reports[rIdx].verifiedBy = verifiedByName || "Consultant Oncologist";
  patients[pIdx].reports[rIdx].auditLog.push({
    action: "Verified",
    by: `${userRole}: ${verifiedByName}`,
    timestamp: new Date().toISOString()
  });

  savePatients(patients);
  return res.status(200).json({
    success: true,
    message: "रिपोर्ट सफलतापूर्वक सत्यापित (Verified) कर दी गई!",
    patient: patients[pIdx]
  });
});

// 6. रिपोर्ट आर्काइव (Archive) API - महत्वपूर्ण डेटा को स्थायी डिलीट होने से बचाना
router.post("/archive-report", (req, res) => {
  const { registrationId, reportId, userRole } = req.body;
  if (!["Super Admin", "Administrator", "Doctor"].includes(userRole)) {
    return res.status(403).json({ success: false, message: "रिपोर्ट आर्काइव करने की अनुमति नहीं है।" });
  }

  const patients = getPatients();
  const pIdx = patients.findIndex(p => p.registrationId === registrationId);
  if (pIdx === -1) return res.status(404).json({ success: false, message: "मरीज नहीं मिला!" });

  const rIdx = patients[pIdx].reports.findIndex(r => r.id === reportId);
  if (rIdx === -1) return res.status(404).json({ success: false, message: "रिपोर्ट नहीं मिली!" });

  patients[pIdx].reports[rIdx].verificationStatus = "Archived";
  patients[pIdx].reports[rIdx].auditLog.push({
    action: "Archived",
    by: userRole,
    timestamp: new Date().toISOString()
  });

  savePatients(patients);
  return res.status(200).json({ success: true, message: "रिपोर्ट सुरक्षित आर्काइव कर दी गई!", patient: patients[pIdx] });
});

module.exports = router;