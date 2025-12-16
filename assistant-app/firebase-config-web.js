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
const updateAssistantStatus = async (userId, isOnline, locationData = null) => {
  try {
    console.log('Updating assistant status:', { userId, isOnline, hasLocation: !!locationData });
    if (locationData) {
      console.log('Location data to save:', locationData);
    }

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

      // Add location data if provided
      if (locationData) {
        updateData.location = locationData;
        updateData.lastLocation = locationData;
        console.log('Adding location to update:', locationData);
      }

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

          // Add location data if provided
          if (locationData) {
            updateData.location = locationData;
            updateData.lastLocation = locationData;
          }

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
  // Calculate hours worked with precision (includes minutes and seconds)
  const millisecondsWorked = endTime - startTime;
  const hoursWorked = millisecondsWorked / (1000 * 60 * 60); // Convert to hours (includes decimals for minutes)

  // Only record if at least 1 minute was worked (0.0167 hours)
  if (hoursWorked < 0.0167) {
    console.log('Session too short to record:', hoursWorked, 'hours');
    return;
  }

  console.log('Recording work session:', {
    userId,
    startTime: new Date(startTime).toLocaleString(),
    endTime: new Date(endTime).toLocaleString(),
    hoursWorked: hoursWorked.toFixed(4),
    minutes: Math.floor((millisecondsWorked / (1000 * 60)) % 60),
    seconds: Math.floor((millisecondsWorked / 1000) % 60)
  });

  // Update total hours
  const assistantsRef = db.collection("assistants");
  const q = assistantsRef.where("userId", "==", userId);
  const querySnapshot = await q.get();

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0];
    const currentData = docRef.data();
    const newTotalHours = (currentData.totalHoursWorked || 0) + hoursWorked;

    await docRef.ref.update({
      totalHoursWorked: parseFloat(newTotalHours.toFixed(4)) // Keep precision but limit decimals
    });

    console.log('Total hours updated:', {
      previous: currentData.totalHoursWorked || 0,
      added: hoursWorked.toFixed(4),
      newTotal: newTotalHours.toFixed(4)
    });
  } else {
    console.warn('No assistant document found for userId:', userId);
  }

  // Record session
  await db.collection("workSessions").add({
    userId: userId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    hoursWorked: parseFloat(hoursWorked.toFixed(4)), // Store with precision
    minutesWorked: Math.floor(millisecondsWorked / (1000 * 60)), // Also store minutes for reference
    date: new Date().toISOString().split('T')[0],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  console.log('Work session recorded in workSessions collection');
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

// Get notifications for current user
const getNotifications = async (userId) => {
  try {
    const notificationsRef = db.collection("notifications");

    // Get all active notifications (without orderBy to avoid index issues)
    const q = notificationsRef.where("isActive", "==", true).limit(50);

    const querySnapshot = await q.get();
    const notifications = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const targetUsers = data.targetUsers || [];

      // Check if notification is for this user (either 'all' or contains userId)
      if (targetUsers === 'all' || (Array.isArray(targetUsers) && targetUsers.includes(userId))) {
        notifications.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Sort by createdAt in memory (descending - newest first)
    notifications.sort((a, b) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return bTime - aTime;
    });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    // Return empty array instead of throwing to not block login
    return [];
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notificationRef = db.collection("notifications").doc(notificationId);
    const notification = await notificationRef.get();

    if (!notification.exists) {
      throw new Error('Notification not found');
    }

    const data = notification.data();
    const readBy = data.readBy || [];

    if (!readBy.includes(userId)) {
      readBy.push(userId);
      await notificationRef.update({
        readBy: readBy,
        readCount: readBy.length
      });
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Google Sign In function
const signInWithGoogle = async () => {
  try {
    console.log('signInWithGoogle called');
    const provider = new firebase.auth.GoogleAuthProvider();

    // Use redirect instead of popup for Electron compatibility
    console.log('Starting Google Sign In with redirect...');
    await auth.signInWithRedirect(provider);

    // The page will redirect, so this won't execute immediately
    // The auth state change listener will handle the result

  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

// Handle redirect result on page load
auth.getRedirectResult().then((result) => {
  if (result.user) {
    console.log('Google Sign In redirect successful:', result.user.uid);
  }
}).catch((error) => {
  console.error('Error getting redirect result:', error);
});


// Export all functions
window.firebaseConfig = {
  auth,
  db,
  storage,
  signIn,
  signInWithGoogle,
  logout,
  onAuthChange,
  updateAssistantStatus,
  recordWorkSession,
  getAssignedProjects,
  uploadFile,
  getProjectFiles,
  getAssistantFiles,
  uploadFilesToB2,
  getNotifications,
  markNotificationAsRead
};

