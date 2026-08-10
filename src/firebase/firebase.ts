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
  updateDoc,
} from 'firebase/firestore';
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

// Products
const products = collection(db, 'products');

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(products);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

export async function createProduct(product: Product) {
  return await addDoc(products, product);
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

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Product;
}
