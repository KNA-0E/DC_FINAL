# The Detective Corps

Interactive DC Comics beginner guide, built with HTML, CSS, JavaScript, GSAP, and a Node.js / Express proxy for the Comic Vine API.

## Run locally

1. Install Node.js.
2. Open a terminal in `server/`.
3. Run `npm install`.
4. Copy `server/.env.example` to `server/.env` and set `COMICVINE_API_KEY` to your own valid key. **Never commit the `.env` file.**
5. Run `npm start`.
6. Open `http://localhost:3000` in your browser.

The Comic Vine-dependent search and automatically generated case files require the backend and a working API key. A GitHub repository alone does not host the server.

## Pages

- `index.html` — homepage and search
- `start-here.html` — reading paths
- `character.html` — character case files
- `saved.html` — saved characters

Independent educational fan project; not affiliated with DC.
