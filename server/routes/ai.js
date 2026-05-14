const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Story = require('../models/Story');
const User  = require('../models/User');

const router = express.Router();

const DURATION_WORD_COUNT = { short: 150, medium: 400, long: 800 };
const WORDS_PER_PAGE = 80;

function splitIntoPages(text) {
  const words = text.split(' ');
  const pages = [];
  let idx = 1;
  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push({ pageNumber: idx++, content: words.slice(i, i + WORDS_PER_PAGE).join(' ') });
  }
  return pages;
}

async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/** string veya object olarak gelen name'i string'e çevirir */
function toStr(val) {
  if (!val) return '';
  if (typeof val === 'object') return val.tr || val.en || '';
  return String(val);
}

router.post('/generate', protect, async (req, res) => {
  try {
    const {
      characters = [],
      location,
      childAge = 5,
      duration = 'medium',
      storyLanguage = 'tr',
      customPrompt = '',
    } = req.body;

    if (!characters.length) return res.status(400).json({ error: 'En az bir karakter gerekli.' });
    if (characters.length > 6) return res.status(400).json({ error: 'En fazla 6 karakter seçebilirsin.' });

    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key eksik.' });

    const isTurkish   = storyLanguage === 'tr';
    const targetWords = DURATION_WORD_COUNT[duration] || 400;
    const charNames   = characters.map(c => `${toStr(c.name)} (${c.type === 'animal' ? 'hayvan' : 'insan'})`).join(', ');
    const locName     = toStr(location?.name) || (isTurkish ? 'büyülü bir yer' : 'a magical place');
    const extra       = customPrompt.trim() ? (isTurkish ? `\nEk yön: ${customPrompt}` : `\nAdditional direction: ${customPrompt}`) : '';

    const storyPrompt = isTurkish
      ? `Sen çocuklar için büyüleyici hikayeler yazan bir yazarsın.\n${childAge} yaşındaki bir çocuk için yaklaşık ${targetWords} kelimelik bir hikaye yaz.\nKarakterler: ${charNames}\nMekan: ${locName}${extra}\n\nKurallar:\n- Tüm karakterleri hikayeye dahil et\n- Olumlu değerler içersin\n- Şiddet veya korkutucu unsur olmasın\n- Akıcı, çocuksu dil kullan\n- Sadece hikaye metnini yaz`
      : `You are a children's story writer.\nWrite ~${targetWords} words for a ${childAge}-year-old.\nCharacters: ${charNames}\nSetting: ${locName}${extra}\n\nRules:\n- Include all characters\n- Positive values only\n- No violence\n- Child-friendly language\n- Story text only`;

    const storyText = await callGemini(storyPrompt);
    if (!storyText) return res.status(500).json({ error: 'AI hikaye üretemedi.' });

    const titlePrompt = isTurkish
      ? `Bu hikaye için kısa başlık yaz. Maks 6 kelime. Sadece başlığı yaz:\n\n${storyText.slice(0, 200)}`
      : `Short title for this story. Max 6 words. Title only:\n\n${storyText.slice(0, 200)}`;

    const rawTitle = await callGemini(titlePrompt);
    const title    = rawTitle.replace(/[*"]/g, '').trim() || (isTurkish ? 'Bugünün Hikayesi' : "Today's Story");
    const pages    = splitIntoPages(storyText);

    // Karakterleri normalize et — her field string olmalı
    const normalizedChars = characters.map(c => ({
      id:        String(c.id        || ''),
      name:      toStr(c.name),
      type:      String(c.type      || 'human'),
      imagePath: String(c.imagePath || ''),
      emoji:     String(c.emoji     || ''),
    }));

    const normalizedLocation = {
      id:        String(location?.id        || ''),
      name:      toStr(location?.name),
      imagePath: String(location?.imagePath || ''),
    };

    // DB'ye kaydet
    let savedStory;
    try {
      savedStory = await Story.create({
        author:   req.user._id,
        title,
        fullText: storyText,
        pages,
        options: {
          characters:    normalizedChars,
          location:      normalizedLocation,
          childAge:      Number(childAge) || 5,
          duration:      ['short','medium','long'].includes(duration) ? duration : 'medium',
          storyLanguage: ['tr','en'].includes(storyLanguage) ? storyLanguage : 'tr',
          customPrompt:  String(customPrompt || '').slice(0, 500),
        },
        isPublic: false,
      });

      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalStories': 1 } });
    } catch (dbErr) {
      console.error('DB kayıt hatası:', JSON.stringify(dbErr.errors || dbErr.message, null, 2));
      // DB hatası olsa bile hikayeyi kullanıcıya göster, sadece _id olmaz
    }

    res.json({
      _id:       savedStory?._id || null,
      title,
      fullText:  storyText,
      pages,
      wordCount: storyText.split(' ').length,
      pageCount: pages.length,
    });

  } catch (err) {
    console.error('Generate error:', err.message);
    if (err.message?.includes('401') || err.message?.includes('403')) {
      return res.status(401).json({ error: 'Bedrock API key geçersiz.' });
    }
    if (err.message?.includes('429') || err.message?.includes('Throttling')) {
      return res.status(429).json({ error: 'İstek limiti aşıldı, biraz bekle.' });
    }
    res.status(500).json({ error: 'Hikaye üretilirken hata: ' + err.message });
  }
});

module.exports = router;