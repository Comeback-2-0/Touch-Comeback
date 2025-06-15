// app/services/api.ts
const BASE_URL = 'https://api.comeback.website'; // your backend domain or localhost:3333 in development

export async function registerUser(userData: {
  name: string;
  email: string;
  photo: string;
  uid: string;
  fcmToken?: string; // optional for now
}) {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    return await res.json();
  } catch (err) {
    console.error('Error registering user:', err);
    throw err;
  }
}