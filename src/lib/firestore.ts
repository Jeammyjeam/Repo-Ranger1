'use client';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    Firestore,
    getDoc,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';
import type { Repository } from './types';

// Helper to create a sanitized object for saving to prevent storing overly large objects
const createRepoData = (repo: Repository) => ({
  id: repo.id,
  name: repo.name,
  full_name: repo.full_name,
  html_url: repo.html_url,
  description: repo.description,
  stargazers_count: repo.stargazers_count,
  forks_count: repo.forks_count,
  language: repo.language,
  updated_at: repo.updated_at,
  owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
      html_url: repo.owner.html_url,
  },
  topics: repo.topics || [],
});


// --- SAVING REPOS ---
export async function saveRepo(db: Firestore, userId: string, repo: Repository) {
  const repoRef = doc(db, 'users', userId, 'saved_repos', repo.id.toString());
  const dataToSave = {
    ...createRepoData(repo),
    savedAt: serverTimestamp()
  };
  await setDoc(repoRef, dataToSave);
}

export async function removeRepoFromAllCollections(db: Firestore, userId: string, repoId: number) {
  const collectionsQuery = query(collection(db, 'users', userId, 'collections'));
  const collectionsSnapshot = await getDocs(collectionsQuery);

  const removalPromises = collectionsSnapshot.docs.map(async (collectionDoc) => {
    const collectionId = collectionDoc.id;
    const itemRef = doc(db, 'users', userId, 'collections', collectionId, 'items', repoId.toString());

    await deleteDoc(itemRef);

    const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
    const collectionDocSnapshot = await getDoc(collectionRef);
    if (collectionDocSnapshot.exists()) {
      const currentCount = collectionDocSnapshot.data().itemCount || 0;
      await setDoc(collectionRef, { itemCount: Math.max(0, currentCount - 1), updatedAt: serverTimestamp() }, { merge: true });
    }
  });

  await Promise.all(removalPromises);
}

export async function unsaveRepo(db: Firestore, userId: string, repoId: number) {
  const repoRef = doc(db, 'users', userId, 'saved_repos', repoId.toString());
  await deleteDoc(repoRef);
  await removeRepoFromAllCollections(db, userId, repoId);
}

// --- COLLECTIONS ---
export async function createCollection(db: Firestore, userId: string, name: string, description?: string) {
  const collectionRef = doc(collection(db, 'users', userId, 'collections'));
  const dataToSave = {
    userId,
    name,
    description: description || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    itemCount: 0,
  };
  await setDoc(collectionRef, dataToSave);
  return collectionRef.id;
}

export async function deleteCollection(db: Firestore, userId: string, collectionId: string) {
  // Delete all items in the collection first
  const itemsQuery = query(collection(db, 'users', userId, 'collections', collectionId, 'items'));
  const itemsSnapshot = await getDocs(itemsQuery);
  const deletePromises = itemsSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // Delete the collection
  const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
  await deleteDoc(collectionRef);
}

export async function saveRepoToCollection(db: Firestore, userId: string, collectionId: string, repo: Repository) {
  const itemRef = doc(collection(db, 'users', userId, 'collections', collectionId, 'items'), repo.id.toString());
  const itemDoc = await getDoc(itemRef);
  const dataToSave = {
    id: repo.id.toString(),
    collectionId,
    userId,
    type: 'github',
    addedAt: serverTimestamp(),
    itemData: createRepoData(repo),
  };

  await setDoc(itemRef, dataToSave);

  // Update collection item count only when the item is new.
  if (!itemDoc.exists()) {
    const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
    const collectionDoc = await getDoc(collectionRef);
    if (collectionDoc.exists()) {
      const currentCount = collectionDoc.data().itemCount || 0;
      await setDoc(collectionRef, { itemCount: currentCount + 1, updatedAt: serverTimestamp() }, { merge: true });
    }
  }
}

export async function removeRepoFromCollection(db: Firestore, userId: string, collectionId: string, repoId: string) {
  const itemRef = doc(db, 'users', userId, 'collections', collectionId, 'items', repoId);
  const itemDoc = await getDoc(itemRef);
  if (itemDoc.exists()) {
    await deleteDoc(itemRef);

    const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
    const collectionDoc = await getDoc(collectionRef);
    if (collectionDoc.exists()) {
      const currentCount = collectionDoc.data().itemCount || 0;
      await setDoc(collectionRef, { itemCount: Math.max(0, currentCount - 1), updatedAt: serverTimestamp() }, { merge: true });
    }
  }
}

