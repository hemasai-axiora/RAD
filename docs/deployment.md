# AWS Deployment Configuration: RAD Platform

This document outlines the production-ready infrastructure deployment configuration for **RAD** on Amazon Web Services (AWS). It covers Container orchestration, Database provisioning, CDN configurations, Logging, and Automated Backup policies.

---

## 1. Container Orchestration (Amazon ECS with AWS Fargate)

We deploy the Node.js Express server on **Amazon ECS** using **AWS Fargate** (serverless container compute) for auto-scaling and high availability.

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/app.js"]
```

### ECS Task Definition (`infrastructure/ecs-task-def.json`)
```json
{
  "family": "rad-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "rad-api",
      "image": "<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/rad-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "5000" },
        { "name": "DB_HOST", "value": "rad-prod-db.c123456789.us-east-1.rds.amazonaws.com" },
        { "name": "DB_PORT", "value": "5432" },
        { "name": "DB_NAME", "value": "rad_db" }
      ],
      "secrets": [
        { "name": "DB_USER", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:rad/prod/db-username" },
        { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:rad/prod/db-password" },
        { "name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:rad/prod/jwt-secret" },
        { "name": "JWT_REFRESH_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:rad/prod/jwt-refresh-secret" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rad-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api"
        }
      }
    }
  ]
}
```

---

## 2. Relational Database Service (Amazon RDS PostgreSQL)

For multi-store database reliability and scaling, we deploy a Multi-AZ **Amazon RDS PostgreSQL** instance.

### DB Specifications
- **Engine:** PostgreSQL 15.x
- **Instance Class:** `db.t4g.medium` (Graviton-powered for cost-efficiency)
- **Storage:** 100 GB gp3 SSD (Allocated with Autoscaling up to 500 GB)
- **Deployment:** Multi-AZ (Active/Standby in separate Availability Zones for failover protection)
- **Security Group:** Inbound TCP 5432 allowed *only* from the ECS Tasks security group.

---

## 3. Load Balancing & CDN Routing (ALB + CloudFront)

```
                       ┌──────────────────────┐
                       │ CloudFront CDN (SSL) │
                       └──────────┬───────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
        /assets (S3 Static)             /api (Application Load Balancer)
                  │                               │
           ┌──────▼──────┐                 ┌──────▼──────┐
           │  S3 Bucket  │                 │  ECS Target │
           └─────────────┘                 └─────────────┘
```

### Static Frontend Storage (Amazon S3)
The React client is built (`npm run build`) and uploaded to an S3 bucket configured for static web hosting.
- **S3 Bucket Policy:** Enforces Origin Access Control (OAC) so that items are readable *only* by CloudFront.
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::rad-frontend-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E123456789ABCD"
        }
      }
    }
  ]
}
```

### CloudFront Distribution
- **Behaviors:**
  - `Default (*)` $\rightarrow$ Routes to S3 bucket origin (serves React SPA index.html, JS, and CSS assets).
  - `/api/*` $\rightarrow$ Routes to the Application Load Balancer (ALB) origin.
- **SSL Certificate:** AWS Certificate Manager (ACM) wild-card certificate (e.g. `*.rad-retail.com`).
- **ALB Configuration:** HTTPS listener forwards requests to Target Group pointing to Fargate containers.

---

## 4. Monitoring & Logs (Amazon CloudWatch)

- **ECS Logs:** Piped to `/ecs/rad-backend` log group.
- **RDS Logs:** Postgres error and query logs are published to CloudWatch `/aws/rds/instance/rad-prod-db`.
- **CloudWatch Alarms:**
  - **ECS CPU/Memory utilization:** Triggers scaling policies if average exceeds 70% for 5 minutes.
  - **RDS Storage Space:** Alerts if freeable space drops below 15%.
  - **API Error Rate:** Triggers SNS alert if HTTP 5XX response codes exceed 1% of total requests over a 5-minute interval.

---

## 5. AWS Backup & Recovery Policies

To protect billing audits and inventory ledgers:
- **RDS Snapshots:** Automated daily backups with 30-day retention.
- **Multi-Region Copying:** AWS Backup copy job duplicates RDS snapshots to secondary region (e.g. `us-west-2`) weekly for disaster recovery compliance.
- **S3 Object Versioning:** Enabled on static files and customer attachments to protect against accidental overrides.
