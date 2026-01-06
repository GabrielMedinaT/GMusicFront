declare interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite";
}

declare interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;

  queryPermission(
    desc?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState>;

  requestPermission(
    desc?: FileSystemHandlePermissionDescriptor
  ): Promise<PermissionState>;
}

declare interface FileSystemFileHandle extends FileSystemHandle {
  kind: "file";
  getFile(): Promise<File>;
}

declare interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: "directory";

  entries(): AsyncIterable<[string, FileSystemHandle]>;
  values(): AsyncIterable<FileSystemHandle>;

  getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemDirectoryHandle>;

  getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemFileHandle>;
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

export {};
