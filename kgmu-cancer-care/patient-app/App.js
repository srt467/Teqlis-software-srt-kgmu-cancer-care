import AdminInboxModal from './AdminInboxModal';
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  Modal
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import TeleConsultationModal from "./TeleConsultationModal";
import { uploadReportToFirebase } from "./reportStorageService";

const BACKEND_URL = "http://192.168.18.41:5000";
const KGMU_LOGO = "https://www.kgmu.org/images/logo.png";
const KGMU_CAMPUS_IMG = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80";
const KGMU_LINAC_IMG = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80";
const KGMU_LAB_IMG = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80";
const HELPLINE_NUMBER = "7237042741";

// 1. मेडिकल ऑन्कोलॉजी रिपोर्ट कैटेगरीज (20 श्रेणियां)
const ONCOLOGY_CATEGORIES = [
  "Biopsy / Histopathology",
  "FNAC / Cytology",
  "IHC Report",
  "Molecular Testing / Biomarker Report",
  "Cancer Staging Report",
  "Tumor Board Summary",
  "CBC / Blood Test",
  "LFT / KFT",
  "CT Scan",
  "MRI",
  "PET-CT",
  "Ultrasound / X-ray",
  "Bone Marrow Report",
  "Tumor Marker Report",
  "Medical Oncology Consultation",
  "Chemotherapy Record",
  "Doctor Prescription",
  "Discharge Summary",
  "Follow-up Report",
  "Other Medical Report"
];

// 2. रेडिएशन ऑन्कोलॉजी रिपोर्ट कैटेगरीज (19 श्रेणियां)
const RADIATION_CATEGORIES = [
  "Radiation Oncology Consultation",
  "CT Simulation Report",
  "Radiotherapy Planning CT",
  "Radiation Treatment Plan",
  "Dose Prescription",
  "3D-CRT",
  "IMRT",
  "VMAT",
  "SBRT",
  "SRS",
  "Brachytherapy",
  "Dose and Fraction Schedule",
  "Daily Radiation Session Record",
  "IGRT / CBCT Verification Report",
  "Treatment Delivery Summary",
  "Radiation Treatment Completion Report",
  "Side Effects / Toxicity Assessment",
  "Radiation Follow-up Report",
  "Other Radiation Report"
];

const USER_ROLES = [
  "Doctor",
  "Radiation Oncologist",
  "Medical Staff",
  "Administrator",
  "Super Admin",
  "Read-only Authorized User"
];

// KGMU वरिष्ठ फैकल्टी एवं विशेषज्ञ डॉक्टर्स डेटा
const DOCTORS_DATA = {
  Oncology: [
    {
      id: "DOC-O1",
      nameHI: "डॉ. राजीव गुप्ता",
      nameEN: "Dr. Rajiv Gupta",
      desigHI: "प्रोफेसर एवं विभागाध्यक्ष (HOD)",
      desigEN: "Professor & Head of Department",
      specHI: "सॉलिड ट्यूमर, टारगेटेड थेरेपी एवं इम्यूनो-ऑन्कोलॉजी",
      specEN: "Solid Tumors, Targeted Therapy & Immuno-Oncology",
      expHI: "24+ वर्ष अनुभव",
      expEN: "24+ Years Experience",
      opdHI: "सोमवार एवं गुरुवार (OPD Room 10)",
      opdEN: "Monday & Thursday (OPD Room 10)",
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80"
    },
    {
      id: "DOC-O2",
      nameHI: "डॉ. सुधा शर्मा",
      nameEN: "Dr. Sudha Sharma",
      desigHI: "अपर प्रोफेसर (Additional Professor)",
      desigEN: "Additional Professor",
      specHI: "हेमेटो-ऑन्कोलॉजी (ल्यूकेमिया, लिम्फोमा) एवं बोन मैरो",
      specEN: "Hemato-Oncology & Bone Marrow Transplant",
      expHI: "18+ वर्ष अनुभव",
      expEN: "18+ Years Experience",
      opdHI: "मंगलवार एवं शुक्रवार (OPD Room 12)",
      opdEN: "Tuesday & Friday (OPD Room 12)",
      img: "https://images.unsplash.com/photo-1594824813583-b9247d8ff210?w=300&q=80"
    },
    {
      id: "DOC-O3",
      nameHI: "डॉ. अमित कुमार मिश्रा",
      nameEN: "Dr. Amit Kumar Mishra",
      desigHI: "सह-आचार्य (Associate Professor)",
      desigEN: "Associate Professor",
      specHI: "जीआई कैंसर, ब्रेस्ट ऑन्कोलॉजी एवं कीमोथेरेपी प्रोटोकॉल",
      specEN: "GI Cancers, Breast Oncology & Chemotherapy Protocols",
      expHI: "12+ वर्ष अनुभव",
      expEN: "12+ Years Experience",
      opdHI: "बुधवार एवं शनिवार (OPD Room 14)",
      opdEN: "Wednesday & Saturday (OPD Room 14)",
      img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&q=80"
    },
    {
      id: "DOC-O4",
      nameHI: "डॉ. प्रियंका सिंह",
      nameEN: "Dr. Priyanka Singh",
      desigHI: "सहायक आचार्य (Assistant Professor)",
      desigEN: "Assistant Professor",
      specHI: "गायनेक ऑन्कोलॉजी एवं पेडियाट्रिक कैंसर केयर",
      specEN: "Gynecological Oncology & Pediatric Cancer Care",
      expHI: "9+ वर्ष अनुभव",
      expEN: "9+ Years Experience",
      opdHI: "सोमवार एवं शुक्रवार (OPD Room 08)",
      opdEN: "Monday & Friday (OPD Room 08)",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80"
    },
    {
      id: "DOC-O5",
      nameHI: "डॉ. विक्रम वर्मा",
      nameEN: "Dr. Vikram Verma",
      desigHI: "वरिष्ठ कंसल्टेंट (Senior Consultant)",
      desigEN: "Senior Consultant Medical Oncologist",
      specHI: "हेड एवं नेक कैंसर तथा उपशामक ऑन्कोलॉजी (Palliative Care)",
      specEN: "Head & Neck Cancers & Palliative Oncology",
      expHI: "15+ वर्ष अनुभव",
      expEN: "15+ Years Experience",
      opdHI: "मंगलवार एवं गुरुवार (OPD Room 11)",
      opdEN: "Tuesday & Thursday (OPD Room 11)",
      img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&q=80"
    },
    {
      id: "DOC-O6",
      nameHI: "डॉ. नेहा रस्तोगी",
      nameEN: "Dr. Neha Rastogi",
      desigHI: "कंसल्टेंट ऑन्कोलॉजिस्ट (Consultant)",
      desigEN: "Consultant Medical Oncologist",
      specHI: "कैंसर बायोमार्कर एवं प्रिसिजन मेडिसिन",
      specEN: "Cancer Biomarkers & Precision Medicine",
      expHI: "11+ वर्ष अनुभव",
      expEN: "11+ Years Experience",
      opdHI: "बुधवार एवं शनिवार (OPD Room 15)",
      opdEN: "Wednesday & Saturday (OPD Room 15)",
      img: "https://images.unsplash.com/photo-1622253694242-abeb37a33e97?w=300&q=80"
    }
  ],
  Radiation: [
    {
      id: "DOC-R1",
      nameHI: "डॉ. एम. एल. बी. भट्ट",
      nameEN: "Dr. M.L.B. Bhatt",
      desigHI: "वरिष्ठ प्रोफेसर एवं पूर्व कुलपति",
      desigEN: "Senior Professor & Former Vice Chancellor",
      specHI: "स्टीरियोटैक्टिक रेडियोसर्जरी (SRS/SBRT) एवं IMRT",
      specEN: "Stereotactic Radiosurgery (SRS/SBRT) & IMRT",
      expHI: "28+ वर्ष अनुभव",
      expEN: "28+ Years Experience",
      opdHI: "सोमवार एवं बुधवार (Radiation OPD 01)",
      opdEN: "Monday & Wednesday (Radiation OPD 01)",
      img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=80"
    },
    {
      id: "DOC-R2",
      nameHI: "डॉ. कीर्ति श्रीवास्तव",
      nameEN: "Dr. Kirti Srivastava",
      desigHI: "प्रोफेसर (रेडियोथेरेपी)",
      desigEN: "Professor of Radiotherapy",
      specHI: "इमेज गाइडेड रेडियोथेरेपी (IGRT) एवं ब्रेस्ट रेडिएशन",
      specEN: "Image-Guided Radiotherapy (IGRT) & Breast Radiation",
      expHI: "20+ वर्ष अनुभव",
      expEN: "20+ Years Experience",
      opdHI: "मंगलवार एवं गुरुवार (Radiation OPD 02)",
      opdEN: "Tuesday & Thursday (Radiation OPD 02)",
      img: "https://images.unsplash.com/photo-1594824813583-b9247d8ff210?w=300&q=80"
    },
    {
      id: "DOC-R3",
      nameHI: "डॉ. संतोष कुमार",
      nameEN: "Dr. Santosh Kumar",
      desigHI: "अपर प्रोफेसर (Additional Professor)",
      desigEN: "Additional Professor",
      specHI: "हाइपरफ्रैक्शनेशन, LINAC थेरेपी एवं ब्रेन ट्यूमर रेडिएशन",
      specEN: "Hyperfractionation, LINAC & Brain Radiosurgery",
      expHI: "16+ वर्ष अनुभव",
      expEN: "16+ Years Experience",
      opdHI: "बुधवार एवं शुक्रवार (Radiation OPD 03)",
      opdEN: "Wednesday & Friday (Radiation OPD 03)",
      img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&q=80"
    },
    {
      id: "DOC-R4",
      nameHI: "डॉ. अभिषेक आनंद",
      nameEN: "Dr. Abhishek Anand",
      desigHI: "सह-आचार्य (Associate Professor)",
      desigEN: "Associate Professor",
      specHI: "3D-CRT, VMAT एवं थोरैसिक रेडिएशन ऑन्कोलॉजी",
      specEN: "3D-CRT, VMAT & Thoracic Radiation Oncology",
      expHI: "13+ वर्ष अनुभव",
      expEN: "13+ Years Experience",
      opdHI: "सोमवार एवं शनिवार (Radiation OPD 04)",
      opdEN: "Monday & Saturday (Radiation OPD 04)",
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80"
    },
    {
      id: "DOC-R5",
      nameHI: "डॉ. पूजा सचान",
      nameEN: "Dr. Pooja Sachan",
      desigHI: "सहायक आचार्य (Assistant Professor)",
      desigEN: "Assistant Professor",
      specHI: "हाई डोज रेट (HDR) ब्रेकीथेरेपी एवं गायनेक रेडिएशन",
      specEN: "High Dose Rate (HDR) Brachytherapy & Gynec Radiation",
      expHI: "10+ वर्ष अनुभव",
      expEN: "10+ Years Experience",
      opdHI: "मंगलवार एवं शुक्रवार (Radiation OPD 05)",
      opdEN: "Tuesday & Friday (Radiation OPD 05)",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80"
    },
    {
      id: "DOC-R6",
      nameHI: "डॉ. तरुण गर्ग",
      nameEN: "Dr. Tarun Garg",
      desigHI: "कंसल्टेंट रेडिएशन ऑन्कोलॉजिस्ट",
      desigEN: "Consultant Radiation Oncologist",
      specHI: "सीटी सिमुलेशन, CBCT वेरिफिकेशन एवं टॉक्सिसिटी असेसमेंट",
      specEN: "CT Simulation, CBCT Verification & Toxicity Assessment",
      expHI: "8+ वर्ष अनुभव",
      expEN: "8+ Years Experience",
      opdHI: "गुरुवार एवं शनिवार (Radiation OPD 06)",
      opdEN: "Thursday & Saturday (Radiation OPD 06)",
      img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&q=80"
    }
  ]
};

