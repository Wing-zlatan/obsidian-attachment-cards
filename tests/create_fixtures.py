import argparse
import shutil
import subprocess
import wave
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from docx import Document
from openpyxl import Workbook
from PIL import Image
from pptx import Presentation
from reportlab.pdfgen import canvas
import imageio_ffmpeg


def main():
    parser = argparse.ArgumentParser(description='Create neutral, valid files for an Obsidian runtime check.')
    parser.add_argument('directory', type=Path)
    args = parser.parse_args()
    root = args.directory.resolve()
    root.mkdir(parents=True, exist_ok=False)
    pdf = canvas.Canvas(str(root / 'Report.pdf'))
    pdf.drawString(72, 760, 'Example report')
    pdf.save()
    document = Document()
    document.add_paragraph('Example document')
    document.save(root / 'Document.docx')
    workbook = Workbook()
    workbook.active['A1'] = 'Example workbook'
    workbook.save(root / 'Workbook.xlsx')
    presentation = Presentation()
    slide = presentation.slides.add_slide(presentation.slide_layouts[0])
    slide.shapes.title.text = 'Example presentation'
    presentation.save(root / 'Slides.pptx')
    (root / 'Notes.txt').write_text('Example notes\n', encoding='utf-8')
    with ZipFile(root / 'Archive.zip', 'w', compression=ZIP_DEFLATED) as archive:
        archive.writestr('example.txt', 'Example archive\n')
    Image.new('RGB', (100, 60), '#4682b4').save(root / 'Image.png')
    long_name = 'Project review - design notes and meeting decisions - revision 2026-11-09 final.docx'
    shutil.copyfile(root / 'Document.docx', root / long_name)
    with wave.open(str(root / 'Audio.wav'), 'wb') as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(8000)
        audio.writeframes(b'\x00\x00' * 8000)
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=steelblue:s=160x90:r=5', '-t', '1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(root / 'Video.mp4')], check=True)
    files = ['Report.pdf', 'Document.docx', 'Workbook.xlsx', 'Slides.pptx', 'Notes.txt', 'Archive.zip', 'Image.png']
    note = '# Attachment card examples\n\n' + '\n\n'.join(f'![[{name}]]' for name in files) + '\n'
    (root / 'Examples.md').write_text(note, encoding='utf-8')
    (root / 'Writing.md').write_text(
        '# Project review\n\n'
        'The decisions stay in the note. Supporting files stay close to the discussion.\n\n'
        '## Materials\n\n'
        '![[Document.docx]]\n\n'
        f'![[{long_name}]]\n\n'
        '![[Workbook.xlsx]]\n\n'
        '## Next discussion\n\n'
        'Compare the updated drawings with the agreed requirements.\n\n'
        '![[Image.png]]\n', encoding='utf-8')
    (root / 'Boundaries.md').write_text(
        f'# Attachment boundaries\n\nBefore the attachments.\n\n![[{long_name}]]\n\n'
        '![[Audio.wav]]\n\n![[Video.mp4]]\n\n![[Image.png]]\n\nAfter the attachments.\n', encoding='utf-8')
    print(root)


if __name__ == '__main__':
    main()
