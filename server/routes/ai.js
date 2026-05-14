const express = require('express');
const { protect } = require('../middleware/auth');
const Story = require('../models/Story');
const User  = require('../models/User');

const router = express.Router();

const DURATION_WORD_COUNT = { short: 150, medium: 400, long: 800 };
const WORDS_PER_PAGE = 80;
const BEDROCK_MODEL_ID = 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0';

function splitIntoPages(text) {
  const words = text.split(' ');
  const pages = [];
  let idx = 1;
  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push({ pageNumber: idx++, content: words.slice(i, i + WORDS_PER_PAGE).join(' ') });
  }
  return pages;
}

async function callBedrock(prompt, apiKey) {
  const region = process.env.AWS_REGION || 'eu-central-1';
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(BEDROCK_MODEL_ID)}/invoke`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
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

    const apiKey = process.env.BEDROCK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Bedrock API key eksik.' });

    const isTurkish   = storyLanguage === 'tr';
    const targetWords = DURATION_WORD_COUNT[duration] || 400;
    const charNames   = characters.map(c => `${toStr(c.name)} (${c.type === 'animal' ? 'hayvan' : 'insan'})`).join(', ');
    const locName     = toStr(location?.name) || (isTurkish ? 'büyülü bir yer' : 'a magical place');
    const extra       = customPrompt.trim() ? (isTurkish ? `\nEk yön: ${customPrompt}` : `\nAdditional direction: ${customPrompt}`) : '';

    const storyPrompt = isTurkish
      ? `Sen çocuklar için büyüleyici hikayeler yazan bir yazarsın.\n${childAge} yaşındaki bir çocuk için yaklaşık ${targetWords} kelimelik bir hikaye yaz.\nKarakterler: ${charNames}\nMekan: ${locName}${extra}\n\nKurallar:\n- Tüm karakterleri hikayeye dahil et\n- Olumlu değerler içersin\n- Şiddet veya korkutucu unsur olmasın\n- Akıcı, çocuksu dil kullan\n- Sadece hikaye metnini yaz`
      : `You are a children's story writer.\nWrite ~${targetWords} words for a ${childAge}-year-old.\nCharacters: ${charNames}\nSetting: ${locName}${extra}\n\nRules:\n- Include all characters\n- Positive values only\n- No violence\n- Child-friendly language\n- Story text only`;

    const storyText = await callBedrock(storyPrompt, apiKey);
    if (!storyText) return res.status(500).json({ error: 'AI hikaye üretemedi.' });

    const titlePrompt = isTurkish
      ? `Bu hikaye için kısa başlık yaz. Maks 6 kelime. Sadece başlığı yaz:\n\n${storyText.slice(0, 200)}`
      : `Short title for this story. Max 6 words. Title only:\n\n${storyText.slice(0, 200)}`;

    const rawTitle = await callBedrock(titlePrompt, apiKey);
    const title    = rawTitle.replace(/[*"]/g, '').trim() || (isTurkish ? 'Bugünün Hikayesi' : "Today's Story");
    const pages    = splitIntoPages(storyText);

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
