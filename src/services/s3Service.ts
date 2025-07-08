
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3Object {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified: Date;
  url?: string;
}

export interface S3Config {
  bucketName: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  useIamRole: boolean;
}

class S3Service {
  private client: S3Client | null = null;
  private config: S3Config | null = null;

  initialize(config: S3Config) {
    this.config = config;
    
    const clientConfig: any = {
      region: config.region,
    };

    // Only add credentials if not using IAM role
    if (!config.useIamRole && config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  private ensureInitialized() {
    if (!this.client || !this.config) {
      throw new Error('S3 service not initialized. Please configure your S3 settings first.');
    }
  }

  async listObjects(prefix = ''): Promise<S3Object[]> {
    this.ensureInitialized();
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config!.bucketName,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await this.client!.send(command);
      const objects: S3Object[] = [];

      // Add folders (common prefixes)
      if (response.CommonPrefixes) {
        for (const commonPrefix of response.CommonPrefixes) {
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
        }
      }

      // Add files
      if (response.Contents) {
        for (const content of response.Contents) {
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
        }
      }

      return objects;
    } catch (error) {
      console.error('Error listing S3 objects:', error);
      throw new Error(`Failed to list objects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(file: File, key: string, onProgress?: (progress: number) => void): Promise<void> {
    this.ensureInitialized();

    try {
      const command = new PutObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
        Body: file,
        ContentType: file.type,
      });

      // Simulate progress for now (AWS SDK v3 doesn't have built-in progress tracking for simple uploads)
      if (onProgress) {
        const progressInterval = setInterval(() => {
          const randomProgress = Math.random() * 20;
          onProgress(Math.min(randomProgress, 90));
        }, 500);

        await this.client!.send(command);
        clearInterval(progressInterval);
        onProgress(100);
      } else {
        await this.client!.send(command);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteObject(key: string): Promise<void> {
    this.ensureInitialized();

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
      });

      await this.client!.send(command);
    } catch (error) {
      console.error('Error deleting object:', error);
      throw new Error(`Failed to delete object: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDownloadUrl(key: string): Promise<string> {
    this.ensureInitialized();

    try {
      const command = new GetObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
      });

      // Generate a presigned URL that expires in 1 hour
      const url = await getSignedUrl(this.client!, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<void> {
    this.ensureInitialized();

    try {
      // Try to list objects to test the connection
      await this.listObjects();
    } catch (error) {
      console.error('S3 connection test failed:', error);
      throw new Error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const s3Service = new S3Service();
