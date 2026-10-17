const { execSync } = require("child_process");

let totalSeconds = 0;
const chapterDurations = [];

for (let i = 1; i <= 6; i++) {
  try {
    const out = execSync(`ffmpeg -i output/audio_chapters/ch${i}.wav 2>&1`).toString();
    const m = out.match(/Duration: 00:00:([0-9.]+)/);
    const sec = m ? parseFloat(m[1]) : 0;
    chapterDurations.push(sec);
    totalSeconds += sec;
    console.log(`Chapter ${i} Duration: ${sec.toFixed(2)} seconds`);
  } catch (e) {
    const m = e.stdout.toString().match(/Duration: 00:00:([0-9.]+)/);
    const sec = m ? parseFloat(m[1]) : 0;
    chapterDurations.push(sec);
    totalSeconds += sec;
    console.log(`Chapter ${i} Duration: ${sec.toFixed(2)} seconds`);
  }
}

console.log(`\nTOTAL AUDIO DURATION: ${totalSeconds.toFixed(2)} seconds`);
