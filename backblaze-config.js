// Use proxy server for Backblaze B2 operations
const PROXY_SERVER_URL = 'http://localhost:3001';

// Upload file to Backblaze B2 via proxy server
export const uploadFile = async (file, key, contentType = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', 'temp');
    formData.append('folder', 'uploads');

    const response = await fetch(`${PROXY_SERVER_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        url: result.url,
        key: result.key
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error uploading file: ", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from Backblaze B2 via proxy server
export const deleteFile = async (key) => {
  try {
    const response = await fetch(`${PROXY_SERVER_URL}/api/delete/${key}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting file: ", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate presigned URL for uploads via proxy server
export const generatePresignedUrl = async (key, contentType) => {
  try {
    const response = await fetch(`${PROXY_SERVER_URL}/api/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: key,
        contentType: contentType
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return result.presignedUrl;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error generating presigned URL: ", error);
    throw error;
  }
};

// Get file URL
export const getFileUrl = (key) => {
  return `https://freedomlabs.s3.us-east-005.backblazeb2.com/${key}`;
};

// Upload project image with automatic naming
export const uploadProjectImage = async (file, projectId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('folder', 'projects');

    const response = await fetch(`${PROXY_SERVER_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        url: result.url,
        key: result.key
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error uploading project image: ", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload project files
export const uploadProjectFiles = async (files, projectId) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('projectId', projectId);
    formData.append('folder', 'projects');

    const response = await fetch(`${PROXY_SERVER_URL}/api/upload-multiple`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      return result.files;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error uploading project files: ", error);
    return [];
  }
};
