import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../services/api';

export default function StoryReader() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();

  useEffect(() => {
    const load = async () => {
      try {
        const res   = await api.get(`/stories/${id}`);
        const story = res.data.story;

        const chars = story.options?.characters || [];
        const loc   = story.options?.location   || null;

        const viewStory = {
          ...story,
          characters: chars.map(c => ({
            ...c,
            file: c.imagePath?.split('/').pop() || '',
          })),
          location: loc ? { ...loc, file: loc.imagePath?.split('/').pop() || '' } : null,
        };

        navigate('/story-view', { state: { story: viewStory }, replace: true });
      } catch (err) {
        alert(lang === 'tr' ? 'Hikaye yüklenemedi.' : 'Could not load story.');
        navigate(-1);
      }
    };
    load();
  }, [id]);

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" />
    </div>
  );
}