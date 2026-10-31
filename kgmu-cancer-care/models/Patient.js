const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  registrationId: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' },
  department: { type: String, default: 'Oncology' },
  supportContact: { type: String, default: '7237042741' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
