import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCzDO_A7NM3Jmw_oxJW4cPYNkC3mV16POA",
    authDomain: "findlt-school.firebaseapp.com",
    projectId: "findlt-school",
    storageBucket: "findlt-school.firebasestorage.app",
    messagingSenderId: "834095194713",
    appId: "1:834095194713:web:807b4c9d88a0028b9e8748",
    measurementId: "G-FH6LDK6M29"
};


const app = initializeApp(firebaseConfig);
getAnalytics(app);

const db = getFirestore(app);

const laporanRef = collection(db, "laporan");

let jenisLaporan = "";
let semuaLaporan = [];


// ===============================
// TAMPILKAN LAPORAN DARI FIREBASE
// ===============================

onSnapshot(laporanRef, (snapshot) => {

    semuaLaporan = [];

    snapshot.forEach((doc) => {

        semuaLaporan.push({
            id: doc.id,
            ...doc.data()
        });

    });

    tampilkanLaporan();

});


// ===============================
// TAMPILKAN LAPORAN
// ===============================

function tampilkanLaporan() {

    const daftar = document.getElementById("daftarLaporan");

    if (!daftar) return;


    const input = document.getElementById("searchLaporan");
    const filterInput = document.getElementById("filterJenis");


    const search = input
        ? input.value.toLowerCase()
        : "";

    const filter = filterInput
        ? filterInput.value
        : "semua";


    const hasil = semuaLaporan.filter((data) => {

        const nama = data.nama
            ? data.nama.toLowerCase()
            : "";

        const lokasi = data.lokasi
            ? data.lokasi.toLowerCase()
            : "";


        const cocokSearch =
            nama.includes(search) ||
            lokasi.includes(search);


        const cocokFilter =
            filter === "semua" ||
            data.jenis === filter;


        return cocokSearch && cocokFilter;

    });


    daftar.innerHTML = `
        <h2>📋 Laporan Terbaru</h2>
    `;


    if (hasil.length === 0) {

        daftar.innerHTML += `
            <p class="tidak-ada">
                😕 Laporan tidak ditemukan.
            </p>
        `;

        return;
    }


    hasil.reverse().forEach((data) => {

        const laporan = document.createElement("div");

        laporan.className = "laporan";


        const status =
            data.jenis === "hilang"
                ? "📦 Barang Hilang"
                : "✅ Barang Ditemukan";


        const labelLokasi =
            data.jenis === "hilang"
                ? "Lokasi Kehilangan"
                : "Lokasi Ditemukan";


        const labelTanggal =
            data.jenis === "hilang"
                ? "Tanggal Kehilangan"
                : "Tanggal Ditemukan";


        laporan.innerHTML = `

            <h3>${status}</h3>

            <p>
                <strong>Barang:</strong>
                ${data.nama || "-"}
            </p>

            <p>
                <strong>${labelLokasi}:</strong>
                ${data.lokasi || "-"}
            </p>

            <p>
                <strong>${labelTanggal}:</strong>
                ${data.tanggal || "-"}
            </p>

            <p>
                <strong>Deskripsi:</strong>
                ${data.deskripsi || "-"}
            </p>

            <button class="btn-hapus" onclick="hapusLaporan('${data.id}')">
    Hapus
</button>

            ${
                data.jenis === "ditemukan"
                    ? `
                        <p>
                            <strong> 📍Di kembalikan:</strong>
                            Resepsionis
                        </p>
                    `
                    : ""
            }

        `;


        daftar.appendChild(laporan);

    });

}


// ===============================
// PENCARIAN
// ===============================

const inputCari = document.getElementById("searchLaporan");

if (inputCari) {

    inputCari.addEventListener(
        "input",
        tampilkanLaporan
    );

}


// ===============================
// FILTER
// ===============================

const filterJenis = document.getElementById("filterJenis");

if (filterJenis) {

    filterJenis.addEventListener(
        "change",
        tampilkanLaporan
    );

}


// ===============================
// BUKA FORM
// ===============================

function bukaForm(jenis) {

    jenisLaporan = jenis;


    const form =
        document.getElementById("formLaporan");

    const judul =
        document.getElementById("judulForm");

    const labelLokasi =
        document.getElementById("labelLokasi");

    const lokasi =
        document.getElementById("lokasi");

    const labelTanggal =
        document.getElementById("labelTanggal");


    if (jenis === "hilang") {

        judul.innerHTML =
            "📦 Laporkan Barang Hilang";

        labelLokasi.innerHTML =
            "Lokasi Kehilangan";

        lokasi.placeholder =
            "Contoh: Kelas 9A / Kantin / Tidak tahu";

        labelTanggal.innerHTML =
            "Tanggal Kehilangan";

    } else {

        judul.innerHTML =
            "✅ Laporkan Barang Ditemukan";

        labelLokasi.innerHTML =
            "Lokasi Ditemukan";

        lokasi.placeholder =
            "Contoh: Kelas 9A / Kantin";

        labelTanggal.innerHTML =
            "Tanggal Ditemukan";

    }


    form.style.display = "block";


    form.scrollIntoView({
        behavior: "smooth"
    });

}


// ===============================
// TUTUP FORM
// ===============================

function tutupForm() {

    const form =
        document.getElementById("formLaporan");

    form.style.display = "none";

}

// ===============================
// KIRIM LAPORAN
// ===============================

async function kirimLaporan(event) {
    event.preventDefault();

    const nama =
        document.getElementById("namaBarang").value;

    const lokasi =
        document.getElementById("lokasi").value;

    const tanggal =
        document.getElementById("tanggal").value;

    const deskripsi =
        document.getElementById("deskripsi").value;

    try {

        await addDoc(collection(db, "laporan"), {
            nama: nama,
            lokasi: lokasi,
            tanggal: tanggal,
            deskripsi: deskripsi,
            jenis: jenisLaporan
        });

        alert("Laporan berhasil dikirim! 🎉");

        document.querySelector("form").reset();

        tutupForm();

    } catch (error) {

        console.error("ERROR:", error);

        alert("Gagal mengirim laporan: " + error.message);
    }
}

// ===============================
// HUBUNGKAN DENGAN HTML
// ===============================

async function hapusLaporan(id) {
    const yakin = confirm("Yakin ingin menghapus laporan ini?");

    if (!yakin) {
        return;
    }

    try {
        await deleteDoc(doc(db, "laporan", id));
        alert("Laporan berhasil dihapus.");
    } catch (error) {
        console.error(error);
        alert("Gagal menghapus laporan.");
    }
}

window.bukaForm = bukaForm;
window.tutupForm = tutupForm;
window.kirimLaporan = kirimLaporan;
window.hapusLaporan = hapusLaporan;