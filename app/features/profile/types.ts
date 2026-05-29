export type Profile = {
  id: string;
  username: string;
  bio: string;
  profilePicture: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isProfileComplete: boolean;
};

export type ProfileImageUpload = {
  url: string;
  publicId: string;
};

export type LocalProfileImage = {
  uri: string;
  fileName?: string;
  type?: string;
};

export type ProfilePayload = {
  username?: string;
  bio?: string;
  isPrivate?: boolean;
  profilePicture?: string;
  profilePicturePublicId?: string;
};
