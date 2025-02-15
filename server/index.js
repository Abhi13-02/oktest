const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post('/api/extract-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded'});
    }

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);

    // Basic text processing to clean up extracted text
    const cleanText = data.text
      .replace(/\n+/g, '\n')  // Remove multiple newlines
      .trim();

    // Optional: Extract some metadata
    const metadata = {
      pageCount: data.numpages,
      info: data.info,
    };

    console.log('Extracted Text:', cleanText);
    console.log('Metadata:', metadata);

    res.json({
      text: cleanText,
      metadata: metadata
    });

  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ error: 'Failed to extract text from PDF' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
