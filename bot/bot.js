window.BOT=(function(){
var d=window.__dd, LOG=[], unknown={}, CFG={noPlace:false,bench:0,restBelow:.6,rerollGold:10,rerollMax:4,buyMin:6,spread:1.5,dupe:0,parity:0,relicAll:0,trainB:20,tankB:0,frontB:0};
function log(s){LOG.push(s);}
var SPELLITEM={book:10,echo:9,crystal:8,gcast:8,gsup:7};
var ITEMP={book:10,echo:9,crystal:8,gcast:8,gsup:7,boots:6,sword:5,mail:5,garch:5,gass:5,gtank:5,gfight:5,fang:4,aegis:4,spikes:3,ember:5,shard:4,vial:5,serrate:4};
var RELICP={etome:12,loom:9,font:8,skull:8,glass:8,ccast:7,csup:6,crown:7,banner:6,whet:6,drum:6,feather:6,lantern:5,brand:5,heart:5,censer:5,chalice:4,tooth:5,carch:4,quiver:3,kit:4,belt:4,prism:4,pack:3,rear:3,vanguard:4,cannon:5,axe:4,horn:4,locket:3,bell:3,ctank:3,cfight:2,cass:3,coin:3,bulwark:3,briar:2,lonewolf:0,mason:0,hoard:0,lens:3};
var HEROP={ember:10,nix:10,grisk:9,sable:8,kestrel:8,ashling:7,hale:7,moss:7,pyra:6,ylva:6,bramble:6,brandt:6,oda:6,thorne:5,vesk:6,mire:5,greymaw:5,cogs:5};
var PERKP={arcana:10,focus:9,tough:7,haste:6,edge:5,plate:4,leech:4,a_burn:3,a_frost:2,a_poison:3,a_bleed:2,a_shield:2,a_thorns:1};
var PATHP={'wildfire':9,'contagion':9,'hellfire':9,'lay on hands':8,'purify':6,'phoenix':7,'hearthfire':5,'remedy':5,'iron fist':4,'huntress':8,'trapper':6,'guardian':6,'last stand':7};
function role(h){return (d.HEROES[h.hid].role||'').toLowerCase();}
function isCaster(h){var r=role(h);return /caster|support/.test(r)&&!/tank/.test(r);}
function isTank(h){return /tank/.test(role(h));}
function isRanged(h){return d.HEROES[h.hid].rng>=3;}
function nm(h){return d.HEROES[h.hid].n;}
function cap(){return d.boardCap();}
function trainedBonus(k){var D=d.getDAILY&&d.getDAILY();return (D&&D.train&&D.train[k])?CFG.trainB:0;}
function heroScore(k){var H=d.HEROES[k];var s=(HEROP[k]||5)+trainedBonus(k);var G=d.G;var team=G.party;var themes={};team.forEach(function(h){d.HEROES[h.hid].th.forEach(function(t){themes[t]=(themes[t]||0)+1;});});
  H.th.forEach(function(t){var c=themes[t]||0;if(CFG.parity){s+=(c%2===1?3.5:(c===0?1:0));}else s+=c*.8;});
  var tanks=team.filter(isTank).length;if(/tank/.test(H.role.toLowerCase())&&tanks<1)s+=4+CFG.tankB;var fr=team.filter(function(h){return isTank(h)||/fighter/.test(role(h));}).length;if(fr<1&&(/tank|fighter/.test(H.role.toLowerCase())))s+=CFG.frontB;if(/tank/.test(H.role.toLowerCase())&&tanks>=2)s-=4;
  var casters=team.filter(isCaster).length;if(/caster/.test(H.role.toLowerCase())&&casters<3)s+=2;
  return s;}
function dlg(){return document.querySelector('#ov .dlg');}
function choicesOf(D){return Array.prototype.slice.call(D.querySelectorAll('.choice'));}
function nameOf(c){var b=c.querySelector('b');return (b?b.innerText:c.innerText).trim();}
function clickBtn(D,re){var bs=Array.prototype.slice.call(D.querySelectorAll('.btn'));for(var i=0;i<bs.length;i++){if(re.test(bs[i].innerText)&&!/HIDE/.test(bs[i].innerText)){bs[i].click();return true;}}return false;}
function pickBy(cs,fn){var best=-1,bi=0;cs.forEach(function(c,i){var v=fn(c,nameOf(c),c.innerText);if(v>best){best=v;bi=i;}});cs[bi].click();return nameOf(cs[bi]);}
function itemKeyByName(n){for(var k in d.ITEMS)if(d.ITEMS[k].n===n)return k;return null;}
function relicKeyByName(n){n=n.replace(/\s*(II|III)$/,'');for(var k in d.RELICS)if(d.RELICS[k].n===n)return k;return null;}
function heroKeyByName(n){for(var k in d.HEROES)if(d.HEROES[k].n===n)return k;return null;}
function wantHeroFor(itemKey){var G=d.G,cand=G.party.filter(function(h){return h.items.length<d.itemCap(h);});if(!cand.length)return null;
  var best=null,bs=-1e9;cand.forEach(function(h){var s=heroScore0(h)+(SPELLITEM[itemKey]?(isCaster(h)?6:-4):0);var it=d.ITEMS[itemKey];
    if(it&&it.th&&d.HEROES[h.hid].th.indexOf(it.th)>=0)s+=3;
    if(/mail|aegis|spikes|gtank/.test(itemKey))s+=isTank(h)?5:0;
    if(/sword|boots|gass|garch|fang|gfight/.test(itemKey))s+=isCaster(h)?-2:(isRanged(h)||/assassin|fighter/.test(role(h))?3:0);
    s-=h.items.length*CFG.spread;if(!h.pos)s-=3;if(s>bs){bs=s;best=h;}});return best;}
function heroScore0(h){return (HEROP[h.hid]||5)+h.lv;}
var lastTitle='';
function handleDialog(D){
  var title=(D.querySelector('h2')?D.querySelector('h2').innerText:'').trim();var cs=choicesOf(D);var t=title.toLowerCase();var picked='';
  if(/results and share/i.test(D.innerText)){return 'END';}
  if(!cs.length){if(clickBtn(D,/./))return 'btn';return 'stuck';}
  if(/first hero/.test(t)){picked=pickBy(cs,function(c,n){var k=heroKeyByName(n);return k?HEROP[k]+(k==='ember'?5:0)+trainedBonus(k):0;});}
  else if(/^give /.test(t)||/ to$/.test(t)||/^give/.test(t)){var itemName=title.replace(/^give\s+/i,'').replace(/\s+to.*$/i,'');var ik=itemKeyByName(itemName);var w=ik?wantHeroFor(ik):null;
     var idx=-1;if(w){cs.forEach(function(c,i){if(nameOf(c).indexOf(nm(w))>=0)idx=i;});}
     if(idx<0){cs.forEach(function(c,i){if(idx<0&&!/bench/i.test(nameOf(c)))idx=i;});}if(idx<0)idx=0;cs[idx].click();picked=nameOf(cs[idx]);}
  else if(/choose an item|item/.test(t)&&!/relic/.test(t)){picked=pickBy(cs,function(c,n){var k=itemKeyByName(n);return k?(ITEMP[k]||2):0;});}
  else if(/reward or rest/.test(t)){var rest=cs.filter(function(c){return /^Rest/i.test(nameOf(c));})[0];var other=cs.filter(function(c){return !/^Rest/i.test(nameOf(c));});var low=d.G.hp<(d.G.maxHp||100)*CFG.restBelow;if(rest&&(low||!other.length)){rest.click();picked='Rest';}else{picked=pickBy(other,function(c,n){return /Hero/i.test(n)?5:(/Relic/i.test(n)?9:(/Item/i.test(n)?7:(/gold/i.test(n)?4:3)));});}}
  else if(/relic/.test(t)){picked=pickBy(cs,function(c,n){var k=relicKeyByName(n);return k?(RELICP[k]!=null?RELICP[k]:3):0;});}
  else if(/perk|level|train/.test(t)||cs.some(function(c){return /Arcana|Toughness|Keen Edge|Haste|Focus|Plating|Lifeleech|Attune/.test(nameOf(c));})){
     picked=pickBy(cs,function(c,n){var k=null;for(var pk in PERKP){var P=d.PERKS.filter(function(x){return x.k===pk})[0];if(P&&P.n===n)k=pk;}return k?PERKP[k]:0;});}
  else if(/path|specialis|choose a path/.test(t)||cs.some(function(c){return PATHP[nameOf(c).toLowerCase()]!=null;})){picked=pickBy(cs,function(c,n){return PATHP[n.toLowerCase()]||1;});}
  else if(/victory|defeat|continue/.test(t)||cs.length===0){}
  else{ // unknown: log and pick the first
     if(!unknown[title]){unknown[title]=cs.map(function(c){return c.innerText.replace(/\n/g,' / ').slice(0,80);});}
     cs[0].click();picked=nameOf(cs[0]);}
  log('DLG['+title+'] -> '+picked);return 'ok';
}
function placeAll(){if(CFG.noPlace)return;var G=d.G,cp=cap(),all=G.party.slice();
  // best cp heroes go on the board
  all.sort(function(a,b){return (heroScore0(b)+(b.items.length))-(heroScore0(a)+(a.items.length));});
  var board=all.slice(0,cp),bench=all.slice(cp);
  var front=[],mid=[],back=[];board.forEach(function(h){if(isTank(h)||/fighter/.test(role(h)))front.push(h);else if(isRanged(h)||isCaster(h))back.push(h);else mid.push(h);});
  var rows=[[5,front],[6,mid],[7,back]],qs=[3,2,4,1,5,0,6];
  // if one group is empty spill over: put assassins/dive anywhere
  rows.forEach(function(rw){rw[1].forEach(function(h,i){h.pos={q:qs[i%7],r:rw[0]};});});
  // avoid collisions
  var seen={};board.forEach(function(h){var key=h.pos.q+','+h.pos.r;if(seen[key]){for(var q=0;q<7;q++){for(var r=7;r>=4;r--){var kk=q+','+r;if(!seen[kk]){h.pos={q:q,r:r};key=kk;q=9;break;}}}}seen[key]=1;});
  bench.forEach(function(h){h.pos=null;});}
function offerScore(o){var G=d.G;
  if(o.type==='hero'){var h=G.party.filter(function(x){return x.hid===o.key;})[0];if(h){if(h.lv>=d.MAXLV)return -1;return 5+CFG.dupe+(HEROP[o.key]>=8?4:(HEROP[o.key]>=6?2:0))+(h.lv===1?2:0);}
     var n=G.party.length;if(n>=cap()+(CFG.bench||0))return -1;return heroScore(o.key);}
  if(o.type==='item'){var k=o.key.split(':')[0];return (ITEMP[k]||3)+1;}
  if(o.type==='relic'){var rk=o.key.split(':')[0].replace(/\d$/,'');rk=o.key.indexOf(':')>0?o.key.split(':')[0]:o.key;var base=d.RELICS[rk]?rk:rk;return (CFG.relicAll?20:0)+(RELICP[base]!=null?RELICP[base]:3)+2;}
  if(o.type==='build')return o.key==='wall'?2:(o.key==='gate'?1:0);
  return 0;}
function prep(){var G=d.G,n=0,acted=false;
  while(n++<14){if(dlg())return 'dlg';
    var best=-1,bi=-1,bsc=-1e9;
    G.shop.forEach(function(o,i){if(o.sold)return;var p=d.priceOf(o);if(p>G.gold)return;var sc=offerScore(o);var v=sc-(p*.15);if(sc>=CFG.buyMin&&v>bsc){bsc=v;bi=i;}});
    if(bi>=0){var oo=G.shop[bi];LOG.push('BUY '+oo.type+':'+oo.key+' '+d.priceOf(oo)+'g (gold '+G.gold+')');d.buy(bi);acted=true;if(dlg())return 'dlg';continue;}
    // reroll if rich enough
    var rc=(typeof d.rerollCost==='function')?d.rerollCost():1;
    if(G.gold>=rc+CFG.rerollGold&&(G.rr||0)<CFG.rerollMax){var g0=G.gold;LOG.push('REROLL '+rc+'g');d.reroll();acted=true;continue;}
    break;}
  placeAll();return acted?'acted':'idle';}
function fight(){var G=d.G;placeAll();d.startFight();var k=0;while(d.S&&!d.S.over&&k++<9000)d.simStep(d.S);var win=d.S&&d.S.winner===0;d.endFight();return win;}
function tick(){var D=dlg();if(!d.G)return {s:'nog'};
  if(D){var r=handleDialog(D);return {s:r==='END'?'END':'dlg',log:LOG.splice(0)};}
  if(d.phase==='prep'){var r=prep();if(r==='dlg')return {s:'dlg',log:LOG.splice(0)};
    var G=d.G;var a=G.act,s=G.step,gold=G.gold,hp=G.hp;var win=fight();LOG.push('FIGHT a'+a+'s'+s+' '+(win?'W':'L')+' hp'+Math.round(G.hp)+' party'+G.party.map(function(h){return h.hid+h.lv}).join(',')+' gold'+gold);return {s:'fight',log:LOG.splice(0)};}
  return {s:'wait'};}
return {cfg:CFG,tick:tick,unknown:function(){return unknown;}};
})();
