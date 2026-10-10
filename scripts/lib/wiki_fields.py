import re
MASK=re.compile(r'<!--.*?-->|<(nowiki|source|syntaxhighlight|pre)\b[^>]*>.*?</\1\s*>',re.I|re.S)
def masked(text):return MASK.sub(lambda m:' '*len(m[0]),text)
def templates(text):
 s=masked(text);stack=[];nodes=[];i=0
 while i<len(s):
  if s.startswith('{{{!}}',i):i+=1;continue
  if s.startswith('{{{',i):stack.append([i,3,[],0]);i+=3;continue
  if s.startswith('{{',i):stack.append([i,2,[],0]);i+=2;continue
  if stack and s.startswith('}'*stack[-1][1],i):
   a,w,bars,_=stack.pop();end=i+w
   if w==2:
    cuts=[a+2]+[p+1 for p in bars];ends=bars+[i];parts=[(x,y,text[x:y]) for x,y in zip(cuts,ends)];name=parts[0][2].strip().replace('_',' ')
    fields={}
    for x,y,value in parts[1:]:
     # A named parameter's equals sign precedes any nested template in ordinary signature fields.
     m=re.match(r'\s*([A-Za-z0-9_ -]+?)\s*=',value)
     if m:fields[m[1].strip()]={'start':x+m.end(),'end':y,'value':value[m.end():].strip()}
     elif re.fullmatch(r'\s*[A-Za-z0-9_]+\s*',value):fields[value.strip()]={'start':x,'end':y,'value':'','bare':True}
    nodes.append({'start':a,'end':end,'close':i,'name':name,'fields':fields,'parts':parts})
   i=end;continue
  if stack:
   if s.startswith('[[',i):stack[-1][3]+=1;i+=2;continue
   if s.startswith(']]',i) and stack[-1][3]:stack[-1][3]-=1;i+=2;continue
   if s[i]=='|' and stack[-1][1]==2 and not stack[-1][3]:stack[-1][2].append(i)
  i+=1
 return nodes
