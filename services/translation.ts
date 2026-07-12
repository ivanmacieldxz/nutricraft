export interface TranslatedItem {
  en: string;
  es: string;
}

export async function translateArray(texts: string[]): Promise<TranslatedItem[]> {
  if (texts.length === 0) return [];
  
  // Google Translate API maneja mejor lotes de hasta 100 elementos por payload
  const chunkSize = 100;
  const results: TranslatedItem[] = [];
  
  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    
    // Separamos con un delimitador claro que no se traduzca, o simplemente con saltos de línea
    // Los saltos de línea son respetados por la API
    const query = chunk.join('\n');
    
    try {
      const url = process.env.TRANSLATION_API_URL || `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `q=${encodeURIComponent(query)}`
      });
      
      if (!res.ok) {
        console.error("Translation API failed with status:", res.status);
        chunk.forEach(t => results.push({ en: t, es: t }));
        continue;
      }
      
      const data = await res.json();
      
      // La respuesta de google (gtx) tiene este formato:
      // data[0] es un array de segmentos: [ ["traducido\n", "original\n", ...], ... ]
      const translatedSegments = data[0] || [];
      
      // Unimos todo el texto traducido porque a veces Google divide una frase en múltiples segmentos
      const fullTranslatedText = translatedSegments.map((seg: any) => seg[0]).join('');
      
      // Volvemos a separar por salto de línea
      const translatedArray = fullTranslatedText.split('\n').map((s: string) => s.trim());
      
      // Mapeamos de vuelta al chunk original
      chunk.forEach((enText, index) => {
        const esText = translatedArray[index] || enText;
        results.push({
          en: enText,
          es: esText
        });
      });
      
    } catch (error) {
      console.error("Translation error:", error);
      // Fallback
      chunk.forEach(t => results.push({ en: t, es: t }));
    }
  }
  
  // Función helper para capitalizar (Title Case)
  const toTitleCase = (str: string) => {
    const lowercaseWords = new Set(['de', 'la', 'el', 'los', 'las', 'y', 'en', 'con', 'del']);
    return str.toLowerCase().split(' ').map((word, index) => {
      if (index > 0 && lowercaseWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  // Deduplicamos por nombre en español y aplicamos Title Case
  const uniqueResults: TranslatedItem[] = [];
  const seenEs = new Set<string>();
  
  for (const item of results) {
    const formattedEs = toTitleCase(item.es);
    const key = formattedEs.toLowerCase();
    
    if (!seenEs.has(key)) {
      seenEs.add(key);
      uniqueResults.push({ en: item.en, es: formattedEs });
    }
  }
  
  // Devolvemos el array ordenado alfabéticamente
  return uniqueResults.sort((a, b) => a.es.localeCompare(b.es));
}
