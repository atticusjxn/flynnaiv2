#!/usr/bin/env node

/**
 * Flynn.ai v2 - Security Audit Script
 * Comprehensive security analysis for production deployment
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const SECURITY_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://flynn.ai',
  timeout: 30000,
  verbose: process.argv.includes('--verbose'),
};

const SECURITY_HEADERS = {
  required: [
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'content-security-policy',
  ],
  recommended: ['x-xss-protection', 'referrer-policy', 'permissions-policy'],
};

const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
  /auth[_-]?token/i,
  /db[_-]?pass/i,
  /database[_-]?url/i,
];

const VULNERABILITY_PATTERNS = [
  {
    pattern: /eval\s*\(/g,
    risk: 'HIGH',
    description: 'Use of eval() function',
  },
  {
    pattern: /innerHTML\s*=/g,
    risk: 'MEDIUM',
    description: 'Use of innerHTML (potential XSS)',
  },
  {
    pattern: /document\.write\s*\(/g,
    risk: 'MEDIUM',
    description: 'Use of document.write (potential XSS)',
  },
  {
    pattern: /dangerouslySetInnerHTML/g,
    risk: 'MEDIUM',
    description: 'Use of dangerouslySetInnerHTML',
  },
  {
    pattern: /sql\s*=\s*["`'].*\$\{/gi,
    risk: 'CRITICAL',
    description: 'Potential SQL injection vulnerability',
  },
];

async function runSecurityAudit() {
  console.log('🛡️  Flynn.ai v2 - Security Audit');
  console.log('='.repeat(50));
  console.log(`🎯 Target: ${SECURITY_CONFIG.baseUrl}`);
  console.log('');

  const results = {
    timestamp: new Date().toISOString(),
    target: SECURITY_CONFIG.baseUrl,
    overall: 'secure',
    score: 100,
    findings: {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    },
    tests: {
      headers: {},
      dependencies: {},
      code: {},
      configuration: {},
      ssl: {},
    },
  };

  try {
    // 1. Security Headers Analysis
    console.log('🔒 Analyzing Security Headers...\n');
    await auditSecurityHeaders(results);

    // 2. SSL/TLS Configuration
    console.log('🌐 Analyzing SSL/TLS Configuration...\n');
    await auditSSLConfiguration(results);

    // 3. Dependency Vulnerabilities
    console.log('📦 Analyzing Dependencies...\n');
    await auditDependencies(results);

    // 4. Code Security Scan
    console.log('🔍 Scanning Source Code...\n');
    await auditSourceCode(results);

    // 5. Configuration Security
    console.log('⚙️  Auditing Configuration...\n');
    await auditConfiguration(results);

    // 6. API Security
    console.log('🌐 Testing API Security...\n');
    await auditAPIEndpoints(results);

    // Generate final report
    generateSecurityReport(results);
  } catch (error) {
    console.error('❌ Security audit failed:', error);
    results.overall = 'failed';
    results.error = error.message;
  }

  return results;
}

async function auditSecurityHeaders(results) {
  try {
    const response = await makeHttpsRequest('/', 'HEAD');
    const headers = response.headers;

    results.tests.headers = {
      status: 'completed',
      headers: headers,
      required: {},
      recommended: {},
    };

    let headerScore = 100;
    let missingRequired = 0;

    // Check required headers
    for (const header of SECURITY_HEADERS.required) {
      const value = headers[header] || headers[header.toUpperCase()];
      if (value) {
        console.log(
          `  ✅ ${header}: ${value.substring(0, 60)}${value.length > 60 ? '...' : ''}`
        );
        results.tests.headers.required[header] = value;

        // Validate specific headers
        await validateSecurityHeader(header, value, results);
      } else {
        console.log(`  ❌ ${header}: Missing`);
        results.findings.high.push({
          type: 'missing_security_header',
          header: header,
          description: `Missing required security header: ${header}`,
          recommendation: `Add ${header} header to improve security`,
        });
        missingRequired++;
        headerScore -= 15;
      }
    }

    // Check recommended headers
    for (const header of SECURITY_HEADERS.recommended) {
      const value = headers[header] || headers[header.toUpperCase()];
      if (value) {
        console.log(
          `  ✅ ${header}: ${value.substring(0, 60)}${value.length > 60 ? '...' : ''}`
        );
        results.tests.headers.recommended[header] = value;
      } else {
        console.log(`  ⚠️  ${header}: Missing (recommended)`);
        results.findings.medium.push({
          type: 'missing_recommended_header',
          header: header,
          description: `Missing recommended security header: ${header}`,
          recommendation: `Consider adding ${header} header for enhanced security`,
        });
        headerScore -= 5;
      }
    }

    results.tests.headers.score = Math.max(0, headerScore);
    console.log(
      `  🎯 Security Headers Score: ${results.tests.headers.score}/100\n`
    );
  } catch (error) {
    console.log(`  ❌ Failed to analyze security headers: ${error.message}\n`);
    results.findings.critical.push({
      type: 'headers_analysis_failed',
      description: 'Could not analyze security headers',
      error: error.message,
    });
  }
}

async function validateSecurityHeader(header, value, results) {
  switch (header.toLowerCase()) {
    case 'strict-transport-security':
      if (!value.includes('max-age=')) {
        results.findings.medium.push({
          type: 'weak_hsts',
          description: 'HSTS header missing max-age directive',
          recommendation: 'Add max-age directive to HSTS header',
        });
      } else if (!value.includes('includeSubDomains')) {
        results.findings.low.push({
          type: 'hsts_no_subdomains',
          description: 'HSTS header missing includeSubDomains directive',
          recommendation: 'Add includeSubDomains to HSTS header',
        });
      }
      break;

    case 'content-security-policy':
      if (value.includes("'unsafe-eval'")) {
        results.findings.medium.push({
          type: 'csp_unsafe_eval',
          description: 'CSP allows unsafe-eval',
          recommendation: 'Remove unsafe-eval from CSP if possible',
        });
      }
      if (value.includes("'unsafe-inline'")) {
        results.findings.low.push({
          type: 'csp_unsafe_inline',
          description: 'CSP allows unsafe-inline',
          recommendation:
            'Consider using nonce or hash instead of unsafe-inline',
        });
      }
      break;

    case 'x-frame-options':
      if (!['DENY', 'SAMEORIGIN'].includes(value.toUpperCase())) {
        results.findings.medium.push({
          type: 'weak_frame_options',
          description: 'X-Frame-Options not set to DENY or SAMEORIGIN',
          recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN',
        });
      }
      break;
  }
}

async function auditSSLConfiguration(results) {
  try {
    const url = new URL(SECURITY_CONFIG.baseUrl);
    if (url.protocol !== 'https:') {
      console.log('  ❌ Site not using HTTPS\n');
      results.findings.critical.push({
        type: 'no_https',
        description: 'Site not using HTTPS',
        recommendation: 'Enable HTTPS for all connections',
      });
      return;
    }

    const sslInfo = await getSSLInfo(url.hostname);
    results.tests.ssl = sslInfo;

    if (sslInfo.error) {
      console.log(`  ❌ SSL analysis failed: ${sslInfo.error}\n`);
      results.findings.high.push({
        type: 'ssl_analysis_failed',
        description: 'Could not analyze SSL configuration',
        error: sslInfo.error,
      });
    } else {
      console.log(`  ✅ SSL Certificate Valid`);
      console.log(`  📅 Expires: ${sslInfo.validTo}`);
      console.log(`  🏢 Issuer: ${sslInfo.issuer}`);
      console.log(`  🔒 Protocol: ${sslInfo.protocol}\n`);

      // Check certificate expiry
      const expiryDate = new Date(sslInfo.validTo);
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate - now) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 30) {
        results.findings.high.push({
          type: 'ssl_expiring_soon',
          description: `SSL certificate expires in ${daysUntilExpiry} days`,
          recommendation: 'Renew SSL certificate',
        });
      } else if (daysUntilExpiry < 90) {
        results.findings.medium.push({
          type: 'ssl_expiring_soon',
          description: `SSL certificate expires in ${daysUntilExpiry} days`,
          recommendation: 'Plan SSL certificate renewal',
        });
      }
    }
  } catch (error) {
    console.log(`  ❌ SSL audit failed: ${error.message}\n`);
    results.findings.high.push({
      type: 'ssl_audit_failed',
      description: 'SSL audit failed',
      error: error.message,
    });
  }
}

async function auditDependencies(results) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    results.tests.dependencies = {
      status: 'completed',
      total: Object.keys(allDeps).length,
      vulnerable: [],
      outdated: [],
    };

    // Known vulnerable patterns (basic check)
    const knownVulnerable = [
      'lodash@4.17.20', // Example - would need real vulnerability database
    ];

    let vulnerableCount = 0;

    console.log(
      `  📊 Analyzing ${Object.keys(allDeps).length} dependencies...\n`
    );

    for (const [name, version] of Object.entries(allDeps)) {
      const depString = `${name}@${version}`;

      // Basic security checks
      if (name.includes('debug') && !packageJson.devDependencies[name]) {
        results.findings.low.push({
          type: 'debug_dependency',
          description: `Debug package ${name} in production dependencies`,
          recommendation: 'Move debug packages to devDependencies',
        });
      }

      // Check for common vulnerable packages (simplified)
      if (knownVulnerable.includes(depString)) {
        results.findings.high.push({
          type: 'vulnerable_dependency',
          package: name,
          version: version,
          description: `Vulnerable dependency: ${depString}`,
          recommendation: `Update ${name} to latest secure version`,
        });
        vulnerableCount++;
      }
    }

    console.log(`  ✅ Dependencies analyzed: ${Object.keys(allDeps).length}`);
    console.log(`  ⚠️  Potential vulnerabilities: ${vulnerableCount}\n`);

    results.tests.dependencies.vulnerable = vulnerableCount;
  } catch (error) {
    console.log(`  ❌ Dependency audit failed: ${error.message}\n`);
    results.findings.medium.push({
      type: 'dependency_audit_failed',
      description: 'Could not analyze dependencies',
      error: error.message,
    });
  }
}

async function auditSourceCode(results) {
  try {
    const sourceFiles = await getSourceFiles([
      'app',
      'components',
      'lib',
      'utils',
    ]);

    results.tests.code = {
      status: 'completed',
      filesScanned: sourceFiles.length,
      vulnerabilities: [],
    };

    let totalVulns = 0;

    console.log(`  🔍 Scanning ${sourceFiles.length} source files...\n`);

    for (const filePath of sourceFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const relativeFile = path.relative(process.cwd(), filePath);

        // Check for sensitive data patterns
        for (const pattern of SENSITIVE_PATTERNS) {
          const matches = content.match(pattern);
          if (matches) {
            results.findings.medium.push({
              type: 'potential_sensitive_data',
              file: relativeFile,
              pattern: pattern.source,
              description: `Potential sensitive data pattern found in ${relativeFile}`,
              recommendation: 'Review for hardcoded secrets or sensitive data',
            });
            totalVulns++;
          }
        }

        // Check for security vulnerabilities
        for (const vuln of VULNERABILITY_PATTERNS) {
          const matches = content.match(vuln.pattern);
          if (matches) {
            const finding = {
              type: 'code_vulnerability',
              file: relativeFile,
              risk: vuln.risk,
              description: `${vuln.description} in ${relativeFile}`,
              recommendation: 'Review and remediate security vulnerability',
              pattern: vuln.pattern.source,
            };

            if (vuln.risk === 'CRITICAL') {
              results.findings.critical.push(finding);
            } else if (vuln.risk === 'HIGH') {
              results.findings.high.push(finding);
            } else if (vuln.risk === 'MEDIUM') {
              results.findings.medium.push(finding);
            }

            totalVulns++;
          }
        }
      } catch (fileError) {
        // Skip files that can't be read
        continue;
      }
    }

    console.log(`  ✅ Code scan completed`);
    console.log(`  ⚠️  Potential issues found: ${totalVulns}\n`);

    results.tests.code.vulnerabilities = totalVulns;
  } catch (error) {
    console.log(`  ❌ Source code audit failed: ${error.message}\n`);
    results.findings.medium.push({
      type: 'code_audit_failed',
      description: 'Could not scan source code',
      error: error.message,
    });
  }
}

async function auditConfiguration(results) {
  try {
    results.tests.configuration = {
      status: 'completed',
      nextConfig: {},
      vercelConfig: {},
      middlewareConfig: {},
    };

    // Check Next.js configuration
    try {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      const nextConfig = await fs.readFile(nextConfigPath, 'utf8');

      // Check for security configurations
      const securityChecks = [
        {
          pattern: /poweredByHeader\s*:\s*false/,
          name: 'X-Powered-By header disabled',
        },
        {
          pattern: /reactStrictMode\s*:\s*true/,
          name: 'React Strict Mode enabled',
        },
        { pattern: /swcMinify\s*:\s*true/, name: 'SWC minification enabled' },
      ];

      for (const check of securityChecks) {
        if (check.pattern.test(nextConfig)) {
          console.log(`  ✅ ${check.name}`);
        } else {
          console.log(`  ⚠️  ${check.name}: Not configured`);
          results.findings.low.push({
            type: 'missing_security_config',
            description: `${check.name} not configured`,
            recommendation: `Configure ${check.name} in next.config.js`,
          });
        }
      }
    } catch (configError) {
      results.findings.low.push({
        type: 'config_analysis_failed',
        description: 'Could not analyze Next.js configuration',
        error: configError.message,
      });
    }

    console.log('');
  } catch (error) {
    console.log(`  ❌ Configuration audit failed: ${error.message}\n`);
    results.findings.medium.push({
      type: 'configuration_audit_failed',
      description: 'Could not audit configuration',
      error: error.message,
    });
  }
}

async function auditAPIEndpoints(results) {
  try {
    const endpoints = [
      { path: '/api/performance/health', method: 'GET', expectAuth: false },
      { path: '/api/webhooks/twilio/voice', method: 'POST', expectAuth: false },
      { path: '/api/user/profile', method: 'GET', expectAuth: true },
      { path: '/api/admin/users', method: 'GET', expectAuth: true },
    ];

    results.tests.api = {
      status: 'completed',
      endpoints: [],
    };

    console.log(`  🌐 Testing ${endpoints.length} API endpoints...\n`);

    for (const endpoint of endpoints) {
      try {
        const response = await makeHttpsRequest(endpoint.path, endpoint.method);

        const result = {
          path: endpoint.path,
          method: endpoint.method,
          status: response.statusCode,
          expectAuth: endpoint.expectAuth,
          secure: true,
        };

        // Check authentication requirements
        if (endpoint.expectAuth && response.statusCode === 200) {
          results.findings.high.push({
            type: 'missing_authentication',
            endpoint: `${endpoint.method} ${endpoint.path}`,
            description: `Endpoint ${endpoint.path} should require authentication but returned 200`,
            recommendation: 'Implement proper authentication checks',
          });
          result.secure = false;
        }

        // Check for information disclosure
        if (
          response.statusCode === 500 &&
          response.body &&
          response.body.includes('Error:')
        ) {
          results.findings.medium.push({
            type: 'information_disclosure',
            endpoint: `${endpoint.method} ${endpoint.path}`,
            description: `Endpoint ${endpoint.path} may be leaking error information`,
            recommendation: 'Sanitize error messages in production',
          });
          result.secure = false;
        }

        results.tests.api.endpoints.push(result);
        console.log(
          `  ${result.secure ? '✅' : '❌'} ${endpoint.method} ${endpoint.path}: ${response.statusCode}`
        );
      } catch (apiError) {
        console.log(
          `  ⚠️  ${endpoint.method} ${endpoint.path}: ${apiError.message}`
        );
        results.tests.api.endpoints.push({
          path: endpoint.path,
          method: endpoint.method,
          error: apiError.message,
          secure: false,
        });
      }
    }

    console.log('');
  } catch (error) {
    console.log(`  ❌ API audit failed: ${error.message}\n`);
    results.findings.medium.push({
      type: 'api_audit_failed',
      description: 'Could not audit API endpoints',
      error: error.message,
    });
  }
}

// Helper functions
async function makeHttpsRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SECURITY_CONFIG.baseUrl);
    const options = {
      method,
      timeout: SECURITY_CONFIG.timeout,
      headers: {
        'User-Agent': 'Flynn-SecurityAudit/1.0',
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${SECURITY_CONFIG.timeout}ms`));
    });

    req.end();
  });
}

async function getSSLInfo(hostname) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port: 443,
      method: 'GET',
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      const cert = res.connection.getPeerCertificate();
      resolve({
        valid: res.connection.authorized,
        issuer: cert.issuer.CN,
        subject: cert.subject.CN,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        protocol: res.connection.getProtocol(),
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    req.end();
  });
}

async function getSourceFiles(directories) {
  const files = [];

  async function walkDir(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (
          entry.isDirectory() &&
          !['node_modules', '.git', '.next', 'coverage'].includes(entry.name)
        ) {
          await walkDir(fullPath);
        } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  for (const dir of directories) {
    await walkDir(path.join(process.cwd(), dir));
  }

  return files;
}

function calculateSecurityScore(results) {
  let score = 100;

  // Deduct points based on findings
  score -= results.findings.critical.length * 25;
  score -= results.findings.high.length * 15;
  score -= results.findings.medium.length * 8;
  score -= results.findings.low.length * 3;

  return Math.max(0, score);
}

function generateSecurityReport(results) {
  console.log('🛡️  Security Audit Report');
  console.log('='.repeat(50));

  const totalFindings = Object.values(results.findings).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  results.score = calculateSecurityScore(results);

  if (totalFindings === 0) {
    results.overall = 'secure';
    console.log('\n🎉 No security issues found!');
  } else if (results.findings.critical.length > 0) {
    results.overall = 'critical';
    console.log('\n🚨 CRITICAL: Immediate security attention required');
  } else if (results.findings.high.length > 0) {
    results.overall = 'high-risk';
    console.log('\n⚠️  HIGH RISK: Security issues need prompt attention');
  } else if (results.findings.medium.length > 0) {
    results.overall = 'moderate-risk';
    console.log('\n⚠️  MODERATE RISK: Security improvements recommended');
  } else {
    results.overall = 'low-risk';
    console.log('\n✅ LOW RISK: Minor security improvements suggested');
  }

  console.log(`\n📊 Security Score: ${results.score}/100`);
  console.log(`🔍 Total Findings: ${totalFindings}`);
  console.log(`🚨 Critical: ${results.findings.critical.length}`);
  console.log(`⚠️  High: ${results.findings.high.length}`);
  console.log(`⚠️  Medium: ${results.findings.medium.length}`);
  console.log(`ℹ️  Low: ${results.findings.low.length}`);

  // Show detailed findings if verbose or if critical/high issues exist
  if (
    SECURITY_CONFIG.verbose ||
    results.findings.critical.length > 0 ||
    results.findings.high.length > 0
  ) {
    console.log('\n🔍 Detailed Findings:');

    ['critical', 'high', 'medium', 'low'].forEach((severity) => {
      if (results.findings[severity].length > 0) {
        console.log(`\n${severity.toUpperCase()} Issues:`);
        results.findings[severity].forEach((finding, i) => {
          console.log(`  ${i + 1}. ${finding.description}`);
          if (finding.recommendation) {
            console.log(`     → ${finding.recommendation}`);
          }
        });
      }
    });
  }

  // Save detailed report
  const reportPath = `security-audit-${Date.now()}.json`;
  fs.writeFile(reportPath, JSON.stringify(results, null, 2)).catch(
    console.error
  );
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Exit with appropriate code
  if (results.findings.critical.length > 0) {
    console.log('\n🚨 FAILED: Critical security issues must be resolved');
    process.exit(1);
  } else if (results.findings.high.length > 0) {
    console.log('\n⚠️  WARNING: High-risk security issues found');
    process.exit(1);
  } else {
    console.log('\n✅ PASSED: No critical security issues found');
    process.exit(0);
  }
}

// Run security audit if this file is executed directly
if (require.main === module) {
  runSecurityAudit().catch((error) => {
    console.error('❌ Security audit failed:', error);
    process.exit(1);
  });
}

module.exports = { runSecurityAudit };
