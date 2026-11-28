"""Generate missing static audio locally; preserve existing clips and manifest."""
import os
import time
import sys, argparse, hashlib, json, pathlib, subprocess, tempfile, unicodedata, shutil
p=argparse.ArgumentParser();p.add_argument('--model',default='pl_PL-gosia-medium.onnx');p.add_argument('--limit',type=int);a=p.parse_args()
root=pathlib.Path(__file__).resolve().parent.parent; out=root/'public/audio/gosia';out.mkdir(parents=True,exist_ok=True)
manifest=out/'manifest.json'; data=json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else {}
texts=json.loads((root/'scripts/gosia-texts.json').read_text(encoding='utf-8'))
if not pathlib.Path(a.model).is_file(): sys.exit('Missing Gosia model: '+a.model)
if not shutil.which('ffmpeg'): sys.exit('FFmpeg is not on PATH.')
count=0
for text in texts:
    text=' '.join(unicodedata.normalize('NFC',text).split());name=hashlib.sha256(text.encode()).hexdigest()+'.mp3';dest=out/name
    if not dest.exists() or not dest.stat().st_size:
        if a.limit is not None and count>=a.limit: continue
        with tempfile.TemporaryDirectory() as tmp:
            wav=pathlib.Path(tmp)/'clip.wav';mp3=pathlib.Path(tmp)/'clip.mp3'
            subprocess.run(
    [
        sys.executable,
        "-X", "utf8",
        "-m", "piper",
        "--model", a.model,
        "--output_file", str(wav)
    ],
    input=text + "\n",
    text=True,
    encoding="utf-8",
    env={
        **os.environ,
        "PYTHONUTF8": "1",
        "PYTHONIOENCODING": "utf-8"
    },
    check=True
)
            subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','48k',str(mp3)],check=True)
            pending=dest.with_suffix('.tmp');pending.write_bytes(mp3.read_bytes());pending.replace(dest)
        count+=1;print(f'Generated {count}: {text[:65]}',flush=True)
    data[text]=name
    temp = manifest.with_suffix(".tmp")

temp.write_text(
    json.dumps(data, ensure_ascii=False),
    encoding="utf-8"
)

for attempt in range(30):
    try:
        os.replace(temp, manifest)
        break
    except PermissionError:
        if attempt == 29:
            raise

        print(f"Manifest locked. Retrying ({attempt + 1}/30)...")
        time.sleep(2)
print(f'{count} new clips; {len(data)} indexed')
