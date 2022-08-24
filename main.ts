// Copyright (c) 2022 Itz-fork
import { Application, Router } from "https://deno.land/x/oak@v11.0.0/mod.ts";
import fetch_posts from "./channel_scraper.ts";

const app = new Application();
const router = new Router();


// deno-lint-ignore require-await
router.get("/", async (ctx) => {
  ctx.response.body = {
    status: "online",
    developer: "https://github.com/Itz-fork",
  };
  return ctx.response.body;
});

router.get("/:channel", async (ctx) => {
  const query = ctx.params.channel;
  ctx.response.body = await fetch_posts(query);
  return ctx.response.body;
});

app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port: 8000 });
