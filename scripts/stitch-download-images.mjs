import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "stitch");
mkdirSync(outDir, { recursive: true });

const images = {
  "hero-bootcamp.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLt4MoEvBdwUglEORvaqLu1U6N2Ue0vxSGg_uKFZ1_Lmn1iTYiRw9K3P2rPS7e3WjKYO5JarGFB25Dfs5jCWfKmzf3-3oIx23slAGceFa6j8zgr0LbF5f5f9-hrd2ChfitRTN7rzyWUl976DPaM_00IhUkf7ujfm3b5hoUiiycL-4Yp91F5vjd67WiRpxyZYBHFH4SqZ1OD9WWp9HGnjWuV8FkmLQwnRHqY7iXSz4S7HuRe3cVkZF_VTpA",
  "story-team.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLvPbA1q-VNyvjHBUKb5jyPS94cnaphoVgV-8bqSrN41SfJveijDbd8iY5Tk7fC_vZjJ2gx5IkKnYcywI2DWkrzCs-ByDNMvihas0nmIA9QgFYFhmoYLlSupASBW6uCmF0sIuTNj88xvxiNJS_kqRqPDGGGDaj2wXwZyzLGQZEqmteKxGo1GQoRGWKyqssO8X0H9CIH-juG0K85ginloVvVQfdb4cy7xJDo5taXhedqVHLiQfGIBgXb2QnA",
  "impacts-award.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLuq3knH_z2kVMebtSS4tX5fZqkmnyWYLtkhlpip2FEGzG5yE5R6RYtwXa0UWFYe5vetViUoicLZY8soBc1qn3suIT5x6lE_4e1tuizVsZITN4YN0chKPfVYeiIJDyh424lrMNorXGw0CHaQKTk-JkVNRYdZLI_xCvhnesYzqOHogkGoHAO-TgcARsnLxJSuOZNGHGiPNjZGGYoLjKPrdUXE5T7E16iZk7-zRaI75IqjfBx4tTBJbZ8Ieb4",
  "services-hero.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC9_n2VzC1kAap0EUGUOlZJ2qsk68Pmf29hUiWdcH8kGd4YxmPrGWczrwf9wH6tdc2FgIH9tXzvMRqBozL2YKGGUYhzjA2LSYcwivT6CXILEMODk9dX4PUpAf0IUkWo1csvWXXX2OwvQSkjMNiLZg3Xcvf2vfCMn9vYrHndBQcuOs3mhTwO6sU7txxC1C2kWrvGsfCfsHANJVEEToLN19-yjz3PJiE6Y6-BR50UpIsyvYAcPK3SjmH4tBFmtGMvU9K8rZfMBBIXPYw",
  "biogas-solar.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLs9BpQehOipPM_8VsJHXa0Rq6kwePO0YgeMy5nDH3cFMUzdL7wjGjaZOCDQg9HB5wS5a7j7RRT2OyFeXUK_R2FJ4Q0FiOwbj3CiAUS3axkH0F_9WXqIbXi_hXrPg6IJTt2e9f0RHThGoEG3kEnpUWhbfjca04XaRxLZFzuy_c4-vSwSXCyRHxMbULaE8ZXB5xxBlPnwjlJSD0ioKaHTWYiXeUyP7mF1dnDUGy7BMgvj6lmRh2QNVMGHGWE",
  "retail-thumb.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLtNMD03KGhDUP_fJ9wqJRL5Ebc9wfJTFN8lUmLUOvWGAAa0bgKctsh6pyV0NB9v50J_i03yNNKU0JwoBcIhJCihDzbiHGnpMXXIuG45BAFQ1Eo-qLRHhgRhgA6L-CsL1b5nMnX_qy2IUFOlbZWe40aTJeJTI7CefDenr9VPYxES50whGyaHyistda_NGJajfu6WBkN_AmCO1U5CRSKxoK-sjE2zSeBD7UDnVu8f_qR80ytsxFZqQyndJkk",
  "installation-site.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLsB-WkScZaxjYqQBLLzl2KHMydzuZfY_SQ9He37aldWOIe6OlDxZ8uyaWt6VvHVHQOdx6UCKcDh6T_PtzqmF7O_SI76HALvLioxKSx6AHjRTCkL5YTt68cxi-kWjVOPUmjQEQtHel7AaNAHRYOV4dd_N7wi7EdC6dLG8ffcsYamSMnNg8WVUOqhnJbe-IErEHCR4z1rE0LyRBSjInJVHQOMrQTqOd7qqrheLWS9ljDVbXpOyfEEXgOhIzM",
  "repair-equipment.jpg":
    "https://lh3.googleusercontent.com/aida/AP1WRLv2K6Sg8fjYham7S23Z9dbvioih6vlo5heIYZjNOPUmOTUh8fr010sqqHbdGTE1RhAkmCvtvBD3PDR0UoDw92tTpES0_8ETzlsoa7K7iGF3Ol5IaUzvUM5DzeLLW88cLsvenRIgf3PyGj7G5WlqxyFLVBRpmFyCDzu25iYdUZGPhiPk_pXo-kbpEUy30i5wygdc2hS95GknAcZd7mlHLBOyoLcMzYvA983g2VJA7VX99Zm4QA_nhlbFgg",
  "manufacture-domestic.jpg":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDmjYVmmzkN9Ch-qHnswQMmSLgPuSNdyWeIhQlEctarfu_3DP0OfSM5lY5r6sZFbDK2ZOsOe0Dd-SVzZZ__Ftj9Y8LIiaOnaYmp30UZECLAWK8ULGD_HqVE41KGWhdEWKxUJVTxCF3pXI6UYW7AtxJ-sL6_lj6g-gEPviGSBcF3OBiyb66BlZbFReoc-ZgCyPZUdRPGYqbXM9Dr0IwQfp3ilo-DuN6PvN-4BkqfvwCl7mlYkO9ICn7XCIlr0dYhGP93ifB2ue_oeVU",
};

for (const [name, url] of Object.entries(images)) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, name), buf);
  console.log(`saved ${name} (${buf.length} bytes)`);
}