export async function migrateSavedReposToDefaultCollection(db: Firestore, userId: string) {
  // Check if user already has collections
  const collectionsQuery = query(collection(db, 'users', userId, 'collections'));
  const collectionsSnapshot = await getDocs(collectionsQuery);

  if (!collectionsSnapshot.empty) {
    return; // User already has collections, skip migration
  }

  // Create default collection
  const defaultCollectionId = await createCollection(db, userId, 'My Repositories', 'Default collection for saved repositories');

  // Get all saved repos
  const savedReposQuery = query(collection(db, 'users', userId, 'saved_repos'), orderBy('savedAt', 'desc'));
  const savedReposSnapshot = await getDocs(savedReposQuery);

  // Move each repo to the default collection
  const migrationPromises = savedReposSnapshot.docs.map(async (doc) => {
    const repoData = doc.data() as Repository;
    await saveRepoToCollection(db, userId, defaultCollectionId, repoData);
    await deleteDoc(doc.ref);
  });

  await Promise.all(migrationPromises);
}


// --- ARCHIVING REPOS ---
export async function archiveRepo(db: Firestore, userId: string, repo: Repository) {
  const archiveRef = doc(db, 'users', userId, 'archived_repos', repo.id.toString());
  const dataToSave = {
    ...createRepoData(repo),
    archivedAt: serverTimestamp()
  };
  await setDoc(archiveRef, dataToSave);
}

export async function unarchiveRepo(db: Firestore, userId: string, repoId: number) {
  const archiveRef = doc(db, 'users', userId, 'archived_repos', repoId.toString());
  await deleteDoc(archiveRef);
}


// --- STATUS CHECK ---
export async function getRepoStatus(db: Firestore, userId: string, repoId: number) {
  // Check old saved_repos collection
  const savedRef = doc(db, 'users', userId, 'saved_repos', repoId.toString());
  const archivedRef = doc(db, 'users', userId, 'archived_repos', repoId.toString());

  // Check if repo exists in any collection
  const collectionsQuery = query(collection(db, 'users', userId, 'collections'));
  const collectionsSnapshot = await getDocs(collectionsQuery);

  let collectionCount = 0;
  let isInCollection = false;
  for (const collectionDoc of collectionsSnapshot.docs) {
    const collectionId = collectionDoc.id;
    const itemRef = doc(db, 'users', userId, 'collections', collectionId, 'items', repoId.toString());
    const itemSnap = await getDoc(itemRef);
    if (itemSnap.exists()) {
      isInCollection = true;
      collectionCount += 1;
    }
  }

  const [savedSnap, archivedSnap] = await Promise.all([getDoc(savedRef), getDoc(archivedRef)]);

  return {
    isSaved: savedSnap.exists() || isInCollection,
    isArchived: archivedSnap.exists(),
    collectionCount,
  };
}

// --- CHAT CONVERSATIONS ---

export async function saveConversation(db: Firestore, userId: string, conversationId: string, messages: any[]) {
  const chatRef = doc(db, 'users', userId, 'conversations', conversationId);
  const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
  
  // Create a summary from the last user message or a default.
  const lastMessage = lastUserMessage ? lastUserMessage.content.substring(0, 100) : 'New Chat';

  await setDoc(chatRef, {
    id: conversationId,
    lastMessage,
    messages: messages,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function loadConversation(db: Firestore, userId: string, conversationId: string) {
  const chatRef = doc(db, 'users', userId, 'conversations', conversationId);
  const snapshot = await getDoc(chatRef);
  return snapshot.exists() ? snapshot.data() : null;
}

export async function loadConversationSummaries(db: Firestore, userId: string) {
  const chatsRef = collection(db, 'users', userId, 'conversations');
  const q = query(chatsRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    lastMessage: doc.data().lastMessage || 'New Chat',
    updatedAt: doc.data().updatedAt
  }));
}

export async function deleteConversation(db: Firestore, userId: string, conversationId: string) {
  const chatRef = doc(db, 'users', userId, 'conversations', conversationId);
  await deleteDoc(chatRef);
}
