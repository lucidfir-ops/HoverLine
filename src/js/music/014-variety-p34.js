//# music/014-variety-p34.js: legacy: tune variety (Prototype 34)
/* ---------- music variety (Prototype 34) ----------
   The new samples in use. A tune's kx (seven more bits of its code) picks a drum kit (0 = the original), an instrument
   for the keys parts (0 = piano or electric piano as before) and whether a percussion layer plays. */
const KITX={1:{n:'808 kit',p:{kd:['x_bd_808',{syn:0.4,hp:0}],kt:['x_bd_boom',{syn:0.35,hp:0}],kp:['x_bd_808',{syn:0.4,hp:0}],s1:'x_sn_generic',s2:'x_elec_snare',cl:'x_perc_snap2',h1:'x_hat_gnu',h2:'x_hat_cab',ho:'x_hat_cats'}},
  2:{n:'club kit',p:{kd:'x_bd_haus',ks:'x_bd_fat',kp:'x_bd_haus',s1:'x_elec_mid_snare',s2:'x_elec_snare',h1:'x_hat_tap',h2:'x_hat_raw',ho:'x_hat_noiz'}},
  3:{n:'electro kit',p:{kd:'x_elec_soft_kick',ks:'x_elec_hollow_kick',kp:'x_elec_soft_kick',s1:'x_elec_lo_snare',s2:'x_elec_filt_snare',cl:'x_elec_pop',h1:'x_hat_sci',h2:'x_hat_zap',ho:'x_hat_psych'}},
  4:{n:'gas kit',p:{kd:['x_bd_gas',{syn:0.5}],kt:['x_bd_sone',{syn:0.5}],s1:'x_sn_generic',s2:'x_elec_mid_snare',h1:'x_hat_yosh',h2:'x_hat_bdu',ho:'x_hat_cats'}},
  5:{n:'tight kit',p:{kd:'x_bd_zum',ks:'x_bd_zum',kp:['x_bd_pure',{syn:0.5}],s1:'x_sn_generic',s2:'x_elec_lo_snare',h1:'x_hat_hier',h2:'x_hat_star',ho:'x_hat_cats'}},
  6:{n:'acoustic kit',p:{kd:['x_bd_zome',{syn:0.6}],s1:'x_sna',s2:'x_snb',sm:'x_sna',sg:['x_snb',{g:0.6}],h1:'x_hha',h2:'x_hhb',ho:'x_hho'}},
  7:{n:'tape kit',p:{kd:['x_bd_sone',{syn:0.5}],kt:['x_bd_808',{syn:0.35,hp:0}],s1:'x_elec_filt_snare',s2:'x_sn_generic',cl:'x_perc_snap2',h1:'x_hat_snap',h2:'x_hat_gem',ho:'x_hat_noiz'}}};
/* the instruments: the notes they were recorded at, an octave up for the high ones, and a name */
const INSTX={mb:{b:[48,65,79],n:'marimba'},vb:{b:[60,74,88],n:'vibraphone'},gl:{b:[79,91],oct:12,n:'glockenspiel'},ka:{b:[55,67],n:'kalimba'},hc:{b:[61,73,84],n:'harpsichord'},
  or:{b:[60,72],n:'pipe organ',send:0.2},sx:{b:[60,72],n:'tenor sax',send:0.2},dt:{b:[62,73],n:'dan tranh'},st:{b:[64,76],n:'strumstick'},bf:{b:[61,72],n:'balafon'},rc:{b:[72,84],oct:12,n:'recorder',send:0.25}};
INSTX.cb={b:[],oct:12,n:'808 cowbell',synth:true};
const XI_FL={dnb:['vb','mb','ka','sx','or','cb','hc'],brk:['mb','hc','cb','ka','vb','st','or'],trance:['gl','vb','ka','or','st','hc','mb'],psy:['dt','bf','ka','mb','st','rc','gl'],metal:[]};
/* percussion layers, one bar of sixteenths each (key:level, + for two at once, - for a rest); amen and break play a
   breakbeat stretched to the bar instead */
const PERCX=(()=>{const P=s=>s.split(' ').map(t=>t==='-'?null:t.split('+').map(h=>{const[k,v]=h.split(':');return['x_'+k,+v]}));
  return{latin:{n:'congas',p:P('cgl:.5 - bgh:.22 bgh:.3 tmb:.25 - cgs:.42 bgl:.22 - bgh:.25 cgo:.4 cgo:.25 tmb:.25 - cgs:.38 bgl:.2')},
    cajon:{n:'cajon',p:P('cj1:.5 - cj3:.2 - cj2:.45 - cj3:.18 cj3:.22 - cab:.2 cj1:.42 - cj2:.45 - cj3:.2 cab:.18')},
    darbuka:{n:'darbuka',p:P('db1:.5 - db2:.3 db3:.2 db2:.35 - db1:.4 db3:.2 db2:.3 - db1:.45 db2:.25 db2:.35 db3:.2 db2:.3 db3:.22')},
    tabla:{n:'tabla',p:P('tabla_dhec:.45 - tabla_na_s:.3 tabla_te1:.25 tabla_na:.35 - tabla_ghe1:.4 tabla_ke1:.25 tabla_tun1:.35 - tabla_na_s:.3 tabla_te1:.25 tabla_dhec:.4 tabla_re:.25 tabla_ghe4:.38 tabla_ke1:.22')},
        bells:{n:'agogo bells',p:P('agl:.3 - agh:.22 - wbk:.25 agh:.2 - agl:.25 - agh:.22 wbk:.2 - agl:.25 agh:.18 - cow:.15 -')},
    amen:{n:'amen break (re-played)',loop:'x_amen_r'},brk:{n:'breakbeat',loop:'x_loop_breakbeat'}}})();
const PERC_FL={dnb:['latin','cajon','amen','elec','bells','darbuka','brk'],brk:['amen','elec','brk','darbuka'],trance:['elec','latin','bells','cajon'],psy:['tabla','darbuka','elec'],metal:[]};
/* bass hits for the first beat of a drop (the note each is in), pads for the menu music (their root) */
const BHITX=[['x_bass_voxy_hit_c',0],['x_bass_drop_c',0],['x_bass_woodsy_c',0],['x_bass_dnb_f',5],['x_bass_hit_c',0]];
const PADX=[['x_tbd_pad_1',7],['x_tbd_pad_3',2],['x_ambi_drone',0],['x_ambi_glass_rub',6]];
