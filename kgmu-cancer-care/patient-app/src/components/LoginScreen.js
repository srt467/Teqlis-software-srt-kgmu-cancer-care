import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { loginSchema } from "../validations/authSchemas";

const showAlert = (title, message) => {
  if (Platform.OS === "web") window.alert(`${title}: ${message}`);
  else Alert.alert(title, message);
};

const LoginScreen = ({ onSwitchToRegister, backendUrl, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const handleLogin = async () => {
    setErrors({});
    try {
      await loginSchema.validate(formData, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const valErrors = {};
        err.inner.forEach((item) => { valErrors[item.path] = item.message; });
        setErrors(valErrors);
      }
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (onLoginSuccess) onLoginSuccess(data.patient);
      } else {
        showAlert("लॉगिन विफल", data.message || "अमान्य विवरण।");
      }
    } catch (netErr) {
      clearTimeout(timeoutId);
      setLoading(false);
      showAlert("कनेक्शन एरर", "बैकएंड सर्वर से संपर्क नहीं हो पाया।");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>KGMU Oncology Department</Text>
      <Text style={styles.subHeader}>मरीज लॉगिन (Login)</Text>

      <TextInput
        style={styles.input}
        placeholder="फोन नंबर / जीमेल / रजिस्ट्रेशन आईडी"
        placeholderTextColor="#888"
        autoCapitalize="none"
        value={formData.identifier}
        onChangeText={(val) => handleChange("identifier", val)}
      />
      {errors.identifier && <Text style={styles.errorText}>{errors.identifier}</Text>}

      <TextInput
        style={styles.input}
        placeholder="पासवर्ड दर्ज करें"
        placeholderTextColor="#888"
        secureTextEntry
        value={formData.password}
        onChangeText={(val) => handleChange("password", val)}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>लॉगिन करें (Log In)</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToRegister} style={styles.switchButton}>
        <Text style={styles.switchText}>खाता नहीं है? <Text style={styles.linkText}>रजिस्टर करें</Text></Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>हेल्पलाइन सपोर्ट: 7237042741</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25, justifyContent: "center", flexGrow: 1, backgroundColor: "#ffffff" },
  header: { fontSize: 20, fontWeight: "bold", textAlign: "center", color: "#8B0000" },
  subHeader: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#333", marginTop: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 15, color: "#000" },
  errorText: { color: "red", fontSize: 12, marginBottom: 8, marginLeft: 4 },
  button: { backgroundColor: "#8B0000", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchButton: { marginTop: 18, alignItems: "center" },
  switchText: { fontSize: 14, color: "#444" },
  linkText: { color: "#0056b3", fontWeight: "bold", textDecorationLine: "underline" },
  footer: { marginTop: 30, borderTopWidth: 1, borderColor: "#eee", paddingTop: 15, alignItems: "center" },
  footerText: { fontSize: 13, color: "#666", fontWeight: "600" }
});

export default LoginScreen;
