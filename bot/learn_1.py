"""Gambit Bot learner: tries variants of its best-known standard-run setup, remembers every result, keeps the best, posts a new high score.
usage: python3 learn_1.py PATH_TO_index.html [--trials 10] [--submit]"""
import json,os,random,subprocess,sys,concurrent.futures as cf,urllib.request
HERE=os.path.dirname(os.path.abspath(__file__));HTML=sys.argv[1]
N=int(sys.argv[sys.argv.index('--trials')+1]) if '--trials' in sys.argv else 10
MEM=os.path.join(HERE,'memory_1.json')
ALL=['brandt','vesk','greymaw','hale','nix','oda','ember','ashling','moss','mire','skarra','ylva','cogs','thorne','sable','bramble','kestrel','pyra','grisk','morrow']
DEFAULT=ALL[:15]
# knobs and the values worth trying
KNOBS={'restBelow':[.5,.6,.7,.85,.95],'rerollGold':[4,6,8,10,14],'rerollMax':[0,1,2,3,4],'heroMin':[8,10,12,14],'heroDecay':[2,3,4],'dupe':[40,60,80],'parity':[0,1],'tankB':[0,2,4],'frontB':[0,2,3],'spread':[1,1.5,2.5]}
MAST=['mix','a','b']
mem=json.load(open(MEM)) if os.path.exists(MEM) else {'trials':[],'best':{'cfg':{'restBelow':.6,'rerollGold':6,'rerollMax':2},'roster':DEFAULT,'mast':'mix','score':77}}
def score(r):return r['act']*10+r['step']
def mutate(b,rng):
    s={'cfg':dict(b['cfg']),'roster':list(b['roster']),'mast':b['mast']}
    for _ in range(rng.choice([1,1,2])):
        t=rng.choice(['cfg','cfg','roster','mast'])
        if t=='cfg':k=rng.choice(list(KNOBS));s['cfg'][k]=rng.choice(KNOBS[k])
        elif t=='roster':
            out=rng.choice(s['roster']);inn=rng.choice([h for h in ALL if h not in s['roster']]);s['roster'][s['roster'].index(out)]=inn
        else:s['mast']=rng.choice(MAST)
    return s
def explore(rng):return {'cfg':{k:rng.choice(v) for k,v in KNOBS.items()},'roster':rng.sample(ALL,15),'mast':rng.choice(MAST)}
def run(i,s):
    out=os.path.join(HERE,'out','L%d_%d.json'%(os.getpid(),i));os.makedirs(os.path.dirname(out),exist_ok=True)
    try:
        subprocess.run(['python3',os.path.join(HERE,'run_endless_2.py'),HTML,'--roster',','.join(s['roster']),'--cfg',json.dumps(s['cfg']),'--mast',s['mast'],'--out',out],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=900)
        return json.load(open(out))
    except Exception:return None
rng=random.Random()
plan=[('retest',mem['best'])]  # re-run the best setup to see how much is luck
for i in range(N-1):plan.append(('explore',explore(rng)) if rng.random()<.3 else ('mutate',mutate(mem['best'],rng)))
with cf.ThreadPoolExecutor(2) as ex:res=list(ex.map(lambda ip:run(ip[0],ip[1][1]),enumerate(plan)))
top=None
for (kind,s),r in zip(plan,res):
    if not r:continue
    sc=score(r);mem['trials'].append({'kind':kind,'setup':s,'act':r['act'],'step':r['step'],'wins':r['wins'],'score':sc});print(kind,sc,r['wins'],'wins',json.dumps(s['cfg']),s['mast'])
    if top is None or (sc,r['wins'])>(score(top[1]),top[1]['wins']):top=(s,r)
if top and (score(top[1]),top[1]['wins'])>(mem['best']['score'],mem['best'].get('wins',0)):
    mem['best']={'cfg':top[0]['cfg'],'roster':top[0]['roster'],'mast':top[0]['mast'],'score':score(top[1]),'wins':top[1]['wins']};print('NEW BEST',mem['best']['score'])
    if '--submit' in sys.argv:
        K='sb_publishable_owcLW7JcSGVvUIcfvNYRuQ_G0arZB9Z';r=top[1]
        body=json.dumps({'p_device':'6a1f0c52-9b7e-4c3a-8d21-5e0b7d4c9a10','p_name':'Gambit Bot','p_act':r['act'],'p_step':r['step'],'p_wins':r['wins']}).encode()
        rq=urllib.request.Request('https://bbawfdqrxqfeqadcfdqj.supabase.co/rest/v1/rpc/submit_endless',data=body,headers={'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'});print('submitted',urllib.request.urlopen(rq,timeout=20).status)
else:print('no new best; best stays',mem['best']['score'])
json.dump(mem,open(MEM,'w'),indent=1)
