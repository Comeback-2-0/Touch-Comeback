import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const loginWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();

  const signInResponse: any = await GoogleSignin.signIn();

  const idToken = signInResponse?.idToken;
  if (!idToken) throw new Error('Google Sign-In failed: idToken missing');

  const credential = auth.GoogleAuthProvider.credential(idToken);
  const userCredential = await auth().signInWithCredential(credential);

  const firebaseUser = userCredential.user;
  const firebaseIdToken = await firebaseUser.getIdToken();

  return { firebaseUser, firebaseIdToken };
};