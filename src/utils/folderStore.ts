// src/utils/folderStore.ts
// @ts-nocheck


const DB_NAME = "music-folder-db";
const STORE_NAME = "handles";
const KEY = "music-folder";

function openDB(): Promise<IDBDatabase> {
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
}

export async function saveMusicFolderHandle(
  handle: FileSystemDirectoryHandle
) {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(handle, KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMusicFolderHandle(): Promise<
  FileSystemDirectoryHandle | null
> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY);

    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function verifyReadPermission(
  handle: FileSystemDirectoryHandle
): Promise<boolean> {
  // TypeScript NO garantiza que existan → se comprueba en runtime
  if (
  
    typeof handle.queryPermission !== "function" ||
    typeof handle.requestPermission !== "function"
  ) {
    return true; // navegadores que no lo implementan
  }

  const opts = { mode: "read" } as const;

  const permission = await handle.queryPermission(opts);
  if (permission === "granted") return true;

  const request = await handle.requestPermission(opts);
  return request === "granted";
}
