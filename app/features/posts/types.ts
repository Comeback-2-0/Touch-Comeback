export type PublicPostAuthor = {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
};

export type PublicPostMedia = {
  type: 'image';
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
};

export type PublicPost = {
  id: string;
  author: PublicPostAuthor;
  text: string;
  media: PublicPostMedia[];
  visibility: 'public';
  status: 'active' | 'deleted';
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    savesCount: number;
    reportsCount: number;
  };
  viewerEngagement?: {
    liked: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type PostReportReason =
  | 'spam'
  | 'harassment'
  | 'hate'
  | 'sexual_content'
  | 'violence'
  | 'scam'
  | 'misleading'
  | 'other';

export type ReportPostPayload = {
  reason: PostReportReason;
  details?: string;
};

export type PostModerationState = {
  isFlagged: boolean;
  reviewStatus: 'none' | 'pending' | 'approved' | 'rejected';
};

export type PostReportResponse = {
  reported: boolean;
  status: 'open' | 'withdrawn';
  reportsCount: number;
  moderation: PostModerationState;
};

export type PostHiddenResponse = {
  hidden: boolean;
};

export type PostEngagementStatus = {
  liked: boolean;
  likesCount: number;
};

export type LocalPostImage = {
  uri: string;
  fileName?: string;
  type?: string;
};

export type CreatePostPayload = {
  text: string;
  images?: LocalPostImage[];
};

export type PostsPage = {
  posts: PublicPost[];
  nextCursor: string | null;
};

export type PostsQueryParams = {
  limit?: number;
  cursor?: string;
};
