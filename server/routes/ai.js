const express = require('express');
const { protect } = require('../middleware/auth');
const Story = require('../models/Story');
const User = require('../models/User');

const router = express.Router();

const DURATION_WORD_COUNT = { short: 150, medium: 400, long: 800 };
const WORDS_PER_PAGE = 80;
const BEDROCK_MODEL_ID = 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0';

function splitIntoPages(text) {
  const words = text.split(' ');
  const pages = [];
  let pageIndex = 1;
  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push({ pageNumber: pageIndex++, content: words.slice(i, i + WORDS_PER_PAGE).join(' ') });
  }
  return pages;
}

async function callBedrock(prompt, apiKey) {
  const region = process.env.AWS_REGION || 'eu-central-1';
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(BEDROCK_MODEL_ID)}/invoke`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Bedrock API hata: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
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

    if (characters.length === 0) return res.status(400).json({ error: 'En az bir karakter gerekli.' });
    if (characters.length > 6)   return res.status(400).json({ error: 'En fazla 6 karakter seçebilirsin.' });

    const apiKey = process.env.BEDROCK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Bedrock API key eksik. .env dosyasını kontrol et.' });

    const targetWords  = DURATION_WORD_COUNT[duration] || 400;
    const isTurkish    = storyLanguage === 'tr';
    const charNames    = characters.map(c => `${c.name} (${c.type === 'animal' ? 'hayvan' : 'insan'})`).join(', ');
    const locName      = location?.name || (isTurkish ? 'büyülü bir yer' : 'a magical place');
    const customSection = customPrompt.trim()
      ? (isTurkish ? `\nEk yön: ${customPrompt}` : `\nAdditional direction: ${customPrompt}`)
      : '';

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

    const storyText = await callBedrock(storyPrompt, apiKey);
    if (!storyText) return res.status(500).json({ error: 'AI hikaye üretemedi. Tekrar dene.' });

    const titlePrompt = isTurkish
      ? `Bu hikaye için kısa ve çekici bir başlık yaz. Maksimum 6 kelime. Sadece başlığı yaz:\n\n${storyText.substring(0, 200)}`
      : `Write a short catchy title for this story. Max 6 words. Write only the title:\n\n${storyText.substring(0, 200)}`;

    const title = (await callBedrock(titlePrompt, apiKey)).replace(/[*"]/g, '')
      || (isTurkish ? 'Bugünün Hikayesi' : "Today's Story");

    const pages = splitIntoPages(storyText);

    // Hikayeyi otomatik veritabanına kaydet
    const savedStory = await Story.create({
      author: req.user._id,
      title,
      fullText: storyText,
      pages,
      options: {
        characters,
        location,
        childAge,
        duration,
        storyLanguage,
        customPrompt,
      },
      isPublic: false,
    });

    // Kullanıcı istatistiklerini güncelle
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalStories': 1 },
    });

    res.json({
      _id: savedStory._id,
      title,
      fullText: storyText,
      pages,
      wordCount: storyText.split(' ').length,
      pageCount: pages.length,
    });

  } catch (err) {
    console.error('Bedrock error:', err.message);
    if (err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('API key')) {
      return res.status(500).json({ error: 'Bedrock API key geçersiz veya yetkisiz.' });
    }
    if (err.message?.includes('429') || err.message?.includes('ThrottlingException')) {
      return res.status(429).json({ error: 'Bedrock istek limiti aşıldı, biraz bekle.' });
    }
    res.status(500).json({ error: 'Hikaye üretilirken hata oluştu: ' + err.message });
  }
});

module.exports = router;