// द्विभाषी डिक्शनरी
const T = {
  hi: {
    hospitalName: "KGMU CANCER CARE",
    hospitalSub: "किंग जॉर्ज चिकित्सा विश्वविद्यालय, लखनऊ",
    deptBadge: "रेडियोथेरेपी एवं क्लिनिकल ऑन्कोलॉजी विभाग",
    helplineText: "24x7 कैंसर हेल्पलाइन (कॉल करने के लिए टैप करें):",
    menuHome: "होम",
    menuAbout: "अबाउट",
    menuContact: "कांटेक्ट",
    menuSignup: "साइन अप",
    menuLogin: "लॉग इन",
    heroTitle: "किंग जॉर्ज चिकित्सा विश्वविद्यालय",
    heroDesc: "कैंसर के सटीक निदान, 3D-CRT, अत्याधुनिक लीनियर एक्सेलरेटर (LINAC) रेडिएशन, डे-केयर कीमोथेरेपी और क्लिनिकल रिसर्च का सुपर-स्पेशियलिटी संस्थान।",
    contactHeading: "📞 संपर्क एवं आपातकालीन सहायता केंद्र",
    contactAddress: "अस्पताल का पता: रेडियोथेरेपी एवं ऑन्कोलॉजी विंग, KGMU, शाह मीना रोड, चौक, लखनऊ - 226003",
    opdTimings: "ओपीडी समय: सोमवार से शनिवार (प्रातः 08:30 AM से दोपहर 01:30 PM)",
    callNow: "हेल्पलाइन पर सीधे कॉल करें",
    signupTitle: "मरीज नया पंजीकरण (Sign Up)",
    nameLabel: "मरीज का पूरा नाम *",
    phoneLabel: "10-अंकों का मोबाइल नंबर *",
    emailLabel: "जीमेल आईडी (@gmail.com अनिवार्य) *",
    passLabel: "पासवर्ड बनाएं *",
    addressLabel: "मरीज का स्थायी पता (Address) *",
    problemLabel: "क्या दिक्कत/बीमारी है? (Chief Complaints) *",
    deptLabel: "डिपार्टमेंट का चयन करें *",
    docLabel: "विशेषज्ञ डॉक्टर चुनें *",
    signupBtn: "साइन अप पूरा करें",
    alreadyAccount: "पहले से खाता है? यहाँ लॉग इन करें",
    loginTitle: "मरीज लॉगिन (Patient Login)",
    loginIdLabel: "फोन नंबर / जीमेल / रजिस्ट्रेशन आईडी *",
    loginBtn: "सुरक्षित लॉगिन करें",
    newAccount: "नया खाता बनाना है? साइन अप करें",
    portalTitle: "मरीज पोर्टल",
    logout: "लॉगआउट",
    tabDetails: "पेशेंट डिटेल्स",
    tabAppointment: "अपॉइंटमेंट बुकिंग",
    tabReports: "रिपोर्ट्स & प्रिस्क्रिप्शन",
    assignedDoc: "असाइन डॉक्टर:",
    regId: "रजिस्ट्रेशन आईडी:",
    selectDateLabel: "अपॉइंटमेंट तारीख चुनें (कैलेंडर से):",
    timeSlotLabel: "समय स्लॉट (Time Slot):",
    bookBtn: "कन्फर्म अपॉइंटमेंट एवं व्हाट्सएप भेजें",
    reportsHeader: "मरीज का मेडिकल इतिहास एवं दवाएं",
    medsGiven: "💊 सुझाई गई दवाएं:",
    problemNote: "📝 क्या दिक्कत हुई थी:",
    addReportHeader: "+ नई मेडिकल रिपोर्ट व फाइलें अपलोड करें",
    saveReportBtn: "सुरक्षित डेटाबेस में अपलोड करें",
    
    // New additions for Dashboard & Menus
    adminDashboardTitle: "👨‍⚕️ एडमिन मरीज एवं फाइल्स कंट्रोल",
    adminDashboardSub: "सभी मरीजों की लिस्ट, उनके फोटो, रिपोर्ट्स देखें व रिप्लाई दें",
    openPatientListBtn: "📂 मरीज लिस्ट खोलें",
    teleConsultTitle: "डिजिटल टेली-परामर्श (Tele-Consultation)",
    teleConsultSub: "विशेषज्ञ डॉक्टर से लाइव चैट व इन-ऐप वीडियो कॉल",
    liveChatBtn: "💬 लाइव चैट (Chat)",
    videoCallBtn: "📹 वीडियो कॉल (Video)",
    patientProfileTitle: "मरीज की संपूर्ण प्रोफाइल जानकारी",
    lblFullName: "पूरा नाम:",
    lblMobile: "मोबाइल नंबर:",
    lblEmail: "जीमेल आईडी:",
    lblAddress: "स्थायी पता (Address):",
    lblSymptoms: "मुख्य बीमारी / लक्षण:",
    lblDept: "विभाग:",
    lblAssignDoc: "असाइन डॉक्टर:",
    bookApptCalendarTitle: "कैलेंडर द्वारा अपॉइंटमेंट बुक करें",
    lblExtraNote: "अतिरिक्त लक्षण / नोट:",
    lblActiveAppt: "सक्रिय अपॉइंटमेंट्स:",
    noApptFound: "कोई सक्रिय अपॉइंटमेंट नहीं है।",
    tabAllRecords: "📋 सभी रिकॉर्ड्स",
    tabOncology: "🧪 ऑन्कोलॉजी",
    tabRadiation: "⚡ रेडिएशन",
    tabUploadReport: "📤 + अपलोड रिपोर्ट",
    searchPlaceholder: "🔍 रिपोर्ट, डॉक्टर या कैटेगरी खोजें...",
    filterAllDepts: "सभी विभाग",
    lblSelectDeptUpload: "विभाग चुनें (Department) *",
    lblReportCat: "रिपोर्ट कैटेगरी (Report Category) *",
    lblReportTitle: "रिपोर्ट का नाम / शीर्षक *",
    lblConsultDoc: "परामर्श डॉक्टर का नाम *",
    lblHospLab: "अस्पताल / लैब का नाम *",
    lblClinicalDiag: "क्लिनिकल डायग्नोसिस (Diagnosis) *",
    lblPrescribedMeds: "सुझाई गई दवाएं (Prescribed Medicines) *",
    lblClinicalNotes: "उस समय क्या दिक्कत हुई थी? (Clinical Notes) *",
    lblTreatmentDetail: "उपचार विवरण (Treatment / Radiation Protocol):",
    lblUploaderRole: "अपलोडर का रोल (Role) *",
    lblAttachFile: "फाइल अटैच करें (JPG, PNG, PDF - Firebase Storage):",
    btnGallery: "🖼️ गैलरी",
    btnCamera: "📷 कैमरा",
    btnPdf: "📄 PDF चुनें",
    selectedFilesInfo: "चयनित फाइलें",
    btnRemove: "हटाएं ✕",
    noReportsCategory: "इस श्रेणी में कोई रिपोर्ट उपलब्ध नहीं है।",
    btnFirstReport: "+ पहली रिपोर्ट अपलोड करें",
    lblDate: "तारीख:",
    lblDoctor: "डॉक्टर:",
    lblMetaHospital: "🏥 अस्पताल/लैब:",
    lblMetaDiag: "🩺 डायग्नोसिस:",
    lblMetaMeds: "💊 दवाएं:",
    lblMetaNote: "📝 क्लिनिकल नोट:",
    lblMetaTreat: "⚡ उपचार/डोज:",
    lblMetaUploader: "👤 अपलोडर:",
    lblMetaVerifier: "✅ सत्यापित कर्ता:",
    lblAttachedFiles: "संलग्न फाइलें",
    btnAudit: "📜 ऑडिट व हिस्ट्री",
    publicFeaturesTitle: "मरीज सेवा पोर्टल की सुविधाएँ",
    feat1: "• 20 ऑन्कोलॉजी एवं 19 रेडिएशन ऑन्कोलॉजी श्रेणियों के अनुसार रिपोर्ट प्रबंधन",
    feat2: "• वास्तविक फाइल व फोटो अपलोड (JPG, PNG, PDF सपोर्ट व Firebase Storage)",
    feat3: "• 10-अंकों के मोबाइल एवं @gmail.com आधारित सुरक्षित साइन अप व लॉगिन",
    feat4: "• रियल-टाइम चैट एवं लाइव इन-ऐप वीडियो कंसल्टेशन सुविधा",
    historyTitle: "🏛️ केजीएमयू ऑन्कोलॉजी विभाग का गौरवशाली इतिहास",
    historyPara: "किंग जॉर्ज चिकित्सा विश्वविद्यालय (KGMU), लखनऊ का रेडियोथेरेपी एवं क्लिनिकल ऑन्कोलॉजी विभाग 100 से अधिक वर्षों से उत्तर भारत का सबसे प्रमुख कैंसर उपचार केंद्र रहा है। यहाँ प्रतिदिन सैकड़ों मरीजों को आधुनिक, वैज्ञानिक और किफायती उपचार प्रदान किया जाता है।",
    infrastructureTitle: "विभागीय प्रमुख विशेषताएं एवं क्लिनिकल इंफ्रास्ट्रक्चर:",
    infra1: "1. अत्याधुनिक हाई-एनर्जी लीनियर एक्सेलरेटर (Dual Energy LINAC with IGRT & SRS/SBRT)",
    infra2: "2. 3D-CRT (Conformal Radiotherapy) एवं IMRT (Intensity Modulated Radiotherapy)",
    infra3: "3. हाई डोज रेट (HDR) ब्रेकीथेरेपी यूनिट सर्वाइकल व प्रोस्टेट कैंसर के लिए",
    infra4: "4. 50-बेड डे-केयर कीमोथेरेपी वार्ड एवं टारगेटेड मॉलिक्यूलर इन्फ्यूजन सेंटर",
    infra5: "5. मल्टी-डिसिप्लिनरी ट्यूमर बोर्ड क्लीनिक (सर्जिकल, मेडिकल और रेडिएशन का संयुक्त परामर्श)",
    infra6: "6. समर्पित पीडियाट्रिक कैंसर वार्ड एवं दर्द उपशामक देखभाल (Palliative Care Unit)",
    oncoFacultyTitle: "👨‍⚕️ मेडिकल ऑन्कोलॉजी फैकल्टी",
    radFacultyTitle: "⚡ रेडिएशन ऑन्कोलॉजी फैकल्टी",
    lblSpec: "विशेषज्ञता:",
    lblExp: "अनुभव:"
  },
  en: {
    hospitalName: "KGMU CANCER CARE",
    hospitalSub: "King George’s Medical University, Lucknow",
    deptBadge: "Department of Radiotherapy & Clinical Oncology",
    helplineText: "24x7 Cancer Helpline (Tap to Call):",
    menuHome: "Home",
    menuAbout: "About",
    menuContact: "Contact",
    menuSignup: "Sign Up",
    menuLogin: "Log In",
    heroTitle: "King George's Medical University",
    heroDesc: "Premier cancer institute offering cutting-edge LINAC radiation, 3D-CRT, day-care chemotherapy and clinical research in Northern India.",
    contactHeading: "📞 Emergency Contact & Support Center",
    contactAddress: "Hospital Address: Radiotherapy Wing, KGMU, Shah Mina Road, Chowk, Lucknow - 226003",
    opdTimings: "OPD Timings: Monday to Saturday (08:30 AM to 01:30 PM)",
    callNow: "Call Helpline Now",
    signupTitle: "Patient Registration (Sign Up)",
    nameLabel: "Patient Full Name *",
    phoneLabel: "10-Digit Mobile Number *",
    emailLabel: "Gmail ID (@gmail.com required) *",
    passLabel: "Create Password *",
    addressLabel: "Permanent Address *",
    problemLabel: "Chief Complaints / Problem Description *",
    deptLabel: "Select Department *",
    docLabel: "Select Specialist Doctor *",
    signupBtn: "Complete Sign Up",
    alreadyAccount: "Already have an account? Log In",
    loginTitle: "Patient Login",
    loginIdLabel: "Phone / Gmail / Registration ID *",
    loginBtn: "Secure Log In",
    newAccount: "Need a new account? Sign Up",
    portalTitle: "Patient Portal",
    logout: "Log Out",
    tabDetails: "Patient Details",
    tabAppointment: "Book Appointment",
    tabReports: "Reports & Prescriptions",
    assignedDoc: "Assigned Doctor:",
    regId: "Registration ID:",
    selectDateLabel: "Select Appointment Date (via Calendar):",
    timeSlotLabel: "Select Time Slot:",
    bookBtn: "Confirm Appointment & Send WhatsApp",
    reportsHeader: "Patient Medical History & Prescriptions",
    medsGiven: "💊 Prescribed Medicines:",
    problemNote: "📝 Problem Faced:",
    addReportHeader: "+ Upload Medical Report & Files",
    saveReportBtn: "Upload to Secure Database",
    
    // New additions for Dashboard & Menus
    adminDashboardTitle: "👨‍⚕️ Admin Patient & Files Control",
    adminDashboardSub: "View all patient lists, their photos, reports, and reply",
    openPatientListBtn: "📂 Open Patient List",
    teleConsultTitle: "Digital Tele-Consultation",
    teleConsultSub: "Live Chat & In-App Video Call with Specialists",
    liveChatBtn: "💬 Live Chat",
    videoCallBtn: "📹 Video Call",
    patientProfileTitle: "Complete Patient Profile Information",
    lblFullName: "Full Name:",
    lblMobile: "Mobile Number:",
    lblEmail: "Gmail ID:",
    lblAddress: "Permanent Address:",
    lblSymptoms: "Chief Complaint/Symptoms:",
    lblDept: "Department:",
    lblAssignDoc: "Assigned Doctor:",
    bookApptCalendarTitle: "Book Appointment via Calendar",
    lblExtraNote: "Additional Symptoms / Note:",
    lblActiveAppt: "Active Appointments:",
    noApptFound: "No active appointments found.",
    tabAllRecords: "📋 All Records",
    tabOncology: "🧪 Oncology",
    tabRadiation: "⚡ Radiation",
    tabUploadReport: "📤 + Upload Report",
    searchPlaceholder: "🔍 Search report, doctor or category...",
    filterAllDepts: "All Depts",
    lblSelectDeptUpload: "Select Department *",
    lblReportCat: "Report Category *",
    lblReportTitle: "Report Name / Title *",
    lblConsultDoc: "Consulting Doctor's Name *",
    lblHospLab: "Hospital / Lab Name *",
    lblClinicalDiag: "Clinical Diagnosis *",
    lblPrescribedMeds: "Prescribed Medicines *",
    lblClinicalNotes: "Clinical Notes (Problem faced) *",
    lblTreatmentDetail: "Treatment / Radiation Protocol:",
    lblUploaderRole: "Uploader's Role *",
    lblAttachFile: "Attach File (JPG, PNG, PDF - Firebase Storage):",
    btnGallery: "🖼️ Gallery",
    btnCamera: "📷 Camera",
    btnPdf: "📄 Choose PDF",
    selectedFilesInfo: "Selected Files",
    btnRemove: "Remove ✕",
    noReportsCategory: "No reports available in this category.",
    btnFirstReport: "+ Upload First Report",
    lblDate: "Date:",
    lblDoctor: "Doctor:",
    lblMetaHospital: "🏥 Hospital/Lab:",
    lblMetaDiag: "🩺 Diagnosis:",
    lblMetaMeds: "💊 Medicines:",
    lblMetaNote: "📝 Clinical Note:",
    lblMetaTreat: "⚡ Treatment/Dose:",
    lblMetaUploader: "👤 Uploader:",
    lblMetaVerifier: "✅ Verified By:",
    lblAttachedFiles: "Attached Files",
    btnAudit: "📜 Audit & History",
    publicFeaturesTitle: "Patient Service Portal Features",
    feat1: "• Report management across 20 Oncology & 19 Radiation categories",
    feat2: "• Native File & Photo Upload (JPG, PNG, PDF with Firebase Storage)",
    feat3: "• Secure Login/Signup using 10-digit mobile & @gmail.com",
    feat4: "• Real-time Chat & In-App Live Video Consultation Facility",
    historyTitle: "🏛️ Glorious History of KGMU Oncology Department",
    historyPara: "The Department of Radiotherapy & Clinical Oncology at King George's Medical University (KGMU), Lucknow has been Northern India's premier cancer treatment center for over 100 years, providing modern and affordable care to hundreds daily.",
    infrastructureTitle: "Key Departmental Features & Clinical Infrastructure:",
    infra1: "1. State-of-the-art High Energy Linear Accelerator (Dual Energy LINAC with IGRT & SRS/SBRT)",
    infra2: "2. 3D-CRT (Conformal Radiotherapy) & IMRT (Intensity Modulated Radiotherapy)",
    infra3: "3. High Dose Rate (HDR) Brachytherapy Unit for Cervical & Prostate Cancers",
    infra4: "4. 50-Bed Day-Care Chemotherapy Ward & Targeted Molecular Infusion Center",
    infra5: "5. Multi-Disciplinary Tumor Board Clinic (Joint Surgical, Medical & Radiation consults)",
    infra6: "6. Dedicated Pediatric Cancer Ward & Palliative Care Unit",
    oncoFacultyTitle: "👨‍⚕️ Medical Oncology Faculty",
    radFacultyTitle: "⚡ Radiation Oncology Faculty",
    lblSpec: "Specialization:",
    lblExp: "Experience:"
  }
};

