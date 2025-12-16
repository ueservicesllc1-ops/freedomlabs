// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } = require("firebase/auth");
const { getFirestore, collection, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp } = require("firebase/firestore");

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

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions - Google Sign In only
const signInWithGoogle = async () => {
  console.log('signInWithGoogle called');
  
  try {
    console.log('Initializing Google Sign In popup...');
    console.log('Auth object:', auth);
    console.log('Google Provider:', googleProvider);
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google Sign In popup completed, user:', result.user);
    
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

// Admin functions - Get all assistants
const getAllAssistants = async () => {
  const assistantsRef = collection(db, "assistants");
  const querySnapshot = await getDocs(assistantsRef);
  const assistants = [];
  querySnapshot.forEach((doc) => {
    assistants.push({ id: doc.id, ...doc.data() });
  });
  return assistants;
};

// Real-time listener for assistants
const watchAssistants = (callback) => {
  const assistantsRef = collection(db, "assistants");
  return onSnapshot(assistantsRef, (querySnapshot) => {
    const assistants = [];
    querySnapshot.forEach((doc) => {
      assistants.push({ id: doc.id, ...doc.data() });
    });
    callback(assistants);
  });
};

// Get work sessions for an assistant
const getWorkSessions = async (userId, startDate, endDate) => {
  const sessionsRef = collection(db, "workSessions");
  let q = query(sessionsRef, where("userId", "==", userId));
  
  if (startDate) {
    q = query(q, where("date", ">=", startDate));
  }
  if (endDate) {
    q = query(q, where("date", "<=", endDate));
  }
  
  q = query(q, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  const sessions = [];
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  return sessions;
};

// Get all projects
const getAllProjects = async () => {
  const projectsRef = collection(db, "projects");
  const querySnapshot = await getDocs(projectsRef);
  const projects = [];
  querySnapshot.forEach((doc) => {
    projects.push({ id: doc.id, ...doc.data() });
  });
  return projects;
};

// Assign assistant to project
const assignAssistantToProject = async (projectId, userId) => {
  const projectRef = doc(db, "projects", projectId);
  const project = await getDocs(query(collection(db, "projects"), where("__name__", "==", projectId)));
  
  // This is a simplified version - you'd need to get the project first and update the array
  // For now, we'll use a direct update (assuming the field exists)
  await updateDoc(projectRef, {
    assignedAssistants: serverTimestamp() // This would need proper array handling
  });
};

// Get project files
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
  signInWithGoogle,
  logout,
  onAuthChange,
  getAllAssistants,
  watchAssistants,
  getWorkSessions,
  getAllProjects,
  assignAssistantToProject,
  getProjectFiles
};

