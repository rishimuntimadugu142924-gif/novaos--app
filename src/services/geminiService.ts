export interface AIResponse {
  text: string;
  error?: string;
}

export async function askNovaAI(
  prompt: string, 
  systemInstruction?: string, 
  customApiKey?: string
): Promise<string> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (customApiKey && customApiKey.trim().length > 0) {
      headers['x-api-key'] = customApiKey.trim();
    }

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        systemInstruction: systemInstruction || 'You are Nova, the AI System Intelligence of NovaOS. MULTILINGUAL AUTO-DETECTION MANDATE: Automatically detect the user input language and respond fluently, naturally, and accurately in that exact same language. Keep responses concise, helpful, and formatted nicely in Markdown when appropriate.',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reach Gemini AI service');
    }

    return data.text || 'No output generated.';
  } catch (err: any) {
    console.error('Nova AI Error:', err);
    throw err;
  }
}
