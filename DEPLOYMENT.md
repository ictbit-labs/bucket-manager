# S3 Bucket Manager - EC2 Deployment Guide

## Prerequisites

1. **EC2 Instance** with Docker and Docker Compose installed
2. **IAM Role** attached to EC2 instance with S3 permissions
3. **S3 Bucket** created in your AWS account

## Step 1: Create IAM Role for EC2

1. Go to AWS IAM Console
2. Create a new role for EC2 service
3. Attach the custom policy using `aws-iam-policy.json`:
   ```bash
   # Replace YOUR_BUCKET_NAME with your actual bucket name
   sed 's/YOUR_BUCKET_NAME/your-actual-bucket-name/g' aws-iam-policy.json
   ```
4. Attach the role to your EC2 instance

## Step 2: Configure Environment Variables

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```bash
   REGION=eu-central-1
   BUCKET_NAME=your-actual-bucket-name
   VITE_API_URL=http://your-ec2-public-ip:3001
   ```

## Step 3: Deploy with Docker Compose

1. Build and start the services:
   ```bash
   docker-compose up -d --build
   ```

2. Check service status:
   ```bash
   docker-compose ps
   docker-compose logs
   ```

## Step 4: Access the Application

- **Frontend**: http://your-ec2-public-ip:8080
- **Backend API**: http://your-ec2-public-ip:3001

## Step 5: Configure Security Groups

Ensure your EC2 security group allows:
- Port 8080 (Frontend)
- Port 3001 (Backend API)
- Port 22 (SSH for management)

## Troubleshooting

### Check IAM Role
```bash
# On EC2 instance, verify IAM role is working
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

### Check S3 Access
```bash
# Test S3 access from EC2
aws s3 ls s3://your-bucket-name --region eu-central-1
```

### View Logs
```bash
# Backend logs
docker-compose logs s3-bucket-manager-api

# Frontend logs  
docker-compose logs s3-bucket-manager-frontend
```

## Production Considerations

1. **HTTPS**: Use a reverse proxy (nginx/traefik) with SSL certificates
2. **Domain**: Configure proper domain names instead of IP addresses
3. **Monitoring**: Add health checks and monitoring
4. **Backup**: Regular backup of configuration and data
5. **Updates**: Implement proper CI/CD pipeline

## Security Best Practices

- ✅ Use IAM roles instead of access keys
- ✅ Minimal S3 permissions (only required actions)
- ✅ Security groups restrict access to necessary ports
- ✅ Regular security updates for Docker images
- ✅ Monitor CloudTrail for S3 access logs