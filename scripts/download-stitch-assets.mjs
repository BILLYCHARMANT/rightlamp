import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Exact image URLs from stitch-live/*.html — project 3654913102318098977 */
const stitchAssets = {
  "hero-bootcamp.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLt4MoEvBdwUglEORvaqLu1U6N2Ue0vxSGg_uKFZ1_Lmn1iTYiRw9K3P2rPS7e3WjKYO5JarGFB25Dfs5jCWfKmzf3-3oIx23slAGceFa6j8zgr0LbF5f5f9-hrd2ChfitRTN7rzyWUl976DPaM_00IhUkf7ujfm3b5hoUiiycL-4Yp91F5vjd67WiRpxyZYBHFH4SqZ1OD9WWp9HGnjWuV8FkmLQwnRHqY7iXSz4S7HuRe3cVkZF_VTpA",
  "story-team.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLvPbA1q-VNyvjHBUKb5jyPS94cnaphoVgV-8bqSrN41SfJveijDbd8iY5Tk7fC_vZjJ2gx5IkKnYcywI2DWkrzCs-ByDNMvihas0nmIA9QgFYFhmoYLlSupASBW6uCmF0sIuTNj88xvxiNJS_kqRqPDGGGDaj2wXwZyzLGQZEqmteKxGo1GQoRGWKyqssO8X0H9CIH-juG0K85ginloVvVQfdb4cy7xJDo5taXhedqVHLiQfGIBgXb2QnA",
  "impacts-award.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLuq3knH_z2kVMebtSS4tX5fZqkmnyWYLtkhlpip2FEGzG5yE5R6RYtwXa0UWFYe5vetViUoicLZY8soBc1qn3suIT5x6lE_4e1tuizVsZITN4YN0chKPfVYeiIJDyh424lrMNorXGw0CHaQKTk-JkVNRYdZLI_xCvhnesYzqOHogkGoHAO-TgcARsnLxJSuOZNGHGiPNjZGGYoLjKPrdUXE5T7E16iZk7-zRaI75IqjfBx4tTBJbZ8Ieb4",
  "services-hero.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLvg3lZchL-aB-Ccsbq0TTHit2zHwU2f3pN2youIFUk4MxqCxjrK1sXsmj0zWs4S4VT3m4swjbNNUfKB2sS1wqwxVxIF-fdfrviV7HLL1JPgLUoQ0VJVZMmH0x_jsUJO9digvH7lMsokEebAeEV1GpZG8Tbz8m6YlAzErWDgzpokUQi1nOU_tL3WroB7vYnYGbW1_lYMKBAe9ZrQg1GlES5yHqzyr9BNs1iqoJmPUwl8tjrs5VptSM2CYdE",
  "biogas.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLtraaROltpQnCYRHwqLzqSGlIUabaKdAFLDMHVuvhXpOmByhMV9g6F-8iQA-6v0jsmeUgRrIQay_BLZxfDUIxMm_-JNR5hN24Cb8HKZ02CJA3iXrRP-ztwR4gBu8XVJdzcoCrq09sHihKlvywUQX0UaWHdy8PEfzfIMXTLZayI4rT7aO_9k3X6QnzXZXrrX60y7aI0D3GWUb1-xMAprU6grpLbdvLRuacoPsFxSRNpnn8-bus-FKLgOfw",
  "installation-field.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLtJ1kQ5d-EhioajKulDeUuAHjRzXHic1ez0eHKOepHPNCDm274zcXDLgNvxWf6Jm9VG3Cqx3_K2QaiZbJ_iDDj2tOQitVXtY8imKalFWL9Myq4CTlflj08kJ8fUh7fsNrgD_PV7AGrwj8Me4ydVgcgHmmJc9XYvaR6fMbgDGgNMVjqwXeRoUn9UX4Din_iqRZsVXYl74jQCi9m5LekhE-ZaLzHhO2TdNxgZc1EPC32JfA5OrgBKaPMZ1QA",
  "research-tools.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLvXC0NvNRWGBIMSebaRNPl2cTvtaHYfZsDarVuSYZM-8jbm66zzggM1aD_jvzufIG7dMd97XjfKQ7SBDJuBwwHR9hCSXdm-ChC3YpSrMrKLaXtUSmhucCm5YD_ZPAEm0aQUholXmFRnIycrRUhVSwhdiBdPfW8DVWX5s-vUb0FdSGHSzqP9TsnN_gHetcTg7pa3JSVOwg1zdq_zudYSb-Mi4nPN5PaeeN33vJFc-wRx4TW0KVY2VL3OJDQ",
  "manufacturing.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLty5c8TU2A0OXf8MqTVmS4NUSZ2TtU8l0BKcqbfUN8k9g1CDE93mLpBJyhcnII_THVkVQZHtk31Bwdq2EiLOkOqKD7zW_7Adt8Rvqc8xto8MwlTsXnCz0FkUV-bCD3QS0o0FI840kYzTW7UZYC0FrkDAnlZKsI5ifAkwfwvFt6AmX_3-SD2yE9iCN_kqlmqcY8nFDCSPI_nNEOaOYqTAYgeN9DQNIvo066aNvEzgQvImlp_NM8DBcFzow",
  "project-site.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAyLWSPyP1OLcrzFqQwiFI5ZgJXX4F2_ceOl5EuXoftSpMOxPDJeIcLWmI68NSfxsAHsqk0WRT7MaYxk7Klos4BUH3qlZpoVaJ1SXDOO-WDRaqiklNWuUr2wFTdTTjerFxaNbPRJ7NhzozouqvKlagIGN5TKnu7lvH8MTbEbYaSfEt8cH-GKeFflOdCw3QrrqfLic4qBrAzG-LrYLwZ3W-X2G_vyb5oJcbUlQeLvwGLShjQK7PnR3yZW6sgWgFyu489WQwnNorp1mg",
  "portfolio-featured.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLuxo8CtofYqfYZWSgrb_PuAqPy9FbEUE_r_vkdqNZwxaZjOBbD43MrI95bWwqCIWkKdZadtYCz9ay8cEyLRSRPB3xFH1fyrP9IqRzfXFe4sdEDVrCzLBwbH6Rnj7xfpI086jFl724gsls2AVC1VqKcXD5qaUL0yvpmJo903LOHZkXiIdQrlGqRKilS3kv-v4kIXUgXrrArE-9zJ0ClQZwVk8KG4R3uuoXdg5WN_jQsbDWdw3VxPRr-k_QQ",
  "portfolio-residential.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLtNQkvUn-WoaXYfpz1l4H6STViDZ0RYRP73vJgnebN-m47QMr8kdEdHCB_vYSOzv6QLu2IhVq6UmfR2OP_Bz12_O7GbUveKJd1l1-PPFcLyj8OEQY-VTNtG3LTvKPXhPluABQE3KCWRwGv-gj7Yw13ftfXoEefiKZrxDD5v0l5UOgzaH6QNE5xuMs9y0JoNJuVx2XRtKcyvXys8kVX1pQS5A9CnnQe3Qi-WX9nRGIB9TZiMPCEcbfQ284U",
  "portfolio-renewable-lab.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLsfYuFmQD_f5LdCGo0epb_oSdpNJQdDIYkXZQKQOEnjNhbFgd3vWdDuiocO0Bz4FzgTdJZHjPSNA6am9AkS4dbuzUfX1MrMcooqQc0T2JRNfeiyEzFC5fNDTWvlDbmfxTKiY_PjuGuRSGhQoxqJVL91wL2es6Y9hI_8XO36t7uBCYJeoAPb39LG1HJdn7QiNYVgVZp1vhY8UHzkinZoNnEmWx-mFKKfntz-no48aNCEkyoWqQk3Maaw3QI",
  "portfolio-fieldwork.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLsS_1aPr1LxtqllX280yb5lBK-OCa7_3RcxVYWVdQFS7QEhXZ0aNK_IhUUWHb6abwejxUuwGA53hgOmJWvD03ZAsFguVBj49_GWsdrQ5DlGQOVbD7boQCgxhCOZq4CTjKZXfUpWZWgR1UC79Z5v5zD3B23dEbsJ46UMIyUU24tjoROvXq-roAPsSNpXbyeBBLfUXPXG1ONs8cKxMAaCc2SpmWwjpJp6g36FVZEZ8dEVZ1izuSHYjCxfIwg",
  "portfolio-corporate.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDTA88hScQJBViHizy1s6HZsPjiW1ruzWcZPL1hDchil5NqDQFTw0a--aFsAT3BsiEO9IyohbLr4BG0ODoVBidF-djcvOfPwe-zAZft79r58zcxNRDXLx29efNgkdHznfkXk0o1i5tss8blaAePuURqHo3pmReDp9cQH72pF-DU5MbpCLVVwiscvV6GrVvjaNBSSMC4KVEZEdjBU5XMjIQYJ5s8M8zxYf1B-U1H-SVIjAFLY_CzGm_MA9yijv1eDZk6ME-yxKWPzx8",
  "portfolio-smart-grid.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAXIGJnP6YDWidDvb49FuTV7LbLNPw-kGPINAVOipTESdkOdnNN121v_cRrJScBrckGsvmI9W_d_lmqjRLIZ974yHLHl872BT3hnKOaUVeuuqCKhBt7MRx1HxDZ3Uqbe1vW_IXO7zQA6yNXiAnvDgLa0NXAjZjvWsn7O7_y4INcBOzS80uPrFZ9mqySj9l7__ZDG4ReQvwZPr2yF-fBEcr_J6Ow1ZvhMN2nDz6RXJCKYRbNz0KDSkjHPxCKTFyOAISYxp5JhgPqDkc",
  "portfolio-trust-engineer.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCQIJNu04rHzrXT0iRaBeXQTrPCiyjCZtkWWgItKIxa3OBQzW910yW8Cl2vRfqq_aekdDkSAjBDcKwMfiAKAbi6WsK6odV0dHN1wfGaL4jgu5w5oN_Eg6udsenqfDKI79ISA2oKeoZx0a5_Trfs25DLVIBGI8f9Ft2jwfilqt8-IVn8pt3NA8aqs8aA9V-nal7lVPq3KgRTXa6L7cTBmdRaeMFX8kQadK6aKGy0L2aCP7pNhWQKWvlVnwLoqwqcGerRecdbpSwym5w",
  "retail-thumb.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLtNMD03KGhDUP_fJ9wqJRL5Ebc9wfJTFN8lUmLUOvWGAAa0bgKctsh6pyV0NB9v50J_i03yNNKU0JwoBcIhJCihDzbiHGnpMXXIuG45BAFQ1Eo-qLRHhgRhgA6L-CsL1b5nMnX_qy2IUFOlbZWe40aTJeJTI7CefDenr9VPYxES50whGyaHyistda_NGJajfu6WBkN_AmCO1U5CRSKxoK-sjE2zSeBD7UDnVu8f_qR80ytsxFZqQyndJkk",
  "repair-equipment.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLv2K6Sg8fjYham7S23Z9dbvioih6vlo5heIYZjNOPUmOTUh8fr010sqqHbdGTE1RhAkmCvtvBD3PDR0UoDw92tTpES0_8ETzlsoa7K7iGF3Ol5IaUzvUM5DzeLLW88cLsvenRIgf3PyGj7G5WlqxyFLVBRpmFyCDzu25iYdUZGPhiPk_pXo-kbpEUy30i5wygdc2hS95GknAcZd7mlHLBOyoLcMzYvA983g2VJA7VX99Zm4QA_nhlbFgg",
  "rlsgl-logo.png":
    "https://lh3.googleusercontent.com/aida/AP1WRLsVa2dPGtK5EreNKZ4Bkk-2MvQShvb1IC3FaxKHfws0zsqfrmrocXZYpIVFOW_YbvQgiU4Uryp3rcEiCR5xHSZ5fhx4AZtSLRbdLatBbtiXF-7Yy8cnbhzYD28IQoYOb9HEsAzLZiyKMsnsQIyfvNGLbLzL4D80n3pTClGh6F1wOU7yua7PvGXNV1sGuXrqyfJWB-EphAjdPAYituZDOk5D4YCNJufEQitx8FScqXPjhD80tMHdzOVPTis",
};

async function save(name, url) {
  const outDir = join(root, "public", "stitch");
  mkdirSync(outDir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, name), buf);
  console.log(`saved stitch/${name} (${buf.length}b)`);
}

for (const [name, url] of Object.entries(stitchAssets)) {
  await save(name, url);
}

console.log(`Downloaded ${Object.keys(stitchAssets).length} Stitch assets.`);
