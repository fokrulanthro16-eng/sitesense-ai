const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== EXECUTING INSTANT 1080P FFMPEGchild_process ASSEMBLY ===");

const framesPattern = path.resolve("output/frames/frame_%04d.jpg");
const audioFile = path.resolve("output/narration.mp3");
const outputFile = path.resolve("output/SiteSense_AI_Official_Demo.mp4");
const publicFile = path.resolve("public/SiteSense_AI_Official_Demo.mp4");

// Run FFmpeg assembly directly via child_process
const cmd = `ffmpeg -y -framerate 30 -i "${framesPattern}" -i "${audioFile}" -c:v libx264 -preset veryfast -pix_fmt yuv420p -s 1920x1080 -c:a aac -b:a 192k -shortest -movflags +faststart "${outputFile}"`;

console.log("Running command:", cmd);
execSync(cmd, { stdio: "inherit" });

// Copy to public directory
fs.copyFileSync(outputFile, publicFile);

const stats = fs.statSync(outputFile);
console.log(`\nVerified file size: ${stats.size} bytes (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

// Run ffprobe / ffmpeg check
let probe = "";
try {
  execSync(`ffmpeg -i "${outputFile}" 2>&1`);
} catch (e) {
  probe = (e.stdout || e.stderr || "").toString();
}

const lines = probe.split("\n").filter((l) => l.includes("Duration") || l.includes("Stream #"));
console.log("\nFFprobe Stream Inspection:");
lines.forEach((l) => console.log(l.trim()));

console.log("\nFINAL DISK PATH:", outputFile);
