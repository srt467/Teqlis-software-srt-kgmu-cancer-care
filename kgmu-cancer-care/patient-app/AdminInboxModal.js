import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking
} from "react-native";
import TeleConsultationModal from "./TeleConsultationModal";

export default function AdminInboxModal({ visible, onClose, backendUrl, adminUser }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeChatPatient, setActiveChatPatient] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    if (visible) {
      loadPatients();
    }
  }, [visible]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/all-patients`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients.filter((p) => p.role !== "Super Admin" && p.phone !== "7237042741"));
      }
    } catch (e) {
      console.log("Error loading patients: ", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>👨‍⚕️ KGMU एडमिन कंट्रोल पोर्टल</Text>
            <Text style={styles.headerSubtitle}>पंजीकृत मरीज, मेडिकल फोटो/रिपोर्ट्स एवं चैट रिप्लाई</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ बंद करें</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#8B0000" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ flex: 1, padding: 12 }}>
            <Text style={styles.sectionTitle}>
              कुल पंजीकृत मरीज ({patients.length}) - फोटो और रिपोर्ट देखने के लिए टैप करें:
            </Text>

            <FlatList
              data={patients}
              keyExtractor={(item) => item.registrationId || item.phone}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.patientCard,
                    selectedPatient?.registrationId === item.registrationId && styles.patientCardActive
                  ]}
                  onPress={() => setSelectedPatient(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pName}>{item.name}</Text>
                    <Text style={styles.pMeta}>📞 फोन: {item.phone} | ID: {item.registrationId}</Text>
                    <Text style={styles.pProblem} numberOfLines={1}>🩺 बीमारी: {item.problem}</Text>
                    <Text style={styles.pDoc}>असाइन डॉक्टर: {item.doctor} ({item.department})</Text>
                  </View>
                  <View style={styles.badgeBox}>
                    <Text style={styles.badgeText}>
                      📂 {item.reports ? item.reports.length : 0} रिपोर्ट्स
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>अभी कोई मरीज पंजीकृत नहीं हुआ है।</Text>
              }
            />

            {selectedPatient && (
              <View style={styles.detailDrawer}>
                <View style={styles.drawerHeader}>
                  <Text style={styles.drawerTitle} numberOfLines={1}>
                    📋 {selectedPatient.name} की प्रोफाइल व फाइल्स
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      style={styles.chatActionBtn}
                      onPress={() => setActiveChatPatient(selectedPatient)}
                    >
                      <Text style={styles.chatActionText}>💬 लाइव चैट / रिप्लाई</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeMiniBtn}
                      onPress={() => setSelectedPatient(null)}
                    >
                      <Text style={styles.closeMiniText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ padding: 10 }}>
                  <Text style={styles.subInfoLine}>📍 स्थायी पता: {selectedPatient.address}</Text>
                  <Text style={styles.subInfoLine}>✉️ जीमेल: {selectedPatient.email}</Text>
                  <Text style={[styles.subInfoLine, { color: "#b91c1c", fontWeight: "bold" }]}>
                    🚨 मुख्य लक्षण: {selectedPatient.problem}
                  </Text>

                  <Text style={[styles.sectionTitle, { marginTop: 10, color: "#8B0000" }]}>
                    मरीज द्वारा अपलोड की गई रिपोर्ट्स व फोटो:
                  </Text>

                  {selectedPatient.reports && selectedPatient.reports.length > 0 ? (
                    selectedPatient.reports.map((rep, rIdx) => (
                      <View key={rIdx} style={styles.reportItemCard}>
                        <Text style={styles.repTitle}>{rep.title}</Text>
                        <Text style={styles.repMeta}>
                          {rep.date} | {rep.category} | स्थिति: {rep.verificationStatus || "Verified"}
                        </Text>
                        <Text style={styles.repNote}>दवाएं: {rep.medicines || "N/A"}</Text>

                        {rep.files && rep.files.length > 0 && (
                          <View style={{ marginTop: 6 }}>
                            <Text style={{ fontSize: 10, fontWeight: "bold", color: "#475569" }}>
                              संलग्न फाइलें ({rep.files.length}):
                            </Text>
                            {rep.files.map((file, fIdx) => {
                              const fileUrl = file.downloadUrl?.startsWith("http")
                                ? file.downloadUrl
                                : `${backendUrl}${file.downloadUrl}`;
                              const isImg = file.mimeType?.includes("image") || file.fileName?.match(/\.(jpg|jpeg|png)$/i);

                              return (
                                <View key={fIdx} style={styles.fileRow}>
                                  <Text style={styles.fileNameText} numberOfLines={1}>
                                    {isImg ? "🖼️" : "📄"} {file.originalName || file.fileName}
                                  </Text>
                                  <TouchableOpacity
                                    style={styles.viewBtn}
                                    onPress={() => {
                                      if (isImg) {
                                        setPreviewImg(fileUrl);
                                      } else {
                                        Linking.openURL(fileUrl);
                                      }
                                    }}
                                  >
                                    <Text style={styles.viewBtnText}>
                                      {isImg ? "फोटो देखें" : "PDF खोलें"}
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>इस मरीज ने अभी कोई रिपोर्ट अपलोड नहीं की है।</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <Modal visible={!!previewImg} transparent animationType="fade">
          <View style={styles.imgModalOverlay}>
            <View style={styles.imgBox}>
              <View style={styles.imgHeader}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>मरीज की अपलोड की गई फोटो</Text>
                <TouchableOpacity onPress={() => setPreviewImg(null)}>
                  <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
              {previewImg && (
                <Image source={{ uri: previewImg }} style={styles.fullImg} resizeMode="contain" />
              )}
            </View>
          </View>
        </Modal>

        {activeChatPatient && (
          <TeleConsultationModal
            visible={!!activeChatPatient}
            onClose={() => setActiveChatPatient(null)}
            consultationId={activeChatPatient.registrationId}
            user={adminUser}
            role="Doctor"
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    backgroundColor: "#8B0000",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitle: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  headerSubtitle: { color: "#fecaca", fontSize: 10 },
  closeBtn: { padding: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6 },
  closeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 8 },
  patientCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center"
  },
  patientCardActive: { borderColor: "#8B0000", backgroundColor: "#fef2f2" },
  pName: { fontSize: 13, fontWeight: "bold", color: "#1e293b" },
  pMeta: { fontSize: 10, color: "#64748b", marginTop: 2 },
  pProblem: { fontSize: 11, color: "#b91c1c", marginTop: 2 },
  pDoc: { fontSize: 10, color: "#0284c7", marginTop: 2 },
  badgeBox: { backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#475569" },
  emptyText: { textAlign: "center", color: "#94a3b8", fontSize: 11, marginVertical: 14 },
  detailDrawer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    overflow: "hidden",
    marginTop: 8,
    elevation: 4
  },
  drawerHeader: {
    backgroundColor: "#1e293b",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  drawerTitle: { color: "#fff", fontSize: 12, fontWeight: "bold", flex: 1 },
  chatActionBtn: { backgroundColor: "#0284c7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  chatActionText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  closeMiniBtn: { paddingHorizontal: 6, paddingVertical: 2 },
  closeMiniText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  subInfoLine: { fontSize: 11, color: "#475569", marginVertical: 1 },
  reportItemCard: {
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#8B0000"
  },
  repTitle: { fontSize: 11, fontWeight: "bold", color: "#0f172a" },
  repMeta: { fontSize: 9, color: "#0284c7", marginVertical: 1 },
  repNote: { fontSize: 10, color: "#334155" },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 4,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  fileNameText: { fontSize: 10, color: "#1e293b", flex: 1 },
  viewBtn: { backgroundColor: "#8B0000", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  viewBtnText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  imgModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 14 },
  imgBox: { width: "100%", maxHeight: "80%", backgroundColor: "#000", borderRadius: 10, overflow: "hidden" },
  imgHeader: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#1e293b" },
  fullImg: { width: "100%", height: 350 }
});
