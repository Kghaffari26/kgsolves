/**
 * Turns any short clip into a web-ready background loop:
 *  - ping-pong (forward then reversed) so slow camera moves loop with no visible cut
 *  - 1920px max width, no audio
 *  - MP4 (H.264, CRF 24, +faststart) and WebM (VP9) under a size budget, plus a JPEG poster
 * Requires ffmpeg on PATH (Windows: `winget install Gyan.FFmpeg`).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";

export type EncodedLoop = {
  mp4: string;
  webm: string;
  poster: string;
  mb: { mp4: number; webm: number };
};

function ffmpeg(args: string[]) {
  const res = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
  if (res.error) throw new Error(`ffmpeg not found on PATH (${res.error.message})`);
  if (res.status !== 0) throw new Error(`ffmpeg exited with ${res.status}`);
}

const sizeMB = (f: string) => statSync(f).size / 1024 / 1024;

/** Encodes `src` to `<outBase>.mp4`, `<outBase>.webm`, `<outBase>.jpg`. Retries at lower quality if over budget. */
export function encodeLoop(
  src: string,
  outBase: string,
  { maxMB = 4, pingPong = true } = {},
): EncodedLoop {
  mkdirSync(path.dirname(outBase), { recursive: true });
  const loop = pingPong
    ? "[0:v]scale='min(1920,iw)':-2,fps=30,setsar=1,format=yuv420p,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]"
    : "[0:v]scale='min(1920,iw)':-2,fps=30,setsar=1,format=yuv420p[v]";
  const mp4 = `${outBase}.mp4`;
  const webm = `${outBase}.webm`;
  const poster = `${outBase}.jpg`;

  for (const crf of [24, 27, 30, 33]) {
    ffmpeg([
      "-i",
      src,
      "-filter_complex",
      loop,
      "-map",
      "[v]",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      String(crf),
      "-movflags",
      "+faststart",
      mp4,
    ]);
    if (sizeMB(mp4) <= maxMB) break;
  }
  for (const crf of [36, 40, 44, 48]) {
    ffmpeg([
      "-i",
      src,
      "-filter_complex",
      loop,
      "-map",
      "[v]",
      "-an",
      "-c:v",
      "libvpx-vp9",
      "-crf",
      String(crf),
      "-b:v",
      "0",
      "-deadline",
      "good",
      "-cpu-used",
      "4",
      "-row-mt",
      "1",
      webm,
    ]);
    if (sizeMB(webm) <= maxMB) break;
  }
  ffmpeg(["-i", src, "-vf", "scale='min(1920,iw)':-2", "-frames:v", "1", "-q:v", "3", poster]);
  return { mp4, webm, poster, mb: { mp4: sizeMB(mp4), webm: sizeMB(webm) } };
}
