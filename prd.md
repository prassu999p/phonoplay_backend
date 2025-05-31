## PhonoPlay Masterplan

### 1. App Overview & Objectives

PhonoPlay is a web-based phonics learning tool for 3–6 year olds. It helps children practice specific phonetic sounds through a simple, engaging interface that combines visual cues, audio playback, and voice feedback. The primary objectives are:

* Make phonics practice intuitive and fun
* Leverage AI (LLMs and speech models) for adaptive pacing and feedback
* Deliver a reliable, low-latency experience within a 48‑hour MVP timeframe

### 2. Target Audience

* **Primary users:** Preschool and early-elementary children (ages 3–6) learning to read.
* **Secondary users:** Parents or guardians setting up and supervising practice sessions.

### 3. Core Features & Functionality

1. **Sound Selection (Home Page):** Multi-select grid of phonetic sounds.
2. **Start Practice:** "Start Practice" button to confirm selections.
3. **Practice Screen:**

   * Display chosen **word** + **relevant image**
   * **"Say It"** button to record pronunciation
   * **Replay** icon for correct audio
   * **Feedback** area (😊 or "Try again")
   * **Next** button to advance
4. **Adaptive Next-Word Recommendation:** GPT‑4-driven suggestion of the next word and complexity decisions.
5. **Pronunciation Assessment & Feedback:** Whisper + GPT‑4 pipeline to judge and advise on each utterance.
6. **Dynamic Encouragement:** Pre-generated kid‑friendly praise phrases to keep feedback varied.
7. **Credit System & Auth:** Supabase Auth + Profiles with limited API credits; no payment gateway, email outreach link for top‑up.

### 4. High‑Level Technical Stack

* **Frontend:** React (Create React App or Next.js) for fast iteration and static hosting.
* **Auth & Data:** Supabase Auth for login; Supabase Postgres for user profiles and credit balances.
* **Storage:** Supabase Storage for curated CC0 images (200×200 px WebP).
* **AI Services:**

  * **Whisper API** for speech-to-text transcription
  * **GPT‑4** for next-word and pronunciation feedback prompts
  * **Eleven Labs** for high-quality TTS playback
* **Deployment:** Vercel (or Netlify) hosting for static assets and environment variables.

### 5. Conceptual Data Model

* **User Profile** (table `profiles`)

  * `id` (UUID)
  * `email` (String)
  * `credits` (Integer)
  * `created_at` (Timestamp)
* **Word List** (local JSON)

  * `word` (String)
  * `phonemes` (Array of Strings)
  * `image_path` (String)
* **Session State** (in-memory)

  * `selectedPhonemes` (Array)
  * `currentWordIndex` (Integer)
  * `recentPerformance` (Array of Booleans)

### 6. Word List & Images

Below is a curated list of 200 simple, kid-friendly practice words (2–6 letters) along with their phoneme breakdowns and corresponding image paths. All image files are stored in Supabase Storage under `/public/img/` in WebP format.

| Word | Phonemes   | Image Path     |
| ---- | ---------- | -------------- |
| at   | \["A","T"] | `/img/at.webp` |
| an   | \["A","N"] | `/img/an.webp` |
| am   | \["A","M"] | `/img/am.webp` |
| as   | \["A","S"] | `/img/as.webp` |
| is   | \["I","S"] | `/img/is.webp` |
| it   | \["I","T"] | `/img/it.webp` |
| in   | \["I","N"] | `/img/in.webp` |
| on   | \["O","N"] | `/img/on.webp` |
| up   | \["U","P"] | `/img/up.webp` |
| us   | \["U","S"] | `/img/us.webp` |
| be   | \["B","E"] | `/img/be.webp` |
| by   | \["B","Y"] | `/img/by.webp` |
| do   | \["D","O"] | `/img/do.webp` |
| go   | \["G","O"] | `/img/go.webp` |
| he   | \["H","E"] | `/img/he.webp` |
| hi   | \["H","I"] | `/img/hi.webp` |
| if   | \["I","F"] | `/img/if.webp` |
| me   | \["M","E"] | `/img/me.webp` |
| my   | \["M","Y"] | `/img/my.webp` |
| no   | \["N","O"] | `/img/no.webp` |
| oh   | \["O","H"] | `/img/oh.webp` |
| so   | \["S","O"] | `/img/so.webp` |
| we   | \["W","E"] | `/img/we.webp` |

