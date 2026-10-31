import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

export const uploadReportToFirebase = async (uri, patientId, fileName, mimeType, onProgress) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileRef = ref(storage, `medical_reports/${patientId}/${Date.now()}_${fileName}`);
  const uploadTask = uploadBytesResumable(fileRef, blob, { contentType: mimeType });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ downloadUrl, fileName });
      }
    );
  });
};