export default function App() {
  const [isAdminInboxOpen, setIsAdminInboxOpen] = useState(false);
  const [lang, setLang] = useState("hi");
  const t = T[lang];

  // लाइव घड़ी
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateDisplay = (date) => {
    return date.toLocaleString(lang === "hi" ? "hi-IN" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // नेविगेशन स्टेट्स
  const [activeTab, setActiveTab] = useState("home"); // home, about, contact, signup, login
  const [loggedInPatient, setLoggedInPatient] = useState(null);
  const [patientMenu, setPatientMenu] = useState("details"); // details, appointment, reports

  // टेली-कंसल्टेशन (चैट एवं वीडियो) स्टेट
  const [isTeleModalOpen, setIsTeleModalOpen] = useState(false);

  // डायलर खोलना
  const handleDialHelpline = () => {
    Linking.openURL(`tel:${HELPLINE_NUMBER}`).catch(() => {
      Alert.alert("Helpline", `Direct dial: ${HELPLINE_NUMBER}`);
    });
  };

  // -------------------- साइन अप स्टेट्स --------------------
  const [signupForm, setSignupForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    problem: "",
    department: "",
    doctor: ""
  });
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // -------------------- लॉगिन स्टेट्स --------------------
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  // -------------------- अपॉइंटमेंट स्टेट्स --------------------
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-10-20");
  const [selectedSlot, setSelectedSlot] = useState("11:00 AM - 12:30 PM");
  const [apptNote, setApptNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // -------------------- रिपोर्ट्स & प्रिस्क्रिप्शन अपग्रेडेड स्टेट्स --------------------
  const [reportSubTab, setReportSubTab] = useState("history"); // history, oncology, radiation, upload
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");

  const [newReportDept, setNewReportDept] = useState("Medical Oncology");
  const [newReportCat, setNewReportCat] = useState("Biopsy / Histopathology");
  const [newReportTitle, setNewReportTitle] = useState("");
  const [newReportDoc, setNewReportDoc] = useState("");
  const [newReportLab, setNewReportLab] = useState("KGMU Oncology Center");
  const [newReportDiagnosis, setNewReportDiagnosis] = useState("");
  const [newReportMeds, setNewReportMeds] = useState("");
  const [newReportNotes, setNewReportNotes] = useState("");
  const [newReportTreatment, setNewReportTreatment] = useState("");
  const [newReportRole, setNewReportRole] = useState("Medical Staff");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);

  // -------------------- फाइल पिकर्स --------------------
  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        return Alert.alert("Permission", "Gallery access is required!");
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8
      });
      if (!result.canceled && result.assets) {
        const formatted = result.assets.map((a) => ({
          uri: a.uri,
          name: a.fileName || `IMG-${Date.now()}.jpg`,
          type: a.mimeType || "image/jpeg",
          size: a.fileSize ? (a.fileSize / (1024 * 1024)).toFixed(2) + " MB" : "1.2 MB"
        }));
        setSelectedFiles((prev) => [...prev, ...formatted]);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to select from gallery!");
    }
  };

  const takePhotoCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        return Alert.alert("Permission", "Camera access is required!");
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled && result.assets && result.assets[0]) {
        const a = result.assets[0];
        setSelectedFiles((prev) => [
          ...prev,
          {
            uri: a.uri,
            name: `CAM-${Date.now()}.jpg`,
            type: "image/jpeg",
            size: "1.5 MB"
          }
        ]);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to open camera!");
    }
  };

  const pickDocumentPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: true
      });
      if (!result.canceled && result.assets) {
        const formatted = result.assets.map((a) => ({
          uri: a.uri,
          name: a.name,
          type: a.mimeType || "application/pdf",
          size: (a.size / (1024 * 1024)).toFixed(2) + " MB"
        }));
        setSelectedFiles((prev) => [...prev, ...formatted]);
      }
    } catch (err) {
      Alert.alert("Error", "Document selection error!");
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ===================== API कॉल्स =====================

  // 1. साइन अप हैंडलर
  const handleSignup = async () => {
    const { name, phone, email, password, address, problem, department, doctor } = signupForm;

    if (!name.trim()) return Alert.alert("Error", "Enter patient's full name!");
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return Alert.alert("Error", "Enter a valid 10-digit mobile number!");
    }
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      return Alert.alert("Error", "Email must end with @gmail.com!");
    }
    if (password.length < 4) {
      return Alert.alert("Error", "Password must be at least 4 characters!");
    }
    if (!address.trim()) return Alert.alert("Error", "Enter permanent address!");
    if (!problem.trim()) return Alert.alert("Error", "Describe the chief complaint!");
    if (!department) return Alert.alert("Error", "Select a department!");
    if (!doctor) return Alert.alert("Error", "Select a doctor!");

    setSignupLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();
      setSignupLoading(false);

      if (data.success) {
        Alert.alert(
          "Registration Successful!",
          `Your KGMU Reg ID: ${data.patient.registrationId}\nYou can log in now.`,
          [{ text: "Log In", onPress: () => setActiveTab("login") }]
        );
        setLoginForm({ identifier: data.patient.registrationId, password: "" });
        setSignupForm({ name: "", phone: "", email: "", password: "", address: "", problem: "", department: "", doctor: "" });
      } else {
        Alert.alert("Registration Failed", data.message || "Error occurred!");
      }
    } catch (err) {
      setSignupLoading(false);
      Alert.alert("Connection Error", "Cannot reach backend server!");
    }
  };

  // 2. लॉग इन हैंडलर
  const handleLogin = async () => {
    if (!loginForm.identifier.trim() || !loginForm.password.trim()) {
      return Alert.alert("Error", "Please fill in all login details!");
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      setLoginLoading(false);

      if (data.success) {
        setLoggedInPatient(data.patient);
        setPatientMenu("details");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials!");
      }
    } catch (err) {
      setLoginLoading(false);
      Alert.alert("Connection Error", "Cannot reach backend server!");
    }
  };

  // 3. अपॉइंटमेंट बुकिंग + ऑटो व्हाट्सएप
  const handleBookAppointment = async () => {
    setBookingLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/book-appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: loggedInPatient.registrationId,
          doctor: loggedInPatient.doctor,
          department: loggedInPatient.department,
          date: selectedDate,
          timeSlot: selectedSlot,
          note: apptNote
        })
      });
      const data = await res.json();
      setBookingLoading(false);

      if (data.success) {
        setLoggedInPatient(data.patient);

        const whatsappMsg = `*KGMU CANCER CARE - Appointment Info*\n\n` +
          `• Patient: ${loggedInPatient.name} (${loggedInPatient.registrationId})\n` +
          `• Mobile: ${loggedInPatient.phone}\n` +
          `• Address: ${loggedInPatient.address}\n` +
          `• Problem: ${loggedInPatient.problem}\n` +
          `• Dept: ${loggedInPatient.department}\n` +
          `• Consultant: ${loggedInPatient.doctor}\n` +
          `• Date: ${selectedDate}\n` +
          `• Time: ${selectedSlot}\n` +
          `• Note: ${apptNote || "Regular Follow-up"}\n\n` +
          `_King George's Medical University, Lucknow_`;

        const whatsappUrl = `whatsapp://send?phone=91${HELPLINE_NUMBER}&text=${encodeURIComponent(whatsappMsg)}`;

        Alert.alert(
          "Appointment Confirmed!",
          `Saved. Tap to send WhatsApp to KGMU Helpline (${HELPLINE_NUMBER}):`,
          [
            { text: "Send WhatsApp", onPress: () => Linking.openURL(whatsappUrl).catch(() => Linking.openURL(`https://wa.me/91${HELPLINE_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`)) },
            { text: "OK", style: "cancel" }
          ]
        );
      } else {
        Alert.alert("Failed", data.message);
      }
    } catch (err) {
      setBookingLoading(false);
      Alert.alert("Error", "Cannot reach backend server!");
    }
  };

  // 4. वास्तविक रिपोर्ट व फाइल अपलोड हैंडलर
  const handleUploadSubmit = async () => {
    if (!newReportTitle.trim()) {
      return Alert.alert("Error", "Please fill in the Report Title!");
    }

    setUploadProgress(true);
    try {
      let firebaseUploadedList = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const uploaded = await uploadReportToFirebase(
              file.uri,
              loggedInPatient.registrationId,
              file.name,
              file.type
            );
            firebaseUploadedList.push({
              originalName: file.name,
              fileName: uploaded.fileName,
              size: file.size,
              mimeType: file.type,
              downloadUrl: uploaded.downloadUrl
            });
          } catch (e) {
            console.log("Firebase storage upload skipped/error: ", e.message);
          }
        }
      }

      const formData = new FormData();
      formData.append("registrationId", loggedInPatient.registrationId);
      formData.append("department", newReportDept);
      formData.append("category", newReportCat);
      formData.append("title", newReportTitle);
      formData.append("doctorName", newReportDoc || loggedInPatient.doctor);
      formData.append("hospitalName", newReportLab);
      formData.append("diagnosis", newReportDiagnosis || loggedInPatient.problem);
      formData.append("medicines", newReportMeds);
      formData.append("problemHistory", newReportNotes);
      formData.append("treatmentDetails", newReportTreatment);
      formData.append("uploadedByRole", newReportRole);

      if (firebaseUploadedList.length > 0) {
        formData.append("firebaseFiles", JSON.stringify(firebaseUploadedList));
      } else {
        selectedFiles.forEach((file) => {
          formData.append("files", {
            uri: Platform.OS === "android" ? file.uri : file.uri.replace("file://", ""),
            name: file.name,
            type: file.type
          });
        });
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/upload-report`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data"
        }
      });

      const data = await response.json();
      setUploadProgress(false);

      if (data.success) {
        Alert.alert("Success", "Medical report and files saved to Secure Database!");
        setLoggedInPatient(data.patient);
        setNewReportTitle("");
        setNewReportMeds("");
        setNewReportNotes("");
        setNewReportTreatment("");
        setSelectedFiles([]);
        setReportSubTab("history");
      } else {
        Alert.alert("Upload Failed", data.message || "An error occurred!");
      }
    } catch (error) {
      setUploadProgress(false);
      Alert.alert("Server Error", "Cannot reach backend server!");
    }
  };

  // 5. रिपोर्ट सत्यापन
  const handleVerifyReport = async (reportId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: loggedInPatient.registrationId,
          reportId,
          userRole: newReportRole,
          verifiedByName: "Dr. KGMU Consultant"
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Verified", "Report successfully verified!");
        setLoggedInPatient(data.patient);
      } else {
        Alert.alert("Permission Denied", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Cannot reach backend server!");
    }
  };

  // 6. रिपोर्ट आर्काइव
  const handleArchiveReport = async (reportId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/archive-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: loggedInPatient.registrationId,
          reportId,
          userRole: newReportRole
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Archived", "Report safely archived!");
        setLoggedInPatient(data.patient);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Cannot reach backend server!");
    }
  };

  // फ़िल्टर की गई रिपोर्ट्स
  const getFilteredReports = () => {
    if (!loggedInPatient || !loggedInPatient.reports) return [];
    return loggedInPatient.reports.filter((r) => {
      const matchesSearch =
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.doctorName && r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesDept = true;
      if (reportSubTab === "oncology") matchesDept = r.department === "Medical Oncology";
      else if (reportSubTab === "radiation") matchesDept = r.department === "Radiation Oncology";
      else if (selectedDeptFilter !== "All") matchesDept = r.department === selectedDeptFilter;

      const matchesCat = selectedCategoryFilter === "All" || r.category === selectedCategoryFilter;
      return matchesSearch && matchesDept && matchesCat;
    });
  };

  // =========================================================================
  // 1. यदि मरीज लॉगिन हो चुका है (DASHBOARD PORTAL VIEW)
  // =========================================================================
  if (loggedInPatient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#8B0000" />

        {/* शीर्ष मरीज पोर्टल हेडर */}
        <View style={styles.portalHeader}>
          <Image source={{ uri: KGMU_LOGO }} style={styles.portalLogo} resizeMode="contain" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.portalTitle}>KGMU CANCER CARE</Text>
            <Text style={styles.portalSubtitle}>{loggedInPatient.name} | {loggedInPatient.registrationId}</Text>
          </View>
          <TouchableOpacity style={styles.langToggleBtn} onPress={() => setLang(lang === "hi" ? "en" : "hi")}>
            <Text style={styles.langToggleText}>{lang === "hi" ? "EN" : "HI"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              setLoggedInPatient(null);
              setActiveTab("home");
            }}
          >
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>

        {/* लाइव घड़ी पट्टी */}
        <View style={styles.liveClockBar}>
          <Text style={styles.liveClockText}>🕒 {formatDateDisplay(currentDateTime)}</Text>
        </View>

        {/* डॉक्टर व विभाग बैनर */}
        <View style={styles.doctorBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.docBadge}>{loggedInPatient.department}</Text>
            <Text style={styles.docHeading}>{t.assignedDoc} {loggedInPatient.doctor}</Text>
          </View>
          <TouchableOpacity style={styles.callBadgeBtn} onPress={handleDialHelpline}>
            <Text style={styles.callBadgeText}>📞 {HELPLINE_NUMBER}</Text>
          </TouchableOpacity>
        </View>

        {/* 3 इन-पोर्टल मेनू टैब्स */}
        <View style={styles.tabBar}>
          {[
            { id: "details", label: t.tabDetails },
            { id: "appointment", label: t.tabAppointment },
            { id: "reports", label: t.tabReports }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, patientMenu === tab.id && styles.activeTabItem]}
              onPress={() => setPatientMenu(tab.id)}
            >
              <Text style={[styles.tabText, patientMenu === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* पोर्टल बॉडी */}
        <ScrollView contentContainerStyle={styles.bodyScroll}>
          
          {/* ================= ADMIN DASHBOARD CARD ================= */}
          {loggedInPatient?.role === "Super Admin" && (
            <View style={[styles.card, { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#16a34a', marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeader, { color: '#16a34a', marginBottom: 2 }]}>{t.adminDashboardTitle}</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>{t.adminDashboardSub}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 8, marginTop: 0 }]}
                  onPress={() => setIsAdminInboxOpen(true)}
                >
                  <Text style={styles.actionBtnText}>{t.openPatientListBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <AdminInboxModal
            visible={isAdminInboxOpen}
            onClose={() => setIsAdminInboxOpen(false)}
            backendUrl={BACKEND_URL}
            adminUser={loggedInPatient}
          />
  

          {/* ================= TELE-CONSULTATION QUICK ACTION CARD ================= */}
          <View style={styles.teleConsultCard}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>🩺</Text>
              <View>
                <Text style={styles.teleConsultTitle}>{t.teleConsultTitle}</Text>
                <Text style={styles.teleConsultSub}>{t.teleConsultSub}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.teleBtn, { backgroundColor: "#8B0000", marginRight: 5 }]}
                onPress={() => setIsTeleModalOpen(true)}
              >
                <Text style={styles.teleBtnText}>{t.liveChatBtn}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.teleBtn, { backgroundColor: "#0284c7" }]}
                onPress={() => setIsTeleModalOpen(true)}
              >
                <Text style={styles.teleBtnText}>{t.videoCallBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TAB 1: पेशेंट डिटेल्स */}
          {patientMenu === "details" && (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>{t.patientProfileTitle}</Text>
              <View style={styles.infoRow}><Text style={styles.label}>{t.regId}</Text><Text style={styles.val}>{loggedInPatient.registrationId}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>{t.lblFullName}</Text><Text style={styles.val}>{loggedInPatient.name}</Text></View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>{t.lblMobile}</Text>
                <TouchableOpacity onPress={handleDialHelpline}>
                  <Text style={[styles.val, { color: "#8B0000", textDecorationLine: "underline" }]}>{loggedInPatient.phone}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}><Text style={styles.label}>{t.lblEmail}</Text><Text style={styles.val}>{loggedInPatient.email}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>{t.lblAddress}</Text><Text style={styles.val}>{loggedInPatient.address}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>{t.lblSymptoms}</Text><Text style={[styles.val, { color: "#b91c1c" }]}>{loggedInPatient.problem}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>{t.lblDept}</Text><Text style={styles.val}>{loggedInPatient.department}</Text></View>
              <View style={styles.infoRow}><Text style={styles.label}>{t.lblAssignDoc}</Text><Text style={[styles.val, { color: "#8B0000", fontWeight: "bold" }]}>{loggedInPatient.doctor}</Text></View>
            </View>
          )}

          {/* TAB 2: अपॉइंटमेंट बुकिंग */}
          {patientMenu === "appointment" && (
            <View style={styles.card}>
              <Text style={styles.cardHeader}>{t.bookApptCalendarTitle}</Text>
              <Text style={styles.subHint}>{t.lblDoctor} {loggedInPatient.doctor} ({loggedInPatient.department})</Text>

              <Text style={styles.inputLabel}>{t.selectDateLabel}</Text>
              <TouchableOpacity style={styles.calendarInputField} onPress={() => setIsCalendarOpen(true)}>
                <Text style={styles.calendarInputVal}>{selectedDate}</Text>
                <Text style={styles.calendarIconEmoji}>📅</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>{t.timeSlotLabel}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
                {["09:00 AM - 10:30 AM", "11:00 AM - 12:30 PM", "01:00 PM - 02:30 PM"].map((slot, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotBadge, selectedSlot === slot && styles.slotBadgeActive]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>{t.lblExtraNote}</Text>
              <TextInput style={styles.input} placeholder="..." value={apptNote} onChangeText={setApptNote} />

              <TouchableOpacity style={styles.actionBtn} onPress={handleBookAppointment} disabled={bookingLoading}>
                {bookingLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>{t.bookBtn}</Text>}
              </TouchableOpacity>

              <Text style={[styles.cardHeader, { marginTop: 18 }]}>{t.lblActiveAppt}</Text>
              {loggedInPatient.appointments && loggedInPatient.appointments.length > 0 ? (
                loggedInPatient.appointments.map((a, i) => (
                  <View key={i} style={styles.historyBox}>
                    <Text style={styles.historyDoc}>👨‍⚕️ {a.doctor} ({a.department})</Text>
                    <Text style={styles.historyDate}>Date: {a.date} | Slot: {a.timeSlot}</Text>
                    <Text style={styles.historyStatus}>Status: {a.status}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>{t.noApptFound}</Text>
              )}
            </View>
          )}

          {/* TAB 3: अपग्रेडेड रिपोर्ट्स & प्रिस्क्रिप्शन इंटरफेस */}
          {patientMenu === "reports" && (
            <View>
              {/* सब-नेविगेशन बार */}
              <View style={styles.reportSubNavWrapper}>
                {[
                  { id: "history", label: t.tabAllRecords },
                  { id: "oncology", label: t.tabOncology },
                  { id: "radiation", label: t.tabRadiation },
                  { id: "upload", label: t.tabUploadReport }
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.reportSubNavBtn, reportSubTab === s.id && styles.reportSubNavBtnActive]}
                    onPress={() => setReportSubTab(s.id)}
                  >
                    <Text style={[styles.reportSubNavText, reportSubTab === s.id && styles.reportSubNavTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* खोज और फ़िल्टर बार */}
              {reportSubTab !== "upload" && (
                <View style={styles.filterCard}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <View style={styles.filterRow}>
                    <TouchableOpacity
                      style={[styles.miniFilterBadge, selectedDeptFilter === "All" && styles.miniFilterActive]}
                      onPress={() => setSelectedDeptFilter("All")}
                    >
                      <Text style={[styles.miniFilterText, selectedDeptFilter === "All" && styles.miniFilterTextActive]}>{t.filterAllDepts}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.miniFilterBadge, selectedDeptFilter === "Medical Oncology" && styles.miniFilterActive]}
                      onPress={() => setSelectedDeptFilter("Medical Oncology")}
                    >
                      <Text style={[styles.miniFilterText, selectedDeptFilter === "Medical Oncology" && styles.miniFilterTextActive]}>Medical Onco</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.miniFilterBadge, selectedDeptFilter === "Radiation Oncology" && styles.miniFilterActive]}
                      onPress={() => setSelectedDeptFilter("Radiation Oncology")}
                    >
                      <Text style={[styles.miniFilterText, selectedDeptFilter === "Radiation Oncology" && styles.miniFilterTextActive]}>Radiation Onco</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 1. अपलोड फॉर्म */}
              {reportSubTab === "upload" && (
                <View style={styles.card}>
                  <Text style={styles.cardHeader}>{t.addReportHeader}</Text>
                  <Text style={styles.subHint}>{loggedInPatient.name} ({loggedInPatient.registrationId})</Text>

                  <Text style={styles.inputLabel}>{t.lblSelectDeptUpload}</Text>
                  <View style={{ flexDirection: "row", marginBottom: 8 }}>
                    {["Medical Oncology", "Radiation Oncology"].map((dept) => (
                      <TouchableOpacity
                        key={dept}
                        style={[styles.deptSelectBtn, newReportDept === dept && styles.deptSelectBtnActive]}
                        onPress={() => {
                          setNewReportDept(dept);
                          setNewReportCat(dept === "Medical Oncology" ? ONCOLOGY_CATEGORIES[0] : RADIATION_CATEGORIES[0]);
                        }}
                      >
                        <Text style={[styles.deptSelectText, newReportDept === dept && styles.deptSelectTextActive]}>{dept}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>{t.lblReportCat}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    {(newReportDept === "Medical Oncology" ? ONCOLOGY_CATEGORIES : RADIATION_CATEGORIES).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.catBadge, newReportCat === cat && styles.catBadgeActive]}
                        onPress={() => setNewReportCat(cat)}
                      >
                        <Text style={[styles.catBadgeText, newReportCat === cat && styles.catBadgeTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>{t.lblReportTitle}</Text>
                  <TextInput style={styles.input} placeholder="..." value={newReportTitle} onChangeText={setNewReportTitle} />

                  <Text style={styles.inputLabel}>{t.lblConsultDoc}</Text>
                  <TextInput style={styles.input} placeholder="..." value={newReportDoc} onChangeText={setNewReportDoc} />

                  <Text style={styles.inputLabel}>{t.lblHospLab}</Text>
                  <TextInput style={styles.input} value={newReportLab} onChangeText={setNewReportLab} />

                  <Text style={styles.inputLabel}>{t.lblClinicalDiag}</Text>
                  <TextInput style={styles.input} placeholder="..." value={newReportDiagnosis} onChangeText={setNewReportDiagnosis} />

                  <Text style={styles.inputLabel}>{t.lblPrescribedMeds}</Text>
                  <TextInput style={styles.input} placeholder="..." value={newReportMeds} onChangeText={setNewReportMeds} />

                  <Text style={styles.inputLabel}>{t.lblClinicalNotes}</Text>
                  <TextInput style={[styles.input, { height: 60 }]} multiline placeholder="..." value={newReportNotes} onChangeText={setNewReportNotes} />

                  <Text style={styles.inputLabel}>{t.lblTreatmentDetail}</Text>
                  <TextInput style={styles.input} placeholder="..." value={newReportTreatment} onChangeText={setNewReportTreatment} />

                  <Text style={styles.inputLabel}>{t.lblUploaderRole}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                    {USER_ROLES.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleBadge, newReportRole === r && styles.roleBadgeActive]}
                        onPress={() => setNewReportRole(r)}
                      >
                        <Text style={[styles.roleBadgeText, newReportRole === r && styles.roleBadgeTextActive]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>{t.lblAttachFile}</Text>
                  <View style={styles.uploadBtnRow}>
                    <TouchableOpacity style={styles.pickerBtn} onPress={pickFromGallery}>
                      <Text style={styles.pickerBtnText}>{t.btnGallery}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pickerBtn} onPress={takePhotoCamera}>
                      <Text style={styles.pickerBtnText}>{t.btnCamera}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pickerBtn} onPress={pickDocumentPDF}>
                      <Text style={styles.pickerBtnText}>{t.btnPdf}</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedFiles.length > 0 && (
                    <View style={styles.selectedFilesBox}>
                      <Text style={{ fontSize: 11, fontWeight: "bold", color: "#1e293b", marginBottom: 6 }}>
                        {t.selectedFilesInfo} ({selectedFiles.length}):
                      </Text>
                      {selectedFiles.map((file, idx) => (
                        <View key={idx} style={styles.fileItemRow}>
                          <Text style={styles.fileItemName} numberOfLines={1}>📎 {file.name} ({file.size})</Text>
                          <TouchableOpacity onPress={() => removeSelectedFile(idx)}>
                            <Text style={styles.removeFileText}>{t.btnRemove}</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity style={styles.actionBtn} onPress={handleUploadSubmit} disabled={uploadProgress}>
                    {uploadProgress ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>{t.saveReportBtn}</Text>}
                  </TouchableOpacity>
                </View>
              )}

              {/* 2. रिपोर्ट्स सूची */}
              {reportSubTab !== "upload" && (
                <View>
                  {getFilteredReports().length > 0 ? (
                    getFilteredReports().map((rep, idx) => (
                      <View key={idx} style={styles.reportDetailCard}>
                        <View style={styles.reportTopRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.repCategoryTag}>{rep.category}</Text>
                            <Text style={styles.repTitleText}>{rep.title}</Text>
                          </View>
                          <View style={[
                            styles.statusBadgeBox,
                            rep.verificationStatus === "Verified" ? styles.verifiedBg : rep.verificationStatus === "Archived" ? styles.archivedBg : styles.pendingBg
                          ]}>
                            <Text style={styles.statusBadgeText}>
                              {rep.verificationStatus === "Verified" ? "✓ Verified" : rep.verificationStatus === "Archived" ? "Archived" : "⏳ Pending"}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.repSubMeta}>
                          {t.lblDate} {rep.date} | {t.lblDept} {rep.department} | {t.lblDoctor} {rep.doctorName}
                        </Text>

                        <View style={styles.medicalDetailsBox}>
                          <Text style={styles.medDetailLine}><Text style={styles.medLabel}>{t.lblMetaHospital}</Text> {rep.hospitalName}</Text>
                          <Text style={styles.medDetailLine}><Text style={styles.medLabel}>{t.lblMetaDiag}</Text> {rep.diagnosis}</Text>
                          <Text style={styles.medDetailLine}><Text style={styles.medLabel}>{t.lblMetaMeds}</Text> {rep.medicines}</Text>
                          <Text style={styles.medDetailLine}><Text style={styles.medLabel}>{t.lblMetaNote}</Text> {rep.problemHistory}</Text>
                          {rep.treatmentDetails ? (
                            <Text style={styles.medDetailLine}><Text style={styles.medLabel}>{t.lblMetaTreat}</Text> {rep.treatmentDetails}</Text>
                          ) : null}
                          <Text style={styles.medDetailLine}><Text style={styles.medLabel}>{t.lblMetaUploader}</Text> {rep.uploadedBy}</Text>
                          {rep.verifiedBy && (
                            <Text style={styles.medDetailLine}><Text style={styles.medLabel}>{t.lblMetaVerifier}</Text> {rep.verifiedBy}</Text>
                          )}
                        </View>

                        {rep.files && rep.files.length > 0 && (
                          <View style={styles.attachedFilesSection}>
                            <Text style={styles.attachedFilesTitle}>{t.lblAttachedFiles} ({rep.files.length}):</Text>
                            {rep.files.map((f, fIdx) => (
                              <View key={fIdx} style={styles.attachedFilePill}>
                                <Text style={styles.attachedFileName} numberOfLines={1}>📄 {f.originalName} ({f.size})</Text>
                                <TouchableOpacity
                                  style={styles.viewFileBtn}
                                  onPress={() => {
                                    const fullUrl = f.downloadUrl && f.downloadUrl.startsWith("http")
                                      ? f.downloadUrl
                                      : `${BACKEND_URL}${f.downloadUrl}`;
                                    setPreviewFile({ ...f, url: fullUrl });
                                  }}
                                >
                                  <Text style={styles.viewFileBtnText}>View / Preview</Text>
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}

                        <View style={styles.repActionRow}>
                          <TouchableOpacity style={styles.repActionBtn} onPress={() => setSelectedReportDetails(rep)}>
                            <Text style={styles.repActionText}>{t.btnAudit}</Text>
                          </TouchableOpacity>

                          {rep.verificationStatus !== "Verified" && (
                            <TouchableOpacity style={[styles.repActionBtn, { backgroundColor: "#15803d" }]} onPress={() => handleVerifyReport(rep.id)}>
                              <Text style={[styles.repActionText, { color: "#fff" }]}>✓ Verify</Text>
                            </TouchableOpacity>
                          )}

                          {rep.verificationStatus !== "Archived" && (
                            <TouchableOpacity style={[styles.repActionBtn, { backgroundColor: "#475569" }]} onPress={() => handleArchiveReport(rep.id)}>
                              <Text style={[styles.repActionText, { color: "#fff" }]}>📁 Archive</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyText}>{t.noReportsCategory}</Text>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => setReportSubTab("upload")}>
                        <Text style={styles.actionBtnText}>{t.btnFirstReport}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* ===================== टेली-कंसल्टेशन मॉडल (Chat & Video) ===================== */}
        <TeleConsultationModal
          visible={isTeleModalOpen}
          onClose={() => setIsTeleModalOpen(false)}
          consultationId={loggedInPatient?.registrationId || "General"}
          user={loggedInPatient}
          role={loggedInPatient?.role || "Patient"}
        />

        {/* मॉडल 1: फाइल प्रीव्यू */}
        <Modal visible={!!previewFile} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.previewModalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>{previewFile ? previewFile.originalName : "Preview"}</Text>
                <TouchableOpacity onPress={() => setPreviewFile(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {previewFile && previewFile.mimeType && previewFile.mimeType.includes("image") ? (
                <Image source={{ uri: previewFile.url }} style={styles.previewLargeImg} resizeMode="contain" />
              ) : (
                <View style={styles.pdfNoticeBox}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>📄</Text>
                  <Text style={{ fontSize: 13, fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>PDF Document Preview</Text>
                  <Text style={{ fontSize: 11, color: "#64748b", marginVertical: 6, textAlign: "center" }}>This is a secure medical PDF file.</Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(previewFile.url)}>
                    <Text style={styles.actionBtnText}>Open in Browser</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setPreviewFile(null)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* मॉडल 2: ऑडिट लॉग व वर्जन हिस्ट्री */}
        <Modal visible={!!selectedReportDetails} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.auditModalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Audit Trail & Version History</Text>
                <TouchableOpacity onPress={() => setSelectedReportDetails(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedReportDetails && (
                <ScrollView style={{ maxHeight: 350 }}>
                  <Text style={styles.auditSubHeading}>Version History:</Text>
                  {selectedReportDetails.versionHistory && selectedReportDetails.versionHistory.map((v, i) => (
                    <View key={i} style={styles.historyLogItem}>
                      <Text style={styles.historyLogTitle}>Version {v.version} - {v.note}</Text>
                      <Text style={styles.historyLogTime}>{v.modifiedAt}</Text>
                    </View>
                  ))}

                  <Text style={[styles.auditSubHeading, { marginTop: 12 }]}>System Audit Log:</Text>
                  {selectedReportDetails.auditLog && selectedReportDetails.auditLog.map((a, i) => (
                    <View key={i} style={styles.historyLogItem}>
                      <Text style={styles.historyLogTitle}>Action: {a.action} by {a.by}</Text>
                      <Text style={styles.historyLogTime}>{a.timestamp}</Text>
                      {a.note && <Text style={{ fontSize: 10, color: "#475569" }}>{a.note}</Text>}
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedReportDetails(null)}>
                <Text style={styles.modalCloseBtnText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* मॉडल 3: कैलेंडर पिकर */}
        <Modal visible={isCalendarOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>October 2026</Text>
                <TouchableOpacity onPress={() => setIsCalendarOpen(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.calGridHeader}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <Text key={i} style={styles.calGridHeaderText}>{d}</Text>
                ))}
              </View>

              <View style={styles.calGridBody}>
                {[null, null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((d, i) => {
                  if (!d) return <View key={i} style={styles.calDayBoxEmpty} />;
                  const dateStr = `2026-10-${d < 10 ? "0" + d : d}`;
                  const isSelected = selectedDate === dateStr;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.calDayBox, isSelected && styles.calDayBoxActive]}
                      onPress={() => {
                        setSelectedDate(dateStr);
                        setIsCalendarOpen(false);
                      }}
                    >
                      <Text style={[styles.calDayNumber, isSelected && styles.calDayNumberActive]}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsCalendarOpen(false)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // 2. पब्लिक व्यू (लॉगिन से पहले - होम, अबाउट, कांटेक्ट, साइन अप, लॉग इन)
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#8B0000" />

      {/* शीर्ष KGMU ब्रांडिंग */}
      <View style={styles.publicHeader}>
        <Image source={{ uri: KGMU_LOGO }} style={styles.publicLogo} resizeMode="contain" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.hospitalMainName}>{t.hospitalName}</Text>
          <Text style={styles.hospitalSubName}>{t.hospitalSub}</Text>
        </View>

        <TouchableOpacity style={styles.langToggleBtn} onPress={() => setLang(lang === "hi" ? "en" : "hi")}>
          <Text style={styles.langToggleText}>{lang === "hi" ? "EN" : "HI"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dialIconBtn} onPress={handleDialHelpline}>
          <Text style={{ fontSize: 18 }}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* लाइव घड़ी पट्टी */}
      <View style={styles.liveClockBar}>
        <Text style={styles.liveClockText}>🕒 {formatDateDisplay(currentDateTime)}</Text>
      </View>

      {/* हेडर नेविगेशन: होम ➔ अबाउट ➔ कांटेक्ट ➔ साइन अप ➔ लॉग इन */}
      <View style={styles.navBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {[
            { id: "home", label: t.menuHome },
            { id: "about", label: t.menuAbout },
            { id: "contact", label: t.menuContact },
            { id: "signup", label: t.menuSignup },
            { id: "login", label: t.menuLogin }
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, activeTab === item.id && styles.activeNavItem]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text style={[styles.navText, activeTab === item.id && styles.activeNavText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.bodyScroll}>
        {/* (A) होम पेज */}
        {activeTab === "home" && (
          <View>
            <View style={styles.heroCard}>
              <Image source={{ uri: KGMU_CAMPUS_IMG }} style={styles.bannerImg} />
              <View style={{ padding: 12, alignItems: "center" }}>
                <Image source={{ uri: KGMU_LOGO }} style={styles.heroLogo} resizeMode="contain" />
                <Text style={styles.heroHeading}>{t.heroTitle}</Text>
                <Text style={styles.heroSubHeading}>{t.deptBadge}</Text>
                <Text style={styles.heroPara}>{t.heroDesc}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.helplineCard} onPress={handleDialHelpline}>
              <Text style={{ fontSize: 26 }}>📞</Text>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.helplineTitle}>{t.helplineText}</Text>
                <Text style={styles.helplineNumber}>{HELPLINE_NUMBER}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>{t.publicFeaturesTitle}</Text>
              <Image source={{ uri: KGMU_LINAC_IMG }} style={styles.featureImg} />
              <Text style={styles.bulletText}>{t.feat1}</Text>
              <Text style={styles.bulletText}>{t.feat2}</Text>
              <Text style={styles.bulletText}>{t.feat3}</Text>
              <Text style={styles.bulletText}>{t.feat4}</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTab("signup")}>
                <Text style={styles.actionBtnText}>{t.signupBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* (B) अबाउट पेज */}
        {activeTab === "about" && (
          <View>
            <View style={styles.card}>
              <Image source={{ uri: KGMU_CAMPUS_IMG }} style={styles.featureImg} />
              <Text style={styles.cardHeader}>{t.historyTitle}</Text>
              <Text style={styles.paragraphText}>
                {t.historyPara}
              </Text>

              <Text style={styles.subHeading}>{t.infrastructureTitle}</Text>
              <Text style={styles.bulletText}>{t.infra1}</Text>
              <Text style={styles.bulletText}>{t.infra2}</Text>
              <Text style={styles.bulletText}>{t.infra3}</Text>
              <Text style={styles.bulletText}>{t.infra4}</Text>
              <Text style={styles.bulletText}>{t.infra5}</Text>
              <Text style={styles.bulletText}>{t.infra6}</Text>
            </View>

            {/* ऑन्कोलॉजी विशेषज्ञ डॉक्टर्स सूची */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>{t.oncoFacultyTitle}</Text>
              {DOCTORS_DATA.Oncology.map((doc, idx) => (
                <View key={idx} style={styles.docRow}>
                  <Image source={{ uri: doc.img }} style={styles.docThumb} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.docNameText}>{lang === "hi" ? doc.nameHI : doc.nameEN}</Text>
                    <Text style={styles.docDesigText}>{lang === "hi" ? doc.desigHI : doc.desigEN}</Text>
                    <Text style={styles.docSpecText}>{t.lblSpec} {lang === "hi" ? doc.specHI : doc.specEN}</Text>
                    <Text style={styles.docExpText}>{t.lblExp} {lang === "hi" ? doc.expHI : doc.expEN} | OPD: {lang === "hi" ? doc.opdHI : doc.opdEN}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* रेडिएशन ऑन्कोलॉजी विशेषज्ञ डॉक्टर्स सूची */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>{t.radFacultyTitle}</Text>
              {DOCTORS_DATA.Radiation.map((doc, idx) => (
                <View key={idx} style={styles.docRow}>
                  <Image source={{ uri: doc.img }} style={styles.docThumb} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.docNameText}>{lang === "hi" ? doc.nameHI : doc.nameEN}</Text>
                    <Text style={styles.docDesigText}>{lang === "hi" ? doc.desigHI : doc.desigEN}</Text>
                    <Text style={styles.docSpecText}>{t.lblSpec} {lang === "hi" ? doc.specHI : doc.specEN}</Text>
                    <Text style={styles.docExpText}>{t.lblExp} {lang === "hi" ? doc.expHI : doc.expEN} | OPD: {lang === "hi" ? doc.opdHI : doc.opdEN}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* (C) कांटेक्ट पेज */}
        {activeTab === "contact" && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>{t.contactHeading}</Text>

            <TouchableOpacity style={styles.contactItemBox} onPress={handleDialHelpline}>
              <Text style={styles.contactLabel}>{t.helplineText}</Text>
              <Text style={styles.contactValHighlighted}>📞 {HELPLINE_NUMBER}</Text>
            </TouchableOpacity>

            <View style={styles.contactItemBox}>
              <Text style={styles.contactLabel}>{t.contactAddress}</Text>
            </View>

            <View style={styles.contactItemBox}>
              <Text style={styles.contactLabel}>{t.opdTimings}</Text>
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={handleDialHelpline}>
              <Text style={styles.actionBtnText}>{t.callNow}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* (D) साइन अप पेज */}
        {activeTab === "signup" && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>{t.signupTitle}</Text>

            <Text style={styles.inputLabel}>{t.nameLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={signupForm.name}
              onChangeText={(txt) => setSignupForm({ ...signupForm, name: txt })}
            />

            <Text style={styles.inputLabel}>{t.phoneLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 7237042741"
              keyboardType="numeric"
              maxLength={10}
              value={signupForm.phone}
              onChangeText={(txt) => setSignupForm({ ...signupForm, phone: txt })}
            />

            <Text style={styles.inputLabel}>{t.emailLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="patient@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={signupForm.email}
              onChangeText={(txt) => setSignupForm({ ...signupForm, email: txt })}
            />

            <Text style={styles.inputLabel}>{t.passLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="..."
              secureTextEntry
              value={signupForm.password}
              onChangeText={(txt) => setSignupForm({ ...signupForm, password: txt })}
            />

            <Text style={styles.inputLabel}>{t.addressLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="..."
              value={signupForm.address}
              onChangeText={(txt) => setSignupForm({ ...signupForm, address: txt })}
            />

            <Text style={styles.inputLabel}>{t.problemLabel}</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              multiline
              placeholder="..."
              value={signupForm.problem}
              onChangeText={(txt) => setSignupForm({ ...signupForm, problem: txt })}
            />

            <Text style={styles.inputLabel}>{t.deptLabel}</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setIsDeptDropdownOpen(!isDeptDropdownOpen);
                setIsDocDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownBtnText}>
                {signupForm.department ? signupForm.department : "--- Select (Oncology / Radiation) ---"}
              </Text>
              <Text>▼</Text>
            </TouchableOpacity>

            {isDeptDropdownOpen && (
              <View style={styles.dropdownList}>
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setSignupForm({ ...signupForm, department: "Oncology", doctor: "" });
                    setIsDeptDropdownOpen(false);
                  }}
                >
                  <Text style={styles.optionTitle}>1. Oncology (मेडिकल ऑन्कोलॉजी)</Text>
                  <Text style={styles.optionSub}>Chemotherapy, Tumors & Immunotherapy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    setSignupForm({ ...signupForm, department: "Radiation", doctor: "" });
                    setIsDeptDropdownOpen(false);
                  }}
                >
                  <Text style={styles.optionTitle}>2. Radiation (रेडिएशन ऑन्कोलॉजी)</Text>
                  <Text style={styles.optionSub}>LINAC, 3D-CRT, IMRT & Radiation</Text>
                </TouchableOpacity>
              </View>
            )}

            {signupForm.department ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.inputLabel}>{t.docLabel}</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                >
                  <Text style={styles.dropdownBtnText}>
                    {signupForm.doctor ? signupForm.doctor : "--- Select Doctor ---"}
                  </Text>
                  <Text>▼</Text>
                </TouchableOpacity>

                {isDocDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {DOCTORS_DATA[signupForm.department].map((doc) => (
                      <TouchableOpacity
                        key={doc.id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSignupForm({ ...signupForm, doctor: lang === "hi" ? doc.nameHI : doc.nameEN });
                          setIsDocDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.optionTitle}>{lang === "hi" ? doc.nameHI : doc.nameEN}</Text>
                        <Text style={styles.optionSub}>{lang === "hi" ? doc.desigHI : doc.desigEN}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : null}

            <TouchableOpacity style={styles.actionBtn} onPress={handleSignup} disabled={signupLoading}>
              {signupLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>{t.signupBtn}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 12, alignItems: "center" }} onPress={() => setActiveTab("login")}>
              <Text style={{ color: "#8B0000", fontWeight: "bold" }}>{t.alreadyAccount}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* (E) लॉग इन पेज */}
        {activeTab === "login" && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>{t.loginTitle}</Text>
            <Text style={styles.subHint}>Log in using 10-digit mobile, Gmail, or KGMU Reg ID.</Text>

            <Text style={styles.inputLabel}>{t.loginIdLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="7237042741 / user@gmail.com / KGMU-ONCO-..."
              autoCapitalize="none"
              value={loginForm.identifier}
              onChangeText={(txt) => setLoginForm({ ...loginForm, identifier: txt })}
            />

            <Text style={styles.inputLabel}>{t.passLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="..."
              secureTextEntry
              value={loginForm.password}
              onChangeText={(txt) => setLoginForm({ ...loginForm, password: txt })}
            />

            <TouchableOpacity style={styles.actionBtn} onPress={handleLogin} disabled={loginLoading}>
              {loginLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>{t.loginBtn}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 12, alignItems: "center" }} onPress={() => setActiveTab("signup")}>
              <Text style={{ color: "#8B0000", fontWeight: "bold" }}>{t.newAccount}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#8B0000", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  publicHeader: { flexDirection: "row", alignItems: "center", backgroundColor: "#8B0000", paddingHorizontal: 12, paddingVertical: 10 },
  publicLogo: { width: 44, height: 44, backgroundColor: "#fff", borderRadius: 22, padding: 2 },
  hospitalMainName: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 },
  hospitalSubName: { color: "#ffdede", fontSize: 10 },
  langToggleBtn: { backgroundColor: "rgba(255,255,255,0.25)", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 14, marginRight: 6 },
  langToggleText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  dialIconBtn: { padding: 6, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20 },
  liveClockBar: { backgroundColor: "#700000", paddingVertical: 4, paddingHorizontal: 12, alignItems: "center" },
  liveClockText: { color: "#ffdede", fontSize: 11, fontWeight: "600" },
  navBarWrapper: { backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  navScroll: { paddingHorizontal: 8, paddingVertical: 6, alignItems: "center" },
  navItem: { paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, borderRadius: 20, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  activeNavItem: { backgroundColor: "#8B0000", borderColor: "#8B0000" },
  navText: { fontSize: 12, fontWeight: "bold", color: "#8B0000" },
  activeNavText: { color: "#ffffff" },
  bodyScroll: { padding: 12, paddingBottom: 40, backgroundColor: "#f4f6f8", flexGrow: 1 },
  heroCard: { backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden", marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  bannerImg: { width: "100%", height: 130 },
  heroLogo: { width: 48, height: 48, marginBottom: 6 },
  heroHeading: { fontSize: 16, fontWeight: "bold", color: "#8B0000", textAlign: "center" },
  heroSubHeading: { fontSize: 11, color: "#475569", textAlign: "center", marginVertical: 4 },
  heroPara: { fontSize: 11, color: "#334155", textAlign: "center", lineHeight: 16 },
  helplineCard: { backgroundColor: "#8B0000", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  helplineTitle: { color: "#ffdede", fontSize: 11 },
  helplineNumber: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  card: { backgroundColor: "#ffffff", borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  featureImg: { width: "100%", height: 130, borderRadius: 8, marginVertical: 8 },
  cardHeader: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginBottom: 6 },
  subHeading: { fontSize: 12, fontWeight: "bold", color: "#8B0000", marginTop: 8, marginBottom: 4 },
  subHint: { fontSize: 11, color: "#64748b", marginBottom: 10 },
  paragraphText: { fontSize: 12, color: "#334155", lineHeight: 18, marginBottom: 6 },
  bulletText: { fontSize: 12, color: "#334155", marginVertical: 2 },
  inputLabel: { fontSize: 11, fontWeight: "bold", color: "#334155", marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: "#1e293b" },
  dropdownButton: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#8B0000", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownBtnText: { fontSize: 12, color: "#1e293b", fontWeight: "600" },
  dropdownList: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, marginTop: 4, padding: 4 },
  dropdownOption: { paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  optionTitle: { fontSize: 12, fontWeight: "bold", color: "#1e293b" },
  optionSub: { fontSize: 10, color: "#64748b", marginTop: 1 },
  actionBtn: { backgroundColor: "#8B0000", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 14 },
  actionBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "bold" },
  docRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  docThumb: { width: 50, height: 50, borderRadius: 25 },
  docNameText: { fontSize: 13, fontWeight: "bold", color: "#1e293b" },
  docDesigText: { fontSize: 11, color: "#8B0000", fontWeight: "600" },
  docSpecText: { fontSize: 10, color: "#475569", marginTop: 1 },
  docExpText: { fontSize: 10, color: "#64748b", marginTop: 1 },
  contactItemBox: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  contactLabel: { fontSize: 11, fontWeight: "bold", color: "#64748b" },
  contactVal: { fontSize: 12, color: "#1e293b", marginTop: 2 },
  contactValHighlighted: { fontSize: 14, fontWeight: "bold", color: "#8B0000", marginTop: 2 },

  // टेली-परामर्श कार्ड स्टाइल
  teleConsultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0284c7",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  teleConsultTitle: { fontSize: 13, fontWeight: "bold", color: "#0284c7" },
  teleConsultSub: { fontSize: 10, color: "#64748b" },
  teleBtn: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  teleBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "bold" },

  // पोर्टल स्टाइल्स
  portalHeader: { flexDirection: "row", alignItems: "center", backgroundColor: "#8B0000", paddingHorizontal: 12, paddingVertical: 10 },
  portalLogo: { width: 38, height: 38, backgroundColor: "#fff", borderRadius: 19, padding: 2 },
  portalTitle: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  portalSubtitle: { color: "#ffdede", fontSize: 10 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  logoutText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  doctorBanner: { backgroundColor: "#fef2f2", paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#fecaca" },
  docBadge: { fontSize: 10, color: "#991b1b", fontWeight: "bold" },
  docHeading: { fontSize: 12, fontWeight: "bold", color: "#1e293b" },
  callBadgeBtn: { backgroundColor: "#8B0000", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 14 },
  callBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  tabBar: { flexDirection: "row", backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: "center" },
  activeTabItem: { borderBottomWidth: 3, borderBottomColor: "#8B0000" },
  tabText: { fontSize: 11, color: "#64748b", fontWeight: "bold" },
  activeTabText: { color: "#8B0000" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  label: { fontSize: 11, color: "#64748b" },
  val: { fontSize: 12, color: "#1e293b", fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  calendarInputField: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginVertical: 4 },
  calendarInputVal: { fontSize: 13, color: "#1e293b", fontWeight: "600" },
  calendarIconEmoji: { fontSize: 18 },
  slotBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#f8fafc", marginRight: 6, marginBottom: 6 },
  slotBadgeActive: { backgroundColor: "#8B0000", borderColor: "#8B0000" },
  slotText: { fontSize: 11, color: "#334155" },
  slotTextActive: { color: "#ffffff", fontWeight: "bold" },
  historyBox: { backgroundColor: "#f8fafc", padding: 10, borderRadius: 8, marginTop: 6, borderLeftWidth: 3, borderLeftColor: "#8B0000" },
  historyDoc: { fontSize: 12, fontWeight: "bold", color: "#1e293b" },
  historyDate: { fontSize: 10, color: "#475569", marginTop: 2 },
  historyStatus: { fontSize: 10, color: "#16a34a", fontWeight: "bold", marginTop: 2 },
  emptyText: { fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginTop: 4 },

  // अपग्रेडेड रिपोर्ट्स कंपोनेंट स्टाइल्स
  reportSubNavWrapper: { flexDirection: "row", backgroundColor: "#ffffff", padding: 6, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  reportSubNavBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  reportSubNavBtnActive: { backgroundColor: "#8B0000" },
  reportSubNavText: { fontSize: 11, fontWeight: "bold", color: "#475569" },
  reportSubNavTextActive: { color: "#ffffff" },
  filterCard: { backgroundColor: "#ffffff", borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  searchInput: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: "#1e293b", marginBottom: 8 },
  filterRow: { flexDirection: "row", flexWrap: "wrap" },
  miniFilterBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: "#f1f5f9", marginRight: 6, marginBottom: 4 },
  miniFilterActive: { backgroundColor: "#8B0000" },
  miniFilterText: { fontSize: 10, color: "#475569", fontWeight: "600" },
  miniFilterTextActive: { color: "#ffffff" },
  deptSelectBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6, backgroundColor: "#f1f5f9", marginHorizontal: 3 },
  deptSelectBtnActive: { backgroundColor: "#8B0000" },
  deptSelectText: { fontSize: 11, fontWeight: "bold", color: "#475569" },
  deptSelectTextActive: { color: "#ffffff" },
  catBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14, backgroundColor: "#f1f5f9", marginRight: 6 },
  catBadgeActive: { backgroundColor: "#8B0000" },
  catBadgeText: { fontSize: 11, color: "#334155" },
  catBadgeTextActive: { color: "#ffffff", fontWeight: "bold" },
  roleBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: "#f1f5f9", marginRight: 6, marginBottom: 4 },
  roleBadgeActive: { backgroundColor: "#8B0000" },
  roleBadgeText: { fontSize: 10, color: "#334155" },
  roleBadgeTextActive: { color: "#ffffff", fontWeight: "bold" },
  uploadBtnRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  pickerBtn: { flex: 1, backgroundColor: "#f1f5f9", paddingVertical: 8, alignItems: "center", borderRadius: 6, marginHorizontal: 2, borderWidth: 1, borderColor: "#cbd5e1" },
  pickerBtnText: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  selectedFilesBox: { backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, marginVertical: 6, borderWidth: 1, borderColor: "#e2e8f0" },
  fileItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  fileItemName: { fontSize: 11, color: "#1e293b", flex: 1 },
  removeFileText: { fontSize: 10, color: "#ef4444", fontWeight: "bold", marginLeft: 6 },
  reportDetailCard: { backgroundColor: "#ffffff", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  reportTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  repCategoryTag: { fontSize: 10, fontWeight: "bold", color: "#8B0000", textTransform: "uppercase" },
  repTitleText: { fontSize: 14, fontWeight: "bold", color: "#1e293b", marginTop: 2 },
  statusBadgeBox: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  verifiedBg: { backgroundColor: "#dcfce7" },
  pendingBg: { backgroundColor: "#fef9c3" },
  archivedBg: { backgroundColor: "#e2e8f0" },
  statusBadgeText: { fontSize: 10, fontWeight: "bold", color: "#15803d" },
  repSubMeta: { fontSize: 10, color: "#64748b", marginBottom: 8 },
  medicalDetailsBox: { backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, marginVertical: 4 },
  medDetailLine: { fontSize: 11, color: "#334155", marginVertical: 2 },
  medLabel: { fontWeight: "bold", color: "#1e293b" },
  attachedFilesSection: { marginTop: 8 },
  attachedFilesTitle: { fontSize: 11, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  attachedFilePill: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f1f5f9", padding: 6, borderRadius: 6, marginBottom: 4 },
  attachedFileName: { fontSize: 11, color: "#1e293b", flex: 1 },
  viewFileBtn: { backgroundColor: "#8B0000", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  viewFileBtnText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  repActionRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  repActionBtn: { backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginLeft: 6 },
  repActionText: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  emptyCard: { backgroundColor: "#ffffff", padding: 20, borderRadius: 10, alignItems: "center", marginVertical: 10 },

  // मॉडल स्टाइल्स
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 14 },
  previewModalBox: { width: "100%", maxHeight: "85%", backgroundColor: "#ffffff", borderRadius: 12, padding: 14 },
  previewLargeImg: { width: "100%", height: 320, borderRadius: 8, marginVertical: 10 },
  pdfNoticeBox: { alignItems: "center", padding: 30 },
  auditModalBox: { width: "100%", backgroundColor: "#ffffff", borderRadius: 12, padding: 14 },
  auditSubHeading: { fontSize: 12, fontWeight: "bold", color: "#8B0000", marginBottom: 6 },
  historyLogItem: { backgroundColor: "#f8fafc", padding: 6, borderRadius: 4, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: "#8B0000" },
  historyLogTitle: { fontSize: 11, fontWeight: "bold", color: "#1e293b" },
  historyLogTime: { fontSize: 9, color: "#64748b" },
  modalContent: { width: "100%", backgroundColor: "#ffffff", borderRadius: 12, padding: 14 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 8, marginBottom: 8 },
  modalTitle: { fontSize: 14, fontWeight: "bold", color: "#8B0000" },
  modalCloseText: { fontSize: 18, color: "#64748b", paddingHorizontal: 6 },
  calGridHeader: { flexDirection: "row", justifyContent: "space-around", marginBottom: 6 },
  calGridHeaderText: { width: "14%", textAlign: "center", fontSize: 11, fontWeight: "bold", color: "#64748b" },
  calGridBody: { flexDirection: "row", flexWrap: "wrap" },
  calDayBox: { width: "14%", height: 36, justifyContent: "center", alignItems: "center", marginVertical: 2, borderRadius: 6 },
  calDayBoxActive: { backgroundColor: "#8B0000" },
  calDayBoxEmpty: { width: "14%", height: 36 },
  calDayNumber: { fontSize: 12, color: "#1e293b", fontWeight: "600" },
  calDayNumberActive: { color: "#ffffff", fontWeight: "bold" },
  modalCloseBtn: { backgroundColor: "#f1f5f9", paddingVertical: 10, borderRadius: 8, alignItems: "center", marginTop: 12 },
  modalCloseBtnText: { fontSize: 12, fontWeight: "bold", color: "#475569" }
});