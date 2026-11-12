"""Gambit Bot: plays today's Daily Gambit once and posts the score to the leaderboard.
usage: python3 run_daily.py PATH_TO_index.html [--submit] [--fake YYYY-MM-DD]"""
import json,re,sys,os,urllib.request
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
BOTJS=sys.argv[sys.argv.index('--bot')+1] if '--bot' in sys.argv else os.path.join(HERE,'bot.js')
CFGJ=sys.argv[sys.argv.index('--cfg')+1] if '--cfg' in sys.argv else '{}'
HTML=sys.argv[1];SUBMIT='--submit' in sys.argv
FAKE=sys.argv[sys.argv.index('--fake')+1] if '--fake' in sys.argv else None
URL='https://bbawfdqrxqfeqadcfdqj.supabase.co';KEY='sb_publishable_owcLW7JcSGVvUIcfvNYRuQ_G0arZB9Z'
BOT_DEVICE='6a1f0c52-9b7e-4c3a-8d21-5e0b7d4c9a10';BOT_NAME='Gambit Bot'
FAKEJS="""(function(){var R=Date,fx=new R(%d,%d,%d,12,0,0).getTime(),t0=R.now();function F(){var a=Array.prototype.slice.call(arguments);if(!(this instanceof F))return new R(fx+(R.now()-t0)).toString();if(a.length===0)return new R(fx+(R.now()-t0));return new (Function.prototype.bind.apply(R,[null].concat(a)))();}F.prototype=R.prototype;F.now=function(){return fx+(R.now()-t0);};F.UTC=R.UTC;F.parse=R.parse;window.Date=F;})();"""
BOOSTS=['War Chest','Haggler','Recruiter','Mentor','Quartermaster','Field Medic','Veteran','Scout','Stonecutters']
C='#ov .dlg .choice, #ov .dlg .btn, #ov .hb'
def txt(pg):return pg.evaluate("()=>document.querySelector('#ov .dlg').innerText")
def plan(pg):
    def click(t,exact_back=False):
        loc=pg.locator(C,has_text=re.compile(r'^\s*Back\s*$') if exact_back else t);loc.first.click();pg.wait_for_timeout(200)
    click('Daily Gambit');click('Plan your run')
    t=txt(pg)
    PERKS=['Arcana','Focus','Toughness','Haste','Keen Edge','Plating','Lifeleech']
    CAST=['Nix','Sir Brandt','Brother Hale','Dame Pyra','Sable','Emberwitch']
    def budget():return int(re.search(r'Budget: (\d+)',txt(pg)).group(1))
    click('Heroes');done=0
    for _ in range(0 if os.environ.get('NOTRAIN') else 2):
        left=budget();lv=3 if left>=(30 if done==0 else 60) else (2 if left>=12 and done==0 else 0)
        if not lv:break
        pg.locator(C,has_text='Train a hero').first.click();pg.wait_for_timeout(200)
        hero=None
        for nm in CAST:
            if pg.locator('#ov .dlg .choice',has_text=nm).filter(has_not_text='Lv ').count():hero=nm;break
        if not hero:
            click('Back',True);break
        pg.locator('#ov .dlg .choice',has_text=hero).filter(has_not_text='Lv ').first.click();pg.wait_for_timeout(200)
        click('Level %d'%lv)
        got=False
        for pk in PERKS:
            if pg.locator('#ov .dlg .choice',has_text=pk).count():
                pg.locator('#ov .dlg .choice',has_text=pk).first.click();pg.wait_for_timeout(200);got=True;break
        if not got:pg.locator('#ov .dlg .choice').first.click();pg.wait_for_timeout(200)
        if lv>=3:pg.locator('#ov .dlg .choice').first.click();pg.wait_for_timeout(200)
        print('trained',hero,lv);done+=1
        click('Back',True)
        if done<2 and budget()>=60:continue
        break
    click('Back',True)
    click('Relic');rt=txt(pg)
    if 'Echoing Tome' in rt:
        pg.locator(C,has_text='Echoing Tome').first.click();pg.wait_for_timeout(200)
    else:
        click('Back',True)
    click('Starting boosts')
    for _ in range(30):
        did=False
        t=txt(pg);left=int(re.search(r'Budget: (\d+)',t).group(1))
        for nm in BOOSTS:
            ch=pg.locator('#ov .dlg .choice',has_text=nm)
            if not ch.count():continue
            m=re.search(r'Buy for (\d+)',ch.first.inner_text())
            if m and int(m.group(1))<=left and 'tap to take back' not in ch.first.inner_text():
                ch.first.click();pg.wait_for_timeout(200);did=True;break
        if not did:break
    click('Back',True)
    pg.locator('#ov .dlg .choice',has_text='Begin the run').first.click();pg.wait_for_timeout(300)
    pg.locator('#ov .dlg .btn, #ov .dlg .choice',has_text='Begin').first.click();pg.wait_for_timeout(500)
def main():
    with sync_playwright() as p:
        b=p.chromium.launch();ctx=b.new_context(viewport={'width':412,'height':900},timezone_id='Pacific/Kiritimati');pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        if FAKE:
            y,m,d=map(int,FAKE.split('-'));pg.add_init_script(FAKEJS%(y,m-1,d))
        pg.route('**/rest/v1/**',lambda r,q:r.abort())  # the game's own leaderboard code stays out of it
        pg.goto('file://'+os.path.abspath(HTML));pg.wait_for_timeout(900)
        pg.evaluate("()=>{var m=JSON.parse(localStorage.getItem('dd1_meta')||'{}');m.wins=1;m.renown=500;localStorage.setItem('dd1_meta',JSON.stringify(m));}");pg.reload();pg.wait_for_timeout(900)
        day=pg.evaluate("()=>window.__dd.dailyRec().date")
        pg.add_script_tag(path=BOTJS);pg.evaluate('(c)=>{Object.assign(BOT.cfg,c)}',json.loads(CFGJ))
        plan(pg)
        for t in range(2000):
            r=pg.evaluate("()=>BOT.tick()")
            if '--v' in sys.argv:
                for l in r.get('log',[]):print(l[:1200])
            if r['s']=='END':break
            if r['s'] in('stuck','nog','wait'):print('STATE',r['s']);break
        res=pg.evaluate("()=>{var R=JSON.parse(localStorage.getItem('dd1_meta')).daily;return R&&R.att&&R.att[0]}")
        b.close()
    print('day',day,'result',json.dumps(res)[:200],'errs',errs[:2])
    if not res:sys.exit(1)
    body=json.dumps({'p_day':day,'p_device':BOT_DEVICE,'p_name':BOT_NAME,'p_act':res['act'],'p_step':res['step'],'p_wins':res['wins']}).encode()
    print('SCORE',res['score']);
    print('would submit',body.decode())
    if SUBMIT:
        rq=urllib.request.Request(URL+'/rest/v1/rpc/submit_daily',data=body,headers={'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'})
        print('submitted',urllib.request.urlopen(rq,timeout=20).status)
main()
