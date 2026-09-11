import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Run a webcmd command and parse JSON output.
 * @param {string} command - webcmd command (without 'webcmd' prefix).
 * @returns {Promise<any>} Parsed JSON result.
 */
export async function runWebcmd(command) {
  const fullCommand = `webcmd ${command} -f json`;
  const { stdout, stderr } = await execAsync(fullCommand, {
    timeout: 40000, // 40s timeout per command
    env: process.env
  });

  if (stderr && !stderr.includes('Deprecation')) {
    console.warn('webcmd stderr:', stderr);
  }

  try {
    return JSON.parse(stdout);
  } catch {
    // Some webcmd outputs may not be pure JSON; return raw text if needed.
    return { raw: stdout };
  }
}

/**
 * Create a new browser session.
 * @returns {Promise<string>} sessionId
 */
export async function createSession() {
  const result = await runWebcmd('session create');
  // Expected shape: { session: "session_abc123" } or similar.
  return result.session || result.sessionId || result.id;
}

/**
 * Navigate to a URL in a given session.
 * @param {string} sessionId
 * @param {string} url
 */
export async function navigateTo(sessionId, url) {
  await runWebcmd(`session run --session ${sessionId} --command "navigate ${url}"`);
}

/**
 * Get page content / snapshot for a session.
 * @param {string} sessionId
 * @returns {Promise<any>}
 */
export async function getPageSnapshot(sessionId) {
  // Adjust command based on actual webcmd CLI docs.
  // Common pattern: session run with a "snapshot" or "extract" command.
  const result = await runWebcmd(
    `session run --session ${sessionId} --command "snapshot"`
  );
  return result;
}

/**
 * Click on an element by text/role hint.
 * @param {string} sessionId
 * @param {string} hint - e.g. "Product details", "Ingredients"
 */
export async function clickByText(sessionId, hint) {
  await runWebcmd(
    `session run --session ${sessionId} --command "click text:${hint}"`
  );
}

/**
 * End session.
 * @param {string} sessionId
 */
export async function endSession(sessionId) {
  await runWebcmd(`session end --session ${sessionId}`);
}