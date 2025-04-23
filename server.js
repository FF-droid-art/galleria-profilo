const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

let profiles = [];

app.post('/upload', upload.single('image'), (req, res) => {
  const { name, birthdate } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const newProfile = {
    imageUrl: `/uploads/${req.file.filename}`,
    name,
    birthdate
  };
  profiles.push(newProfile);
  res.status(200).json({ message: 'Uploaded successfully', profile: newProfile });
});

app.get('/profiles', (req, res) => {
  res.json(profiles);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
