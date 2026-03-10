const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DURATION_WORD_COUNT = { short: 150, medium: 400, long: 800 };
const WORDS_PER_PAGE = 80;

function splitIntoPages(text) {
  const words = text.split(' ');
  const pages = [];
  let pageIndex = 1;
  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push({ pageNumber: pageIndex++, content: words.slice(i, i + WORDS_PER_PAGE).join(' ') });
  }
  return pages;
}

router.post('/generate', protect, async (req, res) => {
  try {
    const { characters = [], location, childAge = 5, duration = 'medium', storyLanguage = 'tr', customPrompt = '' } = req.body;

    if (characters.length === 0) return res.status(400).json({ error: 'En az bir karakter gerekli.' });
    if (characters.length > 6) return res.status(400).json({ error: 'En fazla 6 karakter seçebilirsin.' });

    const targetWords = DURATION_WORD_COUNT[duration] || 400;
    const isTurkish = storyLanguage === 'tr';
    const charNames = characters.map(c => `${c.name} (${c.type === 'animal' ? 'hayvan' : 'insan'})`).join(', ');
    const locName = location?.name || (isTurkish ? 'büyülü bir yer' : 'a magical place');
    const customSection = customPrompt.trim() ? (isTurkish ? `\nEk yön: ${customPrompt}` : `\nAdditional direction: ${customPrompt}`) : '';

    const storyPrompt = isTurkish
      ? `Sen çocuklar için büyüleyici hikayeler yazan bir yazarsın.
${childAge} yaşındaki bir çocuk için yaklaşık ${targetWords} kelimelik bir hikaye yaz.
Karakterler: ${charNames}
Mekan: ${locName}${customSection}

Kurallar:
- Tüm karakterleri hikayeye dahil et
- Olumlu değerler içersin (arkadaşlık, cesaret, yardımlaşma)
- Şiddet veya korkutucu unsur olmasın
- Akıcı, çocuksu ve eğlenceli bir dil kullan
- Sadece hikaye metnini yaz, başlık veya açıklama ekleme`
      : `You are a children's story writer.
Write a story of approximately ${targetWords} words for a ${childAge}-year-old child.
Characters: ${charNames}
Setting: ${locName}${customSection}

Rules:
- Include all characters
- Include positive values (friendship, courage, teamwork)
- No violence or scary elements
- Use fluent, child-friendly language
- Write only the story text, no title or description`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const storyResult = await model.generateContent(storyPrompt);
    const storyText = storyResult.response.text().trim();
    if (!storyText) return res.status(500).json({ error: 'AI hikaye üretemedi. Tekrar dene.' });

    const titlePrompt = isTurkish
      ? `Bu hikaye için kısa ve çekici bir başlık yaz. Maksimum 6 kelime. Sadece başlığı yaz:\n\n${storyText.substring(0, 200)}`
      : `Write a short catchy title for this story. Max 6 words. Write only the title:\n\n${storyText.substring(0, 200)}`;

    const titleResult = await model.generateContent(titlePrompt);
    const title = titleResult.response.text().trim().replace(/[*"]/g, '') || (isTurkish ? 'Bugünün Hikayesi' : "Today's Story");

    const pages = splitIntoPages(storyText);

    res.json({ title, fullText: storyText, pages, wordCount: storyText.split(' ').length, pageCount: pages.length });

  } catch (err) {
    console.error('Gemini error:', err.message);
    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.status(500).json({ error: 'Gemini API key geçersiz. .env dosyasını kontrol et.' });
    }
    if (err.message?.includes('quota') || err.status === 429) {
      return res.status(429).json({ error: 'Gemini kota aşıldı. Biraz bekle.' });
    }
    res.status(500).json({ error: 'Hikaye üretilirken hata oluştu. Tekrar dene.' });
  }
});

module.exports = router;
