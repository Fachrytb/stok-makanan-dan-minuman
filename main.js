// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// GANTI DENGAN FIREBASE CONFIG ANDA
const firebaseConfig = {
  apiKey: "AIzaSyCjXlgysJkN-2s3Gu0forgp7as5-9NqCkI",
  authDomain: "pasar-b04a7.firebaseapp.com",
  databaseURL: "https://pasar-b04a7-default-rtdb.firebaseio.com",
  projectId: "pasar-b04a7",
  storageBucket: "pasar-b04a7.appspot.com",
  messagingSenderId: "508470916587",
  appId: "1:508470916587:web:460e9a1612e92b712e15ae",
  measurementId: "G-33T7CQCWBX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fungsi untuk menampilkan semua data inventory
export async function ambilDaftarInventory() {
  try {
    const refDokumen = collection(db, "inventory");
    const kueri = query(refDokumen, orderBy("nama", "asc"));
    const cuplikanKueri = await getDocs(kueri);

    let hasil = [];
    cuplikanKueri.forEach((dok) => {
      hasil.push({
        id: dok.id,
        nama: dok.data().nama || "",
        kategori: dok.data().kategori || "",
        jumlah: dok.data().jumlah || 0,
        satuan: dok.data().satuan || "",
        minStok: dok.data().minStok || 0,
        lokasi: dok.data().lokasi || "",
        createdAt: dok.data().createdAt || new Date()
      });
    });

    return hasil;
  } catch (error) {
    console.error("Error mengambil data inventory:", error);
    throw error;
  }
}

// Fungsi untuk menambahkan data inventory
export async function tambahInventory(data) {
  try {
    const refDokumen = collection(db, "inventory");
    const dataDenganTimestamp = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(refDokumen, dataDenganTimestamp);
    return { id: docRef.id, ...dataDenganTimestamp };
  } catch (error) {
    console.error("Error menambahkan inventory:", error);
    throw error;
  }
}

// Fungsi untuk mengupdate data inventory
export async function updateInventory(id, data) {
  try {
    const docRef = doc(db, "inventory", id);
    const dataUpdate = {
      ...data,
      updatedAt: new Date()
    };
    
    await updateDoc(docRef, dataUpdate);
    return { id, ...dataUpdate };
  } catch (error) {
    console.error("Error mengupdate inventory:", error);
    throw error;
  }
}

// Fungsi untuk menghapus data inventory
export async function hapusInventory(docId) {
  try {
    await deleteDoc(doc(db, "inventory", docId));
    return true;
  } catch (error) {
    console.error("Error menghapus inventory:", error);
    throw error;
  }
}

// Fungsi untuk mengambil data inventory berdasarkan ID
export async function ambilInventoryById(id) {
  try {
    const docRef = doc(db, "inventory", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Dokumen tidak ditemukan");
    }
  } catch (error) {
    console.error("Error mengambil inventory by ID:", error);
    throw error;
  }
}

// Fungsi untuk mengambil data berdasarkan kategori
export async function ambilInventoryByKategori(kategori) {
  try {
    const refDokumen = collection(db, "inventory");
    let kueri;
    
    if (kategori === 'all') {
      kueri = query(refDokumen, orderBy("nama", "asc"));
    } else if (kategori === 'low') {
      // Query untuk stok rendah
      const semuaData = await ambilDaftarInventory();
      return semuaData.filter(item => item.jumlah < item.minStok);
    } else {
      kueri = query(refDokumen, where("kategori", "==", kategori), orderBy("nama", "asc"));
    }
    
    const cuplikanKueri = await getDocs(kueri);
    let hasil = [];
    cuplikanKueri.forEach((dok) => {
      hasil.push({
        id: dok.id,
        nama: dok.data().nama || "",
        kategori: dok.data().kategori || "",
        jumlah: dok.data().jumlah || 0,
        satuan: dok.data().satuan || "",
        minStok: dok.data().minStok || 0,
        lokasi: dok.data().lokasi || ""
      });
    });

    return hasil;
  } catch (error) {
    console.error("Error mengambil inventory by kategori:", error);
    throw error;
  }
}

// Fungsi untuk format angka
export function formatAngka(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi untuk menghitung statistik
export async function hitungStatistik() {
  try {
    const semuaData = await ambilDaftarInventory();
    
    const totalItems = semuaData.length;
    const lowStock = semuaData.filter(item => item.jumlah < item.minStok).length;
    
    const categories = {
      food: semuaData.filter(item => item.kategori === 'food').length,
      drink: semuaData.filter(item => item.kategori === 'drink').length,
      kitchen: semuaData.filter(item => item.kategori === 'kitchen').length
    };
    
    return {
      totalItems,
      lowStock,
      categories
    };
  } catch (error) {
    console.error("Error menghitung statistik:", error);
    throw error;
  }
}