
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://negriundermyskinphotoalbum.netlify.app'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
  cloud_name: 'dgrsbjjqw',
  api_key: '467979564625165',
  api_secret: 'OhsSTdKlBYyrnFzg2K6XqnOgdzw'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'galleria-profili',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage });

let profiles = [];

// Ordina i profili in base al compleanno più vicino
function sortProfilesByNextBirthday(profiles) {
  const today = new Date();
  const thisYear = today.getFullYear();

  return profiles.slice().sort((a, b) => {
    const getNextDate = (dateStr) => {
      const [yyyy, mm, dd] = dateStr.split('-').map(Number);
      let next = new Date(thisYear, mm - 1, dd);
      if (next < today) {
        next.setFullYear(thisYear + 1);
      }
      return next;
    };

    const aDate = getNextDate(a.birthdate);
    const bDate = getNextDate(b.birthdate);
    return aDate - bDate;
  });
}

app.post('/upload', upload.single('image'), (req, res) => {
  const { name, birthdate } = req.body;
  if (!req.file || !req.file.path) return res.status(400).json({ error: 'Upload fallito' });

  const newProfile = {
    id: uuidv4(),
    name,
    birthdate,
    imageUrl: req.file.path
  };

  profiles.push(newProfile);
  res.status(200).json({ message: 'Upload riuscito', profile: newProfile });
});

app.get('/profiles', (req, res) => {
  const sorted = sortProfilesByNextBirthday(profiles);
  res.json(sorted);
});

// Aggiornamento profilo
app.put('/profiles/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, birthdate } = req.body;

  const index = profiles.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Profilo non trovato' });

  // Aggiorna nome e data se forniti
  if (name) profiles[index].name = name;
  if (birthdate) profiles[index].birthdate = birthdate;

  // Aggiorna immagine se presente
  if (req.file && req.file.path) {
    profiles[index].imageUrl = req.file.path;
  }

  res.status(200).json({ message: 'Profilo aggiornato', profile: profiles[index] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
