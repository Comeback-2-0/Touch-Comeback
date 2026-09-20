import {create} from 'zustand';

type BlockedState = {
  blockedIds: Record<string, true>;
  block: (communityId: string) => void;
  unblock: (communityId: string) => void;
  isBlocked: (communityId: string) => boolean;
};

/** Session-scoped safety list used after "Block this community". */
export const useBlockedCommunitiesStore = create<BlockedState>((set, get) => ({
  blockedIds: {},
  block: communityId => {
    const id = String(communityId || '').trim();
    if (!id) return;
    set(state => ({blockedIds: {...state.blockedIds, [id]: true}}));
  },
  unblock: communityId => {
    const id = String(communityId || '').trim();
    if (!id) return;
    set(state => {
      const next = {...state.blockedIds};
      delete next[id];
      return {blockedIds: next};
    });
  },
  isBlocked: communityId => Boolean(get().blockedIds[String(communityId || '')]),
}));
