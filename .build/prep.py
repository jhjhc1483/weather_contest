# -*- coding: utf-8 -*-
import io, re, unicodedata, json
COLW=[]
src = io.open("공모제출서식.md", encoding="utf-8").read()
old_head = src[src.index("| 주 제 명"):src.index("---\n\n## 1. 개 요")]
new_head = """| 구　　분 | 내　　　　용 |
| --- | ------------------------------------------------------------ |
| 주 제 명 | **부대활동 기상 위험성평가 지원체계**<br>— 30일 훈련 가용성 전수 분석 및 시행 판단 지원 서비스 |
| 공모 구분 | 앱 / 웹서비스 ( **√** ) 　　 정책 / 아이디어 (　) |

| 구 분 | 소 속 | 계급/직급 | 성 명 | 연 락 처 |
| ------- | ------- | ------- | ------- | ------------------- |
| 참가자<br>(팀명　　　) |  |  |  | (군)<br>(휴대전화)<br>(이메일) |

"""
src = src.replace(old_head, new_head)
def w(txt):
    t = re.sub(r'<br>', ' ', txt); t = re.sub(r'\*\*|`|\*', '', t)
    return sum(2 if unicodedata.east_asian_width(c) in 'WF' else 1 for c in t)
lines = src.split("\n"); out, i = [], 0
while i < len(lines):
    ln = lines[i]
    if re.match(r'^\s*\|.*\|\s*$', ln) and i+1 < len(lines) and re.match(r'^\s*\|[\s:\-|]+\|\s*$', lines[i+1]):
        block=[ln, lines[i+1]]; j=i+2
        while j < len(lines) and re.match(r'^\s*\|.*\|\s*$', lines[j]): block.append(lines[j]); j+=1
        rows=[[c.strip() for c in r.strip().strip('|').split('|')] for r in ([block[0]]+block[2:])]
        ncol=len(rows[0]); widths=[]
        for c in range(ncol):
            widths.append(max(4, min(max((w(r[c]) for r in rows if len(r)>c), default=4), 60)))
        total=sum(widths); COLW.append([x/total for x in widths])
        sep="|"+"|".join("-"*max(3, round(x/total*68)) for x in widths)+"|"
        out.append(block[0]); out.append(sep); out.extend(block[2:]); i=j; continue
    out.append(ln); i+=1
src="\n".join(out)
src = re.sub(r'!\[그림\d\]\(([^)]+)\)', r'![](\1){width=9.4cm}', src)
src = re.sub(r'!\[화면\d\]\(([^)]+)\)', r'![](\1){width=10.6cm}', src)
src = src.replace("<br>", " ")
io.open("/tmp/proposal.md","w",encoding="utf-8").write(src)
json.dump(COLW, io.open("/tmp/colw.json","w",encoding="utf-8"))
print("전처리 완료 — 표", len(COLW), "개")