\| cat    | \["C","A","T"]            | `/img/cat.webp`      |
\| dog    | \["D","O","G"]            | `/img/dog.webp`      |
\| sun    | \["S","U","N"]            | `/img/sun.webp`      |
\| hat    | \["H","A","T"]            | `/img/hat.webp`      |
\| bat    | \["B","A","T"]            | `/img/bat.webp`      |
\| rat    | \["R","A","T"]            | `/img/rat.webp`      |
\| man    | \["M","A","N"]            | `/img/man.webp`      |
\| pan    | \["P","A","N"]            | `/img/pan.webp`      |
\| can    | \["C","A","N"]            | `/img/can.webp`      |
\| fan    | \["F","A","N"]            | `/img/fan.webp`      |
\| van    | \["V","A","N"]            | `/img/van.webp`      |
\| run    | \["R","U","N"]            | `/img/run.webp`      |
\| fun    | \["F","U","N"]            | `/img/fun.webp`      |
\| cup    | \["C","U","P"]            | `/img/cup.webp`      |
\| pup    | \["P","U","P"]            | `/img/pup.webp`      |
\| bed    | \["B","E","D"]            | `/img/bed.webp`      |
\| red    | \["R","E","D"]            | `/img/red.webp`      |
\| map    | \["M","A","P"]            | `/img/map.webp`      |
\| lap    | \["L","A","P"]            | `/img/lap.webp`      |
\| tap    | \["T","A","P"]            | `/img/tap.webp`      |
\| gap    | \["G","A","P"]            | `/img/gap.webp`      |
\| bag    | \["B","A","G"]            | `/img/bag.webp`      |
\| tag    | \["T","A","G"]            | `/img/tag.webp`      |
\| rag    | \["R","A","G"]            | `/img/rag.webp`      |
\| nag    | \["N","A","G"]            | `/img/nag.webp`      |
\| wag    | \["W","A","G"]            | `/img/wag.webp`      |
\| hog    | \["H","O","G"]            | `/img/hog.webp`      |
\| log    | \["L","O","G"]            | `/img/log.webp`      |
\| pig    | \["P","I","G"]            | `/img/pig.webp`      |
\| big    | \["B","I","G"]            | `/img/big.webp`      |
\| dig    | \["D","I","G"]            | `/img/dig.webp`      |
\| fig    | \["F","I","G"]            | `/img/fig.webp`      |
\| kid    | \["K","I","D"]            | `/img/kid.webp`      |
\| did    | \["D","I","D"]            | `/img/did.webp`      |
\| sit    | \["S","I","T"]            | `/img/sit.webp`      |
\| fit    | \["F","I","T"]            | `/img/fit.webp`      |
\| hit    | \["H","I","T"]            | `/img/hit.webp`      |
\| bit    | \["B","I","T"]            | `/img/bit.webp`      |
\| pit    | \["P","I","T"]            | `/img/pit.webp`      |
\| kit    | \["K","I","T"]            | `/img/kit.webp`      |
\| got    | \["G","O","T"]            | `/img/got.webp`      |
\| dot    | \["D","O","T"]            | `/img/dot.webp`      |
\| pot    | \["P","O","T"]            | `/img/pot.webp`      |
\| not    | \["N","O","T"]            | `/img/not.webp`      |
\| top    | \["T","O","P"]            | `/img/top.webp`      |
\| mop    | \["M","O","P"]            | `/img/mop.webp`      |
\| hop    | \["H","O","P"]            | `/img/hop.webp`      |
\| pop    | \["P","O","P"]            | `/img/pop.webp`      |
\| cop    | \["C","O","P"]            | `/img/cop.webp`      |

