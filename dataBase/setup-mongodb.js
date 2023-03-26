const colls = ['users', 'services'];
let schema = null;
let seedDocuments = null;

for (let i = 0; i < colls.length; ++i) {
    if (db.getCollectionNames().indexOf(colls[i]) === -1
            && fs.readdirSync(colls[i]).indexOf('schema.json') !== -1) {
        schema = JSON.parse(fs.readFileSync(`${colls[i]}/schema.json`, "utf-8"));
        db.createCollection(colls[i], {
            "validator": {
                $jsonSchema: schema
            },
            validationLevel: "strict",
            validationAction: "error"
        });
        }

        if (fs.readdirSync(colls[i]).indexOf('seeds.json') !== -1) {
            db.getCollection(colls[i]).drop();
            seedDocuments = JSON.parse(fs.readFileSync(`${colls[i]}/seeds.json`, "utf-8"));
            if (colls[i] === 'users') {
                for (const user of seedDocuments) {
                    user['_id'] = UUID(user['_id']);
                }
            }
            db.getCollection(colls[i]).insertMany(seedDocuments);
        }
}