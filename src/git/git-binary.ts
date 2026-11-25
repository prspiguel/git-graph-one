// Resolved path to the git executable used for every spawned git process.
//
// Defaults to `'git'` (looked up on PATH). When git is not on PATH — common on
// Windows with portable/MSYS2 installs — the extension host resolves the
// VS Code `git.path` setting (or the built-in git extension's resolved path)
// during activation and stores it here so all spawn sites pick it up. See #18.
//
// This module is intentionally free of any `vscode` import so GitService and
// the other git callers stay unit-testable. The vscode-aware resolution lives
// in the extension entry point, which calls `setGitBinaryPath`.

let gitBinaryPath = 'git';

/** The git executable to spawn. */
export function getGitBinaryPath(): string {
  return gitBinaryPath;
}

/**
 * Set the git executable path. A nullish or blank value resets to the default
 * PATH lookup (`'git'`).
 */
export function setGitBinaryPath(p: string | undefined | null): void {
  gitBinaryPath = p && p.trim() ? p : 'git';
}

// Restricted mode is set by the extension entry point when the workspace is not
// trusted. A repository's own config (e.g. `core.fsmonitor`) can name a program
// that git runs on every `status`, so restricted mode disables it.
let restrictedMode = false;

/** Whether git runs with repository-controlled program hooks disabled. */
export function isGitRestrictedMode(): boolean {
  return restrictedMode;
}

/** Enable or disable restricted mode (untrusted workspace). */
export function setGitRestrictedMode(on: boolean): void {
  restrictedMode = on;
}

/**
 * Extra `-c` overrides prepended to every git invocation when running in an
 * untrusted workspace, so repository-controlled `.git/config` entries cannot
 * execute arbitrary programs (fsmonitor, hooks, sshCommand, gpg, diff drivers,
 * credential helpers, proxies).
 */
export function getRestrictedGitArgs(): string[] {
  if (!restrictedMode) return [];
  const nullDev = process.platform === 'win32' ? 'NUL' : '/dev/null';
  return [
    '-c', 'core.fsmonitor=false',
    '-c', `core.hooksPath=${nullDev}`,
    '-c', 'core.sshCommand=false',
    '-c', 'core.gitProxy=',
    '-c', 'credential.helper=',
    '-c', 'diff.external=',
    '-c', 'gpg.program=false',
    '-c', 'gpg.openpgp.program=false',
    '-c', 'gpg.ssh.program=false',
    '-c', 'gpg.x509.program=false',
  ];
}
