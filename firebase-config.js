// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Initialize Firebase Authentication and get a reference to the service
// Delay initialization slightly to ensure modules are fully loaded
let auth;
let db;

// Use requestAnimationFrame or setTimeout to ensure modules are ready
const initFirebaseServices = () => {
  try {
    if (!auth) {
      auth = getAuth(app);
    }
    if (!db) {
      db = getFirestore(app);
    }
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
    // Retry after a short delay
    setTimeout(() => {
      try {
        if (!auth) auth = getAuth(app);
        if (!db) db = getFirestore(app);
      } catch (retryError) {
        console.error('Firebase services initialization failed after retry:', retryError);
      }
    }, 200);
  }
};

// Try immediate initialization
try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase services not ready, initializing asynchronously...', error);
  // Initialize asynchronously
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(initFirebaseServices);
  } else {
    setTimeout(initFirebaseServices, 0);
  }
}

export { auth, db };

// Auth functions
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Google Sign In
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Register with email and password
export const register = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const addProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding project: ", error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  } catch (error) {
    console.error("Error getting projects: ", error);
    throw error;
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating project: ", error);
    throw error;
  }
};

export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    console.error("Error deleting project: ", error);
    throw error;
  }
};
