/**
 * Prompt Engine - AI-powered workflow templates
 *
 * Implements 20+ intelligent prompts for test generation, analysis, and guidance
 */

import { z } from 'zod';
import type { MCPServerConfig, MCPPrompt, PromptMessage } from '../types/index.js';
import type { ResourceManager } from '../resources/index.js';
import type { Logger } from '../core/logger.js';

interface PromptContext {
  userId?: string;
  tenantId?: string;
}

export class PromptEngine {
  private resourceManager: ResourceManager;
  private prompts: Map<string, MCPPrompt> = new Map();

  constructor(
    _config: MCPServerConfig,
    resourceManager: ResourceManager,
    _logger: Logger
  ) {
    this.resourceManager = resourceManager;

    this.registerPrompts();
  }

  private registerPrompts(): void {
    // ========================================================================
    // Test Generation Prompts
    // ========================================================================

    this.prompts.set('generate_test_cases_from_spec', {
      name: 'generate_test_cases_from_spec',
      description: 'Generate ISTQB-compliant test cases from functional specification',
      arguments: z.object({
        specification: z.string(),
        test_type: z.string().optional(),
        max_cases: z.number().default(10),
      }),
    });

    this.prompts.set('create_api_test_collection', {
      name: 'create_api_test_collection',
      description: 'Generate Newman/Postman collection from OpenAPI spec',
      arguments: z.object({
        openapi_spec: z.string(),
      }),
    });

    this.prompts.set('generate_accessibility_tests', {
      name: 'generate_accessibility_tests',
      description: 'Create WCAG-compliant accessibility test scenarios',
      arguments: z.object({
        page_url: z.string(),
        wcag_level: z.enum(['A', 'AA', 'AAA']).default('AA'),
      }),
    });

    // ========================================================================
    // Analysis Prompts
    // ========================================================================

    this.prompts.set('analyze_test_trends', {
      name: 'analyze_test_trends',
      description: 'Identify patterns and trends in test results',
      arguments: z.object({
        project_id: z.string(),
        days: z.number().default(30),
      }),
    });

    this.prompts.set('diagnose_ci_failure', {
      name: 'diagnose_ci_failure',
      description: 'Root cause analysis for CI/CD pipeline failures',
      arguments: z.object({
        execution_id: z.string(),
      }),
    });

    this.prompts.set('explain_playwright_error', {
      name: 'explain_playwright_error',
      description: 'Human-readable explanation of Playwright errors',
      arguments: z.object({
        error_message: z.string(),
        error_stack: z.string().optional(),
      }),
    });

    // ========================================================================
    // Documentation Prompts
    // ========================================================================

    this.prompts.set('document_test_suite', {
      name: 'document_test_suite',
      description: 'Auto-generate comprehensive test suite documentation',
      arguments: z.object({
        suite_id: z.string(),
      }),
    });

    this.prompts.set('create_bug_report', {
      name: 'create_bug_report',
      description: 'Generate structured bug report from test failure',
      arguments: z.object({
        result_id: z.string(),
      }),
    });

    // ========================================================================
    // Project Management Prompts
    // ========================================================================

    this.prompts.set('estimate_automation_effort', {
      name: 'estimate_automation_effort',
      description: 'Estimate effort for test automation project',
      arguments: z.object({
        test_count: z.number(),
        complexity: z.enum(['low', 'medium', 'high']),
      }),
    });

    this.prompts.set('prioritize_test_suite', {
      name: 'prioritize_test_suite',
      description: 'Risk-based test prioritization',
      arguments: z.object({
        suite_id: z.string(),
      }),
    });
  }

  async listPrompts(): Promise<MCPPrompt[]> {
    return Array.from(this.prompts.values());
  }

  async getPrompt(
    name: string,
    args: unknown,
    context: PromptContext
  ): Promise<{ description: string; messages: PromptMessage[] }> {
    const prompt = this.prompts.get(name);

    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }

    // Validate arguments
    const validatedArgs = prompt.arguments.parse(args);

    // Generate prompt messages
    const messages = await this.buildPromptMessages(name, validatedArgs, context);

