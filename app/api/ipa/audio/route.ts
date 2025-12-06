import { NextRequest, NextResponse } from 'next/server';

// Mapping IPA symbols to Cloudinary audio URLs - stored securely on server
const ipaSoundMap: { [key: string]: string } = {
  // Vowels (1-15)
  'ɑ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016761/1.mp3',
  'æ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016762/2.mp3',
  'ʌ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016762/3.mp3',
  'ɛ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016763/4.mp3',
  'eɪ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016764/5.mp3',
  'ɜː': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016765/6.mp3',
  'ɪ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016765/7.mp3',
  'iː': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016765/8.mp3',
  'ə': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016768/9.mp3',
  'oʊ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/10.mp3',
  'ʊ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/11.mp3',
  'uː': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/12.mp3',
  'aʊ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/13.mp3',
  'aɪ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/14.mp3',
  'ɔɪ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/15.mp3',
  // Consonants (16-39)
  'b': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/16.mp3',
  'tʃ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/17.mp3',
  'd': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/18.mp3',
  'f': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/19.mp3',
  'g': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016749/20.mp3',
  'h': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016750/21.mp3',
  'dʒ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016750/22.mp3',
  'k': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016750/23.mp3',
  'l': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016750/24.mp3',
  'm': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016750/25.mp3',
  'n': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016750/26.mp3',
  'ŋ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016751/27.mp3',
  'p': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016752/28.mp3',
  'r': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016753/29.mp3',
  's': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016754/30.mp3',
  'ʒ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016759/31.mp3',
  'ʃ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016754/32.mp3',
  't': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765025203/33.mp3',
  'θ': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016754/34.mp3',
  'ð': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016755/35.mp3',
  'v': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016758/36.mp3',
  'w': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016758/37.mp3',
  'j': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016759/38.mp3',
  'z': 'https://res.cloudinary.com/dhepbutlo/video/upload/v1765016759/39.mp3'
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  const audioUrl = ipaSoundMap[symbol];

  if (!audioUrl) {
    return NextResponse.json(
      { error: 'Symbol not found' },
      { status: 404 }
    );
  }

  // Redirect to the Cloudinary URL (proxy approach)
  // This keeps the mapping hidden in server-side code
  return NextResponse.redirect(audioUrl);
}
