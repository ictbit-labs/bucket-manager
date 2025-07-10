
# S3 Bucket Manager

A beautiful, web application for managing storage buckets. Built with React, TypeScript, and Tailwind CSS, designed to run as a microservice using Docker.

## Features

- 🎵 **Design** - Dark theme with green accents and smooth animations
- ☁️ **S3 Integration** - Upload, download, and manage files in your Storage buckets
- 🐳 **Docker Ready** - Containerized application ready for deployment
- 🔒 **Secure** - Environment-based configuration with IAM role support
- 📱 **Responsive** - Beautiful interface that works on all devices
- ⚡ **Fast** - Optimized build with nginx serving static assets

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Sorage bucket with appropriate permissions
- AWS credentials (Access Key ID and Secret Access Key) OR IAM roles configured

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_DEFAULT_REGION=us-east-1
BUCKET_NAME=your-bucket-name
```

### Running with Docker Compose

#### Development
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Production
```bash
# Use the production configuration
docker-compose -f docker-compose.prod.yml up -d
```

The application will be available at `http://localhost:8080`

## AWS IAM Permissions

Your AWS user or IAM role needs the following S3 permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## EC2 Deployment with IAM Roles (Recommended)

For production deployment on EC2, use IAM roles instead of access keys:

1. Create an IAM role with the S3 permissions above
2. Attach the role to your EC2 instance
3. Remove `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from your `.env` file
4. The application will automatically use the instance's IAM role

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │◄──►│  Docker/Nginx   │◄──►│   AWS S3 API    │
│                 │    │  (Port 8080)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Development

### Local Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Building Docker Image

```bash
# Build the image
docker build -t s3-bucket-manager .

# Run the container
docker run -p 8080:80 --env-file .env s3-bucket-manager
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID | Yes (unless using IAM roles) |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | Yes (unless using IAM roles) |
| `AWS_DEFAULT_REGION` | AWS Region | Yes |
| `BUCKET_NAME` | Bucket Name | Yes |
| `NODE_ENV` | Environment (production/development) | No |

### Docker Compose Override

Create `docker-compose.override.yml` for local customizations:

```yaml
version: '3.8'
services:
  s3-bucket-manager:
    ports:
      - "3000:80"  # Use different port
    environment:
      - DEBUG=true
```

## Security Considerations

- **Never commit credentials** to version control
- Use **IAM roles** on EC2 instead of access keys when possible
- Enable **SSL/TLS** in production (use the prod config with Traefik)
- Regularly **rotate access keys**
- Use **least privilege** IAM policies

## Monitoring and Logs

### View Application Logs
```bash
docker-compose logs -f s3-bucket-manager
```

### Health Check
The application includes health checks accessible at:
- `http://localhost:8080/` - Main application
- Container health is monitored by Docker

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check IAM permissions and bucket policies
2. **Connection Timeout**: Verify AWS region and network connectivity
3. **Build Failures**: Ensure Docker has sufficient memory allocated

### Debug Mode

Set `DEBUG=true` in your environment to enable verbose logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Build Tool**: Vite
- **Container**: Docker, Nginx
- **AWS SDK**: AWS SDK for JavaScript v3
- **State Management**: TanStack Query

---

**Made with ❤️ and inspired by Spotify's beautiful design**
