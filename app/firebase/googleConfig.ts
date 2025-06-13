import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../constants/keys';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '160562514921-og2gdrlck0vsi2miesmg2ugci2ca0562.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};