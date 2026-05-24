import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import https from "https";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Same-origin Proxy for streaming files from Google Drive (CORS, Iframe bypass & Large bypass)
  app.get("/api/audio-proxy", (req, res) => {
    const fileId = req.query.id as string;
    if (!fileId) {
      return res.status(400).send("File ID is required");
    }

    const initialUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

    const makeReq = (targetUrl: string, cookies: string[] = [], depth = 0) => {
      if (depth > 6) {
        return res.status(500).send("Too many redirects in proxy source");
      }

      const parsedUrl = new URL(targetUrl);
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };

      if (cookies.length > 0) {
        headers["Cookie"] = cookies.join("; ");
      }

      // Pass client Range headers so the browser client can buffer and seek natively!
      if (req.headers["range"]) {
        headers["Range"] = req.headers["range"] as string;
      }

      const reqOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers,
      };

      const request = https.request(reqOptions, (response) => {
        const statusCode = response.statusCode || 200;
        const contentType = response.headers["content-type"] || "";

        // Collect new cookies from Google Drive
        const newCookies = response.headers["set-cookie"] || [];
        const updatedCookies = [...cookies];
        newCookies.forEach((c) => {
          const cookieNameVal = c.split(";")[0];
          if (cookieNameVal) {
            updatedCookies.push(cookieNameVal);
          }
        });

        // Handle redirect codes (301, 302, 303, 307 etc)
        if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
          let nextUrl = response.headers.location;
          if (nextUrl.startsWith("/")) {
            nextUrl = `https://${parsedUrl.hostname}${nextUrl}`;
          }
          makeReq(nextUrl, updatedCookies, depth + 1);
          return;
        }

        // If Google Drive gave us the large file anti-virus confirmation page:
        if (contentType.includes("text/html")) {
          let body = "";
          response.on("data", (chunk) => {
            body += chunk;
          });
          response.on("end", () => {
            // Locate confirmation code inside the HTML (e.g. confirm=xxxx)
            const confirmRegex = /confirm=([a-zA-Z0-9_-]+)/;
            const match = body.match(confirmRegex);

            if (match && match[1]) {
              const confirmToken = match[1];
              const confirmedUrl = `https://docs.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
              // Make follow up request with the confirmation code and collected session cookies
              makeReq(confirmedUrl, updatedCookies, depth + 1);
            } else {
              console.error("Direct download HTML warning page intercepted but confirm token not found.");
              res.status(500).send("Unable to parse download token from Google Drive");
            }
          });
          return;
        }

        // Set response state and proxy standard streaming headers
        res.statusCode = statusCode;

        const headersToForward = [
          "content-type",
          "content-length",
          "content-range",
          "accept-ranges",
          "content-disposition"
        ];

        headersToForward.forEach((h) => {
          if (response.headers[h]) {
            res.setHeader(h, response.headers[h]!);
          }
        });

        // Setup CORS and cache settings
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Range, Content-Range, Content-Type");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

        // Pipe response stream directly
        response.pipe(res);
      });

      request.on("error", (err) => {
        console.error("Proxy streaming error:", err);
        if (!res.headersSent) {
          res.status(500).send("Proxy retrieval failed");
        }
      });

      request.end();
    };

    makeReq(initialUrl);
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
