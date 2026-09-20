import type {LinkingOptions} from '@react-navigation/native';
import type {RootStackParamList} from '../navigation/RootNavigator';

export const COMMUNITY_LINK_PREFIXES = ['touch://', 'https://touch.app', 'https://www.touch.app'];

export function buildCommunityPostDeepLink(communityId: string, contentId: string) {
  const c = encodeURIComponent(String(communityId));
  const p = encodeURIComponent(String(contentId));
  return `touch://community/${c}/post/${p}`;
}

export function buildCommunityHomeDeepLink(communityId: string) {
  const c = encodeURIComponent(String(communityId));
  return `touch://community/${c}`;
}

export function buildPublicPostShareMessage(communityName: string, communityId: string, contentId: string) {
  const link = buildCommunityPostDeepLink(communityId, contentId);
  return `${communityName} | anonymous post on Touch\n${link}`;
}

export const communityLinking: LinkingOptions<RootStackParamList> = {
  prefixes: COMMUNITY_LINK_PREFIXES,
  config: {
    screens: {
      Auth: 'auth',
      ProfileSetup: 'profile-setup',
      Main: {
        screens: {
          MainTabs: {
            screens: {
              ChatTab: {
                path: 'community',
                screens: {
                  CommunityBrowse: '',
                  CommunityHome: ':communityId',
                  CommunityPost: ':communityId/post/:contentId',
                  CommunityCreate: 'create',
                  CommunityCompose: ':communityId/compose',
                  CommunityQueue: ':communityId/queue',
                  CommunityManage: ':communityId/manage',
                  CommunityInvite: ':communityId/invite',
                },
              },
              Home: 'home',
              SearchBar: 'search',
              Reels: 'reels',
              ProfileTab: 'profile',
            },
          },
        },
      },
    },
  },
};
