// camera-roll.d.ts
declare module '@react-native-camera-roll/camera-roll' {
  export function getPhotos(params: {
    first: number;
    assetType?: 'All' | 'Photos' | 'Videos';
  }): Promise<{
    edges: {
      node: {
        image: { uri: string };
      };
    }[];
  }>;
}
