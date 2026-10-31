const fs = require('fs');
const path = require('path');

// 1. patients_data.json में 7237042741 को एडमिन बनाना
const dataFile = path.join(__dirname, 'patients_data.json');
let data = [];
if (fs.existsSync(dataFile)) {
  try { data = JSON.parse(fs.readFileSync(dataFile, 'utf8') || '[]'); } catch(e) { data = []; }
}
data = data.filter(p => p.phone !== '7237042741' && p.registrationId !== 'ADMIN-KGMU');

const adminUser = {
  id: "ADMIN-01",
  registrationId: "ADMIN-KGMU",
  name: "KGMU एडमिन / चीफ कंसल्टेंट",
  phone: "7237042741",
  email: "admin7237@gmail.com",
  password: "admin@kgmu2026",
  address: "KGMU कैंसर संस्थान, चौक, लखनऊ",
  problem: "N/A",
  department: "Medical Oncology",
  doctor: "डॉ. राजीव गुप्ता",
  role: "Super Admin",
  createdAt: new Date().toISOString(),
  appointments: [],
  reports: []
};
data.unshift(adminUser);
fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
console.log('1. एडमिन (7237042741) डेटाबेस में सेट हो गया!');

// 2. routes/authRoutes.js में /all-patients रूट जोड़ना (फोटो और रिपोर्ट्स देखने के लिए)
const routesFile = path.join(__dirname, 'routes/authRoutes.js');
let code = fs.readFileSync(routesFile, 'utf8');
if (!code.includes('/all-patients')) {
  const snippet = `
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
`;
  code = code.replace("module.exports = router;", snippet + "\nmodule.exports = router;");
  fs.writeFileSync(routesFile, code, 'utf8');
  console.log('2. routes/authRoutes.js में /all-patients रूट सफलतापूर्वक जुड़ गया!');
} else {
  console.log('2. /all-patients रूट पहले से मौजूद है।');
}
