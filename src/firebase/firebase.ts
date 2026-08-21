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
import type { Product } from '@/types';

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

export async function getAllProducts(): Promise<Product[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

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
