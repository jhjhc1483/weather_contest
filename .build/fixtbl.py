# -*- coding: utf-8 -*-
import io, re, json, zipfile, shutil, os, subprocess, sys
DOCX = sys.argv[1]; TEXTW = 9864
colw = json.load(io.open("/tmp/colw.json", encoding="utf-8"))
work = "/tmp/fixw"; shutil.rmtree(work, ignore_errors=True); os.makedirs(work)
with zipfile.ZipFile(DOCX) as z: z.extractall(work)
p = os.path.join(work, "word/document.xml"); s = io.open(p, encoding="utf-8").read()
tbl_idx = [0]
def fix(m):
    tbl = m.group(0); k = tbl_idx[0]; tbl_idx[0] += 1
    ncol = len(re.findall(r'<w:gridCol', tbl)) or len(re.findall(r'<w:tc>', tbl.split('</w:tr>')[0]))
    ratios = colw[k] if k < len(colw) and len(colw[k]) == ncol else [1.0/max(1,ncol)]*ncol
    widths = [int(round(r * TEXTW)) for r in ratios]; widths[-1] += TEXTW - sum(widths)
    tbl = re.sub(r'<w:tblW[^/]*/>', f'<w:tblW w:type="dxa" w:w="{TEXTW}"/>', tbl)
    B = ('<w:tblBorders><w:top w:val="single" w:sz="6" w:color="808080"/>'
         '<w:left w:val="single" w:sz="6" w:color="808080"/><w:bottom w:val="single" w:sz="6" w:color="808080"/>'
         '<w:right w:val="single" w:sz="6" w:color="808080"/><w:insideH w:val="single" w:sz="4" w:color="AAAAAA"/>'
         '<w:insideV w:val="single" w:sz="4" w:color="AAAAAA"/></w:tblBorders>')
    tbl = re.sub(r'<w:tblBorders>.*?</w:tblBorders>', B, tbl, flags=re.S) if '<w:tblBorders>' in tbl else tbl.replace('<w:tblW', B+'<w:tblW', 1)
    if '<w:tblLayout' not in tbl: tbl = tbl.replace('<w:tblW', '<w:tblLayout w:type="fixed"/><w:tblW', 1)
    grid = "<w:tblGrid>" + "".join(f'<w:gridCol w:w="{x}"/>' for x in widths) + "</w:tblGrid>"
    tbl = re.sub(r'<w:tblGrid>.*?</w:tblGrid>', grid, tbl, flags=re.S) if '<w:tblGrid>' in tbl else tbl.replace('</w:tblPr>', '</w:tblPr>'+grid, 1)
    def fixrow(rm):
        row = rm.group(0); ci = [0]
        def fixcell(cm):
            cell = cm.group(0); i = ci[0]; ci[0] += 1
            wv = widths[i] if i < len(widths) else widths[-1]
            if '<w:tcW' in cell: return re.sub(r'<w:tcW[^/]*/>', f'<w:tcW w:type="dxa" w:w="{wv}"/>', cell, count=1)
            return cell.replace('<w:tcPr>', f'<w:tcPr><w:tcW w:type="dxa" w:w="{wv}"/>', 1) if '<w:tcPr>' in cell \
                   else cell.replace('<w:tc>', f'<w:tc><w:tcPr><w:tcW w:type="dxa" w:w="{wv}"/></w:tcPr>', 1)
        return re.sub(r'<w:tc>.*?</w:tc>', fixcell, row, flags=re.S)
    return re.sub(r'<w:tr\b.*?</w:tr>', fixrow, tbl, flags=re.S)
s = re.sub(r'<w:tbl>.*?</w:tbl>', fix, s, flags=re.S)
io.open(p, "w", encoding="utf-8").write(s)
os.remove(DOCX); subprocess.run(["zip","-Xrq", DOCX, "."], cwd=work, check=True)
print(f"표 {tbl_idx[0]}개 폭 고정")
