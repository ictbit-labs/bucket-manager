
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, File, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

export default function Upload() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateUpload = (id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading' as const } : f
    ));

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const newProgress = Math.min(f.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...f, progress: 100, status: 'completed' as const };
          }
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 500);
  };

  const uploadAll = () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast({
        title: "No files to upload",
        description: "Please add some files first.",
      });
      return;
    }

    pendingFiles.forEach(file => simulateUpload(file.id));
    toast({
      title: "Upload Started",
      description: `Uploading ${pendingFiles.length} file(s) to S3 bucket.`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Upload Files</h1>
        <p className="text-muted-foreground">
          Drag and drop files or click to select files for upload to your S3 bucket
        </p>
      </div>

      {/* Upload Area */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-primary bg-primary/10 animate-pulse-green' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Drop files here to upload</h3>
            <p className="text-muted-foreground mb-6">
              or click the button below to select files
            </p>
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadIcon className="w-4 h-4 mr-2" />
                Select Files
              </label>
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upload Queue</CardTitle>
                <CardDescription>
                  {files.length} file(s) ready for upload
                </CardDescription>
              </div>
              <Button onClick={uploadAll}>
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((fileUpload) => (
              <div
                key={fileUpload.id}
                className="flex items-center gap-4 p-4 bg-background/50 rounded-lg"
              >
                <File className="w-8 h-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">
                      {fileUpload.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          fileUpload.status === 'completed'
                            ? 'default'
                            : fileUpload.status === 'uploading'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          fileUpload.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : ''
                        }
                      >
                        {fileUpload.status === 'completed' && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {fileUpload.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileUpload.id)}
                        className="h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={fileUpload.progress}
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(fileUpload.file.size)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
