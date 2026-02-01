/**
 * ai-prompt-test - Unit testing for prompts
 */

export interface PromptTest { name: string; prompt: string; variables?: Record<string, string>; expect: { contains?: string[]; notContains?: string[]; maxLength?: number; } }
export interface TestResult { name: string; passed: boolean; errors: string[]; output?: string; }

export function interpolatePrompt(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}

export async function runPromptTests(tests: PromptTest[], llmFn: (prompt: string) => Promise<string>): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (const test of tests) {
    const prompt = interpolatePrompt(test.prompt, test.variables || {});
    const output = await llmFn(prompt);
    const errors: string[] = [];
    if (test.expect.contains) for (const s of test.expect.contains) if (!output.includes(s)) errors.push(`Missing: ${s}`);
    if (test.expect.notContains) for (const s of test.expect.notContains) if (output.includes(s)) errors.push(`Found: ${s}`);
    if (test.expect.maxLength && output.length > test.expect.maxLength) errors.push(`Too long: ${output.length} > ${test.expect.maxLength}`);
    results.push({ name: test.name, passed: errors.length === 0, errors, output });
  }
  return results;
}
