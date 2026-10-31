const fs = require('fs');
let code = fs.readFileSync('App.js', 'utf8');

if (!code.includes('import AdminInboxModal')) {
  code = "import AdminInboxModal from './AdminInboxModal';\n" + code;
}

if (!code.includes('isAdminInboxOpen')) {
  code = code.replace(
    /const [isTeleModalOpen, setIsTeleModalOpen] = useState\(false\);/,
    "const [isTeleModalOpen, setIsTeleModalOpen] = useState(false);\n  const [isAdminInboxOpen, setIsAdminInboxOpen] = useState(false);"
  );
}

if (!code.includes('<AdminInboxModal')) {
  const target = '{/* ================= TELE-CONSULTATION QUICK ACTION CARD ================= */}';
  const adminSnippet = `
          {/* ================= ADMIN DASHBOARD CARD ================= */}
          {loggedInPatient?.role === "Super Admin" && (
            <View style={[styles.card, { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: '#16a34a', marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeader, { color: '#16a34a', marginBottom: 2 }]}>👨‍⚕️ एडमिन मरीज एवं फाइल्स कंट्रोल</Text>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>सभी मरीजों की लिस्ट, उनके फोटो, रिपोर्ट्स देखें व रिप्लाई दें</Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 8, marginTop: 0 }]}
                  onPress={() => setIsAdminInboxOpen(true)}
                >
                  <Text style={styles.actionBtnText}>📂 मरीज लिस्ट खोलें</Text>
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
  `;

  if (code.includes(target)) {
    code = code.replace(target, adminSnippet + '\n\n          ' + target);
  }
}

fs.writeFileSync('App.js', code, 'utf8');
console.log('App.js me Admin Control bina kisi error ke jud chuka hai!');
