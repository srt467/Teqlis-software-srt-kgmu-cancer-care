import * as Yup from "yup";

const indianPhoneRegex = /^[6-9][0-9]{9}$/;
const strictlyGmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "नाम कम से कम 3 अक्षरों का होना चाहिए")
    .required("नाम भरना अनिवार्य है"),
  phone: Yup.string()
    .matches(indianPhoneRegex, "10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)")
    .test("not-repeated", "अमान्य फोन नंबर: सभी 10 अंक समान नहीं हो सकते (उदा. 0000000000)", (value) => {
      if (!value) return false;
      return !/^(\d)\1{9}$/.test(value);
    })
    .required("फोन नंबर अनिवार्य है"),
  email: Yup.string()
    .matches(strictlyGmailRegex, "केवल मान्य @gmail.com आईडी ही स्वीकार्य है")
    .required("जीमेल आईडी अनिवार्य है"),
  registrationId: Yup.string()
    .min(4, "रजिस्ट्रेशन आईडी न्यूनतम 4 अक्षरों की होनी चाहिए")
    .required("केजीएमयू रजिस्ट्रेशन आईडी अनिवार्य है"),
  password: Yup.string()
    .min(6, "पासवर्ड न्यूनतम 6 वर्णों का होना चाहिए")
    .required("पासवर्ड दर्ज करें")
});

export const loginSchema = Yup.object().shape({
  identifier: Yup.string().required("यूजर / फोन नंबर / जीमेल आईडी दर्ज करें"),
  password: Yup.string().min(6, "पासवर्ड न्यूनतम 6 वर्णों का होना चाहिए").required("पासवर्ड दर्ज करें")
});
