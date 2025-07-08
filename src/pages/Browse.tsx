import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  File, 
  Folder, 
  Search, 
  MoreVertical,
  Trash2,
  Eye,
  FolderOpen,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { s3Service, S3Object } from "@/services/s3Service";

export default function Browse() {
  const [files, setFiles] = useState<S3Object[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if S3 is configured
    const config = localStorage.getItem('s3Config');
    const useIamRole = localStorage.getItem('useIamRole');
    
    if (config) {
      const parsedConfig = JSON.parse(config);
      const parsedUseIamRole = JSON.parse(useIamRole || 'true');
      
      if (parsedConfig.bucketName && parsedConfig.region) {
        try {
          s3Service.initialize({
            ...parsedConfig,
            useIamRole: parsedUseIamRole,
          });
          setIsConfigured(true);
          loadFiles();
        } catch (error) {
          toast({
            title: "Configuration Error",
            description: "Failed to initialize storage service. Please check your configuration.",
            variant: "destructive",
          });
        }
      }
    }
  }, []);

  const loadFiles = async () => {
    if (!isConfigured) return;
    
    setLoading(true);
    try {
      const objects = await s3Service.listObjects(currentPath);
      setFiles(objects);
    } catch (error) {
      toast({
        title: "Error Loading Files",
        description: error instanceof Error ? error.message : "Failed to load files from storage bucket",
        variant: "destructive",
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDownload = async (file: S3Object) => {
    try {
      const downloadUrl = await s3Service.getDownloadUrl(file.id);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Downloading ${file.name}...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await s3Service.deleteObject(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      toast({
        title: "File Deleted",
        description: `${name} has been deleted from the bucket.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleFolderClick = (folderName: string) => {
    const newPath = currentPath + folderName + '/';
    setCurrentPath(newPath);
    toast({
      title: "Opening Folder",
      description: `Loading contents of ${folderName}...`,
    });
    loadFiles();
  };

  const handleRefresh = () => {
    loadFiles();
  };

  const navigateUp = () => {
    if (currentPath) {
      const pathParts = currentPath.split('/').filter(Boolean);
      pathParts.pop();
      const newPath = pathParts.length > 0 ? pathParts.join('/') + '/' : '';
      setCurrentPath(newPath);
      loadFiles();
    }
  };

  if (!isConfigured) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Browse Files</h1>
          <p className="text-muted-foreground">
            Navigate and manage files in your storage bucket
          </p>
        </div>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground/50 mb-4 mx-auto" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              S3 Not Configured
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Please configure your S3 bucket settings in the Configuration page to browse files.
            </p>
            <Button onClick={() => window.location.href = '/config'}>
              Go to Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Browse Files</h1>
          <p className="text-muted-foreground">
            Navigate and manage files in your S3 bucket
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary border-primary/50">
            {currentPath || 'root'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {currentPath && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <Button variant="outline" onClick={navigateUp}>
              ← Back to Parent Folder
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Files & Folders</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${filteredFiles.length} item(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No files found
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchTerm 
                  ? `No files match "${searchTerm}". Try adjusting your search terms.`
                  : "This bucket is empty. Upload some files to get started."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    {file.type === 'folder' ? (
                      <Folder className="w-8 h-8 text-blue-400" />
                    ) : (
                      <File className="w-8 h-8 text-muted-foreground" />
                    )}
                    <div>
                      <h3 
                        className={`font-medium ${file.type === 'folder' ? 'cursor-pointer hover:text-primary' : ''}`}
                        onClick={() => file.type === 'folder' && handleFolderClick(file.name)}
                      >
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(file.lastModified)}</span>
                        {file.size && <span>{formatFileSize(file.size)}</span>}
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.type === 'file' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {file.type === 'file' && (
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(file.id, file.name)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
