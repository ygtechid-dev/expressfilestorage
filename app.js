const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Tambahkan cors

const app = express();
const PORT = process.env.PORT || 3000;

// Tambahkan middleware CORS
app.use(cors()); // Mengizinkan semua origin untuk mengakses server

// Buat direktori untuk menyimpan file jika belum ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Menyimpan file di folder "uploads"
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage: storage });

// Endpoint untuk mengunggah file
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // URL dari file yang telah diunggah
    const fileUrl = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
    res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl
    });
});

// Endpoint untuk menampilkan file
app.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Cek apakah file ada
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Mengirim file sebagai response
        res.sendFile(filePath);
    });
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
