export interface S3Object {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified: Date;
  url?: string;
}

class S3Service {
  public apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  private initialized = false;

  initialize() {
    this.initialized = true;
  }

  private ensureInitialized() {
    if (!this.initialized) {
      throw new Error('S3 service not initialized.');
    }
  }

  async listObjects(prefix = ''): Promise<S3Object[]> {
    this.ensureInitialized();
    
    try {
      const url = new URL(`${this.apiUrl}/api/objects`);
      if (prefix) {
        url.searchParams.set('prefix', prefix);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const objects = await response.json();
      return objects.map((obj: any) => ({
        ...obj,
        lastModified: new Date(obj.lastModified)
      }));
    } catch (error) {
      console.error('Error listing S3 objects:', error);
      throw new Error(`Failed to list objects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(file: File, key: string, onProgress?: (progress: number) => void): Promise<void> {
    this.ensureInitialized();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${this.apiUrl}/api/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteObject(key: string): Promise<void> {
    this.ensureInitialized();

    try {
      const response = await fetch(`${this.apiUrl}/api/objects/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting object:', error);
      throw new Error(`Failed to delete object: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDownloadUrl(key: string): Promise<string> {
    this.ensureInitialized();

    try {
      const response = await fetch(`${this.apiUrl}/api/download/${encodeURIComponent(key)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(config?: { bucketName: string; region: string }): Promise<void> {
    this.ensureInitialized();

    try {
      const response = await fetch(`${this.apiUrl}/api/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config || {})
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('S3 connection test failed:', error);
      throw new Error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const s3Service = new S3Service();
