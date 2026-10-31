import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";

const showAlert = (title, msg) => {
  if (Platform.OS === "web") window.alert(`${title}: ${msg}`);
  else Alert.alert(title, msg);
};

export default function Dashboard({ patient, backendUrl, onLogout }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Appointment Form state
  const [apptDate, setApptDate] = useState("");
  const [apptType, setApptType] = useState("Oncology OPD Follow-up");
  // New Report state
  const [reportTitle, setReportTitle] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/portal/summary/${patient.id}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      showAlert("कनेक्शन समस्या", "डेटा लोड करने में विफल।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookAppointment = async () => {
    if (!apptDate.trim()) {
      showAlert("त्रुटि", "कृपया दिनांक (YYYY-MM-DD) दर्ज करें।");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/portal/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, date: apptDate, time: "11:00 AM", type: apptType })
      });
      const resJson = await res.json();
      if (resJson.success) {
        showAlert("सफल", resJson.message);
        setApptDate("");
        fetchData();
      }
    } catch (err) {
      showAlert("एरर", "अपॉइंटमेंट सुरक्षित नहीं हो पाया।");
    }
  };

  const handleUploadReport = async () => {
    if (!reportTitle.trim()) {
      showAlert("त्रुटि", "रिपोर्ट का शीर्षक दर्ज करें।");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/portal/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, title: reportTitle, doctorRemarks: "अपलोड सफल - डॉक्टर समीक्षा करेंगे।" })
      });
      const resJson = await res.json();
      if (resJson.success) {
        showAlert("सफल", resJson.message);
        setReportTitle("");
        fetchData();
      }
    } catch (err) {
      showAlert("एरर", "रिपोर्ट अपलोड नहीं हो सकी।");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={{ marginTop: 10, color: "#555" }}>KGMU ऑन्कोलॉजी पोर्टल लोड हो रहा है...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Patient Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.deptTitle}>KGMU King George Medical University</Text>
        <Text style={styles.headerSub}>Department of Radiotherapy & Medical Oncology</Text>
        <View style={styles.divider} />
        <Text style={styles.patientName}>मरीज: {patient.name}</Text>
        <Text style={styles.patientInfo}>Reg ID: {patient.registrationId} | Mob: {patient.phone}</Text>
        <Text style={styles.helplineBadge}>हेल्पलाइन: 7237042741</Text>
      </View>

      {/* Feature Navigation Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: "summary", label: "डैशबोर्ड" },
          { key: "history", label: "मेडिकल हिस्ट्री" },
          { key: "prescriptions", label: "प्रिस्क्रिप्शन" },
          { key: "appointments", label: "अपॉइंटमेंट" },
          { key: "reports", label: "रिपोर्ट्स" }
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabButton, activeTab === t.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabButtonText, activeTab === t.key && styles.tabButtonTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section 1: Summary & Follow-ups */}
      {activeTab === "summary" && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>फॉलो-अप रिमाइंडर (Follow-up Reminders)</Text>
            {data?.followUps?.map((f, i) => (
              <View key={i} style={styles.alertBox}>
                <Text style={styles.boldRed}>अगली तारीख: {f.nextDate}</Text>
                <Text style={styles.itemText}>उद्देश्य: {f.purpose}</Text>
                <Text style={styles.subText}>सपोर्ट नंबर: {f.helpline}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>त्वरित सेवाएँ (Quick Actions)</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setActiveTab("appointments")}>
              <Text style={styles.btnText}>नया अपॉइंटमेंट बुक करें</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#0056b3", marginTop: 10 }]} onPress={() => setActiveTab("reports")}>
              <Text style={styles.btnText}>जाँच रिपोर्ट अपलोड करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Section 2: Medical History */}
      {activeTab === "history" && (
        <View style={styles.card}>
          <Text style={styles.cardHeader}>मरीज की मेडिकल हिस्ट्री (Medical History)</Text>
          {data?.medicalHistory?.map((m, i) => (
            <View key={i} style={styles.historyBox}>
              <Text style={styles.historyItem}><Text style={styles.bold}>डायग्नोसिस:</Text> {m.diagnosis}</Text>
              <Text style={styles.historyItem}><Text style={styles.bold}>कीमोथेरेपी चक्र:</Text> {m.chemotherapyCycles}</Text>
              <Text style={styles.historyItem}><Text style={styles.bold}>सर्जरी दिनांक:</Text> {m.surgeryDate}</Text>
              <Text style={styles.historyItem}><Text style={styles.bold}>ब्लड ग्रुप:</Text> {m.bloodGroup}</Text>
              <Text style={styles.historyItem}><Text style={styles.bold}>एलर्जी चेतावनी:</Text> {m.allergies}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Section 3: Prescriptions */}
      {activeTab === "prescriptions" && (
        <View style={styles.card}>
          <Text style={styles.cardHeader}>डॉक्टर प्रिस्क्रिप्शन (Doctor Prescriptions)</Text>
          {data?.prescriptions?.map((p, i) => (
            <View key={i} style={styles.prescriptionBox}>
              <Text style={styles.bold}>परामर्शदाता: {p.doctorName} (दिनांक: {p.date})</Text>
              <Text style={{ marginTop: 6, fontWeight: "600", color: "#8B0000" }}>दवाइयाँ:</Text>
              {p.medicines.map((med, mIndex) => (
                <Text key={mIndex} style={styles.bulletItem}>• {med}</Text>
              ))}
              <Text style={styles.instructions}><Text style={styles.bold}>निर्देश:</Text> {p.instructions}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Section 4: Appointments Booking */}
      {activeTab === "appointments" && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>नया अपॉइंटमेंट बुक करें</Text>
            <TextInput
              style={styles.input}
              placeholder="दिनांक (उदा. 2026-10-25)"
              placeholderTextColor="#888"
              value={apptDate}
              onChangeText={setApptDate}
            />
            <TextInput
              style={styles.input}
              placeholder="परामर्श का प्रकार (उदा. Chemo Review / OPD Consultation)"
              placeholderTextColor="#888"
              value={apptType}
              onChangeText={setApptType}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleBookAppointment}>
              <Text style={styles.btnText}>अपॉइंटमेंट सुरक्षित करें</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>अपॉइंटमेंट रिकॉर्ड</Text>
            {data?.appointments?.map((a, i) => (
              <View key={i} style={styles.apptItem}>
                <Text style={styles.bold}>{a.type} - {a.status}</Text>
                <Text style={styles.itemText}>{a.doctorName}</Text>
                <Text style={styles.subText}>दिनांक: {a.date} | समय: {a.time}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Section 5: Reports Upload & View */}
      {activeTab === "reports" && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>रिपोर्ट अपलोड करें (Basic Upload)</Text>
            <TextInput
              style={styles.input}
              placeholder="रिपोर्ट का नाम (उदा. CBC, MRI Brain, PET-CT)"
              placeholderTextColor="#888"
              value={reportTitle}
              onChangeText={setReportTitle}
            />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#0056b3" }]} onPress={handleUploadReport}>
              <Text style={styles.btnText}>अपलोड सेव करें</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>अपलोड की गई जाँच रिपोर्टें</Text>
            {data?.reports?.map((r, i) => (
              <View key={i} style={styles.reportItem}>
                <Text style={styles.bold}>{r.title}</Text>
                <Text style={styles.subText}>दिनांक: {r.date}</Text>
                <Text style={{ marginTop: 4, color: "#333" }}>रिमार्क: {r.doctorRemarks}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>सुरक्षित लॉग आउट</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f6f8" },
  container: { padding: 14, backgroundColor: "#f4f6f8", flexGrow: 1 },
  headerCard: { backgroundColor: "#8B0000", padding: 18, borderRadius: 12, marginBottom: 14, alignItems: "center" },
  deptTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" },
  headerSub: { color: "#ffebeb", fontSize: 13, marginTop: 3, textAlign: "center" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.25)", width: "100%", marginVertical: 10 },
  patientName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  patientInfo: { color: "#f0f0f0", fontSize: 13, marginTop: 2 },
  helplineBadge: { backgroundColor: "#ffffff", color: "#8B0000", fontWeight: "bold", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginTop: 8, fontSize: 12 },
  tabBar: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 12 },
  tabButton: { backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", marginBottom: 6, minWidth: "18%", alignItems: "center" },
  tabButtonActive: { backgroundColor: "#8B0000", borderColor: "#8B0000" },
  tabButtonText: { fontSize: 12, color: "#333", fontWeight: "600" },
  tabButtonTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 14, borderWidth: 1, borderColor: "#e5e7eb" },
  cardHeader: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginBottom: 12 },
  alertBox: { backgroundColor: "#fff5f5", borderLeftWidth: 4, borderLeftColor: "#8B0000", padding: 12, borderRadius: 6, marginBottom: 10 },
  boldRed: { color: "#8B0000", fontWeight: "bold", fontSize: 14 },
  historyBox: { backgroundColor: "#f9fafb", padding: 12, borderRadius: 8 },
  historyItem: { fontSize: 14, marginBottom: 6, color: "#374151" },
  prescriptionBox: { backgroundColor: "#f0fdf4", borderLeftWidth: 4, borderLeftColor: "#16a34a", padding: 12, borderRadius: 6, marginBottom: 10 },
  bulletItem: { fontSize: 13, color: "#1f2937", marginLeft: 8, marginVertical: 2 },
  instructions: { marginTop: 8, fontStyle: "italic", color: "#4b5563", fontSize: 13 },
  apptItem: { backgroundColor: "#f9fafb", padding: 10, borderRadius: 6, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#0284c7" },
  reportItem: { backgroundColor: "#f9fafb", padding: 10, borderRadius: 6, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#6366f1" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14, backgroundColor: "#fff" },
  primaryBtn: { backgroundColor: "#8B0000", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  logoutBtn: { backgroundColor: "#dc2626", padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 14 },
  logoutBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  itemText: { fontSize: 14, color: "#374151", marginTop: 2 },
  subText: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  bold: { fontWeight: "bold" }
});
