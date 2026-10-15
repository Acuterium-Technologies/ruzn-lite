import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'knowledge', 'corpus', 'SOVEREIGN_LEGAL_VECTOR_INDEX.sqlite');

function reindexCorpus() {
  console.log('[Reindex] Opening database:', DB_PATH);
  const db = new Database(DB_PATH);

  // 1. Find articles with empty decree_no
  const rows = db.prepare("SELECT id, document_id, decree_no FROM legal_articles WHERE decree_no IS NULL OR decree_no = ''").all() as any[];
  console.log(`[Reindex] Found ${rows.length} articles with empty decree_no`);

  const updateStmt = db.prepare("UPDATE legal_articles SET decree_no = ? WHERE id = ?");

  let updatedCount = 0;
  const updateTx = db.transaction(() => {
    for (const row of rows) {
      const m = row.document_id.match(/RUZN-(?:LW|RD|MD)-(\d+)-(\d+)/);
      if (m) {
        const decree = `${m[2]}/${m[1]}`;
        updateStmt.run(decree, row.id);
        updatedCount++;
      }
    }
  });

  updateTx();
  console.log(`[Reindex] Updated ${updatedCount} articles with decree numbers.`);

  // 2. Re-populate FTS5 index
  console.log('[Reindex] Refreshing legal_articles_fts table...');
  db.prepare("DELETE FROM legal_articles_fts").run();
  
  const insertFts = db.prepare(`
    INSERT INTO legal_articles_fts(document_id, decree_no, article_number, title_ar, text_ar)
    SELECT document_id, decree_no, article_number, title_ar, text_ar FROM legal_articles
  `);
  insertFts.run();

  const ftsCount = (db.prepare("SELECT count(*) as c FROM legal_articles_fts").get() as any).c;
  const totalCount = (db.prepare("SELECT count(*) as c FROM legal_articles").get() as any).c;
  console.log(`[Reindex] Complete. Total legal articles: ${totalCount}, Total in FTS5: ${ftsCount}`);

  db.close();
}

reindexCorpus();
