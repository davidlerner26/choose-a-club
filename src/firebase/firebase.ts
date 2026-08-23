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
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
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

export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
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

// Products
const products = collection(db, 'products');

export async function getAllProducts(userId: string): Promise<Product[]> {
  const snapshot = await getDocs(query(products, where('userId', '==', userId)));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

export async function createProduct(product: Product) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');

  return await addDoc(products, {
    ...product,
    userId,
    createdAt: Date.now(),
  });
}

export async function updateProduct(id: string, product: Partial<Product>) {
  return await updateDoc(doc(db, 'products', id), product);
}

export async function deleteProduct(id: string) {
  return await deleteDoc(doc(db, 'products', id));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, 'products', id));

  if (!snapshot.exists()) {
    return null;
  }

  const product = { id: snapshot.id, ...snapshot.data() } as Product;

  if (product.userId !== auth.currentUser?.uid) {
    return null;
  }

  return product;
}

// Categories
const categories = collection(db, 'categories');

export async function getUserCategories(userId: string): Promise<Category[]> {
  const snapshot = await getDocs(
    query(categories, where('userId', '==', userId)),
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

export async function createCategory(name: string): Promise<Category> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado');

  const createdAt = Date.now();
  const docRef = await addDoc(categories, { name, userId, createdAt });

  return { id: docRef.id, name, userId, createdAt };
}

// User profiles & usernames
const users = collection(db, 'users');
const usernames = collection(db, 'usernames');

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const snapshot = await getDoc(doc(usernames, username));
  return !snapshot.exists();
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

  const usernameRef = doc(usernames, username);
  const userRef = doc(users, uid);
  const createdAt = Date.now();

  await runTransaction(db, async (transaction) => {
    const usernameSnapshot = await transaction.get(usernameRef);
    if (usernameSnapshot.exists()) {
      throw new Error('Este nome de usuário já está em uso.');
    }
    transaction.set(usernameRef, { uid });
    transaction.set(userRef, {
      uid,
      username,
      displayName,
      photoURL: photoURL ?? null,
      createdAt,
    });
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
  const usernameSnapshot = await getDoc(doc(usernames, username));
  if (!usernameSnapshot.exists()) return null;

  const { uid } = usernameSnapshot.data() as { uid: string };
  return await getUserProfile(uid);
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
