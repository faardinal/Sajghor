import { supabase } from '../../src/lib/supabaseClient';

const parseBody = (req: any) => {
  if (!req.body) {
    return {};
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      console.error('[API] JSON parse error:', e);
      return {};
    }
  }
  return req.body;
};

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Content-Type', 'application/json');

  // GET: Fetch all products
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[GET /api/products] Supabase error:', error.message);
        return res.status(500).json({ error: `Database error: ${error.message}` });
      }

      console.log(`[GET /api/products] Retrieved ${data?.length || 0} products`);
      return res.status(200).json({ products: data || [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[GET /api/products] Unexpected error:', message);
      return res.status(500).json({ error: `Server error: ${message}` });
    }
  }

  // POST: Create new product
  if (req.method === 'POST') {
    try {
      const body = parseBody(req);
      const requiredFields = ['name', 'price', 'stock', 'category', 'collectionId', 'image'];
      const missing = requiredFields.filter(field => !body[field]);

      if (missing.length > 0) {
        console.warn('[POST /api/products] Missing fields:', missing);
        return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
      }

      // Validate numeric fields
      const price = Number(body.price);
      const stock = Number(body.stock);
      if (isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
        console.warn('[POST /api/products] Invalid numeric values:', { price, stock });
        return res.status(400).json({ error: 'Price and stock must be non-negative numbers' });
      }

      const newProduct = {
        name: String(body.name).trim(),
        price,
        stock,
        category: String(body.category).trim(),
        collectionId: String(body.collectionId).trim(),
        image: String(body.image).trim(),
        images: Array.isArray(body.images) ? body.images.map(String) : [String(body.image)],
        description: String(body.description || '').trim(),
        story: String(body.story || '').trim(),
        material: String(body.material || '').trim(),
        origin: String(body.origin || '').trim(),
        dimensions: body.dimensions ? String(body.dimensions).trim() : null,
        technique: body.technique ? String(body.technique).trim() : null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.error('[POST /api/products] Supabase insert error:', error.message);
        return res.status(500).json({ error: `Database error: ${error.message}` });
      }

      console.log('[POST /api/products] Product created:', data?.id);
      return res.status(201).json({ product: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[POST /api/products] Unexpected error:', message);
      return res.status(500).json({ error: `Server error: ${message}` });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
