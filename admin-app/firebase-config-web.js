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
    console.log('Admin signing in with email:', email);
    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log('Admin sign in successful:', result.user.uid);
    return result;
  } catch (error) {
    console.error('Sign In Error:', error);
    throw error;
  }
};


// Create new assistant user (no admin auth needed, just PIN)
const createAssistant = async (name, email, username, password, role) => {
  try {
    console.log('Creating new assistant:', { name, email, username, role });
    
    // Create user in Firebase Auth (this will sign in as the new user)
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;
    
    // Update user profile with name
    await userCredential.user.updateProfile({
      displayName: name
    });
    
    // Create assistant document in Firestore
    await db.collection("assistants").add({
      userId: userId,
      name: name,
      email: email,
      username: username,
      role: role, // 'designer', 'community_manager', 'digitizer'
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isOnline: false,
      totalHoursWorked: 0,
      lastSeen: null
    });
    
    console.log('Assistant created successfully:', userId);
    
    // Sign out the newly created user (admin doesn't need to be logged in)
    await auth.signOut();
    
    return { success: true, userId: userId };
  } catch (error) {
    console.error('Create Assistant Error:', error);
    // Sign out if there was an error and we're logged in as the new user
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
    }
    throw error;
  }
};

const logout = () => {
  return auth.signOut();
};

const onAuthChange = (callback) => {
  return auth.onAuthStateChanged(callback);
};

// Admin functions - Get all assistants
const getAllAssistants = async () => {
  const assistantsRef = db.collection("assistants");
  const querySnapshot = await assistantsRef.get();
  const assistants = [];
  querySnapshot.forEach((doc) => {
    assistants.push({ id: doc.id, ...doc.data() });
  });
  return assistants;
};

// Real-time listener for assistants
const watchAssistants = (callback) => {
  const assistantsRef = db.collection("assistants");
  return assistantsRef.onSnapshot((querySnapshot) => {
    const assistants = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document data:', { id: doc.id, data: data, isOnline: data.isOnline, isOnlineType: typeof data.isOnline });
      assistants.push({ id: doc.id, ...data });
    });
    console.log('Total assistants from Firestore:', assistants.length);
    callback(assistants);
  }, (error) => {
    console.error('Error in watchAssistants:', error);
  });
};

// Get work sessions for an assistant
const getWorkSessions = async (userId, startDate, endDate) => {
  let q = db.collection("workSessions").where("userId", "==", userId);
  
  if (startDate) {
    q = q.where("date", ">=", startDate);
  }
  if (endDate) {
    q = q.where("date", "<=", endDate);
  }
  
  q = q.orderBy("date", "desc");
  const querySnapshot = await q.get();
  const sessions = [];
  querySnapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  return sessions;
};

// Get all projects
const getAllProjects = async () => {
  const projectsRef = db.collection("projects");
  const querySnapshot = await projectsRef.get();
  const projects = [];
  querySnapshot.forEach((doc) => {
    projects.push({ id: doc.id, ...doc.data() });
  });
  return projects;
};

// Assign assistant to project
const assignAssistantToProject = async (projectId, userId) => {
  const projectRef = db.collection("projects").doc(projectId);
  // This is a simplified version - you'd need to get the project first and update the array
  await projectRef.update({
    assignedAssistants: firebase.firestore.FieldValue.serverTimestamp() // This would need proper array handling
  });
};

// Get project files
const getProjectFiles = async (projectId) => {
  const filesRef = db.collection("projectFiles");
  // Remove orderBy to avoid index requirement, we'll sort in memory
  const q = filesRef.where("projectId", "==", projectId);
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

// Get all files uploaded by an assistant
const getAssistantFiles = async (userId) => {
  const filesRef = db.collection("projectFiles");
  const q = filesRef.where("userId", "==", userId).orderBy("uploadedAt", "desc");
  const querySnapshot = await q.get();
  const files = [];
  querySnapshot.forEach((doc) => {
    files.push({ id: doc.id, ...doc.data() });
  });
  return files;
};

// Get projects assigned to an assistant
const getAssignedProjects = async (userId) => {
  const projectsRef = db.collection("projects");
  const querySnapshot = await projectsRef.get();
  const projects = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Check if userId is in assignedAssistants array
    if (data.assignedAssistants && Array.isArray(data.assignedAssistants) && data.assignedAssistants.includes(userId)) {
      projects.push({ id: doc.id, ...data });
    }
  });
  return projects;
};

