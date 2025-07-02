declare module '@react-native-oh-tpl/react-native-ffmpeg-kit' {
  export const FFmpegKit: {
    execute: (command: string) => Promise<any>;
  };
}
