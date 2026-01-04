const DB_NAME = "gmusic-db";
const STORE_NAME = "handles";
const KEY = "music-folder";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveMusicFolderHandle = async (
  handle: FileSystemDirectoryHandle
): Promise<void> => {
  const db = await openDB();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const req = store.put(handle, KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const getMusicFolderHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
  const db = await openDB();

  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const req = store.get(KEY);
    req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) ?? null);
    req.onerror = () => reject(req.error);
  });
};

export const verifyReadPermission = async (
  handle: FileSystemDirectoryHandle
): Promise<boolean> => {
  const opts: FileSystemHandlePermissionDescriptor = { mode: "read" };

  const q = await handle.queryPermission(opts);
  if (q === "granted") return true;

  const r = await handle.requestPermission(opts);
  return r === "granted";
};
