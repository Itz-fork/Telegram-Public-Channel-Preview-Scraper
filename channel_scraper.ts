// Copyright (c) 2022 Itz-fork

import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.33-alpha/deno-dom-wasm.ts";

// deno-lint-ignore require-await no-explicit-any
async function remove_tags(html: any) {
  html = html.replace(/<br>/g, "$br$");
  html = html.replace(/(?:\r\n|\r|\n)/g, "$br$");
  let tmp = new DOMParser().parseFromString(
    "<html><body></body></html>",
    "text/html",
  )?.createElement("DIV");
  tmp.innerHTML = html;
  html = tmp.textContent || tmp.innerText;
  html = html.replace(/\$br\$/g, "\n");
  return html;
}

async function fetch_posts(channel: string) {
  // Fetch html
  const resp = await (await fetch(`https://t.me/s/${channel}`)).text();
  const html = new DOMParser().parseFromString(resp, "text/html");

  // Grab messages
  const messages = html?.getElementsByClassName(
    "tgme_widget_message_text js-message_text",
  );
  const footers = html?.getElementsByClassName(
    "tgme_widget_message_footer compact js-message_footer",
  );

  // Prepare messages
  let messages_list = [];
  for (const [index, msg] of messages.entries()) {
    let foot = footers[index];
    messages_list.push({
      text: await remove_tags(msg.innerHTML),
      views:
        foot.getElementsByClassName("tgme_widget_message_views")[0].innerText,
      post_url: foot.getElementsByClassName("tgme_widget_message_date")[0]
        .getAttribute("href"),
      time: foot.getElementsByTagName("time")[0].getAttribute("datetime"),
      media: msg.previousElementSibling?.getAttribute("style")?.match(
        /(?<=\()(.*?)(?=\))/,
      ),
    });
  }
  return messages_list;
}

export default fetch_posts;