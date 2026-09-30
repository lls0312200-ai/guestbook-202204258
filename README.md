# 미니 방명록 (guestbook-202204258)

개발자: 이이삭 (학번 202204258). 로그인 없이 이름·메시지·비밀번호로 글을 남기고, 같은 비밀번호로만 수정(메시지만)·삭제할 수 있는 단일 페이지 방명록입니다.

## 제출 주소

- GitHub Repository (public): https://github.com/lls0312200-ai/guestbook-202204258
- Vercel 배포: https://guestbook-202204258.vercel.app

2026-09-30에 배포 주소에서 작성, 새로고침 후 조회, 틀린/정상 비밀번호로 수정·삭제를 확인했습니다. 검증용 글은 삭제했습니다.

배경 문서: `docs/exam-brief.md`(요구사항), `GLOSSARY.md`(용어), `docs/adr/`(결정 근거), `.scratch/guestbook/spec.md`와 `.scratch/guestbook/issues/`(구현 스펙·티켓).

## 스택

- Next.js 16 (App Router) + TypeScript, React 19
- Neon Postgres (`@neondatabase/serverless`, 파라미터화된 SQL, ORM 없음)
- Vercel 배포
- 비밀번호는 `node:crypto` `scrypt` + 솔트로 서버에서만 해시/검증 (평문 저장·응답 없음)

## 로컬 설정

1. 의존성 설치:

   ```bash
   npm install
   ```

2. Neon 프로젝트(`guestbook-202204258`)의 연결 문자열을 `.env.local`에 넣습니다 (`.env.example` 참고). 이 파일은 `.gitignore`에 의해 절대 커밋되지 않습니다:

   ```
   DATABASE_URL=postgresql://...
   ```

3. DB 연결을 확인합니다 (읽기 전용 `SELECT 1`):

   ```bash
   npm run db:check
   ```

4. `entries` 테이블을 준비합니다 (없으면 생성, 있으면 그대로 두는 멱등 스크립트):

   ```bash
   npm run db:setup
   ```

5. 개발 서버 실행:

   ```bash
   npm run dev
   ```

   http://localhost:3000 에서 작성·조회·수정·삭제와 잘못된 비밀번호 거부를 확인합니다.

## 검증

```bash
npm run lint          # ESLint
npm run typecheck      # next typegen && tsc --noEmit
npm run build          # 프로덕션 빌드 (list 페이지가 dynamic으로 렌더링되는지 포함)
npm run db:check       # Neon 연결 확인
npm run test:lifecycle # 생성→조회→수정(오답/정답 비밀번호)→삭제(오답/정답 비밀번호) 전체 흐름 1개 테스트, 종료 시 테스트 항목 자동 정리
```

`npm run check`는 lint + typecheck + build를 한 번에 실행합니다. DB가 필요한 `db:check`/`db:setup`/`test:lifecycle`은 `DATABASE_URL`이 설정된 환경에서 별도로 실행하세요.

## 배포 (Vercel)

이 저장소는 Vercel Git 연동이 설정되어 있지 않으므로, GitHub에 push해도 자동 배포되지 않습니다. 이미 `.vercel/project.json`에 `guestbook-202204258` 프로젝트가 연결되어 있으니, 인증된 Vercel CLI로 직접 배포합니다:

```bash
vercel deploy --prod
```

배포 전 Vercel 프로젝트(`guestbook-202204258`)의 환경 변수에 `DATABASE_URL`(Neon 연결 문자열)을 등록해야 합니다. 배포 후에는 라이브 URL에서 작성·조회·수정·삭제·비밀번호 거부를 실제로 눌러 확인합니다 (`.scratch/guestbook/issues/03-...md`의 production 체크리스트 참고).

## 비밀 정보 안전 수칙

- `DATABASE_URL`은 `.env.local`(로컬)과 Vercel 프로젝트 환경 변수(배포)에만 존재하며, 코드나 커밋, 로그, 서버 응답에 절대 출력하지 않습니다. `scripts/check-db.mjs`, `scripts/setup-db.mjs`는 실패 시에도 자격 증명을 출력하지 않습니다.
- 방명록 비밀번호는 `salt:hash` 형태의 scrypt 해시로만 저장되며, 원문은 어떤 응답에도 포함되지 않습니다.
- `.gitignore`가 `.env*`(단, `.env.example`은 예외)와 `.vercel`을 커밋에서 제외합니다.
