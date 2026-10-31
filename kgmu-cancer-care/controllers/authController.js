const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validations/authValidation');

exports.registerPatient = async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { name, phone, email, registrationId, password } = req.body;
    const existingPatient = await Patient.findOne({ $or: [{ email }, { phone }, { registrationId }] });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: 'मरीज का रिकॉर्ड पहले से मौजूद है।' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({ name, phone, email, registrationId, password: hashedPassword });
    await newPatient.save();

    res.status(201).json({ success: true, message: 'रजिस्ट्रेशन सफल रहा!', helpline: '7237042741' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { identifier, password } = req.body;
    const patient = await Patient.findOne({
      $or: [{ email: identifier }, { phone: identifier }, { registrationId: identifier }]
    });

    if (!patient) return res.status(404).json({ success: false, message: 'मरीज नहीं मिला।' });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'गलत पासवर्ड।' });

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      success: true,
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        registrationId: patient.registrationId,
        supportContact: '7237042741'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
