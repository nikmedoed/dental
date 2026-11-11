import { stripFinancialData } from "./dental-utils.js";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const dataMode = (import.meta.env.VITE_DATA_MODE || "local")
  .trim()
  .toLowerCase();

export const firebaseEnabled = Boolean(
  dataMode === "firebase" &&
  config.apiKey &&
  config.authDomain &&
  config.projectId &&
  config.appId,
);

let firebaseRuntime;

async function initializeFirebase() {
  if (!firebaseEnabled) return null;
  if (firebaseRuntime) return firebaseRuntime;

  firebaseRuntime = Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]).then(([appApi, authApi, firestoreApi]) => {
    const app = appApi.initializeApp(config);
    const auth = authApi.getAuth(app);
    const db = firestoreApi.getFirestore(app);
    firestoreApi.enableMultiTabIndexedDbPersistence(db).catch(() => {
      // Firestore still works when another tab owns persistence or the browser blocks it.
    });
    return { auth, db, authApi, firestoreApi };
  });

  return firebaseRuntime;
}

export function observeAuth(callback) {
  let cancelled = false;
  let unsubscribe = () => {};
  initializeFirebase().then((runtime) => {
    if (!runtime || cancelled) return;
    unsubscribe = runtime.authApi.onAuthStateChanged(runtime.auth, callback);
  });
  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function loginWithGoogle() {
  const runtime = await initializeFirebase();
  if (!runtime) return;
  const provider = new runtime.authApi.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const mobile = matchMedia("(max-width: 700px)").matches;
  return mobile
    ? runtime.authApi.signInWithRedirect(runtime.auth, provider)
    : runtime.authApi.signInWithPopup(runtime.auth, provider);
}

export async function logout() {
  const runtime = await initializeFirebase();
  return runtime ? runtime.authApi.signOut(runtime.auth) : undefined;
}

export async function seedCloudIfEmpty(uid, fallbackEvents) {
  const runtime = await initializeFirebase();
  if (!runtime) return;
  const { db, firestoreApi: api } = runtime;
  const eventsRef = api.collection(db, "users", uid, "dentalEvents");
  const snapshot = await api.getDocs(eventsRef);
  if (!snapshot.empty || !fallbackEvents.length) return;
  const batch = api.writeBatch(db);
  fallbackEvents.forEach((event) =>
    batch.set(api.doc(db, "users", uid, "dentalEvents", event.id), event),
  );
  await batch.commit();
}

export function subscribeToEvents(uid, callback, onError = () => {}) {
  let cancelled = false;
  let unsubscribe = () => {};
  initializeFirebase().then((runtime) => {
    if (!runtime || cancelled) return;
    const { db, firestoreApi: api } = runtime;
    unsubscribe = api.onSnapshot(
      api.collection(db, "users", uid, "dentalEvents"),
      (snapshot) => {
        const events = snapshot.docs.map((item) => item.data());
        callback(events);
      },
      onError,
    );
  });
  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function saveCloudEvent(uid, event) {
  const runtime = await initializeFirebase();
  if (!runtime || !uid) return;
  const { db, firestoreApi: api } = runtime;
  await api.setDoc(api.doc(db, "users", uid, "dentalEvents", event.id), event);
}

export async function replaceCloudEvents(uid, events) {
  const runtime = await initializeFirebase();
  if (!runtime || !uid) return;
  const { db, firestoreApi: api } = runtime;
  const existing = await api.getDocs(
    api.collection(db, "users", uid, "dentalEvents"),
  );
  const batch = api.writeBatch(db);
  existing.docs.forEach((item) => batch.delete(item.ref));
  events.forEach((event) =>
    batch.set(api.doc(db, "users", uid, "dentalEvents", event.id), event),
  );
  await batch.commit();
}

function directoriesRef(runtime, uid) {
  return runtime.firestoreApi.doc(
    runtime.db,
    "users",
    uid,
    "settings",
    "directories",
  );
}

export async function seedDirectoriesIfEmpty(uid, directories) {
  const runtime = await initializeFirebase();
  if (!runtime || !uid) return;
  const reference = directoriesRef(runtime, uid);
  const snapshot = await runtime.firestoreApi.getDoc(reference);
  if (!snapshot.exists()) {
    await runtime.firestoreApi.setDoc(reference, directories);
  }
}

export function subscribeToDirectories(uid, callback, onError = () => {}) {
  let cancelled = false;
  let unsubscribe = () => {};
  initializeFirebase().then((runtime) => {
    if (!runtime || cancelled) return;
    unsubscribe = runtime.firestoreApi.onSnapshot(
      directoriesRef(runtime, uid),
      (snapshot) => snapshot.exists() && callback(snapshot.data()),
      onError,
    );
  });
  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function saveCloudDirectories(uid, directories) {
  const runtime = await initializeFirebase();
  if (!runtime || !uid) return;
  await runtime.firestoreApi.setDoc(directoriesRef(runtime, uid), directories);
}

export async function createPublicShare(uid, events, durationDays) {
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 18);
  const expiresAt = Date.now() + Number(durationDays) * 86_400_000;
  const doctorSafeEvents = events.map(stripFinancialData);
  const payload = {
    ownerId: uid || "local",
    createdAt: Date.now(),
    expiresAt,
    events: doctorSafeEvents,
  };
  const runtime = await initializeFirebase();
  if (runtime && uid) {
    const { db, firestoreApi: api } = runtime;
    await api.setDoc(api.doc(db, "publicShares", token), payload);
  } else {
    localStorage.setItem(`denta-share-${token}`, JSON.stringify(payload));
  }
  return { token, expiresAt };
}

export async function readPublicShare(token) {
  let payload = null;
  const runtime = await initializeFirebase();
  if (runtime) {
    const { db, firestoreApi: api } = runtime;
    const snapshot = await api.getDoc(api.doc(db, "publicShares", token));
    if (snapshot.exists()) payload = snapshot.data();
  } else {
    try {
      payload = JSON.parse(localStorage.getItem(`denta-share-${token}`));
    } catch {}
  }
  if (!payload || payload.expiresAt < Date.now()) return null;
  return payload;
}
