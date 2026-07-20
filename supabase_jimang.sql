-- =============================================================
-- 지망ノ 팬사이트 — Supabase 전체 셋업 SQL (한 번에 붙여넣기용)
-- 사용법: Supabase → SQL Editor → 아래 전체 복붙 → Run.
-- ✅ 여러 번 다시 실행해도 안전 (CREATE ... IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ✅ 모든 표는 anon(공개) 키로 읽기+쓰기 허용 — 관리자 페이지가 anon 키로 동작하므로 필수.
-- 안 쓰는 카테고리가 있어도 표는 그냥 둬도 무방(빈 표는 아무 영향 없음).
-- 이미지는 "링크" 방식이라 Storage(버킷) 없이도 동작합니다.
-- =============================================================


-- ── 프로필 (메인: id=1 한 칸에 JSON 저장) ──
CREATE TABLE IF NOT EXISTS profile (
  id         BIGINT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_all" ON profile;
CREATE POLICY "profile_all" ON profile FOR ALL USING (true) WITH CHECK (true);


-- ── 공지 ──
CREATE TABLE IF NOT EXISTS notice (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT,
  pinned     BOOLEAN DEFAULT FALSE,
  image_url  TEXT,
  images     JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notice ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE notice ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE notice ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notice_all" ON notice;
CREATE POLICY "notice_all" ON notice FOR ALL USING (true) WITH CHECK (true);


-- ── 일정 (달력) — 색/하이라이트/2부/설명 포함 ──
CREATE TABLE IF NOT EXISTS schedule (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TEXT,
  type        TEXT DEFAULT '일반',          -- 일반 / 특별 / 콜라보 / 휴방
  note        TEXT,
  color       TEXT DEFAULT 'green',
  highlight   BOOLEAN DEFAULT FALSE,
  time2       TEXT,
  title2      TEXT,
  type2       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS color       TEXT DEFAULT 'green';
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS highlight   BOOLEAN DEFAULT FALSE;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS time2       TEXT;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS title2      TEXT;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS type2       TEXT;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "schedule_all" ON schedule;
CREATE POLICY "schedule_all" ON schedule FOR ALL USING (true) WITH CHECK (true);


-- ── 노래책: 커버곡 ──
CREATE TABLE IF NOT EXISTS songs (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  artist     TEXT,
  genre      TEXT DEFAULT '기타',
  difficulty INT  DEFAULT 3,
  memo       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "songs_all" ON songs;
CREATE POLICY "songs_all" ON songs FOR ALL USING (true) WITH CHECK (true);


-- ── 노래책: 오리지널 곡 (SOOP VOD) ──
CREATE TABLE IF NOT EXISTS original_songs (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  vod_id     TEXT,
  thumbnail  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE original_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "original_songs_all" ON original_songs;
CREATE POLICY "original_songs_all" ON original_songs FOR ALL USING (true) WITH CHECK (true);


-- ── 옷장 (헤어 / 렌즈 / 의상) — 이미지는 image_url(링크) ──
CREATE TABLE IF NOT EXISTS public.dress_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL DEFAULT 'hair',   -- hair / lens / outfit
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_key   TEXT DEFAULT '',                -- (안 씀) R2용 키
  image_url   TEXT DEFAULT '',                -- 이미지 링크(붙여넣은 주소)
  badges      JSONB DEFAULT '[]',             -- 예: [{"label":"NEW"}]
  is_event    BOOLEAN DEFAULT FALSE,
  glow_color  TEXT DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dress_items_category ON public.dress_items(category);
ALTER TABLE public.dress_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dress_all" ON public.dress_items;
CREATE POLICY "dress_all" ON public.dress_items FOR ALL USING (true) WITH CHECK (true);


-- ── 업보: 시청자 ──
CREATE TABLE IF NOT EXISTS viewers (
  id         BIGSERIAL PRIMARY KEY,
  nickname   TEXT NOT NULL,
  soop_id    TEXT,
  memo       TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE viewers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "viewers_all" ON viewers;
CREATE POLICY "viewers_all" ON viewers FOR ALL USING (true) WITH CHECK (true);


-- ── 업보: 타입(종류) ──
CREATE TABLE IF NOT EXISTS upbo_types (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT DEFAULT '기본',            -- 기본 / 상시 / 이벤트 / 듀오권
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE upbo_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "upbo_types_all" ON upbo_types;
CREATE POLICY "upbo_types_all" ON upbo_types FOR ALL USING (true) WITH CHECK (true);
UPDATE upbo_types SET category = '기본' WHERE category IS NULL OR category = '' OR category = '일반';


-- ── 업보: 카운트 (시청자 × 타입 = 횟수) ──
CREATE TABLE IF NOT EXISTS upbo_counts (
  id         BIGSERIAL PRIMARY KEY,
  viewer_id  BIGINT NOT NULL,
  type_id    BIGINT NOT NULL,
  count      INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (viewer_id, type_id)
);
ALTER TABLE upbo_counts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "upbo_counts_all" ON upbo_counts;
CREATE POLICY "upbo_counts_all" ON upbo_counts FOR ALL USING (true) WITH CHECK (true);


-- ── 문의함 ──
CREATE TABLE IF NOT EXISTS inquiries (
  id         BIGSERIAL PRIMARY KEY,
  nickname   TEXT,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inquiries_all" ON inquiries;
CREATE POLICY "inquiries_all" ON inquiries FOR ALL USING (true) WITH CHECK (true);


-- ── (옷장 OBS 오버레이 쓸 때만) "지금 트는 노래" 상태 1행 ──
CREATE TABLE IF NOT EXISTS public.overlay_state (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  song_title  TEXT DEFAULT '',
  song_artist TEXT DEFAULT '',
  is_visible  BOOLEAN DEFAULT FALSE,          -- ⚠️ OBS에 보이려면 true
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.overlay_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.overlay_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "overlay_all" ON public.overlay_state;
CREATE POLICY "overlay_all" ON public.overlay_state FOR ALL USING (true) WITH CHECK (true);


-- ── 프로필 기본 행(id=1) 보장 ──
-- ⚠️ 한 Supabase 프로젝트는 "한 사람"에게만 쓰세요.
--    이미 다른 사람 데이터가 들어있는 프로젝트를 재사용하면, 아래 INSERT는
--    DO NOTHING 때문에 옛 데이터를 덮어쓰지 않습니다(= 프사·이름이 옛 사람으로 보임).
--    새 사람으로 갈아끼울 땐, 아래 줄의 맨 앞 '--' 를 지워서 한 번 실행하면 프로필이 비워집니다.
-- DELETE FROM profile WHERE id = 1;
INSERT INTO profile (id, data) VALUES (1, '{"soop-id": "jimang2", "avatar": "", "info-name": "지망ノ", "info-en": "ジマン · RUSH", "info-catchphrase": "정신체리", "info-gender": "여", "info-team": "RUSH", "info-fandom": "용망", "info-debut": "2023.02.07", "info-birth": "02.12", "info-content": "저챗·게임·노래", "info-song": "첫사랑", "info-tags": "시티팝, 첫사랑, 보라", "hero-quote": "「난 너 좋아해」", "main-art": "https://stimg.sooplive.com/NORMAL_BBS/9/26494629/195569ee6ac1cf4a8.gif", "main-story": "발로란트 · 마인크래프트 · 로스트아크를 주로 하고, 가끔 노래도 불러요.\n시그니처 곡 첫사랑 — 인디 & 발라드", "like1": "용망", "like2": "보라색", "like3": "게임", "like4": "잠", "dislike1": "오이", "dislike2": "좀비", "dislike3": "갑툭튀", "dislike4": "더위", "days": "0,1,2,3,4,5", "day-label": "랜덤", "day-note": "주 1일 휴방 · 방송 시간은 랜덤입니다", "rule1-title": "서로 존중하기", "rule1-body": "비방 · 욕설 · 인신공격 금지", "rule2-title": "민감한 주제 금지", "rule2-body": "정치 · 종교 등", "rule3-title": "타 방송인 언급 금지", "rule3-body": "비교 · 타스 유도 포함", "rule4-title": "시청자 간 사담 자제", "rule4-body": "소통은 지망이랑 해주세요", "link-soop": "https://www.sooplive.com/station/jimang2", "link-yt": "", "link-x": "", "link-discord": "", "link-cafe": "", "link-fancim": "", "quote": "웃으면서 방송 켜고, 웃으면서 끄는 게 목표예요.\n오늘도 와줘서 고마워요 — 용망 💜", "tmi-mood": "밝음 · 귀여움 · 백치미", "tmi-game": "발로란트 · 마크 · 로아", "tmi-food": "체리", "tmi-song": "첫사랑", "tmi-etc": "방송 시간은 랜덤이에요. 일요일은 쉬어요!\n보라색이 들어간 건 일단 다 좋아합니다.", "stat1": "텐션:95", "stat2": "노래:85", "stat3": "게임 실력:70", "stat4": "백치미:99", "stat5": "멘탈:60", "ms1": "달성|2023.02.07 데뷔 방송", "ms2": "달성|첫 커버곡 「첫사랑」 공개", "ms3": "진행중|애청자 목표 달성하기", "ms4": "예정|첫 단독 노래방송", "ms5": "", "mg-roulette": "발로란트\n마인크래프트\n로스트아크\n노래방송\n저챗\n시청자 참여", "theme-main": "#e05fb4", "theme-main-dark": "#6b3fa0", "theme-main-deep": "#1b0f38", "theme-main-light": "#bca5fa", "theme-bg": "#241344", "theme-logo": "#1b0f38"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 이미 id=1 행이 있는데 초기값으로 덮어쓰고 싶다면 위 DELETE 줄을 풀고 다시 Run 하세요.

-- 끝! 이미지는 전부 "링크" 방식이라 Storage 설정이 필요 없습니다.

-- ── (선택) 업보 종류 예시 — 필요 없으면 지우고 Run ──
INSERT INTO upbo_types (name, category, sort_order) VALUES
  ('지각', '기본', 1), ('약속 어김', '기본', 2),
  ('상시 미션', '상시', 3), ('이벤트 참여', '이벤트', 4), ('듀오권', '듀오권', 5)
ON CONFLICT DO NOTHING;

-- 끝! 이미지는 전부 "링크" 방식이라 Storage 설정이 필요 없습니다.