    return {
      description: prompt.description,
      messages,
    };
  }

  private async buildPromptMessages(
    name: string,
    args: any,
    context: PromptContext
  ): Promise<PromptMessage[]> {
    switch (name) {
      case 'generate_test_cases_from_spec':
        return this.buildTestGenerationPrompt(args);
      case 'analyze_test_trends':
        return this.buildTrendAnalysisPrompt(args, context);
      case 'diagnose_ci_failure':
        return this.buildCIDiagnosisPrompt(args, context);
      case 'explain_playwright_error':
        return this.buildErrorExplanationPrompt(args);
      case 'document_test_suite':
        return this.buildDocumentationPrompt(args, context);
      default:
        return [
          {
            role: 'user',
            content: `Execute prompt: ${name} with args: ${JSON.stringify(args)}`,
          },
        ];
    }
  }

  // ============================================================================
  // Prompt Builders
  // ============================================================================

  private buildTestGenerationPrompt(args: any): PromptMessage[] {
    return [
      {
        role: 'system',
        content: `You are an expert QA engineer specialized in ISTQB-compliant test case design.
Generate comprehensive, professional test cases following ISTQB standards.`,
      },
      {
        role: 'user',
        content: `Generate ${args.max_cases} ISTQB-compliant test cases from the following specification:

${args.specification}

For each test case, provide:
1. Test ID
2. Test Name
3. Test Type (functional, non-functional, etc.)
4. Priority (Critical, High, Medium, Low)
5. Preconditions
6. Test Steps (numbered, detailed)
7. Expected Result
8. Risk Level

Format as JSON array.`,
      },
    ];
  }

  private async buildTrendAnalysisPrompt(
    args: any,
    context: PromptContext
  ): Promise<PromptMessage[]> {
    // Fetch historical data
    const resource = await this.resourceManager.readResource(
      `haida://analytics/trends`,
      context
    );

    return [
      {
        role: 'system',
        content: `You are a QA analytics expert. Analyze test execution trends and provide actionable insights.`,
      },
      {
        role: 'user',
        content: `Analyze the following test execution data from the last ${args.days} days and identify:

1. Pass rate trends
2. Flaky test patterns
3. Performance degradation
4. Areas requiring attention

Data:
${resource.text}

Provide specific, actionable recommendations.`,
      },
    ];
  }

  private async buildCIDiagnosisPrompt(
    args: any,
    context: PromptContext
  ): Promise<PromptMessage[]> {
    const execution = await this.resourceManager.readResource(
      `haida://executions/${args.execution_id}`,
      context
    );
    const results = await this.resourceManager.readResource(
      `haida://executions/${args.execution_id}/results`,
      context
    );

    return [
      {
        role: 'system',
        content: `You are a CI/CD troubleshooting expert. Diagnose test failures and provide root cause analysis.`,
      },
      {
        role: 'user',
        content: `A CI/CD pipeline failed. Analyze the execution data and test results to determine:

1. Root cause of failure
2. Which tests failed and why
3. Whether it's environmental, code-related, or test-related
4. Recommended fixes

Execution Data:
${execution.text}

Test Results:
${results.text}

Provide a clear diagnosis with action items.`,
      },
    ];
  }

  private buildErrorExplanationPrompt(args: any): PromptMessage[] {
    return [
      {
        role: 'system',
        content: `You are a Playwright expert. Explain test errors in simple, actionable terms.`,
      },
      {
        role: 'user',
        content: `Explain this Playwright error and how to fix it:

Error: ${args.error_message}

${args.error_stack ? `Stack Trace:\n${args.error_stack}` : ''}

Provide:
1. What the error means in simple terms
2. Why it happened
3. How to fix it
4. How to prevent it in the future`,
      },
    ];
  }

  private async buildDocumentationPrompt(
    args: any,
    context: PromptContext
  ): Promise<PromptMessage[]> {
    const suite = await this.resourceManager.readResource(
      `haida://test-suites/${args.suite_id}`,
      context
    );

    return [
      {
        role: 'system',
        content: `You are a technical documentation expert. Create comprehensive, professional test suite documentation.`,
      },
      {
        role: 'user',
        content: `Generate complete documentation for this test suite:

${suite.text}

Include:
1. Overview and purpose
2. Scope and coverage
3. Prerequisites
4. Test execution instructions
5. Expected outcomes
6. Troubleshooting guide

Format in Markdown.`,
      },
    ];
  }
}