// Create new project
const createProject = async (name, description, assignedAssistants, files = [], driveFolderUrl = '') => {
  try {
    const projectData = {
      name: name,
      description: description || '',
      assignedAssistants: assignedAssistants || [],
      status: 'active',
      driveFolderUrl: driveFolderUrl || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      files: files // Array of file objects with url, key, fileName, etc.
    };
    
    const docRef = await db.collection("projects").add(projectData);
    console.log('Project created with ID:', docRef.id);
    
    // Also save file metadata to projectFiles collection
    if (files.length > 0) {
      for (const file of files) {
        await db.collection("projectFiles").add({
          projectId: docRef.id,
          fileName: file.fileName,
          fileType: file.fileType || 'file',
          storagePath: file.key,
          downloadURL: file.url,
          size: file.size || 0,
          uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    return { success: true, projectId: docRef.id };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Upload files to Backblaze B2 via proxy server
const uploadFilesToB2 = async (files, projectId, folder = 'projects') => {
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
    formData.append('projectId', projectId || 'updates');
    formData.append('folder', folder);
    
    const response = await fetch(`${PROXY_SERVER_URL}/api/upload-multiple`, {
      method: 'POST',
      body: formData
    });
    
    // Check if response is OK and is JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
    
    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error('Non-JSON response:', errorText.substring(0, 200));
      throw new Error('El servidor devolvió una respuesta no válida. Verifica que el servidor esté funcionando correctamente.');
    }
    
    const result = await response.json();
    
    if (result.success && result.files) {
      return result.files;
    } else {
      throw new Error(result.error || 'Error uploading files');
    }
  } catch (error) {
    console.error('Error uploading files to B2:', error);
    throw error;
  }
};

// Update project assignments
const updateProjectAssignments = async (projectId, assignedAssistants) => {
  try {
    const projectRef = db.collection("projects").doc(projectId);
    await projectRef.update({
      assignedAssistants: assignedAssistants || [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Project assignments updated for project:', projectId);
    return { success: true };
  } catch (error) {
    console.error('Error updating project assignments:', error);
    throw error;
  }
};

// Update project drive folder URL
const updateProjectDriveFolder = async (projectId, driveFolderUrl) => {
  try {
    const projectRef = db.collection("projects").doc(projectId);
    await projectRef.update({
      driveFolderUrl: driveFolderUrl || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('Project drive folder updated for project:', projectId);
    return { success: true };
  } catch (error) {
    console.error('Error updating project drive folder:', error);
    throw error;
  }
};

// Delete project file from Firestore and B2
const deleteProjectFile = async (fileId, storagePath) => {
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
        throw new Error('No se puede conectar al servidor para eliminar el archivo.');
      }
    }
    
    if (!PROXY_SERVER_URL) {
      throw new Error('No se puede conectar al servidor.');
    }
    
    // Delete from B2 if storagePath is provided
    if (storagePath) {
      try {
        const response = await fetch(`${PROXY_SERVER_URL}/api/delete/${encodeURIComponent(storagePath)}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          console.warn('Warning: Could not delete file from B2:', response.statusText);
          // Continue to delete from Firestore even if B2 deletion fails
        } else {
          console.log('File deleted from B2:', storagePath);
        }
      } catch (b2Error) {
        console.warn('Warning: Error deleting from B2:', b2Error);
        // Continue to delete from Firestore even if B2 deletion fails
      }
    }
    
    // Delete from Firestore
    await db.collection("projectFiles").doc(fileId).delete();
    console.log('File deleted from Firestore:', fileId);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting project file:', error);
    throw error;
  }
};

// Update assistant document
const updateAssistant = async (docId, data) => {
  console.log('Updating assistant document:', { docId, data });
  await db.collection("assistants").doc(docId).update(data);
};

// Delete assistant document
const deleteAssistant = async (docId) => {
  console.log('Deleting assistant document:', { docId });
  await db.collection("assistants").doc(docId).delete();
};

// Create notification
const createNotification = async (title, message, type, targetUsers, downloadLink = null, version = null) => {
  try {
    const notificationData = {
      title: title,
      message: message,
      type: type, // 'update', 'general', 'announcement'
      targetUsers: Array.isArray(targetUsers) ? targetUsers : [targetUsers], // Array of userIds or 'all'
      downloadLink: downloadLink || null,
      version: version || null,
      isActive: true,
      readBy: [],
      readCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: 'admin'
    };
    
    const docRef = await db.collection("notifications").add(notificationData);
    console.log('Notification created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get all notifications
const getAllNotifications = async () => {
  try {
    const notificationsRef = db.collection("notifications");
    const querySnapshot = await notificationsRef.orderBy("createdAt", "desc").limit(100).get();
    
    const notifications = [];
    querySnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Deactivate notification
const deactivateNotification = async (notificationId) => {
  try {
    await db.collection("notifications").doc(notificationId).update({
      isActive: false
    });
    return true;
  } catch (error) {
    console.error('Error deactivating notification:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (notificationId) => {
  try {
    await db.collection("notifications").doc(notificationId).delete();
    console.log('Notification deleted:', notificationId);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Export all functions
window.firebaseConfig = {
  auth,
  db,
  storage,
  createAssistant,
  updateAssistant,
  deleteAssistant,
  getAllAssistants,
  watchAssistants,
  getWorkSessions,
  getAllProjects,
  assignAssistantToProject,
  getProjectFiles,
  getAssistantFiles,
  getAssignedProjects,
  createProject,
  uploadFilesToB2,
  updateProjectAssignments,
  updateProjectDriveFolder,
  deleteProjectFile,
  createNotification,
  getAllNotifications,
  deactivateNotification,
  deleteNotification
};

