// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } = require("firebase/auth");
const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp } = require("firebase/firestore");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase/storage");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHQd7vRBX-Tqau3s1ruLiSCt5OY0_hPds",
  authDomain: "freedomlabs-6a666.firebaseapp.com",
  projectId: "freedomlabs-6a666",
  storageBucket: "freedomlabs-6a666.firebasestorage.app",
  messagingSenderId: "71593879371",
  appId: "1:71593879371:web:5684e68b9a3f97d252aace"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions - Google Sign In only
const signInWithGoogle = async (role = null) => {
  console.log('signInWithGoogle called with role:', role);

  try {
    console.log('Initializing Google Sign In popup...');
    console.log('Auth object:', auth);
    console.log('Google Provider:', googleProvider);

    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google Sign In popup completed, user:', result.user);

    const user = result.user;

    // Check if user already exists in assistants collection
    console.log('Checking if user exists in assistants collection...');
    const assistantsRef = collection(db, "assistants");
    const q = query(assistantsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    console.log('User exists in collection:', !querySnapshot.empty);

    // If new user and role provided, create assistant document
    if (querySnapshot.empty && role) {
      console.log('Creating new assistant document with role:', role);
      await addDoc(collection(db, "assistants"), {
        userId: user.uid,
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        role: role, // 'designer', 'community_manager', 'digitizer'
        createdAt: serverTimestamp(),
        isOnline: false,
        totalHoursWorked: 0
      });
      console.log('Assistant document created successfully');
    }

    return result;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

const logout = () => {
  return signOut(auth);
};

const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Assistant functions
const updateAssistantStatus = async (userId, isOnline, locationData = null) => {
  const assistantsRef = collection(db, "assistants");
  const q = query(assistantsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0];
    const updateData = {
      isOnline: isOnline,
      lastSeen: serverTimestamp()
    };

    // Add location data if provided
    if (locationData) {
      updateData.location = locationData;
      updateData.lastLocation = locationData; // Keep history of last known location
    }

    await updateDoc(doc(db, "assistants", docRef.id), updateData);
  }
};

const recordWorkSession = async (userId, startTime, endTime) => {
  const hoursWorked = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours

  // Update total hours
  const assistantsRef = collection(db, "assistants");
  const q = query(assistantsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0];
    const currentData = docRef.data();
    await updateDoc(doc(db, "assistants", docRef.id), {
      totalHoursWorked: (currentData.totalHoursWorked || 0) + hoursWorked
    });
  }

  // Record session
  await addDoc(collection(db, "workSessions"), {
    userId: userId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    hoursWorked: hoursWorked,
    date: new Date().toISOString().split('T')[0],
    createdAt: serverTimestamp()
  });
};

// Project functions
const getAssignedProjects = async (userId) => {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, where("assignedAssistants", "array-contains", userId));
  const querySnapshot = await getDocs(q);
  const projects = [];
  querySnapshot.forEach((doc) => {
    projects.push({ id: doc.id, ...doc.data() });
  });
  return projects;
};

// File upload functions
const uploadFile = async (file, projectId, fileType, userId) => {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const filePath = `projects/${projectId}/${fileType}/${fileName}`;
  const storageRef = ref(storage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload progress:', progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Save file metadata to Firestore
        await addDoc(collection(db, "projectFiles"), {
          projectId: projectId,
          userId: userId,
          fileName: file.name,
          fileType: fileType, // 'photo', 'video', 'audio'
          storagePath: filePath,
          downloadURL: downloadURL,
          size: file.size,
          uploadedAt: serverTimestamp()
        });

        resolve(downloadURL);
      }
    );
  });
};

const getProjectFiles = async (projectId) => {
  const filesRef = collection(db, "projectFiles");
  const q = query(filesRef, where("projectId", "==", projectId), orderBy("uploadedAt", "desc"));
  const querySnapshot = await getDocs(q);
  const files = [];
  querySnapshot.forEach((doc) => {
    files.push({ id: doc.id, ...doc.data() });
  });
  return files;
};

// Export all functions
module.exports = {
  auth,
  db,
  storage,
  signInWithGoogle,
  logout,
  onAuthChange,
  updateAssistantStatus,
  recordWorkSession,
  getAssignedProjects,
  uploadFile,
  getProjectFiles
};

