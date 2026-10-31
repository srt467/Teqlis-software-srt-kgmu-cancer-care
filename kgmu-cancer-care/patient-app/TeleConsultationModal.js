import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
  SafeAreaView
} from "react-native";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function TeleConsultationModal({ visible, onClose, consultationId, user, role }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  useEffect(() => {
    if (!visible || !consultationId) return;

    const q = query(
      collection(db, "consultations", consultationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(list);
    });

    return () => unsubscribe();
  }, [visible, consultationId]);

  const sendMessage = async () => {
    if (!inputMsg.trim()) return;
    await addDoc(collection(db, "consultations", consultationId, "messages"), {
      text: inputMsg.trim(),
      senderId: user?.registrationId || user?.phone,
      senderName: user?.name,
      role: role || "Patient",
      createdAt: serverTimestamp()
    });
    setInputMsg("");
  };

  const startVideoCall = () => {
    const cleanId = (consultationId || "General").replace(/[^a-zA-Z0-9]/g, "");
    const roomUrl = `https://meet.jit.si/KGMU_CancerCare_${cleanId}`;
    Linking.openURL(roomUrl);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>KGMU Tele-Consultation</Text>
            <Text style={styles.headerSubtitle}>ID: {consultationId}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "chat" && styles.tabBtnActive]}
            onPress={() => setActiveTab("chat")}
          >
            <Text style={[styles.tabBtnText, activeTab === "chat" && styles.tabBtnTextActive]}>
              💬 Live Chat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "video" && styles.tabBtnActive]}
            onPress={() => setActiveTab("video")}
          >
            <Text style={[styles.tabBtnText, activeTab === "video" && styles.tabBtnTextActive]}>
              📹 Video Call
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "chat" ? (
          <View style={{ flex: 1 }}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => {
                const isMe = item.senderId === (user?.registrationId || user?.phone);
                return (
                  <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={styles.senderText}>{item.senderName} ({item.role})</Text>
                    <Text style={isMe ? styles.myText : styles.theirText}>{item.text}</Text>
                  </View>
                );
              }}
            />
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Type medical query / message..."
                value={inputMsg}
                onChangeText={setInputMsg}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.videoBox}>
            <Text style={styles.videoTitle}>Live Doctor-Patient Video Consultation</Text>
            <Text style={styles.videoDesc}>
              Encrypted Tele-medicine Room ready for {user?.name}.
            </Text>
            <TouchableOpacity style={styles.joinCallBtn} onPress={startVideoCall}>
              <Text style={styles.joinCallText}>📹 Join Video Call Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#8B0000", padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  headerSubtitle: { color: "#fecaca", fontSize: 11 },
  closeBtn: { padding: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6 },
  closeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  tabRow: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#e2e8f0" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: "#8B0000" },
  tabBtnText: { fontSize: 12, fontWeight: "bold", color: "#64748b" },
  tabBtnTextActive: { color: "#8B0000" },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 8, marginVertical: 4 },
  myBubble: { alignSelf: "flex-end", backgroundColor: "#8B0000" },
  theirBubble: { alignSelf: "flex-start", backgroundColor: "#e2e8f0" },
  senderText: { fontSize: 9, color: "#cbd5e1", marginBottom: 2 },
  myText: { color: "#fff", fontSize: 13 },
  theirText: { color: "#1e293b", fontSize: 13 },
  inputBar: { flexDirection: "row", padding: 10, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#e2e8f0" },
  input: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 20, paddingHorizontal: 12, height: 40 },
  sendBtn: { backgroundColor: "#8B0000", justifyContent: "center", paddingHorizontal: 16, borderRadius: 20, marginLeft: 8 },
  sendBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  videoBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  videoTitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 8 },
  videoDesc: { fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 20 },
  joinCallBtn: { backgroundColor: "#0284c7", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  joinCallText: { color: "#fff", fontWeight: "bold", fontSize: 13 }
});
