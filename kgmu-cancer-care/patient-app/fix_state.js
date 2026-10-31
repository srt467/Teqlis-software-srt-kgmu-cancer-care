const fs = require('fs');
let code = fs.readFileSync('App.js', 'utf8');

// 1. अगर isAdminInboxOpen स्टेट नहीं है तो उसे lang स्टेट के ठीक नीचे जोड़ें
if (!code.includes('isAdminInboxOpen, setIsAdminInboxOpen')) {
  code = code.replace(
    /export default function App\(\) \{/,
    "export default function App() {\n  const [isAdminInboxOpen, setIsAdminInboxOpen] = useState(false);"
  );
}

// 2. सुनिश्चित करें कि AdminInboxModal इम्पोर्टेड है
if (!code.includes("import AdminInboxModal from './AdminInboxModal'")) {
  code = "import AdminInboxModal from './AdminInboxModal';\n" + code;
}

fs.writeFileSync('App.js', code, 'utf8');
console.log('App.js me isAdminInboxOpen state successfully add ho gaya!');
