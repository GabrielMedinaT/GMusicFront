declare module 'jsmediatags' {
    interface PictureType {
      data: Uint8Array;
      format: string;
    }
  
    interface Tags {
      picture?: PictureType;
      title?: string;
      artist?: string;
      album?: string;
    }
  
    interface TagResult {
      tags: Tags;
    }
  
    interface Error {
      type: string;
      info: string;
    }
  
    const jsmediatags: {
      read: (
        file: File,
        callbacks: {
          onSuccess: (result: TagResult) => void;
          onError: (error: Error) => void;
        }
      ) => void;
    };
  
    export default jsmediatags;
  }