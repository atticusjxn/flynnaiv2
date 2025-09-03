#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

/**
 * Performance audit script - analyzes the application for performance issues
 */
async function performanceAudit() {
  console.log('🔍 Flynn.ai v2 Performance Audit\n');
  console.log('='.repeat(50));

  const issues = [];
  const recommendations = [];

  try {
    // Check Next.js configuration
    await auditNextConfig(issues, recommendations);

    // Check bundle size
    await auditBundleSize(issues, recommendations);

    // Check component performance
    await auditComponents(issues, recommendations);

    // Check database queries
    await auditDatabaseQueries(issues, recommendations);

    // Check API routes
    await auditAPIRoutes(issues, recommendations);

    // Generate report
    await generateReport(issues, recommendations);
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

async function auditNextConfig(issues, recommendations) {
  console.log('🔧 Auditing Next.js Configuration...\n');

  try {
    const configPath = path.join(process.cwd(), 'next.config.js');
    const configContent = await fs.readFile(configPath, 'utf8');

    const checks = [
      {
        test: /swcMinify\s*:\s*true/,
        name: 'SWC Minification',
        issue: 'SWC minification is not enabled',
        recommendation: 'Enable swcMinify: true for better performance',
      },
      {
        test: /compress\s*:\s*true/,
        name: 'Compression',
        issue: 'Response compression is not enabled',
        recommendation: 'Enable compress: true for smaller response sizes',
      },
      {
        test: /experimental/,
        name: 'Experimental Features',
        issue: null,
        recommendation:
          'Consider enabling experimental features for better performance',
      },
    ];

    for (const check of checks) {
      if (check.test.test(configContent)) {
        console.log(`  ✅ ${check.name} - Configured`);
      } else {
        console.log(`  ⚠️  ${check.name} - Not configured`);
        if (check.issue) issues.push(check.issue);
        if (check.recommendation) recommendations.push(check.recommendation);
      }
    }
  } catch (error) {
    console.log('  ❌ Could not read next.config.js');
    issues.push('Next.js configuration file not found or readable');
  }

  console.log('');
}

async function auditBundleSize(issues, recommendations) {
  console.log('📦 Auditing Bundle Size...\n');

  try {
    const buildDir = path.join(process.cwd(), '.next');
    const stats = await fs.stat(buildDir).catch(() => null);

    if (!stats) {
      console.log('  ⚠️  No build directory found. Run `npm run build` first.');
      recommendations.push('Run production build to analyze bundle size');
      return;
    }

    // Check for large dependencies
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    const heavyDeps = [
      '@nextui-org/react',
      'framer-motion',
      'lodash',
      'googleapis',
      'twilio',
    ];

    console.log('  🔍 Checking for heavy dependencies:');
    for (const dep of heavyDeps) {
      if (packageJson.dependencies[dep]) {
        console.log(`    📚 ${dep} - Consider tree-shaking or dynamic imports`);
        recommendations.push(
          `Consider dynamic imports for ${dep} to reduce initial bundle size`
        );
      }
    }

    // Check for duplicates
    const duplicates = ['react', 'react-dom', 'next', '@types/react'];

    console.log('  🔄 Checking for potential duplicates:');
    for (const dep of duplicates) {
      if (packageJson.dependencies[dep] && packageJson.devDependencies[dep]) {
        console.log(
          `    ⚠️  ${dep} - Found in both dependencies and devDependencies`
        );
        issues.push(`Duplicate dependency: ${dep}`);
      }
    }
  } catch (error) {
    console.log('  ❌ Bundle size audit failed:', error.message);
  }

  console.log('');
}

async function auditComponents(issues, recommendations) {
  console.log('⚛️  Auditing React Components...\n');

  const componentsDir = path.join(process.cwd(), 'components');

  try {
    const files = await getComponentFiles(componentsDir);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');

      // Check for common performance issues
      const fileName = path.basename(file);

      // Check for missing React.memo
      if (
        content.includes('export default function') &&
        !content.includes('memo(')
      ) {
        recommendations.push(
          `Consider using React.memo for ${fileName} if it renders frequently`
        );
      }

      // Check for inline functions in JSX
      const inlineFunctions = (
        content.match(/\s+\w+={() => |onclick={() => /g) || []
      ).length;
      if (inlineFunctions > 3) {
        issues.push(
          `${fileName} has ${inlineFunctions} inline functions that may cause re-renders`
        );
      }

      // Check for large components (>500 lines)
      const lineCount = content.split('\n').length;
      if (lineCount > 500) {
        recommendations.push(
          `${fileName} is large (${lineCount} lines) - consider splitting`
        );
      }
    }

    console.log(`  ✅ Analyzed ${files.length} component files`);
  } catch (error) {
    console.log('  ❌ Component audit failed:', error.message);
  }

  console.log('');
}

async function auditDatabaseQueries(issues, recommendations) {
  console.log('🗄️  Auditing Database Queries...\n');

  const apiDir = path.join(process.cwd(), 'app', 'api');

  try {
    const apiFiles = await getJSFiles(apiDir);

    let queryCount = 0;
    let optimizedQueries = 0;

    for (const file of apiFiles) {
      const content = await fs.readFile(file, 'utf8');

      // Count database queries
      const queries =
        content.match(
          /\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(/g
        ) || [];
      queryCount += queries.length;

      // Check for optimizations
      if (content.includes('.select(') && !content.includes('*')) {
        optimizedQueries++;
      }

      // Check for missing pagination
      if (
        content.includes('.select(') &&
        !content.includes('.range(') &&
        !content.includes('.limit(')
      ) {
        const fileName = path.basename(file);
        issues.push(`${fileName} may be missing pagination`);
      }

      // Check for N+1 queries
      if (content.includes('for ') && content.includes('.select(')) {
        const fileName = path.basename(file);
        recommendations.push(
          `${fileName} may have N+1 query issues - consider batch operations`
        );
      }
    }

    console.log(
      `  📊 Found ${queryCount} database queries in ${apiFiles.length} files`
    );
    console.log(
      `  ✅ ${optimizedQueries} queries appear to select specific columns`
    );
  } catch (error) {
    console.log('  ❌ Database audit failed:', error.message);
  }

  console.log('');
}

async function auditAPIRoutes(issues, recommendations) {
  console.log('🛣️  Auditing API Routes...\n');

  const apiDir = path.join(process.cwd(), 'app', 'api');

  try {
    const routeFiles = await getRouteFiles(apiDir);

    for (const file of routeFiles) {
      const content = await fs.readFile(file, 'utf8');
      const fileName = path.relative(process.cwd(), file);

      // Check for caching headers
      if (!content.includes('Cache-Control')) {
        recommendations.push(
          `${fileName} - Consider adding Cache-Control headers`
        );
      }

      // Check for input validation
      if (!content.includes('zod') && !content.includes('.parse(')) {
        recommendations.push(`${fileName} - Consider adding input validation`);
      }

      // Check for error handling
      if (!content.includes('try {') || !content.includes('catch')) {
        issues.push(`${fileName} - Missing proper error handling`);
      }

      // Check for rate limiting
      if (content.includes('POST') || content.includes('PUT')) {
        if (!content.includes('rate') && !content.includes('limit')) {
          recommendations.push(
            `${fileName} - Consider rate limiting for write operations`
          );
        }
      }
    }

    console.log(`  ✅ Analyzed ${routeFiles.length} API route files`);
  } catch (error) {
    console.log('  ❌ API routes audit failed:', error.message);
  }

  console.log('');
}

async function generateReport(issues, recommendations) {
  console.log('📊 Performance Audit Report');
  console.log('='.repeat(50));

  const timestamp = new Date().toISOString();

  console.log(`\n🔴 Issues Found (${issues.length}):`);
  if (issues.length === 0) {
    console.log('  ✅ No critical issues found!');
  } else {
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  console.log(`\n💡 Recommendations (${recommendations.length}):`);
  if (recommendations.length === 0) {
    console.log('  ✅ No recommendations - your app is well optimized!');
  } else {
    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  // Save report to file
  const report = {
    timestamp,
    issues,
    recommendations,
    summary: {
      totalIssues: issues.length,
      totalRecommendations: recommendations.length,
      auditScore: Math.max(
        0,
        100 - issues.length * 10 - recommendations.length * 2
      ),
    },
  };

  const reportPath = path.join(process.cwd(), 'performance-audit-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log(`🎯 Overall Performance Score: ${report.summary.auditScore}/100`);

  if (report.summary.auditScore >= 80) {
    console.log('🎉 Great job! Your app is well optimized.');
  } else if (report.summary.auditScore >= 60) {
    console.log('⚠️  Good foundation, but there are areas for improvement.');
  } else {
    console.log('🚨 Significant performance improvements needed.');
  }
}

// Helper functions
async function getComponentFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir).catch(() => {}); // Ignore if directory doesn't exist
  return files;
}

async function getJSFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir).catch(() => {});
  return files;
}

async function getRouteFiles(dir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        files.push(fullPath);
      }
    }
  }

  await walk(dir).catch(() => {});
  return files;
}

// Run the audit
performanceAudit().catch(console.error);
