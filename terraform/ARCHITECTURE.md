# APOFlow AWS Architecture

## 📐 Arquitetura Completa

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                          AWS Account (us-east-1)                         ┃
┃                                                                          ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │                     Internet (Public)                            │   ┃
┃  │                                                                  │   ┃
┃  │                         ↓ HTTPS                                 │   ┃
┃  │                 ┌─────────────────────┐                        │   ┃
┃  │                 │  Route 53 (DNS)     │                        │   ┃
┃  │                 │ apoflow.example.com │                        │   ┃
┃  │                 └──────────┬──────────┘                        │   ┃
┃  │                            ↓                                    │   ┃
┃  │                 ┌─────────────────────┐                        │   ┃
┃  │                 │      Elastic IP     │                        │   ┃
┃  │                 │    3.XXX.XXX.XXX    │                        │   ┃
┃  │                 └──────────┬──────────┘                        │   ┃
┃  └────────────────────────────┼────────────────────────────────────┘   ┃
┃                               ↓                                         ┃
┃  ┌────────────────────────────────────────────────────────────────┐    ┃
┃  │              VPC APOFlow (10.0.0.0/16)                         │    ┃
┃  │                                                                 │    ┃
┃  │  ┌─────────────────────────────────────────────────────────┐  │    ┃
┃  │  │          Internet Gateway                               │  │    ┃
┃  │  │       (Acesso à Internet)                              │  │    ┃
┃  │  └────────────────────┬────────────────────────────────────┘  │    ┃
┃  │                       ↓                                         │    ┃
┃  │  ┌───────────────────────────────────────────────────────────┐ │    ┃
┃  │  │                                                           │ │    ┃
┃  │  │  ┌─────────────────────────────────────────────────────┐ │ │    ┃
┃  │  │  │   Public Subnet (10.0.1.0/24)                      │ │ │    ┃
┃  │  │  │   Availability Zone: us-east-1a                    │ │ │    ┃
┃  │  │  │                                                     │ │ │    ┃
┃  │  │  │  ┌──────────────────────────────────────────────┐  │ │ │    ┃
┃  │  │  │  │  Elastic IP: 54.123.45.67 ✨               │  │ │ │    ┃
┃  │  │  │  │  (IP Fixo - Permanente - Nunca Muda!)       │  │ │ │    ┃
┃  │  │  │  └────────────────────┬─────────────────────────┘  │ │ │    ┃
┃  │  │  │                       ↓                            │ │ │    ┃
┃  │  │  │  ┌──────────────────────────────────────────────┐  │ │ │    ┃
┃  │  │  │  │                                              │  │ │ │    ┃
┃  │  │  │  │    EC2: apoflow-server (t3.small)           │  │ │ │    ┃
┃  │  │  │  │    - Ubuntu 22.04 LTS                       │ │ │  │    ┃
┃  │  │  │  │    - Docker & Docker Compose               │ │ │  │    ┃
┃  │  │  │  │    - 20GB GP3 Volume (encrypted)            │ │ │  │    ┃
┃  │  │  │  │                                              │ │ │  │    ┃
┃  │  │  │  │  ┌──────────────────────────────────────┐   │ │ │  │    ┃
┃  │  │  │  │  │                                      │   │ │ │  │    ┃
┃  │  │  │  │  │   Docker Containers                 │   │ │ │  │    ┃
┃  │  │  │  │  │                                      │   │ │ │  │    ┃
┃  │  │  │  │  │  ┌────────────────────────────────┐ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  nginx:80 / nginx:443         │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  (Reverse Proxy)              │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - Load Balancing             │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - SSL Termination            │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - Static Files               │ │   │ │ │  │    ┃
┃  │  │  │  │  │  └────────────────────────────────┘ │   │ │ │  │    ┃
┃  │  │  │  │  │           ↓ :3000 ↓ :8080          │   │ │ │  │    ┃
┃  │  │  │  │  │  ┌────────────────────────────────┐ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  Frontend Container           │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - React + Vite               │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - TypeScript                 │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - Tailwind CSS               │ │   │ │ │  │    ┃
┃  │  │  │  │  │  └────────────────────────────────┘ │   │ │ │  │    ┃
┃  │  │  │  │  │                                      │   │ │ │  │    ┃
┃  │  │  │  │  │  ┌────────────────────────────────┐ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  Backend Container            │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - Java 17 / Spring Boot      │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - Maven                      │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - JPA/Hibernate              │ │   │ │ │  │    ┃
┃  │  │  │  │  │  └────────────────────────────────┘ │   │ │ │  │    ┃
┃  │  │  │  │  │           ↓ :27017 (TCP)           │   │ │ │  │    ┃
┃  │  │  │  │  │  ┌────────────────────────────────┐ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  CloudWatch Logs Agent        │ │   │ │ │  │    ┃
┃  │  │  │  │  │  │  - Application Logs           │ │   │ │ │  │    ┃
┃  │  │  │  │  │  └────────────────────────────────┘ │   │ │ │  │    ┃
┃  │  │  │  │  │                                      │   │ │ │  │    ┃
┃  │  │  │  │  └──────────────────────────────────────┘   │ │ │  │    ┃
┃  │  │  │  │                                               │ │ │  │    ┃
┃  │  │  │  │  SG: apoflow-ec2-sg                          │ │ │  │    ┃
┃  │  │  │  │  - Ingress: 22 (SSH), 80, 443               │ │ │  │    ┃
┃  │  │  │  │  - Egress: All traffic                       │ │ │  │    ┃
┃  │  │  │  │                                               │ │ │  │    ┃
┃  │  │  │  └──────────────────────────────────────────────┘ │ │  │    ┃
┃  │  │  │                                                    │ │  │    ┃
┃  │  │  │  Route Table: Public Routes                       │ │  │    ┃
┃  │  │  │  - 0.0.0.0/0 → Internet Gateway                  │ │  │    ┃
┃  │  │  │                                                    │ │  │    ┃
┃  │  │  └────────────────────────────────────────────────────┘ │  │    ┃
┃  │  │                                                          │  │    ┃
┃  │  │  ┌────────────────────────────────────────────────────┐ │  │    ┃
┃  │  │  │   Private Subnet 1 (10.0.2.0/24)                 │ │  │    ┃
┃  │  │  │   Availability Zone: us-east-1a                  │ │  │    ┃
┃  │  │  └────────────────────────────────────────────────────┘ │  │    ┃
┃  │  │                          ↓ RDS Cluster                  │  │    ┃
┃  │  │  ┌────────────────────────────────────────────────────┐ │  │    ┃
┃  │  │  │   Private Subnet 2 (10.0.3.0/24)                 │ │  │    ┃
┃  │  │  │   Availability Zone: us-east-1b                  │ │  │    ┃
┃  │  │  └────────────────────────────────────────────────────┘ │  │    ┃
┃  │  │                                                          │  │    ┃
┃  │  └──────────────────────────────────────────────────────────┘  │    ┃
┃  │                                                                 │    ┃
┃  │  ┌──────────────────────────────────────────────────────────┐  │    ┃
┃  │  │        RDS: apoflow-mongodb (DocumentDB)               │  │    ┃
┃  │  │        db.t3.small - 100GB (→ 200GB autoscaling)      │  │    ┃
┃  │  │                                                          │  │    ┃
┃  │  │  ┌────────────────────────────────────────────────────┐ │  │    ┃
┃  │  │  │                                                    │ │  │    ┃
┃  │  │  │  ┌──────────────────────────────────────────────┐ │ │  │    ┃
┃  │  │  │  │  Primary Instance (us-east-1a)             │ │ │  │    ┃
┃  │  │  │  │  - MongoDB 4.0 Compatible                  │ │ │  │    ┃
┃  │  │  │  │  - Database: apoflow                       │ │ │  │    ┃
┃  │  │  │  │  - User: apoflowadmin                      │ │ │  │    ┃
┃  │  │  │  │  - Encrypted at Rest (KMS)                │ │ │  │    ┃
┃  │  │  │  │  - Backup Enabled (7 dias)                │ │ │  │    ┃
┃  │  │  │  │  - SSL/TLS Connection Required            │ │ │  │    ┃
┃  │  │  │  │  - IAM Database Authentication             │ │ │  │    ┃
┃  │  │  │  │  - Enhanced Monitoring                     │ │ │  │    ┃
┃  │  │  │  └──────────────────────────────────────────────┘ │ │  │    ┃
┃  │  │  │                                                    │ │  │    ┃
┃  │  │  │  SG: apoflow-rds-sg                               │ │  │    ┃
┃  │  │  │  - Ingress: 27017 (MongoDB) from EC2 SG          │ │  │    ┃
┃  │  │  │  - Egress: All traffic                           │ │  │    ┃
┃  │  │  │                                                    │ │  │    ┃
┃  │  │  │  DB Subnet Group                                  │ │  │    ┃
┃  │  │  │  - Spanning Private Subnets 1 & 2                │ │  │    ┃
┃  │  │  │                                                    │ │  │    ┃
┃  │  │  └────────────────────────────────────────────────────┘ │  │    ┃
┃  │  │                                                          │  │    ┃
┃  │  └──────────────────────────────────────────────────────────┘  │    ┃
┃  │                                                                 │    ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                                                                          ┃
┃  ┌─────────────────────────────────────────────────────────────────┐   ┃
┃  │                    AWS Support Services                         │   ┃
┃  │                                                                  │   ┃
┃  │  ┌───────────────────────────┐  ┌──────────────────────────┐  │   ┃
┃  │  │   AWS Secrets Manager     │  │   CloudWatch            │  │   ┃
┃  │  │   - MongoDB Credentials   │  │   - Metrics             │  │   ┃
┃  │  │   - API Keys              │  │   - Logs                │  │   ┃
┃  │  │   - JWT Secrets           │  │   - Alarms              │  │   ┃
┃  │  │   - Encrypted at Rest     │  │   - Dashboards          │  │   ┃
┃  │  └───────────────────────────┘  └──────────────────────────┘  │   ┃
┃  │                                                                  │   ┃
┃  │  ┌───────────────────────────┐  ┌──────────────────────────┐  │   ┃
┃  │  │   AWS KMS                 │  │   IAM & Policies        │  │   ┃
┃  │  │   - RDS Encryption Key    │  │   - EC2 IAM Role        │  │   ┃
┃  │  │   - EBS Volume Encryption │  │   - Resource Policies   │  │   ┃
┃  │  │   - Key Rotation          │  │   - Access Control      │  │   ┃
┃  │  └───────────────────────────┘  └──────────────────────────┘  │   ┃
┃  │                                                                  │   ┃
┃  └─────────────────────────────────────────────────────────────────┘   ┃
┃                                                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## 🔄 Data Flow