\| fish   | \["F","I","SH"]           | `/img/fish.webp`     |
\| ball   | \["B","A","L","L"]       | `/img/ball.webp`     |
\| cake   | \["C","A","K","E"]       | `/img/cake.webp`     |
\| ship   | \["SH","I","P"]           | `/img/ship.webp`     |
\| duck   | \["D","U","CK"]           | `/img/duck.webp`     |
\| frog   | \["F","R","O","G"]       | `/img/frog.webp`     |
\| lion   | \["L","I","O","N"]       | `/img/lion.webp`     |
\| bear   | \["B","E","AR"]            | `/img/bear.webp`     |
\| tree   | \["T","R","EE"]            | `/img/tree.webp`     |
\| book   | \["B","OO","K"]            | `/img/book.webp`     |
\| milk   | \["M","I","LK"]            | `/img/milk.webp`     |
\| food   | \["F","OO","D"]            | `/img/food.webp`     |
\| room   | \["R","OO","M"]            | `/img/room.webp`     |
\| toad   | \["T","O","AD"]            | `/img/toad.webp`     |
\| goat   | \["G","O","AT"]            | `/img/goat.webp`     |
\| boat   | \["B","O","AT"]            | `/img/boat.webp`     |
\| coat   | \["C","O","AT"]            | `/img/coat.webp`     |
\| seat   | \["S","E","AT"]            | `/img/seat.webp`     |
\| heat   | \["H","E","AT"]            | `/img/heat.webp`     |
\| beat   | \["B","E","AT"]            | `/img/beat.webp`     |
\| neat   | \["N","E","AT"]            | `/img/neat.webp`     |
\| meat   | \["M","E","AT"]            | `/img/meat.webp`     |
\| king   | \["K","I","NG"]            | `/img/king.webp`     |
\| ring   | \["R","I","NG"]            | `/img/ring.webp`     |
\| wing   | \["W","I","NG"]            | `/img/wing.webp`     |
\| sing   | \["S","I","NG"]            | `/img/sing.webp`     |
\| camp   | \["C","A","MP"]            | `/img/camp.webp`     |
\| lamp   | \["L","A","MP"]            | `/img/lamp.webp`     |
\| jump   | \["J","U","MP"]            | `/img/jump.webp`     |
\| bump   | \["B","U","MP"]            | `/img/bump.webp`     |
\| dump   | \["D","U","MP"]            | `/img/dump.webp`     |
\| tent   | \["T","E","NT"]            | `/img/tent.webp`     |
\| rent   | \["R","E","NT"]            | `/img/rent.webp`     |
\| bent   | \["B","E","NT"]            | `/img/bent.webp`     |
\| sent   | \["S","E","NT"]            | `/img/sent.webp`     |
\| went   | \["W","E","NT"]            | `/img/went.webp`     |
\| belt   | \["B","E","LT"]            | `/img/belt.webp`     |
\| melt   | \["M","E","LT"]            | `/img/melt.webp`     |
\| felt   | \["F","E","LT"]            | `/img/felt.webp`     |
\| golf   | \["G","O","LF"]            | `/img/golf.webp`     |

