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
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">미니 방명록</h1>
        <p className="text-sm text-slate-500">개발자: 이이삭 (학번 202204258)</p>
      </header>

      <CreateEntryForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-800">전체 목록 ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">아직 작성된 글이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-3">
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
    </main>
  );
}