### Request Flow (Cliente → Aplicação)

```
1. User Browser
   ↓ HTTPS Request
2. Route 53 (DNS Resolution)
   ↓ Resolves to Elastic IP
3. Elastic IP
   ↓ :443 (HTTPS)
4. EC2 Instance (nginx on port 443)
   ↓ Reverse Proxy
5. Split based on path:
   ├→ /api/* → Backend Container (:8080)
   └→ /* → Frontend Container (:3000)
6. Backend connects to RDS MongoDB
   ↓ :27017 (SSL/TLS)
7. DocumentDB
   ↓ Query Processing
8. Response back through chain
   ↑ HTTPS Response
9. User receives data
```

### Application Flow

```
Frontend (React/Vite)
├─ Makes API Requests
│  ↓ http://localhost/api/*
│  ↓ (nginx reverse proxy)
│  ↓ :8080
├→ Backend (Spring Boot)
   ├─ Validates Request
   ├─ Processes Business Logic
   ├─ Database Operations
   │  ↓ MongoDB Driver
   │  ↓ SSL/TLS Connection
   │  ↓ :27017
   ├→ DocumentDB
      ├─ Query Execution
      ├─ Returns Data
      └─ Encryption/Decryption (KMS)
   ├─ Formats Response
   └─ Returns to Frontend
```