\| apple  | \["A","PP","L","E"]       | `/img/apple.webp`    |
\| happy  | \["H","A","PP","Y"]       | `/img/happy.webp`    |
\| candy  | \["C","A","N","DY"]       | `/img/candy.webp`    |
\| table  | \["T","A","B","L","E"]   | `/img/table.webp`    |
\| chair  | \["CH","A","IR"]            | `/img/chair.webp`    |
\| water  | \["W","A","T","E","R"]   | `/img/water.webp`    |
\| bread  | \["B","R","E","A","D"]   | `/img/bread.webp`    |
\| heart  | \["H","E","AR","T"]        | `/img/heart.webp`    |
\| light  | \["L","I","GH","T"]        | `/img/light.webp`    |
\| black  | \["B","L","A","CK"]        | `/img/black.webp`    |
\| white  | \["W","H","I","T","E"]    | `/img/white.webp`    |
\| green  | \["G","R","E","E","N"]    | `/img/green.webp`    |
\| small  | \["S","M","A","LL"]        | `/img/small.webp`    |
\| large  | \["L","A","R","G","E"]    | `/img/large.webp`    |
\| smell  | \["S","M","E","LL"]        | `/img/smell.webp`    |
\| house  | \["H","O","U","S","E"]    | `/img/house.webp`    |
\| mouse  | \["M","O","U","S","E"]    | `/img/mouse.webp`    |
\| horse  | \["H","O","R","SE"]        | `/img/horse.webp`    |
\| those  | \["TH","O","SE"]            | `/img/those.webp`    |
\| other  | \["O","TH","ER"]            | `/img/other.webp`    |
\| under  | \["U","N","D","ER"]        | `/img/under.webp`    |
\| super  | \["S","U","P","ER"]        | `/img/super.webp`    |
\| tiger  | \["T","I","G","ER"]        | `/img/tiger.webp`    |
\| pizza  | \["P","I","ZZ","A"]        | `/img/pizza.webp`    |
\| party  | \["P","A","R","TY"]        | `/img/party.webp`    |
\| silly  | \["S","I","LL","Y"]        | `/img/silly.webp`    |
\| funny  | \["F","U","NN","Y"]        | `/img/funny.webp`    |
\| bunny  | \["B","U","NN","Y"]        | `/img/bunny.webp`    |
\| spooky | \["S","P","OO","KY"]        | `/img/spooky.webp`   |
\| cookie | \["C","OO","K","IE"]        | `/img/cookie.webp`   |
\| donut  | \["D","O","NU","T"]        | `/img/donut.webp`    |
\| banana | \["B","A","N","A","N","A"] | `/img/banana.webp` |
\| little | \["L","I","TT","L","E"]    | `/img/little.webp`   |
\| summer | \["S","U","MM","E","R"]    | `/img/summer.webp`   |
\| winter | \["W","I","N","T","E","R"] | `/img/winter.webp` |
\| spring | \["S","P","R","I","NG"]    | `/img/spring.webp`   |
\| school | \["S","C","H","OO","L"]    | `/img/school.webp`   |
\| flower | \["F","L","O","W","ER"]    | `/img/flower.webp`   |
\| orange | \["O","R","A","N","G","E"] | `/img/orange.webp`  |
\| cherry | \["CH","E","R","R","Y"]   | `/img/cherry.webp`   |
\| kitten | \["K","I","TT","EN"]         | `/img/kitten.webp`   |
\| puppy  | \["P","U","PP","Y"]         | `/img/puppy.webp`    |
\| monkey | \["M","O","N","K","EY"]     | `/img/monkey.webp`   |
\| family | \["F","A","M","I","LY"]     | `/img/family.webp`   |
\| circle | \["C","IR","C","L","E"]     | `/img/circle.webp`   |
\| square | \["S","QU","A","R","E"]     | `/img/square.webp`   |
\| yellow | \["Y","EL","L","OW"]         | `/img/yellow.webp`   |
\| purple | \["P","UR","P","L","E"]     | `/img/purple.webp`   |
\| doctor | \["D","O","C","T","OR"]     | `/img/doctor.webp`   |
\| mother | \["M","O","TH","ER"]         | `/img/mother.webp`   |
\| father | \["F","A","TH","ER"]         | `/img/father.webp`   |
\| brother| \["B","R","O","TH","ER"]    | `/img/brother.webp`  |
\| sister | \["S","I","ST","ER"]         | `/img/sister.webp`   |
\| people | \["P","EO","P","LE"]         | `/img/people.webp`   |
\| animal | \["AN","I","M","A","L"]     | `/img/animal.webp`   |
\| lizard | \["L","I","Z","AR","D"]     | `/img/lizard.webp`   |
\| rabbit | \["R","A","BB","I","T"]     | `/img/rabbit.webp`   |
\| cookie | \["C","OO","K","IE"]         | `/img/cookie.webp`   |

### 7. UI Design Principles UI Design Principles UI Design Principles

* **Simplicity:** Clean screens with large tap targets and minimal text.
* **Clarity:** High-contrast colors, child-friendly icons, rounded shapes.
* **Responsiveness:** Instant transitions; preload next word + image in background.
* **Encouragement:** Gentle animations on correct answers; varied praise phrases.

### 7. Security & Privacy Considerations

* **Secure Auth:** Supabase-managed tokens; HTTPS for all endpoints.
* **Data Minimization:** No persistent child data beyond credits and generic usage metrics.
* **GDPR/CCPA:** Collect minimal email; no sensitive personal data.

### 8. Development Phases & Milestones

1. **Phase 1 (0–8 hrs):** Setup repo, auth, storage, basic UI flows.
2. **Phase 2 (8–16 hrs):** Integrate Whisper + GPT‑4 for word selection & feedback.
3. **Phase 3 (16–20 hrs):** Credit guard, encouragement phrases, preload optimizations.
4. **Phase 4 (20–24 hrs):** Testing, bug fixes, styling polish, demo recording.
5. **Phase 5 (24–48 hrs):** Buffer for contingencies, write-up, submit.

### 9. Potential Challenges & Solutions

* **API Latency:** Cache pre-generated encouragement phrases; preload next word/image.
* **Speech Accuracy:** Fine-tune GPT prompts; fallback to basic rule-based checks if needed.
* **Rate Limits:** Credit guard prevents bursts; use local fallbacks if AI calls fail.

### 10. Future Expansion Possibilities

* **Persistent Progress Tracking:** Store performance over sessions for parent dashboards.

* **Custom Illustrations:** AI‑generated images for novel vocabulary.

* **Gamification:** Badges, streaks, unlocking new phoneme sets.
