const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "../patients_data.json");

// हेल्पर: मरीजों का डेटा लोड करना
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

// 1. साइन अप (Signup API with Address & Health Issue)
router.post("/signup", (req, res) => {
  const { name, phone, email, password, address, problem, department, doctor } = req.body;

  if (!name || !phone || !email || !password || !address || !problem || !department || !doctor) {
    return res.status(400).json({ success: false, message: "कृपया सभी फ़ील्ड (नाम, फोन, पता, बीमारी आदि) भरें!" });
  }

  // 10 डिजिट भारतीय मोबाइल नंबर वैलिडेशन
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "कृपया सही 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें!" });
  }

  // @gmail.com वैलिडेशन
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    return res.status(400).json({ success: false, message: "ईमेल केवल @gmail.com मान्य है!" });
  }

  const patients = getPatients();
  const existingUser = patients.find(
    (p) => p.phone === phone || p.email.toLowerCase() === email.toLowerCase()
  );
  if (existingUser) {
    return res.status(400).json({ success: false, message: "यह फोन नंबर या जीमेल पहले से पंजीकृत है!" });
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
    createdAt: new Date().toISOString(),
    appointments: [],
    reports: [
      {
        id: "REP-INIT-01",
        title: "प्राथमिक क्लिनिकल मूल्यांकन एवं बायोप्सी",
        date: "प्रारंभिक ओपीडी",
        medicines: "पैरासिटामोल 650mg, एंटासिड सिरप, मल्टीविटामिन",
        problemHistory: problem.trim(),
        status: "सत्यापित (Verified)"
      }
    ]
  };

  patients.push(newPatient);
  savePatients(patients);

  return res.status(201).json({
    success: true,
    message: "पंजीकरण सफल हुआ!",
    patient: newPatient
  });
});

// 2. लॉगिन API (Phone, Gmail, or Registration ID)
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "लॉगिन विवरण और पासवर्ड दर्ज करें!" });
  }

  const patients = getPatients();
  const cleanId = identifier.trim().toLowerCase();

  const patient = patients.find(
    (p) =>
      (p.phone === identifier.trim() ||
        p.email.toLowerCase() === cleanId ||
        p.registrationId.toLowerCase() === cleanId) &&
      p.password === password
  );

  if (!patient) {
    return res.status(401).json({ success: false, message: "अमान्य विवरण या गलत पासवर्ड!" });
  }

  return res.status(200).json({ success: true, message: "लॉगिन सफल!", patient });
});

// 3. अपॉइंटमेंट बुकिंग API
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
    bookedAt: new Date().toISOString(),
    status: "कन्फर्म (Confirmed)"
  };

  patients[idx].appointments = patients[idx].appointments || [];
  patients[idx].appointments.unshift(newAppt);
  savePatients(patients);

  return res.status(200).json({
    success: true,
    message: "अपॉइंटमेंट सफलतापूर्वक दर्ज हुआ!",
    patient: patients[idx],
    appointment: newAppt
  });
});

// 4. नई मेडिकल रिपोर्ट / दवाएं अपलोड API
router.post("/upload-report", (req, res) => {
  const { registrationId, title, medicines, problemHistory } = req.body;
  const patients = getPatients();
  const idx = patients.findIndex((p) => p.registrationId === registrationId);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: "मरीज नहीं मिला!" });
  }

  const newReport = {
    id: `REP-${Date.now()}`,
    title: title || "ओपीडी मेडिकल पर्चा",
    date: new Date().toISOString().split("T")[0],
    medicines: medicines || "सलाह अनुसार",
    problemHistory: problemHistory || "निगरानी में",
    status: "अपलोड संपन्न"
  };

  patients[idx].reports = patients[idx].reports || [];
  patients[idx].reports.unshift(newReport);
  savePatients(patients);

  return res.status(200).json({
    success: true,
    message: "रिपोर्ट सफलतापूर्वक सेव हो गई!",
    patient: patients[idx]
  });
});

module.exports = router;