## 🔐 Security Layers

```
1. Network Level
   ├─ Public Subnet: Only EC2 accessible from internet
   ├─ Private Subnets: Only EC2 can access RDS
   ├─ Security Groups: Strict ingress/egress rules
   └─ VPC Flow Logs: Traffic monitoring

2. Encryption Level
   ├─ Data at Rest: KMS encryption (RDS, EBS)
   ├─ Data in Transit: SSL/TLS (MongoDB connection)
   ├─ SSH: Key pair authentication
   └─ HTTPS: TLS 1.2+ for web traffic

3. Access Control Level
   ├─ IAM: Minimal permissions per service
   ├─ Secrets Manager: Encrypted credential storage
   ├─ Database Authentication: Username/Password + SSL
   └─ Application Level: JWT tokens

4. Monitoring Level
   ├─ CloudWatch Logs: Centralized logging
   ├─ CloudWatch Metrics: Performance monitoring
   ├─ RDS Enhanced Monitoring: Database performance
   └─ AWS Config: Resource compliance
```

## 📊 Resource Specifications

### EC2 Instance
| Property | Value |
|----------|-------|
| Instance Type | t3.small (2 vCPU, 2 GB RAM) |
| Operating System | Ubuntu 22.04 LTS |
| Root Volume | 20 GB GP3 (3000 IOPS) |
| Encryption | AES-256 (KMS) |
| Public IP | Elastic IP (Static) |
| IAM Role | apoflow-ec2-role |
| Monitoring | CloudWatch detailed monitoring |

