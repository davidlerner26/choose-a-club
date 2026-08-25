// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDoc, getDocs, getFirestore } from 'firebase/firestore';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import type { Category, Comment, Product, UserProfile } from '@/types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAviTc-7upWlZvj89eftWFD9qDyVFhVLw4',
  authDomain: 'bambina-5bd51.firebaseapp.com',
  projectId: 'bambina-5bd51',
  storageBucket: 'bambina-5bd51.firebasestorage.app',
  messagingSenderId: '426140283768',
  appId: '1:426140283768:web:60458e1828aedb4db98e8d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Auth
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function signInWithApple() {
  return await signInWithPopup(auth, appleProvider);
}

export async function signInWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  return await signOut(auth);
}

// User profiles
const users = collection(db, 'users');

// Products (subcollection: users/{uid}/products)
function productsCollection(uid: string) {
  return collection(db, 'users', uid, 'products');
}

export async function getAllProducts(userId: string): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection(userId));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

export async function createProduct(product: Product) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');

  return await addDoc(productsCollection(userId), {
    ...product,
    createdAt: Date.now(),
  });
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');

  return await updateDoc(doc(db, 'users', userId, 'products', id), product);
}

export async function deleteProduct(id: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');

  return await deleteDoc(doc(db, 'users', userId, 'products', id));
}

export async function getProduct(id: string): Promise<Product | null> {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const snapshot = await getDoc(doc(db, 'users', userId, 'products', id));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Product;
}

// Categories (subcollection: users/{uid}/categories)
function categoriesCollection(uid: string) {
  return collection(db, 'users', uid, 'categories');
}

export async function getUserCategories(userId: string): Promise<Category[]> {
  const snapshot = await getDocs(categoriesCollection(userId));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

export async function createCategory(name: string): Promise<Category> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');

  const createdAt = Date.now();
  const docRef = await addDoc(categoriesCollection(userId), { name, createdAt });

  return { id: docRef.id, name, createdAt };
}

// Usernames are now just a field on the users/{uid} doc (no separate
// collection). Uniqueness is enforced with a best-effort query check —
// see the note in the migration writeup about the tradeoff vs. the old
// atomic usernames/{username} transaction.
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snapshot = await getDocs(
    query(users, where('username', '==', username), limit(1)),
  );
  return snapshot.empty;
}

export async function createUserProfile({
  username,
  displayName,
  photoURL,
}: {
  username: string;
  displayName: string;
  photoURL?: string | null;
}): Promise<UserProfile> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');

  const available = await isUsernameAvailable(username);
  if (!available) {
    throw new Error('Este nome de usuário já está em uso.');
  }

  const createdAt = Date.now();
  await setDoc(doc(users, uid), {
    uid,
    username,
    displayName,
    photoURL: photoURL ?? null,
    createdAt,
  });

  return { uid, username, displayName, photoURL: photoURL ?? undefined, createdAt };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(users, uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

export async function getUserByUsername(
  username: string,
): Promise<UserProfile | null> {
  const snapshot = await getDocs(
    query(users, where('username', '==', username), limit(1)),
  );
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as UserProfile;
}

// Comments
const comments = collection(db, 'comments');

export async function getProductComments(productId: string): Promise<Comment[]> {
  const snapshot = await getDocs(
    query(comments, where('productId', '==', productId)),
  );

  const results = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[];

  return results.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addComment({
  productId,
  profileUserId,
  text,
}: {
  productId: string;
  profileUserId: string;
  text: string;
}): Promise<Comment> {
  const authorId = auth.currentUser?.uid;
  if (!authorId) throw new Error('Usuário não autenticado');

  const createdAt = Date.now();
  const comment = {
    productId,
    profileUserId,
    authorId,
    authorName: auth.currentUser?.displayName ?? 'Usuário',
    authorPhotoURL: auth.currentUser?.photoURL ?? null,
    text,
    createdAt,
  };
  const docRef = await addDoc(comments, comment);

  return {
    id: docRef.id,
    ...comment,
    authorPhotoURL: comment.authorPhotoURL ?? undefined,
  };
}

export async function deleteComment(id: string) {
  return await deleteDoc(doc(db, 'comments', id));
}
