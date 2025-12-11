// Firebase configuration using web SDK (compat mode for Electron)
const firebaseConfig = {
  apiKey: "AIzaSyBHQd7vRBX-Tqau3s1ruLiSCt5OY0_hPds",
  authDomain: "freedomlabs-6a666.firebaseapp.com",
  projectId: "freedomlabs-6a666",
  storageBucket: "freedomlabs-6a666.firebasestorage.app",
  messagingSenderId: "71593879371",
  appId: "1:71593879371:web:5684e68b9a3f97d252aace"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Auth functions - Email/Password Sign In
const signIn = async (email, password) => {
  try {
    console.log('Signing in with email:', email);
    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log('Sign in successful:', result.user.uid);
    return result;
  } catch (error) {
    console.error('Sign In Error:', error);
    throw error;
  }
};

const logout = () => {
  return auth.signOut();
};

const onAuthChange = (callback) => {
  return auth.onAuthStateChanged(callback);
};

// Assistant functions
const updateAssistantStatus = async (userId, isOnline) => {
  try {
    console.log('Updating assistant status:', { userId, isOnline });
    const assistantsRef = db.collection("assistants");
    const q = assistantsRef.where("userId", "==", userId);
    const querySnapshot = await q.get();
    
    console.log('Query result:', querySnapshot.empty ? 'No documents found' : `${querySnapshot.size} document(s) found`);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0];
      const updateData = {
        isOnline: Boolean(isOnline), // Ensure it's a boolean
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
      };
      console.log('Updating document with:', updateData);
      await docRef.ref.update(updateData);
      console.log('Status updated successfully, document ID:', docRef.id);
    } else {
      console.warn('No assistant document found for userId:', userId);
      // Try to find by email as fallback
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        const emailQuery = assistantsRef.where("email", "==", currentUser.email);
        const emailSnapshot = await emailQuery.get();
        if (!emailSnapshot.empty) {
          const docRef = emailSnapshot.docs[0];
          const updateData = {
            userId: userId, // Update userId if missing
            isOnline: Boolean(isOnline), // Ensure it's a boolean
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          };
          console.log('Updating document with email fallback:', updateData);
          await docRef.ref.update(updateData);
          console.log('Status updated using email fallback, document ID:', docRef.id);
        }
      }
    }
  } catch (error) {
    console.error('Error updating assistant status:', error);
    throw error;
  }
};

const recordWorkSession = async (userId, startTime, endTime) => {
  const hoursWorked = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
  
  // Update total hours
  const assistantsRef = db.collection("assistants");
  const q = assistantsRef.where("userId", "==", userId);
  const querySnapshot = await q.get();
  
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0];
    const currentData = docRef.data();
    await docRef.ref.update({
      totalHoursWorked: (currentData.totalHoursWorked || 0) + hoursWorked
    });
  }
  
  // Record session
  await db.collection("workSessions").add({
    userId: userId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    hoursWorked: hoursWorked,
    date: new Date().toISOString().split('T')[0],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

// Project functions
const getAssignedProjects = async (userId) => {
  const projectsRef = db.collection("projects");
  const q = projectsRef.where("assignedAssistants", "array-contains", userId);
  const querySnapshot = await q.get();
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
  const storageRef = storage.ref(filePath);
  
  const uploadTask = storageRef.put(file);
  
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
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        
        // Save file metadata to Firestore
        await db.collection("projectFiles").add({
          projectId: projectId,
          userId: userId,
          fileName: file.name,
          fileType: fileType, // 'photo', 'video', 'audio'
          storagePath: filePath,
          downloadURL: downloadURL,
          size: file.size,
          uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        resolve(downloadURL);
      }
    );
  });
};

const getProjectFiles = async (projectId) => {
  const filesRef = db.collection("projectFiles");
  const q = filesRef.where("projectId", "==", projectId).orderBy("uploadedAt", "desc");
  const querySnapshot = await q.get();
  const files = [];
  querySnapshot.forEach((doc) => {
    files.push({ id: doc.id, ...doc.data() });
  });
  return files;
};

// Get files uploaded by assistant
const getAssistantFiles = async (userId) => {
  const filesRef = db.collection("projectFiles");
  // Remove orderBy to avoid index requirement, we'll sort in memory
  const q = filesRef.where("userId", "==", userId);
  const querySnapshot = await q.get();
  const files = [];
  querySnapshot.forEach((doc) => {
    files.push({ id: doc.id, ...doc.data() });
  });
  // Sort by uploadedAt in memory (descending)
  files.sort((a, b) => {
    const aTime = a.uploadedAt?.toDate ? a.uploadedAt.toDate().getTime() : 0;
    const bTime = b.uploadedAt?.toDate ? b.uploadedAt.toDate().getTime() : 0;
    return bTime - aTime; // Descending order
  });
  return files;
};

// Upload files to Backblaze B2 via proxy server
const uploadFilesToB2 = async (files, projectId, fileType = 'projects', userId = null, isCompleted = false) => {
  try {
    // Try Railway URL first, then fallback to localhost
    const RAILWAY_URL = 'https://freedomlabs-production.up.railway.app';
    const LOCAL_URL = 'http://localhost:3001';
    
    let PROXY_SERVER_URL = null;
    
    // Try Railway first
    try {
      const railwayController = new AbortController();
      const railwayTimeout = setTimeout(() => railwayController.abort(), 3000);
      const railwayHealth = await fetch(`${RAILWAY_URL}/health`, { 
        method: 'GET',
        signal: railwayController.signal
      });
      clearTimeout(railwayTimeout);
      if (railwayHealth.ok) {
        PROXY_SERVER_URL = RAILWAY_URL;
      }
    } catch (railwayError) {
      console.log('Railway server not available, trying localhost...');
    }
    
    // Fallback to localhost if Railway is not available
    if (!PROXY_SERVER_URL) {
      try {
        const localController = new AbortController();
        const localTimeout = setTimeout(() => localController.abort(), 2000);
        const localHealth = await fetch(`${LOCAL_URL}/health`, { 
          method: 'GET',
          signal: localController.signal
        });
        clearTimeout(localTimeout);
        if (localHealth.ok) {
          PROXY_SERVER_URL = LOCAL_URL;
        }
      } catch (localError) {
        throw new Error('No se puede conectar al servidor. Por favor, asegúrate de que el servidor esté desplegado en Railway o corriendo localmente en el puerto 3001.');
      }
    }
    
    if (!PROXY_SERVER_URL) {
      throw new Error('No se puede conectar al servidor. Por favor, asegúrate de que el servidor esté desplegado en Railway o corriendo localmente.');
    }
    
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('projectId', projectId);
    formData.append('folder', fileType);
    if (userId) {
      formData.append('userId', userId);
    }
    if (isCompleted) {
      formData.append('isCompleted', 'true');
    }
    
    const response = await fetch(`${PROXY_SERVER_URL}/api/upload-multiple`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.files) {
      return result.files;
    } else {
      throw new Error(result.error || 'Error uploading files');
    }
  } catch (error) {
    console.error('Error uploading files to B2:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error('No se puede conectar al servidor. El servidor debe estar desplegado en Railway o corriendo localmente. Verifica que el servidor esté disponible.');
    }
    throw error;
  }
};

// Export all functions
window.firebaseConfig = {
  auth,
  db,
  storage,
  signIn,
  logout,
  onAuthChange,
  updateAssistantStatus,
  recordWorkSession,
  getAssignedProjects,
  uploadFile,
  getProjectFiles,
  getAssistantFiles,
  uploadFilesToB2
};

