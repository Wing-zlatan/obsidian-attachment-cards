import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from docx import Document
from openpyxl import Workbook
from PIL import Image
from pptx import Presentation
from reportlab.pdfgen import canvas


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
    files = ['Report.pdf', 'Document.docx', 'Workbook.xlsx', 'Slides.pptx', 'Notes.txt', 'Archive.zip', 'Image.png']
    note = '# Attachment card examples\n\n' + '\n\n'.join(f'![[{name}]]' for name in files) + '\n'
    (root / 'Examples.md').write_text(note, encoding='utf-8')
    print(root)


if __name__ == '__main__':
    main()
