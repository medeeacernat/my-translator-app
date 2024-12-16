const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { Translate } = require("@google-cloud/translate").v2;
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();
const port = 3000;

// Configurează Google Translate API
const translate = new Translate({
  key: "AIzaSyCi3hFzqbyeI7JLKqF-5dZXALcvLRzdlFk", // Înlocuiește cu cheia ta API Google Translate
});

// Middleware pentru procesarea datelor
app.use(bodyParser.json());
app.use(express.static("public")); // Servește fișierele frontend din folderul public

// Configurarea multer pentru upload de fișiere
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint pentru obținerea limbilor suportate
app.get("/languages", async (req, res) => {
  try {
    const [languages] = await translate.getLanguages();
    res.json(languages); // Trimite lista limbilor suportate către frontend
  } catch (error) {
    res.status(500).send("Eroare la obținerea limbilor suportate!");
  }
});

// Endpoint pentru traducerea fișierelor
app.post("/translate", upload.single("file"), async (req, res) => {
  const targetLanguage = req.body.targetLanguage;
  const file = req.file;

  if (!file) {
    return res.status(400).send("Niciun fișier încărcat!");
  }

  let text = "";

  // Procesarea fișierului PDF
  if (file.mimetype === "application/pdf") {
    const pdfData = await pdfParse(file.buffer);
    text = pdfData.text;
  }
  // Procesarea fișierului DOCX
  else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    text = result.value; // Obține textul din fișier
  }
  // Procesarea fișierului TXT
  else if (file.mimetype === "text/plain") {
    text = file.buffer.toString("utf-8");
  }

  if (!text) {
    return res.status(400).send("Formatul fișierului nu este suportat!");
  }

  // Traducerea textului folosind Google Translate API
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    res.json({ translation });
  } catch (error) {
    res.status(500).send("Eroare la traducerea textului!");
  }
});

// Pornire server
app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
