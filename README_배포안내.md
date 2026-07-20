# 지망ノ 팬사이트 — 배포 안내

## 0. 채워야 할 자리표시 5곳
| 파일 | 자리 | 넣을 값 |
|---|---|---|
| `supabase.js` (2줄) | `{{SUPABASE프로젝트ID}}` · `{{SUPABASE_ANON_KEY}}` | Supabase → Settings → API |
| `supabase.js` | `{{버킷이름}}` | 이미지 업로드 헬퍼용 (링크 방식만 쓰면 안 건드려도 됨) |
| `overlay/index.html` (55줄 부근) | `{{SUPABASE프로젝트ID}}` · `{{SUPABASE_ANON_KEY}}` | ⚠️ 오버레이는 자체 createClient라 별도로 채워야 함 |
| `admin/index.html` | `{{관리자비밀번호}}` | **버리는 비밀번호** (소스에 그대로 보임) |

채운 뒤 `grep -r "{{" .` 로 잔여 0 확인.

## 1. Supabase
1. New project 생성 (한 프로젝트 = 한 사람)
2. SQL Editor → `supabase_jimang.sql` 전체 붙여넣기 → Run
   - 표 11개 생성 + `profile` id=1 초기값(지망ノ 정보 64키) + 업보 종류 예시 5개
   - 이미 다른 사람 데이터가 있는 프로젝트면 SQL 안의 `-- DELETE FROM profile WHERE id = 1;` 주석을 풀고 Run

## 2. GitHub
폴더 구조 그대로 업로드. **`fx.js`·`style.css`·`supabase.js`는 루트.**

```
index.html  style.css  supabase.js  fx.js  supabase_jimang.sql
profile/  notice/  schedule/  work/  song/  dress/  minigame/  (각 index.html)
admin/index.html   overlay/index.html
```

## 3. Cloudflare Pages
Connect to Git → repo 선택 → Framework: **None** (빌드 설정 비움) → Deploy

## 4. SOOP 게시글 삽입
```html
<iframe height="2400" scrolling="no" src="배포주소" style="width:100%;border:0;display:block;"></iframe>
```

## 5. keep-alive (Supabase 무료 티어)
`.github/workflows/keep-alive.yml` 로 월·목 UTC 자정 호출, secrets: `SUPABASE_URL`, `SUPABASE_ANON`

---

## 값 동기화 지점 (나중에 항목 바꿀 때 같이 고칠 것)

| 항목 | 고쳐야 할 곳 |
|---|---|
| 노래 장르 | `song/index.html`의 `GENRES` ↔ `admin/index.html`의 `SONG_GENRES` (**2곳**) |
| 옷장 분류 | `dress/index.html`의 `CATS` ↔ `admin`의 `DRESS_CATS` ↔ admin `<select id="dr-cat">`(DRESS_CATS로 자동생성) (**2곳 + SQL 기본값**) |
| 업보 분류 | `work/index.html`의 `UPBO_CATS` ↔ `admin`의 `ut-cat` select (**2곳**) |
| 프로필 키 | `admin`의 `profileKeys` ↔ `f-{키}` 입력칸 ↔ 페이지 `data-hook`/로더 (**3집합 일치**, 현재 58개 · 죽은 필드 0) |
| 방송 요일 | **0=월 … 6=일** — admin 체크박스 값과 페이지 `day-0~6`이 같은 규칙 |

## 색 바꾸기
admin → 🎨 테마 탭에서 6색(메인/메인진한/외곽선/메인연한/배경/로고)을 바꾸고 저장하면
`supabase.js`의 `applyTheme()`이 **모든 페이지 CSS 변수**에 자동 적용합니다.
(코드에서 직접 바꾸려면 `index.html`의 `:root`와 `style.css`의 `:root` **두 곳 같은 값**)

## 미니게임 룰렛 항목
admin → 🎮 미니게임 탭에서 한 줄에 하나씩. 2~12개. 비우면 기본 목록이 나옵니다.
