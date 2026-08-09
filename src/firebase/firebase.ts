// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDocs, getFirestore } from 'firebase/firestore';
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

export function createProduct(product: Product) {
  return addDoc(products, product);
}

export function editProduct(id: string, product: Partial<Product>) {
  return updateDoc(doc(db, 'products', id), product);
}

export function deleteProduct(id: string) {
  return deleteDoc(doc(db, 'products', id));
}
