"""虚构算术入口检查，不代表科研评价。"""
import json
from pathlib import Path
values=[2,4,6]
Path('metrics.json').write_text(json.dumps({'kind':'smoke','n':len(values),'mean':sum(values)/len(values)})+'\n')
Path('result.md').write_text('# Fictional smoke\n\nThree supplied values have arithmetic mean 4. This does not validate a research method.\n')
