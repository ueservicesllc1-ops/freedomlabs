const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const PORT = process.env.PORT || 3000;

// Backblaze B2 configuration from environment variables
const B2_CONFIG = {
  endpoint: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
  region: process.env.B2_REGION || "us-east-005",
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID || "005c2b526be0baa000000001a",
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || "K005yuWEErdoyGTbvVWgCRkb6W4Pj6o"
  }
};

const BUCKET_NAME = process.env.B2_BUCKET_NAME || "freedomlabs";

// Initialize S3 client for Backblaze B2
const s3Client = new S3Client(B2_CONFIG);

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for Railway deployment
  credentials: true
}));

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit for .exe files
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// API Routes for B2 uploads
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backblaze B2 Proxy Server is running' });
});

// Upload single file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { projectId, folder = 'uploads' } = req.body;
    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const key = `${folder}/${projectId || 'temp'}/${fileName}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const publicUrl = `https://freedomlabs.s3.us-east-005.backblazeb2.com/${key}`;

    res.json({
      success: true,
      url: publicUrl,
      key: key,
      fileName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload multiple files
app.post('/api/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    console.log('Upload request received:', {
      filesCount: req.files ? req.files.length : 0,
      projectId: req.body.projectId,
      folder: req.body.folder,
      contentType: req.headers['content-type']
    });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files provided' 
      });
    }

    const { projectId, folder = 'uploads' } = req.body;
    const results = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Uploading file ${i + 1}/${req.files.length}:`, {
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });

      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${timestamp}-${i}-${Math.random().toString(36).substring(7)}${fileExtension}`;
      const key = `${folder}/${projectId || 'temp'}/${fileName}`;

      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
        ACL: 'public-read'
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const publicUrl = `https://freedomlabs.s3.us-east-005.backblazeb2.com/${key}`;

      results.push({
        success: true,
        url: publicUrl,
        key: key,
        fileName: file.originalname,
        size: file.size
      });

      console.log(`File ${i + 1} uploaded successfully:`, publicUrl);
    }

    console.log('All files uploaded successfully');
    res.json({
      success: true,
      files: results
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error uploading files'
    });
  }
});

// Delete file
app.delete('/api/delete/:key', async (req, res) => {
  try {
    const key = req.params.key;

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware for API routes
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'El archivo es demasiado grande. Límite: 200MB' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      error: `Error al subir archivo: ${err.message}` 
    });
  }
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Error interno del servidor' 
  });
});

// Serve static files from the root directory (only for non-API routes)
app.use((req, res, next) => {
  // Skip static files for API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  express.static('.')(req, res, next);
});

// Handle specific routes
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/contacto.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacto.html'));
});

app.get('/quienes-somos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'quienes-somos.html'));
});

app.get('/terminos-condiciones.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'terminos-condiciones.html'));
});

app.get('/politica-privacidad.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'politica-privacidad.html'));
});

app.get('/portfolio.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'portfolio.html'));
});

// Catch-all handler for SPA routing (only for non-API routes)
app.use((req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false, 
      error: 'API endpoint not found' 
    });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/`);
});