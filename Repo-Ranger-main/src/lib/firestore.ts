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

export async function unsaveRepo(db: Firestore, userId: string, repoId: number) {
  const repoRef = doc(db, 'users', userId, 'saved_repos', repoId.toString());
  await deleteDoc(repoRef);
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
    const savedRef = doc(db, 'users', userId, 'saved_repos', repoId.toString());
    const archivedRef = doc(db, 'users', userId, 'archived_repos', repoId.toString());
    const [savedSnap, archivedSnap] = await Promise.all([getDoc(savedRef), getDoc(archivedRef)]);
    return {
        isSaved: savedSnap.exists(),
        isArchived: archivedSnap.exists(),
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
