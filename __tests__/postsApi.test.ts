import {
  createPost,
  fetchHomeFeed,
  fetchUserPosts,
} from '../app/features/posts/api/postsApi';
import {api} from '../app/utils/api';

jest.mock('../app/utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApi = jest.mocked(api);

describe('postsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a public text-only post as multipart form data', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {post: {id: 'p1', text: 'Hello Touch', media: []}},
    });

    await expect(createPost({text: 'Hello Touch'})).resolves.toEqual({
      id: 'p1',
      text: 'Hello Touch',
      media: [],
    });

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/posts',
      expect.any(FormData),
      expect.objectContaining({
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: undefined,
      }),
    );
  });

  it('creates a public multi-image post with upload progress', async () => {
    const onUploadProgress = jest.fn();
    mockedApi.post.mockResolvedValueOnce({
      data: {post: {id: 'p2', text: '', media: [{url: 'https://cdn.example.com/post.jpg'}]}},
    });

    await createPost(
      {
        text: '',
        images: [
          {
            uri: 'file:///post-1.jpg',
            fileName: 'post-1.jpg',
            type: 'image/jpeg',
          },
          {
            uri: 'file:///post-2.jpg',
            fileName: 'post-2.jpg',
            type: 'image/jpeg',
          },
        ],
      },
      onUploadProgress,
    );

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/posts',
      expect.any(FormData),
      expect.objectContaining({
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress,
      }),
    );
  });

  it('fetches home feed and author posts with cursor pagination params', async () => {
    mockedApi.get.mockResolvedValueOnce({data: {posts: [], nextCursor: null}});
    mockedApi.get.mockResolvedValueOnce({data: {posts: [{id: 'p1'}], nextCursor: 'next'}});

    await expect(fetchHomeFeed({limit: 10, cursor: 'cursor-1'})).resolves.toEqual({
      posts: [],
      nextCursor: null,
    });
    await expect(fetchUserPosts('u1', {limit: 12})).resolves.toEqual({
      posts: [{id: 'p1'}],
      nextCursor: 'next',
    });

    expect(mockedApi.get).toHaveBeenNthCalledWith(1, '/posts/feed', {
      params: {limit: 10, cursor: 'cursor-1'},
    });
    expect(mockedApi.get).toHaveBeenNthCalledWith(2, '/posts/user/u1', {
      params: {limit: 12, cursor: undefined},
    });
  });
});
