# 🔒 Security Policy - RiggerHub-web

## Overview

This document outlines the security policies and procedures for the RiggerHub web platform, part of the Rigger Project ecosystem built by Jack Jonas & Tia to support the ChaseWhiteRabbit NGO.

## Core Team

**Jack Jonas**  
Lead Architect & DevOps Engineer  
[jackjonas95@gmail.com](mailto:jackjonas95@gmail.com)

**Tia**  
Principal Developer & Security Lead  
[tiatheone@protonmail.com](mailto:tiatheone@protonmail.com)

## Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | ✅ Actively supported |
| 1.x.x   | ⚠️ Security fixes only |
| < 1.0   | ❌ No longer supported |

## Security Architecture

### Infrastructure Security

#### VPS Security Configuration

Our enterprise VPS infrastructure implements multiple security layers:

- **supabase.sxc.codes** (93.127.167.157): Database and authentication services
  - PostgreSQL with Row Level Security (RLS) enabled
  - Encrypted connections (SSL/TLS)
  - Regular automated backups
  - Access restricted to authorized personnel only

- **docker.sxc.codes** (145.223.22.7): CI/CD and container deployment
  - Docker container isolation
  - Automated security scanning of container images
  - Secure secret management
  - Regular security updates

- **grafana.sxc.codes** (153.92.214.1): Monitoring and alerting
  - Real-time security event monitoring
  - Intrusion detection systems
  - Automated alert mechanisms

#### Network Security

- All communications encrypted with TLS 1.2+
- SSH key-based authentication only (password authentication disabled)
- Firewall rules restricting access to essential ports only
- VPN access required for administrative tasks
- Regular security audits and penetration testing

### Application Security

#### Authentication & Authorization

- **Multi-factor Authentication (MFA)**: Required for all user accounts
- **OAuth 2.0 / OpenID Connect**: Secure authentication flow via Supabase
- **JWT Tokens**: Short-lived access tokens with secure refresh mechanism
- **Role-Based Access Control (RBAC)**: Granular permission system

#### Data Protection

- **Encryption at Rest**: All sensitive data encrypted using AES-256
- **Encryption in Transit**: TLS 1.2+ for all communications
- **Data Minimization**: Only collect necessary user information
- **GDPR Compliance**: Right to erasure and data portability implemented

#### Input Validation & Sanitization

- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Protection**: Content Security Policy (CSP) headers implemented
- **CSRF Protection**: Anti-CSRF tokens for state-changing operations
- **Input Validation**: Server-side validation for all user inputs

## Security Best Practices

### Development Security

#### Code Security

```typescript
// Example: Secure API endpoint with input validation
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';

const createJobSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  location: z.string().min(1).max(100),
  salary: z.number().positive().optional()
});

// Rate limiting
const createJobLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many job creation attempts, please try again later.'
});

app.post('/api/jobs', createJobLimiter, async (req, res) => {
  try {
    // Validate input
    const validatedData = createJobSchema.parse(req.body);
    
    // Verify authentication
    const user = await verifyToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Create job with user context
    const job = await createJob({ ...validatedData, userId: user.id });
    
    res.status(201).json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    // Log security-relevant errors
    logger.error('Job creation failed', { userId: user?.id, error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### Environment Security

```bash
# .env.example - Never commit actual secrets
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=development

# Production secrets should be stored securely
# Use proper secret management systems
```

### Deployment Security

#### Docker Security

```dockerfile
# Security-hardened Dockerfile
FROM node:18-alpine AS builder

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY package*.json ./

# Install dependencies as root, then switch to non-root user
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Copy built application
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Security headers configuration
COPY nginx.security.conf /etc/nginx/conf.d/security.conf

# Remove default nginx user and use our custom user
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Security Configuration

```nginx
# nginx.security.conf
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
" always;

# Hide nginx version
server_tokens off;

# Limit request size
client_max_body_size 10M;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
}

location /auth/ {
    limit_req zone=login burst=5 nodelay;
}
```

## Vulnerability Management

### Reporting Security Vulnerabilities

We take security vulnerabilities seriously. If you discover a security issue, please follow responsible disclosure:

#### Reporting Process

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. **Email** security reports directly to: **tiatheone@protonmail.com**
3. **Include** the following information:
   - Detailed description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes or mitigations

#### Response Timeline

- **Initial Response**: Within 48 hours
- **Vulnerability Assessment**: Within 1 week
- **Security Fix**: Critical issues within 72 hours, others within 2 weeks
- **Public Disclosure**: After fix is deployed and users have been notified

#### Security Researchers

We appreciate security researchers who help improve our platform security:

