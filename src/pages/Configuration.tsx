
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Cloud, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = () => {
    // In a real app, this would validate and save to backend/environment
    localStorage.setItem('s3Config', JSON.stringify(config));
    setIsConnected(true);
    toast({
      title: "Configuration Saved",
      description: "Your S3 bucket configuration has been saved successfully.",
    });
  };

  const handleTestConnection = () => {
    // In a real app, this would test the actual S3 connection
    toast({
      title: "Connection Test",
      description: "Testing S3 connection... (This would validate credentials in production)",
    });
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
                    Enter your AWS S3 bucket details and credentials
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

              <div className="flex gap-3">
                <Button onClick={handleSaveConfig} className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={handleTestConnection}>
                  Test Connection
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
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                In production, credentials should be managed through:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Environment variables</li>
                <li>IAM roles on EC2</li>
                <li>AWS Secrets Manager</li>
                <li>Docker secrets</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
