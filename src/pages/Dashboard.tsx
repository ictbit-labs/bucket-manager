
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Upload, Download, Settings, Database, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Files", value: "0", icon: Database, color: "text-blue-400" },
    { label: "Storage Used", value: "0 MB", icon: Cloud, color: "text-green-400" },
    { label: "Uploads Today", value: "0", icon: Upload, color: "text-purple-400" },
    { label: "Downloads", value: "0", icon: Download, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          Welcome to S3 Bucket Manager
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your AWS S3 storage with a beautiful, Spotify-inspired interface. 
          Upload, download, and organize your files with ease.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:scale-105 transition-all duration-300 cursor-pointer" 
              onClick={() => navigate('/config')}>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Configure S3</CardTitle>
            <CardDescription>
              Set up your AWS S3 bucket credentials and region settings
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/upload')}>
          <CardHeader>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-green-400" />
            </div>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Drag and drop or select files to upload to your S3 bucket
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/browse')}>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle>Browse Files</CardTitle>
            <CardDescription>
              View, download, and manage files in your S3 bucket
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle className="text-primary">Docker & Security Ready</CardTitle>
          </div>
          <CardDescription className="text-base">
            This application is designed to run as a microservice using Docker Compose on EC2 instances 
            with proper IAM role permissions. Your AWS credentials are handled securely through environment 
            variables and never stored in the browser.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
