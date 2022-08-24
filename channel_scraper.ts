// Copyright (c) 2022 Itz-fork

import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.33-alpha/deno-dom-wasm.ts";

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

// deno-lint-ignore require-await
async function get_images(msg: Element) {
  let imgs = [];
  let pre = msg.previousElementSibling;
  if (pre?.nodeName === "DIV") {
    for (const cnt of pre.getElementsByTagName("a")) {
      imgs.push(cnt?.getAttribute("style")?.match(/(?<=\(')(.*?)(?='\))/)[0]);
    }
  } else {
    imgs.push(pre?.getAttribute("style")?.match(/(?<=\(')(.*?)(?='\))/)[0]);
  }
  return imgs;
}

async function fetch_posts(channel: string) {
  // Fetch html
  const resp = await (await fetch(`https://t.me/s/${channel}`)).text();
  const html = new DOMParser().parseFromString(resp, "text/html");

  // Grab messages
  const messages = html?.getElementsByClassName(
    "tgme_widget_message_text js-message_text",
  );

  // Prepare messages
  let messages_list = [];
  for (const [index, msg] of messages.entries()) {
    msg.nextElementSibling;
    let foot = msg.nextElementSibling;
    let vis = foot?.getElementsByClassName("tgme_widget_message_views")[0];
    let purl = foot?.getElementsByClassName("tgme_widget_message_date")[0];
    let tim = foot?.getElementsByTagName("time")[0];

    messages_list.push({
      text: await remove_tags(msg.innerHTML),
      views: vis ? vis.innerText : "",
      post_url: purl ? purl.getAttribute("href") : "",
      time: tim ? tim.getAttribute("datetime") : "",
      media: await get_images(msg),
    });
  }
  return messages_list;
}

export default fetch_posts;
