import{o as e}from"./rolldown-runtime-CMxvf4Kt.js";import{d as t,r as n,t as r}from"./vendor-react-DrV_iv_K.js";import{g as i,n as a,t as o}from"./index-B_nm6svm.js";var s=e(t(),1),c=e(o(),1),l=r();function u(){let{sharedFile:e}=a(),[t,r]=(0,s.useState)(`create`),[o,u]=(0,s.useState)(`My Digital E-Book`),[d,f]=(0,s.useState)(`Anonymous Author`),[p,m]=(0,s.useState)([{title:`Chapter 1: The Beginning`,content:`It was a bright cold day in April, and the clocks were striking thirteen...

Welcome to your custom digital book compiled cleanly using FileVerse.`}]),[h,g]=(0,s.useState)(null),[_,v]=(0,s.useState)(!1);(0,s.useEffect)(()=>{e&&e.name?.toLowerCase().endsWith(`.epub`)&&(r(`extract`),y(e))},[e]);let y=async e=>{v(!0);try{let t=await c.default.loadAsync(e),n=e.name.replace(/\.epub$/i,``),r=``,i=Object.keys(t.files).filter(e=>e.endsWith(`.xhtml`)||e.endsWith(`.html`)||e.endsWith(`.htm`));for(let e of i){let n=await t.file(e).async(`text`),i=new DOMParser().parseFromString(n,`text/html`);r+=`\n\n=== ${e} ===\n\n`+(i.body?.innerText||i.body?.textContent||``)}g({title:n,fileCount:i.length,text:r.trim()})}catch(e){alert(`Failed to read EPUB file: `+e.message)}finally{v(!1)}},b=async()=>{v(!0);try{let e=new c.default;e.file(`mimetype`,`application/epub+zip`,{compression:`STORE`}),e.folder(`META-INF`).file(`container.xml`,`<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);let t=e.folder(`OEBPS`),n=``,r=``;p.forEach((e,i)=>{let a=`chap_${i+1}`,o=`${a}.xhtml`;n+=`    <item id="${a}" href="${o}" media-type="application/xhtml+xml"/>\n`,r+=`    <itemref idref="${a}"/>\n`;let s=e.content.split(`

`).map(e=>`<p>${S(e)}</p>`).join(`
`);t.file(o,`<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${S(e.title)}</title>
  <style>
    body { font-family: serif; line-height: 1.6; margin: 5%; }
    h1 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
    p { margin-bottom: 1rem; text-indent: 1.5em; }
  </style>
</head>
<body>
  <h1>${S(e.title)}</h1>
  ${s}
</body>
</html>`)}),t.file(`content.opf`,`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${S(o)}</dc:title>
    <dc:creator>${S(d)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookID">urn:uuid:${Math.random().toString(36).substring(2)}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${n}  </manifest>
  <spine toc="ncx">
${r}  </spine>
</package>`);let i=``;p.forEach((e,t)=>{i+=`    <navPoint id="nav_${t+1}" playOrder="${t+1}">
      <navLabel><text>${S(e.title)}</text></navLabel>
      <content src="chap_${t+1}.xhtml"/>
    </navPoint>\n`}),t.file(`toc.ncx`,`<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="fileverse-epub"/>
  </head>
  <docTitle><text>${S(o)}</text></docTitle>
  <navMap>
${i}  </navMap>
</ncx>`);let a=await e.generateAsync({type:`blob`,mimeType:`application/epub+zip`}),s=URL.createObjectURL(a),l=document.createElement(`a`);l.href=s,l.download=`${o.replace(/[^a-z0-9]/gi,`_`).toLowerCase()}.epub`,l.click(),URL.revokeObjectURL(s)}catch(e){alert(`Error creating EPUB: `+e.message)}finally{v(!1)}},x=async e=>{let t=e.target.files?.[0];if(t){v(!0);try{let e=await c.default.loadAsync(t),n=t.name.replace(/\.epub$/i,``),r=``,i=Object.keys(e.files).filter(e=>e.endsWith(`.xhtml`)||e.endsWith(`.html`)||e.endsWith(`.htm`));for(let t of i){let n=await e.file(t).async(`text`),i=new DOMParser().parseFromString(n,`text/html`);r+=`\n\n=== ${t} ===\n\n`+(i.body?.innerText||i.body?.textContent||``)}g({title:n,fileCount:i.length,text:r.trim()})}catch(e){alert(`Failed to read EPUB file: `+e.message)}finally{v(!1)}}};function S(e){return(e||``).replace(/[<>&'"]/g,e=>{switch(e){case`<`:return`&lt;`;case`>`:return`&gt;`;case`&`:return`&amp;`;case`'`:return`&apos;`;case`"`:return`&quot;`;default:return e}})}return(0,l.jsxs)(`div`,{className:`tool-page`,style:{maxWidth:`1000px`,margin:`0 auto`,padding:`2rem 1.5rem`},children:[(0,l.jsxs)(`div`,{style:{marginBottom:`1.5rem`},children:[(0,l.jsx)(n,{to:`/`,style:{color:`#64748b`,textDecoration:`none`,fontSize:`0.9rem`},children:`← Back to Dashboard`}),(0,l.jsx)(`h1`,{style:{fontSize:`2rem`,fontWeight:800,marginTop:`0.5rem`,color:`#1e293b`},children:`E-Book Studio & EPUB Converter`}),(0,l.jsx)(`p`,{style:{color:`#64748b`},children:`Build compliant EPUB 3 books from text/markdown or extract and read existing EPUBs in your browser.`})]}),(0,l.jsxs)(`div`,{style:{display:`flex`,gap:`1rem`,borderBottom:`1px solid #e2e8f0`,marginBottom:`1.5rem`},children:[(0,l.jsx)(`button`,{onClick:()=>r(`create`),style:{background:`none`,border:`none`,padding:`0.75rem 1rem`,fontWeight:700,fontSize:`0.95rem`,cursor:`pointer`,borderBottom:t===`create`?`2px solid #0284c7`:`none`,color:t===`create`?`#0284c7`:`#64748b`},children:`Create / Build EPUB`}),(0,l.jsx)(`button`,{onClick:()=>r(`extract`),style:{background:`none`,border:`none`,padding:`0.75rem 1rem`,fontWeight:700,fontSize:`0.95rem`,cursor:`pointer`,borderBottom:t===`extract`?`2px solid #0284c7`:`none`,color:t===`extract`?`#0284c7`:`#64748b`},children:`Extract & Read EPUB`})]}),t===`create`?(0,l.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(320px, 1fr))`,gap:`1.5rem`},children:[(0,l.jsxs)(`div`,{style:{background:`#fff`,border:`1px solid #e2e8f0`,borderRadius:`12px`,padding:`1.5rem`},children:[(0,l.jsx)(`h3`,{style:{fontSize:`1.1rem`,fontWeight:700,marginBottom:`1rem`,color:`#1e293b`},children:`E-Book Metadata`}),(0,l.jsxs)(`div`,{style:{marginBottom:`1rem`},children:[(0,l.jsx)(`label`,{style:{display:`block`,fontSize:`0.85rem`,fontWeight:600,color:`#475569`,marginBottom:`0.3rem`},children:`Book Title`}),(0,l.jsx)(`input`,{type:`text`,value:o,onChange:e=>u(e.target.value),style:{width:`100%`,padding:`0.6rem`,border:`1px solid #cbd5e1`,borderRadius:`6px`}})]}),(0,l.jsxs)(`div`,{style:{marginBottom:`1.5rem`},children:[(0,l.jsx)(`label`,{style:{display:`block`,fontSize:`0.85rem`,fontWeight:600,color:`#475569`,marginBottom:`0.3rem`},children:`Author`}),(0,l.jsx)(`input`,{type:`text`,value:d,onChange:e=>f(e.target.value),style:{width:`100%`,padding:`0.6rem`,border:`1px solid #cbd5e1`,borderRadius:`6px`}})]}),(0,l.jsxs)(`button`,{onClick:b,disabled:_,style:{width:`100%`,background:`#10b981`,color:`#fff`,border:`none`,padding:`0.85rem`,borderRadius:`8px`,fontWeight:700,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,l.jsx)(i,{size:18}),` `,_?`Generating...`:`Build & Download .EPUB`]})]}),(0,l.jsxs)(`div`,{style:{background:`#fff`,border:`1px solid #e2e8f0`,borderRadius:`12px`,padding:`1.5rem`},children:[(0,l.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`1rem`},children:[(0,l.jsxs)(`h3`,{style:{fontSize:`1.1rem`,fontWeight:700,color:`#1e293b`},children:[`Chapters (`,p.length,`)`]}),(0,l.jsx)(`button`,{onClick:()=>m([...p,{title:`Chapter ${p.length+1}`,content:`Enter chapter content here...`}]),style:{background:`#0284c7`,color:`#fff`,border:`none`,padding:`0.4rem 0.8rem`,borderRadius:`6px`,fontSize:`0.8rem`,fontWeight:600,cursor:`pointer`},children:`+ Add Chapter`})]}),(0,l.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`1rem`,maxHeight:`420px`,overflowY:`auto`},children:p.map((e,t)=>(0,l.jsxs)(`div`,{style:{border:`1px solid #f1f5f9`,background:`#f8fafc`,padding:`1rem`,borderRadius:`8px`},children:[(0,l.jsx)(`input`,{type:`text`,value:e.title,onChange:e=>{let n=e.target.value;m(e=>e.map((e,r)=>r===t?{...e,title:n}:e))},style:{width:`100%`,padding:`0.4rem`,fontWeight:700,border:`1px solid #cbd5e1`,borderRadius:`4px`,marginBottom:`0.5rem`}}),(0,l.jsx)(`textarea`,{value:e.content,onChange:e=>{let n=e.target.value;m(e=>e.map((e,r)=>r===t?{...e,content:n}:e))},rows:4,style:{width:`100%`,padding:`0.4rem`,border:`1px solid #cbd5e1`,borderRadius:`4px`,fontSize:`0.85rem`}})]},t))})]})]}):(0,l.jsxs)(`div`,{style:{background:`#fff`,border:`1px solid #e2e8f0`,borderRadius:`12px`,padding:`1.5rem`},children:[(0,l.jsx)(`h3`,{style:{fontSize:`1.1rem`,fontWeight:700,marginBottom:`0.75rem`,color:`#1e293b`},children:`Upload an EPUB File`}),(0,l.jsx)(`input`,{type:`file`,accept:`.epub`,onChange:x,style:{width:`100%`,padding:`0.75rem`,border:`1px dashed #cbd5e1`,borderRadius:`8px`,background:`#f8fafc`,marginBottom:`1.5rem`}}),h&&(0,l.jsxs)(`div`,{children:[(0,l.jsxs)(`h4`,{style:{fontWeight:700,color:`#1e293b`,marginBottom:`0.5rem`},children:[`Extracted: `,h.title,` (`,h.fileCount,` chapters)`]}),(0,l.jsx)(`textarea`,{value:h.text,readOnly:!0,style:{width:`100%`,height:`350px`,padding:`0.75rem`,border:`1px solid #e2e8f0`,borderRadius:`8px`,background:`#f8fafc`,fontSize:`0.85rem`}})]})]})]})}export{u as default};