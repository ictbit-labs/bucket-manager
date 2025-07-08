const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Initialize S3 client (uses IAM role by default)
const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'eu-central-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!BUCKET_NAME) {
  console.error('S3_BUCKET_NAME environment variable is required');
  process.exit(1);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List objects in bucket
app.get('/api/objects', async (req, res) => {
  try {
    const { prefix = '' } = req.query;
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    const objects = [];

    // Add folders
    if (response.CommonPrefixes) {
      response.CommonPrefixes.forEach(commonPrefix => {
        if (commonPrefix.Prefix) {
          const folderName = commonPrefix.Prefix.replace(prefix, '').replace('/', '');
          if (folderName) {
            objects.push({
              id: commonPrefix.Prefix,
              name: folderName,
              type: 'folder',
              lastModified: new Date(),
            });
          }
        }
      });
    }

    // Add files
    if (response.Contents) {
      response.Contents.forEach(content => {
        if (content.Key && content.Key !== prefix) {
          const fileName = content.Key.replace(prefix, '');
          if (fileName && !fileName.endsWith('/')) {
            objects.push({
              id: content.Key,
              name: fileName,
              type: 'file',
              size: content.Size || 0,
              lastModified: content.LastModified || new Date(),
            });
          }
        }
      });
    }

    res.json(objects);
  } catch (error) {
    console.error('Error listing objects:', error);
    res.status(500).json({ error: 'Failed to list objects' });
  }
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'File key is required' });
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);
    res.json({ message: 'File uploaded successfully', key });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete object
app.delete('/api/objects/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    res.json({ message: 'Object deleted successfully' });
  } catch (error) {
    console.error('Error deleting object:', error);
    res.status(500).json({ error: 'Failed to delete object' });
  }
});

// Get download URL
app.get('/api/download/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// Test connection with config validation
app.post('/api/test', async (req, res) => {
  try {
    const { bucketName, region } = req.body;
    
    // Validate config matches backend
    if (bucketName !== BUCKET_NAME) {
      return res.status(400).json({ 
        error: `Bucket mismatch. Backend configured for: ${BUCKET_NAME}` 
      });
    }
    
    if (region !== (process.env.AWS_DEFAULT_REGION || 'eu-central-1')) {
      return res.status(400).json({ 
        error: `Region mismatch. Backend configured for: ${process.env.AWS_DEFAULT_REGION || 'eu-central-1'}` 
      });
    }
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1
    });
    
    await s3Client.send(command);
    res.json({ message: 'Connection successful' });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({ error: 'Connection test failed' });
  }
});

app.listen(PORT, () => {
  console.log(`S3 Bucket Manager API running on port ${PORT}`);
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Region: ${process.env.AWS_DEFAULT_REGION || 'eu-central-1'}`);
});