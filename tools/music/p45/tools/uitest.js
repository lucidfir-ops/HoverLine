// The library page and the Back to radio controls: screenshots at desktop and phone widths, Remove and Undo.
// node uitest.js <html> <outdir>
const H=require('./hl.js');const fs=require('fs');const path=require('path');
(async()=>{const OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});const {browser,page}=await H.open(process.argv[2]);const res={};
  await page.evaluate(()=>{const X=window.__hl;X.store.set('hoverline.tunes',JSON.stringify(['S1C00012345','S6900054321','S7100011111','S4B000A6996','S0700012345','DC50418AD801404']));X.music.changed&&X.music.changed()});
  for(const [w,h,tag] of [[1280,800,'desk'],[390,844,'phone']]){await page.setViewportSize({width:w,height:h});
    await page.evaluate(()=>{document.getElementById('musOpen').click()});await page.waitForTimeout(300);
    await page.screenshot({path:path.join(OUT,'music-'+tag+'.png')});
    await page.evaluate(()=>{document.getElementById('libOpen').click()});await page.waitForTimeout(300);
    await page.screenshot({path:path.join(OUT,'library-'+tag+'.png')});
    res[tag]=await page.evaluate(()=>{const T=document.getElementById('libTable'),r=T.getBoundingClientRect(),c=document.querySelector('#mus .card').getBoundingClientRect();
      const lp=T.querySelector('.lp').getBoundingClientRect(),rm=T.querySelector('.lrm').getBoundingClientRect();
      return{rows:T.querySelectorAll('tr').length,tableW:Math.round(r.width),cardW:Math.round(c.width),docW:document.documentElement.scrollWidth,winW:innerWidth,playToRemovePx:Math.round(rm.left-lp.right),removeH:Math.round(rm.height),playH:Math.round(lp.height)}});
    await page.evaluate(()=>{document.getElementById('libBack').click()})}
  /* Remove, then Undo; then play one (repeat label) and Back to radio */
  res.flow=await page.evaluate(async()=>{const X=window.__hl,M=X.music,o={};document.getElementById('libOpen').click();
    const before=M.kept().length;document.querySelectorAll('#libTable .lrm')[1].click();o.afterRemove=M.kept().length;o.undoShown=!document.getElementById('libUndo').hidden;o.undoText=document.getElementById('libUndoT').textContent;
    document.getElementById('libUndoB').click();o.afterUndo=M.kept().length;o.order=M.kept().join(',');o.before=before;
    document.querySelector('#libTable .lp').click();await new Promise(r=>setTimeout(r,200));o.label=M.modeLabel();o.libLbl=document.getElementById('libLbl').textContent;o.libRadioShown=!document.getElementById('libRadio').hidden;
    o.titleTune=document.getElementById('titleTune').textContent;o.radioBackShown=!document.getElementById('radioBack').hidden;
    document.getElementById('radioBack3').click();o.after=M.modeLabel();o.pinned=M.pinned;o.radioBackHidden=document.getElementById('radioBack').hidden;
    document.getElementById('libPlay').click();o.libMode=M.libMode;o.libLabel=document.getElementById('libLbl').textContent;o.playing=M.code();
    document.getElementById('libBack').click();o.mainShown=!document.getElementById('musMain').hidden;return o});
  await page.setViewportSize({width:1280,height:800});await page.evaluate(()=>{document.getElementById('musDone').click()});await page.waitForTimeout(200);
  await page.screenshot({path:path.join(OUT,'title-libmode.png')});
  console.log(JSON.stringify(res,null,1));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
