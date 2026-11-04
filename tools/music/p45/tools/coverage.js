// Which music recordings can a template play? node coverage.js <html> <out.json>
// Static: every template, every seed (all percussion layers its list can draw), its instruments, kit (fallback), textures,
// vocals, pads; plus the menu and old codes. "library" = with the sample library loaded the embedded drum kits only play
// as the fallback (single-file copy, Lite) and in old codes.
const H=require('./hl.js');const fs=require('fs');
(async()=>{const {browser,page}=await H.open(process.argv[2]);
  const r=await page.evaluate(()=>{const W=window.__hl,{SL,TPL,PERCX,KITX,KITX2,TEXR,INSTX}=W;const all=new Set([...Object.keys(SL.SMP||{}),...Object.keys(SL.VOX||{}).filter(k=>!k.startsWith('v_')),...Object.keys(SL.EXT||{}),...Object.keys(SL.EXT2||{})]);
    const{TSMP,TPERC,TPD,TUAC,SYNFB,TDR}=W;
    const reach={},add=(k,why)=>{if(!all.has(k))return;(reach[k]||(reach[k]=new Set())).add(why)};
    const kitRec=id=>{const K=KITX[id]||KITX2[id];if(!K)return[];return Object.values(K.p).map(p=>Array.isArray(p)?p[0]:p)};
    const base=['kd','km','kt','kh','s1','s2','sm','sb','sg','cl','h1','h2','ho','cr','rd','t1','t2','t3','im','rw','wh'];
    for(const T of TPL){if(T.ret)continue;const tag='t'+T.id;
      for(const k of base)add(k,tag+':fallback kit');for(const k of kitRec(T.kit))add(k,tag+':fallback kit');
      for(const i of[T.li,T.l2,T.kz,T.ai]){if(!i)continue;const S=TSMP[i]||(SYNFB[i]&&TSMP[SYNFB[i]]);if(S)for(const b of S[1])add(S[0]+b,tag+':'+i)}
      const PL=Array.isArray(T.perc)?T.perc:T.perc?[T.perc]:TPERC[T.f]||[];for(const p of PL){const X=PERCX[p];if(!X)continue;if(X.loop)add(X.loop,tag+':perc');else for(const e of X.p)if(e)for(const[k]of e)add(k,tag+':perc')}
      add(TUAC[T.f]||'x_clv1',tag+':accent');const P=TPD[T.pd];if(P&&P.smp)add(P.smp[0],tag+':pad');
      if(T.l==='chops')for(const k of['c_hey','c_oh','c_yeah','c_go','c_feel','c_higher'])add(k,tag+':chops');if(T.fx.includes('shout'))for(const k of['c_herewego','c_letsgo'])add(k,tag+':shout');
      if(T.fx.includes('subdrop'))add('x_bass_drop_c',tag+':subdrop');add('x_bass_drop_c',tag+':final lap');add('s_cb',tag+':final lap');if(T.fx.includes('scratch'))add('s_sc',tag+':scratch');if(T.fx.includes('glitch')){add('s_g1',tag);add('s_g3',tag)}
      if(T.fx.includes('choir'))add('s_ch',tag+':choir');if(T.fx.includes('harp'))for(const k of['i_hp_48','i_hp_69'])add(k,tag+':harp');if(T.fx.includes('cym'))add('i_cy',tag+':cymbal');if(T.fx.includes('tymp'))add('i_tp',tag+':timpani');
      if(T.fx.includes('didg'))add('x_didg',tag+':didgeridoo');if(T.li==='didg')add('x_didg',tag+':didgeridoo');if(T.fx.includes('swell'))add('x_scresc',tag+':swell');if(T.fx.includes('gong'))add('x_gong',tag+':gong');
      const D=TDR[T.d];if(D&&D.brk==='arov')for(const L of'abde')add('x_lp_ar_'+L,tag+':break');add('x_woosh',tag+':solo whoosh');
      for(const k of['i_sh1','i_sh2'])add(k,tag+':fallback shaker');if(T.bk&&TSMP[T.bk])for(const b of TSMP[T.bk][1])add(TSMP[T.bk][0]+b,tag+':breakdown '+T.bk);if(T.fx.includes('bell'))add('x_tb',tag+':bell');
      if(T.fx.includes('shout')&&T.f==='hardcore')add('c_faster',tag+':shout');
      const TX=T.tx||(!T.fx.includes('cym')&&!T.fx.includes('swell')&&T.id%2===1?(W.TTEX[T.f]||[])[(T.id>>1)%((W.TTEX[T.f]||[1]).length)]:null);if(TX&&TEXR[TX]){const X=TEXR[TX];for(const f of['pre','pre2','drop','brk'])if(X[f])add(X[f][0],tag+':texture '+TX);for(const[k]of X.pad)add(k,tag+':menu pad '+TX)}
      if(!T.fx.includes('subdrop')&&W.TBH[T.f])add(W.TBH[T.f][0],tag+':bass hit')}
    /* the menu's own music (ambient), whatever the tune */
    for(const k of['x_tbd_pad_1','x_tbd_pad_3','x_ambi_drone','x_ambi_glass_rub'])add(k,'menu ambient pads')
    for(const k of Object.keys(reach))reach[k]=[...reach[k]];
    return{all:[...all].sort(),reach}});
  const never=r.all.filter(k=>!r.reach[k]);const removed=['x_mz_60','x_mz_72','x_sn_dub'];
  const out={total:r.all.length,reached:r.all.length-never.length,by_templates:Object.keys(r.reach).length,never,removed,detail:r.reach};
  fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));console.log(out.total,'recordings,',out.reached,'reachable from templates; never:',never.join(' '));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