### RDS DocumentDB
| Property | Value |
|----------|-------|
| Engine | DocumentDB 4.0.0 |
| Instance Class | db.t3.small (2 vCPU, 2 GB RAM) |
| Storage | 100 GB (Auto-scales to 200 GB) |
| Backup Retention | 7 days |
| Multi-AZ | Optional (false by default) |
| Encryption | KMS (AWS managed) |
| Backup Window | 03:00-04:00 UTC |
| Maintenance Window | Sunday 04:00-05:00 UTC |

### VPC Configuration
| Resource | CIDR/Value |
|----------|-----------|
| VPC | 10.0.0.0/16 |
| Public Subnet | 10.0.1.0/24 (us-east-1a) |
| Private Subnet 1 | 10.0.2.0/24 (us-east-1a) |
| Private Subnet 2 | 10.0.3.0/24 (us-east-1b) |
| IGW | Attached to VPC |
| NAT Gateway | None (EC2 uses IGW) |

## 💾 Storage Architecture

```
EC2 Storage
├─ Root Volume (/): 20 GB
│  ├─ OS Files
│  ├─ Docker (binary + images)
│  └─ /opt/apoflow/ (application)
└─ Encryption: KMS

RDS Storage
├─ Database Cluster: 100 GB initial
├─ Auto-scaling: Up to 200 GB
├─ Backups: Daily snapshots (7 day retention)
└─ Encryption: KMS

Backups & Recovery
├─ EC2: Create AMI snapshots
├─ RDS: Automated daily backups
├─ Point-in-Time: Available up to 7 days back
└─ Cross-Region: Can be enabled for disaster recovery
```

## 🔄 Disaster Recovery

```
Scenario: EC2 Instance Failure
├─ Auto-scaling: Can be added (ALB + ASG)
├─ Current: Manual failover by rebuilding
├─ RTO: ~5-10 minutes
└─ RPO: ~1 minute

Scenario: RDS Failure
├─ Current: Multi-AZ disabled (enable for HA)
├─ With Multi-AZ: Automatic failover (~1-2 minutes)
├─ Backups: 7 day retention
├─ Point-in-Time Restore: Available within 7 days
└─ Manual Snapshot: Create as needed

Scenario: Data Corruption
├─ Recovery: Restore from snapshot
├─ Timeline: Depends on backup age
├─ Verification: Test on staging first
└─ Validation: Checksum verification
```

## 📈 Scaling Strategy

### Vertical Scaling (Bigger Instances)
```
Current:        t3.small
Can upgrade to: t3.medium (4 vCPU, 4 GB)
              → t3.large (2 vCPU, 8 GB)
              → m6i.xlarge (4 vCPU, 16 GB)
```

### Horizontal Scaling (More Instances)
```
Setup:
├─ Application Load Balancer
├─ Auto Scaling Group (2-4 instances)
├─ RDS read replicas for reporting
└─ ElastiCache for session/cache
```

### Database Scaling
```
RDS:
├─ Current: Single instance (db.t3.small)
├─ Multi-AZ: For high availability
├─ Read Replicas: For read-heavy workloads
├─ Sharding: If data > 64 GB

MongoDB-specific:
├─ Indexing strategy
├─ Query optimization
├─ Connection pooling
└─ Aggregation pipeline tuning
```

## 💰 Cost Optimization

```
Current Estimated Costs:
├─ EC2: ~$10/month (t3.small)
├─ RDS: ~$50/month (db.t3.small)
├─ Storage: ~$2/month (EC2) + ~$10/month (RDS)
├─ Data Transfer: ~$5/month
└─ Misc (KMS, Secrets Manager): ~$5/month
   TOTAL: ~$82/month

Cost Reduction Options:
├─ Reserved Instances: 30-50% discount
├─ Spot Instances: 70% discount (non-critical workloads)
├─ Smaller storage: Reduce if possible
├─ Reduce backup retention: From 7 to 3 days
└─ Remove unused services
```

---

**Diagrama atualizado**: 2026-05-13  
**Terraform Version**: 1.0+  
**AWS Provider**: ~5.0
