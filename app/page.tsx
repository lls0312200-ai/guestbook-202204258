import { listEntries } from "../lib/entries.mjs";
import { CreateEntryForm } from "./components/CreateEntryForm";
import { EntryItem } from "./components/EntryItem";

// Cache Components is not enabled (see next.config.ts / docs/adr/0004), so a plain
// database read is not auto-detected as dynamic. Force it explicitly: the list must
// always reflect the latest writes.
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function Home() {
  const entries = await listEntries();

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand" aria-label="코모레비 미니 방명록">
          <span className="brand-mark" aria-hidden="true">木</span>
          <span className="brand-name">komorebi <small>guestbook</small></span>
        </div>
        <span className="header-note">a little pause in your day · 2026</span>
      </header>

      <div className="intro-grid">
        <section className="welcome" aria-labelledby="welcome-title">
          <div className="welcome-content">
            <p className="eyebrow">喫茶 こもれび · 작은 쉼표</p>
            <h1 id="welcome-title">느리게 머물다,<br /><em>마음을 남기다.</em></h1>
            <p className="welcome-description">따뜻한 커피 한 잔처럼, 오늘의 작은 이야기를 이곳에 놓고 가세요.</p>
            <p className="welcome-signature">미니 방명록 <span aria-hidden="true">✳</span> 이이삭 · 202204258</p>
          </div>
          <div className="welcome-seal" aria-hidden="true"><span>木漏れ日</span><small>GOOD DAYS<br />TAKE TIME</small></div>
        </section>
        <CreateEntryForm />
      </div>

      <section className="entries-section" aria-labelledby="entries-title">
        <div className="entries-heading">
          <div>
            <p className="eyebrow">OUR LITTLE NOTES</p>
            <h2 id="entries-title">남겨진 이야기 <span>{entries.length.toString().padStart(2, "0")}</span></h2>
          </div>
          <p>하루의 조각들이 모이는 곳</p>
        </div>
        {entries.length === 0 ? (
          <p className="empty-state">아직 남겨진 이야기가 없어요. 첫 번째 인사를 남겨주세요.</p>
        ) : (
          <ul className="entry-list">
            {entries.map((entry) => (
              <EntryItem
                key={entry.id}
                entry={{
                  id: entry.id,
                  authorName: entry.authorName,
                  message: entry.message,
                  createdAtLabel: dateFormatter.format(new Date(entry.createdAt)),
                }}
              />
            ))}
          </ul>
        )}
      </section>
      <footer className="site-footer"><span>komorebi · 작은 순간을 오래 기억하는 곳</span><span>이이삭 · 202204258</span></footer>
    </main>
  );
}
