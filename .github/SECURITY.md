# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**CRITICAL**: Do NOT open public issues for security vulnerabilities.

### How to Report

1. **Email**: Send details to security@hiberus.com
2. **Subject**: `[SECURITY] HAIDA - [Brief Description]`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Every 72 hours
- **Resolution Timeline**: 30-90 days (depending on severity)

### Security Measures

#### Implemented

- ✅ TypeScript strict mode enabled
- ✅ ESLint security plugin configured
- ✅ Dependabot automated updates
- ✅ Snyk vulnerability scanning
- ✅ Pre-commit hooks for sensitive data detection
- ✅ Environment variables validation
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Input validation with Zod schemas

#### In Progress

- 🔄 Secrets scanning with git-secrets
- 🔄 Container security scanning
- 🔄 SAST (Static Application Security Testing)
- 🔄 DAST (Dynamic Application Security Testing)

#### Planned

- 📋 Bug bounty program
- 📋 Penetration testing
- 📋 Security audit by third party

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` files (gitignored)
   - Use GitHub Secrets for CI/CD
   - Rotate credentials regularly

2. **Keep dependencies updated**
   - Review Dependabot PRs weekly
   - Run `npm audit` before releases
   - Use `npm audit fix` for auto-fixes

3. **Validate all inputs**
   - Use Zod schemas for validation
   - Sanitize user inputs
   - Implement rate limiting

4. **Follow OWASP Top 10**
   - Prevent SQL injection
   - Avoid XSS vulnerabilities
   - Implement CSRF protection
   - Use secure headers

### For DevOps

1. **Secrets Management**
   - Use Vault or AWS Secrets Manager
   - Rotate secrets every 90 days
   - Never log secrets

2. **Container Security**
   - Scan images before deployment
   - Use minimal base images
   - Run containers as non-root

3. **Network Security**
   - Implement proper CORS
   - Use HTTPS everywhere
   - Configure security headers

## Vulnerability Disclosure

We follow responsible disclosure practices:

1. Report received → Acknowledged (48h)
2. Investigation → Assessment (1 week)
3. Fix developed → Tested (2-4 weeks)
4. Release published → Advisory issued
5. Public disclosure (after 90 days)

## Contact

- **Security Team**: security@hiberus.com
- **DevOps Team**: devops@hiberus.com
- **Project Lead**: haida-po@hiberus.com
