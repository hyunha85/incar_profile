/**
 * removeBackground - Remove.bg API를 사용한 배경 제거
 * 추후 다른 API로 교체 가능하도록 추상화
 */
export async function removeBackground(imageBase64: string): Promise<string> {
  const apiKey = process.env.REMOVEBG_API_KEY;

  if (!apiKey) {
    throw new Error('REMOVEBG_API_KEY is not set');
  }

  // base64에서 binary 변환
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  formData.append('image_file', blob, 'image.jpg');
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Remove.bg API error: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const resultBase64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:image/png;base64,${resultBase64}`;
}
