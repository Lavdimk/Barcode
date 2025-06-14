import NextCors from 'nextjs-cors';

export async function applyCors(req, res) {
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
    origin: 'https://barcode-9wvr.onrender.com/', 
    optionsSuccessStatus: 200,
  });
}