- We will acknowledge your contribution (unless you prefer to remain anonymous)
- We may offer bounties for critical security findings (contact us for details)
- We will work with you on responsible disclosure timelines

### Security Updates

#### Automated Security Scanning

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    # npm audit
    - name: Run npm audit
      run: npm audit --audit-level high
    
    # Dependency check
    - name: Run dependency check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: 'RiggerHub-web'
        path: '.'
        format: 'ALL'
    
    # CodeQL Analysis
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: typescript, javascript
    
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

#### Security Monitoring

```typescript
// Security event logging
import { createLogger } from 'winston';

const securityLogger = createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
});

// Log security events
export const logSecurityEvent = (event: string, details: any) => {
  securityLogger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    userAgent: details.userAgent,
    ip: details.ip,
    userId: details.userId,
    details
  });
};

// Example usage
app.use('/api', (req, res, next) => {
  // Log failed authentication attempts
  if (req.path === '/auth/login' && res.statusCode === 401) {
    logSecurityEvent('FAILED_LOGIN', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email
    });
  }
  next();
});
```

## Compliance & Auditing

### Data Protection Compliance

#### GDPR Compliance

- **Data Minimization**: Only collect necessary user data
- **Consent Management**: Clear opt-in/opt-out mechanisms
- **Right to Erasure**: Users can delete their accounts and data
- **Data Portability**: Users can export their data
- **Privacy by Design**: Security and privacy built into system architecture

#### Australian Privacy Act Compliance

- **Data handling** follows Australian Privacy Principles (APPs)
- **User notification** for data breaches within required timeframes
- **Cross-border data transfers** properly documented and secured

### Security Auditing

#### Regular Security Reviews

- **Monthly**: Dependency vulnerability scans
- **Quarterly**: Infrastructure security reviews
- **Annually**: Third-party security audits
- **Ongoing**: Real-time security monitoring

#### Audit Logging

```typescript
// Comprehensive audit logging
interface AuditLog {
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure';
  details: Record<string, any>;
  ip: string;
  userAgent: string;
}

const auditLogger = (log: AuditLog) => {
  // Store in secure audit log system
  secureAuditStore.store(log);
  
  // Real-time monitoring for suspicious activities
  if (isSuspiciousActivity(log)) {
    alertSecurityTeam(log);
  }
};
```

## Incident Response

### Security Incident Response Plan

#### 1. Detection & Analysis

- **Automated Monitoring**: Real-time detection via Grafana dashboards
- **User Reports**: Security issues reported by users or researchers
- **Regular Audits**: Proactive security assessments

#### 2. Containment & Eradication

- **Immediate Response**: Isolate affected systems
- **Evidence Preservation**: Secure logs and forensic data
- **Fix Implementation**: Deploy security patches

#### 3. Recovery & Lessons Learned

- **System Restoration**: Bring services back online securely
- **Communication**: Notify affected users and stakeholders
- **Post-Incident Review**: Improve security measures

### Emergency Contacts

#### Security Team

- **Primary Contact**: tiatheone@protonmail.com (Tia - Security Lead)
- **Secondary Contact**: jackjonas95@gmail.com (Jack Jonas - DevOps)
- **Infrastructure Emergency**: Access docker.sxc.codes for immediate response

#### Escalation Procedures

1. **Critical Security Incident**: Contact both team members immediately
2. **Data Breach**: Follow legal notification requirements (Australian authorities)
3. **Service Disruption**: Implement disaster recovery procedures

## Security Training & Awareness

### Development Team Training

- **Secure Coding Practices**: Regular training on OWASP Top 10
- **Threat Modeling**: Understanding potential attack vectors
- **Security Tools**: Proper use of security scanning and monitoring tools
- **Incident Response**: Team training on security incident procedures

### User Security

#### Best Practices for Users

- **Strong Passwords**: Encourage use of password managers
- **Multi-Factor Authentication**: Mandatory for all accounts
- **Phishing Awareness**: Education about social engineering attacks
- **Data Privacy**: Understanding of data collection and use

## Contact Information

### Security Team

- **Tia** (Principal Developer & Security Lead): tiatheone@protonmail.com
- **Jack Jonas** (Lead Architect & DevOps): jackjonas95@gmail.com

### Infrastructure Support

- **Primary VPS**: docker.sxc.codes
- **Database**: supabase.sxc.codes
- **Monitoring**: grafana.sxc.codes

---

**Last Updated**: January 2025  
**Next Review**: July 2025

*This security policy is maintained by the RiggerHub security team and reviewed regularly to ensure it remains current with evolving threats and best practices.*
