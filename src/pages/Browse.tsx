
import { useState } from "react";
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
  FolderOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface S3Object {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified: Date;
  url?: string;
}

export default function Browse() {
  const [files, setFiles] = useState<S3Object[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('root');
  const { toast } = useToast();

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

  const handleDownload = (file: S3Object) => {
    toast({
      title: "Download Started",
      description: `Downloading ${file.name}...`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast({
      title: "File Deleted",
      description: `${name} has been deleted from the bucket.`,
    });
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentPath(folderName);
    toast({
      title: "Opening Folder",
      description: `Loading contents of ${folderName}...`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Browse Files</h1>
          <p className="text-muted-foreground">
            Navigate and manage files in your S3 bucket
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary/50">
          {currentPath}
        </Badge>
      </div>

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
            {filteredFiles.length} item(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
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
