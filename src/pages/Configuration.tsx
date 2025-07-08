
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Cloud, Shield, CheckCircle, Info, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { s3Service } from "@/services/s3Service";

const awsRegions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
];

export default function Configuration() {
  const [config, setConfig] = useState({
    bucketName: "",
    region: "",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const [useIamRole, setUseIamRole] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing configuration
    const savedConfig = localStorage.getItem('s3Config');
    const savedUseIamRole = localStorage.getItem('useIamRole');
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
      setIsConnected(true);
    }
    
    if (savedUseIamRole) {
      setUseIamRole(JSON.parse(savedUseIamRole));
    }
  }, []);

  const handleSaveConfig = () => {
    // Validate required fields
    if (!config.bucketName || !config.region) {
      toast({
        title: "Validation Error",
        description: "Please fill in the bucket name and region.",
        variant: "destructive",
      });
      return;
    }

    if (!useIamRole && (!config.accessKeyId || !config.secretAccessKey)) {
      toast({
        title: "Validation Error", 
        description: "Please provide access keys or enable IAM role authentication.",
        variant: "destructive",
      });
      return;
    }

    // Save configuration
    localStorage.setItem('s3Config', JSON.stringify(config));
    localStorage.setItem('useIamRole', JSON.stringify(useIamRole));
    
    // Initialize S3 service
    try {
      s3Service.initialize();
      setIsConnected(true);
      toast({
        title: "Configuration Saved",
        description: "Configuration saved. The backend API will handle S3 authentication.",
      });
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: error instanceof Error ? error.message : "Failed to initialize S3 service",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    if (!config.bucketName || !config.region) {
      toast({
        title: "Missing Configuration",
        description: "Please configure your bucket name and region first.",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      // Initialize service
      s3Service.initialize();

      // Test the connection
      await s3Service.testConnection();
      
      setIsConnected(true);
      toast({
        title: "Connection Successful",
        description: "Successfully connected to your S3 bucket!",
      });
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to S3 bucket",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 gradient-text">S3 Configuration</h1>
        <p className="text-muted-foreground">
          Configure your AWS S3 bucket settings for secure file management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>AWS S3 Settings</CardTitle>
                  <CardDescription>
                    Enter your AWS S3 bucket details and authentication method
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bucketName">Bucket Name</Label>
                <Input
                  id="bucketName"
                  placeholder="my-s3-bucket"
                  value={config.bucketName}
                  onChange={(e) => setConfig({...config, bucketName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">AWS Region</Label>
                <Select value={config.region} onValueChange={(value) => setConfig({...config, region: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AWS region" />
                  </SelectTrigger>
                  <SelectContent>
                    {awsRegions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Authentication Method Selection */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <Label className="text-base font-medium">Authentication Method</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="iam-role"
                      name="auth-method"
                      checked={useIamRole}
                      onChange={() => setUseIamRole(true)}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="iam-role" className="cursor-pointer">
                      Use IAM Role (Recommended for EC2)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="access-keys"
                      name="auth-method"
                      checked={!useIamRole}
                      onChange={() => setUseIamRole(false)}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="access-keys" className="cursor-pointer">
                      Use Access Keys
                    </Label>
                  </div>
                </div>
              </div>

              {/* Conditional AWS Credentials Fields */}
              {!useIamRole && (
                <div className="space-y-4 p-4 border rounded-lg bg-background/50">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">AWS Access Keys</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accessKeyId">Access Key ID</Label>
                    <Input
                      id="accessKeyId"
                      type="password"
                      placeholder="AKIA..."
                      value={config.accessKeyId}
                      onChange={(e) => setConfig({...config, accessKeyId: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                    <Input
                      id="secretAccessKey"
                      type="password"
                      placeholder="Enter secret access key"
                      value={config.secretAccessKey}
                      onChange={(e) => setConfig({...config, secretAccessKey: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {useIamRole && (
                <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">IAM Role Authentication</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The application will use the IAM role attached to your EC2 instance for S3 authentication. 
                    No access keys required.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleSaveConfig} className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Info */}
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Connected
                    </Badge>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                      Not Configured
                    </Badge>
                  </>
                )}
              </div>
              {config.bucketName && (
                <p className="text-sm text-muted-foreground mt-2">
                  Bucket: {config.bucketName}
                </p>
              )}
              {config.region && (
                <p className="text-sm text-muted-foreground">
                  Region: {config.region}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Security Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div>
                <p className="font-medium text-green-400 mb-2">✓ IAM Roles (Recommended):</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>No credentials in code/config</li>
                  <li>Automatic credential rotation</li>
                  <li>Fine-grained permissions</li>
                  <li>Audit trail via CloudTrail</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-orange-400 mb-2">⚠ Access Keys:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Store in environment variables</li>
                  <li>Rotate regularly</li>
                  <li>Use least privilege principle</li>
                  <li>Never commit to version control</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
