/* Gambit Bot. The same code runs Watch the bot inside the game (botLiveMake in index.html). */
window.BOT=(function(){
function botLiveMake(){
var d=window.__dd, LOG=[], unknown={}, CFG={noPlace:false,bench:0,restBelow:.95,rerollGold:10,rerollMax:2,buyMin:6,spread:1.5,dupe:60,heroMin:12,heroDecay:3,parity:1,relicAll:0,trainB:20,tankB:0,frontB:0,rolePerk:1};
function log(s){LOG.push(s);}
function CLK(el){if(typeof bclk==='function'&&LIVE)bclk(el);else el.click();}
function FL(el){if(typeof bflash==='function'&&LIVE)bflash(el);}
function FLT(re){if(typeof bflashTxt==='function'&&LIVE)bflashTxt(re);}
var LIVE=false;
function why(s){LOG.push('» '+s);}
var SPELLITEM={book:10,echo:9,crystal:8,gcast:8,gsup:7};
var ITEMP={boots:10,echo:9,crystal:9,shard:8,book:7,mail:7,aegis:6,vial:6,sword:5,ember:5,serrate:4,spikes:4,fang:3,gcast:8,gsup:7,garch:7,gass:7,gtank:6,gfight:5};
var ATKH={morrow:1,thorne:1,skarra:1},PCTH={moss:1}; /* from the code: only these abilities use attack; Moss's Blight is % of foe health */
var RELICP={etome:12,loom:9,font:8,skull:8,glass:8,ccast:7,csup:6,crown:7,banner:6,whet:6,drum:6,feather:6,lantern:5,brand:5,heart:5,censer:5,chalice:4,tooth:5,carch:4,quiver:3,kit:4,belt:4,prism:4,pack:3,rear:3,vanguard:4,cannon:5,axe:4,horn:4,locket:3,bell:3,ctank:3,cfight:2,cass:3,coin:3,bulwark:3,briar:2,lonewolf:0,mason:0,hoard:0,lens:3};
var HEROP={moss:10,sable:9,nix:9,kestrel:10,vesk:9,morrow:9,grisk:8,ember:8,ylva:8,cogs:8,thorne:7,ashling:7,hale:7,pyra:6,oda:6,mire:5,greymaw:5,brandt:5,bramble:5,skarra:5};
var EARLYP={nix:10,brandt:9,hale:9,pyra:8,sable:8,ember:8,thorne:6,bramble:6,ylva:6,kestrel:5,vesk:5,moss:4,cogs:4,grisk:4,oda:3,mire:4,greymaw:4,skarra:4,morrow:2,ashling:1};
/* hero value: early-game rating in act 1, blending into the late-game rating by act 3 */
function HV(k){var a=d.G?d.G.act:1,w=a<=1?1:(a===2?.5:0);return w*(EARLYP[k]||5)+(1-w)*(HEROP[k]||5);}
var PERKP={arcana:10,focus:9,tough:7,haste:6,edge:5,plate:4,leech:4,a_burn:3,a_frost:2,a_poison:3,a_bleed:2,a_shield:2,a_thorns:1};
var PATHP={'pickpocket':8,'gutter':6,'hellfire':5,'grasping roots':8,'heartwood':6,'seedling':5,'crusader':9,'last stand':6,'guardian':5,
'the big one':9,'prospector':6,'sticky bombs':4,'hearthfire':9,'phoenix':6,'wildfire':5,'alpha':9,'pack hunter':5,'feral':5,
'salvager':7,'volatile':7,'homebrew':6,'purify':8,'iron fist':6,'lay on hands':6,'razorwind':8,'hailstorm':9,'scavenger':6,
'ambush':8,'toxin':8,'hydra':5,'phantom':10,'reaper':4,'soul harvest':3,'blight':10,'overgrowth':7,'grove':6,
'apothecary':8,'remedy':8,'contagion':5,'dawnhammer':7,'forgeblessing':7,'runeward':4,'beacon':8,'inferno':8,'bastion':4,
'grave robber':9,'plague lord':8,'lich':7,'bloodrage':7,'juggernaut':5,'warcry':5,'riposte':9,'disarm':6,'coup de grace':4,
'trapper':9,'bounty hunter':8,'huntress':6,'shatter':9,"valkyrie's flight":6,'avalanche':5};
var ROLEPERK={tank:{tough:10,plate:9,leech:6,focus:6,haste:4,arcana:4,edge:3},cast:{arcana:10,focus:9,haste:5,tough:6,plate:3,edge:2,leech:2},hit:{edge:10,haste:9,leech:7,tough:6,focus:5,arcana:4,plate:4}};
var PERKWHY={tank:'tanks want health and armor',cast:'casters and supports want ability power and mana',hit:'attackers want attack and speed'};
var EXPL={click:null,flash:null};
function hasTheme(t){return d.G.party.some(function(h){return d.HEROES[h.hid].th.indexOf(t)>=0;});}
function cntRole(re){return d.G.party.filter(function(h){return re.test(role(h));}).length;}
/* how good a relic is for THIS party; -100 means never take it */
function relicPri(k){var p=RELICP[k]!=null?RELICP[k]:3,P=d.G.party;
  if(k==='lonewolf'||k==='mason'||k==='hoard'||k==='vanguard')return -100;
  var no={quiver:cntRole(/marksman|ranger|falconer/)+P.filter(isRanged).length<1,lens:P.filter(isRanged).length<1,carch:cntRole(/marksman/)<1,ctank:cntRole(/tank/)<1,cfight:cntRole(/fighter/)<1,cass:cntRole(/assassin/)<1,ccast:cntRole(/caster/)<1,csup:cntRole(/support/)<1,
    bell:P.filter(function(h){return !isRanged(h);}).length<2,briar:!hasTheme('thorns'),heart:!hasTheme('frost'),crown:!hasTheme('burn'),chalice:!hasTheme('bleed'),bulwark:!hasTheme('shield'),etome:cntRole(/caster|support/)<1,
    font:cntRole(/caster|support/)<1,glass:cntRole(/caster|support/)<1,skull:cntRole(/caster|support/)<1,loom:cntRole(/caster|support/)<1};
  if(no[k])return -100;return p;}
function role(h){return (d.HEROES[h.hid].role||'').toLowerCase();}
function isCaster(h){var r=role(h);return /caster|support/.test(r)&&!/tank/.test(r);}
function isTank(h){return /tank/.test(role(h));}
function isRanged(h){return d.HEROES[h.hid].rng>=3;}
function nm(h){return d.HEROES[h.hid].n;}
function cap(){return d.boardCap();}
function trainedBonus(k){var D=d.getDAILY&&d.getDAILY();return (D&&D.train&&D.train[k])?CFG.trainB:0;}
function heroScore(k){var H=d.HEROES[k];var s=(HV(k)||5)+trainedBonus(k);var G=d.G;var team=G.party;var themes={};team.forEach(function(h){d.HEROES[h.hid].th.forEach(function(t){themes[t]=(themes[t]||0)+1;});});
  H.th.forEach(function(t){var c=themes[t]||0;if(CFG.parity){s+=(c%2===1?3.5:(c===0?1:0));}else s+=c*.8;});
  var tanks=team.filter(isTank).length;if(/tank/.test(H.role.toLowerCase())&&tanks<1)s+=4+CFG.tankB;var fr=team.filter(function(h){return isTank(h)||/fighter/.test(role(h));}).length;if(fr<1&&(/tank|fighter/.test(H.role.toLowerCase())))s+=CFG.frontB;
  /* survivability: every party needs a tank, and something that heals or shields */
  var hasTank=tanks>=1,hasSus=team.some(function(h){return /support/.test(role(h))||d.HEROES[h.hid].th.indexOf('shield')>=0;});
  var isT=/tank/.test(H.role.toLowerCase()),isSup=/support/.test(H.role.toLowerCase())||H.th.indexOf('shield')>=0;
  if(!hasTank&&isT)s+=14;else if(hasTank&&!hasSus&&isSup)s+=12;else if(!hasTank&&!isT&&team.length>=1)s-=3;if(/tank/.test(H.role.toLowerCase())&&tanks>=2)s-=4;
  var casters=team.filter(isCaster).length;if(/caster/.test(H.role.toLowerCase())&&casters<3)s+=2;
  return s;}
function dlg(){return document.querySelector('#ov .dlg');}
function choicesOf(D){return Array.prototype.slice.call(D.querySelectorAll('.choice'));}
function nameOf(c){var b=c.querySelector('b');return (b?b.innerText:c.innerText).trim();}
function clickBtn(D,re){var bs=Array.prototype.slice.call(D.querySelectorAll('.btn'));for(var i=0;i<bs.length;i++){if(re.test(bs[i].innerText)&&!/HIDE/.test(bs[i].innerText)){CLK(bs[i]);return true;}}return false;}
function pickBy(cs,fn){var best=-1,bi=0;cs.forEach(function(c,i){var v=fn(c,nameOf(c),c.innerText);if(v>best){best=v;bi=i;}});CLK(cs[bi]);return nameOf(cs[bi]);}
function itemKeyByName(n){for(var k in d.ITEMS)if(d.ITEMS[k].n===n)return k;return null;}
function relicKeyByName(n){n=n.replace(/\s*(II|III)$/,'');for(var k in d.RELICS)if(d.RELICS[k].n===n)return k;return null;}
function heroKeyByName(n){for(var k in d.HEROES)if(d.HEROES[k].n===n)return k;return null;}
function wantHeroFor(itemKey){var G=d.G,cand=G.party.filter(function(h){return h.items.length<d.itemCap(h);});if(!cand.length)return null;var CI=d.ITEMS[itemKey];if(CI&&CI.cls){var m=cand.filter(function(h){return clsOf(h).indexOf(CI.cls)>=0;});if(m.length){m.sort(function(a,b){return (survScore(b)+b.lv*.05)-(survScore(a)+a.lv*.05);});return m[0];}}
  var best=null,bs=-1e9;cand.forEach(function(h){var s=heroScore0(h)+(SPELLITEM[itemKey]?(isCaster(h)?6:-4):0);var it=d.ITEMS[itemKey];
    if(itemKey==='book')s+=(ATKH[h.hid]||PCTH[h.hid])?-12:4; /* ability power does nothing for Moss, Morrow or Thorne */
    if(/^(sword|fang|gass)$/.test(itemKey))s+=ATKH[h.hid]?10:-8;
    if(/^(boots|echo|crystal)$/.test(itemKey)&&PCTH[h.hid])s+=6;
    if(itemKey==='shard'&&!isCaster(h)&&d.HEROES[h.hid].th.indexOf('frost')<0)s+=3;
    if(it&&it.th&&d.HEROES[h.hid].th.indexOf(it.th)>=0)s+=3;
    if(/mail|aegis|spikes|gtank/.test(itemKey))s+=isTank(h)?5:0;
    if(/sword|boots|gass|garch|fang|gfight/.test(itemKey))s+=isCaster(h)?-2:(isRanged(h)||/assassin|fighter/.test(role(h))?3:0);
    s-=h.items.length*CFG.spread;if(!h.pos)s-=3;if(s>bs){bs=s;best=h;}});return best;}
function clsOf(h){var r=(d.HEROES[h.hid].role||'').toLowerCase(),c=[];[['tank','tank'],['fighter','fight'],['assassin','ass'],['marksman','arch'],['caster','cast'],['support','sup']].forEach(function(x){if(r.indexOf(x[0])>=0)c.push(x[1]);});
  if(h.path){var P=d.HEROES[h.hid].paths.filter(function(p){return p.k===h.path;})[0];if(P&&P.cls2)c.push(P.cls2);}return c;}
var SURV={};
function survScore(h){var s=SURV[h.uid];return s?s.alive/Math.max(1,s.n):(isRanged(h)||isCaster(h)?.8:.5);}
function heroScore0(h){return (HV(h.hid)||5)+h.lv;}
function roleKind(k){var r=(d.HEROES[k].role||'').toLowerCase();return /tank/.test(r)?'tank':(/caster|support/.test(r)?'cast':'hit');}
function tierWord(k){var p=HV(k)||5;return p>=9?'one of the strongest heroes':(p>=7?'a strong hero':'a solid hero');}
function heroWhy(k){var H=d.HEROES[k],team=d.G.party,tanks=team.filter(isTank).length,isT=/tank/.test(H.role.toLowerCase());
  var hasSus=team.some(function(h){return /support/.test(role(h))||d.HEROES[h.hid].th.indexOf('shield')>=0;}),isSup=/support/.test(H.role.toLowerCase())||H.th.indexOf('shield')>=0;
  if(!team.length)return tierWord(k)+' to build around';
  if(isT&&tanks<1)return 'the party has no tank yet';
  if(tanks>=1&&!hasSus&&isSup)return 'the party needs healing or shields';
  var th={};team.forEach(function(h){d.HEROES[h.hid].th.forEach(function(t){th[t]=(th[t]||0)+1;});});
  var odd=H.th.filter(function(t){return (th[t]||0)%2===1;});
  if(odd.length)return tierWord(k)+', and it takes '+odd[0]+' from '+th[odd[0]]+' to '+(th[odd[0]]+1)+' heroes (bonuses unlock at 2, 4 and 6)';
  return tierWord(k);}
var lastTitle='';
function handleDialog(D){
  var title=(D.querySelector('h2')?D.querySelector('h2').innerText:'').trim();var cs=choicesOf(D);var t=title.toLowerCase();var picked='';
  if(/results and share/i.test(D.innerText)){return 'END';}
  if(!cs.length){if(clickBtn(D,/./))return 'btn';return 'stuck';}
  if(/first hero/.test(t)){why('First hero: it starts with a tank or one of the strongest heroes, because the early fights need someone who can survive.');picked=pickBy(cs,function(c,n){var k=heroKeyByName(n);return k?HV(k)+(k==='ember'?5:0)+trainedBonus(k)+(/tank/.test(d.HEROES[k].role.toLowerCase())?9:0):0;});}
  else if(/^give /.test(t)||/ to$/.test(t)||/^give/.test(t)){var itemName=title.replace(/^give\s+/i,'').replace(/\s+to.*$/i,'');var ik=itemKeyByName(itemName);var w=ik?wantHeroFor(ik):null;
     var idx=-1;if(w){cs.forEach(function(c,i){if(nameOf(c).indexOf(nm(w))>=0)idx=i;});}
     if(idx<0){cs.forEach(function(c,i){if(idx<0&&!/bench/i.test(nameOf(c)))idx=i;});}if(idx<0)idx=0;if(ik&&w)why('Gives '+itemName+' to '+nm(w)+': '+(/mail|aegis|spikes|gtank/.test(ik)&&isTank(w)?'armor and shields belong on the tank':(SPELLITEM[ik]&&isCaster(w)?'spell items belong on casters':'the hero who gets the most out of it with free item slots'))+'.');CLK(cs[idx]);picked=nameOf(cs[idx]);}
  else if(/choose an item|item/.test(t)&&!/relic/.test(t)){picked=pickBy(cs,function(c,n){var k=itemKeyByName(n);return k?(ITEMP[k]||2):0;});}
  else if(/reward or rest/.test(t)){var rest=cs.filter(function(c){return /^Rest/i.test(nameOf(c));})[0];var other=cs.filter(function(c){return !/^Rest/i.test(nameOf(c));});var low=d.G.hp<(d.G.maxHp||100)*CFG.restBelow;if(rest&&(low||!other.length)){why('Rests: health is '+Math.round(d.G.hp)+'/'+(d.G.maxHp||100)+'. Losing a fight costs health, so it stays near full.');CLK(rest);picked='Rest';}else{why('Health is full enough, so it takes a reward: a relic first, then an item.');picked=pickBy(other,function(c,n){return /Hero/i.test(n)?5:(/Relic/i.test(n)?9:(/Item/i.test(n)?7:(/gold/i.test(n)?4:3)));});}}
  else if(/relic/.test(t)){why('Picks the relic that does the most for this party (it skips relics for classes or effects it does not have).');picked=pickBy(cs,function(c,n){var k=relicKeyByName(n);return k?relicPri(k):0;});}
  else if(/choose a path/i.test(D.innerText)){var hk=heroKeyByName(title.replace(/\s+reaches.*$/,''));var pv=function(n){return PATHP[n.toLowerCase().replace(/\s*\+.*$/,'').trim()]||1;};
     var pn=pickBy(cs,function(c,n){return pv(n)+100;});picked=pn;var pts=pv(pn);why('Path: '+pn.replace(/\s*\+.*$/,'')+(pts>=8?' - one of the best '+(hk?d.HEROES[hk].n:'')+' paths in testing.':' - the best of these three for this hero in testing.'));}
  else if(/perk|level|train/.test(t)||cs.some(function(c){return /Arcana|Toughness|Keen Edge|Haste|Focus|Plating|Lifeleech|Attune/.test(nameOf(c));})){
     var who=heroKeyByName(title.replace(/\s+reaches.*$/,'')),rk=who?roleKind(who):'hit',RP=ROLEPERK[rk];
     picked=pickBy(cs,function(c,n){var k=null;for(var pk in PERKP){var P=d.PERKS.filter(function(x){return x.k===pk})[0];if(P&&P.n===n)k=pk;}return k?(CFG.rolePerk?(RP[k]!=null?RP[k]:2):PERKP[k]):0;});
     why('Perk: '+picked+' - '+PERKWHY[rk]+'.');}
  else if(/victory|defeat|continue/.test(t)||cs.length===0){}
  else{ // unknown: log and pick the first
     if(!unknown[title]){unknown[title]=cs.map(function(c){return c.innerText.replace(/\n/g,' / ').slice(0,80);});}
     CLK(cs[0]);picked=nameOf(cs[0]);}
  log('DLG['+title+'] -> '+picked);return 'ok';
}
function cube(q,r){var x=q-(r-(r&1))/2;return [x,-x-r,r];}
function hd(a,b){var A=cube(a[0],a[1]),B=cube(b[0],b[1]);return Math.max(Math.abs(A[0]-B[0]),Math.abs(A[1]-B[1]),Math.abs(A[2]-B[2]));}
/* bonus round: melee where they touch the most track, ranged where they reach the most; track near the start counts double */
function tdPlace(cp,all){var R=d.ROOMS[d.G.enc.room],W={};
  R.paths.forEach(function(p){var n=p.length;p.forEach(function(c,i){var w=1+(n-1-i)/(n-1),k=c[0]+','+c[1];if(!W[k]||W[k]<w)W[k]=w;});});
  var cells=Object.keys(W).map(function(k){var a=k.split(',');return [+a[0],+a[1],W[k]];});
  var free=[];for(var r=0;r<R.m.length;r++)for(var q=0;q<7;q++)if(R.m[r][q]==='.')free.push([q,r]);
  var used={};all.forEach(function(h){h.pos=null;});
  all.slice(0,cp).forEach(function(h){var rng=Math.max(1,d.HEROES[h.hid].rng),best=null,bs=-1;
    free.forEach(function(f){var k=f[0]+','+f[1];if(used[k])return;var s=0;cells.forEach(function(c){if(hd(f,c)<=rng)s+=c[2];});if(s>bs){bs=s;best=f;}});
    if(best){used[best[0]+','+best[1]]=1;h.pos={q:best[0],r:best[1]};}});}
function placeAll(){if(CFG.noPlace)return;var G=d.G,cp=cap(),all=G.party.slice();
  // best cp heroes go on the board
  all.sort(function(a,b){return (heroScore0(b)+(b.items.length))-(heroScore0(a)+(a.items.length));});
  if(G.enc&&G.enc.td&&!CFG.noTd)return tdPlace(cp,all);
  var board=all.slice(0,cp),bench=all.slice(cp);
  var front=[],mid=[],back=[];board.forEach(function(h){if(isTank(h))front.push(h);else if(isRanged(h)||isCaster(h))back.push(h);else mid.push(h);});
  var rows=[[5,front],[6,mid],[7,back]],qs=[3,2,4,1,5,0,6];
  // if one group is empty spill over: put assassins/dive anywhere
  rows.forEach(function(rw){rw[1].forEach(function(h,i){h.pos={q:qs[i%7],r:rw[0]};});});
  // avoid collisions
  var seen={};board.forEach(function(h){var key=h.pos.q+','+h.pos.r;if(seen[key]){for(var q=0;q<7;q++){for(var r=7;r>=4;r--){var kk=q+','+r;if(!seen[kk]){h.pos={q:q,r:r};key=kk;q=9;break;}}}}seen[key]=1;});
  bench.forEach(function(h){h.pos=null;});}
function offerScore(o){var G=d.G;
  if(o.type==='hero'){var h=G.party.filter(function(x){return x.hid===o.key;})[0];if(h){if(h.lv>=d.MAXLV)return -1;return 5+CFG.dupe+(HV(o.key)>=8?4:(HV(o.key)>=6?2:0))+h.lv*1.5;}
     var n=G.party.length;if(n>=cap()+(CFG.bench||0))return -1;var sc=heroScore(o.key);/* an empty board slot is never better than a hero: fill the board first, be picky only about extras */ if(n<cap())return sc+8;if(sc<CFG.heroMin-(G.step-1)*CFG.heroDecay)return -1;return sc;}
  if(o.type==='item'){var k=o.key.split(':')[0];var CI=d.ITEMS[k];if(CI&&CI.cls&&CFG.classItems!==0){var who=G.party.filter(function(h){return h.pos&&clsOf(h).indexOf(CI.cls)>=0&&h.items.length<d.itemCap(h);});if(!who.length)return -1;var stable=G.hp>=(G.maxHp||100)*.6;return G.act<=3?(stable?16:4):(G.act<=6?9:3);}var defHeld=G.party.some(function(h){return h.items.some(function(x){return /^(mail|aegis|spikes|gtank)/.test(x);});});return (ITEMP[k]||3)+1+((!defHeld&&/^(mail|aegis|spikes|gtank)$/.test(k))?6:0);}
  if(o.type==='relic'){var rk=o.key.split(':')[0].replace(/\d$/,'');rk=o.key.indexOf(':')>0?o.key.split(':')[0]:o.key;var base=d.RELICS[rk]?rk:rk;var rp=relicPri(base);if(rp<=-100)return -1;return CFG.relicAll?18+rp*2:rp+2;}
  if(o.type==='build')return o.key==='wall'?2:(o.key==='gate'?1:0);
  return 0;}
function wantedDupe(o){if(o.type!=='hero')return false;var G=d.G;return G.party.some(function(h){return h.hid===o.key&&h.pos&&h.lv<d.MAXLV;});}
function prep(){var G=d.G,n=0,acted=false,fr=0;
  var wi;while((wi=G.stash.indexOf('wall'))>=0){G.stash.splice(wi,1);G.gold+=3;LOG.push('SELL free wall +3g');why('Sells the free wall for 3 gold: gold for level-ups is worth more than a wall.');acted=true;if(CFG.oneAct){d.renderAll();return 'acted';}}
  while(n++<14){if(dlg())return 'dlg';
    var best=-1,bi=-1,bsc=-1e9;
    G.shop.forEach(function(o,i){if(o.sold)return;var p=d.priceOf(o);if(p>G.gold)return;var sc=offerScore(o);var v=sc-(p*.15);var bm=(G.step>=7||(G.enc&&G.enc.diff==='boss'))?1:CFG.buyMin;if(sc>=bm&&v>bsc){bsc=v;bi=i;}});
    if(bi>=0&&G.shop[bi].type!=='hero'&&G.act<=2&&(G.rr||0)<(CFG.lvRR!=null?CFG.lvRR:3)&&G.gold>=d.rerollCost()+4&&G.party.some(function(h){return h.pos&&h.lv<d.MAXLV;})){var rc0=d.rerollCost();LOG.push('REROLL '+rc0+'g (levels first)');why('Rerolls ('+rc0+'g) looking for copies of its heroes: early on, level-ups beat items and relics.');FLT(/^REROLL/);d.reroll();acted=true;if(CFG.oneAct){placeAll();d.renderAll();return 'acted';}continue;}
    if(bi>=0){var oo=G.shop[bi];LOG.push('BUY '+oo.type+':'+oo.key+' '+d.priceOf(oo)+'g (gold '+G.gold+')');var pr=d.priceOf(oo);
      if(oo.type==='hero'){var own=G.party.filter(function(x){return x.hid===oo.key;})[0];why(own?('Levels up '+d.HEROES[oo.key].n+' to '+(own.lv+1)+' ('+pr+'g): level-ups are the best use of gold.'):('Recruits '+d.HEROES[oo.key].n+' ('+pr+'g): '+heroWhy(oo.key)+'.'));}
      else if(oo.type==='relic'){var rb=oo.key.split(':')[0];why('Buys the relic '+(d.RELICS[rb]?d.RELICS[rb].n:rb)+' ('+pr+'g): nothing better to spend on this round (level-ups come first).');}
      else if(oo.type==='item'&&d.ITEMS[oo.key.split(':')[0]].cls){why('Buys '+d.ITEMS[oo.key.split(':')[0]].n+' ('+pr+'g): class items start weak but grow every fight a matching hero survives, so it buys them early and keeps them all run.');}
      else if(oo.type==='item'){var ib=oo.key.split(':')[0];why('Buys '+(d.ITEMS[ib]?d.ITEMS[ib].n:ib)+' ('+pr+'g): spare gold, and its heroes have free item slots.');}FL(document.querySelectorAll('#market .card')[bi]);d.buy(bi);acted=true;if(dlg())return 'dlg';if(CFG.oneAct){placeAll();d.renderAll();return 'acted';}continue;}
    var wd=G.shop.filter(function(o){return !o.sold&&wantedDupe(o);});
    if(wd.length){if(!G.frozen){G.frozen=true;LOG.push('FREEZE shop: '+d.HEROES[wd[0].key].n+' would level up but costs '+d.priceOf(wd[0])+' (gold '+G.gold+')');why('Freezes the shop: '+d.HEROES[wd[0].key].n+' is here and would level up, but costs '+d.priceOf(wd[0])+'g and it has '+G.gold+'g. Keeps it for next round.');acted=true;}break;}
    if(d.rerollCost()===0&&fr++<10){LOG.push('FREE REROLL');why('Free reroll: looking for copies of its heroes to level them up.');FLT(/^REROLL/);d.reroll();acted=true;if(CFG.oneAct){placeAll();d.renderAll();return 'acted';}continue;}
    // reroll if rich enough
    var rc=(typeof d.rerollCost==='function')?d.rerollCost():1;
    if(G.gold>=rc+CFG.rerollGold&&(G.rr||0)<CFG.rerollMax){var g0=G.gold;LOG.push('REROLL '+rc+'g');why('Rerolls ('+rc+'g): it has gold to spare and nothing here is worth buying.');FLT(/^REROLL/);d.reroll();acted=true;continue;}
    break;}
  placeAll();return acted?'acted':'idle';}
function fight(){var G=d.G;placeAll();d.startFight();var k=0;while(d.S&&!d.S.over&&k++<9000)d.simStep(d.S);var win=d.S&&d.S.winner===0;try{d.S.units.forEach(function(u){if(u.team===0&&u.kind==='hero'&&u.ref){var r=SURV[u.ref]||(SURV[u.ref]={n:0,alive:0});r.n++;if(u.hp>0)r.alive++;}});}catch(e){}d.endFight();return win;}
function tick(){var D=dlg();if(!d.G)return {s:'nog'};
  if(D){var r=handleDialog(D);return {s:r==='END'?'END':'dlg',log:LOG.splice(0)};}
  if(d.phase==='prep'){var r=prep();if(r==='dlg')return {s:'dlg',log:LOG.splice(0)};
    var G=d.G;var a=G.act,s=G.step,gold=G.gold,hp=G.hp;var win=fight();LOG.push('FIGHT a'+a+'s'+s+' '+(win?'W':'L')+' hp'+Math.round(G.hp)+' party'+G.party.map(function(h){return h.hid+h.lv}).join(',')+' gold'+gold);return {s:'fight',log:LOG.splice(0)};}
  return {s:'wait'};}
var idle=0;
function live(){LIVE=true;var D=dlg();
  if(D){handleDialog(D);}
  else if(d.G&&d.phase==='prep'){var r=prep();if(r==='acted'||r==='dlg'){idle=0;}else{placeAll();d.renderAll();if(++idle>=2){idle=0;LOG.push('--- fight ---');why(d.G.enc&&d.G.enc.td?'Bonus round: melee heroes stand where they touch the most track, ranged ones where they reach the most, close to the start.':'Fight! Tanks in front with a row of space, fighters behind them, casters and archers in the back row.');FLT(/FIGHT/);d.startFight();}}}
  return {log:LOG.splice(0)};}
return {cfg:CFG,tick:tick,live:live};

}
/* ---------- watch the bot play (a normal run that is never saved and earns nothing) ---------- */
var botTimer=null,botFeed=[],BOT_MS=2200,botSpd=0,botBot=null;
function botSpeed(){botSpd=(botSpd+1)%3;BOT_MS=[2200,1200,500][botSpd];var s=document.getElementById('botspd');if(s)s.textContent='Speed: '+['slow','medium','fast'][botSpd];clearInterval(botTimer);botTimer=setInterval(botTick,BOT_MS);}

return botLiveMake();})();
