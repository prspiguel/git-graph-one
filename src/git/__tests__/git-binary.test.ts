import { describe, it, expect, afterEach } from 'vitest';
import { getGitBinaryPath, setGitBinaryPath, setGitRestrictedMode, isGitRestrictedMode, getRestrictedGitArgs } from '../git-binary';

describe('git-binary', () => {
  afterEach(() => {
    setGitBinaryPath('git'); // reset shared module state
    setGitRestrictedMode(false);
  });

  it("defaults to 'git'", () => {
    expect(getGitBinaryPath()).toBe('git');
  });

  it('stores an explicit path', () => {
    setGitBinaryPath('/usr/local/bin/git');
    expect(getGitBinaryPath()).toBe('/usr/local/bin/git');
  });

  it('keeps a Windows-style path verbatim', () => {
    setGitBinaryPath('D:/app/msys64/mingw64/bin/git.exe');
    expect(getGitBinaryPath()).toBe('D:/app/msys64/mingw64/bin/git.exe');
  });

  it.each([undefined, null, '', '   '])('resets to "git" for %p', (value) => {
    setGitBinaryPath('/custom/git');
    setGitBinaryPath(value as string | undefined | null);
    expect(getGitBinaryPath()).toBe('git');
  });

  it('returns empty restricted args when unrestricted and disables executable git config keys when restricted', () => {
    expect(isGitRestrictedMode()).toBe(false);
    expect(getRestrictedGitArgs()).toEqual([]);

    setGitRestrictedMode(true);
    expect(isGitRestrictedMode()).toBe(true);
    const args = getRestrictedGitArgs();
    expect(args).toContain('core.fsmonitor=false');
    expect(args).toContain('core.sshCommand=false');
    expect(args).toContain('gpg.program=false');
    expect(args).toContain('gpg.ssh.program=false');
    expect(args).toContain('diff.external=');
    expect(args).toContain('credential.helper=');
  });
});
