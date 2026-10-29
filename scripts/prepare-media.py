"""Create lightweight site assets from the supplied folders; originals stay intact."""
from pathlib import Path
import hashlib
import json
import subprocess

from PIL import Image, ImageOps
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('C:/Users/DELL/Downloads/Telegram Desktop')
DEST = ROOT / 'public/assets/zaynabxon/work'
DEST.mkdir(parents=True, exist_ok=True)

def unique_files(folder):
    seen = set()
    for file in sorted((SOURCE / folder).rglob('*'), key=lambda p: ('(2)' in p.name, p.name)):
        if not file.is_file():
            continue
        digest = hashlib.sha256(file.read_bytes()).hexdigest()
        if digest in seen:
            continue
        seen.add(digest)
        yield file

def save_webp(image, name, size, quality):
    image = image.copy()
    image.thumbnail(size, Image.Resampling.LANCZOS)
    image.save(DEST / name, 'WEBP', quality=quality, method=6)
    return '/assets/zaynabxon/work/' + name

brands = {
    'IMG_1878': 'clinics.uz', 'IMG_3198': 'clinics.uz',
    'IMG_3498': 'Max Film', 'IMG_3499': 'Max Film',
    'IMG_3562': 'RiyaPlay', 'IMG_3563': 'Max Film', 'IMG_3658': 'Max Film',
    'IMG_3866': 'Max Film', 'IMG_4385': 'DS LAB', 'IMG_5048': 'DS LAB',
    'IMG_6084': 'DS LAB', 'IMG_6491': 'Max Film', 'IMG_7607': 'DS LAB',
    'IMG_8571': 'RiyaPlay', 'IMG_8572': 'RiyaPlay',
    'IMG_8742': 'clinics.uz', 'IMG_8745': 'RiyaPlay', 'IMG_8746': 'RiyaPlay',
}
assets = {'results': [], 'design': [], 'logos': []}
for folder, key in [('Results', 'results'), ('Design', 'design')]:
    for file in unique_files(folder):
        # This same diploma is already displayed in the education section.
        if file.suffix.lower() == '.heic':
            continue
        stem = file.stem.replace(' (2)', '').lower()
        asset = {'id': f'{key}-{stem}', 'brand': 'RiyaPlay' if key == 'design' else brands.get(file.stem, 'Instagram'), 'kind': 'image'}
        if file.suffix.lower() == '.mp4':
            ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
            output = DEST / f'{stem}.mp4'
            subprocess.run([ffmpeg, '-y', '-i', str(file), '-vf', 'scale=min(720\\,iw):-2', '-c:v', 'libx264', '-crf', '25', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(output)], check=True, capture_output=True)
            poster = DEST / f'{stem}-poster.jpg'
            subprocess.run([ffmpeg, '-y', '-ss', '1', '-i', str(output), '-frames:v', '1', str(poster)], check=True, capture_output=True)
            image = Image.open(poster).convert('RGB')
            asset.update(kind='video', src='/assets/zaynabxon/work/' + output.name)
            poster.unlink()
        else:
            image = ImageOps.exif_transpose(Image.open(file)).convert('RGB')
            asset['src'] = save_webp(image, f'{key}-{stem}-full.webp', (1800, 3600), 90)
        asset.update(width=image.width, height=image.height)
        asset['thumb'] = save_webp(image, f'{key}-{stem}-thumb.webp', (560, 780), 77)
        assets[key].append(asset)

logo_data = {
    'IMG_1983': ('clinics.uz', None, 'project'),
    'IMG_4958': ('DS LAB', None, 'project'),
    'IMG_8569': ('Max Film', None, 'project'),
    'IMG_8570': ('RiyaPlay', None, 'project'),
    'IMG_8736': ('Space Academy', (210, 825, 1080, 1695), 'education'),
    'IMG_8737': ('Kasbly school', (210, 790, 1080, 1660), 'education'),
    'IMG_8738': ('RichOne Club', (0, 752, 1290, 2042), 'education'),
    'IMG_8741': ('clinics.uz / social', (210, 825, 1080, 1695), 'project'),
}
for file in unique_files('Logo'):
    name, crop, category = logo_data[file.stem]
    image = ImageOps.exif_transpose(Image.open(file)).convert('RGB')
    if crop:
        image = image.crop(crop)
    src = save_webp(image, f'logo-{file.stem.lower()}.webp', (700, 700), 90)
    thumb = save_webp(image, f'logo-{file.stem.lower()}-thumb.webp', (280, 280), 84)
    assets['logos'].append({'id': file.stem.lower(), 'brand': name, 'category': category, 'kind': 'image', 'src': src, 'thumb': thumb, 'width': image.width, 'height': image.height})

source = 'export type MediaItem = { id: string; brand: string; kind: "image" | "video"; src: string; thumb: string; width: number; height: number; category?: string };\n\n'
for key, rows in assets.items():
    source += f'export const {key}Media: MediaItem[] = ' + json.dumps(rows, ensure_ascii=False, indent=2) + ';\n\n'
(ROOT / 'src/data/media.ts').write_text(source, encoding='utf-8')
print(json.dumps({'counts': {key: len(rows) for key, rows in assets.items()}, 'totalBytes': sum(f.stat().st_size for f in DEST.iterdir())}))
