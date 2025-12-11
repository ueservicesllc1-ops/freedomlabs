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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { projectId, folder = 'uploads' } = req.body;
    const results = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${timestamp}-${i}-${Math.random().toString(36).substring(7)}${fileExtension}`;
      const key = `${folder}/${projectId || 'temp'}/${fileName}`;

      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
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
    }

    res.json({
      success: true,
      files: results
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
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

// Serve static files from the root directory
app.use(express.static('.'));

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

// Catch-all handler for SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/`);
});