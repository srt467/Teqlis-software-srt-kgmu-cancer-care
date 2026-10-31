const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validations/authValidation");

const dataFilePath = path.join(__dirname, "../patients_data.json");
const loadPatients = () => {
  if (!fs.existsSync(dataFilePath)) return [];
  try { return JSON.parse(fs.readFileSync(dataFilePath, "utf8")); } catch(e) { return []; }
};
const savePatients = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
};

exports.registerPatient = async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { name, phone, email, registrationId, password } = req.body;
    const patients = loadPatients();

    const exists = patients.find(p => p.email === email || p.phone === phone || p.registrationId === registrationId);
    if (exists) {
      return res.status(400).json({ success: false, message: "मरीज का रिकॉर्ड पहले से मौजूद है।" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      registrationId,
      password: hashedPassword,
      department: "Oncology",
      supportContact: "7237042741"
    };

    patients.push(newPatient);
    savePatients(patients);

    res.status(201).json({ success: true, message: "रजिस्ट्रेशन सफल रहा!", helpline: "7237042741" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { identifier, password } = req.body;
    const patients = loadPatients();

    const patient = patients.find(p => p.email === identifier || p.phone === identifier || p.registrationId === identifier);
    if (!patient) return res.status(404).json({ success: false, message: "मरीज नहीं मिला।" });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "गलत पासवर्ड।" });

    const token = jwt.sign({ id: patient.id }, "kgmu_secret_token", { expiresIn: "7d" });
    res.status(200).json({
      success: true,
      token,
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        registrationId: patient.registrationId,
        department: patient.department,
        supportContact: patient.supportContact
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
