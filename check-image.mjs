async function checkImageUrl() {
  const url = 'https://fupgdvsjmwntbvuenexh.supabase.co/storage/v1/object/public/student-photos/1788032194269-camera-1788032193978.jpg';
  try {
    const res = await fetch(url);
    console.log('Fetch status for avatar image:', res.status, res.statusText);
    const contentType = res.headers.get('content-type');
    console.log('Content-Type:', contentType);
    const text = await res.text();
    console.log('Response body preview (first 200 chars):', text.slice(0, 200));
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

checkImageUrl();
