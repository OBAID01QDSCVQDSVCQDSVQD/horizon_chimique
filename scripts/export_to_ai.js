
const { MongoClient } = require('mongodb');

async function exportProducts() {
  const uri = "mongodb+srv://horizon:horizon2025@cluster0.fnqfs79.mongodb.net/horizon-chimique?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('horizon-chimique');
    const products = database.collection('products');

    const cursor = products.find({});
    const allProducts = await cursor.toArray();

    console.log("--- عقل الهيومانويد: قائمة المنتجات المستخرجة بدقة ---");
    allProducts.forEach(p => {
      console.log(`المنتج: ${p.designation}`);
      console.log(`الفئة: ${p.gamme?.join(', ')}`);
      console.log(`وصف سريع: ${p.description_courte}`);
      console.log(`الاستهلاك: ${p.consommation || 'غير محدد'}`);
      console.log(`الميزات: ${p.avantages?.join(' - ') || 'غير محدد'}`);
      console.log(`الرابط: https://sdkbatiment.com/products/${p._id}`);
      console.log("---");
    });

  } finally {
    await client.close();
  }
}

exportProducts().catch(console.error);
