const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://horizon:horizon2025@cluster0.fnqfs79.mongodb.net/horizon-chimique?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('horizon-chimique');
    // The collection name according to Next.js models is usually the plural 'settings'
    const config = database.collection('settings');
    
    const updateDoc = {
      $set: {
        mobileApp: {
          latestVersion: "1.0.11",
          buildNumber: 11,
          forceUpdate: true,
          message: "Mise à jour majeure : Diagnostic Technique & Smart Devis intégrés !",
          downloadUrl: "https://sdkbatiment.com/sdk-batiment-app.apk"
        }
      },
    };
    
    // Find the first document and update it, if no document exists, it won't work without upsert
    // But since the site already shows 9, a document exists.
    const result = await config.updateOne({}, updateDoc, { upsert: true });
    
    console.log(`Successfully updated the database. matchedCount: ${result.matchedCount}, modifiedCount: ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
