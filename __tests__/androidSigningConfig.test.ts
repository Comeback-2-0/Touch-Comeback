import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');

const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Android release signing config', () => {
  it('does not hardcode release keystore secrets in build.gradle', () => {
    const buildGradle = read('android/app/build.gradle');
    const releaseSigningBlock = buildGradle.match(
      /release\s*\{[\s\S]*?keyPassword getSigningProperty\("TOUCH_UPLOAD_KEY_PASSWORD"\)[\s\S]*?\n\s*\}/,
    )?.[0];

    expect(buildGradle).toContain('getSigningProperty');
    expect(buildGradle).toContain('TOUCH_UPLOAD_STORE_FILE');
    expect(buildGradle).toContain('TOUCH_UPLOAD_STORE_PASSWORD');
    expect(buildGradle).toContain('TOUCH_UPLOAD_KEY_ALIAS');
    expect(buildGradle).toContain('TOUCH_UPLOAD_KEY_PASSWORD');
    expect(releaseSigningBlock).toBeTruthy();
    expect(releaseSigningBlock).not.toContain("storePassword '");
    expect(releaseSigningBlock).not.toContain("keyPassword '");
    expect(releaseSigningBlock).not.toContain('D:\\\\IJ Roy\\\\Keystores');
  });
});
