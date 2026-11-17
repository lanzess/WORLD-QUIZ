// WELTWISSEN: vollständig lokale Länderdatenbank, keine externe Atlas-API nötig.
const grid=document.getElementById('countryGrid'),searchInput=document.getElementById('search'),sortSelect=document.getElementById('sort'),modal=document.getElementById('countryModal'),modalBody=document.getElementById('modalBody');
let countries=[],activeRegion='Alle',favorites=new Set(JSON.parse(localStorage.getItem('weltwissen-favs')||'[]')),showFavorites=false,toastTimer;
const regionMap={'Europa':'Europa','Asien':'Asien','Afrika':'Afrika','Nordamerika':'Nordamerika','Südamerika':'Südamerika','Ozeanien':'Ozeanien','Antarktis':'Antarktis'};
const facts=[
'Nepal hat als einziger souveräner Staat eine Nationalflagge, die nicht viereckig ist.',
'Kanada grenzt an drei Ozeane: den Atlantik, den Pazifik und den Arktischen Ozean.',
'Nach Regen verwandelt sich der Salar de Uyuni in Bolivien in einen riesigen natürlichen Spiegel.',
'Japan besteht aus mehr als 14.000 Inseln. Die vier größten heißen Honshu, Hokkaido, Kyushu und Shikoku.',
'Die Atacama-Wüste in Chile zählt zu den trockensten Regionen der Erde.',
'Indonesien erstreckt sich über Südostasien und Ozeanien und besteht aus Tausenden Inseln.',
'In der Schweiz sind Deutsch, Französisch, Italienisch und Rätoromanisch Landessprachen.',
'Das Great Barrier Reef vor Australien ist das größte Korallenriffsystem der Erde.',
'Mongolei gehört zu den am dünnsten besiedelten Ländern der Welt.',
'Im Norden Norwegens kann man im Winter häufig Polarlichter beobachten.',
'Die Flagge von Bhutan zeigt einen weißen Drachen auf gelbem und orangefarbenem Hintergrund.',
'Chile ist so langgestreckt, dass es mehrere Klimazonen umfasst – von der Atacama bis zu Gletschern im Süden.'
];
const featuredPool=[
 {code:'ISL',tag:'NORD-EUROPA',title:'Island',desc:'Ein Land aus Feuer und Eis, in dem Gletscher auf Vulkane treffen.',fact:'Geothermie spielt in Island eine große Rolle bei der Wärme- und Stromversorgung.',image:'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1100&q=85'},
 {code:'JPN',tag:'OSTASIEN',title:'Japan',desc:'Alte Traditionen, riesige Metropolen und beeindruckende Natur.',fact:'Japan besteht nach aktuellen Zählungen aus mehr als 14.000 Inseln.',image:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1100&q=85'},
 {code:'BRA',tag:'SÜDAMERIKA',title:'Brasilien',desc:'Amazonas-Regenwald, Atlantikküste und lebendige Städte.',fact:'Brasilien ist das größte portugiesischsprachige Land der Welt.',image:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1100&q=85'},
 {code:'ITA',tag:'SÜDEUROPA',title:'Italien',desc:'Antike Städte, Kunst, Berge und sonnige Küsten.',fact:'Zwei unabhängige Enklaven liegen vollständig innerhalb Italiens: San Marino und Vatikanstadt.',image:'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1100&q=85'},
 {code:'NOR',tag:'NORD-EUROPA',title:'Norwegen',desc:'Fjorde, Berge und lange Nächte im hohen Norden.',fact:'Norwegens Küste ist durch Fjorde und Inseln besonders stark gegliedert.',image:'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1100&q=85'},
 {code:'EGY',tag:'NORD-AFRIKA',title:'Ägypten',desc:'Jahrtausendealte Bauwerke entlang des Nils.',fact:'Der Nil fließt durch mehrere Länder Afrikas, bevor er ins Mittelmeer mündet.',image:'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1100&q=85'},
 {code:'CHE',tag:'MITTELEUROPA',title:'Schweiz',desc:'Alpengipfel, klare Seen und charmante Städte.',fact:'Die Schweiz hat vier Landessprachen: Deutsch, Französisch, Italienisch und Rätoromanisch.',image:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1100&q=85'},
 {code:'AUS',tag:'OZEANIEN',title:'Australien',desc:'Einzigartige Tierwelt und Städte zwischen zwei Ozeanen.',fact:'Australien ist das einzige Land, das einen ganzen Kontinent einnimmt.',image:'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1100&q=85'},
 {code:'IND',tag:'SÜDASIEN',title:'Indien',desc:'Tausende Jahre Geschichte, viele Sprachen und vielfältige Landschaften.',fact:'Indien ist die Heimat sehr alter mathematischer und wissenschaftlicher Traditionen.',image:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1100&q=85'},
 {code:'NZL',tag:'OZEANIEN',title:'Neuseeland',desc:'Berge, grüne Täler und vulkanische Landschaften.',fact:'Neuseeland führte 1893 als erstes selbstverwaltetes Land das Frauenwahlrecht auf nationaler Ebene ein.',image:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1100&q=85'},
 {code:'MAR',tag:'NORD-AFRIKA',title:'Marokko',desc:'Atlantikküste, Atlasgebirge und historische Medinas.',fact:'Marokko besitzt Küsten am Atlantik und am Mittelmeer.',image:'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1100&q=85'},
 {code:'PER',tag:'SÜDAMERIKA',title:'Peru',desc:'Anden, Amazonasgebiet und das Erbe der Inka.',fact:'Machu Picchu liegt hoch in den Anden und wurde von den Inka erbaut.',image:'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1100&q=85'},
 {code:'GRC',tag:'SÜDEUROPA',title:'Griechenland',desc:'Inseln, antike Tempel und tiefblaues Meer.',fact:'Griechenland hat Tausende Inseln und Inselchen, von denen nur ein Teil bewohnt ist.',image:'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1100&q=85'},
 {code:'FRA',tag:'WESTEUROPA',title:'Frankreich',desc:'Von den Alpen bis zur Atlantikküste – voller Landschaften und Kultur.',fact:'Frankreich hat Gebiete in Europa, der Karibik, im Indischen Ozean und im Pazifik.',image:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1100&q=85'},
 {code:'THA',tag:'SÜDOSTASIEN',title:'Thailand',desc:'Tropische Inseln, Tempel und lebendige Märkte.',fact:'Thailand ist das einzige Land Südostasiens, das nie formell von einer europäischen Macht kolonisiert wurde.',image:'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1100&q=85'},
 {code:'ZAF',tag:'SÜDLICHES AFRIKA',title:'Südafrika',desc:'Küsten, Savannen und eine außergewöhnliche Artenvielfalt.',fact:'Südafrika hat drei Hauptstädte mit unterschiedlichen Regierungssitzen.',image:'https://images.unsplash.com/photo-1489749798305-2fea3ae63d43?w=1100&q=85'},
 {code:'MEX',tag:'MITTELAMERIKA',title:'Mexiko',desc:'Antike Kulturen, Wüsten, Regenwälder und Küsten.',fact:'In Mexiko liegen mehrere UNESCO-Welterbestätten aus der Zeit der Maya und Azteken.',image:'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=1100&q=85'},
 {code:'CHN',tag:'OSTASIEN',title:'China',desc:'Alte Handelswege, große Städte und vielfältige Landschaften.',fact:'Die Chinesische Mauer besteht aus vielen Abschnitten, die über unterschiedliche Dynastien hinweg gebaut wurden.',image:'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1100&q=85'},
 {code:'CAN',tag:'NORDAMERIKA',title:'Kanada',desc:'Weite Wälder, Seen und beeindruckende Gebirgslandschaften.',fact:'Kanada besitzt die längste Küstenlinie aller Staaten der Welt.',image:'https://images.unsplash.com/photo-1503614472-8c93d56cd7b4?w=1100&q=85'},
 {code:'TZA',tag:'OSTAFRIKA',title:'Tansania',desc:'Savannen, der Kilimandscharo und Inseln im Indischen Ozean.',fact:'Der Kilimandscharo ist der höchste Berg Afrikas.',image:'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1100&q=85'}
];
const fmt=n=>Number(n||0).toLocaleString('de-DE');
const flagEmoji=code=>String(code||'').toUpperCase().replace(/[A-Z]/g,ch=>String.fromCodePoint(127397+ch.charCodeAt(0)));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getNames=c=>[c.translations?.de?.common,c.translations?.de?.official,c.name?.common,c.name?.official].filter(Boolean);
const getRegion=c=>c.region||'Nicht angegeben';
const firstCapital=c=>c.capital?.[0]||'Keine Hauptstadt angegeben';
const getCurrencies=c=>Object.values(c.currencies||{}).map(x=>`${x.name}${x.symbol?` (${x.symbol})`:''}`).join(', ')||'Keine Angaben';
const getLanguages=c=>Object.values(c.languages||{}).join(', ')||'Keine Angaben';
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
function updateFavCount(){document.getElementById('favCount').textContent=favorites.size;document.getElementById('favCount2').textContent=favorites.size;localStorage.setItem('weltwissen-favs',JSON.stringify([...favorites]))}
function toggleFavorite(code,event){event?.stopPropagation();favorites.has(code)?favorites.delete(code):favorites.add(code);updateFavCount();renderCountries();toast(favorites.has(code)?'Zur Merkliste hinzugefügt':'Aus der Merkliste entfernt')}
function getFiltered(){let q=searchInput.value.trim().toLocaleLowerCase('de');let list=countries.filter(c=>{const names=getNames(c).join(' ').toLocaleLowerCase('de');const capital=(c.capital||[]).join(' ').toLocaleLowerCase('de');const region=getRegion(c).toLocaleLowerCase('de');return(!q||names.includes(q)||capital.includes(q)||region.includes(q)||c.cca2.toLowerCase().includes(q))&&(activeRegion==='Alle'||getRegion(c)===activeRegion)&&(!showFavorites||favorites.has(c.cca3))});const sort=sortSelect.value;list.sort((a,b)=>sort==='za'?getNames(b)[0].localeCompare(getNames(a)[0],'de'):sort==='population'?b.population-a.population:sort==='area'?(b.area||0)-(a.area||0):getNames(a)[0].localeCompare(getNames(b)[0],'de'));return list}
function renderCountries(){if(!countries.length)return;const list=getFiltered();document.getElementById('resultCount').textContent=`${fmt(list.length)} ${list.length===1?'Eintrag':'Einträge'} angezeigt`;document.getElementById('allCount').textContent=fmt(countries.length);if(!list.length){grid.innerHTML='<div class="loading-state"><b>Nichts gefunden</b><span>Ändere deine Suche oder die Filter.</span></div>';return}grid.innerHTML=list.map((c,i)=>{const name=c.translations?.de?.common||c.name.common;const native=c.nativeName||c.name.common;return `<article class="country-card" data-code="${c.cca3}" style="animation-delay:${Math.min(i%16,10)*35}ms"><div class="card-top"><span class="flag-emoji" aria-label="Flagge von ${esc(name)}">${flagEmoji(c.cca2)}</span><button class="card-fav ${favorites.has(c.cca3)?'saved':''}" data-fav="${c.cca3}" aria-label="Auf die Merkliste">${favorites.has(c.cca3)?'♥':'♡'}</button></div><h3>${esc(name)}</h3><div class="native-name">${esc(native||c.name.common)}</div><div class="card-bottom"><span>${esc(firstCapital(c))}</span><span>${esc(getRegion(c))}</span></div></article>`}).join('')}
function loadCountries(){
  document.getElementById('loadError').hidden=true;
  grid.innerHTML='<div class="loading-state"><div class="loader"></div><b>Der Atlas wird geöffnet</b><span>Die lokale Länder- und Gebietsdatenbank wird geladen …</span></div>';
  try{if(!Array.isArray(window.WORLD_COUNTRIES)||!window.WORLD_COUNTRIES.length)throw new Error('Die lokale Datei countries-de.js wurde nicht gefunden. Lege alle Dateien in denselben Ordner.');countries=window.WORLD_COUNTRIES.slice().sort((a,b)=>getNames(a)[0].localeCompare(getNames(b)[0],'de'));document.getElementById('statCountries').textContent=countries.length;document.getElementById('heroCountryCount').textContent=countries.length+' Einträge';document.getElementById('resultCount').textContent=`${countries.length} Länder und Gebiete geladen`;renderCountries();renderFeatured();}
  catch(e){console.error('WELTWISSEN atlas loading failed:',e);grid.innerHTML='';document.getElementById('loadError').hidden=false;document.getElementById('resultCount').textContent='Der lokale Atlas konnte nicht geöffnet werden';const message=document.getElementById('loadError').querySelector('[data-error-detail]');if(message)message.textContent=e.message||'Bitte prüfe, ob countries-de.js neben index.html und script.js liegt.'}
}
function renderFeatured(){const host=document.getElementById('featuredGrid');if(!host||!countries.length)return;const pool=featuredPool.filter(item=>countries.some(c=>c.cca3===item.code));for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}const selected=pool.slice(0,6);host.innerHTML=selected.map((item,index)=>`<article class="feature-wrap" style="--feature-delay:${index*70}ms"><div class="feature-card" style="background-image:url('${item.image}')"><div class="feature-overlay"></div><div class="feature-content"><span class="feature-tag">${item.tag}</span><h3>${item.title}</h3><p>${item.desc}</p><button data-feature-open="${item.code}" class="feature-link">Land ansehen ↗</button></div></div><div class="feature-fact"><span>✦ FAKT ÜBER DAS LAND</span><p>${item.fact}</p></div></article>`).join('')}
function val(v){return v===undefined||v===null||v===''?'Keine Angaben':v}
function detailRow(label,value){return `<div class="detail-row"><span>${label}</span><b>${esc(val(value))}</b></div>`}
async function getCountryPhotos(countryName){const queries=[`${countryName} Landschaft`,`${countryName} Sehenswürdigkeit`,`${countryName} Natur`];const found=[];for(const query of queries){try{const url=`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=1400&format=json&origin=*`;const response=await fetch(url,{signal:AbortSignal.timeout(6000)});if(!response.ok)continue;const data=await response.json();for(const page of Object.values(data.query?.pages||{})){const info=page.imageinfo?.[0],title=(page.title||'').toLowerCase();if(!info?.thumburl||!/^image\//.test(info.mime||'')||/logo|icon|flag|map|coat of arms|symbol/.test(title))continue;if(!found.some(x=>x.url===info.thumburl))found.push({url:info.thumburl,title:page.title.replace(/^File:/,'')});if(found.length>=6)return found}}catch(error){/* Die Detailseite bleibt auch ohne Galerie nutzbar. */}}return found}
async function openCountry(code){const c=countries.find(x=>x.cca3===code||x.name.common===code);if(!c)return;modal.showModal();modalBody.innerHTML='<div class="modal-loading"><div class="loader" style="margin:0 auto 18px"></div>Länderinformationen und Fotos werden geladen …</div>';const name=c.translations?.de?.common||c.name.common;let wiki=null,photos=[];const englishName=c.name.official||c.name.common;const title=encodeURIComponent(name.replaceAll(' ','_'));const jobs=await Promise.allSettled([fetch(`https://de.wikipedia.org/api/rest_v1/page/summary/${title}`,{signal:AbortSignal.timeout(7000)}).then(r=>r.ok?r.json():null),getCountryPhotos(name)]);if(jobs[0].status==='fulfilled')wiki=jobs[0].value;if(jobs[1].status==='fulfilled')photos=jobs[1].value||[];const flag=flagEmoji(c.cca2),languages=getLanguages(c),currency=getCurrencies(c);const borders=(c.borders||[]).map(code=>{const b=countries.find(x=>x.cca3===code);return b?.translations?.de?.common||b?.name.common||code}).join(', ')||'Keine Landgrenzen';const area=c.area?fmt(Math.round(c.area))+' km²':'Keine Angaben',population=c.population?fmt(c.population):'Keine Angaben';const description=wiki?.extract||`${name} liegt in ${getRegion(c)}. Weitere geografische Angaben findest du in den Informationen unten.`;const leadPhoto=photos[0]?.url||wiki?.originalimage?.source||wiki?.thumbnail?.source||'';const gallery=photos.length?`<h3 class="modal-subhead">Fotos des Landes</h3><div class="photo-gallery">${photos.map((photo,i)=>`<a class="gallery-photo" href="${esc(photo.url)}" target="_blank" rel="noopener"><img src="${esc(photo.url)}" alt="${esc(photo.title)}" loading="lazy"><span>${i+1}. ${esc(photo.title.replace(/\.[^.]+$/,''))}</span></a>`).join('')}</div><div class="photo-credit">Quelle: Wikimedia Commons. Klicke auf ein Foto, um das Original zu öffnen.</div>`:`<div class="photo-unavailable">Die Fotos konnten gerade nicht geladen werden. Du kannst die Bildergalerie über Wikimedia Commons öffnen.</div>`;modalBody.innerHTML=`<div class="modal-hero" style="${leadPhoto?`background-image:url('${esc(leadPhoto)}')`:''}"><div class="modal-title"><span class="modal-flag" aria-label="Flagge von ${esc(name)}">${flag}</span><h2>${esc(name)}</h2><p>${esc(c.name.official||name)} · ${esc(getRegion(c))}</p></div></div><div class="modal-content"><p class="modal-description">${esc(description)}</p><div class="modal-stats"><div class="modal-stat"><span>BEVÖLKERUNG</span><b>${population}</b></div><div class="modal-stat"><span>FLÄCHE</span><b>${area}</b></div><div class="modal-stat"><span>HAUPTSTADT</span><b>${esc(firstCapital(c))}</b></div></div>${gallery}<h3 class="modal-subhead">Allgemeine Informationen</h3><div class="detail-grid">${detailRow('Region',getRegion(c))}${detailRow('Teilregion',c.subregion)}${detailRow('Kontinent',c.continents?.join(', '))}${detailRow('Offizieller Name',c.name.official)}${detailRow('Eintragstyp','Land oder Gebiet nach ISO 3166-1')}${detailRow('Sprachen',languages)}${detailRow('Währung',currency)}${detailRow('Zeitzonen',(c.timezones||[]).join(', '))}${detailRow('Telefonvorwahl',(c.idd?.root||'')+(c.idd?.suffixes?.slice(0,4).join(', ')||''))}${detailRow('Nachbarländer',borders)}${detailRow('Koordinaten',c.latlng?.map(x=>x+'°').join(', '))}${detailRow('Wochenbeginn',c.startOfWeek)}</div><h3 class="modal-subhead">Auf der Karte ansehen</h3><div class="modal-links"><a class="modal-link" href="${esc(c.maps?.googleMaps||'#')}" target="_blank" rel="noopener">Google Maps öffnen ↗</a>${c.maps?.openStreetMaps?`<a class="modal-link" href="${esc(c.maps.openStreetMaps)}" target="_blank" rel="noopener">OpenStreetMap ↗</a>`:''}${c.coatOfArms?.svg?`<a class="modal-link" href="${esc(c.coatOfArms.svg)}" target="_blank" rel="noopener">Wappen des Landes ↗</a>`:''}<a class="modal-link" href="https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encodeURIComponent(name+' Landschaft') }" target="_blank" rel="noopener">Alle Fotos ↗</a><a class="modal-link" href="https://de.wikipedia.org/wiki/${title}" target="_blank" rel="noopener">Mehr auf Wikipedia ↗</a></div></div>`}
// Interaktionen
 grid.addEventListener('click',e=>{const fav=e.target.closest('[data-fav]');if(fav){toggleFavorite(fav.dataset.fav,e);return}const card=e.target.closest('[data-code]');if(card)openCountry(card.dataset.code)});
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('[data-region]');if(!b)return;activeRegion=b.dataset.region;showFavorites=false;document.getElementById('favoritesToggle').classList.remove('active');document.querySelectorAll('.region-tab').forEach(x=>x.classList.toggle('active',x===b));renderCountries()});
searchInput.addEventListener('input',renderCountries);sortSelect.addEventListener('change',renderCountries);
document.getElementById('reset').addEventListener('click',()=>{searchInput.value='';activeRegion='Alle';showFavorites=false;sortSelect.value='az';document.getElementById('favoritesToggle').classList.remove('active');document.querySelectorAll('.region-tab').forEach(x=>x.classList.toggle('active',x.dataset.region==='Alle'));renderCountries()});
function toggleFavFilter(){showFavorites=!showFavorites;document.getElementById('favoritesToggle').classList.toggle('active',showFavorites);renderCountries();document.getElementById('countries').scrollIntoView({behavior:'smooth'})}
document.getElementById('favoritesToggle').addEventListener('click',toggleFavFilter);document.getElementById('favoritesTop').addEventListener('click',toggleFavFilter);
document.getElementById('randomCountry').addEventListener('click',()=>{if(!countries.length)return toast('Bitte warte, der Atlas wird noch geladen.');openCountry(countries[Math.floor(Math.random()*countries.length)].cca3)});
document.getElementById('closeModal').addEventListener('click',()=>modal.close());modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});document.getElementById('retryLoad').addEventListener('click',loadCountries);
document.getElementById('newFact').addEventListener('click',()=>{const el=document.getElementById('factText');let next=facts[Math.floor(Math.random()*facts.length)];if(next===el.textContent)next=facts[(facts.indexOf(next)+1)%facts.length];el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350});el.textContent=next});
document.getElementById('featuredGrid').addEventListener('click',e=>{const b=e.target.closest('[data-feature-open]');if(b)openCountry(b.dataset.featureOpen)});document.getElementById('refreshFeatured').addEventListener('click',()=>{renderFeatured();toast('Die Auswahl wurde aktualisiert!')});
document.getElementById('menu').addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nav').classList.remove('open')));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchInput.focus()}if(e.key==='Escape'&&modal.open)modal.close()});
// Kleine Animationen: Scroll-Fortschritt, Cursor-Licht und 3D-Karten.
const progressBar=document.getElementById('scrollProgress'),cursorGlow=document.getElementById('cursorGlow');let scrollTick=false;
window.addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;progressBar.style.transform=`scaleX(${max>0?scrollY/max:0})`;scrollTick=false})},{passive:true});
window.addEventListener('pointermove',e=>{if(!cursorGlow||e.pointerType!=='mouse')return;cursorGlow.style.setProperty('--mx',e.clientX+'px');cursorGlow.style.setProperty('--my',e.clientY+'px');cursorGlow.style.left=e.clientX+'px';cursorGlow.style.top=e.clientY+'px'},{passive:true});
if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.stats-strip,.section-heading,.feature-card,.fact-banner,.about-copy,.about-orb').forEach(el=>{el.classList.add('reveal-on-scroll');revealObserver.observe(el)})}
grid.addEventListener('pointermove',e=>{const card=e.target.closest('.country-card');if(!card||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;card.style.setProperty('--px',`${x/r.width*100}%`);card.style.setProperty('--py',`${y/r.height*100}%`);card.style.transform=`perspective(800px) rotateX(${(y/r.height-.5)*-4}deg) rotateY(${(x/r.width-.5)*4}deg) translateY(-4px)`});grid.addEventListener('pointerleave',e=>{const card=e.target.closest('.country-card');if(card)card.style.transform=''},true);
updateFavCount();loadCountries();
// Dynamisches Quiz: Schwierigkeitsgrade und zufällige Fragen; die Historie gilt nur bis zum Neuladen.
(()=>{
 const panel=document.getElementById('quizPanel');
 const source=window.WORLD_COUNTRIES||[];
 if(!panel||!source.length)return;
 const countries=source.filter(c=>c&&c.cca3&&c.name&&c.name.common&&c.independent!==false);
 const $=id=>document.getElementById(id);
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const sample=(a,n)=>{const pool=[...a],out=[];while(pool.length&&out.length<n){out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0])}return out};
 const clean=a=>[...new Set(a.filter(x=>x!==undefined&&x!==null&&String(x).trim()).map(x=>String(x).trim()))];
 const name=c=>c.name.common;
 const values=(obj)=>obj&&typeof obj==='object'?Object.values(obj).filter(Boolean):[];
 const capital=c=>Array.isArray(c.capital)?c.capital[0]:'';
 const currency=c=>{const x=values(c.currencies);return x[0]&&x[0].name||''};
 const language=c=>values(c.languages)[0]||'';
 const timezone=c=>Array.isArray(c.timezones)?c.timezones[0]||'':'';
 const calling=c=>c.idd&&c.idd.root&&c.idd.suffixes&&c.idd.suffixes.length?c.idd.root+c.idd.suffixes[0]:'';
 const regions=clean(countries.map(c=>c.region));
 const subregions=clean(countries.map(c=>c.subregion));
 const timezones=clean(countries.flatMap(c=>Array.isArray(c.timezones)?c.timezones:[]));
 const languages=clean(countries.flatMap(c=>values(c.languages)));
 const currencies=clean(countries.flatMap(c=>values(c.currencies).map(x=>x.name)));
 const caps=clean(countries.map(capital));
 const calls=clean(countries.map(calling));
 const levelInfo={
  leicht:{label:'Leicht',desc:'Hauptstädte und Kontinente – ideal zum Einstieg.',types:['capital','region'],count:10},
  mittel:{label:'Mittel',desc:'Sprachen, Währungen und geografische Besonderheiten.',types:['language','currency','landlocked','subregion'],count:10},
  schwer:{label:'Schwer',desc:'Zeitzonen, Grenzen, Telefonvorwahlen und Größenvergleiche.',types:['timezone','borders','calling','area','population'],count:10},
  ultra:{label:'Ultra',desc:'Knifflige Vergleiche und Detailwissen aus der Länderdatenbank.',types:['area','population','borders','calling','timezone'],count:10}
 };
 let level='leicht',deck=[],index=0,score=0,locked=false;
 const sessionSeen=new Set();
 async function wasSeen(id){return sessionSeen.has(id)}
 async function markSeen(id){sessionSeen.add(id)}
 function question(type){
  let c,opts,answer,stem,explain,id,arr;
  if(type==='capital'){
   c=pick(countries.filter(x=>capital(x)));
   opts=sample(clean(countries.filter(x=>x.cca3!==c.cca3).map(capital)),3);
   if(!c||!opts||opts.length<3)return null;
   opts.push(capital(c));answer=3;stem='Welche Stadt ist die Hauptstadt von '+name(c)+'?';explain=capital(c)+' ist die Hauptstadt von '+name(c)+'.';id='capital:'+c.cca3;
  }else if(type==='region'||type==='subregion'){
   c=pick(countries.filter(x=>x[type]&&String(x[type]).trim()));
   arr=type==='region'?regions:subregions;
   if(!c||arr.length<4)return null;
   opts=sample(arr.filter(x=>x!==c[type]),3);if(opts.length<3)return null;
   opts.push(c[type]);answer=3;stem='Zu welcher geografischen '+(type==='region'?'Großregion':'Teilregion')+' gehört '+name(c)+'?';explain=name(c)+' wird der Region '+c[type]+' zugeordnet.';id=type+':'+c.cca3;
  }else if(type==='language'||type==='currency'){
   c=pick(countries.filter(x=>type==='language'?language(x):currency(x)));
   if(!c)return null;
   const correct=type==='language'?language(c):currency(c);
   arr=type==='language'?languages:currencies;
   opts=sample(arr.filter(x=>x!==correct),3);if(opts.length<3)return null;
   opts.push(correct);answer=3;stem='Welche '+(type==='language'?'Sprache':'Währung')+' ist in '+name(c)+' als '+(type==='language'?'Amtssprache':'Währung')+' verzeichnet?';explain=correct+' ist in den Länderdaten für '+name(c)+' aufgeführt.';id=type+':'+c.cca3;
  }else if(type==='timezone'||type==='calling'){
   c=pick(countries.filter(x=>type==='timezone'?timezone(x):calling(x)));
   if(!c)return null;
   const correct=type==='timezone'?timezone(c):calling(c);
   arr=type==='timezone'?timezones:calls;
   opts=sample(arr.filter(x=>x!==correct),3);if(opts.length<3)return null;
   opts.push(correct);answer=3;stem='Welche '+(type==='timezone'?'Zeitzone':'internationale Telefonvorwahl')+' gehört zu '+name(c)+'?';explain+'';
   explain=correct+' ist für '+name(c)+' in der Datenbank angegeben.';id=type+':'+c.cca3;
  }else if(type==='borders'){
   c=pick(countries.filter(x=>Array.isArray(x.borders)));
   if(!c)return null;
   const correct=c.borders.length;
   const nums=clean(countries.map(x=>Array.isArray(x.borders)?x.borders.length:null).filter(x=>x!==null&&x!==correct).map(String));
   opts=sample(nums,3);if(opts.length<3)return null;
   opts.push(String(correct));answer=3;stem='Wie viele Landnachbarn hat '+name(c)+' laut Länderdatenbank?';explain=name(c)+' hat '+correct+' erfasste Landnachbarn.';id='borders:'+c.cca3;
  }else if(type==='landlocked'){
   const yes=countries.filter(x=>x.landlocked===true),no=countries.filter(x=>x.landlocked===false);
   c=pick(yes);if(!c||no.length<3)return null;
   const chosen=[c,...sample(no,3)];opts=chosen.map(name);answer=0;stem='Welches dieser Länder ist ein Binnenstaat, also ohne direkten Zugang zum Meer?';explain=name(c)+' ist ein Binnenstaat.';id='landlocked:'+chosen.map(x=>x.cca3).sort().join('-');
   const shuffled=opts.map((v,i)=>({v,correct:i===answer})).sort(()=>Math.random()-.5);opts=shuffled.map(x=>x.v);answer=shuffled.findIndex(x=>x.correct);
  }else if(type==='area'||type==='population'){
   const eligible=countries.filter(x=>Number(x[type])>0);
   const chosen=sample(eligible,4);if(chosen.length<4)return null;
   const sorted=[...chosen].sort((a,b)=>Number(b[type])-Number(a[type]));
   c=sorted[0];opts=chosen.map(name);answer=opts.indexOf(name(c));
   stem='Welches dieser Länder hat '+(type==='area'?'die größte Fläche':'die größte Bevölkerung')+'?';
   const formatted=type==='area'?Math.round(c.area).toLocaleString('de-DE')+' km²':Math.round(c.population).toLocaleString('de-DE')+' Einwohner';
   explain=name(c)+' liegt in den verwendeten Daten vorn ('+formatted+').';id=type+':'+chosen.map(x=>x.cca3).sort().join('-');
  }else return null;
  if(type!=='landlocked'){const shuffled=opts.map((v,i)=>({v,correct:i===answer})).sort(()=>Math.random()-.5);opts=shuffled.map(x=>x.v);answer=shuffled.findIndex(x=>x.correct)}
  return {id,question:stem,options:opts,correct:answer,feedback:explain};
 }
 async function makeDeck(){
  const out=[],used=new Set(),types=levelInfo[level].types;
  for(let tries=0;out.length<10&&tries<3500;tries++){
   const q=question(pick(types));
   if(!q||used.has(q.id))continue;
   used.add(q.id);
   if(await wasSeen(q.id))continue;
   await markSeen(q.id);
   out.push(q);
  }
  return out;
 }
 function showStart(){
  panel.innerHTML='<div class="quiz-start"><div class="quiz-start-kicker">WÄHLE DEINE HERAUSFORDERUNG</div><h3>Wie schwierig darf es sein?</h3><p>Jede Runde enthält zehn Fragen. Nach einem Neuladen kannst du wieder von vorne spielen.</p><div class="quiz-levels">'+
   Object.keys(levelInfo).map((key,i)=>'<button class="quiz-level '+(level===key?'selected':'')+'" data-level="'+key+'"><span class="quiz-level-number">0'+(i+1)+'</span><strong>'+levelInfo[key].label+'</strong><small>'+levelInfo[key].desc+'</small></button>').join('')+
   '</div><button class="button button-primary quiz-start-button" id="quizStart">Quiz starten →</button><div class="quiz-history-note">♻️ Zufällige Fragen aus der Länderdatenbank · Wiederholungen nach Neuladen möglich</div></div>';
  panel.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{level=b.dataset.level;showStart()}));
  $('quizStart').addEventListener('click',start);
 }
 function render(){
  locked=false;const q=deck[index];
  panel.innerHTML='<div class="quiz-topline"><span id="quizCounter">FRAGE '+(index+1)+' / '+deck.length+' · '+levelInfo[level].label.toUpperCase()+'</span><span id="quizScore">'+score+' PUNKTE</span></div><div class="quiz-progress"><span id="quizProgress" style="width:'+(index/deck.length*100)+'%"></span></div><div class="quiz-question" id="quizQuestion"></div><div class="quiz-options" id="quizOptions">'+q.options.map((v,i)=>'<button class="quiz-option" data-answer="'+i+'"><span>'+'ABCD'[i]+'</span>'+v+'</button>').join('')+'</div><div class="quiz-bottom"><span id="quizFeedback">Wähle eine Antwort aus.</span><button class="button button-primary" id="quizNext" disabled>' +(index===deck.length-1?'Ergebnis →':'Weiter →')+'</button></div>';
  $('quizQuestion').textContent=q.question;
  $('quizOptions').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(b)answer(Number(b.dataset.answer))});
  $('quizNext').addEventListener('click',()=>{if(!locked)return;if(index<deck.length-1){index++;render()}else result()});
 }
 function answer(n){
  if(locked)return;locked=true;const q=deck[index],correct=n===q.correct;if(correct)score++;
  panel.querySelectorAll('.quiz-option').forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add('correct');else if(i===n)b.classList.add('wrong')});
  $('quizFeedback').textContent=(correct?'Richtig! ':'Nicht ganz. ')+q.feedback;
  $('quizScore').textContent=score+' PUNKTE';$('quizNext').disabled=false;
  $('quizProgress').style.width=((index+1)/deck.length*100)+'%';
 }
 function result(){
  const pct=score/deck.length,title=pct>=.8?'Hervorragendes Ergebnis!':pct>=.5?'Gut gemacht!':'Zeit, weiter zu entdecken!';
  panel.innerHTML='<div class="quiz-result"><div class="quiz-trophy">'+(pct>=.8?'🏆':pct>=.5?'🌍':'🧭')+'</div><div class="kicker">DEIN ERGEBNIS · '+levelInfo[level].label.toUpperCase()+'</div><h3>'+title+'</h3><div class="quiz-final-score">'+score+'<small> / '+deck.length+'</small></div><p>'+ (pct>=.8?'Du hast diese Schwierigkeitsstufe stark gemeistert.':pct>=.5?'Eine gute Runde. Mit jeder Frage wächst dein Weltwissen.':'Jede Runde bringt dich weiter. Versuche es noch einmal!')+'</p><button class="button button-primary" id="quizAgain">↻ Neue Fragen spielen</button><button class="button button-glass quiz-change-level" id="quizChange">Schwierigkeitsgrad ändern</button></div>';
  $('quizAgain').addEventListener('click',start);$('quizChange').addEventListener('click',showStart);
 }
 async function start(){
  const btn=$('quizStart');if(btn){btn.disabled=true;btn.textContent='Fragen werden vorbereitet …'}
  deck=await makeDeck();index=0;score=0;
  if(deck.length<10){
   sessionSeen.clear();
   deck=await makeDeck();
  }
  if(!deck.length){
   panel.innerHTML='<div class="quiz-result"><div class="quiz-trophy">🌍</div><h3>Quiz konnte nicht geladen werden</h3><p>Bitte lade die Seite neu und versuche es erneut.</p><button class="button button-primary" id="quizChange">Zurück</button></div>';
   $('quizChange').addEventListener('click',showStart);return;
  }
  render();
 }
 showStart();
})();
