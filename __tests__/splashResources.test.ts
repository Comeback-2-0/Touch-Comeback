import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');

const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('native splash resources', () => {
  it('uses app-colored light Android navigation bars so system buttons remain readable', () => {
    const styles = read('android/app/src/main/res/values/styles.xml');
    const colors = read('android/app/src/main/res/values/colors.xml');

    expect(styles).toContain('<item name="android:statusBarColor">@android:color/transparent</item>');
    expect(styles).toContain('<item name="android:navigationBarColor">@color/touch_bottom_bar</item>');
    expect(styles).toContain('<item name="android:windowLightStatusBar">true</item>');
    expect(styles).toContain('<item name="android:windowLightNavigationBar">true</item>');
    expect(colors).toContain('<color name="touch_bottom_bar">#FFC0CB</color>');
  });

  it('uses the current app launcher icon instead of the old splash logo', () => {
    const splashDrawable = read(
      'android/app/src/main/res/drawable/splash_screen.xml',
    );

    expect(splashDrawable).toContain('@mipmap/ic_launcher');
    expect(splashDrawable).not.toContain('@drawable/splash_logo');
  });

  it('shows IJ Roy credit with a love icon and no comeback branding on Android', () => {
    const launchScreen = read('android/app/src/main/res/layout/launch_screen.xml');
    const strings = read('android/app/src/main/res/values/strings.xml');

    expect(launchScreen).toContain('@mipmap/ic_launcher');
    expect(launchScreen).toContain('@drawable/splash_icon_background');
    expect(launchScreen).toContain('android:clipToOutline="true"');
    expect(launchScreen).not.toContain('@string/splash_tagline');
    expect(launchScreen).toContain('@drawable/ic_love');
    expect(launchScreen).toContain('@string/splash_made_with');
    expect(launchScreen).toContain('@string/splash_by');
    expect(launchScreen).toContain('@string/splash_creator_name');
    expect(strings).not.toContain('scroll moodly, chat ghostly');
    expect(strings).toContain('Made with');
    expect(strings).toContain('<string name="splash_by">by</string>');
    expect(strings).toContain('<string name="splash_creator_name">IJ Roy</string>');
    expect(launchScreen.toLowerCase()).not.toContain('comeback');
    expect(strings.toLowerCase()).not.toContain('comeback');
  });

  it('shows IJ Roy credit and removes default branding on iOS', () => {
    const storyboard = read('ios/Touch/LaunchScreen.storyboard');

    expect(storyboard).toContain('Touch');
    expect(storyboard).toContain('cornerRadius');
    expect(storyboard).not.toContain('scroll moodly, chat ghostly');
    expect(storyboard).toContain('Made with');
    expect(storyboard).toContain('text="by"');
    expect(storyboard).toContain('text="IJ Roy"');
    expect(storyboard).not.toContain('Powered by React Native');
    expect(storyboard.toLowerCase()).not.toContain('comeback');
  });
});
