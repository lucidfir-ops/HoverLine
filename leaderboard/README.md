# Hoverline online leaderboard kit

A tiny Cloudflare Worker plus a D1 (SQLite) database. The free plan covers it comfortably
(100,000 requests a day, 5 GB of D1 storage). The game already has the client built in, and it stays
switched off until you paste your worker's address into `LB_URL`.

## What it does

- After each finished race the game sends: track code, lap count, pilot name, ship frame, race time, best lap and track length.
- The results card then shows the top 5 for that track and lap count, plus your rank (for example "you're #3 of 12").
- Each pilot's best time per track is what counts. The name comes from the Multiplayer screen's name box.
- Nothing personal is stored. Rate limiting uses a salted hash of the sender's IP; the IP itself is never kept.
- The server does plausibility checks, not proof:
  - no average speed above 240 m/s;
  - the best lap can't be slower than the average lap (race time ÷ laps), since your best lap is always at least as fast as your average;
  - six submissions a minute per sender at most.

  Anyone determined can still post a fake time with a hand-written request, so treat it as a friendly board.

## Deploy in the browser (no installs, about 10 minutes, once)

1. Make a free Cloudflare account and open the dashboard.
2. **Create the database.** Go to **D1 SQL database** and select **Create Database**. Name it `hoverline` and select **Create**.
3. **Create the table.** Open the `hoverline` database and select **Console**. Paste everything in `schema.sql`, then select **Execute**.
4. **Create the Worker.** Go to **Workers & Pages** and select **Create application**. Choose **Start with Hello World!**, then **Get started**. Name it `hoverline-board` and select **Deploy**.
5. **Add the code.** Open `hoverline-board` and select **Edit code** (**</>**). Replace everything in `worker.js` with this kit's `worker.js` and select **Save**. Then go to **Deployments**, select **Deploy version**, then **Deploy**.
6. **Connect the database.** On the Worker, go to **Bindings** and select **Add binding**. Choose **D1 database**, then **Add binding**. Set **Variable name** to exactly `DB`, pick `hoverline` from the list, and select **Add binding**.
7. Copy the Worker's address (like `https://hoverline-board.<you>.workers.dev`) and paste it into `LB_URL` (or send it to Claude).

## Deploy from the command line (alternative; needs Node.js from nodejs.org)

1. Make a free Cloudflare account. Install Node, then run `npm i -g wrangler` and `wrangler login`.
2. In this folder, run `wrangler d1 create hoverline`. Copy the `database_id` it prints into `wrangler.toml`.
3. Create the table: `wrangler d1 execute hoverline --remote --file=schema.sql`.
4. Optionally set a private salt: `wrangler secret put SALT` (type any random text).
5. Deploy with `wrangler deploy`. It prints an address like `https://hoverline-board.<you>.workers.dev`.
6. In `hoverline.html`, find the `const LB_URL=` line and put that address between the quotes. Rebuild and upload to itch as usual.

To try it without editing the file, open the game with `?lb=https://hoverline-board.<you>.workers.dev` on the end of its address.

## Look after it

- Remove a bad entry with `wrangler d1 execute hoverline --remote --command "DELETE FROM runs WHERE name='Cheater'"`.
- See a board with `wrangler d1 execute hoverline --remote --command "SELECT name, MIN(time_ms) FROM runs WHERE track='W5F0917' AND laps=3 GROUP BY name ORDER BY 2 LIMIT 20"`.

## API

- `GET /top?track=CODE&laps=3` returns `{rows:[{name,ship,time,lap,at}], total}`.
- `POST /run` takes `{track,laps,name,ship,time,lap,len}` and returns `{rank, best, rows, total}`. Errors come back as `{error}` with status 400, 422 or 429.
