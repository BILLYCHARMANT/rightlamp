import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function save(dir, name, url) {
  const outDir = join(root, "public", dir);
  mkdirSync(outDir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, name), buf);
  console.log(`saved ${dir}/${name} (${buf.length}b)`);
}

const portfolio = {
  "commercial-1.jpg": "https://i.ibb.co/5x1h2Qh/ele7.jpg",
  "commercial-2.jpg": "https://i.ibb.co/WpXnGng/elect3.jpg",
  "commercial-3.jpg": "https://i.ibb.co/TB0fR2v/a5.jpg",
  "residential-1.jpg": "https://i.ibb.co/4MBfbGw/resident4.jpg",
  "residential-2.jpg": "https://i.ibb.co/gFcnnbd/home01.jpg",
  "residential-3.jpg": "https://i.ibb.co/jw21W6V/R7A9867.jpg",
  "industrial-1.jpg": "https://i.ibb.co/nsbCBMj/ELE2.jpg",
  "industrial-2.jpg": "https://i.ibb.co/hWtc8NG/tool4.jpg",
  "industrial-3.jpg": "https://i.ibb.co/72LN3f3/R7A9876.jpg",
  "shop-1.jpg": "https://i.ibb.co/tpxXK5b/ac.jpg",
  "shop-2.jpg": "https://i.ibb.co/WDg43h4/p.jpg",
  "shop-3.jpg": "https://i.ibb.co/F5XgFbH/s.jpg",
  "solar-1.jpg": "https://i.ibb.co/Mgvn0LW/solar1.jpg",
  "solar-2.jpg": "https://i.ibb.co/L6dTF0V/solar2.jpg",
  "solar-3.jpg": "https://i.ibb.co/sJWKy7p/solar3.jpg",
};

const services = {
  "hero.jpg": "https://i.ibb.co/hWtc8NG/tool4.jpg",
  "biogas.jpg": "https://i.ibb.co/fxtgfGV/bd.jpg",
  "installation.jpg": "https://i.ibb.co/5x1h2Qh/ele7.jpg",
  "maintenance.jpg": "https://i.ibb.co/nsbCBMj/ELE2.jpg",
  "manufacture.jpg": "https://i.ibb.co/gFcnnbd/home01.jpg",
  "retail.jpg": "https://i.ibb.co/tpxXK5b/ac.jpg",
  "research.jpg": "https://i.ibb.co/Mgvn0LW/solar1.jpg",
};

const about = {
  "historical-1.jpg": "https://i.ibb.co/8cF59Tk/ab.jpg",
  "historical-2.png": "https://i.ibb.co/sCQWzY5/Capture.png",
  "story-meeting.jpg": "https://i.ibb.co/VjHJf8N/2022-03-04-07-57-IMG-0477.jpg",
  "hero-team.jpg": "https://i.ibb.co/MGLkMNY/2022-03-04-08-04-IMG-0476.jpg",
};

const team = {
  "julien-dushimimana.png": "https://i.ibb.co/CvNHDXc/circle-teamtwo.png",
  "ntirenganya-vedaste.png": "https://i.ibb.co/3SLsQYh/circle-team3.png",
  "jean-de-dieu-nyandwi.png": "https://i.ibb.co/HBdQtH1/shine.png",
  "tuyizere-diane.jpg": "https://i.ibb.co/7pVrPjj/2022-03-04-08-45-IMG-0478.jpg",
};

for (const [name, url] of Object.entries(portfolio)) {
  await save("portfolio", name, url);
}
for (const [name, url] of Object.entries(services)) {
  await save("services", name, url);
}
for (const [name, url] of Object.entries(about)) {
  await save("about", name, url);
}
for (const [name, url] of Object.entries(team)) {
  await save("team", name, url);
}

console.log("All RLSGL assets downloaded.");
