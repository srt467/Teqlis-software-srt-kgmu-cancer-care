import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { registerSchema } from "../validations/authSchemas";

const showAlert = (title, message, onOk) => {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
  }
};

const RegisterScreen = ({ onSwitchToLogin, backendUrl }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    registrationId: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const handleRegister = async () => {
    setErrors({});
    try {
      await registerSchema.validate(formData, { abortEarly: false });
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
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        showAlert("सफल", data.message || "रजिस्ट्रेशन संपन्न हुआ!", onSwitchToLogin);
      } else {
        showAlert("रजिस्ट्रेशन विफल", data.message || "कृपया पुनः प्रयास करें।");
      }
    } catch (netErr) {
      clearTimeout(timeoutId);
      setLoading(false);
      showAlert("कनेक्शन एरर", "बैकएंड सर्वर (Port 5000) से संपर्क नहीं हो सका। सुनिश्चित करें बैकएंड चालू है।");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>KGMU Oncology Department</Text>
      <Text style={styles.subHeader}>मरीज रजिस्ट्रेशन (Sign In)</Text>

      <TextInput
        style={styles.input}
        placeholder="मरीज का पूरा नाम (Full Name)"
        placeholderTextColor="#888"
        value={formData.name}
        onChangeText={(val) => handleChange("name", val)}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        style={styles.input}
        placeholder="फोन नंबर (उदा. 7237042741)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={formData.phone}
        onChangeText={(val) => handleChange("phone", val)}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <TextInput
        style={styles.input}
        placeholder="जीमेल आईडी (Gmail Address)"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(val) => handleChange("email", val)}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="के.जी.एम.यू. रजिस्ट्रेशन आईडी (Registration ID)"
        placeholderTextColor="#888"
        autoCapitalize="none"
        value={formData.registrationId}
        onChangeText={(val) => handleChange("registrationId", val)}
      />
      {errors.registrationId && <Text style={styles.errorText}>{errors.registrationId}</Text>}

      <TextInput
        style={styles.input}
        placeholder="पासवर्ड दर्ज करें (Password)"
        placeholderTextColor="#888"
        secureTextEntry
        value={formData.password}
        onChangeText={(val) => handleChange("password", val)}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>रजिस्टर करें (Sign In)</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin} style={styles.switchButton}>
        <Text style={styles.switchText}>पहले से खाता है? <Text style={styles.linkText}>लॉगिन करें</Text></Text>
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

export default RegisterScreen;
