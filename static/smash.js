var p=void 0,v=!0,w=null,y=!1,z,C=this;
function E(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function aa(a){var b=E(a);return"array"==b||"object"==b&&"number"==typeof a.length}function F(a){return"string"==typeof a}function ba(a){var b=typeof a;return"object"==b&&a!=w||"function"==b}function G(a){return a[ca]||(a[ca]=++da)}var ca="closure_uid_"+Math.floor(2147483648*Math.random()).toString(36),da=0;
function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=Array.prototype.slice.call(arguments);b.unshift.apply(b,c);return a.apply(this,b)}}var fa=Date.now||function(){return+new Date};function H(a,b){function c(){}c.prototype=b.prototype;a.g=b.prototype;a.prototype=new c};function ga(a){if(!ha.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(ia,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(ja,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(ka,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(la,"&quot;"));return a}var ia=/&/g,ja=/</g,ka=/>/g,la=/\"/g,ha=/[&<>\"]/;var ma=Array.prototype,qa=ma.indexOf?function(a,b,c){return ma.indexOf.call(a,b,c)}:function(a,b,c){c=c==w?0:0>c?Math.max(0,a.length+c):c;if(F(a))return!F(b)||1!=b.length?-1:a.indexOf(b,c);for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},ra=ma.forEach?function(a,b,c){ma.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,f=F(a)?a.split(""):a,e=0;e<d;e++)e in f&&b.call(c,f[e],e,a)};function sa(a,b){var c=qa(a,b);0<=c&&ma.splice.call(a,c,1)}
function ta(a,b,c){return 2>=arguments.length?ma.slice.call(a,b):ma.slice.call(a,b,c)};var ua,va,wa,xa,ya;function za(){return C.navigator?C.navigator.userAgent:w}function Aa(){return C.navigator}xa=wa=va=ua=y;var Ba;if(Ba=za()){var Ca=Aa();ua=0==Ba.indexOf("Opera");va=!ua&&-1!=Ba.indexOf("MSIE");wa=!ua&&-1!=Ba.indexOf("WebKit");xa=!ua&&!wa&&"Gecko"==Ca.product}var Da=ua,I=va,Ea=xa,Fa=wa,Ga=Aa();ya=-1!=(Ga&&Ga.platform||"").indexOf("Mac");var Ha=!!Aa()&&-1!=(Aa().appVersion||"").indexOf("X11"),Ia;
a:{var Ja="",Ka;if(Da&&C.opera)var La=C.opera.version,Ja="function"==typeof La?La():La;else if(Ea?Ka=/rv\:([^\);]+)(\)|;)/:I?Ka=/MSIE\s+([^\);]+)(\)|;)/:Fa&&(Ka=/WebKit\/(\S+)/),Ka)var Ma=Ka.exec(za()),Ja=Ma?Ma[1]:"";if(I){var Na,Oa=C.document;Na=Oa?Oa.documentMode:p;if(Na>parseFloat(Ja)){Ia=String(Na);break a}}Ia=Ja}var Pa={};
function J(a){var b;if(!(b=Pa[a])){b=0;for(var c=String(Ia).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),d=String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),f=Math.max(c.length,d.length),e=0;0==b&&e<f;e++){var g=c[e]||"",i=d[e]||"",j=RegExp("(\\d*)(\\D*)","g"),h=RegExp("(\\d*)(\\D*)","g");do{var k=j.exec(g)||["","",""],l=h.exec(i)||["","",""];if(0==k[0].length&&0==l[0].length)break;b=((0==k[1].length?0:parseInt(k[1],10))<(0==l[1].length?0:parseInt(l[1],10))?-1:(0==k[1].length?0:parseInt(k[1],
10))>(0==l[1].length?0:parseInt(l[1],10))?1:0)||((0==k[2].length)<(0==l[2].length)?-1:(0==k[2].length)>(0==l[2].length)?1:0)||(k[2]<l[2]?-1:k[2]>l[2]?1:0)}while(0==b)}b=Pa[a]=0<=b}return b}var Qa={};function Ra(){return Qa[9]||(Qa[9]=I&&!!document.documentMode&&9<=document.documentMode)};var Sa,Ta=!I||Ra();!Ea&&!I||I&&Ra()||Ea&&J("1.9.1");I&&J("9");function Ua(a,b){var c;c=a.className;c=F(c)&&c.match(/\S+/g)||[];for(var d=ta(arguments,1),f=c.length+d.length,e=c,g=0;g<d.length;g++)0<=qa(e,d[g])||e.push(d[g]);a.className=c.join(" ");return c.length==f};function Va(a,b){for(var c in a)b.call(p,a[c],c,a)}var Wa="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Xa(a,b){for(var c,d,f=1;f<arguments.length;f++){d=arguments[f];for(c in d)a[c]=d[c];for(var e=0;e<Wa.length;e++)c=Wa[e],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};var Ya={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};function K(a,b,c){return Za(document,arguments)}
function Za(a,b){var c=b[0],d=b[1];if(!Ta&&d&&(d.name||d.type)){c=["<",c];d.name&&c.push(' name="',ga(d.name),'"');if(d.type){c.push(' type="',ga(d.type),'"');var f={};Xa(f,d);delete f.type;d=f}c.push(">");c=c.join("")}var e=a.createElement(c);d&&(F(d)?e.className=d:"array"==E(d)?Ua.apply(w,[e].concat(d)):Va(d,function(a,b){"style"==b?e.style.cssText=a:"class"==b?e.className=a:"for"==b?e.htmlFor=a:b in Ya?e.setAttribute(Ya[b],a):0==b.lastIndexOf("aria-",0)||0==b.lastIndexOf("data-",0)?e.setAttribute(b,
a):e[b]=a}));if(2<b.length){d=function(b){b&&e.appendChild(F(b)?a.createTextNode(b):b)};for(c=2;c<b.length;c++){var g=b[c];if(aa(g)&&!(ba(g)&&0<g.nodeType)){var i;a:{if(g&&"number"==typeof g.length){if(ba(g)){i="function"==typeof g.item||"string"==typeof g.item;break a}if("function"==E(g)){i="function"==typeof g.item;break a}}i=y}f=ra;if(i)if(i=g.length,0<i){for(var j=Array(i),h=0;h<i;h++)j[h]=g[h];g=j}else g=[];f(g,d)}else d(g)}}return e}
function $a(a){a&&a.parentNode&&a.parentNode.removeChild(a)}function ab(a){this.H=a||C.document||document}z=ab.prototype;z.R=function(a){return F(a)?this.H.getElementById(a):a};z.O=function(a,b,c){return Za(this.H,arguments)};z.createElement=function(a){return this.H.createElement(a)};z.createTextNode=function(a){return this.H.createTextNode(a)};z.appendChild=function(a,b){a.appendChild(b)};function Q(){0!=bb&&(this.fb=Error().stack,cb[G(this)]=this)}var bb=0,cb={};Q.prototype.ia=y;Q.prototype.q=function(){if(!this.ia&&(this.ia=v,this.f(),0!=bb)){var a=G(this);delete cb[a]}};Q.prototype.f=function(){this.P&&db.apply(w,this.P);if(this.ta)for(;this.ta.length;)this.ta.shift()()};function db(a){for(var b=0,c=arguments.length;b<c;++b){var d=arguments[b];aa(d)?db.apply(w,d):d&&"function"==typeof d.q&&d.q()}};function eb(a,b,c){a.style[String(c).replace(/\-([a-z])/g,function(a,b){return b.toUpperCase()})]=b}function fb(a){var b=10;"number"==typeof b&&(b=(a?Math.round(b):b)+"px");return b};!I||Ra();var gb=!I||Ra(),hb=I&&!J("9");!Fa||J("528");Ea&&J("1.9b")||I&&J("8")||Da&&J("9.5")||Fa&&J("528");Ea&&!J("8")||I&&J("9");function ib(a,b){this.type=a;this.currentTarget=this.target=b}z=ib.prototype;z.f=function(){};z.q=function(){};z.ba=y;z.defaultPrevented=y;z.Ra=v;z.preventDefault=function(){this.defaultPrevented=v;this.Ra=y};function jb(a){jb[" "](a);return a}jb[" "]=function(){};function kb(a,b){a&&this.U(a,b)}H(kb,ib);z=kb.prototype;z.target=w;z.relatedTarget=w;z.offsetX=0;z.offsetY=0;z.clientX=0;z.clientY=0;z.screenX=0;z.screenY=0;z.button=0;z.keyCode=0;z.charCode=0;z.ctrlKey=y;z.altKey=y;z.shiftKey=y;z.metaKey=y;z.Pa=y;z.ka=w;
z.U=function(a,b){var c=this.type=a.type;ib.call(this,c);this.target=a.target||a.srcElement;this.currentTarget=b;var d=a.relatedTarget;if(d){if(Ea){var f;a:{try{jb(d.nodeName);f=v;break a}catch(e){}f=y}f||(d=w)}}else"mouseover"==c?d=a.fromElement:"mouseout"==c&&(d=a.toElement);this.relatedTarget=d;this.offsetX=Fa||a.offsetX!==p?a.offsetX:a.layerX;this.offsetY=Fa||a.offsetY!==p?a.offsetY:a.layerY;this.clientX=a.clientX!==p?a.clientX:a.pageX;this.clientY=a.clientY!==p?a.clientY:a.pageY;this.screenX=
a.screenX||0;this.screenY=a.screenY||0;this.button=a.button;this.keyCode=a.keyCode||0;this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.Pa=ya?a.metaKey:a.ctrlKey;this.state=a.state;this.ka=a;a.defaultPrevented&&this.preventDefault();delete this.ba};
z.preventDefault=function(){kb.g.preventDefault.call(this);var a=this.ka;if(a.preventDefault)a.preventDefault();else if(a.returnValue=y,hb)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1}catch(b){}};z.f=function(){};function lb(){}var mb=0;z=lb.prototype;z.key=0;z.D=y;z.da=y;z.U=function(a,b,c,d,f,e){if("function"==E(a))this.pa=v;else if(a&&a.handleEvent&&"function"==E(a.handleEvent))this.pa=y;else throw Error("Invalid listener argument");this.J=a;this.va=b;this.src=c;this.type=d;this.capture=!!f;this.$=e;this.da=y;this.key=++mb;this.D=y};z.handleEvent=function(a){return this.pa?this.J.call(this.$||this.src,a):this.J.handleEvent.call(this.J,a)};var nb={},R={},S={},ob={};
function pb(a,b,c,d,f){if(b)if("array"==E(b))for(var e=0;e<b.length;e++)pb(a,b[e],c,d,f);else{var d=!!d,g=R;b in g||(g[b]={n:0,t:0});g=g[b];d in g||(g[d]={n:0,t:0},g.n++);var g=g[d],i=G(a),j;g.t++;if(g[i]){j=g[i];for(e=0;e<j.length;e++)if(g=j[e],g.J==c&&g.$==f){if(g.D)break;return}}else j=g[i]=[],g.n++;var h=qb,k=gb?function(a){return h.call(k.src,k.key,a)}:function(a){a=h.call(k.src,k.key,a);if(!a)return a},e=k;e.src=a;g=new lb;g.U(c,e,a,b,d,f);c=g.key;e.key=c;j.push(g);nb[c]=g;S[i]||(S[i]=[]);S[i].push(g);
a.addEventListener?(a==C||!a.ga)&&a.addEventListener(b,e,d):a.attachEvent(b in ob?ob[b]:ob[b]="on"+b,e)}else throw Error("Invalid event type");}function rb(a,b,c,d,f){if("array"==E(b))for(var e=0;e<b.length;e++)rb(a,b[e],c,d,f);else{d=!!d;a:{e=R;if(b in e&&(e=e[b],d in e&&(e=e[d],a=G(a),e[a]))){a=e[a];break a}a=w}if(a)for(e=0;e<a.length;e++)if(a[e].J==c&&a[e].capture==d&&a[e].$==f){sb(a[e].key);break}}}
function sb(a){if(nb[a]){var b=nb[a];if(!b.D){var c=b.src,d=b.type,f=b.va,e=b.capture;c.removeEventListener?(c==C||!c.ga)&&c.removeEventListener(d,f,e):c.detachEvent&&c.detachEvent(d in ob?ob[d]:ob[d]="on"+d,f);c=G(c);S[c]&&(f=S[c],sa(f,b),0==f.length&&delete S[c]);b.D=v;if(b=R[d][e][c])b.ra=v,tb(d,e,c,b);delete nb[a]}}}
function tb(a,b,c,d){if(!d.V&&d.ra){for(var f=0,e=0;f<d.length;f++)d[f].D?d[f].va.src=w:(f!=e&&(d[e]=d[f]),e++);d.length=e;d.ra=y;0==e&&(delete R[a][b][c],R[a][b].n--,0==R[a][b].n&&(delete R[a][b],R[a].n--),0==R[a].n&&delete R[a])}}function ub(a,b,c,d,f){var e=1,b=G(b);if(a[b]){a.t--;a=a[b];a.V?a.V++:a.V=1;try{for(var g=a.length,i=0;i<g;i++){var j=a[i];j&&!j.D&&(e&=vb(j,f)!==y)}}finally{a.V--,tb(c,d,b,a)}}return Boolean(e)}function vb(a,b){a.da&&sb(a.key);return a.handleEvent(b)}
function qb(a,b){if(!nb[a])return v;var c=nb[a],d=c.type,f=R;if(!(d in f))return v;var f=f[d],e,g;if(!gb){var i;if(!(i=b))a:{i=["window","event"];for(var j=C;e=i.shift();)if(j[e]!=w)j=j[e];else{i=w;break a}i=j}e=i;i=v in f;j=y in f;if(i){if(0>e.keyCode||e.returnValue!=p)return v;a:{var h=y;if(0==e.keyCode)try{e.keyCode=-1;break a}catch(k){h=v}if(h||e.returnValue==p)e.returnValue=v}}h=new kb;h.U(e,this);e=v;try{if(i){for(var l=[],n=h.currentTarget;n;n=n.parentNode)l.push(n);g=f[v];g.t=g.n;for(var m=
l.length-1;!h.ba&&0<=m&&g.t;m--)h.currentTarget=l[m],e&=ub(g,l[m],d,v,h);if(j){g=f[y];g.t=g.n;for(m=0;!h.ba&&m<l.length&&g.t;m++)h.currentTarget=l[m],e&=ub(g,l[m],d,y,h)}}else e=vb(c,h)}finally{l&&(l.length=0)}return e}d=new kb(b,this);return e=vb(c,d)};function wb(){Q.call(this)}H(wb,Q);z=wb.prototype;z.ga=v;z.ua=w;z.ca=function(a){this.ua=a};z.addEventListener=function(a,b,c,d){pb(this,a,b,c,d)};z.removeEventListener=function(a,b,c,d){rb(this,a,b,c,d)};z.f=function(){wb.g.f.call(this);var a,b=0,c=a==w;a=!!a;if(this==w)Va(S,function(d){for(var e=d.length-1;0<=e;e--){var f=d[e];if(c||a==f.capture)sb(f.key),b++}});else{var d=G(this);if(S[d])for(var d=S[d],f=d.length-1;0<=f;f--){var e=d[f];if(c||a==e.capture)sb(e.key),b++}}this.ua=w};function T(){}T.ma=function(){return T.oa?T.oa:T.oa=new T};T.prototype.Na=0;T.ma();function U(a){Q.call(this);a||(a=Sa||(Sa=new ab));this.ja=a;this.Sa=xb}H(U,wb);U.prototype.Ja=T.ma();var xb=w;z=U.prototype;z.na=w;z.r=y;z.l=w;z.Sa=w;z.Ma=w;z.C=w;z.N=w;z.M=w;z.ab=y;z.R=function(){return this.l};z.ca=function(a){if(this.C&&this.C!=a)throw Error("Method not supported");U.g.ca.call(this,a)};z.O=function(){this.l=this.ja.createElement("div")};function yb(a){if(a.r)throw Error("Component already rendered");a.l||a.O();a.ja.H.body.appendChild(a.l);(!a.C||a.C.r)&&a.j()}
z.j=function(){this.r=v;zb(this,function(a){!a.r&&a.R()&&a.j()})};function Ab(a){zb(a,function(a){a.r&&Ab(a)});a.S&&a.S.wb();a.r=y}z.f=function(){U.g.f.call(this);this.r&&Ab(this);this.S&&(this.S.q(),delete this.S);zb(this,function(a){a.q()});!this.ab&&this.l&&$a(this.l);this.C=this.Ma=this.l=this.M=this.N=w};function zb(a,b){a.N&&ra(a.N,b,p)}
z.removeChild=function(a,b){if(a){var c=F(a)?a:a.na||(a.na=":"+(a.Ja.Na++).toString(36)),d;this.M&&c?(d=this.M,d=(c in d?d[c]:p)||w):d=w;a=d;if(c&&a){d=this.M;c in d&&delete d[c];sa(this.N,a);b&&(Ab(a),a.l&&$a(a.l));c=a;if(c==w)throw Error("Unable to set parent component");c.C=w;U.g.ca.call(c,w)}}if(!a)throw Error("Child is not in parent component");return a};function Bb(a,b){U.call(this);this.bb=a;this.Ia=b;this.W=[]}H(Bb,U);Bb.prototype.O=function(){var a=K("canvas");a.width=this.bb;a.height=this.Ia;this.l=a};Bb.prototype.j=function(){Bb.g.j.call(this);try{this.a=this.R().getContext("experimental-webgl")}catch(a){alert("Exception catched in getContext: "+a.toString());return}this.a?(this.a.clearColor(0,0,0,1),this.a.clear(16384),this.a.enable(2929)):alert("Unable to create Web GL context")};
function Cb(a,b){b.a=a.a;b.Z=b.a.createBuffer();b.$a=b.c.length/3;b.a.bindBuffer(34962,b.Z);b.a.bufferData(34962,b.c,35044);b.X=b.a.createBuffer();b.tb=b.b.length/3;b.a.bindBuffer(34962,b.X);b.a.bufferData(34962,b.b,35044);34963==b.G&&(b.aa=b.a.createBuffer(),b.Ka=b.k.length,b.a.bindBuffer(34963,b.aa),b.a.bufferData(34963,b.k,35044));a.W.push(b)}Bb.prototype.f=function(){window.console.log("dispose canvas");this.a.finish();$a(this.R());Bb.g.f.call(this)};function V(){function a(a){k=a;switch(k){case 0:n.style.display="block";r.style.display="none";break;case 1:n.style.display="none",r.style.display="block"}}U.call(this);this.F="";var b=Date.now(),c=b,d=0,f=Infinity,e=0,g=0,i=Infinity,j=0,h=0,k=0,l=document.createElement("div");l.id="stats";l.addEventListener("mousedown",function(b){b.preventDefault();a(++k%2)},y);l.style.cssText="width:80px;opacity:0.9;cursor:pointer";var n=document.createElement("div");n.id="fps";n.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";
l.appendChild(n);var m=document.createElement("div");m.id="fpsText";m.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";m.innerHTML="FPS";n.appendChild(m);var q=document.createElement("div");q.id="fpsGraph";q.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(n.appendChild(q);74>q.children.length;){var s=document.createElement("span");s.style.cssText="width:1px;height:30px;float:left;background-color:#113";
q.appendChild(s)}var r=document.createElement("div");r.id="ms";r.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";l.appendChild(r);var t=document.createElement("div");t.id="msText";t.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";t.innerHTML="MS";r.appendChild(t);var u=document.createElement("div");u.id="msGraph";u.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";
for(r.appendChild(u);74>u.children.length;)s=document.createElement("span"),s.style.cssText="width:1px;height:30px;float:left;background-color:#131",u.appendChild(s);var x={cb:11,Q:l,xb:a,eb:function(){b=Date.now()},end:function(){var a=Date.now();d=a-b;f=Math.min(f,d);e=Math.max(e,d);t.textContent=d+" MS ("+f+"-"+e+")";var k=Math.min(30,30-30*(d/200));u.appendChild(u.firstChild).style.height=k+"px";h++;a>c+1E3&&(g=Math.round(1E3*h/(a-c)),i=Math.min(i,g),j=Math.max(j,g),m.textContent=g+" FPS ("+i+
"-"+j+")",k=Math.min(30,30-30*(g/100)),q.appendChild(q.firstChild).style.height=k+"px",c=a,h=0);return a},update:function(){b=x.end()}};this.K=x;l=this.canvas=new Bb(640,480);this.P||(this.P=[]);this.P.push(l);this.o=this.v=0}H(V,U);function Db(a){return 1E6>a.v?(a.v/1E3).toFixed(1)+"K":(a.v/1E6).toFixed(1)+"M"}function Eb(a){return 1E6>a.o?(a.o/1E3).toFixed(1)+"K":(a.o/1E6).toFixed(1)+"M"}
V.prototype.O=function(){var a=K("div"),b=this.K.Q,c=Ea&&(ya||Ha)&&J("1.9");b.style.left=fb(c);b.style.top=fb(c);b=this.K.Q;F("position")?eb(b,"absolute","position"):Va("position",ea(eb,b));a.appendChild(this.K.Q);this.l=a};V.prototype.j=function(){V.g.j.call(this);yb(this.canvas)};V.prototype.f=function(){$a(this.K.Q);V.g.f.call(this)};
V.prototype.frame=function(){this.K.update();var a=this.canvas;a.a.clear(a.a.COLOR_BUFFER_BIT);for(var b=0;b<a.W.length;b++){var c=a.W[b];W.Ta(c.m,c.m);W.Ua(c.m,c.m);W.Va(c.m,c.m);a.W[b].I()}a.a.flush()};var X={},Fb=new Float32Array([1,0,0,0,1,0,0,0,1]);if(!Y)var Y=1E-6;X.create=function(){return new Float32Array(Fb)};X.ea=function(a){var b=new Float32Array(9);b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};X.copy=function(a,b){a[0]=b[0];a[1]=b[1];a[2]=b[2];a[3]=b[3];a[4]=b[4];a[5]=b[5];a[6]=b[6];a[7]=b[7];a[8]=b[8];return a};X.T=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
X.Za=function(a,b){if(a===b){var c=b[1],d=b[2],f=b[5];a[1]=b[3];a[2]=b[6];a[3]=c;a[5]=b[7];a[6]=d;a[7]=f}else a[0]=b[0],a[1]=b[3],a[2]=b[6],a[3]=b[1],a[4]=b[4],a[5]=b[7],a[6]=b[2],a[7]=b[5],a[8]=b[8];return a};X.La=function(a,b){var c=b[0],d=b[1],f=b[2],e=b[3],g=b[4],i=b[5],j=b[6],h=b[7],k=b[8],l=k*g-i*h,n=-k*e+i*j,m=h*e-g*j,q=c*l+d*n+f*m;if(!q)return w;q=1/q;a[0]=l*q;a[1]=(-k*d+f*h)*q;a[2]=(i*d-f*g)*q;a[3]=n*q;a[4]=(k*c-f*j)*q;a[5]=(-i*c+f*e)*q;a[6]=m*q;a[7]=(-h*c+d*j)*q;a[8]=(g*c-d*e)*q;return a};
X.Ea=function(a,b){var c=b[0],d=b[1],f=b[2],e=b[3],g=b[4],i=b[5],j=b[6],h=b[7],k=b[8];a[0]=g*k-i*h;a[1]=f*h-d*k;a[2]=d*i-f*g;a[3]=i*j-e*k;a[4]=c*k-f*j;a[5]=f*e-c*i;a[6]=e*h-g*j;a[7]=d*j-c*h;a[8]=c*g-d*e;return a};X.Fa=function(a){var b=a[3],c=a[4],d=a[5],f=a[6],e=a[7],g=a[8];return a[0]*(g*c-d*e)+a[1]*(-g*b+d*f)+a[2]*(e*b-c*f)};
X.multiply=function(a,b,c){var d=b[0],f=b[1],e=b[2],g=b[3],i=b[4],j=b[5],h=b[6],k=b[7],b=b[8],l=c[0],n=c[1],m=c[2],q=c[3],s=c[4],r=c[5],t=c[6],u=c[7],c=c[8];a[0]=l*d+n*g+m*h;a[1]=l*f+n*i+m*k;a[2]=l*e+n*j+m*b;a[3]=q*d+s*g+r*h;a[4]=q*f+s*i+r*k;a[5]=q*e+s*j+r*b;a[6]=t*d+u*g+c*h;a[7]=t*f+u*i+c*k;a[8]=t*e+u*j+c*b;return a};X.qa=X.multiply;X.xa=function(a){return"mat3("+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+")"};"undefined"!==typeof exports&&(exports.qb=X);var W={},Gb=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);Y||(Y=1E-6);W.create=function(){return new Float32Array(Gb)};W.ea=function(a){var b=new Float32Array(16);b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};
W.copy=function(a,b){a[0]=b[0];a[1]=b[1];a[2]=b[2];a[3]=b[3];a[4]=b[4];a[5]=b[5];a[6]=b[6];a[7]=b[7];a[8]=b[8];a[9]=b[9];a[10]=b[10];a[11]=b[11];a[12]=b[12];a[13]=b[13];a[14]=b[14];a[15]=b[15];return a};W.T=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
W.Za=function(a,b){if(a===b){var c=b[1],d=b[2],f=b[3],e=b[6],g=b[7],i=b[11];a[1]=b[4];a[2]=b[8];a[3]=b[12];a[4]=c;a[6]=b[9];a[7]=b[13];a[8]=d;a[9]=e;a[11]=b[14];a[12]=f;a[13]=g;a[14]=i}else a[0]=b[0],a[1]=b[4],a[2]=b[8],a[3]=b[12],a[4]=b[1],a[5]=b[5],a[6]=b[9],a[7]=b[13],a[8]=b[2],a[9]=b[6],a[10]=b[10],a[11]=b[14],a[12]=b[3],a[13]=b[7],a[14]=b[11],a[15]=b[15];return a};
W.La=function(a,b){var c=b[0],d=b[1],f=b[2],e=b[3],g=b[4],i=b[5],j=b[6],h=b[7],k=b[8],l=b[9],n=b[10],m=b[11],q=b[12],s=b[13],r=b[14],t=b[15],u=c*i-d*g,x=c*j-f*g,A=c*h-e*g,B=d*j-f*i,L=d*h-e*i,M=f*h-e*j,N=k*s-l*q,O=k*r-n*q,P=k*t-m*q,na=l*r-n*s,oa=l*t-m*s,pa=n*t-m*r,D=u*pa-x*oa+A*na+B*P-L*O+M*N;if(!D)return w;D=1/D;a[0]=(i*pa-j*oa+h*na)*D;a[1]=(f*oa-d*pa-e*na)*D;a[2]=(s*M-r*L+t*B)*D;a[3]=(n*L-l*M-m*B)*D;a[4]=(j*P-g*pa-h*O)*D;a[5]=(c*pa-f*P+e*O)*D;a[6]=(r*A-q*M-t*x)*D;a[7]=(k*M-n*A+m*x)*D;a[8]=(g*oa-
i*P+h*N)*D;a[9]=(d*P-c*oa-e*N)*D;a[10]=(q*L-s*A+t*u)*D;a[11]=(l*A-k*L-m*u)*D;a[12]=(i*O-g*na-j*N)*D;a[13]=(c*na-d*O+f*N)*D;a[14]=(s*x-q*B-r*u)*D;a[15]=(k*B-l*x+n*u)*D;return a};
W.Ea=function(a,b){var c=b[0],d=b[1],f=b[2],e=b[3],g=b[4],i=b[5],j=b[6],h=b[7],k=b[8],l=b[9],n=b[10],m=b[11],q=b[12],s=b[13],r=b[14],t=b[15];a[0]=i*(n*t-m*r)-l*(j*t-h*r)+s*(j*m-h*n);a[1]=-(d*(n*t-m*r)-l*(f*t-e*r)+s*(f*m-e*n));a[2]=d*(j*t-h*r)-i*(f*t-e*r)+s*(f*h-e*j);a[3]=-(d*(j*m-h*n)-i*(f*m-e*n)+l*(f*h-e*j));a[4]=-(g*(n*t-m*r)-k*(j*t-h*r)+q*(j*m-h*n));a[5]=c*(n*t-m*r)-k*(f*t-e*r)+q*(f*m-e*n);a[6]=-(c*(j*t-h*r)-g*(f*t-e*r)+q*(f*h-e*j));a[7]=c*(j*m-h*n)-g*(f*m-e*n)+k*(f*h-e*j);a[8]=g*(l*t-m*s)-k*(i*
t-h*s)+q*(i*m-h*l);a[9]=-(c*(l*t-m*s)-k*(d*t-e*s)+q*(d*m-e*l));a[10]=c*(i*t-h*s)-g*(d*t-e*s)+q*(d*h-e*i);a[11]=-(c*(i*m-h*l)-g*(d*m-e*l)+k*(d*h-e*i));a[12]=-(g*(l*r-n*s)-k*(i*r-j*s)+q*(i*n-j*l));a[13]=c*(l*r-n*s)-k*(d*r-f*s)+q*(d*n-f*l);a[14]=-(c*(i*r-j*s)-g*(d*r-f*s)+q*(d*j-f*i));a[15]=c*(i*n-j*l)-g*(d*n-f*l)+k*(d*j-f*i);return a};
W.Fa=function(a){var b=a[0],c=a[1],d=a[2],f=a[3],e=a[4],g=a[5],i=a[6],j=a[7],h=a[8],k=a[9],l=a[10],n=a[11],m=a[12],q=a[13],s=a[14],a=a[15];return(b*g-c*e)*(l*a-n*s)-(b*i-d*e)*(k*a-n*q)+(b*j-f*e)*(k*s-l*q)+(c*i-d*g)*(h*a-n*m)-(c*j-f*g)*(h*s-l*m)+(d*j-f*i)*(h*q-k*m)};
W.multiply=function(a,b,c){var d=b[0],f=b[1],e=b[2],g=b[3],i=b[4],j=b[5],h=b[6],k=b[7],l=b[8],n=b[9],m=b[10],q=b[11],s=b[12],r=b[13],t=b[14],b=b[15],u=c[0],x=c[1],A=c[2],B=c[3];a[0]=u*d+x*i+A*l+B*s;a[1]=u*f+x*j+A*n+B*r;a[2]=u*e+x*h+A*m+B*t;a[3]=u*g+x*k+A*q+B*b;u=c[4];x=c[5];A=c[6];B=c[7];a[4]=u*d+x*i+A*l+B*s;a[5]=u*f+x*j+A*n+B*r;a[6]=u*e+x*h+A*m+B*t;a[7]=u*g+x*k+A*q+B*b;u=c[8];x=c[9];A=c[10];B=c[11];a[8]=u*d+x*i+A*l+B*s;a[9]=u*f+x*j+A*n+B*r;a[10]=u*e+x*h+A*m+B*t;a[11]=u*g+x*k+A*q+B*b;u=c[12];x=c[13];
A=c[14];B=c[15];a[12]=u*d+x*i+A*l+B*s;a[13]=u*f+x*j+A*n+B*r;a[14]=u*e+x*h+A*m+B*t;a[15]=u*g+x*k+A*q+B*b;return a};W.qa=W.multiply;
W.translate=function(a,b,c){var d=c[0],f=c[1],c=c[2],e,g,i,j,h,k,l,n,m,q,s,r;b===a?(a[12]=b[0]*d+b[4]*f+b[8]*c+b[12],a[13]=b[1]*d+b[5]*f+b[9]*c+b[13],a[14]=b[2]*d+b[6]*f+b[10]*c+b[14],a[15]=b[3]*d+b[7]*f+b[11]*c+b[15]):(e=b[0],g=b[1],i=b[2],j=b[3],h=b[4],k=b[5],l=b[6],n=b[7],m=b[8],q=b[9],s=b[10],r=b[11],a[0]=e,a[1]=g,a[2]=i,a[3]=j,a[4]=h,a[5]=k,a[6]=l,a[7]=n,a[8]=m,a[9]=q,a[10]=s,a[11]=r,a[12]=e*d+h*f+m*c+b[12],a[13]=g*d+k*f+q*c+b[13],a[14]=i*d+l*f+s*c+b[14],a[15]=j*d+n*f+r*c+b[15]);return a};
W.scale=function(a,b,c){var d=c[0],f=c[1],c=c[2];a[0]=b[0]*d;a[1]=b[1]*d;a[2]=b[2]*d;a[3]=b[3]*d;a[4]=b[4]*f;a[5]=b[5]*f;a[6]=b[6]*f;a[7]=b[7]*f;a[8]=b[8]*c;a[9]=b[9]*c;a[10]=b[10]*c;a[11]=b[11]*c;a[12]=b[12];a[13]=b[13];a[14]=b[14];a[15]=b[15];return a};
W.rotate=function(a,b,c,d){var f=d[0],e=d[1],d=d[2],g=Math.sqrt(f*f+e*e+d*d),i,j,h,k,l,n,m,q,s,r,t,u,x,A,B,L,M,N,O,P;if(Math.abs(g)<Y)return w;g=1/g;f*=g;e*=g;d*=g;i=Math.sin(c);j=Math.cos(c);h=1-j;c=b[0];g=b[1];k=b[2];l=b[3];n=b[4];m=b[5];q=b[6];s=b[7];r=b[8];t=b[9];u=b[10];x=b[11];A=f*f*h+j;B=e*f*h+d*i;L=d*f*h-e*i;M=f*e*h-d*i;N=e*e*h+j;O=d*e*h+f*i;P=f*d*h+e*i;f=e*d*h-f*i;e=d*d*h+j;a[0]=c*A+n*B+r*L;a[1]=g*A+m*B+t*L;a[2]=k*A+q*B+u*L;a[3]=l*A+s*B+x*L;a[4]=c*M+n*N+r*O;a[5]=g*M+m*N+t*O;a[6]=k*M+q*N+
u*O;a[7]=l*M+s*N+x*O;a[8]=c*P+n*f+r*e;a[9]=g*P+m*f+t*e;a[10]=k*P+q*f+u*e;a[11]=l*P+s*f+x*e;b!==a&&(a[12]=b[12],a[13]=b[13],a[14]=b[14],a[15]=b[15]);return a};W.Ta=function(a,b){var c=1/180*Math.PI,d=Math.sin(c),c=Math.cos(c),f=b[4],e=b[5],g=b[6],i=b[7],j=b[8],h=b[9],k=b[10],l=b[11];b!==a&&(a[0]=b[0],a[1]=b[1],a[2]=b[2],a[3]=b[3],a[12]=b[12],a[13]=b[13],a[14]=b[14],a[15]=b[15]);a[4]=f*c+j*d;a[5]=e*c+h*d;a[6]=g*c+k*d;a[7]=i*c+l*d;a[8]=j*c-f*d;a[9]=h*c-e*d;a[10]=k*c-g*d;a[11]=l*c-i*d};
W.Ua=function(a,b){var c=0.5/180*Math.PI,d=Math.sin(c),c=Math.cos(c),f=b[0],e=b[1],g=b[2],i=b[3],j=b[8],h=b[9],k=b[10],l=b[11];b!==a&&(a[4]=b[4],a[5]=b[5],a[6]=b[6],a[7]=b[7],a[12]=b[12],a[13]=b[13],a[14]=b[14],a[15]=b[15]);a[0]=f*c-j*d;a[1]=e*c-h*d;a[2]=g*c-k*d;a[3]=i*c-l*d;a[8]=f*d+j*c;a[9]=e*d+h*c;a[10]=g*d+k*c;a[11]=i*d+l*c};
W.Va=function(a,b){var c=0.75/180*Math.PI,d=Math.sin(c),c=Math.cos(c),f=b[0],e=b[1],g=b[2],i=b[3],j=b[4],h=b[5],k=b[6],l=b[7];b!==a&&(a[8]=b[8],a[9]=b[9],a[10]=b[10],a[11]=b[11],a[12]=b[12],a[13]=b[13],a[14]=b[14],a[15]=b[15]);a[0]=f*c+j*d;a[1]=e*c+h*d;a[2]=g*c+k*d;a[3]=i*c+l*d;a[4]=j*c-f*d;a[5]=h*c-e*d;a[6]=k*c-g*d;a[7]=l*c-i*d};
W.kb=function(a,b,c){var d=b[0],f=b[1],e=b[2],g=b[3],i=d+d,j=f+f,h=e+e,b=d*i,k=d*j,d=d*h,l=f*j,f=f*h,e=e*h,i=g*i,j=g*j,g=g*h;a[0]=1-(l+e);a[1]=k+g;a[2]=d-j;a[3]=0;a[4]=k-g;a[5]=1-(b+e);a[6]=f+i;a[7]=0;a[8]=d+j;a[9]=f-i;a[10]=1-(b+l);a[11]=0;a[12]=c[0];a[13]=c[1];a[14]=c[2];a[15]=1;return a};
W.mb=function(a,b,c,d,f,e,g){var i=1/(c-b),j=1/(f-d),h=1/(e-g);a[0]=2*e*i;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=2*e*j;a[6]=0;a[7]=0;a[8]=(c+b)*i;a[9]=(f+d)*j;a[10]=(g+e)*h;a[11]=-1;a[12]=0;a[13]=0;a[14]=2*(g*e)*h;a[15]=0;return a};W.vb=function(a,b,c,d,f){var b=1/Math.tan(b/2),e=1/(d-f);a[0]=b/c;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=b;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=(f+d)*e;a[11]=-1;a[12]=0;a[13]=0;a[14]=2*f*d*e;a[15]=0;return a};
W.ub=function(a,b,c,d,f,e,g){var i=1/(b-c),j=1/(d-f),h=1/(e-g);a[0]=-2*i;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=-2*j;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=2*h;a[11]=0;a[12]=(b+c)*i;a[13]=(f+d)*j;a[14]=(g+e)*h;a[15]=1;return a};
W.pb=function(a,b,c,d){var f,e,g,i,j,h,k,l,n=b[0],m=b[1],b=b[2];g=d[0];i=d[1];e=d[2];k=c[0];d=c[1];f=c[2];if(Math.abs(n-k)<Y&&Math.abs(m-d)<Y&&Math.abs(b-f)<Y)return W.T(a);c=n-k;d=m-d;k=b-f;l=1/Math.sqrt(c*c+d*d+k*k);c*=l;d*=l;k*=l;f=i*k-e*d;e=e*c-g*k;g=g*d-i*c;(l=Math.sqrt(f*f+e*e+g*g))?(l=1/l,f*=l,e*=l,g*=l):g=e=f=0;i=d*g-k*e;j=k*f-c*g;h=c*e-d*f;(l=Math.sqrt(i*i+j*j+h*h))?(l=1/l,i*=l,j*=l,h*=l):h=j=i=0;a[0]=f;a[1]=i;a[2]=c;a[3]=0;a[4]=e;a[5]=j;a[6]=d;a[7]=0;a[8]=g;a[9]=h;a[10]=k;a[11]=0;a[12]=
-(f*n+e*m+g*b);a[13]=-(i*n+j*m+h*b);a[14]=-(c*n+d*m+k*b);a[15]=1;return a};W.xa=function(a){return"mat4("+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+")"};"undefined"!==typeof exports&&(exports.rb=W);var Z={};Y||(Y=1E-6);Z.create=function(){return new Float32Array(3)};Z.ea=function(a){var b=new Float32Array(3);b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};Z.lb=function(a,b,c){var d=new Float32Array(3);d[0]=a;d[1]=b;d[2]=c;return d};Z.copy=function(a,b){a[0]=b[0];a[1]=b[1];a[2]=b[2];return a};Z.set=function(a,b,c,d){a[0]=b;a[1]=c;a[2]=d;return a};Z.add=function(a,b,c){a[0]=b[0]+c[0];a[1]=b[1]+c[1];a[2]=b[2]+c[2];return a};Z.Ya=function(a,b,c){a[0]=b[0]-c[0];a[1]=b[1]-c[1];a[2]=b[2]-c[2];return a};
Z.sub=Z.Ya;Z.multiply=function(a,b,c){a[0]=b[0]*c[0];a[1]=b[1]*c[1];a[2]=b[2]*c[2];return a};Z.qa=Z.multiply;Z.Ha=function(a,b,c){a[0]=b[0]/c[0];a[1]=b[1]/c[1];a[2]=b[2]/c[2];return a};Z.ib=Z.Ha;Z.min=function(a,b,c){a[0]=Math.min(b[0],c[0]);a[1]=Math.min(b[1],c[1]);a[2]=Math.min(b[2],c[2]);return a};Z.max=function(a,b,c){a[0]=Math.max(b[0],c[0]);a[1]=Math.max(b[1],c[1]);a[2]=Math.max(b[2],c[2]);return a};Z.scale=function(a,b,c){a[0]=b[0]*c;a[1]=b[1]*c;a[2]=b[2]*c;return a};
Z.Ga=function(a,b){var c=b[0]-a[0],d=b[1]-a[1],f=b[2]-a[2];return Math.sqrt(c*c+d*d+f*f)};Z.hb=Z.Ga;Z.Wa=function(a,b){var c=b[0]-a[0],d=b[1]-a[1],f=b[2]-a[2];return c*c+d*d+f*f};Z.yb=Z.Wa;Z.length=function(a){var b=a[0],c=a[1],a=a[2];return Math.sqrt(b*b+c*c+a*a)};Z.nb=Z.length;Z.Xa=function(a){var b=a[0],c=a[1],a=a[2];return b*b+c*c+a*a};Z.zb=Z.Xa;Z.sb=function(a,b){a[0]=-b[0];a[1]=-b[1];a[2]=-b[2];return a};
Z.normalize=function(a,b){var c=b[0],d=b[1],f=b[2],c=c*c+d*d+f*f;0<c&&(c=1/Math.sqrt(c),a[0]=b[0]*c,a[1]=b[1]*c,a[2]=b[2]*c);return a};Z.jb=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};Z.gb=function(a,b,c){var d=b[0],f=b[1],b=b[2],e=c[0],g=c[1],c=c[2];a[0]=f*c-b*g;a[1]=b*e-d*c;a[2]=d*g-f*e;return a};Z.ob=function(a,b,c,d){var f=b[0],e=b[1],b=b[2];a[0]=f+d*(c[0]-f);a[1]=e+d*(c[1]-e);a[2]=b+d*(c[2]-b);return a};
Z.Ab=function(a,b,c){var d=b[0],f=b[1],b=b[2];a[0]=c[0]*d+c[4]*f+c[8]*b+c[12];a[1]=c[1]*d+c[5]*f+c[9]*b+c[13];a[2]=c[2]*d+c[6]*f+c[10]*b+c[14];return a};Z.Bb=function(a,b,c){var d=b[0],f=b[1],e=b[2],b=c[0],g=c[1],i=c[2],c=c[3],j=c*d+g*e-i*f,h=c*f+i*d-b*e,k=c*e+b*f-g*d,d=-b*d-g*f-i*e;a[0]=j*c+d*-b+h*-i-k*-g;a[1]=h*c+d*-g+k*-b-j*-i;a[2]=k*c+d*-i+j*-g-h*-b;return a};var $=new Float32Array(3);
Z.forEach=function(a,b,c,d,f,e){b||(b=3);c||(c=0);for(d=d?Math.min(d*b+c,a.length):a.length;c<d;c+=b)$[0]=a[c],$[1]=a[c+1],$[2]=a[c+2],f($,$,e),a[c]=$[0],a[c+1]=$[1],a[c+2]=$[2];return a};Z.xa=function(a){return"vec3("+a[0]+", "+a[1]+", "+a[2]+")"};"undefined"!==typeof exports&&(exports.Db=Z);function Hb(a){Q.call(this);this.Cb=a;this.w=4;this.G=34962;this.Y=Z.create([0,0,0]);this.wa=Ib;this.m=W.create();W.T(this.m);this.Oa=W.create();W.T(this.m)}H(Hb,wb);var Ib=0;function Jb(a){var b=2*(Math.random()-0.5),c=Math.random();a.Y[0]=2*(Math.random()-0.5);a.Y[1]=b;a.Y[2]=c;W.translate(a.m,a.Oa,a.Y)}Hb.prototype.I=function(){1==this.wa&&(this.e.I(this),34963==this.G&&this.a.drawElements(this.w,this.Ka,5123,0),34962==this.G&&this.a.drawArrays(this.w,0,this.$a))};
Hb.prototype.f=function(){this.Z&&this.a.deleteBuffer(this.Z);this.X&&this.a.deleteBuffer(this.X);this.aa&&this.a.deleteBuffer(this.aa);Hb.g.f.call(this)};function Kb(a,b,c,d,f){Hb.call(this,2);this.G=f||34963;this.w=d||5;if(34963==this.G)if(4==this.w){this.k=new Uint16Array(6*(b+1)*(c+1));a=Lb(a,b,c);this.c=a.u;this.b=a.s;for(d=a=0;d<b;++d)for(f=0;f<c;++f){var e=d*(c+1)+f,g=e+c+1;this.k[a++]=e;this.k[a++]=g;this.k[a++]=e+1;this.k[a++]=g;this.k[a++]=g+1;this.k[a++]=e+1}}else{if(5==this.w){this.k=new Uint16Array(2*(b+1)*(c+4));a=Lb(a,b,c);this.c=a.u;this.b=a.s;for(d=a=0;d<b;++d){for(f=0;f<c+2;++f)if(!(d==b-1&&f>=c)){var g=d*(c+1)+f,e=g+1,g=g+c+1,i=g+
1;this.k[a++]=e;this.k[a++]=i}g=d*(c+1);g=g+c+1;i=g+1;this.k[a++]=g;this.k[a++]=i}}}else if(34962==this.G)if(4==this.w){d=(b+1)*(c+1);this.c=new Float32Array(18*d);this.b=new Float32Array(18*d);d=Lb(a,b,c);a=d.u;d=d.s;for(g=e=f=0;g<b;++g)for(i=0;i<c;++i)if(!(g==b-1&&i>=c)){var j=g*(c+1)+i,h=j+1,k=j+c+1,l=k+1;this.c[f++]=a[3*j];this.c[f++]=a[3*j+1];this.c[f++]=a[3*j+2];this.c[f++]=a[3*k];this.c[f++]=a[3*k+1];this.c[f++]=a[3*k+2];this.c[f++]=a[3*h];this.c[f++]=a[3*h+1];this.c[f++]=a[3*h+2];this.c[f++]=
a[3*k];this.c[f++]=a[3*k+1];this.c[f++]=a[3*k+2];this.c[f++]=a[3*l];this.c[f++]=a[3*l+1];this.c[f++]=a[3*l+2];this.c[f++]=a[3*h];this.c[f++]=a[3*h+1];this.c[f++]=a[3*h+2];this.b[e++]=d[3*j];this.b[e++]=d[3*j+1];this.b[e++]=d[3*j+2];this.b[e++]=d[3*k];this.b[e++]=d[3*k+1];this.b[e++]=d[3*k+2];this.b[e++]=d[3*h];this.b[e++]=d[3*h+1];this.b[e++]=d[3*h+2];this.b[e++]=d[3*k];this.b[e++]=d[3*k+1];this.b[e++]=d[3*k+2];this.b[e++]=d[3*l];this.b[e++]=d[3*l+1];this.b[e++]=d[3*l+2];this.b[e++]=d[3*h];this.b[e++]=
d[3*h+1];this.b[e++]=d[3*h+2]}}else if(5==this.w){d=(b+1)*(c+1);this.c=new Float32Array(18*d);this.b=new Float32Array(18*d);d=Lb(a,b,c);a=d.u;d=d.s;for(g=e=f=0;g<b;++g){for(i=0;i<c+2;++i)h=g*(c+1)+i,j=h+1,h=h+c+1,k=h+1,this.c[f++]=a[3*j],this.c[f++]=a[3*j+1],this.c[f++]=a[3*j+2],this.b[e++]=d[3*j],this.b[e++]=d[3*j+1],this.b[e++]=d[3*j+2],this.c[f++]=a[3*k],this.c[f++]=a[3*k+1],this.c[f++]=a[3*k+2],this.b[e++]=d[3*k],this.b[e++]=d[3*k+1],this.b[e++]=d[3*k+2];h=g*(c+1);h=h+c+1;k=h+1;this.c[f++]=a[3*
h];this.c[f++]=a[3*h+1];this.c[f++]=a[3*h+2];this.b[e++]=d[3*h];this.b[e++]=d[3*h+1];this.b[e++]=d[3*h+2];this.c[f++]=a[3*k];this.c[f++]=a[3*k+1];this.c[f++]=a[3*k+2];this.b[e++]=d[3*k];this.b[e++]=d[3*k+1];this.b[e++]=d[3*k+2]}}this.wa=1}H(Kb,Hb);
function Lb(a,b,c){for(var d=(b+1)*(c+1),d={u:new Float32Array(3*d),s:new Float32Array(3*d),za:new Float32Array(2*d)},f=0,e=0,g=0,i=0;i<=b;i++)for(var j=0;j<=c;j++){var h=i*Math.PI/b,k=2*j*Math.PI/c,l=Math.sin(h),n=Math.cos(k)*l,h=Math.cos(h),k=Math.sin(k)*l,l=1-j/c,m=i/b;d.s[e++]=n;d.s[e++]=h;d.s[e++]=k;d.za[g++]=l;d.za[g++]=m;d.u[f++]=a*n;d.u[f++]=a*h;d.u[f++]=a*k}return d};var Mb;function Nb(a){this.a=a;this.Qa=Ob;this.Aa={};this.z={}}var Ob=0;function Pb(a,b,c){b=a.a.createShader(b);a.a.shaderSource(b,c);a.a.compileShader(b);if(!a.a.getShaderParameter(b,35713))throw"Error during vertex shader compilation:\n"+a.a.getShaderInfoLog(b);return b}Nb.prototype.I=function(){Mb!==this.e&&(window.console.log("switching to new program"),Mb=this.e,this.a.useProgram(this.e))};
Nb.prototype.f=function(){this.a.deleteShader(this.la);this.a.deleteShader(this.Ca);this.a.deleteProgram(this.e);Nb.g.f.call(this)};function Qb(a){Nb.call(this,a);this.Qa=1;this.Ca=Pb(this,35633,"attribute vec3 aVertexPosition;\nattribute vec3 normalPosition;\nvarying mediump vec4 vVaryingColor;\nuniform mat4 MVMatrix;\nvoid main(void)\n{\nvVaryingColor = vec4(normalPosition, 1.0);\ngl_Position = MVMatrix * vec4(aVertexPosition, 1.0);\n}");this.la=Pb(this,35632,"varying mediump vec4 vVaryingColor;\nvoid main(void)\n{\ngl_FragColor = vVaryingColor;\n}");this.e=this.a.createProgram();this.a.attachShader(this.e,this.la);this.a.attachShader(this.e,
this.Ca);this.a.linkProgram(this.e);if(!this.a.getProgramParameter(this.e,35714))throw"Error during program linking:\n"+this.a.getProgramInfoLog(this.e);this.a.validateProgram(this.e);if(!this.a.getProgramParameter(this.e,35715))throw"Error during program validation:\n"+this.a.getProgramInfoLog(this.e);this.Aa.Da=this.a.getUniformLocation(this.e,"MVMatrix");this.z.Ba=this.a.getAttribLocation(this.e,"aVertexPosition");this.a.enableVertexAttribArray(this.z.Ba);this.z.sa=this.a.getAttribLocation(this.e,
"normalPosition");this.a.enableVertexAttribArray(this.z.sa)}H(Qb,Nb);Qb.prototype.I=function(a){Qb.g.I.call(this,a);a.a.uniformMatrix4fv(this.Aa.Da,y,a.m);var b=this.z.Ba;a.a.bindBuffer(34962,a.Z);a.a.vertexAttribPointer(b,3,5126,y,0,0);b=this.z.sa;a.a.bindBuffer(34962,a.X);a.a.vertexAttribPointer(b,3,5126,y,0,0)};function Rb(a){V.call(this);this.i=a;this.F="Sphere ELEMENT_ARRAY + TRIANGLE_STRIP";this.v=2500*this.i;this.o=1E4*this.i}H(Rb,V);Rb.prototype.j=function(){Rb.g.j.call(this);for(var a=new Qb(this.canvas.a),b=0;b<this.i;b++){var c=new Kb(0.05,50,50,5,34963);c.a=this.canvas.a;Jb(c);c.e=a;Cb(this.canvas,c)}};function Sb(a){V.call(this);this.i=a;this.F="Sphere ELEMENT_ARRAY + TRIANGLES";this.v=2500*this.i;this.o=22500*this.i}H(Sb,V);Sb.prototype.j=function(){Sb.g.j.call(this);for(var a=new Qb(this.canvas.a),b=0;b<this.i;b++){var c=new Kb(0.05,50,50,4,34963);c.a=this.canvas.a;Jb(c);c.e=a;Cb(this.canvas,c)}};function Tb(a){V.call(this);this.i=a;this.F="Sphere ARRAY + TRIANGLE_STRIP";this.v=2500*this.i;this.o=15E3*this.i}H(Tb,V);Tb.prototype.j=function(){Tb.g.j.call(this);for(var a=new Qb(this.canvas.a),b=0;b<this.i;b++){var c=new Kb(0.05,50,50,5,34962);c.a=this.canvas.a;Jb(c);c.e=a;Cb(this.canvas,c)}};function Ub(a){V.call(this);this.i=a;this.F="Sphere ARRAY + TRIANGLES";this.v=2500*this.i;this.o=45E3*this.i}H(Ub,V);Ub.prototype.j=function(){Ub.g.j.call(this);for(var a=new Qb(this.canvas.a),b=0;b<this.i;b++){var c=new Kb(0.05,50,50,4,34962);c.a=this.canvas.a;Jb(c);c.e=a;Cb(this.canvas,c)}};function Vb(){Q.call(this);this.h=[];this.d=0;this.A=Wb;this.B=0;this.L=K("table","",[K("thead","",[K("tr","",[K("th","","Test no"),K("th","","Name"),K("th","","Vertices count"),K("th","","Total buffer size"),K("th","","Frames drawn"),K("th","","Init time"),K("th","","Avg. frame time"),K("th","","fps")])])]);this.ya=K("tbody");this.L.appendChild(this.ya);this.L.style.position="absolute";this.L.style.right="10px";this.L.style.top="10px";window.document.body.appendChild(this.L)}H(Vb,Q);var Wb=0;
function Xb(a,b,c,d,f,e,g,i){return K("tr","",[K("td","",a),K("td","",b),K("td","",c),K("td","",d),K("td","",f),K("td","",e),K("td","",g),K("td","",i)])}
Vb.prototype.frame=function(){switch(this.A){case Wb:window.console.log("Start demo",this.d+1);if(this.h[this.d])this.p=fa(),this.B=0,this.A=1,yb(this.h[this.d]),this.fa=Xb(""+(this.d+1),this.h[this.d].F,""+Db(this.h[this.d]),""+Eb(this.h[this.d]),"?","?","?","?"),this.ya.appendChild(this.fa);else{this.q();return}break;case 1:window.console.log("Init demo",this.d+1);this.ha=fa()-this.p;this.p-=this.ha;this.A=2;window.console.log("Entering warmup",this.d+1);break;case 2:this.h[this.d].frame();3E3<
fa()-this.p&&(this.A=3,window.console.log("Running",this.d+1));break;case 3:window.console.log("Frame in demo",this.d+1);13E3<fa()-this.p&&(this.A=4);this.h[this.d].frame();this.B++;break;case 4:window.console.log("End demo",this.d+1);var a=Xb(""+(this.d+1),this.h[this.d].F,""+Db(this.h[this.d]),""+Eb(this.h[this.d]),""+this.B,""+this.ha+"ms",""+((fa()-this.p)/this.B).toFixed(2)+"ms",""+(1E3*(this.B/(fa()-this.p-3E3))).toFixed(2)),b=this.fa,c=b.parentNode;c&&c.replaceChild(a,b);this.h[this.d].q();
this.d++;this.B=0;this.A=Wb}window.requestAnimationFrame(this.frame)};Vb.prototype.f=function(){this.h=[];Vb.g.f.call(this)};
window.addEventListener("load",function(){window.requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)};var a=new Vb,b=new Ub(150);a.h.push(b);b=new Tb(150);a.h.push(b);b=new Sb(150);a.h.push(b);b=new Rb(150);a.h.push(b);a.frame=a.frame.bind(a);window.requestAnimationFrame(a.frame)},y);
