"""Gambit Bot standard run: fully maxed account (all camp upgrades, unlocks, mastery 3 on every hero), plays one run, posts to Deepest runs.
usage: python3 run_endless_1.py PATH_TO_index.html [--submit] [--v]"""
import json,re,sys,os,urllib.request
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
BOTJS=sys.argv[sys.argv.index('--bot')+1] if '--bot' in sys.argv else os.path.join(HERE,'bot.js')
HTML=sys.argv[1];SUBMIT='--submit' in sys.argv
URL='https://bbawfdqrxqfeqadcfdqj.supabase.co';KEY='sb_publishable_owcLW7JcSGVvUIcfvNYRuQ_G0arZB9Z'
BOT_DEVICE='6a1f0c52-9b7e-4c3a-8d21-5e0b7d4c9a10';BOT_NAME='Gambit Bot'
C='#ov .dlg .choice, #ov .dlg .btn, #ov .hb'
SETUP="""()=>{var d=window.__dd,m=JSON.parse(localStorage.getItem('dd1_meta')||'{}');m.upg={chest:3,recruit:1,scout:1,medic:2,mentor:1,haggle:1,quarter:2,vet:1,freewall:1,tchest:1,gate:1,heir:1};
 m.unl={};Object.keys(d.HEROES).forEach(function(k){m.unl['h_'+k]=1;});Object.keys(d.RELICS).forEach(function(k){m.unl['r_'+k]=1;});['tamsin','dole','vey'].forEach(function(k){m.unl['c_'+k]=1;});
 m.mast={};Object.keys(d.HEROES).forEach(function(k){var sup=/tank|support/.test(d.HEROES[k].role.toLowerCase()),r=sup?'a':'b';m.mast[k]={xp:9999,p:[r,r+'1','x:'+r+'2']};});
 m.wins=Math.max(m.wins||0,1);m.renown=500;localStorage.setItem('dd1_meta',JSON.stringify(m));}"""
def main():
    with sync_playwright() as p:
        b=p.chromium.launch();ctx=b.new_context(viewport={'width':412,'height':900});pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/rest/v1/**',lambda r,q:r.abort())
        pg.goto('file://'+os.path.abspath(HTML));pg.wait_for_timeout(900)
        pg.evaluate(SETUP);pg.reload();pg.wait_for_timeout(900)
        pg.add_script_tag(path=BOTJS)
        pg.locator(C,has_text=re.compile(r'Begin')).first.click();pg.wait_for_timeout(400)
        pg.locator('#ov .dlg .choice',has_text='Merchant Dole').first.click();pg.wait_for_timeout(400)
        res=None
        for t in range(6000):
            if pg.evaluate("()=>{var h=document.querySelector('#ov .dlg h2');return !!h&&/party has fallen/i.test(h.innerText)}"):
                res=pg.evaluate("()=>({act:__dd.G.act,step:__dd.G.step,wins:__dd.G.stats.wins,endless:!!__dd.G.endless})");break
            r=pg.evaluate("()=>BOT.tick()")
            if '--v' in sys.argv:
                for l in r.get('log',[]):print(l[:300])
            if r['s'] in('stuck','nog','wait'):print('STATE',r['s']);break
        b.close()
    print('result',res,'errs',errs[:2])
    if not res:sys.exit(1)
    print('SCORE',res['act']*10+res['step'])
    body=json.dumps({'p_device':BOT_DEVICE,'p_name':BOT_NAME,'p_act':res['act'],'p_step':res['step'],'p_wins':res['wins']}).encode()
    print('would submit',body.decode())
    if SUBMIT:
        rq=urllib.request.Request(URL+'/rest/v1/rpc/submit_endless',data=body,headers={'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'})
        print('submitted',urllib.request.urlopen(rq,timeout=20).status)
main()
