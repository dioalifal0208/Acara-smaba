import{ax as br,r as we,j as ye,B as il,T as sl}from"./app--nwdkams.js";import{S as ul}from"./shield-check-B4tr1Cdz.js";var Ws=function(r,t){return(Ws=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var a in n)n.hasOwnProperty(a)&&(e[a]=n[a])})(r,t)};function bt(r,t){function e(){this.constructor=r}Ws(r,t),r.prototype=t===null?Object.create(t):(e.prototype=t.prototype,new e)}function $(r,t,e,n){return new(e||(e=Promise))((function(a,o){function i(c){try{u(n.next(c))}catch(l){o(l)}}function s(c){try{u(n.throw(c))}catch(l){o(l)}}function u(c){c.done?a(c.value):new e((function(l){l(c.value)})).then(i,s)}u((n=n.apply(r,[])).next())}))}function Y(r,t){var e,n,a,o,i={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:s(0),throw:s(1),return:s(2)},typeof Symbol=="function"&&(o[Symbol.iterator]=function(){return this}),o;function s(u){return function(c){return(function(l){if(e)throw new TypeError("Generator is already executing.");for(;i;)try{if(e=1,n&&(a=2&l[0]?n.return:l[0]?n.throw||((a=n.return)&&a.call(n),0):n.next)&&!(a=a.call(n,l[1])).done)return a;switch(n=0,a&&(l=[2&l[0],a.value]),l[0]){case 0:case 1:a=l;break;case 4:return i.label++,{value:l[1],done:!1};case 5:i.label++,n=l[1],l=[0];continue;case 7:l=i.ops.pop(),i.trys.pop();continue;default:if(!(a=(a=i.trys).length>0&&a[a.length-1])&&(l[0]===6||l[0]===2)){i=0;continue}if(l[0]===3&&(!a||l[1]>a[0]&&l[1]<a[3])){i.label=l[1];break}if(l[0]===6&&i.label<a[1]){i.label=a[1],a=l;break}if(a&&i.label<a[2]){i.label=a[2],i.ops.push(l);break}a[2]&&i.ops.pop(),i.trys.pop();continue}l=t.call(r,i)}catch(h){l=[6,h],n=0}finally{e=a=0}if(5&l[0])throw l[1];return{value:l[0]?l[1]:void 0,done:!0}})([u,c])}}}var cl=(function(){function r(t){this.global=t,this.flags={},this.flagRegistry={},this.urlFlags={},this.populateURLFlags()}return r.prototype.setPlatform=function(t,e){this.platform!=null&&console.warn("Platform "+this.platformName+" has already been set. Overwriting the platform with "+e+"."),this.platformName=t,this.platform=e},r.prototype.registerFlag=function(t,e,n){if(this.flagRegistry[t]={evaluationFn:e,setHook:n},this.urlFlags[t]!=null){var a=this.urlFlags[t];console.warn("Setting feature override from URL "+t+": "+a+"."),this.set(t,a)}},r.prototype.get=function(t){return t in this.flags?this.flags[t]:(this.flags[t]=this.evaluateFlag(t),this.flags[t])},r.prototype.getNumber=function(t){return this.get(t)},r.prototype.getBool=function(t){return this.get(t)},r.prototype.getFlags=function(){return this.flags},Object.defineProperty(r.prototype,"features",{get:function(){return this.flags},enumerable:!0,configurable:!0}),r.prototype.set=function(t,e){if(this.flagRegistry[t]==null)throw new Error("Cannot set flag "+t+" as it has not been registered.");this.flags[t]=e,this.flagRegistry[t].setHook!=null&&this.flagRegistry[t].setHook(e)},r.prototype.evaluateFlag=function(t){if(this.flagRegistry[t]==null)throw new Error("Cannot evaluate flag '"+t+"': no evaluation function found.");return this.flagRegistry[t].evaluationFn()},r.prototype.setFlags=function(t){this.flags=Object.assign({},t)},r.prototype.reset=function(){this.flags={},this.urlFlags={},this.populateURLFlags()},r.prototype.populateURLFlags=function(){var t=this;if(this.global!==void 0&&this.global.location!==void 0&&this.global.location.search!==void 0){var e,n,a=(e=this.global.location.search,n={},e.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(function(o){for(var i=[],s=1;s<arguments.length;s++)i[s-1]=arguments[s];return ll(n,i[0],i[1]),i.join("=")})),n);"tfjsflags"in a&&a.tfjsflags.split(",").forEach((function(o){var i=o.split(":"),s=i[0],u=i[1];t.urlFlags[s]=(function(c,l){if((l=l.toLowerCase())==="true"||l==="false")return l==="true";if(""+ +l===l)return+l;throw new Error("Could not parse value flag value "+l+" for flag "+c+".")})(s,u)}))}},r})();function ll(r,t,e){r[decodeURIComponent(t)]=decodeURIComponent(e||"")}function B(){return Us}var Us=null,Br=new Map,no=new Map;function zs(r,t){var e=Gs(r,t);return Br.get(e)}function hl(r){return no.get(r)}function Di(r){for(var t=Br.entries(),e=[];;){var n=t.next(),a=n.done,o=n.value;if(a)break;var i=o[0],s=o[1];i.split("_")[0]===r&&e.push(s)}return e}function Vs(r){var t=r.kernelName,e=r.backendName,n=Gs(t,e);if(Br.has(n))throw new Error("The kernel '"+t+"' for backend '"+e+"' is already registered");Br.set(n,r)}function fl(r){var t=r.kernelName;no.has(t)&&console.warn("Overriding the gradient for '"+t+"'"),no.set(t,r)}function Gs(r,t){return t+"_"+r}function ro(r,t,e){return Math.max(r,Math.min(t,e))}function Hs(r){return r%2==0?r:r+1}function pl(r){for(var t=0,e=0;e<r.length;e++)t+=r[e];return t}function E(r,t){if(!r)throw new Error(typeof t=="string"?t:t())}function Ce(r,t,e){e===void 0&&(e=""),E(ze(r,t),(function(){return e+" Shapes "+r+" and "+t+" must match"}))}function Kn(r){E(r!=null,(function(){return"The input to the tensor constructor must be a non-null value."}))}function Gn(r,t,e){if(t===void 0&&(t=[]),e===void 0&&(e=!1),t==null&&(t=[]),Array.isArray(r)||At(r)&&!e)for(var n=0;n<r.length;++n)Gn(r[n],t,e);else t.push(r);return t}function Q(r){if(r.length===0)return 1;for(var t=r[0],e=1;e<r.length;e++)t*=r[e];return t}function ze(r,t){if(r===t)return!0;if(r==null||t==null||r.length!==t.length)return!1;for(var e=0;e<r.length;e++)if(r[e]!==t[e])return!1;return!0}function Ne(r){return r%1==0}function dl(r){if(Math.tanh!=null)return Math.tanh(r);if(r===1/0)return 1;if(r===-1/0)return-1;var t=Math.exp(2*r);return(t-1)/(t+1)}function ao(r){var t=Math.ceil(Math.sqrt(r));return[t,Math.ceil(r/t)]}function Mn(r,t){return t<=r.length?r:r+" ".repeat(t-r.length)}function Ai(r,t,e){return t===void 0&&(t=function(n){return 0}),new Promise((function(n,a){var o=0,i=function(){if(r())n();else{o++;var s=t(o);e!=null&&o>=e?a():setTimeout(i,s)}};i()}))}function vl(r,t){for(var e=1,n=-1,a=0;a<r.length;++a)if(r[a]>=0)e*=r[a];else if(r[a]===-1){if(n!==-1)throw Error("Shapes can only have 1 implicit size. Found -1 at dim "+n+" and dim "+a);n=a}else if(r[a]<0)throw Error("Shapes can not be < 0. Found "+r[a]+" at dim "+a);if(n===-1){if(t>0&&t!==e)throw Error("Size("+t+") must match the product of shape "+r);return r}if(e===0)throw Error("Cannot infer the missing size in ["+r+"] when there are 0 elements");if(t%e!=0)throw Error("The implicit shape can't be a fractional number. Got "+t+" / "+e);var o=r.slice();return o[n]=t/e,o}function We(r,t){var e=t.length;return E((r=r==null?t.map((function(n,a){return a})):[].concat(r)).every((function(n){return n>=-e&&n<e})),(function(){return"All values in axis param must be in range [-"+e+", "+e+") but got axis "+r})),E(r.every((function(n){return Ne(n)})),(function(){return"All values in axis param must be integers but got axis "+r})),r.map((function(n){return n<0?e+n:n}))}function pn(r,t){for(var e=[],n=[],a=t!=null&&Array.isArray(t)&&t.length===0,o=t==null||a?null:We(t,r).sort(),i=0,s=0;s<r.length;++s){if(o!=null){if(o[i]===s&&r[s]!==1)throw new Error("Can't squeeze axis "+s+" since its dim '"+r[s]+"' is not 1");(o[i]==null||o[i]>s)&&r[s]===1&&(e.push(r[s]),n.push(s)),o[i]<=s&&i++}r[s]!==1&&(e.push(r[s]),n.push(s))}return{newShape:e,keptDims:n}}function nr(r,t){var e=null;if(r==null||r==="float32")e=new Float32Array(t);else if(r==="int32")e=new Int32Array(t);else{if(r!=="bool")throw new Error("Unknown data type "+r);e=new Uint8Array(t)}return e}function Lr(r,t){var e=null;if(r==null||r==="float32")e=new Float32Array(t);else if(r==="int32")e=new Int32Array(t);else if(r==="bool")e=new Uint8Array(t);else{if(r!=="string")throw new Error("Unknown data type "+r);e=new Array(t)}return e}function ml(r,t){for(var e=0;e<r.length;e++){var n=r[e];if(isNaN(n)||!isFinite(n))throw Error("A tensor of type "+t+" being uploaded contains "+n+".")}}function gl(r){return r==="bool"||r==="complex64"||r==="float32"||r==="int32"||r==="string"}function yl(r,t){return t!=="complex64"&&(t!=="float32"||r==="complex64")&&(t!=="int32"||r==="float32"||r==="complex64")&&(t!=="bool"||r!=="bool")}function At(r){return r instanceof Float32Array||r instanceof Int32Array||r instanceof Uint8Array}function js(r){if(r==="float32"||r==="int32")return 4;if(r==="complex64")return 8;if(r==="bool")return 1;throw new Error("Unknown dtype "+r)}function xl(r){if(r==null)return 0;var t=0;return r.forEach((function(e){return t+=e.length})),t}function Ro(r){return typeof r=="string"||r instanceof String}function bl(r){return typeof r=="boolean"}function wl(r){return typeof r=="number"}function cr(r){return Array.isArray(r)?cr(r[0]):r instanceof Float32Array?"float32":r instanceof Int32Array||r instanceof Uint8Array?"int32":wl(r)?"float32":Ro(r)?"string":bl(r)?"bool":"float32"}function oo(r){return!!(r&&r.constructor&&r.call&&r.apply)}function io(r,t){for(var e=t;e<r;++e)if(r%e==0)return e;return r}function Tt(r){var t=r.length;if(t<2)return[];var e=new Array(t-1);e[t-2]=r[t-1];for(var n=t-3;n>=0;--n)e[n]=e[n+1]*r[n+1];return e}function qs(r,t,e){if(t==="string")throw new Error("Cannot convert a string[] to a TypedArray");if(Array.isArray(r)&&(r=Gn(r)),e&&ml(r,t),(function(o,i){return o instanceof Float32Array&&i==="float32"||o instanceof Int32Array&&i==="int32"||o instanceof Uint8Array&&i==="bool"})(r,t))return r;if(t==null||t==="float32"||t==="complex64")return new Float32Array(r);if(t==="int32")return new Int32Array(r);if(t==="bool"){for(var n=new Uint8Array(r.length),a=0;a<n.length;++a)Math.round(r[a])!==0&&(n[a]=1);return n}throw new Error("Unknown data type "+t)}function Ti(r,t){if(r.length===0)return t[0];var e=r.reduce((function(n,a){return n*a}));if(e===0)return[];if(e!==t.length)throw new Error("["+r+"] does not match the input size.");return(function n(a,o,i){var s=new Array;if(o.length===1)for(var u=o[0],c=0;c<u;c++)s[c]=i[a+c];else{u=o[0];var l=o.slice(1),h=l.reduce((function(f,p){return f*p}));for(c=0;c<u;c++)s[c]=n(a+c*h,l,i)}return s})(0,r,t)}function Ks(r,t){for(var e=lr(r,t),n=0;n<e.length;n++)e[n]=1;return e}function lr(r,t){if(t==null||t==="float32"||t==="complex64")return new Float32Array(r);if(t==="int32")return new Int32Array(r);if(t==="bool")return new Uint8Array(r);throw new Error("Unknown data type "+t)}function Rt(){return B().platform.now()}function Xs(r){r.forEach((function(t){E(Number.isInteger(t)&&t>=0,(function(){return"Tensor must have a shape comprised of positive integers but got shape ["+r+"]."}))}))}function Cl(r,t){return t===void 0&&(t="utf-8"),t=t||"utf-8",B().platform.encode(r,t)}function Wr(r,t){return t===void 0&&(t="utf-8"),t=t||"utf-8",B().platform.decode(r,t)}function Ni(r,t,e){if(t===0)return 0;if(t===1)return r[0];for(var n=r[r.length-1],a=0;a<r.length-1;++a)n+=e[a]*r[a];return n}function _l(r,t,e){if(t===0)return[];if(t===1)return[r];for(var n=new Array(t),a=0;a<n.length-1;++a)n[a]=Math.floor(r/e[a]),r-=n[a]*e[a];return n[n.length-1]=r,n}var El=(function(){function r(t,e){this.backendTimer=t,this.logger=e,e==null&&(this.logger=new kl)}return r.prototype.profileKernel=function(t,e,n){var a,o=this,i=this.backendTimer.time((function(){a=n()}));return a.forEach((function(s){s.data().then((function(u){(function(c,l,h){if(l!=="float32")return!1;for(var f=0;f<c.length;f++){var p=c[f];if(isNaN(p)||!isFinite(p))return console.warn("Found "+p+" in the result of '"+h+"'"),!0}})(u,s.dtype,t),i.then((function(c){var l="";c.getExtraProfileInfo!=null&&(l=c.getExtraProfileInfo()),o.logger.logKernelProfile(t,s,u,c.kernelMs,e,l)}))}))})),a},r})(),kl=(function(){function r(){}return r.prototype.logKernelProfile=function(t,e,n,a,o,i){var s=typeof a=="number"?Mn(a+"ms",9):a.error,u=Mn(t,25),c=e.rank,l=e.size,h=Mn(e.shape.toString(),14),f="";for(var p in o){var d=o[p].shape||e.shape,m=d.length;f+=p+": "+m+"D "+(m>0?d:"")+" "}console.log("%c"+u+"	%c"+s+"	%c"+c+"D "+h+"	%c"+l+"	%c"+f+"	%c"+i,"font-weight:bold","color:red","color:blue","color: orange","color: green","color: steelblue")},r})(),Fi=20,$n=3,Ia=7;function Rl(r,t,e,n){var a=Tt(t),o=(function(c,l,h,f){var p=Q(l),d=f[f.length-1],m=new Array(d).fill(0),v=l.length,g=h==="complex64"?Jn(c):c;if(v>1)for(var x=0;x<p/d;x++)for(var b=x*d,y=0;y<d;y++)m[y]=Math.max(m[y],Yn(g[b+y],0,h).length);return m})(r,t,e,a),i=t.length,s=(function c(l,h,f,p,d,m){m===void 0&&(m=!0);var v=f==="complex64"?2:1,g=h[0],x=h.length;if(x===0)return f==="complex64"?[Yn(Jn(l)[0],0,f)]:f==="bool"?[$s(l[0])]:[l[0].toString()];if(x===1){if(g>Fi){var b=$n*v,y=Array.from(l.slice(0,b)),w=Array.from(l.slice((g-$n)*v,g*v));return f==="complex64"&&(y=Jn(y),w=Jn(w)),["["+y.map((function(O,V){return Yn(O,d[V],f)})).join(", ")+", ..., "+w.map((function(O,V){return Yn(O,d[g-$n+V],f)})).join(", ")+"]"]}return["["+(f==="complex64"?Jn(l):Array.from(l)).map((function(O,V){return Yn(O,d[V],f)})).join(", ")+"]"]}var C=h.slice(1),S=p.slice(1),I=p[0]*v,k=[];if(g>Fi){for(var R=0;R<$n;R++){var N=(A=R*I)+I;k.push.apply(k,c(l.slice(A,N),C,f,S,d,!1))}for(k.push("..."),R=g-$n;R<g;R++)N=(A=R*I)+I,k.push.apply(k,c(l.slice(A,N),C,f,S,d,R===g-1))}else for(R=0;R<g;R++){var A;N=(A=R*I)+I,k.push.apply(k,c(l.slice(A,N),C,f,S,d,R===g-1))}var L=x===2?",":"";for(k[0]="["+k[0]+L,R=1;R<k.length-1;R++)k[R]=" "+k[R]+L;var M=`,
`;for(R=2;R<x;R++)M+=`
`;return k[k.length-1]=" "+k[k.length-1]+"]"+(m?"":M),k})(r,t,e,a,o),u=["Tensor"];return n&&(u.push("  dtype: "+e),u.push("  rank: "+i),u.push("  shape: ["+t+"]"),u.push("  values:")),u.push(s.map((function(c){return"    "+c})).join(`
`)),u.join(`
`)}function Yn(r,t,e){return Mn(Array.isArray(r)?parseFloat(r[0].toFixed(Ia))+" + "+parseFloat(r[1].toFixed(Ia))+"j":Ro(r)?"'"+r+"'":e==="bool"?$s(r):parseFloat(r.toFixed(Ia)).toString(),t)}function $s(r){return r===0?"false":"true"}function Jn(r){for(var t=[],e=0;e<r.length;e+=2)t.push([r[e],r[e+1]]);return t}var rr=(function(){function r(t,e,n){var a=this;if(this.dtype=e,this.shape=t.slice(),this.size=Q(t),n!=null){var o=n.length;E(o===this.size,(function(){return"Length of values '"+o+"' does not match the size inferred by the shape '"+a.size+"'."}))}if(e==="complex64")throw new Error("complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).");this.values=n||Lr(e,this.size),this.strides=Tt(t)}return r.prototype.set=function(t){for(var e=this,n=[],a=1;a<arguments.length;a++)n[a-1]=arguments[a];n.length===0&&(n=[0]),E(n.length===this.rank,(function(){return"The number of provided coordinates ("+n.length+") must match the rank ("+e.rank+")"}));var o=this.locToIndex(n);this.values[o]=t},r.prototype.get=function(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];t.length===0&&(t=[0]);for(var n=0,a=0,o=t;a<o.length;a++){var i=o[a];if(i<0||i>=this.shape[n]){var s="Requested out of range element at "+t+".   Buffer shape="+this.shape;throw new Error(s)}n++}for(var u=t[t.length-1],c=0;c<t.length-1;++c)u+=this.strides[c]*t[c];return this.values[u]},r.prototype.locToIndex=function(t){if(this.rank===0)return 0;if(this.rank===1)return t[0];for(var e=t[t.length-1],n=0;n<t.length-1;++n)e+=this.strides[n]*t[n];return e},r.prototype.indexToLoc=function(t){if(this.rank===0)return[];if(this.rank===1)return[t];for(var e=new Array(this.shape.length),n=0;n<e.length-1;++n)e[n]=Math.floor(t/this.strides[n]),t-=e[n]*this.strides[n];return e[e.length-1]=t,e},Object.defineProperty(r.prototype,"rank",{get:function(){return this.shape.length},enumerable:!0,configurable:!0}),r.prototype.toTensor=function(){return It().makeTensor(this.values,this.shape,this.dtype)},r})(),It=null,P=null,Ys=null,Se=(function(){function r(t,e,n,a){this.kept=!1,this.isDisposedInternal=!1,this.shape=t.slice(),this.dtype=e||"float32",this.size=Q(t),this.strides=Tt(t),this.dataId=n,this.id=a,this.rankType=this.rank<5?this.rank.toString():"higher"}return r.prototype.flatten=function(){return this.throwIfDisposed(),this.as1D()},r.prototype.asScalar=function(){return this.throwIfDisposed(),E(this.size===1,(function(){return"The array must have only 1 element."})),this.reshape([])},r.prototype.as1D=function(){return this.throwIfDisposed(),this.reshape([this.size])},r.prototype.as2D=function(t,e){return this.throwIfDisposed(),this.reshape([t,e])},r.prototype.as3D=function(t,e,n){return this.throwIfDisposed(),this.reshape([t,e,n])},r.prototype.as4D=function(t,e,n,a){return this.throwIfDisposed(),this.reshape([t,e,n,a])},r.prototype.as5D=function(t,e,n,a,o){return this.throwIfDisposed(),this.reshape([t,e,n,a,o])},r.prototype.asType=function(t){return this.throwIfDisposed(),P.cast(this,t)},Object.defineProperty(r.prototype,"rank",{get:function(){return this.shape.length},enumerable:!0,configurable:!0}),r.prototype.buffer=function(){return $(this,void 0,void 0,(function(){var t;return Y(this,(function(e){switch(e.label){case 0:return[4,this.data()];case 1:return t=e.sent(),[2,P.buffer(this.shape,this.dtype,t)]}}))}))},r.prototype.bufferSync=function(){return P.buffer(this.shape,this.dtype,this.dataSync())},r.prototype.array=function(){return $(this,void 0,void 0,(function(){var t;return Y(this,(function(e){switch(e.label){case 0:return[4,this.data()];case 1:return t=e.sent(),[2,Ti(this.shape,t)]}}))}))},r.prototype.arraySync=function(){return Ti(this.shape,this.dataSync())},r.prototype.data=function(){return $(this,void 0,void 0,(function(){var t,e;return Y(this,(function(n){switch(n.label){case 0:return this.throwIfDisposed(),t=It().read(this.dataId),this.dtype!=="string"?[3,2]:[4,t];case 1:e=n.sent();try{return[2,e.map((function(a){return Wr(a)}))]}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}n.label=2;case 2:return[2,t]}}))}))},r.prototype.dataSync=function(){this.throwIfDisposed();var t=It().readSync(this.dataId);if(this.dtype==="string")try{return t.map((function(e){return Wr(e)}))}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}return t},r.prototype.bytes=function(){return $(this,void 0,void 0,(function(){var t;return Y(this,(function(e){switch(e.label){case 0:return this.throwIfDisposed(),[4,It().read(this.dataId)];case 1:return t=e.sent(),this.dtype==="string"?[2,t]:[2,new Uint8Array(t.buffer)]}}))}))},r.prototype.dispose=function(){this.isDisposed||(It().disposeTensor(this),this.isDisposedInternal=!0)},Object.defineProperty(r.prototype,"isDisposed",{get:function(){return this.isDisposedInternal},enumerable:!0,configurable:!0}),r.prototype.throwIfDisposed=function(){if(this.isDisposed)throw new Error("Tensor is disposed.")},r.prototype.toFloat=function(){return this.asType("float32")},r.prototype.toInt=function(){return this.asType("int32")},r.prototype.toBool=function(){return this.asType("bool")},r.prototype.print=function(t){return t===void 0&&(t=!1),P.print(this,t)},r.prototype.reshape=function(t){return this.throwIfDisposed(),P.reshape(this,t)},r.prototype.reshapeAs=function(t){return this.throwIfDisposed(),this.reshape(t.shape)},r.prototype.expandDims=function(t){return t===void 0&&(t=0),P.expandDims(this,t)},r.prototype.cumsum=function(t,e,n){return t===void 0&&(t=0),e===void 0&&(e=!1),n===void 0&&(n=!1),P.cumsum(this,t,e,n)},r.prototype.squeeze=function(t){return this.throwIfDisposed(),P.squeeze(this,t)},r.prototype.clone=function(){return this.throwIfDisposed(),P.clone(this)},r.prototype.oneHot=function(t,e,n){return this.throwIfDisposed(),P.oneHot(this,t,e,n)},r.prototype.toString=function(t){return t===void 0&&(t=!1),Rl(this.dataSync(),this.shape,this.dtype,t)},r.prototype.tile=function(t){return this.throwIfDisposed(),P.tile(this,t)},r.prototype.gather=function(t,e){return e===void 0&&(e=0),this.throwIfDisposed(),P.gather(this,t,e)},r.prototype.matMul=function(t,e,n){return e===void 0&&(e=!1),n===void 0&&(n=!1),this.throwIfDisposed(),P.matMul(this,t,e,n)},r.prototype.dot=function(t){return this.throwIfDisposed(),P.dot(this,t)},r.prototype.norm=function(t,e,n){return t===void 0&&(t="euclidean"),e===void 0&&(e=null),n===void 0&&(n=!1),this.throwIfDisposed(),P.norm(this,t,e,n)},r.prototype.slice=function(t,e){return this.throwIfDisposed(),P.slice(this,t,e)},r.prototype.reverse=function(t){return this.throwIfDisposed(),P.reverse(this,t)},r.prototype.concat=function(t,e){return e===void 0&&(e=0),this.throwIfDisposed(),t instanceof r&&(t=[t]),P.concat([this].concat(t),e)},r.prototype.split=function(t,e){return e===void 0&&(e=0),this.throwIfDisposed(),P.split(this,t,e)},r.prototype.stack=function(t,e){return e===void 0&&(e=0),P.stack([this,t],e)},r.prototype.unstack=function(t){return t===void 0&&(t=0),P.unstack(this,t)},r.prototype.pad=function(t,e){return e===void 0&&(e=0),P.pad(this,t,e)},r.prototype.batchNormalization=function(t,e,n,a,o){return n===void 0&&(n=.001),Ys("tf.batchNormalization() is going away. Use tf.batchNorm() instead, and note the positional argument change of scale, offset, and varianceEpsilon"),this.batchNorm(t,e,o,a,n)},r.prototype.batchNorm=function(t,e,n,a,o){return o===void 0&&(o=.001),this.throwIfDisposed(),P.batchNorm(this,t,e,n,a,o)},r.prototype.all=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.all(this,t,e)},r.prototype.any=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.any(this,t,e)},r.prototype.logSumExp=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.logSumExp(this,t,e)},r.prototype.sum=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.sum(this,t,e)},r.prototype.prod=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.prod(this,t,e)},r.prototype.mean=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.mean(this,t,e)},r.prototype.min=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.min(this,t,e)},r.prototype.max=function(t,e){return t===void 0&&(t=null),e===void 0&&(e=!1),this.throwIfDisposed(),P.max(this,t,e)},r.prototype.argMin=function(t){return t===void 0&&(t=null),this.throwIfDisposed(),P.argMin(this,t)},r.prototype.argMax=function(t){return t===void 0&&(t=null),this.throwIfDisposed(),P.argMax(this,t)},r.prototype.cast=function(t){return this.throwIfDisposed(),P.cast(this,t)},r.prototype.add=function(t){return this.throwIfDisposed(),P.add(this,t)},r.prototype.addStrict=function(t){return this.throwIfDisposed(),P.addStrict(this,t)},r.prototype.atan2=function(t){return this.throwIfDisposed(),P.atan2(this,t)},r.prototype.sub=function(t){return this.throwIfDisposed(),P.sub(this,t)},r.prototype.subStrict=function(t){return this.throwIfDisposed(),P.subStrict(this,t)},r.prototype.pow=function(t){return this.throwIfDisposed(),P.pow(this,t)},r.prototype.powStrict=function(t){return this.throwIfDisposed(),P.powStrict(this,t)},r.prototype.mul=function(t){return this.throwIfDisposed(),P.mul(this,t)},r.prototype.mulStrict=function(t){return this.throwIfDisposed(),P.mulStrict(this,t)},r.prototype.div=function(t){return this.throwIfDisposed(),P.div(this,t)},r.prototype.divNoNan=function(t){return this.throwIfDisposed(),P.divNoNan(this,t)},r.prototype.floorDiv=function(t){return this.throwIfDisposed(),P.floorDiv(this,t)},r.prototype.divStrict=function(t){return this.throwIfDisposed(),P.divStrict(this,t)},r.prototype.minimum=function(t){return this.throwIfDisposed(),P.minimum(this,t)},r.prototype.minimumStrict=function(t){return this.throwIfDisposed(),P.minimumStrict(this,t)},r.prototype.maximum=function(t){return this.throwIfDisposed(),P.maximum(this,t)},r.prototype.maximumStrict=function(t){return this.throwIfDisposed(),P.maximumStrict(this,t)},r.prototype.mod=function(t){return this.throwIfDisposed(),P.mod(this,t)},r.prototype.modStrict=function(t){return this.throwIfDisposed(),P.modStrict(this,t)},r.prototype.squaredDifferenceStrict=function(t){return this.throwIfDisposed(),P.squaredDifferenceStrict(this,t)},r.prototype.transpose=function(t){return this.throwIfDisposed(),P.transpose(this,t)},r.prototype.notEqual=function(t){return this.throwIfDisposed(),P.notEqual(this,t)},r.prototype.notEqualStrict=function(t){return this.throwIfDisposed(),P.notEqualStrict(this,t)},r.prototype.less=function(t){return this.throwIfDisposed(),P.less(this,t)},r.prototype.lessStrict=function(t){return this.throwIfDisposed(),P.lessStrict(this,t)},r.prototype.equal=function(t){return this.throwIfDisposed(),P.equal(this,t)},r.prototype.equalStrict=function(t){return this.throwIfDisposed(),P.equalStrict(this,t)},r.prototype.lessEqual=function(t){return this.throwIfDisposed(),P.lessEqual(this,t)},r.prototype.lessEqualStrict=function(t){return this.throwIfDisposed(),P.lessEqualStrict(this,t)},r.prototype.greater=function(t){return this.throwIfDisposed(),P.greater(this,t)},r.prototype.greaterStrict=function(t){return this.throwIfDisposed(),P.greaterStrict(this,t)},r.prototype.greaterEqual=function(t){return this.throwIfDisposed(),P.greaterEqual(this,t)},r.prototype.greaterEqualStrict=function(t){return this.throwIfDisposed(),P.greaterEqualStrict(this,t)},r.prototype.logicalAnd=function(t){return this.throwIfDisposed(),P.logicalAnd(this,t)},r.prototype.logicalOr=function(t){return this.throwIfDisposed(),P.logicalOr(this,t)},r.prototype.logicalNot=function(){return this.throwIfDisposed(),P.logicalNot(this)},r.prototype.logicalXor=function(t){return this.throwIfDisposed(),P.logicalXor(this,t)},r.prototype.where=function(t,e){return this.throwIfDisposed(),P.where(t,this,e)},r.prototype.neg=function(){return this.throwIfDisposed(),P.neg(this)},r.prototype.ceil=function(){return this.throwIfDisposed(),P.ceil(this)},r.prototype.floor=function(){return this.throwIfDisposed(),P.floor(this)},r.prototype.sign=function(){return this.throwIfDisposed(),P.sign(this)},r.prototype.isNaN=function(){return this.throwIfDisposed(),P.isNaN(this)},r.prototype.isInf=function(){return this.throwIfDisposed(),P.isInf(this)},r.prototype.isFinite=function(){return this.throwIfDisposed(),P.isFinite(this)},r.prototype.exp=function(){return this.throwIfDisposed(),P.exp(this)},r.prototype.expm1=function(){return this.throwIfDisposed(),P.expm1(this)},r.prototype.log=function(){return this.throwIfDisposed(),P.log(this)},r.prototype.log1p=function(){return this.throwIfDisposed(),P.log1p(this)},r.prototype.sqrt=function(){return this.throwIfDisposed(),P.sqrt(this)},r.prototype.rsqrt=function(){return this.throwIfDisposed(),P.rsqrt(this)},r.prototype.square=function(){return this.throwIfDisposed(),P.square(this)},r.prototype.reciprocal=function(){return this.throwIfDisposed(),P.reciprocal(this)},r.prototype.abs=function(){return this.throwIfDisposed(),P.abs(this)},r.prototype.clipByValue=function(t,e){return this.throwIfDisposed(),P.clipByValue(this,t,e)},r.prototype.relu=function(){return this.throwIfDisposed(),P.relu(this)},r.prototype.relu6=function(){return this.throwIfDisposed(),P.relu6(this)},r.prototype.elu=function(){return this.throwIfDisposed(),P.elu(this)},r.prototype.selu=function(){return this.throwIfDisposed(),P.selu(this)},r.prototype.leakyRelu=function(t){return t===void 0&&(t=.2),this.throwIfDisposed(),P.leakyRelu(this,t)},r.prototype.prelu=function(t){return this.throwIfDisposed(),P.prelu(this,t)},r.prototype.sigmoid=function(){return this.throwIfDisposed(),P.sigmoid(this)},r.prototype.logSigmoid=function(){return this.throwIfDisposed(),P.logSigmoid(this)},r.prototype.softplus=function(){return this.throwIfDisposed(),P.softplus(this)},r.prototype.zerosLike=function(){return this.throwIfDisposed(),P.zerosLike(this)},r.prototype.onesLike=function(){return this.throwIfDisposed(),P.onesLike(this)},r.prototype.sin=function(){return this.throwIfDisposed(),P.sin(this)},r.prototype.cos=function(){return this.throwIfDisposed(),P.cos(this)},r.prototype.tan=function(){return this.throwIfDisposed(),P.tan(this)},r.prototype.asin=function(){return this.throwIfDisposed(),P.asin(this)},r.prototype.acos=function(){return this.throwIfDisposed(),P.acos(this)},r.prototype.atan=function(){return this.throwIfDisposed(),P.atan(this)},r.prototype.sinh=function(){return this.throwIfDisposed(),P.sinh(this)},r.prototype.cosh=function(){return this.throwIfDisposed(),P.cosh(this)},r.prototype.tanh=function(){return this.throwIfDisposed(),P.tanh(this)},r.prototype.asinh=function(){return this.throwIfDisposed(),P.asinh(this)},r.prototype.acosh=function(){return this.throwIfDisposed(),P.acosh(this)},r.prototype.atanh=function(){return this.throwIfDisposed(),P.atanh(this)},r.prototype.erf=function(){return this.throwIfDisposed(),P.erf(this)},r.prototype.round=function(){return this.throwIfDisposed(),P.round(this)},r.prototype.step=function(t){return t===void 0&&(t=0),this.throwIfDisposed(),P.step(this,t)},r.prototype.softmax=function(t){return t===void 0&&(t=-1),this.throwIfDisposed(),P.softmax(this,t)},r.prototype.logSoftmax=function(t){return t===void 0&&(t=-1),this.throwIfDisposed(),P.logSoftmax(this,t)},r.prototype.resizeBilinear=function(t,e){return e===void 0&&(e=!1),this.throwIfDisposed(),P.image.resizeBilinear(this,t,e)},r.prototype.resizeNearestNeighbor=function(t,e){return e===void 0&&(e=!1),this.throwIfDisposed(),P.image.resizeNearestNeighbor(this,t,e)},r.prototype.conv1d=function(t,e,n,a,o,i){return a===void 0&&(a="NWC"),o===void 0&&(o=1),this.throwIfDisposed(),P.conv1d(this,t,e,n,a,o,i)},r.prototype.conv2d=function(t,e,n,a,o,i){return a===void 0&&(a="NHWC"),o===void 0&&(o=[1,1]),this.throwIfDisposed(),P.conv2d(this,t,e,n,a,o,i)},r.prototype.conv2dTranspose=function(t,e,n,a,o){return this.throwIfDisposed(),P.conv2dTranspose(this,t,e,n,a,o)},r.prototype.depthwiseConv2D=function(t,e,n,a,o,i){return a===void 0&&(a="NHWC"),o===void 0&&(o=[1,1]),this.throwIfDisposed(),P.depthwiseConv2d(this,t,e,n,a,o,i)},r.prototype.separableConv2d=function(t,e,n,a,o,i){return o===void 0&&(o=[1,1]),i===void 0&&(i="NHWC"),this.throwIfDisposed(),P.separableConv2d(this,t,e,n,a,o,i)},r.prototype.avgPool=function(t,e,n,a){return this.throwIfDisposed(),P.avgPool(this,t,e,n,a)},r.prototype.maxPool=function(t,e,n,a){return this.throwIfDisposed(),P.maxPool(this,t,e,n,a)},r.prototype.localResponseNormalization=function(t,e,n,a){return t===void 0&&(t=5),e===void 0&&(e=1),n===void 0&&(n=1),a===void 0&&(a=.5),P.localResponseNormalization(this,t,e,n,a)},r.prototype.pool=function(t,e,n,a,o){return this.throwIfDisposed(),P.pool(this,t,e,n,a,o)},r.prototype.variable=function(t,e,n){return t===void 0&&(t=!0),this.throwIfDisposed(),It().makeVariable(this,t,e,n)},r.prototype.unsortedSegmentSum=function(t,e){return this.throwIfDisposed(),P.unsortedSegmentSum(this,t,e)},r.prototype.batchToSpaceND=function(t,e){return this.throwIfDisposed(),P.batchToSpaceND(this,t,e)},r.prototype.spaceToBatchND=function(t,e){return this.throwIfDisposed(),P.spaceToBatchND(this,t,e)},r.prototype.topk=function(t,e){return t===void 0&&(t=1),e===void 0&&(e=!0),this.throwIfDisposed(),P.topk(this,t,e)},r.prototype.stridedSlice=function(t,e,n,a,o,i,s,u){return a===void 0&&(a=0),o===void 0&&(o=0),i===void 0&&(i=0),s===void 0&&(s=0),u===void 0&&(u=0),this.throwIfDisposed(),P.stridedSlice(this,t,e,n,a,o,i,s,u)},r.prototype.depthToSpace=function(t,e){return this.throwIfDisposed(),P.depthToSpace(this,t,e)},r.prototype.fft=function(){return this.throwIfDisposed(),P.spectral.fft(this)},r.prototype.ifft=function(){return this.throwIfDisposed(),P.spectral.ifft(this)},r.prototype.rfft=function(){return this.throwIfDisposed(),P.spectral.rfft(this)},r.prototype.irfft=function(){return this.throwIfDisposed(),P.spectral.irfft(this)},r})();Object.defineProperty(Se,Symbol.hasInstance,{value:function(r){return!!r&&r.dataId!=null&&r.shape!=null&&r.dtype!=null}});var Pi,so,uo,co,lo,Hn=(function(r){function t(e,n,a,o){var i=r.call(this,e.shape,e.dtype,e.dataId,o)||this;return i.trainable=n,i.name=a,i}return bt(t,r),t.prototype.assign=function(e){if(e.dtype!==this.dtype)throw new Error("dtype of the new value ("+e.dtype+") and previous value ("+this.dtype+") must match");if(!ze(e.shape,this.shape))throw new Error("shape of the new value ("+e.shape+") and previous value ("+this.shape+") must match");It().disposeTensor(this),this.dataId=e.dataId,It().incRef(this,null)},t.prototype.dispose=function(){It().disposeVariable(this),this.isDisposedInternal=!0},t})(Se);Object.defineProperty(Hn,Symbol.hasInstance,{value:function(r){return r instanceof Se&&r.assign!=null&&r.assign instanceof Function}}),(function(r){r.R0="R0",r.R1="R1",r.R2="R2",r.R3="R3",r.R4="R4",r.R5="R5",r.R6="R6"})(Pi||(Pi={})),(function(r){r.float32="float32",r.int32="int32",r.bool="int32",r.complex64="complex64"})(so||(so={})),(function(r){r.float32="float32",r.int32="int32",r.bool="bool",r.complex64="complex64"})(uo||(uo={})),(function(r){r.float32="float32",r.int32="float32",r.bool="float32",r.complex64="complex64"})(co||(co={})),(function(r){r.float32="complex64",r.int32="complex64",r.bool="complex64",r.complex64="complex64"})(lo||(lo={}));var Il={float32:co,int32:so,bool:uo,complex64:lo};function He(r,t){if(r==="string"||t==="string"){if(r==="string"&&t==="string")return"string";throw new Error("Can not upcast "+r+" with "+t)}return Il[r][t]}function Sa(r){return He(r,"int32")}function Ae(r,t){if(r.dtype===t.dtype)return[r,t];var e=He(r.dtype,t.dtype);return[r.cast(e),t.cast(e)]}function Sl(r,t){E(r.dtype===t.dtype,(function(){return"The dtypes of the first("+r.dtype+") and second("+t.dtype+") input must match"}))}function Js(r){var t=[];return(function e(n,a,o){if(n!=null){if(n instanceof Se)return void a.push(n);if(i=n,!(!Array.isArray(i)&&typeof i!="object")){var i,s=n;for(var u in s){var c=s[u];o.has(c)||(o.add(c),e(c,a,o))}}}})(r,t,new Set),t}var Da,Mi=(function(){function r(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null}}return r.prototype.dispose=function(){for(var t in this.registeredVariables)this.registeredVariables[t].dispose()},r})(),Dl=(function(){function r(t){this.ENV=t,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new Mi}return r.prototype.ready=function(){return $(this,void 0,void 0,(function(){var t,e,n;return Y(this,(function(a){switch(a.label){case 0:if(this.pendingBackendInit!=null)return[2,this.pendingBackendInit.then((function(){}))];if(this.backendInstance!=null)return[2];t=this.getSortedBackends(),e=0,a.label=1;case 1:return e<t.length?(n=t[e],[4,this.initializeBackend(n).success]):[3,5];case 2:return a.sent()?[4,this.setBackend(n)]:[3,4];case 3:return a.sent(),[2];case 4:return e++,[3,1];case 5:throw new Error("Could not initialize any backends, all backend initializations failed.")}}))}))},Object.defineProperty(r.prototype,"backend",{get:function(){if(this.pendingBackendInit!=null)throw new Error("Backend '"+this.backendName+"' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods");if(this.backendInstance==null){var t=this.initializeBackendsAndReturnBest(),e=t.name;if(t.asyncInit)throw new Error("The highest priority backend '"+e+"' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods");this.setBackend(e)}return this.backendInstance},enumerable:!0,configurable:!0}),r.prototype.backendNames=function(){return Object.keys(this.registryFactory)},r.prototype.findBackend=function(t){return!(t in this.registry)&&(!(t in this.registryFactory)||this.initializeBackend(t).asyncInit)?null:this.registry[t]},r.prototype.findBackendFactory=function(t){return t in this.registryFactory?this.registryFactory[t].factory:null},r.prototype.registerBackend=function(t,e,n){return n===void 0&&(n=1),t in this.registryFactory?(console.warn(t+" backend was already registered. Reusing existing backend factory."),!1):(this.registryFactory[t]={factory:e,priority:n},!0)},r.prototype.setBackend=function(t){return $(this,void 0,void 0,(function(){var e,n,a;return Y(this,(function(o){switch(o.label){case 0:if(this.registryFactory[t]==null)throw new Error("Backend name '"+t+"' not found in registry");return this.backendName=t,this.registry[t]!=null?[3,4]:(this.backendInstance=null,e=this.initializeBackend(t),n=e.success,e.asyncInit?[4,n]:[3,2]);case 1:return a=o.sent(),[3,3];case 2:a=n,o.label=3;case 3:if(!a)return[2,!1];o.label=4;case 4:return this.backendInstance=this.registry[t],this.setupRegisteredKernels(),this.profiler=new El(this.backendInstance),[2,!0]}}))}))},r.prototype.setupRegisteredKernels=function(){var t=this;Di(this.backendName).forEach((function(e){e.setupFunc!=null&&e.setupFunc(t.backendInstance)}))},r.prototype.disposeRegisteredKernels=function(t){var e=this;Di(t).forEach((function(n){n.disposeFunc!=null&&n.disposeFunc(e.registry[t])}))},r.prototype.initializeBackend=function(t){var e=this,n=this.registryFactory[t];if(n==null)throw new Error("Cannot initialize backend "+t+", no registration found.");try{var a=n.factory();if(Promise.resolve(a)===a){var o=++this.pendingBackendInitId,i=a.then((function(s){return!(o<e.pendingBackendInitId)&&(e.registry[t]=s,e.pendingBackendInit=null,!0)})).catch((function(s){return!(o<e.pendingBackendInitId)&&(e.pendingBackendInit=null,console.warn("Initialization of backend "+t+" failed"),console.warn(s.stack||s.message),!1)}));return this.pendingBackendInit=i,{success:i,asyncInit:!0}}return this.registry[t]=a,{success:!0,asyncInit:!1}}catch(s){return console.warn("Initialization of backend "+t+" failed"),console.warn(s.stack||s.message),{success:!1,asyncInit:!1}}},r.prototype.removeBackend=function(t){if(!(t in this.registryFactory))throw new Error(t+" backend not found in registry");this.backendName===t&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,t in this.registry&&(this.disposeRegisteredKernels(t),this.registry[t].dispose(),delete this.registry[t]),delete this.registryFactory[t],this.backendName===t&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)},r.prototype.getSortedBackends=function(){var t=this;if(Object.keys(this.registryFactory).length===0)throw new Error("No backend found in registry.");return Object.keys(this.registryFactory).sort((function(e,n){return t.registryFactory[n].priority-t.registryFactory[e].priority}))},r.prototype.initializeBackendsAndReturnBest=function(){for(var t=this.getSortedBackends(),e=0;e<t.length;e++){var n=t[e],a=this.initializeBackend(n),o=a.success,i=a.asyncInit;if(i||o)return{name:n,asyncInit:i}}throw new Error("Could not initialize any backends, all backend initializations failed.")},r.prototype.moveData=function(t,e){var n=this.state.tensorInfo.get(e),a=n.backend,o=this.readSync(e);a.disposeData(e),n.backend=t,t.move(e,o,n.shape,n.dtype),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++},r.prototype.tidy=function(t,e){var n,a=this,o=null;if(e==null){if(typeof t!="function")throw new Error("Please provide a function to tidy()");e=t}else{if(typeof t!="string"&&!(t instanceof String))throw new Error("When calling with two arguments, the first argument to tidy() must be a string");if(typeof e!="function")throw new Error("When calling with two arguments, the 2nd argument to tidy() must be a function");o=t}return this.scopedRun((function(){return a.startScope(o)}),(function(){return a.endScope(n)}),(function(){return(n=e())instanceof Promise&&console.error("Cannot return a Promise inside of tidy."),n}))},r.prototype.scopedRun=function(t,e,n){t();try{var a=n();return e(),a}catch(o){throw e(),o}},r.prototype.nextTensorId=function(){return r.nextTensorId++},r.prototype.nextVariableId=function(){return r.nextVariableId++},r.prototype.clone=function(t){var e=this.makeTensorFromDataId(t.dataId,t.shape,t.dtype),n={x:t};return this.addTapeNode(this.state.activeScope.name,n,[e],(function(a){return{x:function(){return a.toFloat()}}}),[]),e},r.prototype.runKernel=function(t,e,n,a,o){return this.runKernelFunc(null,e,null,t,n,a,o)},r.prototype.shouldCheckForMemLeaks=function(){return this.ENV.getBool("IS_TEST")},r.prototype.checkKernelForMemLeak=function(t,e,n){var a=this.backend.numDataIds(),o=0;n.forEach((function(u){o+=u.dtype==="complex64"?3:1}));var i=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],s=a-e-o-i;if(s>0)throw new Error("Backend '"+this.backendName+"' has an internal memory leak ("+s+" data ids) after running '"+t+"'")},r.prototype.runKernelFunc=function(t,e,n,a,o,i,s){var u,c=this;i===void 0&&(i=[]),s===void 0&&(s=[]);var l=[],h=this.isTapeOn();a==null&&(a=this.state.activeScope!=null?this.state.activeScope.name:"");var f,p=function(x){h&&(l=x.map((function(b){return c.keep(c.clone(b))})))},d=this.state.numBytes,m=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);var v,g=zs(a,this.backendName);return f=g!=null?function(){var x=c.backend.numDataIds();v=g.kernelFunc({inputs:e,attrs:o,backend:c.backend});var b=Array.isArray(v)?v:[v];c.shouldCheckForMemLeaks()&&c.checkKernelForMemLeak(a,x,b);var y=b.map((function(C){var S=C.dataId,I=C.shape,k=C.dtype;return c.makeTensorFromDataId(S,I,k)})),w=y.filter((function(C,S){return s[S]}));return p((i||[]).slice().concat(w)),y}:function(){var x=c.backend.numDataIds();v=c.tidy((function(){return t(c.backend,p)}));var b=Array.isArray(v)?v:[v];return c.shouldCheckForMemLeaks()&&c.checkKernelForMemLeak(a,x,b),b},this.scopedRun((function(){return c.state.kernelDepth++}),(function(){return c.state.kernelDepth--}),(function(){u=c.ENV.getBool("DEBUG")?c.profiler.profileKernel(a,e,(function(){return f()})):f()})),h&&this.addTapeNode(a,e,u,n,l),this.state.profiling&&this.state.activeProfile.kernels.push({name:a,bytesAdded:this.state.numBytes-d,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-m,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(e).map((function(x){return e[x].shape})),outputShapes:u.map((function(x){return x.shape}))}),Array.isArray(v)?u:u[0]},r.prototype.makeTensor=function(t,e,n,a){if(t==null)throw new Error("Values passed to engine.makeTensor() are null");n=n||"float32",a=a||this.backend;var o=t;n==="string"&&Ro(t[0])&&(o=t.map((function(l){return Cl(l)})));var i=a.write(o,e,n),s=new Se(e,n,i,this.nextTensorId());if(this.incRef(s,a),n==="string"){var u=this.state.tensorInfo.get(i),c=xl(o);this.state.numBytes+=c-u.bytes,u.bytes=c}return s},r.prototype.makeTensorFromDataId=function(t,e,n,a){var o=new Se(e,n=n||"float32",t,this.nextTensorId());return this.incRef(o,a),o},r.prototype.makeVariable=function(t,e,n,a){e===void 0&&(e=!0),n=n||this.nextVariableId().toString(),a!=null&&a!==t.dtype&&(t=t.asType(a));var o=new Hn(t,e,n,this.nextTensorId());if(this.state.registeredVariables[o.name]!=null)throw new Error("Variable with name "+o.name+" was already registered");return this.state.registeredVariables[o.name]=o,this.incRef(o,this.backend),o},r.prototype.incRef=function(t,e){var n=this.state.tensorInfo.has(t.dataId)?this.state.tensorInfo.get(t.dataId).refCount:0;if(this.state.numTensors++,t.dtype==="string"&&this.state.numStringTensors++,n===0){this.state.numDataBuffers++;var a=0;t.dtype!=="complex64"&&t.dtype!=="string"&&(a=t.size*js(t.dtype)),this.state.tensorInfo.set(t.dataId,{backend:e||this.backend,dtype:t.dtype,shape:t.shape,bytes:a,refCount:0}),this.state.numBytes+=a}this.state.tensorInfo.get(t.dataId).refCount++,t instanceof Hn||this.track(t)},r.prototype.disposeTensor=function(t){if(this.state.tensorInfo.has(t.dataId)){this.state.numTensors--,t.dtype==="string"&&this.state.numStringTensors--;var e=this.state.tensorInfo.get(t.dataId);e.refCount<=1?(t.dtype!=="complex64"&&(this.state.numBytes-=e.bytes),this.state.numDataBuffers--,e.backend.disposeData(t.dataId),this.state.tensorInfo.delete(t.dataId)):this.state.tensorInfo.get(t.dataId).refCount--}},r.prototype.disposeVariables=function(){for(var t in this.state.registeredVariables){var e=this.state.registeredVariables[t];this.disposeVariable(e)}},r.prototype.disposeVariable=function(t){this.disposeTensor(t),this.state.registeredVariables[t.name]!=null&&delete this.state.registeredVariables[t.name]},r.prototype.memory=function(){var t=this.backend.memory();return t.numTensors=this.state.numTensors,t.numDataBuffers=this.state.numDataBuffers,t.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(t.unreliable=!0,t.reasons==null&&(t.reasons=[]),t.reasons.push("Memory usage by string tensors is approximate (2 bytes per character)")),t},r.prototype.profile=function(t){return $(this,void 0,void 0,(function(){var e,n;return Y(this,(function(a){return this.state.profiling=!0,e=this.state.numBytes,n=this.state.numTensors,this.state.activeProfile.kernels=[],this.state.activeProfile.result=t(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max.apply(Math,this.state.activeProfile.kernels.map((function(o){return o.totalBytesSnapshot}))),this.state.activeProfile.newBytes=this.state.numBytes-e,this.state.activeProfile.newTensors=this.state.numTensors-n,[2,this.state.activeProfile]}))}))},r.prototype.isTapeOn=function(){return this.state.gradientDepth>0&&this.state.kernelDepth===0},r.prototype.addTapeNode=function(t,e,n,a,o){var i=this,s={id:this.state.nextTapeNodeId++,kernelName:t,inputs:e,outputs:n,saved:o},u=hl(t);u!=null&&(a=u.gradFunc),a!=null&&(s.gradient=function(c){return c=c.map((function(l,h){if(l==null){var f=n[h],p=lr(f.size,f.dtype);return i.makeTensor(p,f.shape,f.dtype)}return l})),a(c.length>1?c:c[0],o)}),this.state.activeTape.push(s)},r.prototype.keep=function(t){return t.kept=!0,t},r.prototype.startTape=function(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++},r.prototype.endTape=function(){this.state.gradientDepth--},r.prototype.startScope=function(t){var e={track:[],name:"unnamed scope",id:this.state.nextScopeId++};t&&(e.name=t),this.state.scopeStack.push(e),this.state.activeScope=e},r.prototype.endScope=function(t){for(var e=this,n=Js(t),a=new Set(n.map((function(u){return u.id}))),o=0;o<this.state.activeScope.track.length;o++){var i=this.state.activeScope.track[o];i.kept||a.has(i.id)||i.dispose()}var s=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],n.forEach((function(u){u.kept||u.scopeId!==s.id||e.track(u)}))},r.prototype.gradients=function(t,e,n,a){var o=this;if(a===void 0&&(a=!1),E(e.length>0,(function(){return"gradients() received an empty list of xs."})),n!=null&&n.dtype!=="float32")throw new Error("dy must have 'float32' dtype, but has '"+n.dtype+"'");var i=this.scopedRun((function(){return o.startTape()}),(function(){return o.endTape()}),(function(){return o.tidy("forward",t)}));E(i instanceof Se,(function(){return"The result y returned by f() must be a tensor."}));var s=(function(u,c,l){for(var h={},f={},p=0;p<c.length;p++)h[c[p].id]=!0;for(p=0;p<u.length;p++){var d=(C=u[p]).inputs;for(var m in d){for(var v=d[m],g=!1,x=0;x<c.length;x++)if(h[v.id]){C.outputs.forEach((function(R){return h[R.id]=!0})),g=!0,f[C.id]=!0;break}if(g)break}}var b={};b[l.id]=!0;var y={};for(p=u.length-1;p>=0;p--)for(d=(C=u[p]).inputs,x=0;x<C.outputs.length;x++)if(b[C.outputs[x].id]){for(var m in d)b[d[m].id]=!0,y[C.id]=!0;break}var w=[];for(p=0;p<u.length;p++){var C;if(f[(C=u[p]).id]&&y[C.id]){var S={};for(var m in C.inputs){var I=C.inputs[m];h[I.id]&&(S[m]=I)}var k=Object.assign({},C);k.inputs=S,k.outputs=C.outputs,w.push(k)}}return w})(this.state.activeTape,e,i);if(!a&&s.length===0&&e.length>0)throw new Error("Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.");return this.tidy("backward",(function(){var u,c,l={};l[i.id]=n??(u=i.shape,c=Ks(Q(u),"float32"),T.makeTensor(c,u,"float32")),(function(f,p,d){for(var m=function(g){var x=p[g],b=[];if(x.outputs.forEach((function(S){var I=f[S.id];I!=null?b.push(I):b.push(null)})),x.gradient==null)throw new Error("Cannot compute gradient: gradient function not found for "+x.kernelName+".");var y=x.gradient(b),w=function(S){if(!(S in y))throw new Error("Cannot backprop through input "+S+". Available gradients found: "+Object.keys(y)+".");var I=d((function(){return y[S]()}));if(I.dtype!=="float32")throw new Error("Error in gradient for op "+x.kernelName+". The gradient of input "+S+" must have 'float32' dtype, but has '"+I.dtype+"'");var k=x.inputs[S];if(!ze(I.shape,k.shape))throw new Error("Error in gradient for op "+x.kernelName+". The gradient of input '"+S+"' has shape '"+I.shape+"', which does not match the shape of the input '"+k.shape+"'");if(f[k.id]==null)f[k.id]=I;else{var R=f[k.id];f[k.id]=R.add(I),R.dispose()}};for(var C in x.inputs)w(C)},v=p.length-1;v>=0;v--)m(v)})(l,s,(function(f){return o.tidy(f)}));var h=e.map((function(f){return l[f.id]}));return o.state.gradientDepth===0&&(o.state.activeTape.forEach((function(f){for(var p=0,d=f.saved;p<d.length;p++)d[p].dispose()})),o.state.activeTape=null),{value:i,grads:h}}))},r.prototype.customGrad=function(t){var e=this;return E(oo(t),(function(){return"The f passed in customGrad(f) must be a function."})),function(){for(var n,a=[],o=0;o<arguments.length;o++)a[o]=arguments[o];E(a.every((function(s){return s instanceof Se})),(function(){return"The args passed in customGrad(f)(x1, x2,...) must all be tensors"}));var i={};return a.forEach((function(s,u){i[u]=s})),e.runKernelFunc((function(s,u){return E((n=t.apply(void 0,a.concat([u]))).value instanceof Se,(function(){return"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"})),E(oo(n.gradFunc),(function(){return"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."})),n.value}),i,(function(s,u){var c=n.gradFunc(s,u),l=Array.isArray(c)?c:[c];E(l.length===a.length,(function(){return"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."})),E(l.every((function(f){return f instanceof Se})),(function(){return"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors."}));var h={};return l.forEach((function(f,p){h[p]=function(){return f}})),h}))}},r.prototype.readSync=function(t){return this.state.tensorInfo.get(t).backend.readSync(t)},r.prototype.read=function(t){return this.state.tensorInfo.get(t).backend.read(t)},r.prototype.time=function(t){return $(this,void 0,void 0,(function(){var e,n;return Y(this,(function(a){switch(a.label){case 0:return e=Rt(),[4,this.backend.time(t)];case 1:return(n=a.sent()).wallMs=Rt()-e,[2,n]}}))}))},r.prototype.track=function(t){return this.state.activeScope!=null&&(t.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(t)),t},Object.defineProperty(r.prototype,"registeredVariables",{get:function(){return this.state.registeredVariables},enumerable:!0,configurable:!0}),r.prototype.reset=function(){for(var t in this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new Mi,this.registry)this.disposeRegisteredKernels(t),this.registry[t].dispose(),delete this.registry[t];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null},r.nextTensorId=0,r.nextVariableId=0,r})(),T=(function(){var r=(function(){if(Da==null){var e=void 0;if(typeof window<"u")e=window;else if(typeof global<"u")e=global;else if(typeof process<"u")e=process;else{if(typeof self>"u")throw new Error("Could not find a global object");e=self}Da=e}return Da})();if(r._tfengine==null){var t=new cl(r);r._tfengine=new Dl(t)}return(function(e){Us=e})(r._tfengine.ENV),It=function(){return r._tfengine},r._tfengine})();function Qs(){return typeof window<"u"&&window.document!=null||typeof WorkerGlobalScope<"u"}var zt=B();zt.registerFlag("DEBUG",(function(){return!1}),(function(r){r&&console.warn("Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.")})),zt.registerFlag("IS_BROWSER",(function(){return Qs()})),zt.registerFlag("IS_NODE",(function(){return typeof process<"u"&&process.versions!==void 0&&process.versions.node!==void 0})),zt.registerFlag("IS_CHROME",(function(){return typeof navigator<"u"&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor)})),zt.registerFlag("PROD",(function(){return!1})),zt.registerFlag("TENSORLIKE_CHECK_SHAPE_CONSISTENCY",(function(){return zt.getBool("DEBUG")})),zt.registerFlag("DEPRECATION_WARNINGS_ENABLED",(function(){return!0})),zt.registerFlag("IS_TEST",(function(){return!1}));var ar,ct,ut,hn={},Aa={alpha:!1,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,depth:!1,stencil:!1,failIfMajorPerformanceCaveat:!0};function Al(r,t){hn[r]=t}function Pt(r){r in hn||(hn[r]=(function(e){if(e!==1&&e!==2)throw new Error("Cannot get WebGL rendering context, WebGL is disabled.");var n=(function(a){if(typeof OffscreenCanvas<"u"&&a===2)return new OffscreenCanvas(300,150);if(typeof document<"u")return document.createElement("canvas");throw new Error("Cannot create a canvas in this context")})(e);return n.addEventListener("webglcontextlost",(function(a){a.preventDefault(),delete hn[e]}),!1),e===1?n.getContext("webgl",Aa)||n.getContext("experimental-webgl",Aa):n.getContext("webgl2",Aa)})(r));var t=hn[r];return t.isContextLost()?(delete hn[r],Pt(r)):(t.disable(t.DEPTH_TEST),t.disable(t.STENCIL_TEST),t.disable(t.BLEND),t.disable(t.DITHER),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SAMPLE_COVERAGE),t.enable(t.SCISSOR_TEST),t.enable(t.CULL_FACE),t.cullFace(t.BACK),hn[r])}function sa(r,t){return[t,r]}function Zn(r){var t=Q(r);return ao(Math.ceil(t/4))}function hr(r,t){return[Math.max(1,Math.ceil(t/2)),Math.max(1,Math.ceil(r/2))]}function Io(r,t){var e,n,a,o,i,s,u,c,l,h=r;return B().getNumber("WEBGL_VERSION")===2?(e=h.R32F,n=h.R16F,a=h.RGBA16F,o=h.RGBA32F,i=h.RED,s=4,u=1,c=h.HALF_FLOAT,l=h.FLOAT):(e=r.RGBA,n=r.RGBA,a=r.RGBA,o=h.RGBA,i=r.RGBA,s=4,u=4,c=t!=null?t.HALF_FLOAT_OES:null,l=r.FLOAT),{internalFormatFloat:e,internalFormatHalfFloat:n,internalFormatPackedHalfFloat:a,internalFormatPackedFloat:o,textureFormatFloat:i,downloadTextureFormat:r.RGBA,downloadUnpackNumChannels:s,defaultNumChannels:u,textureTypeHalfFloat:c,textureTypeFloat:l}}function ee(r,t,e){var n=e();return t&&(function(a){var o=a.getError();if(o!==a.NO_ERROR)throw new Error("WebGL Error: "+Pl(a,o))})(r),n}(function(r){r[r.DENSE=0]="DENSE",r[r.SHARED_BATCH=1]="SHARED_BATCH"})(ar||(ar={})),(function(r){r[r.RENDER=0]="RENDER",r[r.UPLOAD=1]="UPLOAD",r[r.PIXELS=2]="PIXELS",r[r.DOWNLOAD=3]="DOWNLOAD"})(ct||(ct={})),(function(r){r[r.UNPACKED_FLOAT16=0]="UNPACKED_FLOAT16",r[r.UNPACKED_FLOAT32=1]="UNPACKED_FLOAT32",r[r.PACKED_4X1_UNSIGNED_BYTE=2]="PACKED_4X1_UNSIGNED_BYTE",r[r.PACKED_2X2_FLOAT32=3]="PACKED_2X2_FLOAT32",r[r.PACKED_2X2_FLOAT16=4]="PACKED_2X2_FLOAT16"})(ut||(ut={}));var Tl=596e-10,Nl=65504;function Fl(r){return!!(B().getBool("WEBGL_RENDER_FLOAT32_ENABLED")||r===0||Tl<Math.abs(r)&&Math.abs(r)<Nl)}function Pl(r,t){switch(t){case r.NO_ERROR:return"NO_ERROR";case r.INVALID_ENUM:return"INVALID_ENUM";case r.INVALID_VALUE:return"INVALID_VALUE";case r.INVALID_OPERATION:return"INVALID_OPERATION";case r.INVALID_FRAMEBUFFER_OPERATION:return"INVALID_FRAMEBUFFER_OPERATION";case r.OUT_OF_MEMORY:return"OUT_OF_MEMORY";case r.CONTEXT_LOST_WEBGL:return"CONTEXT_LOST_WEBGL";default:return"Unknown error code "+t}}function wr(r,t,e){return Ht(r,t,(function(){return r.getExtension(e)}),'Extension "'+e+'" not supported on this browser.')}function Ml(r,t,e){var n=Ht(r,t,(function(){return r.createShader(r.VERTEX_SHADER)}),"Unable to create vertex WebGLShader.");if(ee(r,t,(function(){return r.shaderSource(n,e)})),ee(r,t,(function(){return r.compileShader(n)})),r.getShaderParameter(n,r.COMPILE_STATUS)===!1)throw console.log(r.getShaderInfoLog(n)),new Error("Failed to compile vertex shader.");return n}function Ol(r,t,e){var n=Ht(r,t,(function(){return r.createShader(r.FRAGMENT_SHADER)}),"Unable to create fragment WebGLShader.");if(ee(r,t,(function(){return r.shaderSource(n,e)})),ee(r,t,(function(){return r.compileShader(n)})),r.getShaderParameter(n,r.COMPILE_STATUS)===!1)throw(function(a,o){var i=Bl.exec(o);if(i==null)return console.log("Couldn't parse line number in error: "+o),void console.log(a);for(var s=+i[1],u=a.split(`
`),c=u.length.toString().length+2,l=u.map((function(v,g){return Mn((g+1).toString(),c)+v})),h=0,f=0;f<l.length;f++)h=Math.max(l[f].length,h);var p=l.slice(0,s-1),d=l.slice(s-1,s),m=l.slice(s);console.log(p.join(`
`)),console.log(o.split(`
`)[0]),console.log("%c "+Mn(d[0],h),"border:1px solid red; background-color:#e3d2d2; color:#a61717"),console.log(m.join(`
`))})(e,r.getShaderInfoLog(n)),new Error("Failed to compile fragment shader.");return n}var Ta,Na,Bl=/ERROR: [0-9]+:([0-9]+):/g;function Ll(r,t){return Ht(r,t,(function(){return r.createProgram()}),"Unable to create WebGLProgram.")}function Wl(r,t,e){if(ee(r,t,(function(){return r.linkProgram(e)})),r.getProgramParameter(e,r.LINK_STATUS)===!1)throw console.log(r.getProgramInfoLog(e)),new Error("Failed to link vertex and fragment shaders.")}function Fa(r,t,e){if(ee(r,t,(function(){return r.validateProgram(e)})),r.getProgramParameter(e,r.VALIDATE_STATUS)===!1)throw console.log(r.getProgramInfoLog(e)),new Error("Shader program validation failed.")}function Ul(r,t,e){var n=Ht(r,t,(function(){return r.createBuffer()}),"Unable to create WebGLBuffer");return ee(r,t,(function(){return r.bindBuffer(r.ARRAY_BUFFER,n)})),ee(r,t,(function(){return r.bufferData(r.ARRAY_BUFFER,e,r.STATIC_DRAW)})),n}function zl(r,t,e){var n=Ht(r,t,(function(){return r.createBuffer()}),"Unable to create WebGLBuffer");return ee(r,t,(function(){return r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,n)})),ee(r,t,(function(){return r.bufferData(r.ELEMENT_ARRAY_BUFFER,e,r.STATIC_DRAW)})),n}function Vl(r,t){return Ht(r,t,(function(){return r.createTexture()}),"Unable to create WebGLTexture.")}function Gl(r,t){var e=B().getNumber("WEBGL_MAX_TEXTURE_SIZE");if(r<=0||t<=0){var n="["+r+"x"+t+"]";throw new Error("Requested texture size "+n+" is invalid.")}if(r>e||t>e)throw n="["+r+"x"+t+"]",new Error("Requested texture size "+n+" greater than WebGL maximum on this browser / GPU "+("["+e+"x"+e+"]")+".")}function Hl(r,t){return Ht(r,t,(function(){return r.createFramebuffer()}),"Unable to create WebGLFramebuffer.")}function Oi(r,t,e,n,a,o,i,s){var u=r.getAttribLocation(e,n);return u!==-1&&(ee(r,t,(function(){return r.bindBuffer(r.ARRAY_BUFFER,a)})),ee(r,t,(function(){return r.vertexAttribPointer(u,o,r.FLOAT,!1,i,s)})),ee(r,t,(function(){return r.enableVertexAttribArray(u)})),!0)}function jl(r,t,e,n){Yl(r,n),ee(r,t,(function(){return r.activeTexture(r.TEXTURE0+n)})),ee(r,t,(function(){return r.bindTexture(r.TEXTURE_2D,e)}))}function ql(r,t,e,n){return Ht(r,t,(function(){return r.getUniformLocation(e,n)}),'uniform "'+n+'" not present in program.')}function Kl(r,t,e){return r.getUniformLocation(t,e)}function Xl(r,t,e,n,a,o){ee(r,t,(function(){return jl(r,t,n,o)})),ee(r,t,(function(){return r.uniform1i(a,o)}))}function Pa(r,t,e,n){ee(r,t,(function(){return r.bindFramebuffer(r.FRAMEBUFFER,n)})),ee(r,t,(function(){return r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,e,0)}))}function Bi(r,t,e){ee(r,t,(function(){return r.bindFramebuffer(r.FRAMEBUFFER,e)})),ee(r,t,(function(){return r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,null,0)}))}function Cr(r){var t=r.checkFramebufferStatus(r.FRAMEBUFFER);if(t!==r.FRAMEBUFFER_COMPLETE)throw new Error("Error binding framebuffer: "+$l(r,t))}function $l(r,t){switch(t){case r.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_ATTACHMENT";case r.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";case r.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:return"FRAMEBUFFER_INCOMPLETE_DIMENSIONS";case r.FRAMEBUFFER_UNSUPPORTED:return"FRAMEBUFFER_UNSUPPORTED";default:return"unknown error "+t}}function Ht(r,t,e,n){var a=ee(r,t,(function(){return e()}));if(a==null)throw new Error(n);return a}function Yl(r,t){var e=r.MAX_COMBINED_TEXTURE_IMAGE_UNITS-1,n=t+r.TEXTURE0;if(n<r.TEXTURE0||n>e)throw new Error("textureUnit must be in "+("[gl.TEXTURE0, gl.TEXTURE"+e+"]")+".")}function Ur(r,t){return t===void 0&&(t=2),Q(r.slice(0,r.length-t))}function zr(r){if(r.length===0)throw Error("Cannot get rows and columns of an empty shape array.");return[r.length>1?r[r.length-2]:1,r[r.length-1]]}function Ma(r){var t=[1,1,1];return r.length===0||r.length===1&&r[0]===1||(t=[Ur(r)].concat(zr(r))),t}function Jl(r,t){var e;t===void 0&&(t=!1);var n=B().getNumber("WEBGL_MAX_TEXTURE_SIZE");if(t&&(n*=2,(r=r.map((function(c,l){return l>=r.length-2?Hs(r[l]):r[l]}))).length===1&&(r=[2,r[0]])),r.length!==2){var a=pn(r);r=a.newShape}var o=Q(r);if(r.length<=1&&o<=n)return[1,o];if(r.length===2&&r[0]<=n&&r[1]<=n)return r;if(r.length===3&&r[0]*r[1]<=n&&r[2]<=n)return[r[0]*r[1],r[2]];if(r.length===3&&r[0]<=n&&r[1]*r[2]<=n)return[r[0],r[1]*r[2]];if(r.length===4&&r[0]*r[1]*r[2]<=n&&r[3]<=n)return[r[0]*r[1]*r[2],r[3]];if(r.length===4&&r[0]<=n&&r[1]*r[2]*r[3]<=n)return[r[0],r[1]*r[2]*r[3]];if(t){var i=Ur(r),s=2,u=2;return r.length&&(s=(e=zr(r))[0],u=e[1]),ao(o=i*(s/2)*(u/2)).map((function(c){return 2*c}))}return ao(o)}function _r(r){return r%2==0}function Er(r,t){if(ze(r=r.slice(-2),t=t.slice(-2))||!r.length||!t.length||r[0]===0||r[1]===0||t[0]===0||t[1]===0)return!0;if(r.length!==t.length){var e=r.slice(-1)[0],n=t.slice(-1)[0];if(e===n||_r(e)&&_r(n)&&(r[0]===1||t[0]===1))return!0}return r[1]===t[1]&&_r(r[0])&&_r(t[0])}function Ql(r){if(Ta==null){var t=Pt(r);Ta=t.getParameter(t.MAX_TEXTURE_SIZE)}return Ta}function Zl(r){if(Na==null){var t=Pt(r);Na=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS)}return Math.min(16,Na)}function eh(r){if(r===0)return 0;var t=Pt(r);return vt(t,"EXT_disjoint_timer_query_webgl2")&&r===2?2:vt(t,"EXT_disjoint_timer_query")?1:0}function vt(r,t){return r.getExtension(t)!=null}function Li(r){try{if(Pt(r)!=null)return!0}catch{return!1}return!1}function th(r){if(r===0)return!1;var t=Pt(r);if(r===1){if(!vt(t,"OES_texture_float"))return!1}else if(!vt(t,"EXT_color_buffer_float"))return!1;return ho(t)}function nh(r){if(r===0)return!1;var t=Pt(r);if(r!==1){if(vt(t,"EXT_color_buffer_float"))return ho(t);if(vt(t,"EXT_color_buffer_half_float")){var e=t.getExtension("EXT_color_buffer_half_float");return(function(n,a){var o=Io(n,a),i=n.createTexture();n.bindTexture(n.TEXTURE_2D,i),n.texImage2D(n.TEXTURE_2D,0,o.internalFormatHalfFloat,1,1,0,o.textureFormatFloat,o.textureTypeHalfFloat,null);var s=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,s),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,i,0);var u=n.checkFramebufferStatus(n.FRAMEBUFFER)===n.FRAMEBUFFER_COMPLETE;return n.bindTexture(n.TEXTURE_2D,null),n.bindFramebuffer(n.FRAMEBUFFER,null),n.deleteTexture(i),n.deleteFramebuffer(s),u})(t,e)}return!1}return!!vt(t,"OES_texture_float")&&!!vt(t,"WEBGL_color_buffer_float")&&ho(t)}function ho(r){var t=Io(r),e=r.createTexture();r.bindTexture(r.TEXTURE_2D,e),r.texImage2D(r.TEXTURE_2D,0,t.internalFormatFloat,1,1,0,t.textureFormatFloat,t.textureTypeFloat,null);var n=r.createFramebuffer();r.bindFramebuffer(r.FRAMEBUFFER,n),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,e,0);var a=r.checkFramebufferStatus(r.FRAMEBUFFER)===r.FRAMEBUFFER_COMPLETE;return r.bindTexture(r.TEXTURE_2D,null),r.bindFramebuffer(r.FRAMEBUFFER,null),r.deleteTexture(e),r.deleteFramebuffer(n),a}function rh(r){return r===2&&Pt(r).fenceSync!=null}var se=B();function Zs(r){B().getBool("DEPRECATION_WARNINGS_ENABLED")&&console.warn(r+" You can disable deprecation warnings with tf.disableDeprecationWarnings().")}function X(r,t){return T.tidy(r,t)}function tt(r){Js(r).forEach((function(t){return t.dispose()}))}function ah(r){return T.keep(r)}function Vr(){for(var r=[],t=0;t<arguments.length;t++)r[t]=arguments[t];B().getBool("IS_TEST")||console.warn.apply(console,r)}function sn(r,t){var e=r;if(At(r))return t==="string"?[]:[r.length];if(!Array.isArray(r))return[];for(var n=[];Array.isArray(e)||At(e)&&t!=="string";)n.push(e.length),e=e[0];return Array.isArray(r)&&B().getBool("TENSORLIKE_CHECK_SHAPE_CONSISTENCY")&&(function a(o,i,s){if(s=s||[],!Array.isArray(o)&&!At(o))return void E(i.length===0,(function(){return"Element arr["+s.join("][")+"] is a primitive, but should be an array/TypedArray of "+i[0]+" elements"}));E(i.length>0,(function(){return"Element arr["+s.join("][")+"] should be a primitive, but is an array of "+o.length+" elements"})),E(o.length===i[0],(function(){return"Element arr["+s.join("][")+"] should have "+i[0]+" elements, but has "+o.length+" elements"}));for(var u=i.slice(1),c=0;c<o.length;++c)a(o[c],u,s.concat(c))})(r,n,[]),n}function Wi(r,t,e,n){if(r!=null&&(r!=="numeric"&&r!==t||r==="numeric"&&t==="string"))throw new Error("Argument '"+e+"' passed to '"+n+"' must be "+r+" tensor, but got "+t+" tensor")}function _(r,t,e,n){if(n===void 0&&(n="numeric"),r instanceof Se)return Wi(n,r.dtype,t,e),r;var a=cr(r);if(a!=="string"&&["bool","int32","float32"].indexOf(n)>=0&&(a=n),Wi(n,a,t,e),r==null||!At(r)&&!Array.isArray(r)&&typeof r!="number"&&typeof r!="boolean"&&typeof r!="string"){var o=r==null?"null":r.constructor.name;throw new Error("Argument '"+t+"' passed to '"+e+"' must be a Tensor or TensorLike, but got '"+o+"'")}var i=sn(r,a);At(r)||Array.isArray(r)||(r=[r]);var s=a!=="string"?qs(r,a,B().getBool("DEBUG")):Gn(r,[],!0);return T.makeTensor(s,i,a)}function Gr(r,t,e,n){if(n===void 0&&(n="numeric"),!Array.isArray(r))throw new Error("Argument "+t+" passed to "+e+" must be a `Tensor[]` or `TensorLike[]`");return r.map((function(a,o){return _(a,t+"["+o+"]",e)}),n)}function eu(r,t){for(var e=0;e<r.length;++e)if(r[r.length-e-1]!==t-1-e)return!1;return!0}function oh(r,t,e){for(var n=r.length+t.length,a=[],o=0,i=0,s=0;s<n;s++)e.indexOf(s)===-1?a.push(r[o++]):a.push(t[i++]);return a}function qe(r,t){for(var e=[],n=r.length,a=0;a<n;a++)t.indexOf(a)===-1&&e.push(r[a]);return[e,t.map((function(o){return r[o]}))]}function nt(r,t){return oh(r,t.map((function(e){return 1})),t)}function st(r,t,e){E(eu(t,e),(function(){return r+" supports only inner-most axes for now. Got axes "+t+" and rank-"+e+" input."}))}function Mt(r,t){if(eu(r,t))return null;for(var e=[],n=0;n<t;++n)r.indexOf(n)===-1&&e.push(n);return r.forEach((function(a){return e.push(a)})),e}function So(r){return r.map((function(t,e){return[e,t]})).sort((function(t,e){return t[1]-e[1]})).map((function(t){return t[0]}))}function Ot(r,t){for(var e=[],n=t-r;n<t;++n)e.push(n);return e}function ih(r,t){var e=r[0].length;r.forEach((function(a,o){E(a.length===e,(function(){return"Error in concat"+e+"D: rank of tensors["+o+"] must be the same as the rank of the rest ("+e+")"}))})),E(t>=0&&t<e,(function(){return"Error in concat"+e+"D: axis must be between 0 and "+(e-1)+"."}));var n=r[0];r.forEach((function(a,o){for(var i=0;i<e;i++)E(i===t||a[i]===n[i],(function(){return"Error in concat"+e+"D: Shape of tensors["+o+"] ("+a+") does not match the shape of the rest ("+n+") along the non-concatenated axis "+o+"."}))}))}function jn(r,t){for(var e=r[0].slice(),n=1;n<r.length;n++)e[t]+=r[n][t];return e}function D(r){var t=Object.keys(r);if(t.length!==1)throw new Error("Please provide an object with a single key (operation name) mapping to a function. Got an object with "+t.length+" keys.");var e=t[0],n=r[e];e.endsWith("_")&&(e=e.substring(0,e.length-1));var a=function(){for(var o=[],i=0;i<arguments.length;i++)o[i]=arguments[i];T.startScope(e);try{var s=n.apply(void 0,o);return s instanceof Promise&&console.error("Cannot return a Promise inside of tidy."),T.endScope(s),s}catch(u){throw T.endScope(null),u}};return Object.defineProperty(a,"name",{value:e,configurable:!0}),a}se.registerFlag("HAS_WEBGL",(function(){return se.getNumber("WEBGL_VERSION")>0})),se.registerFlag("WEBGL_VERSION",(function(){return Li(2)?2:Li(1)?1:0})),se.registerFlag("WEBGL_BUFFER_SUPPORTED",(function(){return se.get("WEBGL_VERSION")===2})),se.registerFlag("WEBGL_CPU_FORWARD",(function(){return!0})),se.registerFlag("WEBGL_FORCE_F16_TEXTURES",(function(){return!1})),se.registerFlag("WEBGL_PACK",(function(){return se.getBool("HAS_WEBGL")})),se.registerFlag("WEBGL_PACK_NORMALIZATION",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_PACK_CLIP",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_PACK_DEPTHWISECONV",(function(){return!1})),se.registerFlag("WEBGL_PACK_BINARY_OPERATIONS",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_PACK_UNARY_OPERATIONS",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_PACK_ARRAY_OPERATIONS",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_PACK_IMAGE_OPERATIONS",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_PACK_REDUCE",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_LAZILY_UNPACK",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_CONV_IM2COL",(function(){return se.getBool("WEBGL_PACK")})),se.registerFlag("WEBGL_MAX_TEXTURE_SIZE",(function(){return Ql(se.getNumber("WEBGL_VERSION"))})),se.registerFlag("WEBGL_MAX_TEXTURES_IN_SHADER",(function(){return Zl(se.getNumber("WEBGL_VERSION"))})),se.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION",(function(){var r=se.getNumber("WEBGL_VERSION");return r===0?0:eh(r)})),se.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE",(function(){return se.getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0&&(r=navigator.userAgent||navigator.vendor||window.opera,!(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(r)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(r.substr(0,4))));var r})),se.registerFlag("WEBGL_RENDER_FLOAT32_CAPABLE",(function(){return th(se.getNumber("WEBGL_VERSION"))})),se.registerFlag("WEBGL_RENDER_FLOAT32_ENABLED",(function(){return!se.getBool("WEBGL_FORCE_F16_TEXTURES")&&se.getBool("WEBGL_RENDER_FLOAT32_CAPABLE")})),se.registerFlag("WEBGL_DOWNLOAD_FLOAT_ENABLED",(function(){return nh(se.getNumber("WEBGL_VERSION"))})),se.registerFlag("WEBGL_FENCE_API_ENABLED",(function(){return rh(se.getNumber("WEBGL_VERSION"))})),se.registerFlag("WEBGL_SIZE_UPLOAD_UNIFORM",(function(){return se.getBool("WEBGL_RENDER_FLOAT32_ENABLED")?4:0})),Ys=Zs;var Ge=D({complex_:function(r,t){var e=_(r,"real","complex"),n=_(t,"imag","complex");return Ce(e.shape,n.shape,"real and imag shapes, "+e.shape+" and "+n.shape+", must match in call to tf.complex()."),T.runKernelFunc((function(a){return a.complex(e,n)}),{$real:e,$imag:n})}}),dt=D({real_:function(r){var t=_(r,"input","real");return T.runKernelFunc((function(e){return e.real(t)}),{$input:t})}}),St=D({imag_:function(r){var t=_(r,"input","imag");return T.runKernelFunc((function(e){return e.imag(t)}),{$input:t})}});function je(r,t,e){return un(r,t,sn(r,e),e)}function un(r,t,e,n){if(n==null&&(n=cr(r)),n==="complex64")throw new Error("Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).");if(!At(r)&&!Array.isArray(r)&&typeof r!="number"&&typeof r!="boolean"&&typeof r!="string")throw new Error("values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray");if(t!=null){Xs(t);var a=Q(t),o=Q(e);E(a===o,(function(){return"Based on the provided shape, ["+t+"], the tensor should have "+a+" values but has "+o}));for(var i=0;i<e.length;++i){var s=e[i],u=i!==e.length-1||s!==Q(t.slice(i));E(e[i]===t[i]||!u,(function(){return"Error creating a new Tensor. Inferred shape ("+e+") does not match the provided shape ("+t+"). "}))}}return At(r)||Array.isArray(r)||(r=[r]),t=t||e,r=n!=="string"?qs(r,n,B().getBool("DEBUG")):Gn(r,[],!0),T.makeTensor(r,t,n)}function q(r,t){if((At(r)&&t!=="string"||Array.isArray(r))&&t!=="complex64")throw new Error("Error creating a new Scalar: value must be a primitive (number|boolean|string)");if(t==="string"&&At(r)&&!(r instanceof Uint8Array))throw new Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return un(r,[],[],t)}function Fe(r,t){Kn(r);var e=sn(r,t);if(e.length!==1)throw new Error("tensor1d() requires values to be a flat/TypedArray");return un(r,null,e,t)}function tn(r,t,e){if(Kn(r),t!=null&&t.length!==2)throw new Error("tensor2d() requires shape to have two numbers");var n=sn(r,e);if(n.length!==2&&n.length!==1)throw new Error("tensor2d() requires values to be number[][] or flat/TypedArray");if(n.length===1&&t==null)throw new Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return un(r,t,n,e)}function Do(r,t,e){if(Kn(r),t!=null&&t.length!==3)throw new Error("tensor3d() requires shape to have three numbers");var n=sn(r,e);if(n.length!==3&&n.length!==1)throw new Error("tensor3d() requires values to be number[][][] or flat/TypedArray");if(n.length===1&&t==null)throw new Error("tensor3d() requires shape to be provided when `values` are a flat array");return un(r,t,n,e)}function Ze(r,t,e){if(Kn(r),t!=null&&t.length!==4)throw new Error("tensor4d() requires shape to have four numbers");var n=sn(r,e);if(n.length!==4&&n.length!==1)throw new Error("tensor4d() requires values to be number[][][][] or flat/TypedArray");if(n.length===1&&t==null)throw new Error("tensor4d() requires shape to be provided when `values` are a flat array");return un(r,t,n,e)}function sh(r,t,e){if(Kn(r),t!=null&&t.length!==5)throw new Error("tensor5d() requires shape to have five numbers");var n=sn(r,e);if(n.length!==5&&n.length!==1)throw new Error("tensor5d() requires values to be number[][][][][] or flat/TypedArray");if(n.length===1&&t==null)throw new Error("tensor5d() requires shape to be provided when `values` are a flat array");return un(r,t,n,e)}function uh(r,t,e){if(Kn(r),t!=null&&t.length!==6)throw new Error("tensor6d() requires shape to have six numbers");var n=sn(r,e);if(n.length!==6&&n.length!==1)throw new Error("tensor6d() requires values to be number[][][][][][] or flat/TypedArray");if(n.length===1&&t==null)throw new Error("tensor6d() requires shape to be provided when `values` are a flat array");return un(r,t=t||n,n,e)}function ch(r,t,e,n){return t===void 0&&(t=!0),T.makeVariable(r,t,e,n)}function Xn(r,t){if(t===void 0&&(t="float32"),t==="complex64"){var e=Xn(r,"float32"),n=Ie(r,"float32");return Ge(e,n)}var a=Ks(Q(r),t);return T.makeTensor(a,r,t)}function Ie(r,t){if(t===void 0&&(t="float32"),t==="complex64"){var e=Ie(r,"float32"),n=Ie(r,"float32");return Ge(e,n)}var a=lr(Q(r),t);return T.makeTensor(a,r,t)}function Nt(r,t,e){return T.runKernelFunc((function(n){return n.fill(r,t,e)}),{})}function lh(r,t,e){if(e<=0)throw new Error("The number of values should be positive.");return T.runKernelFunc((function(n){return n.linspace(r,t,e)}),{})}function Hr(r,t,e,n){if(e===void 0&&(e=1),n===void 0&&(n="float32"),e===0)throw new Error("Cannot have a step of zero");if(r===t||r<t&&e<0||t<r&&e>1)return Ie([0],n);var a=lr(Math.abs(Math.ceil((t-r)/e)),n);t<r&&e===1&&(e=-1),a[0]=r;for(var o=1;o<a.length;o++)a[o]=a[o-1]+e;return Fe(a,n)}var tu=D({onesLike_:function(r){var t=_(r,"x","onesLike");if(t.dtype==="complex64"){var e=tu(dt(t)),n=xe(St(t));return Ge(e,n)}return T.runKernelFunc((function(a){return a.onesLike(t)}),{$x:t},(function(a,o){return{$x:function(){return xe(a)}}}))}}),xe=D({zerosLike_:function(r){var t=_(r,"x","zerosLike");return T.runKernelFunc((function(e){return e.zerosLike(t)}),{$x:t},(function(e,n){return{$x:function(){return xe(e)}}}))}}),Me=D({concat_:function(r,t){t===void 0&&(t=0),E(r.length>=1,(function(){return"Pass at least one tensor to concat"}));var e=Gr(r,"tensors","concat");e[0].dtype==="complex64"&&e.forEach((function(s){if(s.dtype!=="complex64")throw new Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype `+s.dtype+". ")})),t=We(t,e[0].shape)[0];var n=jn(e.map((function(s){return s.shape})),t);if(Q(n)===0)return je([],n);if((e=e.filter((function(s){return s.size>0}))).length===1)return e[0];var a=e.map((function(s){return s.shape}));ih(a,t);var o=e,i={axis:t};return T.runKernelFunc((function(s){return s.concat(e,t)}),o,(function(s){var u=a.map((function(c){return c[t]}));return Ao(s,u,t).map((function(c){return function(){return c}}))}),"Concat",i)}}),hh=D({concat1d_:function(r){return Me(r,0)}}),fh=D({concat2d_:function(r,t){return Me(r,t)}}),ph=D({concat3d_:function(r,t){return Me(r,t)}}),dh=D({concat4d_:function(r,t){return Me(r,t)}}),Ao=D({split_:function(r,t,e){e===void 0&&(e=0);var n,a=_(r,"x","split");return e=We(e,a.shape)[0],typeof t=="number"?(E(a.shape[e]%t==0,(function(){return"Number of splits must evenly divide the axis."})),n=new Array(t).fill(a.shape[e]/t)):(E(a.shape[e]===t.reduce((function(o,i){return o+i})),(function(){return"The sum of sizes must match the size of the axis dimension."})),n=t),T.runKernelFunc((function(o){return o.split(a,n,e)}),{$x:a},(function(o){return{$x:function(){return Me(o,e)}}}))}});function xn(r,t){return r(t={exports:{}},t.exports),t.exports}var vh=xn((function(r){(function(t,e,n){function a(s){var u,c=this,l=(u=4022871197,function(h){h=h.toString();for(var f=0;f<h.length;f++){var p=.02519603282416938*(u+=h.charCodeAt(f));p-=u=p>>>0,u=(p*=u)>>>0,u+=4294967296*(p-=u)}return 23283064365386963e-26*(u>>>0)});c.next=function(){var h=2091639*c.s0+23283064365386963e-26*c.c;return c.s0=c.s1,c.s1=c.s2,c.s2=h-(c.c=0|h)},c.c=1,c.s0=l(" "),c.s1=l(" "),c.s2=l(" "),c.s0-=l(s),c.s0<0&&(c.s0+=1),c.s1-=l(s),c.s1<0&&(c.s1+=1),c.s2-=l(s),c.s2<0&&(c.s2+=1),l=null}function o(s,u){return u.c=s.c,u.s0=s.s0,u.s1=s.s1,u.s2=s.s2,u}function i(s,u){var c=new a(s),l=u&&u.state,h=c.next;return h.int32=function(){return 4294967296*c.next()|0},h.double=function(){return h()+11102230246251565e-32*(2097152*h()|0)},h.quick=h,l&&(typeof l=="object"&&o(l,c),h.state=function(){return o(c,{})}),h}e&&e.exports?e.exports=i:this.alea=i})(0,r)})),mh=xn((function(r){(function(t,e,n){function a(s){var u=this,c="";u.x=0,u.y=0,u.z=0,u.w=0,u.next=function(){var h=u.x^u.x<<11;return u.x=u.y,u.y=u.z,u.z=u.w,u.w^=u.w>>>19^h^h>>>8},s===(0|s)?u.x=s:c+=s;for(var l=0;l<c.length+64;l++)u.x^=0|c.charCodeAt(l),u.next()}function o(s,u){return u.x=s.x,u.y=s.y,u.z=s.z,u.w=s.w,u}function i(s,u){var c=new a(s),l=u&&u.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var f=((c.next()>>>11)+(c.next()>>>0)/4294967296)/2097152;while(f===0);return f},h.int32=c.next,h.quick=h,l&&(typeof l=="object"&&o(l,c),h.state=function(){return o(c,{})}),h}e&&e.exports?e.exports=i:this.xor128=i})(0,r)})),gh=xn((function(r){(function(t,e,n){function a(s){var u=this,c="";u.next=function(){var h=u.x^u.x>>>2;return u.x=u.y,u.y=u.z,u.z=u.w,u.w=u.v,(u.d=u.d+362437|0)+(u.v=u.v^u.v<<4^h^h<<1)|0},u.x=0,u.y=0,u.z=0,u.w=0,u.v=0,s===(0|s)?u.x=s:c+=s;for(var l=0;l<c.length+64;l++)u.x^=0|c.charCodeAt(l),l==c.length&&(u.d=u.x<<10^u.x>>>4),u.next()}function o(s,u){return u.x=s.x,u.y=s.y,u.z=s.z,u.w=s.w,u.v=s.v,u.d=s.d,u}function i(s,u){var c=new a(s),l=u&&u.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var f=((c.next()>>>11)+(c.next()>>>0)/4294967296)/2097152;while(f===0);return f},h.int32=c.next,h.quick=h,l&&(typeof l=="object"&&o(l,c),h.state=function(){return o(c,{})}),h}e&&e.exports?e.exports=i:this.xorwow=i})(0,r)})),yh=xn((function(r){(function(t,e,n){function a(s){var u=this;u.next=function(){var c,l,h=u.x,f=u.i;return c=h[f],l=(c^=c>>>7)^c<<24,l^=(c=h[f+1&7])^c>>>10,l^=(c=h[f+3&7])^c>>>3,l^=(c=h[f+4&7])^c<<7,c=h[f+7&7],l^=(c^=c<<13)^c<<9,h[f]=l,u.i=f+1&7,l},(function(c,l){var h,f=[];if(l===(0|l))f[0]=l;else for(l=""+l,h=0;h<l.length;++h)f[7&h]=f[7&h]<<15^l.charCodeAt(h)+f[h+1&7]<<13;for(;f.length<8;)f.push(0);for(h=0;h<8&&f[h]===0;++h);for(h==8?f[7]=-1:f[h],c.x=f,c.i=0,h=256;h>0;--h)c.next()})(u,s)}function o(s,u){return u.x=s.x.slice(),u.i=s.i,u}function i(s,u){s==null&&(s=+new Date);var c=new a(s),l=u&&u.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var f=((c.next()>>>11)+(c.next()>>>0)/4294967296)/2097152;while(f===0);return f},h.int32=c.next,h.quick=h,l&&(l.x&&o(l,c),h.state=function(){return o(c,{})}),h}e&&e.exports?e.exports=i:this.xorshift7=i})(0,r)})),xh=xn((function(r){(function(t,e,n){function a(s){var u=this;u.next=function(){var c,l,h=u.w,f=u.X,p=u.i;return u.w=h=h+1640531527|0,l=f[p+34&127],c=f[p=p+1&127],l^=l<<13,c^=c<<17,l^=l>>>15,c^=c>>>12,l=f[p]=l^c,u.i=p,l+(h^h>>>16)|0},(function(c,l){var h,f,p,d,m,v=[],g=128;for(l===(0|l)?(f=l,l=null):(l+="\0",f=0,g=Math.max(g,l.length)),p=0,d=-32;d<g;++d)l&&(f^=l.charCodeAt((d+32)%l.length)),d===0&&(m=f),f^=f<<10,f^=f>>>15,f^=f<<4,f^=f>>>13,d>=0&&(m=m+1640531527|0,p=(h=v[127&d]^=f+m)==0?p+1:0);for(p>=128&&(v[127&(l&&l.length||0)]=-1),p=127,d=512;d>0;--d)f=v[p+34&127],h=v[p=p+1&127],f^=f<<13,h^=h<<17,f^=f>>>15,h^=h>>>12,v[p]=f^h;c.w=m,c.X=v,c.i=p})(u,s)}function o(s,u){return u.i=s.i,u.w=s.w,u.X=s.X.slice(),u}function i(s,u){s==null&&(s=+new Date);var c=new a(s),l=u&&u.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var f=((c.next()>>>11)+(c.next()>>>0)/4294967296)/2097152;while(f===0);return f},h.int32=c.next,h.quick=h,l&&(l.X&&o(l,c),h.state=function(){return o(c,{})}),h}e&&e.exports?e.exports=i:this.xor4096=i})(0,r)})),bh=xn((function(r){(function(t,e,n){function a(s){var u=this,c="";u.next=function(){var h=u.b,f=u.c,p=u.d,d=u.a;return h=h<<25^h>>>7^f,f=f-p|0,p=p<<24^p>>>8^d,d=d-h|0,u.b=h=h<<20^h>>>12^f,u.c=f=f-p|0,u.d=p<<16^f>>>16^d,u.a=d-h|0},u.a=0,u.b=0,u.c=-1640531527,u.d=1367130551,s===Math.floor(s)?(u.a=s/4294967296|0,u.b=0|s):c+=s;for(var l=0;l<c.length+20;l++)u.b^=0|c.charCodeAt(l),u.next()}function o(s,u){return u.a=s.a,u.b=s.b,u.c=s.c,u.d=s.d,u}function i(s,u){var c=new a(s),l=u&&u.state,h=function(){return(c.next()>>>0)/4294967296};return h.double=function(){do var f=((c.next()>>>11)+(c.next()>>>0)/4294967296)/2097152;while(f===0);return f},h.int32=c.next,h.quick=h,l&&(typeof l=="object"&&o(l,c),h.state=function(){return o(c,{})}),h}e&&e.exports?e.exports=i:this.tychei=i})(0,r)})),fn=xn((function(r){(function(t,e){var n,a=this,o=256,i=6,s="random",u=e.pow(o,i),c=e.pow(2,52),l=2*c,h=o-1;function f(g,x,b){var y=[],w=m((function I(k,R){var N,A=[],L=typeof k;if(R&&L=="object")for(N in k)try{A.push(I(k[N],R-1))}catch{}return A.length?A:L=="string"?k:k+"\0"})((x=x==1?{entropy:!0}:x||{}).entropy?[g,v(t)]:g??(function(){try{var I;return n&&(I=n.randomBytes)?I=I(o):(I=new Uint8Array(o),(a.crypto||a.msCrypto).getRandomValues(I)),v(I)}catch{var k=a.navigator,R=k&&k.plugins;return[+new Date,a,R,a.screen,v(t)]}})(),3),y),C=new p(y),S=function(){for(var I=C.g(i),k=u,R=0;I<c;)I=(I+R)*o,k*=o,R=C.g(1);for(;I>=l;)I/=2,k/=2,R>>>=1;return(I+R)/k};return S.int32=function(){return 0|C.g(4)},S.quick=function(){return C.g(4)/4294967296},S.double=S,m(v(C.S),t),(x.pass||b||function(I,k,R,N){return N&&(N.S&&d(N,C),I.state=function(){return d(C,{})}),R?(e[s]=I,k):I})(S,w,"global"in x?x.global:this==e,x.state)}function p(g){var x,b=g.length,y=this,w=0,C=y.i=y.j=0,S=y.S=[];for(b||(g=[b++]);w<o;)S[w]=w++;for(w=0;w<o;w++)S[w]=S[C=h&C+g[w%b]+(x=S[w])],S[C]=x;(y.g=function(I){for(var k,R=0,N=y.i,A=y.j,L=y.S;I--;)k=L[N=h&N+1],R=R*o+L[h&(L[N]=L[A=h&A+k])+(L[A]=k)];return y.i=N,y.j=A,R})(o)}function d(g,x){return x.i=g.i,x.j=g.j,x.S=g.S.slice(),x}function m(g,x){for(var b,y=g+"",w=0;w<y.length;)x[h&w]=h&(b^=19*x[h&w])+y.charCodeAt(w++);return v(x)}function v(g){return String.fromCharCode.apply(0,g)}if(e["seed"+s]=f,m(e.random(),t),r.exports){r.exports=f;try{n=require("crypto")}catch{}}})([],Math)}));fn.alea=vh,fn.xor128=mh,fn.xorwow=gh,fn.xorshift7=yh,fn.xor4096=xh,fn.tychei=bh;var ua=fn.alea,To=(function(){function r(t,e,n,a,o){this.mean=t,this.stdDev=e,this.dtype=n,this.nextVal=NaN,this.truncated=a,this.truncated&&(this.upper=this.mean+2*this.stdDev,this.lower=this.mean-2*this.stdDev);var i=o||Math.random();this.random=ua(i.toString())}return r.prototype.nextValue=function(){if(!isNaN(this.nextVal)){var t=this.nextVal;return this.nextVal=NaN,t}for(var e,n,a=!1;!a;){var o=void 0,i=void 0,s=void 0;do s=(o=2*this.random()-1)*o+(i=2*this.random()-1)*i;while(s>=1||s===0);var u=Math.sqrt(-2*Math.log(s)/s);e=this.mean+this.stdDev*o*u,n=this.mean+this.stdDev*i*u,this.truncated&&!this.isValidTruncated(e)||(a=!0)}return this.truncated&&!this.isValidTruncated(n)||(this.nextVal=this.convertValue(n)),this.convertValue(e)},r.prototype.convertValue=function(t){return this.dtype==null||this.dtype==="float32"?t:Math.round(t)},r.prototype.isValidTruncated=function(t){return t<=this.upper&&t>=this.lower},r})(),wh=(function(){function r(t,e,n,a){this.alpha=t,this.beta=1/e,this.dtype=n;var o=a||Math.random();this.randu=ua(o.toString()),this.randn=new To(0,1,n,!1,this.randu()),this.d=t<1?t+2/3:t-1/3,this.c=1/Math.sqrt(9*this.d)}return r.prototype.nextValue=function(){for(var t,e,n,a,o,i;;){do a=this.randn.nextValue(),i=1+this.c*a;while(i<=0);if(i*=i*i,e=1-.331*(t=a*a)*t,n=.5*t+this.d*(1-i+Math.log(i)),(o=this.randu())<e||Math.log(o)<n)break}return i=1/this.beta*this.d*i,this.alpha<1&&(i*=Math.pow(this.randu(),1/this.alpha)),this.convertValue(i)},r.prototype.convertValue=function(t){return this.dtype==="float32"?t:Math.round(t)},r})(),Ch=(function(){function r(t,e,n,a){var o=this;if(t===void 0&&(t=0),e===void 0&&(e=1),this.canReturnFloat=function(){return o.dtype==null||o.dtype==="float32"},this.min=t,this.range=e-t,this.dtype=n,a==null&&(a=Math.random()),typeof a=="number"&&(a=a.toString()),!this.canReturnFloat()&&this.range<=1)throw new Error("The difference between "+t+" - "+e+" <= 1 and dtype is not float");this.random=ua(a)}return r.prototype.convertValue=function(t){return this.canReturnFloat()?t:Math.round(t)},r.prototype.nextValue=function(){return this.convertValue(this.min+this.range*this.random())},r})();function ce(r,t,e){return t===void 0&&(t="float32"),t=t||"float32",Xs(r),new rr(r,t,e)}function _h(r,t){t===void 0&&(t=!1),console.log(r.toString(t))}var nu=D({batchToSpaceND_:function(r,t,e){var n=_(r,"x","batchToSpaceND"),a=t.reduce((function(o,i){return o*i}));return E(n.rank>=1+t.length,(function(){return"input rank is "+n.rank+" but should be > than blockShape.length "+t.length})),E(e.length===t.length,(function(){return"crops.length is "+e.length+" but should be equal to blockShape.length  "+t.length})),E(n.shape[0]%a==0,(function(){return"input tensor batch is "+n.shape[0]+" but is not divisible by the product of the elements of blockShape "+t.join(" * ")+" === "+a})),T.runKernelFunc((function(o){return o.batchToSpaceND(n,t,e)}),{$x:n},(function(o){return{$x:function(){return o.spaceToBatchND(t,e)}}}))}}),Eh=D({broadcastTo_:function(r,t){var e=_(r,"broadcastTo","x"),n=e.shape;if(t.some((function(u){return!(u>0)||u%1!=0})))throw new Error("broadcastTo(): Invalid broadcast shape ["+t+"].");if(t.length<e.rank)throw new Error("broadcastTo(): shape.length="+t.length+" < input.rank="+e.rank+".");if(t.length>e.rank){for(var a=e.shape.slice();a.length<t.length;)a.unshift(1);e=e.reshape(a)}for(var o=Array.from(t),i=t.length-1;i>=0;i--)if(e.shape[i]===t[i])o[i]=1;else if(e.shape[i]!==1)throw new Error("broadcastTo(): ["+n+"] cannot be broadcast to ["+t+"].");var s=o.map((function(u,c){return u>1?c:-1})).filter((function(u){return u>=0}));return s.length===0?e.clone():T.runKernelFunc((function(u){return u.tile(e,o)}),{input:e},(function(u){return{input:function(){return u.sum(s,!0)}}}))}}),kh=D({cast_:function(r,t){var e=_(r,"x","cast");if(!gl(t))throw new Error("Failed to cast to unknown dtype "+t);if(t==="string"&&e.dtype!=="string"||t!=="string"&&e.dtype==="string")throw new Error("Only strings can be casted to strings");var n={dtype:t};return T.runKernelFunc((function(a){return a.cast(e,t)}),{x:e},(function(a){return{x:function(){return a.clone()}}}),"Cast",n)}}),Rh=D({clone_:function(r){var t=_(r,"x","clone",null);return T.runKernelFunc((function(){return T.makeTensorFromDataId(t.dataId,t.shape,t.dtype)}),{$x:t},(function(e){return{$x:function(){return e.toFloat()}}}))}}),Ih=D({cumsum_:function(r,t,e,n){t===void 0&&(t=0),e===void 0&&(e=!1),n===void 0&&(n=!1);var a=_(r,"x","cumsum"),o=Mt([t|=0],a.rank),i=a;o!=null&&(i=a.transpose(o));var s=Ot(1,a.rank)[0],u=T.runKernelFunc((function(c){return c.cumsum(i,s,e,n)}),{permutedX:i},(function(c){return{permutedX:function(){return c.cumsum(t,e,!n)}}}));return o!=null&&(u=u.transpose(o)),u}}),Sh=D({depthToSpace_:function(r,t,e){e===void 0&&(e="NHWC");var n=_(r,"x","depthToSpace"),a=e==="NHWC"?n.shape[1]:n.shape[2],o=e==="NHWC"?n.shape[2]:n.shape[3],i=e==="NHWC"?n.shape[3]:n.shape[1];return E(a*t>=0,(function(){return`Negative dimension size caused by overflow when multiplying
      `+a+" and "+t+`  for depthToSpace with input shape
      `+n.shape})),E(o*t>=0,(function(){return`Negative dimension size caused by overflow when multiplying
      `+o+" and "+t+` for depthToSpace with input shape
          `+n.shape})),E(i%(t*t)==0,(function(){return"Dimension size must be evenly divisible by "+t*t+" but is "+i+" for depthToSpace with input shape "+n.shape})),T.runKernelFunc((function(s){return s.depthToSpace(n,t,e)}),{$x:n})}}),pt=D({expandDims_:function(r,t){t===void 0&&(t=0);var e=_(r,"x","expandDims",null);E(t<=e.rank,(function(){return"Axis must be <= rank of the tensor"}));var n=e.shape.slice();return t<0&&(E(-(e.rank+1)<=t,(function(){return"Axis must be in the interval ["+-(e.rank+1)+", "+e.rank+"]"})),t=e.rank+t+1),n.splice(t,0,1),yt(e,n)}}),ru=D({eye_:function(r,t,e,n){n===void 0&&(n="float32"),t==null&&(t=r);for(var a=ce([r,t],n),o=r<=t?r:t,i=0;i<o;++i)a.set(1,i,i);var s=a.toTensor().as2D(r,t);if(e==null)return s;if(e.length===1)return On(pt(s,0),[e[0],1,1]);if(e.length===2)return On(pt(pt(s,0),0),[e[0],e[1],1,1]);if(e.length===3)return On(pt(pt(pt(s,0),0),0),[e[0],e[1],e[2],1,1]);throw new Error("eye() currently supports only 1D and 2D batchShapes, but received "+e.length+"D.")}}),Dh=D({multinomial_:function(r,t,e,n){n===void 0&&(n=!1);var a=_(r,"logits","multinomial"),o=a.size,i=a.rank;if(o<2)throw new Error("Error in multinomial: you need at least 2 outcomes, but got "+o+".");if(i>2)throw new Error("Rank of probabilities must be 1 or 2, but is "+i);e=e||Math.random();var s=i===1?a.as2D(1,-1):a,u=T.runKernelFunc((function(c){return c.multinomial(s,n,t,e)}),{logits2D:s});return i===1?u.as1D():u}}),fo=D({oneHot_:function(r,t,e,n){if(e===void 0&&(e=1),n===void 0&&(n=0),t<2)throw new Error("Error in oneHot: depth must be >=2, but it is "+t);var a=_(r,"indices","oneHot","int32"),o=a.shape.concat([t]);return a=a.flatten(),T.runKernelFunc((function(i){return i.oneHot(a,t,e,n)}),{$indices:a},(function(i){return{$indices:function(){return Ie(a.shape,"float32")}}})).reshape(o)}}),bn=D({pad_:function(r,t,e){e===void 0&&(e=0);var n=_(r,"x","pad");if(n.rank===0)throw new Error("pad(scalar) is not defined. Pass non-scalar to pad");var a={paddings:t,constantValue:e};return T.runKernelFunc((function(o){return o.pad(n,t,e)}),{x:n},(function(o){var i=t.map((function(s){return s[0]}));return{x:function(){return o.slice(i,n.shape)}}}),"PadV2",a)}}),Ah=D({pad1d_:function(r,t,e){return e===void 0&&(e=0),E(t.length===2,(function(){return"Invalid number of paddings. Must be length of 2."})),bn(r,[t],e)}}),Th=D({pad2d_:function(r,t,e){return e===void 0&&(e=0),E(t.length===2&&t[0].length===2&&t[1].length===2,(function(){return"Invalid number of paddings. Must be length of 2 each."})),bn(r,t,e)}}),Nh=D({pad3d_:function(r,t,e){return e===void 0&&(e=0),E(t.length===3&&t[0].length===2&&t[1].length===2&&t[2].length===2,(function(){return"Invalid number of paddings. Must be length of 2 each."})),bn(r,t,e)}}),Fh=D({pad4d_:function(r,t,e){return e===void 0&&(e=0),E(t.length===4&&t[0].length===2&&t[1].length===2&&t[2].length===2&&t[3].length===2,(function(){return"Invalid number of paddings. Must be length of 2 each."})),bn(r,t,e)}}),Ph=D({rand_:function(r,t,e){var n=Q(r),a=null;if(e==null||e==="float32")a=new Float32Array(n);else if(e==="int32")a=new Int32Array(n);else{if(e!=="bool")throw new Error("Unknown data type "+e);a=new Uint8Array(n)}for(var o=0;o<n;o++)a[o]=t();return T.makeTensor(a,r,e)}}),Mh=D({randomNormal_:function(r,t,e,n,a){if(t===void 0&&(t=0),e===void 0&&(e=1),n!=null&&n==="bool")throw new Error("Unsupported data type "+n);for(var o=new To(t,e,n,!1,a),i=ce(r,n),s=0;s<i.values.length;s++)i.values[s]=o.nextValue();return i.toTensor()}}),Oh=D({randomGamma_:function(r,t,e,n,a){if(e===void 0&&(e=1),n===void 0&&(n="float32"),e==null&&(e=1),n==null&&(n="float32"),n!=="float32"&&n!=="int32")throw new Error("Unsupported data type "+n);for(var o=new wh(t,e,n,a),i=ce(r,n),s=0;s<i.values.length;s++)i.values[s]=o.nextValue();return i.toTensor()}}),au=D({randomUniform_:function(r,t,e,n,a){t===void 0&&(t=0),e===void 0&&(e=1),n===void 0&&(n="float32");for(var o=ce(r,n),i=new Ch(t,e,null,a),s=0;s<o.values.length;s++)o.values[s]=i.nextValue();return o.toTensor()}}),yt=D({reshape_:function(r,t){var e=_(r,"x","reshape",null);t=vl(t,e.size),E(e.size===Q(t),(function(){return"new shape and old shape must have the same number of elements."}));var n={shape:t};return T.runKernelFunc((function(a){return a.reshape(e,t)}),{x:e},(function(a){return{x:function(){return a.reshape(e.shape)}}}),"Reshape",n)}}),ou=D({spaceToBatchND_:function(r,t,e){var n=_(r,"x","spaceToBatchND");return E(n.rank>=1+t.length,(function(){return"input rank "+n.rank+" should be > than [blockShape] "+t.length})),E(e.length===t.length,(function(){return"paddings.shape[0] "+e.length+" must be equal to [blockShape] "+t.length})),E(n.shape.reduce((function(a,o,i){return i>0&&i<=t.length?a&&(o+e[i-1][0]+e[i-1][1])%t[i-1]==0:a}),!0),(function(){return"input spatial dimensions "+n.shape.slice(1)+" with paddings "+e.toString()+" must be divisible by blockShapes "+t.toString()})),T.runKernelFunc((function(a){return a.spaceToBatchND(n,t,e)}),{$x:n},(function(a){return{$x:function(){return a.batchToSpaceND(t,e)}}}))}}),iu=D({squeeze_:function(r,t){var e=_(r,"x","squeeze");return yt(e,pn(e.shape,t).newShape)}}),ft=D({stack_:function(r,t){t===void 0&&(t=0);var e=Gr(r,"tensors","stack");if(E(e.length>=1,(function(){return"Pass at least one tensor to tf.stack"})),e.length===1)return e[0].expandDims(t);var n=e[0].rank,a=e[0].shape,o=e[0].dtype;E(t<=n,(function(){return"Axis must be <= rank of the tensor"})),e.forEach((function(s){Ce(a,s.shape,"All tensors passed to stack must have matching shapes")})),e.forEach((function(s){E(o===s.dtype,(function(){return"All tensors passed to stack must have matching dtypes"}))}));var i=e.map((function(s){return s.expandDims(t)}));return Me(i,t)}}),On=D({tile_:function(r,t){var e=_(r,"x","tile",null);E(e.rank===t.length,(function(){return"Error in transpose: rank of input "+e.rank+" must match length of reps "+t+"."}));var n=[e],a={reps:t};return T.runKernelFunc((function(o,i){var s=o.tile(e,t);return i([e]),s}),{x:e},(function(o,i){var s=i[0];return{x:function(){var u=xe(s);if(s.rank===1)for(var c=0;c<t[0];++c)u=u.add(o.slice([c*s.shape[0]],[s.shape[0]]));else if(s.rank===2)for(c=0;c<t[0];++c)for(var l=0;l<t[1];++l)u=u.add(o.slice([c*s.shape[0],l*s.shape[1]],[s.shape[0],s.shape[1]]));else if(s.rank===3)for(c=0;c<t[0];++c)for(l=0;l<t[1];++l)for(var h=0;h<t[2];++h)u=u.add(o.slice([c*s.shape[0],l*s.shape[1],h*s.shape[2]],[s.shape[0],s.shape[1],s.shape[2]]));else{if(s.rank!==4)throw new Error("Gradient for tile operation is not implemented for rank-"+s.rank+" tensors yet.");for(c=0;c<t[0];++c)for(l=0;l<t[1];++l)for(h=0;h<t[2];++h)for(var f=0;f<t[3];++f)u=u.add(o.slice([c*s.shape[0],l*s.shape[1],h*s.shape[2],f*s.shape[3]],[s.shape[0],s.shape[1],s.shape[2],s.shape[3]]))}return u}}}),"Tile",a,n)}}),Bh=D({truncatedNormal_:function(r,t,e,n,a){if(t===void 0&&(t=0),e===void 0&&(e=1),n!=null&&n==="bool")throw new Error("Unsupported data type "+n);for(var o=new To(t,e,n,!0,a),i=ce(r,n),s=0;s<i.values.length;s++)i.values[s]=o.nextValue();return i.toTensor()}}),Oe=D({unstack_:function(r,t){t===void 0&&(t=0),t=t||0;var e=_(r,"x","unstack");E(t>=-e.shape.length&&t<e.shape.length,(function(){return"Axis = "+t+" is not in [-"+e.shape.length+", "+e.shape.length+")"})),t<0&&(t+=e.shape.length);var n={axis:t};return T.runKernelFunc((function(a){return a.unstack(e,t)}),{x:e},(function(a){return{x:function(){return ft(a,t)}}}),"Unpack",n)}}),Lh=function(r,t){return $(this,void 0,void 0,(function(){var e,n,a,o,i,s,u,c,l,h;return Y(this,(function(f){switch(f.label){case 0:return e=_(r,"x","setdiff1d"),n=_(t,"y","setdiff1d"),E(e.dtype===n.dtype,(function(){return"x and y should have the same dtype, but got x ("+e.dtype+") and y ("+n.dtype+")."})),E(e.rank===1,(function(){return"x should be 1D tensor, but got x ("+e.shape+")."})),E(n.rank===1,(function(){return"y should be 1D tensor, but got y ("+n.shape+")."})),[4,e.data()];case 1:return a=f.sent(),[4,n.data()];case 2:for(o=f.sent(),i=new Set(o),s=0,l=0;l<a.length;l++)i.has(a[l])||s++;for(u=new rr([s],e.dtype),c=new rr([s],"int32"),l=0,h=0;l<a.length;l++)i.has(a[l])||(u.values[h]=a[l],c.values[h]=l,h++);return[2,[u.toTensor(),c.toTensor()]]}}))}))};function jr(r,t,e,n){n===void 0&&(n=!0);var a=[];if(n)(a=a.concat(t.slice(0))).push(r[0]/e),a=a.concat(r.slice(1));else{a=a.concat(r[0]);for(var o=t.length,i=0;i<o;++i)a=a.concat([r[i+1]/t[i],t[i]]);a=a.concat(r.slice(o+1))}return a}function qr(r,t,e){e===void 0&&(e=!0);var n=[];if(e){n.push(t);for(var a=t+1;a<r;++a)a<=2*t?(n.push(a),n.push(a-(t+1))):n.push(a)}else{var o=[],i=[];for(a=1;a<r;++a)a>=2*t+1||a%2==1?i.push(a):o.push(a);n.push.apply(n,o),n.push(0),n.push.apply(n,i)}return n}function Kr(r,t,e,n){n===void 0&&(n=!0);var a=[];n?a.push(r[0]/e):a.push(r[0]*e);for(var o=1;o<r.length;++o)o<=t.length?n?a.push(t[o-1]*r[o]):a.push(r[o]/t[o-1]):a.push(r[o]);return a}function su(r,t){for(var e=[0],n=0;n<t;++n)e.push(r[n][0]);return e}function uu(r,t,e){for(var n=r.slice(0,1),a=0;a<e;++a)n.push(r[a+1]-t[a][0]-t[a][1]);return n}function cu(r,t){if(r.rank<1)throw new Error("tf.gatherND() expects the input to be rank 1 or higher, but the rank was "+r.rank+".");if(t.rank<1)throw new Error("tf.gatherND() expects the indices to be rank 1 or higher, but the rank was "+t.rank+".");if(t.dtype!=="int32")throw new Error("tf.gatherND() expects the indices to be int32 type, but the dtype was "+t.dtype+".");if(t.shape[t.rank-1]>r.rank)throw new Error("index innermost dimension length must be <= tensor rank; saw: "+t.shape[t.rank-1]+" vs. "+r.rank);if(r.size===0)throw new Error("Requested more than 0 entries, but input is empty. Input shape: "+r.shape+".");for(var e=t.shape,n=e[e.length-1],a=1,o=0;o<e.length-1;++o)a*=e[o];var i=r.shape,s=e.slice();s.pop();var u=1;for(o=n;o<r.rank;++o)u*=i[o],s.push(i[o]);var c=Tt(r.shape).map((function(l){return l/u})).concat([1]).slice(0,n);return[s,a,u,c]}var lu=30;function Oa(r){return r<=lu?r:io(r,Math.floor(Math.sqrt(r)))}function Wh(r,t,e){var n=t.rank>1?t.shape[t.rank-1]:1,a=t.rank>1?t.rank-1:1,o="Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: "+e.shape+", indices.shape: "+t.shape+", shape: "+r+", sliceDim: "+n+", and batchDim: "+a+".";if(e.rank<a)throw new Error(o+" update.rank < "+a+". ");if(r.length<n+(e.rank-a))throw new Error(o+" Output shape length < "+(n+(e.rank-a)));if(e.rank!==a+r.length-n)throw new Error(o+" update.rank != "+(a+r.length-n));for(var i=0;i<a;++i)if(e.shape[i]!==t.shape[i])throw new Error(o+" updates.shape["+i+"] ("+e.shape[i]+") != indices.shape["+i+"] ("+t.shape[i]+").");for(i=0;i<e.rank-a;++i)if(e.shape[i+a]!==r[i+n])throw new Error(o+" updates.shape["+(i+a)+"] ("+e.shape[i+a]+") != shape["+(i+a)+"] ("+r[i+a]+")")}function Uh(r,t,e){if(t.rank<1)throw new Error("tf.scatterND() expects the indices to be rank 1 or higher, but the rank was "+t.rank+".");if(r.rank<1)throw new Error("tf.scatterND() expects the updates to be rank 1 or higher, but the rank was "+r.rank+".");if(t.dtype!=="int32")throw new Error("The dtype of 'indices' should be int32, but got dtype: "+t.dtype);if(e.length<1)throw new Error("Output rank must be greater or equal to 1, but got shape: "+e);if(e.length===0){if(t.size===0)throw new Error("Indices specified for empty output. indices shape: "+t.shape);if(r.size===0)throw new Error("Updates specified for empty output. updates shape: "+r.shape)}Wh(e,t,r)}function Xr(r,t,e){for(var n=t.shape.length,a=n>1?t.shape[n-1]:1,o=e.length,i=1,s=a;s<o;++s)i*=e[s];var u=a<1?1:a;return{sliceRank:a,numUpdates:Q(t.shape)/u,sliceSize:i,strides:Tt(e.slice(0,a)).concat([1]),outputSize:Q(e)}}function zh(r,t,e){E(r.rank===t.length,(function(){return"Error in slice"+r.rank+"D: Length of begin "+t+" must match the rank of the array ("+r.rank+")."})),E(r.rank===e.length,(function(){return"Error in slice"+r.rank+"D: Length of size "+e+" must match the rank of the array ("+r.rank+")."}));for(var n=function(o){E(t[o]+e[o]<=r.shape[o],(function(){return"Error in slice"+r.rank+"D: begin["+o+"] + size["+o+"] ("+(t[o]+e[o])+") would overflow input.shape["+o+"] ("+r.shape[o]+")"}))},a=0;a<r.rank;++a)n(a)}function Ui(r){for(var t=[],e=0;r>0;)1&r&&t.push(e),r/=2,e++;return t}function No(r,t,e){for(var n=[],a=0;a<r.length;a++)n[a]=Math.ceil((t[a]-r[a])/e[a]);return n}function Vh(r,t,e,n,a){var o=t[a],i=e[a]||1;(r&1<<a||o==null)&&(o=i>0?Number.MIN_SAFE_INTEGER:Number.MAX_SAFE_INTEGER);var s=n[a];return o<0&&(o+=s),o=ro(0,o,s-1)}function Gh(r,t,e,n,a){var o=t[a],i=e[a]||1;(r&1<<a||o==null)&&(o=i>0?Number.MAX_SAFE_INTEGER:Number.MIN_SAFE_INTEGER);var s=n[a];return o<0&&(o+=s),o=i>0?ro(0,o,s):ro(-1,o,s-1)}function hu(r,t,e){for(var n=e.length,a=0;a<e.length;a++)if(e[a]>1){n=a;break}for(a=n+1;a<e.length;a++)if(t[a]>0||e[a]!==r[a])return!1;return!0}function fu(r,t){for(var e=r.length>0?r[r.length-1]:1,n=0;n<r.length-1;n++)e+=r[n]*t[n];return e}function Hh(r,t){E(oo(r),(function(){return"The f passed in variableGrads(f) must be a function"})),E(t==null||Array.isArray(t)&&t.every((function(l){return l instanceof Hn})),(function(){return"The varList passed in variableGrads(f, varList) must be an array of variables"}));var e=t!=null;if(!e)for(var n in t=[],T.registeredVariables)t.push(T.registeredVariables[n]);var a=e?t.filter((function(l){return!l.trainable})):null,o=t.length;E((t=t.filter((function(l){return l.trainable}))).length>0,(function(){return"variableGrads() expects at least one of the input variables to be trainable, but none of the "+o+" variables is trainable."}));var i=T.gradients(r,t,null,!0),s=i.value,u=i.grads;E(u.some((function(l){return l!=null})),(function(){return"Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize()."})),E(s.rank===0,(function(){return"The f passed in variableGrads(f) must return a scalar, but it returned a rank-"+s.rank+" tensor"}));var c={};return t.forEach((function(l,h){u[h]!=null&&(c[l.name]=u[h])})),a?.forEach((function(l){return c[l.name]=null})),{value:s,grads:c}}function ca(r){return T.customGrad(r)}var jt=D({softmax_:function(r,t){t===void 0&&(t=-1);var e=_(r,"logits","softmax","float32");if(t===-1&&(t=e.rank-1),t!==e.rank-1)throw Error("Softmax along a non-last dimension is not yet supported. Logits was rank "+e.rank+" and dim was "+t);return T.runKernelFunc((function(n,a){var o=n.softmax(e,t);return a([o]),o}),{logits:e},(function(n,a){var o=a[0],i=n.mul(o);return{logits:function(){return i.sub(i.sum([t],!0).mul(o))}}}),"Softmax",{dim:t},[],[!0])}}),jh=D({logSoftmax_:function(r,t){t===void 0&&(t=-1);var e=_(r,"logits","logSoftmax");if(t===-1&&(t=e.rank-1),t!==e.rank-1)throw Error("Log Softmax along a non-last dimension is not yet supported. Logits was rank "+e.rank+" and axis was "+t);return ca((function(n,a){var o=n.max(t,!0),i=n.sub(o),s=i.toFloat().sub(i.exp().sum(t,!0).log());return a([s]),{value:s,gradFunc:function(u,c){var l=c[0].exp();return u.sub(u.sum(t,!0).mul(l))}}}))(e)}}),pu=(function(){function r(t,e){this.backend=t,this.dataMover=e,this.data=new WeakMap,this.dataIdsCount=0}return r.prototype.get=function(t){return this.data.has(t)||this.dataMover.moveData(this.backend,t),this.data.get(t)},r.prototype.set=function(t,e){this.dataIdsCount++,this.data.set(t,e)},r.prototype.has=function(t){return this.data.has(t)},r.prototype.delete=function(t){return this.dataIdsCount--,this.data.delete(t)},r.prototype.numDataIds=function(){return this.dataIdsCount},r})(),du=(function(){function r(){}return r.prototype.time=function(t){return F("time")},r.prototype.read=function(t){return F("read")},r.prototype.readSync=function(t){return F("readSync")},r.prototype.numDataIds=function(){return F("numDataIds")},r.prototype.disposeData=function(t){return F("disposeData")},r.prototype.write=function(t,e,n){return F("write")},r.prototype.move=function(t,e,n,a){return F("move")},r.prototype.memory=function(){return F("memory")},r.prototype.floatPrecision=function(){return F("floatPrecision")},r.prototype.epsilon=function(){return this.floatPrecision()===32?1e-7:1e-4},r.prototype.batchMatMul=function(t,e,n,a){return F("batchMatMul")},r.prototype.fusedBatchMatMul=function(t){return t.a,t.b,t.transposeA,t.transposeB,t.bias,t.activation,t.preluActivationWeights,F("fusedBatchMatMul")},r.prototype.slice=function(t,e,n){return F("slice")},r.prototype.stridedSlice=function(t,e,n,a){return F("stridedSlice")},r.prototype.unstack=function(t,e){return F("unstack")},r.prototype.reverse=function(t,e){return F("reverse")},r.prototype.concat=function(t,e){return F("concat")},r.prototype.neg=function(t){return F("neg")},r.prototype.add=function(t,e){return F("add")},r.prototype.addN=function(t){return F("addN")},r.prototype.subtract=function(t,e){return F("subtract")},r.prototype.multiply=function(t,e){return F("multiply")},r.prototype.realDivide=function(t,e){return F("realDivide")},r.prototype.floorDiv=function(t,e){return F("floorDiv")},r.prototype.sum=function(t,e){return F("sum")},r.prototype.prod=function(t,e){return F("prod")},r.prototype.unsortedSegmentSum=function(t,e,n){return F("unsortedSegmentSum")},r.prototype.argMin=function(t,e){return F("argMin")},r.prototype.argMax=function(t,e){return F("argMax")},r.prototype.equal=function(t,e){return F("equal")},r.prototype.notEqual=function(t,e){return F("notEqual")},r.prototype.less=function(t,e){return F("less")},r.prototype.lessEqual=function(t,e){return F("lessEqual")},r.prototype.greater=function(t,e){return F("greater")},r.prototype.greaterEqual=function(t,e){return F("greaterEqual")},r.prototype.logicalNot=function(t){return F("logicalNot")},r.prototype.logicalAnd=function(t,e){return F("logicalAnd")},r.prototype.logicalOr=function(t,e){return F("logicalOr")},r.prototype.where=function(t){return F("where")},r.prototype.select=function(t,e,n){return F("select")},r.prototype.topk=function(t,e,n){return F("topk")},r.prototype.min=function(t,e){return F("min")},r.prototype.minimum=function(t,e){return F("minimum")},r.prototype.mod=function(t,e){return F("mod")},r.prototype.max=function(t,e){return F("max")},r.prototype.maximum=function(t,e){return F("maximum")},r.prototype.all=function(t,e){return F("all")},r.prototype.any=function(t,e){return F("any")},r.prototype.squaredDifference=function(t,e){return F("squaredDifference")},r.prototype.ceil=function(t){return F("ceil")},r.prototype.floor=function(t){return F("floor")},r.prototype.round=function(t){return F("round")},r.prototype.sign=function(t){return F("sign")},r.prototype.isNaN=function(t){return F("isNaN")},r.prototype.isInf=function(t){return F("isInf")},r.prototype.isFinite=function(t){return F("isFinite")},r.prototype.pow=function(t,e){return F("pow")},r.prototype.exp=function(t){return F("exp")},r.prototype.expm1=function(t){return F("expm1")},r.prototype.softmax=function(t,e){return F("softmax")},r.prototype.log=function(t){return F("log")},r.prototype.log1p=function(t){return F("log1p")},r.prototype.sqrt=function(t){return F("sqrt")},r.prototype.rsqrt=function(t){return F("rsqrt")},r.prototype.square=function(t){return F("square")},r.prototype.reciprocal=function(t){return F("reciprocal")},r.prototype.relu=function(t){return F("relu")},r.prototype.relu6=function(t){return F("relu6")},r.prototype.prelu=function(t,e){return F("prelu")},r.prototype.elu=function(t){return F("elu")},r.prototype.eluDer=function(t,e){return F("eluDer")},r.prototype.selu=function(t){return F("selu")},r.prototype.int=function(t){return F("int")},r.prototype.clip=function(t,e,n){return F("clip")},r.prototype.abs=function(t){return F("abs")},r.prototype.complexAbs=function(t){return F("complexAbs")},r.prototype.sigmoid=function(t){return F("sigmoid")},r.prototype.softplus=function(t){return F("softplus")},r.prototype.sin=function(t){return F("sin")},r.prototype.cos=function(t){return F("cos")},r.prototype.tan=function(t){return F("tan")},r.prototype.asin=function(t){return F("asin")},r.prototype.acos=function(t){return F("acos")},r.prototype.atan=function(t){return F("atan")},r.prototype.atan2=function(t,e){return F("atan2")},r.prototype.sinh=function(t){return F("sinh")},r.prototype.cosh=function(t){return F("cosh")},r.prototype.tanh=function(t){return F("tanh")},r.prototype.asinh=function(t){return F("asinh")},r.prototype.acosh=function(t){return F("acosh")},r.prototype.atanh=function(t){return F("atanh")},r.prototype.erf=function(t){return F("erf")},r.prototype.step=function(t,e){return F("step")},r.prototype.fusedConv2d=function(t){return t.input,t.filter,t.convInfo,t.bias,t.activation,t.preluActivationWeights,F("fusedConv2d")},r.prototype.conv2d=function(t,e,n){return F("conv2d")},r.prototype.conv2dDerInput=function(t,e,n){return F("conv2dDerInput")},r.prototype.conv2dDerFilter=function(t,e,n){return F("conv2dDerFilter")},r.prototype.fusedDepthwiseConv2D=function(t){return t.input,t.filter,t.convInfo,t.bias,t.activation,t.preluActivationWeights,F("fusedDepthwiseConv2D")},r.prototype.depthwiseConv2D=function(t,e,n){return F("depthwiseConv2D")},r.prototype.depthwiseConv2DDerInput=function(t,e,n){return F("depthwiseConv2DDerInput")},r.prototype.depthwiseConv2DDerFilter=function(t,e,n){return F("depthwiseConv2DDerFilter")},r.prototype.conv3d=function(t,e,n){return F("conv3d")},r.prototype.conv3dDerInput=function(t,e,n){return F("conv3dDerInput")},r.prototype.conv3dDerFilter=function(t,e,n){return F("conv3dDerFilter")},r.prototype.maxPool=function(t,e){return F("maxPool")},r.prototype.maxPoolBackprop=function(t,e,n,a){return F("maxPoolBackprop")},r.prototype.avgPool=function(t,e){return F("avgPool")},r.prototype.avgPoolBackprop=function(t,e,n){return F("avgPoolBackprop")},r.prototype.avgPool3d=function(t,e){return F("avgPool3d")},r.prototype.avgPool3dBackprop=function(t,e,n){return F("avgPool3dBackprop")},r.prototype.maxPool3d=function(t,e){return F("maxPool3d")},r.prototype.maxPool3dBackprop=function(t,e,n,a){return F("maxPool3dBackprop")},r.prototype.reshape=function(t,e){return F("reshape")},r.prototype.cast=function(t,e){return F("cast")},r.prototype.tile=function(t,e){return F("tile")},r.prototype.pad=function(t,e,n){return F("pad")},r.prototype.transpose=function(t,e){return F("transpose")},r.prototype.gather=function(t,e,n){return F("gather")},r.prototype.gatherND=function(t,e){return F("gatherND")},r.prototype.scatterND=function(t,e,n){return F("scatterND")},r.prototype.batchToSpaceND=function(t,e,n){return F("batchToSpaceND")},r.prototype.spaceToBatchND=function(t,e,n){return F("spaceToBatchND")},r.prototype.resizeBilinear=function(t,e,n,a){return F("resizeBilinear")},r.prototype.resizeBilinearBackprop=function(t,e,n){return F("resizeBilinearBackprop")},r.prototype.resizeNearestNeighbor=function(t,e,n,a){return F("resizeNearestNeighbor")},r.prototype.resizeNearestNeighborBackprop=function(t,e,n){return F("resizeNearestNeighborBackprop")},r.prototype.batchNormalization=function(t,e,n,a,o,i){return F("batchNormalization")},r.prototype.localResponseNormalization4D=function(t,e,n,a,o){return F("localResponseNormalization4D")},r.prototype.LRNGrad=function(t,e,n,a,o,i,s){return F("LRNGrad")},r.prototype.multinomial=function(t,e,n,a){return F("multinomial")},r.prototype.oneHot=function(t,e,n,a){return F("oneHot")},r.prototype.cumsum=function(t,e,n,a){return F("cumsum")},r.prototype.nonMaxSuppression=function(t,e,n,a,o){return F("nonMaxSuppression")},r.prototype.fft=function(t){return F("fft")},r.prototype.ifft=function(t){return F("ifft")},r.prototype.complex=function(t,e){return F("complex")},r.prototype.real=function(t){return F("real")},r.prototype.imag=function(t){return F("imag")},r.prototype.cropAndResize=function(t,e,n,a,o,i){return F("cropAndResize")},r.prototype.depthToSpace=function(t,e,n){return F("depthToSpace")},r.prototype.split=function(t,e,n){return F("split")},r.prototype.sparseToDense=function(t,e,n,a){return F("sparseToDense")},r.prototype.diag=function(t){return F("diag")},r.prototype.fill=function(t,e,n){return F("fill")},r.prototype.onesLike=function(t){return F("onesLike")},r.prototype.zerosLike=function(t){return F("zerosLike")},r.prototype.linspace=function(t,e,n){return F("linspace")},r.prototype.dispose=function(){return F("dispose")},r})();function F(r){throw new Error("'"+r+"' not yet implemented or not found in the registry. Did you forget to import the kernel?")}function Zt(r,t){for(var e=r.length,n=[],a=0;a<e;a++){var o=e-1-a,i=r[o]||1;(t[t.length-1-a]||1)>1&&i===1&&n.unshift(o)}return n}function Be(r,t){for(var e=[],n=0;n<t.length;n++){var a=r[r.length-n-1],o=t.length-n-1,i=t[o];(a==null||a===1&&i>1)&&e.unshift(o)}return e}function me(r,t){for(var e=[],n=Math.max(r.length,t.length),a=0;a<n;a++){var o=r[r.length-a-1];o==null&&(o=1);var i=t[t.length-a-1];if(i==null&&(i=1),o===1)e.unshift(i);else if(i===1)e.unshift(o);else{if(o!==i)throw Error("Operands could not be broadcast together with shapes "+r+" and "+t+".");e.unshift(o)}}return e}function or(r,t,e,n,a,o,i){i===void 0&&(i="channelsLast");var s,u=Jr(t),c=u[0],l=u[1];if(i==="channelsLast")s=[c,l,r[3],r[3]];else{if(i!=="channelsFirst")throw new Error("Unknown dataFormat "+i);s=[c,l,r[1],r[1]]}return wn(r,s,e,n,a,o,!1,i)}function $r(r,t,e,n,a,o,i){i===void 0&&(i="NDHWC");var s,u,c=po(t),l=c[0],h=c[1],f=c[2];if(i==="NDHWC")u="channelsLast",s=[l,h,f,r[4],r[4]];else{if(i!=="NCDHW")throw new Error("Unknown dataFormat "+i);u="channelsFirst",s=[l,h,f,r[1],r[1]]}return Yr(r,s,e,n,a,!1,u,o)}function wn(r,t,e,n,a,o,i,s){i===void 0&&(i=!1),s===void 0&&(s="channelsLast");var u=[-1,-1,-1,-1],c=u[0],l=u[1],h=u[2],f=u[3];if(s==="channelsLast")c=r[0],l=r[1],h=r[2],f=r[3];else{if(s!=="channelsFirst")throw new Error("Unknown dataFormat "+s);c=r[0],f=r[1],l=r[2],h=r[3]}var p,d=t[0],m=t[1],v=t[3],g=Jr(e),x=g[0],b=g[1],y=Jr(n),w=y[0],C=y[1],S=Bn(d,w),I=Bn(m,C),k=(function(M,O,V,U,W,z,H,j){var J,re,le;if(typeof M=="number"){J={top:M,bottom:M,left:M,right:M,type:M===0?"VALID":"NUMBER"};var he=(function(ie,ve,ge,Re,_e){Re==null&&(Re=vu(ie,ve,ge));var Ee=ie[0],at=ie[1],Ct=er((Ee-ve+2*Re)/ge+1,_e);E(Ne(Ct),(function(){return"The output # of rows ("+Ct+") must be an integer. Change the stride and/or zero pad parameters"}));var ot=er((at-ve+2*Re)/ge+1,_e);return E(Ne(ot),(function(){return"The output # of columns ("+ot+") must be an integer. Change the stride and/or zero pad parameters"})),[Ct,ot]})([O,V],z,U,M,j);re=he[0],le=he[1]}else if(M==="same"){re=Math.ceil(O/U),le=Math.ceil(V/W);var pe=Math.max(0,(re-1)*U+z-O),K=Math.max(0,(le-1)*W+H-V),Z=Math.floor(pe/2),oe=pe-Z,ae=Math.floor(K/2);J={top:Z,bottom:oe,left:ae,right:K-ae,type:"SAME"}}else{if(M!=="valid")throw Error("Unknown padding parameter: "+M);J={top:0,bottom:0,left:0,right:0,type:"VALID"},re=Math.ceil((O-z+1)/U),le=Math.ceil((V-H+1)/W)}return{padInfo:J,outHeight:re,outWidth:le}})(a,l,h,x,b,S,I,o),R=k.padInfo,N=k.outHeight,A=k.outWidth,L=i?v*f:v;return s==="channelsFirst"?p=[c,L,N,A]:s==="channelsLast"&&(p=[c,N,A,L]),{batchSize:c,dataFormat:s,inHeight:l,inWidth:h,inChannels:f,outHeight:N,outWidth:A,outChannels:L,padInfo:R,strideHeight:x,strideWidth:b,filterHeight:d,filterWidth:m,effectiveFilterHeight:S,effectiveFilterWidth:I,dilationHeight:w,dilationWidth:C,inShape:r,outShape:p,filterShape:t}}function Yr(r,t,e,n,a,o,i,s){o===void 0&&(o=!1),i===void 0&&(i="channelsLast");var u=[-1,-1,-1,-1,-1],c=u[0],l=u[1],h=u[2],f=u[3],p=u[4];if(i==="channelsLast")c=r[0],l=r[1],h=r[2],f=r[3],p=r[4];else{if(i!=="channelsFirst")throw new Error("Unknown dataFormat "+i);c=r[0],p=r[1],l=r[2],h=r[3],f=r[4]}var d,m=t[0],v=t[1],g=t[2],x=t[4],b=po(e),y=b[0],w=b[1],C=b[2],S=po(n),I=S[0],k=S[1],R=S[2],N=Bn(m,I),A=Bn(v,k),L=Bn(g,R),M=(function(H,j,J,re,le,he,pe,K,Z,oe,ae){var ie,ve,ge,Re;if(typeof H=="number"){ie={top:H,bottom:H,left:H,right:H,front:H,back:H,type:H===0?"VALID":"NUMBER"};var _e=(function(kn,Ut,Ca,Rn,_t,_a){_t==null&&(_t=vu(kn,Ut,Rn));var rl=kn[0],al=kn[1],ol=kn[2],Ea=er((rl-Ut+2*_t)/Rn+1,_a);E(Ne(Ea),(function(){return"The output # of depths ("+Ea+") must be an integer. Change the stride and/or zero pad parameters"}));var ka=er((al-Ut+2*_t)/Rn+1,_a);E(Ne(ka),(function(){return"The output # of rows ("+ka+") must be an integer. Change the stride and/or zero pad parameters"}));var Ra=er((ol-Ut+2*_t)/Rn+1,_a);return E(Ne(Ra),(function(){return"The output # of columns ("+Ra+") must be an integer. Change the stride and/or zero pad parameters"})),[Ea,ka,Ra,Ca]})([j,J,re,1],K,1,le,H,ae);ve=_e[0],ge=_e[1],Re=_e[2]}else if(H==="same"){ve=Math.ceil(j/le),ge=Math.ceil(J/he),Re=Math.ceil(re/pe);var Ee=(ve-1)*le+K-j,at=(ge-1)*he+Z-J,Ct=(Re-1)*pe+oe-re,ot=Math.floor(Ee/2),En=Ee-ot,Lt=Math.floor(at/2),Yt=at-Lt,Wt=Math.floor(Ct/2);ie={top:Lt,bottom:Yt,left:Wt,right:Ct-Wt,front:ot,back:En,type:"SAME"}}else{if(H!=="valid")throw Error("Unknown padding parameter: "+H);ie={top:0,bottom:0,left:0,right:0,front:0,back:0,type:"VALID"},ve=Math.ceil((j-K+1)/le),ge=Math.ceil((J-Z+1)/he),Re=Math.ceil((re-oe+1)/pe)}return{padInfo:ie,outDepth:ve,outHeight:ge,outWidth:Re}})(a,l,h,f,y,w,C,N,A,L,s),O=M.padInfo,V=M.outDepth,U=M.outHeight,W=M.outWidth,z=o?x*p:x;return i==="channelsFirst"?d=[c,z,V,U,W]:i==="channelsLast"&&(d=[c,V,U,W,z]),{batchSize:c,dataFormat:i,inDepth:l,inHeight:h,inWidth:f,inChannels:p,outDepth:V,outHeight:U,outWidth:W,outChannels:z,padInfo:O,strideDepth:y,strideHeight:w,strideWidth:C,filterDepth:m,filterHeight:v,filterWidth:g,effectiveFilterDepth:N,effectiveFilterHeight:A,effectiveFilterWidth:L,dilationDepth:I,dilationHeight:k,dilationWidth:R,inShape:r,outShape:d,filterShape:t}}function vu(r,t,e,n){n===void 0&&(n=1);var a=Bn(t,n);return Math.floor((r[0]*(e-1)-e+a)/2)}function Jr(r){return typeof r=="number"?[r,r,r]:r.length===2?[r[0],r[1],1]:r}function po(r){return typeof r=="number"?[r,r,r]:r}function Bn(r,t){return t<=1?r:r+(r-1)*(t-1)}function er(r,t){if(!t)return r;switch(t){case"round":return Math.round(r);case"ceil":return Math.ceil(r);case"floor":return Math.floor(r);default:throw new Error("Unknown roundingMode "+t)}}function qn(r){var t=Jr(r),e=t[0],n=t[1],a=t[2];return e===1&&n===1&&a===1}function rt(r,t){return qn(r)||qn(t)}function Fo(r){if(r==="NHWC")return"channelsLast";if(r==="NCHW")return"channelsFirst";throw new Error("Unknown dataFormat "+r)}function mu(r,t,e){if(t==="complex64"){if(r.dtype==="complex64")return r.clone();var n=Ie(r.shape),a=r.toFloat(),o=e.complex(a,n);return n.dispose(),a.dispose(),o}if(!yl(r.dtype,t))return T.makeTensorFromDataId(r.dataId,r.shape,t);if(r.dtype==="complex64"){var i=e.real(r);return o=i.cast(t),i.dispose(),o}if(t==="int32")return e.int(r);if(t==="bool"){var s=q(0,r.dtype);return o=e.notEqual(r,s),s.dispose(),o}throw new Error("Error in Cast: failed to cast "+r.dtype+" to "+t)}function vo(r,t){return T.makeTensorFromDataId(r.dataId,t,r.dtype)}function gu(r,t,e){var n=(t-r)/(e-1),a=lr(e,"float32");a[0]=r;for(var o=1;o<a.length;o++)a[o]=a[o-1]+n;return Fe(a,"float32")}function mo(r,t){if(r.length!==t.length)throw new Error("Cannot merge real and imag arrays of different lengths. real:"+r.length+", imag: "+t.length+".");for(var e=new Float32Array(2*r.length),n=0;n<e.length;n+=2)e[n]=r[n/2],e[n+1]=t[n/2];return e}function zi(r,t){return{real:r[2*t],imag:r[2*t+1]}}function qh(r,t,e,n){r[2*n]=t,r[2*n+1]=e}function Kh(r,t,e){var n=(e?2:-2)*Math.PI*(r/t);return{real:Math.cos(n),imag:Math.sin(n)}}function Xh(r,t,e){var n=(function(o,i,s){return(function(u,c,l){for(var h=0,f=u.length,p=0,d=!1;h<f;){var m=l(c,u[p=h+(f-h>>>1)]);m>0?h=p+1:(f=p,d=!m)}return d?h:-h-1})(o,i,s||$h)})(r,t,e),a=n<0?-(n+1):n;r.splice(a,0,t)}function $h(r,t){return r>t?1:r<t?-1:0}function Po(r,t,e,n,a){return yu(r,t,e,n,a,0).selectedIndices}function Mo(r,t,e,n,a,o){var i=yu(r,t,e,n,a,o);return i.numValidOutputs.dispose(),{selectedIndices:i.selectedIndices,selectedScores:i.selectedScores}}function yu(r,t,e,n,a,o,i,s){s===void 0&&(s=!1);for(var u=Array.from(t).map((function(y,w){return{score:y,boxIndex:w,suppressBeginIndex:0}})).filter((function(y){return y.score>a})).sort(Vi),c=o>0?-.5/o:0,l=[],h=[];l.length<e&&u.length>0;){var f=u.pop(),p=f.score,d=f.boxIndex,m=f.suppressBeginIndex;if(p<a)break;for(var v=!1,g=l.length-1;g>=m;--g){var x=Yh(r,d,l[g]);if(x>=n){v=!0;break}if(f.score=f.score*Jh(n,c,x),f.score<=a)break}f.suppressBeginIndex=l.length,v||(f.score===p?(l.push(d),h.push(f.score)):f.score>a&&Xh(u,f,Vi))}var b=l.length;return s&&(l.fill(0,b),h.fill(0,b)),{selectedIndices:Fe(l,"int32"),selectedScores:Fe(h,"float32"),numValidOutputs:q(b,"int32")}}function Yh(r,t,e){var n=r.subarray(4*t,4*t+4),a=r.subarray(4*e,4*e+4),o=Math.min(n[0],n[2]),i=Math.min(n[1],n[3]),s=Math.max(n[0],n[2]),u=Math.max(n[1],n[3]),c=Math.min(a[0],a[2]),l=Math.min(a[1],a[3]),h=Math.max(a[0],a[2]),f=Math.max(a[1],a[3]),p=(s-o)*(u-i),d=(h-c)*(f-l);if(p<=0||d<=0)return 0;var m=Math.max(o,c),v=Math.max(i,l),g=Math.min(s,h),x=Math.min(u,f),b=Math.max(g-m,0)*Math.max(x-v,0);return b/(p+d-b)}function Jh(r,t,e){var n=Math.exp(t*e*e);return e<=r?n:0}function Vi(r,t){return r.score-t.score||r.score===t.score&&t.boxIndex-r.boxIndex}function xu(r,t,e){var n=new Array(r.rank).fill(0),a=r.shape.slice();return t.map((function(o){a[e]=o;var i=r.slice(n,a);return n[e]+=o,i}))}function bu(r,t){for(var e=new Array(r.rank),n=0;n<e.length;n++)e[n]=r.shape[n]*t[n];var a=ce(e,r.dtype);for(n=0;n<a.values.length;++n){for(var o=a.indexToLoc(n),i=new Array(r.rank),s=0;s<i.length;s++)i[s]=o[s]%r.shape[s];var u=r.locToIndex(i);a.values[n]=r.values[u]}return a.toTensor()}function wu(r,t,e,n,a){for(var o=t[t.length-1],i=[r.length/o,o],s=i[0],u=i[1],c=nr(e,s*n),l=nr("int32",s*n),h=0;h<s;h++){for(var f=h*u,p=r.subarray(f,f+u),d=[],m=0;m<p.length;m++)d.push({value:p[m],index:m});d.sort((function(y,w){return w.value-y.value}));var v=h*n,g=c.subarray(v,v+n),x=l.subarray(v,v+n);for(m=0;m<n;m++)g[m]=d[m].value,x[m]=d[m].index}var b=t.slice();return b[b.length-1]=n,[je(c,b,e),je(l,b,"int32")]}function Oo(r,t){for(var e=[],n=0;n<t.length;n++)t[n]&&e.push(n);var a=ce(r,"int32"),o=ce([e.length,r.length],"int32");for(n=0;n<e.length;n++){var i=a.indexToLoc(e[n]),s=n*r.length;o.values.set(i,s)}return o.toTensor()}var Qh=function(r,t){this.outputShape=[],this.outputShape=r,this.variableNames=t.map((function(a,o){return"T"+o}));var e=[];this.variableNames.forEach((function(a){e.push("float v"+a+" = get"+a+"AtOutCoords();")}));var n=this.variableNames.map((function(a){return"v"+a})).join(" + ");this.userCode=`
      void main() {
        `+e.join(`
        `)+`

        float result = `+n+`;
        setOutput(result);
      }
    `},Zh=function(r,t){this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=r,this.variableNames=t.map((function(a,o){return"T"+o}));var e=[];this.variableNames.forEach((function(a){e.push("vec4 v"+a+" = get"+a+"AtOutCoords();")}));var n=this.variableNames.map((function(a){return"v"+a})).join(" + ");this.userCode=`
      void main() {
        `+e.join(`
        `)+`

        vec4 result = `+n+`;
        setOutput(result);
      }
    `},ef=function(r,t,e){this.variableNames=["A"];var n=r.windowSize,a=r.batchSize,o=r.inSize,i=Math.ceil(o/n);e||this.variableNames.push("bestIndicesA"),this.outputShape=[a,i];var s=t==="max"?">":"<",u=e?"inOffset + i;":"round(getBestIndicesA(batch, inOffset + i));";this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * `+n+`;

        int bestIndex = inOffset;
        float bestValue = getA(batch, bestIndex);

        for (int i = 0; i < `+n+`; i++) {
          int inIdx = `+u+`;
          float candidate = getA(batch, inIdx);
          if (candidate `+s+` bestValue) {
            bestValue = candidate;
            bestIndex = inIdx;
          }
        }
        setOutput(float(bestIndex));
      }
    `};function Cu(r,t){return["x","y","z","w","u","v"].slice(0,t).map((function(e){return r+"."+e}))}function et(r,t){return t===1?[r]:Cu(r,t)}function Xe(){var r,t,e,n,a,o,i,s,u,c;return B().getNumber("WEBGL_VERSION")===2?(r="#version 300 es",t="in",e="out",n="in",a="texture",o="outputColor",i="out vec4 outputColor;",s=`
      bool isnan_custom(float val) {
        return (val > 0.0 || val < 0.0) ? false : val != 0.0;
      }

      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan_custom(val.x),
          isnan_custom(val.y), isnan_custom(val.z), isnan_custom(val.w));
      }

      #define isnan(value) isnan_custom(value)
    `,u="",c=`
      #define round(value) newRound(value)
      int newRound(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 newRound(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `):(r="",t="attribute",e="varying",n="varying",a="texture2D",o="gl_FragColor",i="",s=`
      #define isnan(value) isnan_custom(value)
      bool isnan_custom(float val) {
        return (val > 0. || val < 1. || val == 0.) ? false : true;
      }
      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan(val.x), isnan(val.y), isnan(val.z), isnan(val.w));
      }
    `,u=`
      uniform float INFINITY;

      bool isinf(float val) {
        return abs(val) == INFINITY;
      }
      bvec4 isinf(vec4 val) {
        return equal(abs(val), vec4(INFINITY));
      }
    `,c=`
      int round(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 round(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `),{version:r,attribute:t,varyingVs:e,varyingFs:n,texture2D:a,output:o,defineOutput:i,defineSpecialNaN:s,defineSpecialInf:u,defineRound:c}}function dn(r,t,e){e===void 0&&(e="index");var n=Tt(t);return n.map((function(a,o){return"int "+r[o]+" = "+e+" / "+a+"; "+(o===n.length-1?"int "+r[o+1]+" = "+e+" - "+r[o]+" * "+a:"index -= "+r[o]+" * "+a)+";"})).join("")}function Bo(r){var t=Tt(r).map((function(e){return e.toString()}));return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * `+t[0]+" + coords.y * "+t[1]+` + coords.z;
  }
`}var _u=`
  const float FLOAT_MAX = 1.70141184e38;
  const float FLOAT_MIN = 1.17549435e-38;

  lowp vec4 encode_float(highp float v) {
    if (isnan(v)) {
      return vec4(255, 255, 255, 255);
    }

    highp float av = abs(v);

    if(av < FLOAT_MIN) {
      return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
      return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
      return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    highp float e = floor(log2(av));
    highp float m = exp2(fract(log2(av))) - 1.0;

    c[2] = floor(128.0 * m);
    m -= c[2] / 128.0;
    c[1] = floor(32768.0 * m);
    m -= c[1] / 32768.0;
    c[0] = floor(8388608.0 * m);

    highp float ebias = e + 127.0;
    c[3] = floor(ebias / 2.0);
    ebias -= c[3] * 2.0;
    c[2] += floor(ebias) * 128.0;

    c[3] += 128.0 * step(0.0, -v);

    return c / 255.0;
  }
`;function tf(r,t,e,n){var a=[];r.forEach((function(p){var d=Q(p.shapeInfo.logicalShape);p.shapeInfo.isUniform?a.push("uniform float "+p.name+(d>1?"["+d+"]":"")+";"):(a.push("uniform sampler2D "+p.name+";"),a.push("uniform int offset"+p.name+";"))}));var o,i,s=a.join(`
`),u=r.map((function(p){return(function(d,m,v){v===void 0&&(v=!1);var g="";g+=v?Eu(d):Tn(d);var x=d.shapeInfo.logicalShape,b=m.logicalShape;return x.length<=b.length&&(g+=v?(function(y,w){var C,S=y.name,I=S.charAt(0).toUpperCase()+S.slice(1),k="get"+I+"AtOutCoords",R=y.shapeInfo.logicalShape.length,N=w.logicalShape.length,A=Zt(y.shapeInfo.logicalShape,w.logicalShape),L=ke(N),M=N-R,O=["x","y","z","w","u","v"];C=R===0?"":N<2&&A.length>=1?"coords = 0;":A.map((function(J){return"coords."+O[J+M]+" = 0;"})).join(`
`);var V="";V=N<2&&R>0?"coords":y.shapeInfo.logicalShape.map((function(J,re){return"coords."+O[re+M]})).join(", ");var U="return outputValue;",W=Q(y.shapeInfo.logicalShape)===1,z=Q(w.logicalShape)===1;if(R!==1||W||z){if(W&&!z)U=N===1?`
        return vec4(outputValue.x, outputValue.x, 0., 0.);
      `:`
        return vec4(outputValue.x);
      `;else if(A.length){var H=R-2,j=R-1;A.indexOf(H)>-1&&A.indexOf(j)>-1?U="return vec4(outputValue.x);":A.indexOf(H)>-1?U="return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);":A.indexOf(j)>-1&&(U="return vec4(outputValue.xx, outputValue.zz);")}}else U=`
      return vec4(outputValue.xy, outputValue.xy);
    `;return`
    vec4 `+k+`() {
      `+L+` coords = getOutputCoords();
      `+C+`
      vec4 outputValue = get`+I+"("+V+`);
      `+U+`
    }
  `})(d,m):(function(y,w){var C=y.name,S=C.charAt(0).toUpperCase()+C.slice(1),I="get"+S+"AtOutCoords",k=w.texShape,R=y.shapeInfo.texShape,N=y.shapeInfo.logicalShape.length,A=w.logicalShape.length;if(!y.shapeInfo.isUniform&&N===A&&y.shapeInfo.flatOffset==null&&ze(R,k))return`
      float `+I+`() {
        return sampleTexture(`+C+`, resultUV);
      }
    `;var L,M=ke(A),O=Zt(y.shapeInfo.logicalShape,w.logicalShape),V=A-N,U=["x","y","z","w","u","v"];L=N===0?"":A<2&&O.length>=1?"coords = 0;":O.map((function(z){return"coords."+U[z+V]+" = 0;"})).join(`
`);var W="";return W=A<2&&N>0?"coords":y.shapeInfo.logicalShape.map((function(z,H){return"coords."+U[H+V]})).join(", "),`
    float `+I+`() {
      `+M+` coords = getOutputCoords();
      `+L+`
      return get`+S+"("+W+`);
    }
  `})(d,m)),g})(p,t,n)})).join(`
`),c=t.texShape,l=Xe(),h=(function(p){return`
    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return `+p.texture2D+`(textureSampler, uv).r;
    }
  `})(l),f=(function(p){return p.version+`
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    `+p.varyingFs+` vec2 resultUV;
    `+p.defineOutput+`
    const vec2 halfCR = vec2(0.5, 0.5);

    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    uniform float NAN;
    `+p.defineSpecialNaN+`
    `+p.defineSpecialInf+`
    `+p.defineRound+`

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    int idiv(int a, int b, float sign) {
      int res = a / b;
      int mod = imod(a, b);
      if (sign < 0. && mod != 0) {
        res -= 1;
      }
      return res;
    }

    //Based on the work of Dave Hoskins
    //https://www.shadertoy.com/view/4djSRW
    #define HASHSCALE1 443.8975
    float random(float seed){
      vec2 p = resultUV * seed;
      vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
      p3 += dot(p3, p3.yzx + 19.19);
      return fract((p3.x + p3.y) * p3.z);
    }

    `+nf+`
    `+rf+`
    `+af+`
  `})(l);return t.isPacked?(o=(function(p,d){switch(p.length){case 0:return`
    int getOutputCoords() {
      return 0;
    }
  `;case 1:return(function(y,w){var C=[Math.ceil(w[0]/2),Math.ceil(w[1]/2)];return C[0]===1?`
      int getOutputCoords() {
        return 2 * int(resultUV.x * `+C[1]+`.0);
      }
    `:C[1]===1?`
      int getOutputCoords() {
        return 2 * int(resultUV.y * `+C[0]+`.0);
      }
    `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(`+C[0]+", "+C[1]+`));
      return 2 * (resTexRC.x * `+C[1]+` + resTexRC.y);
    }
  `})(0,d);case 2:return(function(y,w){var C=[Math.ceil(w[0]/2),Math.ceil(w[1]/2)];if(ze(y,w))return`
      ivec2 getOutputCoords() {
        return 2 * ivec2(resultUV.yx * vec2(`+C[0]+", "+C[1]+`));
      }
    `;var S=Math.ceil(y[1]/2);return`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(`+C[0]+", "+C[1]+`));

      int index = resTexRC.x * `+C[1]+` + resTexRC.y;
      int r = 2 * (index / `+S+`);
      int c = imod(index, `+S+`) * 2;

      return ivec2(r, c);
    }
  `})(p,d);case 3:return m=p,v=d,g=[Math.ceil(v[0]/2),Math.ceil(v[1]/2)],x=Math.ceil(m[2]/2),b=x*Math.ceil(m[1]/2),`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(`+g[0]+", "+g[1]+`));
      int index = resTexRC.x * `+g[1]+` + resTexRC.y;

      int b = index / `+b+`;
      index -= b * `+b+`;

      int r = 2 * (index / `+x+`);
      int c = imod(index, `+x+`) * 2;

      return ivec3(b, r, c);
    }
  `;default:return(function(y,w){for(var C=[Math.ceil(w[0]/2),Math.ceil(w[1]/2)],S=Math.ceil(y[y.length-1]/2),I=S*Math.ceil(y[y.length-2]/2),k=I,R="",N="b, r, c",A=2;A<y.length-1;A++)k*=y[y.length-A-1],R=`
      int b`+A+" = index / "+k+`;
      index -= b`+A+" * "+k+`;
    `+R,N="b"+A+", "+N;return`
    ivec`+y.length+` getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(`+C[0]+", "+C[1]+`));
      int index = resTexRC.x * `+C[1]+` + resTexRC.y;

      `+R+`

      int b = index / `+I+`;
      index -= b * `+I+`;

      int r = 2 * (index / `+S+`);
      int c = imod(index, `+S+`) * 2;

      return ivec`+y.length+"("+N+`);
    }
  `})(p,d)}var m,v,g,x,b})(t.logicalShape,c),i=(function(p){return`
    void setOutput(vec4 val) {
      `+p.output+` = val;
    }
  `})(l)):(o=(function(p,d){switch(p.length){case 0:return`
    int getOutputCoords() {
      return 0;
    }
  `;case 1:return(function(g,x){return x[0]===1?`
      int getOutputCoords() {
        return int(resultUV.x * `+x[1]+`.0);
      }
    `:x[1]===1?`
      int getOutputCoords() {
        return int(resultUV.y * `+x[0]+`.0);
      }
    `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(`+x[0]+", "+x[1]+`));
      return resTexRC.x * `+x[1]+` + resTexRC.y;
    }
  `})(0,d);case 2:return(function(g,x){return ze(g,x)?`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(`+x[0]+", "+x[1]+`));
      }
    `:g[1]===1?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(`+x[0]+", "+x[1]+`));
        int index = resTexRC.x * `+x[1]+` + resTexRC.y;
        return ivec2(index, 0);
      }
    `:g[0]===1?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(`+x[0]+", "+x[1]+`));
        int index = resTexRC.x * `+x[1]+` + resTexRC.y;
        return ivec2(0, index);
      }
    `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(`+x[0]+", "+x[1]+`));
      int index = resTexRC.x * `+x[1]+` + resTexRC.y;
      int r = index / `+g[1]+`;
      int c = index - r * `+g[1]+`;
      return ivec2(r, c);
    }
  `})(p,d);case 3:return m=d,v=dn(["r","c","d"],p),`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(`+m[0]+", "+m[1]+`));
      int index = resTexRC.x * `+m[1]+` + resTexRC.y;
      `+v+`
      return ivec3(r, c, d);
    }
  `;case 4:return(function(g,x){var b=dn(["r","c","d","d2"],g);return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(`+x[0]+", "+x[1]+`));
      int index = resTexRC.x * `+x[1]+` + resTexRC.y;
      `+b+`
      return ivec4(r, c, d, d2);
    }
  `})(p,d);case 5:return(function(g,x){var b=dn(["r","c","d","d2","d3"],g);return`
    ivec5 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx * vec2(`+x[0]+`,
                             `+x[1]+`));

      int index = resTexRC.x * `+x[1]+` + resTexRC.y;

      `+b+`

      ivec5 outShape = ivec5(r, c, d, d2, d3);
      return outShape;
    }
  `})(p,d);case 6:return(function(g,x){var b=dn(["r","c","d","d2","d3","d4"],g);return`
    ivec6 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(`+x[0]+", "+x[1]+`));
      int index = resTexRC.x * `+x[1]+` + resTexRC.y;

      `+b+`

      ivec6 result = ivec6(r, c, d, d2, d3, d4);
      return result;
    }
  `})(p,d);default:throw new Error(p.length+"-D output sampling is not yet supported")}var m,v})(t.logicalShape,c),i=(function(p){return`
    void setOutput(float val) {
      `+p.output+` = vec4(val, 0, 0, 0);
    }
  `})(l)),n&&(f+=of),[f,h,i,s,o,u,e].join(`
`)}function Tn(r){var t=r.shapeInfo.logicalShape;switch(t.length){case 0:return(function(e){var n=e.name,a="get"+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return"float "+a+"() {return "+n+";}";var o=e.shapeInfo.texShape,i=o[0],s=o[1];if(i===1&&s===1)return`
      float `+a+`() {
        return sampleTexture(`+n+`, halfCR);
      }
    `;var u=e.shapeInfo.texShape,c=u[0],l=u[1],h=ln(n);return`
    float `+a+`() {
      vec2 uv = uvFromFlat(`+c+", "+l+", "+h+`);
      return sampleTexture(`+n+`, uv);
    }
  `})(r);case 1:return(function(e){var n=e.name,a="get"+n.charAt(0).toUpperCase()+n.slice(1);if(e.shapeInfo.isUniform)return`
      float `+a+`(int index) {
        `+In(e)+`
      }
    `;var o=e.shapeInfo.texShape,i=o[0],s=o[1];if(s===1&&i===1)return`
      float `+a+`(int index) {
        return sampleTexture(`+n+`, halfCR);
      }
    `;var u=ln(n);return s===1?`
      float `+a+`(int index) {
        vec2 uv = vec2(0.5, (float(index + `+u+") + 0.5) / "+i+`.0);
        return sampleTexture(`+n+`, uv);
      }
    `:i===1?`
      float `+a+`(int index) {
        vec2 uv = vec2((float(index + `+u+") + 0.5) / "+s+`.0, 0.5);
        return sampleTexture(`+n+`, uv);
      }
    `:`
    float `+a+`(int index) {
      vec2 uv = uvFromFlat(`+i+", "+s+", index + "+u+`);
      return sampleTexture(`+n+`, uv);
    }
  `})(r);case 2:return(function(e){var n=e.shapeInfo.logicalShape,a=e.name,o="get"+a.charAt(0).toUpperCase()+a.slice(1),i=e.shapeInfo.texShape;if(i!=null&&ze(n,i)){var s=i[0],u=i[1];return`
    float `+o+`(int row, int col) {
      vec2 uv = (vec2(col, row) + halfCR) / vec2(`+u+".0, "+s+`.0);
      return sampleTexture(`+a+`, uv);
    }
  `}var c=pn(n),l=c.newShape,h=c.keptDims,f=l;if(f.length<n.length){var p=Nn(e,f);return`
      `+Tn(p)+`
      float `+o+`(int row, int col) {
        return `+o+"("+Fn(["row","col"],h)+`);
      }
    `}if(e.shapeInfo.isUniform)return`
      float `+o+`(int row, int col) {
        int index = round(dot(vec2(row, col), vec2(`+n[1]+`, 1)));
        `+In(e)+`
      }
    `;var d=i[0],m=i[1],v=ln(a);return m===1?`
    float `+o+`(int row, int col) {
      float index = dot(vec3(row, col, `+v+"), vec3("+n[1]+`, 1, 1));
      vec2 uv = vec2(0.5, (index + 0.5) / `+d+`.0);
      return sampleTexture(`+a+`, uv);
    }
  `:d===1?`
    float `+o+`(int row, int col) {
      float index = dot(vec3(row, col, `+v+"), vec3("+n[1]+`, 1, 1));
      vec2 uv = vec2((index + 0.5) / `+m+`.0, 0.5);
      return sampleTexture(`+a+`, uv);
    }
  `:`
  float `+o+`(int row, int col) {
    // Explicitly use integer operations as dot() only works on floats.
    int index = row * `+n[1]+" + col + "+v+`;
    vec2 uv = uvFromFlat(`+d+", "+m+`, index);
    return sampleTexture(`+a+`, uv);
  }
`})(r);case 3:return(function(e){var n=e.shapeInfo.logicalShape,a=e.name,o="get"+a.charAt(0).toUpperCase()+a.slice(1),i=n[1]*n[2],s=n[2],u=pn(n),c=u.newShape,l=u.keptDims,h=c;if(h.length<n.length){var f=Nn(e,h);return`
        `+Tn(f)+`
        float `+o+`(int row, int col, int depth) {
          return `+o+"("+Fn(["row","col","depth"],l)+`);
        }
      `}if(e.shapeInfo.isUniform)return`
      float `+o+`(int row, int col, int depth) {
        int index = round(dot(vec3(row, col, depth),
                          vec3(`+i+", "+s+`, 1)));
        `+In(e)+`
      }
    `;var p=e.shapeInfo.texShape,d=p[0],m=p[1],v=e.shapeInfo.flatOffset;if(m===i&&v==null)return`
        float `+o+`(int row, int col, int depth) {
          float texR = float(row);
          float texC = dot(vec2(col, depth), vec2(`+s+`, 1));
          vec2 uv = (vec2(texC, texR) + halfCR) /
                     vec2(`+m+".0, "+d+`.0);
          return sampleTexture(`+a+`, uv);
        }
      `;if(m===s&&v==null)return`
    float `+o+`(int row, int col, int depth) {
      float texR = dot(vec2(row, col), vec2(`+n[1]+`, 1));
      float texC = float(depth);
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(`+m+".0, "+d+`.0);
      return sampleTexture(`+a+`, uv);
    }
  `;var g=ln(a);return`
      float `+o+`(int row, int col, int depth) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * `+i+" + col * "+s+" + depth + "+g+`;
        vec2 uv = uvFromFlat(`+d+", "+m+`, index);
        return sampleTexture(`+a+`, uv);
      }
  `})(r);case 4:return(function(e){var n=e.shapeInfo.logicalShape,a=e.name,o="get"+a.charAt(0).toUpperCase()+a.slice(1),i=n[3],s=n[2]*i,u=n[1]*s,c=pn(n),l=c.newShape,h=c.keptDims;if(l.length<n.length){var f=Nn(e,l);return`
      `+Tn(f)+`
      float `+o+`(int row, int col, int depth, int depth2) {
        return `+o+"("+Fn(["row","col","depth","depth2"],h)+`);
      }
    `}if(e.shapeInfo.isUniform)return`
      float `+o+`(int row, int col, int depth, int depth2) {
        int index = round(dot(vec4(row, col, depth, depth2),
                          vec4(`+u+", "+s+", "+i+`, 1)));
        `+In(e)+`
      }
    `;var p=e.shapeInfo.flatOffset,d=e.shapeInfo.texShape,m=d[0],v=d[1];if(v===u&&p==null)return`
      float `+o+`(int row, int col, int depth, int depth2) {
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(`+s+", "+i+`, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(`+v+".0, "+m+`.0);
        return sampleTexture(`+a+`, uv);
      }
    `;if(v===i&&p==null)return`
      float `+o+`(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(`+n[1]*n[2]+", "+n[2]+`, 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(`+v+".0, "+m+`.0);
        return sampleTexture(`+a+`, uv);
      }
    `;var g=ln(a);return`
    float `+o+`(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * `+u+" + col * "+s+` +
          depth * `+i+` + depth2;
      vec2 uv = uvFromFlat(`+m+", "+v+", index + "+g+`);
      return sampleTexture(`+a+`, uv);
    }
  `})(r);case 5:return(function(e){var n=e.shapeInfo.logicalShape,a=e.name,o="get"+a.charAt(0).toUpperCase()+a.slice(1),i=n[4],s=n[3]*i,u=n[2]*s,c=n[1]*u,l=pn(n),h=l.newShape,f=l.keptDims;if(h.length<n.length){var p=Nn(e,h);return`
      `+Tn(p)+`
      float `+o+`(int row, int col, int depth, int depth2, int depth3) {
        return `+o+"("+Fn(["row","col","depth","depth2","depth3"],f)+`);
      }
    `}if(e.shapeInfo.isUniform)return`
      float `+o+`(int row, int col, int depth, int depth2, int depth3) {
        float index = dot(
          vec4(row, col, depth, depth2),
          vec4(`+c+", "+u+", "+s+", "+i+`)) +
          depth3;
        `+In(e)+`
      }
    `;var d=e.shapeInfo.flatOffset,m=e.shapeInfo.texShape,v=m[0],g=m[1];if(g===c&&d==null)return`
      float `+o+`(int row, int col, int depth, int depth2, int depth3) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
                         vec4(`+u+", "+s+", "+i+`, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(`+g+".0, "+v+`.0);
        return sampleTexture(`+a+`, uv);
      }
    `;if(g===i&&d==null)return`
      float `+o+`(int row, int col, int depth, int depth2, int depth3) {
        float texR = dot(
          vec4(row, col, depth, depth2),
          vec4(`+n[1]*n[2]*n[3]+`,
               `+n[2]*n[3]+", "+n[3]+`, 1));
        int texC = depth3;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(`+g+".0, "+v+`.0);
        return sampleTexture(`+a+`, uv);
      }
    `;var x=ln(a);return`
    float `+o+`(int row, int col, int depth, int depth2, int depth3) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * `+c+" + col * "+u+" + depth * "+s+` +
          depth2 * `+i+" + depth3 + "+x+`;
      vec2 uv = uvFromFlat(`+v+", "+g+`, index);
      return sampleTexture(`+a+`, uv);
    }
  `})(r);case 6:return(function(e){var n=e.shapeInfo.logicalShape,a=e.name,o="get"+a.charAt(0).toUpperCase()+a.slice(1),i=pn(n),s=i.newShape,u=i.keptDims;if(s.length<n.length){var c=Nn(e,s);return`
      `+Tn(c)+`
      float `+o+`(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        return `+o+"("+Fn(["row","col","depth","depth2","depth3","depth4"],u)+`);
      }
    `}var l=n[5],h=n[4]*l,f=n[3]*h,p=n[2]*f,d=n[1]*p;if(e.shapeInfo.isUniform)return`
      float `+o+`(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
        int index = round(dot(
          vec4(row, col, depth, depth2),
          vec4(`+d+", "+p+", "+f+", "+h+`)) +
          dot(
            vec2(depth3, depth4),
            vec2(`+l+`, 1)));
        `+In(e)+`
      }
    `;var m=e.shapeInfo.flatOffset,v=e.shapeInfo.texShape,g=v[0],x=v[1];if(x===d&&m==null)return`
      float `+o+`(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
          vec4(`+p+", "+f+", "+h+", "+l+`)) +
               float(depth4);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(`+x+".0, "+g+`.0);
        return sampleTexture(`+a+`, uv);
      }
    `;if(x===l&&m==null)return`
      float `+o+`(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        float texR = dot(vec4(row, col, depth, depth2),
          vec4(`+n[1]*n[2]*n[3]*n[4]+`,
               `+n[2]*n[3]*n[4]+`,
               `+n[3]*n[4]+`,
               `+n[4]+`)) + float(depth3);
        int texC = depth4;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(`+x+".0, "+g+`.0);
        return sampleTexture(`+a+`, uv);
      }
    `;var b=ln(a);return`
    float `+o+`(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * `+d+" + col * "+p+" + depth * "+f+` +
          depth2 * `+h+" + depth3 * "+l+" + depth4 + "+b+`;
      vec2 uv = uvFromFlat(`+g+", "+x+`, index);
      return sampleTexture(`+a+`, uv);
    }
  `})(r);default:throw new Error(t.length+"-D input sampling is not yet supported")}}function Eu(r){var t,e,n;switch(r.shapeInfo.logicalShape.length){case 0:return t=r.name,e="get"+t.charAt(0).toUpperCase()+t.slice(1),n=Xe(),`
    vec4 `+e+`() {
      return `+n.texture2D+"("+t+`, halfCR);
    }
  `;case 1:return(function(a){var o=a.name,i="get"+o.charAt(0).toUpperCase()+o.slice(1),s=a.shapeInfo.texShape,u=[Math.ceil(s[0]/2),Math.ceil(s[1]/2)],c=Xe();return`
    vec4 `+i+`(int index) {
      vec2 uv = packedUVfrom1D(
        `+u[0]+", "+u[1]+`, index);
      return `+c.texture2D+"("+o+`, uv);
    }
  `})(r);case 2:return(function(a){var o=a.shapeInfo.logicalShape,i=a.name,s="get"+i.charAt(0).toUpperCase()+i.slice(1),u=a.shapeInfo.texShape,c=u[0],l=u[1],h=Xe();if(u!=null&&ze(o,u))return`
      vec4 `+s+`(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(`+l+".0, "+c+`.0);

        return `+h.texture2D+"("+i+`, uv);
      }
    `;var f=[Math.ceil(u[0]/2),Math.ceil(u[1]/2)],p=Math.ceil(o[1]/2);return`
    vec4 `+s+`(int row, int col) {
      vec2 uv = packedUVfrom2D(`+p+", "+f[0]+", "+f[1]+`, row, col);
      return `+h.texture2D+"("+i+`, uv);
    }
  `})(r);case 3:return(function(a){var o=a.shapeInfo.logicalShape,i=a.name,s="get"+i.charAt(0).toUpperCase()+i.slice(1),u=a.shapeInfo.texShape,c=[Math.ceil(u[0]/2),Math.ceil(u[1]/2)];if(o[0]===1){var l=o.slice(1),h=Nn(a,l);return`
        `+Eu(h)+`
        vec4 `+s+`(int b, int row, int col) {
          return `+s+"("+Fn(["b","row","col"],[1,2])+`);
        }
      `}var f=c[0],p=c[1],d=Math.ceil(o[2]/2),m=d*Math.ceil(o[1]/2),v=Xe();return`
    vec4 `+s+`(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        `+f+", "+p+", "+m+", "+d+`, b, row, col);
      return `+v.texture2D+"("+i+`, uv);
    }
  `})(r);default:return(function(a){for(var o=a.shapeInfo.logicalShape,i=o.length,s=a.name,u="get"+s.charAt(0).toUpperCase()+s.slice(1),c=a.shapeInfo.texShape,l=[Math.ceil(c[0]/2),Math.ceil(c[1]/2)],h=l[0],f=l[1],p=Math.ceil(o[i-1]/2),d=p*Math.ceil(o[i-2]/2),m="int b, int row, int col",v="b * "+d+" + (row / 2) * "+p+" + (col / 2)",g=2;g<i-1;g++)m="int b"+g+", "+m,d*=o[i-g-1],v="b"+g+" * "+d+" + "+v;var x=Xe();return`
    vec4 `+u+"("+m+`) {
      int index = `+v+`;
      int texR = index / `+f+`;
      int texC = index - texR * `+f+`;
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(`+f+", "+h+`);
      return `+x.texture2D+"("+s+`, uv);
    }
  `})(r)}}var nf=`
vec2 uvFromFlat(int texNumR, int texNumC, int index) {
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
  int texelIndex = index / 2;
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,rf=`
vec2 packedUVfrom2D(int texelsInLogicalRow, int texNumR,
  int texNumC, int row, int col) {
  int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,af=`
vec2 packedUVfrom3D(int texNumR, int texNumC,
    int texelsInBatch, int texelsInLogicalRow, int b,
    int row, int col) {
  int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,of=`
  float getChannel(vec4 frag, vec2 innerDims) {
    vec2 modCoord = mod(innerDims, 2.);
    return modCoord.x == 0. ?
      (modCoord.y == 0. ? frag.r : frag.g) :
      (modCoord.y == 0. ? frag.b : frag.a);
  }
  float getChannel(vec4 frag, int dim) {
    float modCoord = mod(float(dim), 2.);
    return modCoord == 0. ? frag.r : frag.g;
  }
`;function ln(r){return"offset"+r}function In(r){var t=r.name,e=Q(r.shapeInfo.logicalShape);return e<2?"return "+t+";":`
    for (int i = 0; i < `+e+`; i++) {
      if (i == index) {
        return `+t+`[i];
      }
    }
  `}function ke(r){if(r<=1)return"int";if(r===2)return"ivec2";if(r===3)return"ivec3";if(r===4)return"ivec4";if(r===5)return"ivec5";if(r===6)return"ivec6";throw Error("GPU for rank "+r+" is not yet supported")}function Nn(r,t){var e=JSON.parse(JSON.stringify(r));return e.shapeInfo.logicalShape=t,e}function Fn(r,t){return t.map((function(e){return r[e]})).join(", ")}var sf=function(r,t,e,n){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,E(r.length>2,(function(){return"Packed arg"+(e.charAt(0).toUpperCase()+e.slice(1))+" supports only inputs with rank above 2."}));var a=r[r.length-1],o=Math.ceil(a/t);this.outputShape=r.slice(0,-1),o>1&&this.outputShape.push(o),n||this.variableNames.push("bestIndicesA");var i,s,u=this.outputShape,c=u.length,l=ke(c),h=et("coords",c);if(o===1){var f=ke(s=c+1);i=`
        `+f+" sourceLocR = "+f+"("+h.join()+`, 0);
        ++`+h[c-1]+`;
        `+f+" sourceLocG = "+f+"("+h.join()+`, 0);
        ++`+h[c-2]+`;
        `+f+" sourceLocA = "+f+"("+h.join()+`, 0);
        --`+h[c-1]+`;
        `+f+" sourceLocB = "+f+"("+h.join()+`, 0);
        --`+h[c-2]+";"}else s=c,i=`
        `+l+` sourceLocR = coords;
        ++`+h[c-1]+`;
        `+l+` sourceLocG = coords;
        ++`+h[c-2]+`;
        `+l+` sourceLocA = coords;
        --`+h[c-1]+`;
        `+l+` sourceLocB = coords;
        --`+h[c-2]+";";var p=["x","y","z","w","u","v"].slice(0,s),d="."+p[s-1],m=p.map((function(I){return"int "+I})),v=et("sourceLocR",s-1).concat("inIdx.r"),g=et("sourceLocG",s-1).concat("inIdx.g"),x=et("sourceLocB",s-1).concat("inIdx.b"),b=et("sourceLocA",s-1).concat("inIdx.a"),y=e==="max"?"greaterThan":"lessThan",w=n?"":`
          inIdx = round(vec4(getBestIndicesAChannel(`+v.join()+`),
                             getBestIndicesAChannel(`+g.join()+`),
                             getBestIndicesAChannel(`+x.join()+`),
                             getBestIndicesAChannel(`+b.join()+")));",C=`vec4(
            getAChannel(`+v.join()+`),
            hasNextCol ? getAChannel(`+g.join()+`) : 0.,
            hasNextRow ? getAChannel(`+x.join()+`) : 0.,
            hasNextRow && hasNextCol ? getAChannel(`+b.join()+") : 0.)",S=n?"":`
      float getBestIndicesAChannel(`+m.join()+`) {
        return getChannel(getBestIndicesA(`+p.join()+`),
                                          vec2(`+p.slice(-2).join()+`));
      }`;this.userCode=`
      float getAChannel(`+m.join()+`) {
        return getChannel(getA(`+p.join()+`),
                               vec2(`+p.slice(-2).join()+`));
      }
      `+S+`
      void main() {
        `+l+` coords = getOutputCoords();
        bool hasNextCol = `+h[c-1]+" < "+(u[c-1]-1)+`;
        bool hasNextRow = `+h[c-2]+" < "+(u[c-2]-1)+`;
        `+i+`
        ivec4 srcIdx = ivec4(sourceLocR`+d+", sourceLocG"+d+`,
          sourceLocB`+d+", sourceLocA"+d+") * "+t+`;
        ivec4 inIdx = srcIdx;
        vec4 bestIndex = vec4(inIdx);
        vec4 bestValue = `+C+`;

        for (int i = 0; i < `+t+`; i++) {
          inIdx = srcIdx;
          `+w+`
          vec4 candidate = `+C+`;
          bvec4 nan = isnan(candidate);
          bvec4 replace = bvec4(
            vec4(`+y+`(candidate, bestValue)) * (vec4(1.0) - vec4(nan)));

          bestValue = vec4(replace.x  ? candidate.x : bestValue.x,
                           replace.y  ? candidate.y : bestValue.y,
                           replace.z  ? candidate.z : bestValue.z,
                           replace.w  ? candidate.w : bestValue.w);
          bestIndex = mix(bestIndex, vec4(inIdx), vec4(replace));
          srcIdx++;
        }
        setOutput(bestIndex);
      }
    `},uf=function(r){this.variableNames=["dy"],this.outputShape=r.inShape;var t=r.filterHeight,e=r.filterWidth,n=r.strideHeight,a=r.strideWidth,o=r.dilationHeight,i=r.dilationWidth,s=r.effectiveFilterHeight,u=r.effectiveFilterWidth,c=s-1-r.padInfo.top,l=u-1-r.padInfo.left,h=1/(t*e);this.userCode=`
      const ivec2 pads = ivec2(`+c+", "+l+`);
      const float avgMultiplier = float(`+h+`);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < `+s+`;
            wR += `+o+`) {
          float dyR = float(dyRCorner + wR) / `+n+`.0;

          if (dyR < 0.0 || dyR >= `+r.outHeight+`.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < `+u+`;
            wC+= `+i+`) {
            float dyC = float(dyCCorner + wC) / `+a+`.0;

            if (dyC < 0.0 || dyC >= `+r.outWidth+`.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);

            dotProd += dyValue * avgMultiplier;
          }
        }
        setOutput(dotProd);
      }
    `},cf=function(r){this.variableNames=["dy"],this.outputShape=r.inShape;var t=r.filterDepth,e=r.filterHeight,n=r.filterWidth,a=r.strideDepth,o=r.strideHeight,i=r.strideWidth,s=r.dilationDepth,u=r.dilationHeight,c=r.dilationWidth,l=r.effectiveFilterDepth,h=r.effectiveFilterHeight,f=r.effectiveFilterWidth,p=l-1-r.padInfo.front,d=h-1-r.padInfo.top,m=f-1-r.padInfo.left,v=1/(t*e*n);this.userCode=`
      const ivec3 pads = ivec3(`+p+", "+d+", "+m+`);
      const float avgMultiplier = float(`+v+`);

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, d) with pos mask(:, :, :, ch) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < `+l+`;
            wD += `+s+`) {
          float dyD = float(dyDCorner + wD) / `+a+`.0;

          if (dyD < 0.0 || dyD >= `+r.outDepth+`.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < `+h+`;
              wR += `+u+`) {
            float dyR = float(dyRCorner + wR) / `+o+`.0;

            if (dyR < 0.0 || dyR >= `+r.outHeight+`.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < `+f+`;
                wC += `+c+`) {
              float dyC = float(dyCCorner + wC) / `+i+`.0;

              if (dyC < 0.0 || dyC >= `+r.outWidth+`.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);

              dotProd += dyValue * avgMultiplier;
            }
          }
        }
        setOutput(dotProd);
      }
    `},lf=function(r,t,e,n,a,o){this.outputShape=[],this.variableNames=["x","mean","variance"],me(r,t),me(r,e);var i="0.0";n!=null&&(me(r,n),this.variableNames.push("offset"),i="getOffsetAtOutCoords()");var s="1.0";a!=null&&(me(r,a),this.variableNames.push("scale"),s="getScaleAtOutCoords()"),this.outputShape=r,this.userCode=`
      void main() {
        float x = getXAtOutCoords();
        float mean = getMeanAtOutCoords();
        float variance = getVarianceAtOutCoords();
        float offset = `+i+`;
        float scale = `+s+`;
        float inv = scale * inversesqrt(variance + float(`+o+`));
        setOutput(dot(vec3(x, -mean, offset), vec3(inv, inv, 1)));
      }
    `},hf=function(r,t,e,n,a,o){this.packedInputs=!0,this.packedOutput=!0,this.variableNames=["x","mean","variance"],me(r,t),me(r,e);var i="vec4(0.0)";n!=null&&(me(r,n),this.variableNames.push("offset"),i="getOffsetAtOutCoords()");var s="vec4(1.0)";a!=null&&(me(r,a),this.variableNames.push("scale"),s="getScaleAtOutCoords()"),this.outputShape=r,this.userCode=`
      void main() {
        vec4 offset = `+i+`;
        vec4 scale = `+s+`;

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(`+o+`));

        setOutput((x - mean) * inv + offset);
      }
    `},ff="return areal * breal - aimag * bimag;",pf="return areal * bimag + aimag * breal;",Gi=function(r,t,e){this.variableNames=["AReal","AImag","BReal","BImag"],this.outputShape=me(t,e),this.userCode=`
      float binaryOpComplex(
          float areal, float aimag, float breal, float bimag) {
        `+r+`
      }

      void main() {
        float areal = getARealAtOutCoords();
        float aimag = getAImagAtOutCoords();
        float breal = getBRealAtOutCoords();
        float bimag = getBImagAtOutCoords();
        setOutput(binaryOpComplex(areal, aimag, breal, bimag));
      }
    `},Ba="return a + b;",La="return a - b;",Hi="return a * b;",ku="return (a < 0.) ? b * a : a;",Te=function(r,t,e){this.variableNames=["A","B"],this.outputShape=me(t,e),this.userCode=`
      float binaryOperation(float a, float b) {
        `+r+`
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }
    `},Ru=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`,Vt=function(r,t,e,n){n===void 0&&(n=!1),this.variableNames=["A","B"],this.supportsBroadcasting=!0,this.packedInputs=!0,this.packedOutput=!0,this.outputShape=me(t,e);var a=this.outputShape.length,o="";if(n)if(a===0||Q(this.outputShape)===1)o=`
          result.y = 0.;
          result.z = 0.;
          result.w = 0.;
        `;else if(o=`
          `+ke(a)+` coords = getOutputCoords();
        `,a===1)o+=`
            result.y = (coords + 1) >= `+this.outputShape[0]+` ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `;else{var i=et("coords",a);o+=`
            bool nextRowOutOfBounds =
              (`+i[a-2]+" + 1) >= "+this.outputShape[a-2]+`;
            bool nextColOutOfBounds =
              (`+i[a-1]+" + 1) >= "+this.outputShape[a-1]+`;
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `}this.userCode=`
      vec4 binaryOperation(vec4 a, vec4 b) {
        `+r+`
      }

      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();

        vec4 result = binaryOperation(a, b);
        `+o+`

        setOutput(result);
      }
    `},df=(function(){function r(t){this.variableNames=["A"],this.outputShape=t,this.userCode=`
      uniform float minVal;
      uniform float maxVal;

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `}return r.prototype.getCustomSetupFunc=function(t,e){var n=this;return function(a,o){n.minLoc==null&&(n.minLoc=a.getUniformLocationNoThrow(o,"minVal"),n.maxLoc=a.getUniformLocationNoThrow(o,"maxVal")),a.gl.uniform1f(n.minLoc,t),a.gl.uniform1f(n.maxLoc,e)}},r})(),vf=(function(){function r(t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t,this.userCode=`
      uniform float minVal;
      uniform float maxVal;

      void main() {
        vec4 value = getAAtOutCoords();

        if (any(isnan(value))) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, vec4(minVal), vec4(maxVal)));
      }
    `}return r.prototype.getCustomSetupFunc=function(t,e){var n=this;return function(a,o){n.minLoc==null&&(n.minLoc=a.getUniformLocationNoThrow(o,"minVal"),n.maxLoc=a.getUniformLocationNoThrow(o,"maxVal")),a.gl.uniform1f(n.minLoc,t),a.gl.uniform1f(n.maxLoc,e)}},r})(),mf=function(r){this.variableNames=["real","imag"],this.outputShape=r,this.userCode=`
      void main() {
        float re = abs(getRealAtOutCoords());
        float im = abs(getImagAtOutCoords());
        float mx = max(re, im);

        // sadly the length function in glsl is not underflow-safe
        // (at least not on Intel GPUs). So the safe solution is
        // to ensure underflow-safety in all cases.
        setOutput(
          mx == 0.0 ? 0.0 : mx * length(vec2(1, min(re, im)/mx))
        );
      }
    `},gf=function(r){this.outputShape=[],this.outputShape=jn(r,1),this.variableNames=r.map((function(s,u){return"T"+u}));var t=new Array(r.length-1);t[0]=r[0][1];for(var e=1;e<t.length;e++)t[e]=t[e-1]+r[e][1];var n=["if (yC < "+t[0]+") setOutput(getT0(yR, yC));"];for(e=1;e<t.length;e++){var a=t[e-1];n.push("else if (yC < "+t[e]+") setOutput(getT"+e+"(yR, yC-"+a+"));")}var o=t.length,i=t[t.length-1];n.push("else setOutput(getT"+o+"(yR, yC-"+i+"));"),this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;

        `+n.join(`
        `)+`
      }
    `},yf=function(r,t){this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[],this.outputShape=jn(r,t);var e=this.outputShape,n=e.length,a=ke(n),o=et("coords",n),i=["x","y","z","w","u","v"].slice(0,n);this.variableNames=r.map((function(v,g){return"T"+g}));var s=new Array(r.length-1);s[0]=r[0][t];for(var u=1;u<s.length;u++)s[u]=s[u-1]+r[u][t];var c=i[t],l=i.slice(-2),h=i.join(),f="if ("+c+" < "+s[0]+`) {
        return getChannel(
            getT0(`+h+"), vec2("+l.join()+`));
        }`;for(u=1;u<s.length;u++){var p=s[u-1];f+=`
        if (`+c+" < "+s[u]+"  && "+c+" >= "+s[u-1]+`) {
          return getChannel(
            getT`+u+"("+kr(i,c,p)+`),
            vec2(`+kr(l,c,p)+`));
        }`}var d=s.length,m=s[s.length-1];f+=`
        return getChannel(
          getT`+d+"("+kr(i,c,m)+`),
          vec2(`+kr(l,c,m)+"));",this.userCode=`
      float getValue(`+i.map((function(v){return"int "+v}))+`) {
        `+f+`
      }

      void main() {
        `+a+` coords = getOutputCoords();
        vec4 result = vec4(getValue(`+o+`), 0., 0., 0.);

        `+o[n-1]+" = "+o[n-1]+` + 1;
        if (`+o[n-1]+" < "+e[n-1]+`) {
          result.g = getValue(`+o+`);
        }

        `+o[n-2]+" = "+o[n-2]+` + 1;
        if (`+o[n-2]+" < "+e[n-2]+`) {
          result.a = getValue(`+o+`);
        }

        `+o[n-1]+" = "+o[n-1]+` - 1;
        if (`+o[n-2]+" < "+e[n-2]+` &&
            `+o[n-1]+" < "+e[n-1]+`) {
          result.b = getValue(`+o+`);
        }
        setOutput(result);
      }
    `};function kr(r,t,e){var n=r.indexOf(t);return r.map((function(a,o){return o===n?a+" - "+e:a})).join()}var xf=function(r){this.variableNames=["x","dy"],this.outputShape=r.filterShape;var t=r.strideHeight,e=r.strideWidth,n=r.padInfo.top,a=r.padInfo.left,o=r.dataFormat==="channelsLast";this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int d2 = coords.w;

        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int b = 0; b < `+r.batchSize+`; b++) {
          for (int yR = 0; yR < `+r.outHeight+`; yR++) {
            int xR = wR + yR * `+t+" - "+n+`;

            if (xR < 0 || xR >= `+r.inHeight+`) {
              continue;
            }

            for (int yC = 0; yC < `+r.outWidth+`; yC++) {
              int xC = wC + yC * `+e+" - "+a+`;

              if (xC < 0 || xC >= `+r.inWidth+`) {
                continue;
              }

              if (`+o+`) {
                float dyValue = getDy(b, yR, yC, d2);
                float xValue = getX(b, xR, xC, d1);
                dotProd += (xValue * dyValue);
              } else {
                float dyValue = getDy(b, d2, yR, yC);
                float xValue = getX(b, d1, xR, xC);
                dotProd += (xValue * dyValue);
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `},bf=function(r){this.variableNames=["dy","W"],this.outputShape=r.inShape;var t=r.filterHeight,e=r.filterWidth,n=r.strideHeight,a=r.strideWidth,o=r.dataFormat==="channelsLast",i=t-1-r.padInfo.top,s=e-1-r.padInfo.left,u=o?1:2,c=o?2:3,l=o?3:1;this.userCode=`
      const ivec2 pads = ivec2(`+i+", "+s+`);

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[`+l+`];

        ivec2 dyCorner = ivec2(coords[`+u+"], coords["+c+`]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < `+t+`; wR++) {
          float dyR = float(dyRCorner + wR) / `+n+`.0;

          if (dyR < 0.0 || dyR >= `+r.outHeight+`.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = `+t+` - 1 - wR;

          for (int wC = 0; wC < `+e+`; wC++) {
            float dyC = float(dyCCorner + wC) / `+a+`.0;

            if (dyC < 0.0 || dyC >= `+r.outWidth+`.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = `+e+` - 1 - wC;

            for (int d2 = 0; d2 < `+r.outChannels+`; d2++) {

              if (`+o+`) {
                float xValue = getDy(batch, idyR, idyC, d2);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              } else {
                float xValue = getDy(batch, d2, idyR, idyC);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `},wf=function(r){this.variableNames=["x","dy"],this.outputShape=r.filterShape;var t=r.strideDepth,e=r.strideHeight,n=r.strideWidth,a=r.padInfo.front,o=r.padInfo.top,i=r.padInfo.left;this.userCode=`
      void main() {
        ivec5 coords = getOutputCoords();
        int wF = coords.x;
        int wR = coords.y;
        int wC = coords.z;
        int d1 = coords.w;
        int d2 = coords.u;

        float dotProd = 0.0;

        for (int b = 0; b < `+r.batchSize+`; b++) {
          for (int yF = 0; yF < `+r.outDepth+`; yF++) {
            int xF = wF + yF * `+t+" - "+a+`;

            if (xF < 0 || xF >= `+r.inDepth+`) {
              continue;
            }

            for (int yR = 0; yR < `+r.outHeight+`; yR++) {
              int xR = wR + yR * `+e+" - "+o+`;

              if (xR < 0 || xR >= `+r.inHeight+`) {
                continue;
              }

              for (int yC = 0; yC < `+r.outWidth+`; yC++) {
                int xC = wC + yC * `+n+" - "+i+`;

                if (xC < 0 || xC >= `+r.inWidth+`) {
                  continue;
                }

                float dyValue = getDy(b, yF, yR, yC, d2);
                float xValue = getX(b, xF, xR, xC, d1);
                dotProd += (xValue * dyValue);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `},Cf=function(r){this.variableNames=["dy","W"],this.outputShape=r.inShape;var t=r.filterDepth,e=r.filterHeight,n=r.filterWidth,a=r.strideDepth,o=r.strideHeight,i=r.strideWidth,s=t-1-r.padInfo.front,u=e-1-r.padInfo.top,c=n-1-r.padInfo.left;this.userCode=`
      const ivec3 pads = ivec3(`+s+", "+u+", "+c+`);

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.u;


        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyFCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        float dotProd = 0.0;
        for (int wF = 0; wF < `+t+`; wF++) {
          float dyF = float(dyFCorner + wF) / `+a+`.0;

          if (dyF < 0.0 || dyF >= `+r.outDepth+`.0 || fract(dyF) > 0.0) {
            continue;
          }
          int idyF = int(dyF);

          int wFPerm = `+t+` - 1 - wF;

          for (int wR = 0; wR < `+e+`; wR++) {
            float dyR = float(dyRCorner + wR) / `+o+`.0;

            if (dyR < 0.0 || dyR >= `+r.outHeight+`.0 ||
              fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            int wRPerm = `+e+` - 1 - wR;

            for (int wC = 0; wC < `+n+`; wC++) {
              float dyC = float(dyCCorner + wC) / `+i+`.0;

              if (dyC < 0.0 || dyC >= `+r.outWidth+`.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              int wCPerm = `+n+` - 1 - wC;

              for (int d2 = 0; d2 < `+r.outChannels+`; d2++) {
                float xValue = getDy(batch, idyF, idyR, idyC, d2);
                float wValue = getW(wFPerm, wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `},_f=function(r){this.variableNames=["x","dy"],this.outputShape=r.filterShape;var t=r.strideHeight,e=r.strideWidth,n=r.padInfo.top,a=r.padInfo.left,o=r.outChannels/r.inChannels;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int dm = coords.w;
        int d2 = d1 * `+o+` + dm;

        float dotProd = 0.0;

        // TO DO: Vec4 over the batch size
        for (int b = 0; b < `+r.batchSize+`; b++) {
          for (int yR = 0; yR < `+r.outHeight+`; yR++) {
            int xR = wR + yR * `+t+" - "+n+`;

            if (xR < 0 || xR >= `+r.inHeight+`) {
              continue;
            }

            for (int yC = 0; yC < `+r.outWidth+`; yC++) {
              int xC = wC + yC * `+e+" - "+a+`;

              if (xC < 0 || xC >= `+r.inWidth+`) {
                continue;
              }

              float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);
            }
          }
        }
        setOutput(dotProd);
      }
    `},Ef=function(r){this.variableNames=["dy","W"],this.outputShape=r.inShape;var t=r.filterHeight,e=r.filterWidth,n=r.strideHeight,a=r.strideWidth,o=t-1-r.padInfo.top,i=e-1-r.padInfo.left,s=r.outChannels/r.inChannels;this.userCode=`
      const ivec2 pads = ivec2(`+o+", "+i+`);

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];
        ivec2 dyCorner = coords.yz - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        float dotProd = 0.0;

        for (int wR = 0; wR < `+t+`; wR++) {
          float dyR = float(dyRCorner + wR) / `+n+`.0;

          if (dyR < 0.0 || dyR >= `+r.outHeight+`.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = `+t+` - 1 - wR;

          for (int wC = 0; wC < `+e+`; wC++) {
            float dyC = float(dyCCorner + wC) / `+a+`.0;

            if (dyC < 0.0 || dyC >= `+r.outWidth+`.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = `+e+` - 1 - wC;

            // TO DO: Vec4 over the channelMul
            for (int dm = 0; dm < `+s+`; dm++) {
              int d2 = d1 * `+s+` + dm;
              float xValue = getDy(batch, idyR, idyC, d2);
              float wValue = getW(wRPerm, wCPerm, d1, dm);
              dotProd += xValue * wValue;
            }
          }
        }
        setOutput(dotProd);
      }
    `},ji=function(r,t,e,n){t===void 0&&(t=!1),e===void 0&&(e=null),n===void 0&&(n=!1),this.variableNames=["x","W"],this.outputShape=r.outShape;var a=r.padInfo.top,o=r.padInfo.left,i=r.strideHeight,s=r.strideWidth,u=r.dilationHeight,c=r.dilationWidth,l=r.filterHeight,h=r.filterWidth,f=4*Math.floor(r.inChannels/4),p=r.inChannels%4,d=r.dataFormat==="channelsLast",m=d?1:2,v=d?2:3,g=d?3:1,x="",b="";e&&(x=n?`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          `+e+`
        }`:`
          float activation(float x) {
            `+e+`
          }
        `,b="result = activation(result);");var y=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),n&&this.variableNames.push("preluActivationWeights"),this.userCode=`
      `+x+`

      const ivec2 strides = ivec2(`+i+", "+s+`);
      const ivec2 pads = ivec2(`+a+", "+o+`);

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d2 = coords[`+g+`];

        ivec2 xRCCorner =
            ivec2(coords[`+m+"], coords["+v+`]) * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < `+l+`; wR++) {
          int xR = xRCorner + wR * `+u+`;

          if (xR < 0 || xR >= `+r.inHeight+`) {
            continue;
          }

          for (int wC = 0; wC < `+h+`; wC++) {
            int xC = xCCorner + wC * `+c+`;

            if (xC < 0 || xC >= `+r.inWidth+`) {
              continue;
            }

            for (int d1 = 0; d1 < `+f+`; d1 += 4) {
              vec4 wValues = vec4(
                getW(wR, wC, d1, d2),
                getW(wR, wC, d1 + 1, d2),
                getW(wR, wC, d1 + 2, d2),
                getW(wR, wC, d1 + 3, d2)
              );

              if (`+d+`) {
                vec4 xValues = vec4(
                  getX(batch, xR, xC, d1),
                  getX(batch, xR, xC, d1 + 1),
                  getX(batch, xR, xC, d1 + 2),
                  getX(batch, xR, xC, d1 + 3)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec4 xValues = vec4(
                  getX(batch, d1, xR, xC),
                  getX(batch, d1 + 1, xR, xC),
                  getX(batch, d1 + 2, xR, xC),
                  getX(batch, d1 + 3, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }
            }

            if (`+(p===1)+`) {

              if (`+d+`) {
                dotProd +=
                    getX(batch, xR, xC, `+f+`) *
                    getW(wR, wC, `+f+`, d2);
              } else {
                dotProd +=
                    getX(batch, `+f+`, xR, xC) *
                    getW(wR, wC, `+f+`, d2);
              }

            } else if (`+(p===2)+`) {
              vec2 wValues = vec2(
                getW(wR, wC, `+f+`, d2),
                getW(wR, wC, `+f+` + 1, d2)
              );

              if (`+d+`) {
                vec2 xValues = vec2(
                  getX(batch, xR, xC, `+f+`),
                  getX(batch, xR, xC, `+f+` + 1)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec2 xValues = vec2(
                  getX(batch, `+f+`, xR, xC),
                  getX(batch, `+f+` + 1, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            } else if (`+(p===3)+`) {
              vec3 wValues = vec3(
                getW(wR, wC, `+f+`, d2),
                getW(wR, wC, `+f+` + 1, d2),
                getW(wR, wC, `+f+` + 2, d2)
              );

              if (`+d+`) {
                vec3 xValues = vec3(
                  getX(batch, xR, xC, `+f+`),
                  getX(batch, xR, xC, `+f+` + 1),
                  getX(batch, xR, xC, `+f+` + 2)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec3 xValues = vec3(
                  getX(batch, `+f+`, xR, xC),
                  getX(batch, `+f+` + 1, xR, xC),
                  getX(batch, `+f+` + 2, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            }
          }
        }

        float result = dotProd;
        `+y+`
        `+b+`
        setOutput(result);
      }
    `},kf=function(r){this.variableNames=["x","W"],this.outputShape=r.outShape;var t=r.padInfo.front,e=r.padInfo.top,n=r.padInfo.left,a=r.strideDepth,o=r.strideHeight,i=r.strideWidth,s=r.dilationDepth,u=r.dilationHeight,c=r.dilationWidth,l=r.filterDepth,h=r.filterHeight,f=r.filterWidth,p=4*Math.floor(r.inChannels/4),d=r.inChannels%4;this.userCode=`
      const ivec3 strides = ivec3(`+a+", "+o+", "+i+`);
      const ivec3 pads = ivec3(`+t+", "+e+", "+n+`);

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d2 = coords.u;

        ivec3 xFRCCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xFCorner = xFRCCorner.x;
        int xRCorner = xFRCCorner.y;
        int xCCorner = xFRCCorner.z;

        // Convolve x(?, ?, ?, d1) with w(:, :, :, d1, d2) to get
        // y(yF, yR, yC, d2). ? = to be determined. : = across all
        // values in that axis.
        float dotProd = 0.0;
        for (int wF = 0; wF < `+l+`; wF++) {
          int xF = xFCorner + wF * `+s+`;

          if (xF < 0 || xF >= `+r.inDepth+`) {
            continue;
          }

          for (int wR = 0; wR < `+h+`; wR++) {
            int xR = xRCorner + wR * `+u+`;

            if (xR < 0 || xR >= `+r.inHeight+`) {
              continue;
            }

            for (int wC = 0; wC < `+f+`; wC++) {
              int xC = xCCorner + wC * `+c+`;

              if (xC < 0 || xC >= `+r.inWidth+`) {
                continue;
              }

              for (int d1 = 0; d1 < `+p+`; d1 += 4) {
                vec4 xValues = vec4(
                  getX(batch, xF, xR, xC, d1),
                  getX(batch, xF, xR, xC, d1 + 1),
                  getX(batch, xF, xR, xC, d1 + 2),
                  getX(batch, xF, xR, xC, d1 + 3)
                );
                vec4 wValues = vec4(
                  getW(wF, wR, wC, d1, d2),
                  getW(wF, wR, wC, d1 + 1, d2),
                  getW(wF, wR, wC, d1 + 2, d2),
                  getW(wF, wR, wC, d1 + 3, d2)
                );

                dotProd += dot(xValues, wValues);
              }

              if (`+(d===1)+`) {
                dotProd +=
                  getX(batch, xF, xR, xC, `+p+`) *
                  getW(wF, wR, wC, `+p+`, d2);
              } else if (`+(d===2)+`) {
                vec2 xValues = vec2(
                  getX(batch, xF, xR, xC, `+p+`),
                  getX(batch, xF, xR, xC, `+p+` + 1)
                );
                vec2 wValues = vec2(
                  getW(wF, wR, wC, `+p+`, d2),
                  getW(wF, wR, wC, `+p+` + 1, d2)
                );
                dotProd += dot(xValues, wValues);
              } else if (`+(d===3)+`) {
                vec3 xValues = vec3(
                  getX(batch, xF, xR, xC, `+p+`),
                  getX(batch, xF, xR, xC, `+p+` + 1),
                  getX(batch, xF, xR, xC, `+p+` + 2)
                );
                vec3 wValues = vec3(
                  getW(wF, wR, wC, `+p+`, d2),
                  getW(wF, wR, wC, `+p+` + 1, d2),
                  getW(wF, wR, wC, `+p+` + 2, d2)
                );
                dotProd += dot(xValues, wValues);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `},qi=function(r,t,e,n){t===void 0&&(t=!1),e===void 0&&(e=null),n===void 0&&(n=!1),this.variableNames=["x","W"],this.outputShape=r.outShape;var a=r.inHeight,o=r.inWidth,i=r.padInfo.top,s=r.padInfo.left,u=r.strideHeight,c=r.strideWidth,l=r.dilationHeight,h=r.dilationWidth,f=r.filterHeight,p=r.filterWidth,d=r.outChannels/r.inChannels,m="",v="";e&&(m=n?`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          `+e+`
        }`:`
          float activation(float x) {
            `+e+`
          }
        `,v="result = activation(result);");var g=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),n&&this.variableNames.push("preluActivationWeights"),this.userCode=`
      `+m+`

      const ivec2 strides = ivec2(`+u+", "+c+`);
      const ivec2 pads = ivec2(`+i+", "+s+`);

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / `+d+`;
        int q = d2 - d1 * `+d+`;

        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, q) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        // TO DO(dsmilkov): Flatten the two for loops and vec4 the operations.
        for (int wR = 0; wR < `+f+`; wR++) {
          int xR = xRCorner + wR * `+l+`;

          if (xR < 0 || xR >= `+a+`) {
            continue;
          }

          for (int wC = 0; wC < `+p+`; wC++) {
            int xC = xCCorner + wC * `+h+`;

            if (xC < 0 || xC >= `+o+`) {
              continue;
            }

            float xVal = getX(batch, xR, xC, d1);
            float wVal = getW(wR, wC, d1, q);
            dotProd += xVal * wVal;
          }
        }

        float result = dotProd;
        `+g+`
        `+v+`
        setOutput(result);
      }
    `},Ki=function(r,t,e,n){t===void 0&&(t=!1),e===void 0&&(e=null),n===void 0&&(n=!1),this.variableNames=["x","W"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=r.outShape;for(var a=r.inHeight,o=r.inWidth,i=r.padInfo.top,s=r.padInfo.left,u=r.strideHeight,c=r.strideWidth,l=r.dilationHeight,h=r.dilationWidth,f=r.filterHeight,p=r.filterWidth,d=p,m="int xR; int xC; int xCOffset;",v=0;v<f;v++)for(var g=0;g<p;g++)m+=`
          vec4 xTexelR`+v+"C"+2*g+` = vec4(0.);
          vec4 wR`+v+"C"+g+` = vec4(0.);
          vec4 xR`+v+"C"+g+" = vec4(0.);";for(v=0;v<f;v++)for(var x=0;x<d;x++){if(m+=`
          xR = xRCorner + `+v*l+`;
          xC = xCCorner + `+(g=2*x)*h+`;
        `,c===1){if(g<p&&(m+=s%2==1?`
                xCOffset = xC + 1;
                if(xR >= 0 && xR < `+a+" && xCOffset >= 0 && xCOffset < "+o+`) {
                  xTexelR`+v+"C"+g+` = getX(batch, xR, xCOffset, d1);

                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if(xCOffset + 1 >= `+o+`) {
                    xTexelR`+v+"C"+g+`.zw = vec2(0.);
                  }
                } else {
                  xTexelR`+v+"C"+g+` = vec4(0.);
                }

                xCOffset = xC + 1 - 2;
                if(xR >= 0 && xR < `+a+" && xCOffset >= 0 && xCOffset < "+o+`) {
                  vec4 previous = getX(batch, xR, xCOffset, d1);

                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if(xCOffset + 1 >= `+o+`) {
                    previous.zw = vec2(0.);
                  }

                  xR`+v+"C"+g+" = vec4(previous.zw, xTexelR"+v+"C"+g+`.xy);
                } else {
                  xR`+v+"C"+g+" = vec4(0, 0, xTexelR"+v+"C"+g+`.xy);
                }
              `:`
                if(xR >= 0 && xR < `+a+" && xC >= 0 && xC < "+o+`) {
                  xTexelR`+v+"C"+g+` = getX(batch, xR, xC, d1);
                } else {
                  xTexelR`+v+"C"+g+` = vec4(0.);
                }

                xR`+v+"C"+g+" = xTexelR"+v+"C"+g+`;
              `,g+1<p)){var b=s%2==0?Hs(h):h;h%2==0&&s%2==1||h%2!=0&&s%2!=1?(m+=`
                  xCOffset = xC + `+s%2+" + "+b+`;

                  if(xR >= 0 && xR < `+a+` &&
                    xCOffset >= 0 && xCOffset < `+o+`) {
                    xTexelR`+v+"C"+(g+2)+` = getX(batch, xR, xCOffset, d1);
                  }
                `,h>1&&(m+=`
                    xCOffset -= 2;
                    if(xR >= 0 && xR < `+a+` &&
                      xCOffset >= 0 && xCOffset < `+o+`) {
                      xTexelR`+v+"C"+g+` = getX(batch, xR, xCOffset, d1);
                    } else {
                      xTexelR`+v+"C"+g+` = vec4(0.);
                    }
                  `),m+=`
                  xR`+v+"C"+(g+1)+` = vec4(
                    xTexelR`+v+"C"+g+".zw, xTexelR"+v+"C"+(g+2)+`.xy);
                `):m+=`
                  xCOffset = xC + `+b+`;

                  if(xR >= 0 && xR < `+a+` &&
                    xCOffset >= 0 && xCOffset < `+o+`) {
                    xTexelR`+v+"C"+(g+2)+` = getX(batch, xR, xCOffset, d1);
                  }

                  xR`+v+"C"+(g+1)+" = xTexelR"+v+"C"+(g+2)+`;
                `}}else g<p&&(m+=`
              if(xR >= 0 && xR < `+a+`) {
            `,s%2==1?(m+=`
                xCOffset = xC + 1 - `+c+`;
                if(xCOffset >= 0 && xCOffset < `+o+`) {
                  xTexelR`+v+"C"+g+` = getX(batch, xR, xCOffset, d1);
                } else {
                  xTexelR`+v+"C"+g+` = vec4(0.);
                }

                if(xC + 1 >= 0 && xC + 1 < `+o+`) {
                  xTexelR`+v+"C"+(g+2)+` = getX(batch, xR, xC + 1, d1);
                } else {
                  xTexelR`+v+"C"+(g+2)+` = vec4(0.);
                }

                xR`+v+"C"+g+` = vec4(
                  xTexelR`+v+"C"+g+".zw, xTexelR"+v+"C"+(g+2)+`.zw);
              `,g+1<p&&(m+=`
                  vec4 final = vec4(0.);
                  xCOffset = xC + 1 + `+c+`;
                  if(xCOffset >= 0 && xCOffset < `+o+`) {
                    final = getX(batch, xR, xCOffset, d1);
                  }
                  xR`+v+"C"+(g+1)+" = vec4(xTexelR"+v+"C"+(g+2)+`.xy, final.xy);
                `)):(m+=`
                if(xC >= 0 && xC < `+o+`) {
                  xTexelR`+v+"C"+g+` = getX(batch, xR, xC, d1);
                } else {
                  xTexelR`+v+"C"+g+` = vec4(0.);
                }

                xCOffset = xC + `+c+`;
                if(xCOffset >= 0 && xCOffset < `+o+`) {
                  xTexelR`+v+"C"+(g+2)+` = getX(batch, xR, xCOffset, d1);
                } else {
                  xTexelR`+v+"C"+(g+2)+` = vec4(0.);
                }

                xR`+v+"C"+g+` = vec4(
                  xTexelR`+v+"C"+g+".xy, xTexelR"+v+"C"+(g+2)+`.xy);
              `,g+1<p&&(m+=`
                  xR`+v+"C"+(g+1)+` = vec4(
                    xTexelR`+v+"C"+g+".zw, xTexelR"+v+"C"+(g+2)+`.zw);
                `)),m+="}");g<p&&(m+=`
            vec4 wTexelR`+v+"C"+g+" = getW("+v+", "+g+`, d1, q);
            wR`+v+"C"+g+" = vec4(wTexelR"+v+"C"+g+".xz, wTexelR"+v+"C"+g+`.xz);
          `,g+1<p&&(m+=`
              vec4 wTexelR`+v+"C"+(g+1)+" = getW("+v+", "+(g+1)+`, d1, q);
              wR`+v+"C"+(g+1)+` =
                vec4(wTexelR`+v+"C"+(g+1)+".xz, wTexelR"+v+"C"+(g+1)+".xz);"))}for(v=0;v<f;v++)for(g=0;g<p;g++)m+="dotProd += xR"+v+"C"+g+" * wR"+v+"C"+g+";";var y="",w="";e&&(y=n?`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          `+e+`
        }`:`vec4 activation(vec4 x) {
          `+e+`
        }`,w="result = activation(result);");var C=t?"result += getBiasAtOutCoords();":"";t&&this.variableNames.push("bias"),n&&this.variableNames.push("preluActivationWeights"),this.userCode=`
      `+y+`

      const ivec2 strides = ivec2(`+u+", "+c+`);
      const ivec2 pads = ivec2(`+i+", "+s+`);

      void main() {

        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2;
        int q = 0;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        vec4 dotProd = vec4(0.);

        `+m+`

        vec4 result = dotProd;
        `+C+`
        `+w+`
        setOutput(result);
      }
    `},Rf=function(r,t,e,n,a){this.variableNames=["Image","Boxes","BoxInd"],this.outputShape=[];var o=r[0],i=r[1],s=r[2],u=r[3],c=t[0],l=e[0],h=e[1];this.outputShape=[c,l,h,u];var f=n==="bilinear"?1:0,p=[i-1+".0",s-1+".0"],d=p[0],m=p[1],v=l>1?[""+(i-1)/(l-1),"(y2-y1) * height_ratio","y1*"+d+" + float(y)*(height_scale)"]:["0.0","0.0","0.5 * (y1+y2) * "+d],g=v[0],x=v[1],b=v[2],y=h>1?[""+(s-1)/(h-1),"(x2-x1) * width_ratio","x1*"+m+" + float(x)*(width_scale)"]:["0.0","0.0","0.5 * (x1+x2) * "+m],w=y[0],C=y[1],S=y[2];this.userCode=`
      const float height_ratio = float(`+g+`);
      const float width_ratio = float(`+w+`);
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int y = coords[1];
        int x = coords[2];
        int d = coords[3];

        // get box vals
        float y1 = getBoxes(b,0);
        float x1 = getBoxes(b,1);
        float y2 = getBoxes(b,2);
        float x2 = getBoxes(b,3);

        // get image in batch index
        int bInd = round(getBoxInd(b));
        if(bInd < 0 || bInd >= `+o+`) {
          return;
        }

        float height_scale = `+x+`;
        float width_scale = `+C+`;

        float in_y = `+b+`;
        if( in_y < 0.0 || in_y > `+d+` ) {
          setOutput(float(`+a+`));
          return;
        }
        float in_x = `+S+`;
        if( in_x < 0.0 || in_x > `+m+` ) {
          setOutput(float(`+a+`));
          return;
        }

        vec2 sourceFracIndexCR = vec2(in_x,in_y);
        if(`+f+` == 1) {
          // Compute the four integer indices.
          ivec2 sourceFloorCR = ivec2(sourceFracIndexCR);
          ivec2 sourceCeilCR = ivec2(ceil(sourceFracIndexCR));

          float topLeft = getImage(b, sourceFloorCR.y, sourceFloorCR.x, d);
          float bottomLeft = getImage(b, sourceCeilCR.y, sourceFloorCR.x, d);
          float topRight = getImage(b, sourceFloorCR.y, sourceCeilCR.x, d);
          float bottomRight = getImage(b, sourceCeilCR.y, sourceCeilCR.x, d);

          vec2 fracCR = sourceFracIndexCR - vec2(sourceFloorCR);

          float top = topLeft + (topRight - topLeft) * fracCR.x;
          float bottom = bottomLeft + (bottomRight - bottomLeft) * fracCR.x;
          float newValue = top + (bottom - top) * fracCR.y;
          setOutput(newValue);
        } else {
          // Compute the coordinators of nearest neighbor point.
          ivec2 sourceNearestCR = ivec2(floor(
            sourceFracIndexCR + vec2(0.5,0.5)));
          float newValue = getImage(b, sourceNearestCR.y, sourceNearestCR.x, d);
          setOutput(newValue);
        }
      }
    `},If=function(r,t,e){this.variableNames=["x"],this.outputShape=r;var n=r.length,a=r[r.length-1],o=e?"<":">";this.userCode=`
      int getIndex(int i) {
        `+(e?"return "+a+" -i - 1;":"return i;")+`
      }

      void main() {
        `+ke(n)+` coords = getOutputCoords();
        int end = `+Xi(n,"coords")+`;
        float val = 0.0;
        for (int i = `+a+` - 1; i >= 0; i -= 1) {
          int idx = getIndex(i);
          if (idx `+o+` end) {
            continue;
          }
          if (idx == end && `+t+`) {
            continue;
          }
          `+Xi(n,"coords")+` = idx;
          val += getX(`+(function(i,s){if(i===1)return""+s;if(i===2)return s+".x, "+s+".y";if(i===3)return s+".x, "+s+".y, "+s+".z";if(i===4)return s+".x, "+s+".y, "+s+".z, "+s+".w";throw Error("Cumulative sum for rank "+i+" is not yet supported")})(n,"coords")+`);
        }
        setOutput(val);
      }
    `};function Xi(r,t){if(r===1)return""+t;if(r===2)return t+".y";if(r===3)return t+".z";if(r===4)return t+".w";throw Error("Cumulative sum for rank "+r+" is not yet supported")}var Sf=function(r){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outPackingScheme=ar.DENSE;var t=Zn(r),e=Xe();this.outputShape=r,this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        `+dn(["r","c","d"],r)+`
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx *
          vec2(`+t[0]+", "+t[1]+`));
        int index = 4 * (resTexRC.x * `+t[1]+` + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getA(rc.x, rc.y, rc.z);
        }

        `+e.output+` = result;
      }
    `},Df=function(r){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outPackingScheme=ar.DENSE;var t=Zn(r),e=Xe();this.outputShape=r,this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        `+dn(["r","c","d"],r)+`
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx *
          vec2(`+t[0]+", "+t[1]+`));
        int index = 4 * (resTexRC.x * `+t[1]+` + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getChannel(getA(rc.x, rc.y, rc.z), vec2(rc.y, rc.z));
        }

        `+e.output+` = result;
      }
    `},Af=(function(){function r(t,e,n){this.variableNames=["x"],this.outputShape=[],this.outputShape=t,this.blockSize=e,this.dataFormat=n,this.userCode=`
    void main() {
      ivec4 coords = getOutputCoords();
      int b = coords[0];
      int h = `+this.getHeightCoordString()+`;
      int w = `+this.getWidthCoordString()+`;
      int d = `+this.getDepthCoordString()+`;

      int in_h = h / `+e+`;
      int offset_h = imod(h, `+e+`);
      int in_w = w / `+e+`;
      int offset_w = imod(w, `+e+`);
      int offset_d = (offset_h * `+e+` + offset_w) *
        `+this.getOutputDepthSize()+`;
      int in_d = d + offset_d;

      float result = `+this.getInputSamplingString()+`;
      setOutput(result);
    }
  `}return r.prototype.getHeightCoordString=function(){return this.dataFormat==="NHWC"?"coords[1]":"coords[2]"},r.prototype.getWidthCoordString=function(){return this.dataFormat==="NHWC"?"coords[2]":"coords[3]"},r.prototype.getDepthCoordString=function(){return this.dataFormat==="NHWC"?"coords[3]":"coords[1]"},r.prototype.getOutputDepthSize=function(){return this.dataFormat==="NHWC"?this.outputShape[3]:this.outputShape[1]},r.prototype.getInputSamplingString=function(){return this.dataFormat==="NHWC"?"getX(b, in_h, in_w, in_d)":"getX(b, in_d, in_h, in_w)"},r})(),Tf=function(r){this.variableNames=["X"],this.outputShape=[r,r],this.userCode=`
      void main() {
          ivec2 coords = getOutputCoords();
          float val = coords[0] == coords[1] ? getX(coords[0]) : 0.0;
          setOutput(val);
      }
    `},Nf=function(r){this.variableNames=["A"],this.outTexUsage=ct.DOWNLOAD;var t=Xe();this.outputShape=r,this.userCode=`
      `+_u+`

      void main() {
        float x = getAAtOutCoords();
        `+t.output+` = encode_float(x);
      }
    `},Ff=function(r){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outTexUsage=ct.DOWNLOAD;var t=Xe();this.outputShape=r,this.userCode=`
      `+_u+`

      void main() {
        ivec3 coords = getOutputCoords();
        float x = getChannel(getAAtOutCoords(), vec2(coords.y, coords.z));
        `+t.output+` = encode_float(x);
      }
    `},Pf=function(r,t,e){e===void 0&&(e=!1),this.variableNames=["A"];var n=Xe(),a=t[0],o=t[1];this.outputShape=r;var i="result";e&&(i="floor(result * 255. + 0.5)"),this.userCode=`
      `+Bo(r)+`

      void main() {
        ivec3 coords = getOutputCoords();

        int flatIndex = getFlatIndex(coords);
        int offset = imod(flatIndex, 4);

        flatIndex = idiv(flatIndex, 4, 1.);
        
        int r = flatIndex / `+o+`;
        int c = imod(flatIndex, `+o+`);
        vec2 uv = (vec2(c, r) + halfCR) / vec2(`+o+".0, "+a+`.0);
        vec4 values = `+n.texture2D+`(A, uv);

        float result;

        if(offset == 0) {
          result = values[0];
        } else if(offset == 1) {
          result = values[1];
        } else if(offset == 2) {
          result = values[2];
        } else {
          result = values[3];
        }

        `+n.output+" = vec4("+i+`, 0., 0., 0.);
      }
    `},Mf=function(r,t,e){e===void 0&&(e=!1),this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0;var n=Xe(),a=t[0],o=t[1];this.outputShape=r;var i="",s="result";e&&(s="floor(result * 255. + 0.5)");for(var u=0;u<=1;u++)for(var c=0;c<=1;c++){var l=2*u+c;i+=`
          localCoords = coords;
          if(localCoords[2] + `+c+" < "+r[2]+`) {
            localCoords[2] += `+c+`;
            if(localCoords[1] + `+u+" < "+r[1]+`) {
              localCoords[1] += `+u+`;

              flatIndex = getFlatIndex(localCoords);
              offset = imod(flatIndex, 4);

              flatIndex = idiv(flatIndex, 4, 1.);

              r = flatIndex / `+o+`;
              c = imod(flatIndex, `+o+`);
              uv = (vec2(c, r) + halfCR) / vec2(`+o+".0, "+a+`.0);
              values = `+n.texture2D+`(A, uv);

              if(offset == 0) {
                result[`+l+`] = values[0];
              } else if(offset == 1) {
                result[`+l+`] = values[1];
              } else if(offset == 2) {
                result[`+l+`] = values[2];
              } else {
                result[`+l+`] = values[3];
              }
            }
          }
        `}this.userCode=`
      `+Bo(r)+`

      void main() {
        ivec3 coords = getOutputCoords();

        vec4 result = vec4(0.);
        int flatIndex, r, c, offset;
        ivec3 localCoords;
        vec2 uv;
        vec4 values;

        `+i+`

        `+n.output+" = "+s+`;
      }
    `},Of="return real * expR - imag * expI;",Bf="return real * expI + imag * expR;",$i=function(r,t,e){this.variableNames=["real","imag"];var n=t[1];this.outputShape=t;var a=e?"2.0 * "+Math.PI:"-2.0 * "+Math.PI,o=e?n+".0":"1.0";this.userCode=`
      const float exponentMultiplier = `+a+`;

      float unaryOpComplex(float real, float expR, float imag, float expI) {
        `+r+`
      }

      float mulMatDFT(int batch, int index) {
        float indexRatio = float(index) / float(`+n+`);
        float exponentMultiplierTimesIndexRatio =
            exponentMultiplier * indexRatio;

        float result = 0.0;

        for (int i = 0; i < `+n+`; i++) {
          // x = (-2|2 * PI / N) * index * i;
          float x = exponentMultiplierTimesIndexRatio * float(i);
          float expR = cos(x);
          float expI = sin(x);
          float real = getReal(batch, i);
          float imag = getImag(batch, i);

          result +=
              unaryOpComplex(real, expR, imag, expI) / `+o+`;
        }

        return result;
      }

      void main() {
        ivec2 coords = getOutputCoords();
        setOutput(mulMatDFT(coords[0], coords[1]));
      }
    `},Lf=(function(){function r(t,e){this.outputShape=[],this.variableNames=["x"],this.outputShape=t,this.userCode=`
      uniform float value;
      void main() {
        // Input can be obtained from uniform value.
        setOutput(value);
      }
    `}return r.prototype.getCustomSetupFunc=function(t){var e=this;return function(n,a){e.valueLoc==null&&(e.valueLoc=n.getUniformLocationNoThrow(a,"value")),n.gl.uniform1f(e.valueLoc,t)}},r})(),Wf=function(r,t,e){this.variableNames=["A","indices"];var n=r.slice();n[e]=t,this.outputShape=n,this.rank=n.length;var a=ke(this.rank),o=(function(i,s){var u=i.length;if(u>4)throw Error("Gather for rank "+u+" is not yet supported");if(u===1)return"int(getIndices(resRC))";for(var c=["resRC.x","resRC.y","resRC.z","resRC.w"],l=[],h=0;h<i.length;h++)h===s?l.push("int(getIndices("+c[h]+"))"):l.push(""+c[h]);return l.join()})(r,e);this.userCode=`
      void main() {
        `+a+` resRC = getOutputCoords();
        setOutput(getA(`+o+`));
      }
    `},Uf=function(r,t,e){this.sliceDim=r,this.strides=t,this.variableNames=["x","indices"],this.outputShape=e;var n=ke(t.length),a=ke(e.length),o=this.sliceDim>1?"strides[j]":"strides";this.userCode=`
        `+n+" strides = "+n+"("+this.strides+`);
         void main() {
          `+a+` coords = getOutputCoords();
          int flattenIndex = 0;
          for (int j = 0; j < `+this.sliceDim+`; j++) {
            int index = round(getIndices(coords[0], j));
            flattenIndex += index * `+o+`;
          }
          setOutput(getX(flattenIndex, coords[1]));
        }
      `};function zf(r,t){var e=Xe();return Ml(r,t,e.version+`
    precision highp float;
    `+e.attribute+` vec3 clipSpacePos;
    `+e.attribute+` vec2 uv;
    `+e.varyingVs+` vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`)}function Vf(r,t){return Ul(r,t,new Float32Array([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0]))}function Gf(r,t){return zl(r,t,new Uint16Array([0,1,2,2,1,3]))}function fr(r,t,e,n,a,o,i){Gl(e,n);var s=Vl(r,t),u=r.TEXTURE_2D;return ee(r,t,(function(){return r.bindTexture(u,s)})),ee(r,t,(function(){return r.texParameteri(u,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE)})),ee(r,t,(function(){return r.texParameteri(u,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)})),ee(r,t,(function(){return r.texParameteri(u,r.TEXTURE_MIN_FILTER,r.NEAREST)})),ee(r,t,(function(){return r.texParameteri(u,r.TEXTURE_MAG_FILTER,r.NEAREST)})),ee(r,t,(function(){return r.texImage2D(u,0,a,e,n,0,o,i,null)})),ee(r,t,(function(){return r.bindTexture(r.TEXTURE_2D,null)})),s}function Hf(r,t,e,n,a){var o=sa(e,n);return fr(r,t,o[0],o[1],a.internalFormatFloat,a.textureFormatFloat,r.FLOAT)}function jf(r,t,e,n,a){var o=sa(e,n);return fr(r,t,o[0],o[1],a.internalFormatHalfFloat,a.textureFormatFloat,a.textureTypeHalfFloat)}function qf(r,t,e,n,a){var o=sa(e,n);return fr(r,t,o[0],o[1],r.RGBA,r.RGBA,r.UNSIGNED_BYTE)}function Kf(r,t,e,n,a){var o=hr(e,n);return fr(r,t,o[0],o[1],a.internalFormatPackedFloat,r.RGBA,r.FLOAT)}function Xf(r,t,e,n,a){var o=hr(e,n);return fr(r,t,o[0],o[1],a.internalFormatPackedHalfFloat,r.RGBA,a.textureTypeHalfFloat)}function $f(r,t,e,n){return ee(r,t,(function(){return r.bindBuffer(r.ARRAY_BUFFER,n)})),Oi(r,t,e,"clipSpacePos",n,3,20,0)&&Oi(r,t,e,"uv",n,2,20,12)}function Yf(r,t,e,n,a,o,i){var s,u,c;ee(r,t,(function(){return r.bindTexture(r.TEXTURE_2D,e)})),o instanceof Uint8Array?(s=new Uint8Array(n*a*4),u=r.UNSIGNED_BYTE,c=r.RGBA):(s=new Float32Array(n*a*4),u=r.FLOAT,c=i.internalFormatPackedFloat),s.set(o),ee(r,t,(function(){return r.texImage2D(r.TEXTURE_2D,0,c,n,a,0,r.RGBA,u,s)})),ee(r,t,(function(){return r.bindTexture(r.TEXTURE_2D,null)}))}function Jf(r,t,e,n){ee(r,t,(function(){return r.bindTexture(r.TEXTURE_2D,e)})),n.data instanceof Uint8Array?ee(r,t,(function(){return r.texImage2D(r.TEXTURE_2D,0,r.RGBA,n.width,n.height,0,r.RGBA,r.UNSIGNED_BYTE,n.data)})):ee(r,t,(function(){return r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,n)})),ee(r,t,(function(){return r.bindTexture(r.TEXTURE_2D,null)}))}function Qf(r,t,e,n,a){var o=r.createBuffer();ee(r,t,(function(){return r.bindBuffer(r.PIXEL_PACK_BUFFER,o)}));var i=16*e*n;return ee(r,t,(function(){return r.bufferData(r.PIXEL_PACK_BUFFER,i,r.STREAM_READ)})),ee(r,t,(function(){return r.readPixels(0,0,n,e,r.RGBA,r.FLOAT,0)})),ee(r,t,(function(){return r.bindBuffer(r.PIXEL_PACK_BUFFER,null)})),o}function Zf(r,t,e){var n=r,a=new Float32Array(e);return n.bindBuffer(n.PIXEL_PACK_BUFFER,t),n.getBufferSubData(n.PIXEL_PACK_BUFFER,0,a),n.bindBuffer(n.PIXEL_PACK_BUFFER,null),a}function ep(r,t,e,n,a){var o=sa(e,n),i=o[0],s=o[1],u=new Uint8Array(e*n*4);return ee(r,t,(function(){return r.readPixels(0,0,i,s,a.downloadTextureFormat,r.UNSIGNED_BYTE,u)})),new Float32Array(u.buffer)}function tp(r,t,e,n,a,o,i,s){var u=r,c=new Float32Array((function(l,h){var f=hr(l,h);return f[0]*f[1]*4})(o,i));return u.bindBuffer(u.PIXEL_PACK_BUFFER,t),u.getBufferSubData(u.PIXEL_PACK_BUFFER,0,c),u.bindBuffer(u.PIXEL_PACK_BUFFER,null),c}function np(r,t,e,n){var a=new Float32Array(e*n*4);return ee(r,t,(function(){return r.readPixels(0,0,n,e,r.RGBA,r.FLOAT,a)})),a}var rp=(function(){function r(t){this.outputTexture=null,this.program=null,this.disposed=!1,this.vertexAttrsAreBound=!1,this.itemsToPoll=[];var e=B().getNumber("WEBGL_VERSION");t!=null?(this.gl=t,Al(e,t)):this.gl=Pt(e);var n="WEBGL_color_buffer_float";if(B().getNumber("WEBGL_VERSION")===1){if(this.textureFloatExtension=wr(this.gl,this.debug,"OES_texture_float"),vt(this.gl,"OES_texture_half_float"))this.textureHalfFloatExtension=wr(this.gl,this.debug,"OES_texture_half_float");else if(B().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support half float textures, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.");if(this.colorBufferFloatExtension=this.gl.getExtension(n),vt(this.gl,"EXT_color_buffer_half_float"))this.colorBufferHalfFloatExtension=wr(this.gl,this.debug,"EXT_color_buffer_half_float");else if(B().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support color renderable half floats, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.")}else if(n="EXT_color_buffer_float",vt(this.gl,n))this.colorBufferFloatExtension=this.gl.getExtension(n);else{if(!vt(this.gl,"EXT_color_buffer_half_float"))throw new Error("GL context does not support color renderable floats");this.colorBufferHalfFloatExtension=this.gl.getExtension("EXT_color_buffer_half_float")}this.vertexBuffer=Vf(this.gl,this.debug),this.indexBuffer=Gf(this.gl,this.debug),this.framebuffer=Hl(this.gl,this.debug),this.textureConfig=Io(this.gl,this.textureHalfFloatExtension)}return Object.defineProperty(r.prototype,"debug",{get:function(){return B().getBool("DEBUG")},enumerable:!0,configurable:!0}),r.prototype.dispose=function(){var t=this;if(!this.disposed){this.program!=null&&console.warn("Disposing a GPGPUContext that still has a bound WebGLProgram. This is probably a resource leak, delete the program with GPGPUContext.deleteProgram before disposing."),this.outputTexture!=null&&console.warn("Disposing a GPGPUContext that still has a bound output matrix texture.  This is probably a resource leak, delete the output matrix texture with GPGPUContext.deleteMatrixTexture before disposing.");var e=this.gl;ee(e,this.debug,(function(){return e.finish()})),ee(e,this.debug,(function(){return e.bindFramebuffer(e.FRAMEBUFFER,null)})),ee(e,this.debug,(function(){return e.deleteFramebuffer(t.framebuffer)})),ee(e,this.debug,(function(){return e.bindBuffer(e.ARRAY_BUFFER,null)})),ee(e,this.debug,(function(){return e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,null)})),ee(e,this.debug,(function(){return e.deleteBuffer(t.indexBuffer)})),this.disposed=!0}},r.prototype.createFloat32MatrixTexture=function(t,e){return this.throwIfDisposed(),Hf(this.gl,this.debug,t,e,this.textureConfig)},r.prototype.createFloat16MatrixTexture=function(t,e){return this.throwIfDisposed(),jf(this.gl,this.debug,t,e,this.textureConfig)},r.prototype.createUnsignedBytesMatrixTexture=function(t,e){return this.throwIfDisposed(),qf(this.gl,this.debug,t,e,this.textureConfig)},r.prototype.uploadPixelDataToTexture=function(t,e){this.throwIfDisposed(),Jf(this.gl,this.debug,t,e)},r.prototype.uploadDenseMatrixToTexture=function(t,e,n,a){this.throwIfDisposed(),Yf(this.gl,this.debug,t,e,n,a,this.textureConfig)},r.prototype.createFloat16PackedMatrixTexture=function(t,e){return this.throwIfDisposed(),Xf(this.gl,this.debug,t,e,this.textureConfig)},r.prototype.createPackedMatrixTexture=function(t,e){return this.throwIfDisposed(),Kf(this.gl,this.debug,t,e,this.textureConfig)},r.prototype.deleteMatrixTexture=function(t){var e=this;this.throwIfDisposed(),this.outputTexture===t&&(Bi(this.gl,this.debug,this.framebuffer),this.outputTexture=null),ee(this.gl,this.debug,(function(){return e.gl.deleteTexture(t)}))},r.prototype.downloadByteEncodedFloatMatrixFromOutputTexture=function(t,e,n){var a=this;return this.downloadMatrixDriver(t,(function(){return ep(a.gl,a.debug,e,n,a.textureConfig)}))},r.prototype.downloadPackedMatrixFromBuffer=function(t,e,n,a,o,i){return tp(this.gl,t,0,0,0,o,i,this.textureConfig)},r.prototype.downloadFloat32MatrixFromBuffer=function(t,e){return Zf(this.gl,t,e)},r.prototype.createBufferFromTexture=function(t,e,n){this.bindTextureToFrameBuffer(t);var a=Qf(this.gl,this.debug,e,n,this.textureConfig);return this.unbindTextureToFrameBuffer(),a},r.prototype.createAndWaitForFence=function(){var t=this.createFence(this.gl);return this.pollFence(t)},r.prototype.createFence=function(t){var e,n,a=this;if(B().getBool("WEBGL_FENCE_API_ENABLED")){var o=t,i=o.fenceSync(o.SYNC_GPU_COMMANDS_COMPLETE,0);t.flush(),n=function(){var s=o.clientWaitSync(i,0,0);return s===o.ALREADY_SIGNALED||s===o.CONDITION_SATISFIED},e=i}else B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0?(e=this.beginQuery(),this.endQuery(),n=function(){return a.isQueryAvailable(e,B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))}):n=function(){return!0};return{query:e,isFencePassed:n}},r.prototype.downloadMatrixFromPackedTexture=function(t,e,n){var a=this;return this.downloadMatrixDriver(t,(function(){return np(a.gl,a.debug,e,n)}))},r.prototype.createProgram=function(t){this.throwIfDisposed();var e=this.gl,n=Ol(e,this.debug,t),a=zf(e,this.debug),o=Ll(e,this.debug);return ee(e,this.debug,(function(){return e.attachShader(o,a)})),ee(e,this.debug,(function(){return e.attachShader(o,n)})),Wl(e,this.debug,o),this.debug&&Fa(e,this.debug,o),this.vertexAttrsAreBound||(this.setProgram(o),this.vertexAttrsAreBound=$f(e,this.debug,this.program,this.vertexBuffer)),o},r.prototype.deleteProgram=function(t){var e=this;this.throwIfDisposed(),t===this.program&&(this.program=null),t!=null&&ee(this.gl,this.debug,(function(){return e.gl.deleteProgram(t)}))},r.prototype.setProgram=function(t){var e=this;this.throwIfDisposed(),this.program=t,this.program!=null&&this.debug&&Fa(this.gl,this.debug,this.program),ee(this.gl,this.debug,(function(){return e.gl.useProgram(t)}))},r.prototype.getUniformLocation=function(t,e,n){return n===void 0&&(n=!0),this.throwIfDisposed(),n?ql(this.gl,this.debug,t,e):Kl(this.gl,t,e)},r.prototype.getAttributeLocation=function(t,e){var n=this;return this.throwIfDisposed(),ee(this.gl,this.debug,(function(){return n.gl.getAttribLocation(t,e)}))},r.prototype.getUniformLocationNoThrow=function(t,e){return this.throwIfDisposed(),this.gl.getUniformLocation(t,e)},r.prototype.setInputMatrixTexture=function(t,e,n){this.throwIfDisposed(),this.throwIfNoProgram(),Xl(this.gl,this.debug,this.program,t,e,n)},r.prototype.setOutputMatrixTexture=function(t,e,n){this.setOutputMatrixTextureDriver(t,n,e)},r.prototype.setOutputPackedMatrixTexture=function(t,e,n){this.throwIfDisposed();var a=hr(e,n),o=a[0],i=a[1];this.setOutputMatrixTextureDriver(t,o,i)},r.prototype.setOutputMatrixWriteRegion=function(t,e,n,a){this.setOutputMatrixWriteRegionDriver(n,t,a,e)},r.prototype.setOutputPackedMatrixWriteRegion=function(t,e,n,a){throw new Error("setOutputPackedMatrixWriteRegion not implemented.")},r.prototype.debugValidate=function(){this.program!=null&&Fa(this.gl,this.debug,this.program),Cr(this.gl)},r.prototype.executeProgram=function(){this.throwIfDisposed(),this.throwIfNoProgram();var t=this.gl;this.debug&&this.debugValidate(),ee(t,this.debug,(function(){return t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0)}))},r.prototype.blockUntilAllProgramsCompleted=function(){var t=this;this.throwIfDisposed(),ee(this.gl,this.debug,(function(){return t.gl.finish()}))},r.prototype.getQueryTimerExtension=function(){return this.disjointQueryTimerExtension==null&&(this.disjointQueryTimerExtension=wr(this.gl,this.debug,B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2?"EXT_disjoint_timer_query_webgl2":"EXT_disjoint_timer_query")),this.disjointQueryTimerExtension},r.prototype.getQueryTimerExtensionWebGL2=function(){return this.getQueryTimerExtension()},r.prototype.getQueryTimerExtensionWebGL1=function(){return this.getQueryTimerExtension()},r.prototype.beginQuery=function(){if(B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2){var t=this.gl,e=this.getQueryTimerExtensionWebGL2(),n=t.createQuery();return t.beginQuery(e.TIME_ELAPSED_EXT,n),n}var a=this.getQueryTimerExtensionWebGL1(),o=a.createQueryEXT();return a.beginQueryEXT(a.TIME_ELAPSED_EXT,o),o},r.prototype.endQuery=function(){if(B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")!==2){var t=this.getQueryTimerExtensionWebGL1();t.endQueryEXT(t.TIME_ELAPSED_EXT)}else{var e=this.gl,n=this.getQueryTimerExtensionWebGL2();e.endQuery(n.TIME_ELAPSED_EXT)}},r.prototype.waitForQueryAndGetTime=function(t){return $(this,void 0,void 0,(function(){var e=this;return Y(this,(function(n){switch(n.label){case 0:return[4,Ai((function(){return e.disposed||e.isQueryAvailable(t,B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))}))];case 1:return n.sent(),[2,this.getQueryTime(t,B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))]}}))}))},r.prototype.getQueryTime=function(t,e){if(e===0)return null;if(e===2){var n=this.gl;return n.getQueryParameter(t,n.QUERY_RESULT)/1e6}var a=this.getQueryTimerExtensionWebGL1();return a.getQueryObjectEXT(t,a.QUERY_RESULT_EXT)/1e6},r.prototype.isQueryAvailable=function(t,e){if(e===0)return!0;if(e===2){var n=this.gl,a=this.getQueryTimerExtensionWebGL2(),o=n.getQueryParameter(t,n.QUERY_RESULT_AVAILABLE);return this.disjoint==null&&(this.disjoint=this.gl.getParameter(a.GPU_DISJOINT_EXT)),o&&!this.disjoint}return o=(a=this.getQueryTimerExtensionWebGL1()).getQueryObjectEXT(t,a.QUERY_RESULT_AVAILABLE_EXT),this.disjoint==null&&(this.disjoint=this.gl.getParameter(a.GPU_DISJOINT_EXT)),o&&!this.disjoint},r.prototype.pollFence=function(t){var e=this;return new Promise((function(n){e.addItemToPoll((function(){return t.isFencePassed()}),(function(){return n()}))}))},r.prototype.pollItems=function(){for(var t=(function(n){for(var a=0;a<n.length&&n[a]();++a);return a-1})(this.itemsToPoll.map((function(n){return n.isDoneFn}))),e=0;e<=t;++e)(0,this.itemsToPoll[e].resolveFn)();this.itemsToPoll=this.itemsToPoll.slice(t+1)},r.prototype.addItemToPoll=function(t,e){var n=this;this.itemsToPoll.push({isDoneFn:t,resolveFn:e}),this.itemsToPoll.length>1||Ai((function(){return n.pollItems(),n.itemsToPoll.length===0}))},r.prototype.bindTextureToFrameBuffer=function(t){this.throwIfDisposed(),Pa(this.gl,this.debug,t,this.framebuffer),this.debug&&Cr(this.gl)},r.prototype.unbindTextureToFrameBuffer=function(){this.outputTexture!=null?(Pa(this.gl,this.debug,this.outputTexture,this.framebuffer),this.debug&&Cr(this.gl)):Bi(this.gl,this.debug,this.framebuffer)},r.prototype.downloadMatrixDriver=function(t,e){this.bindTextureToFrameBuffer(t);var n=e();return this.unbindTextureToFrameBuffer(),n},r.prototype.setOutputMatrixTextureDriver=function(t,e,n){this.throwIfDisposed();var a=this.gl;Pa(a,this.debug,t,this.framebuffer),this.debug&&Cr(a),this.outputTexture=t,ee(a,this.debug,(function(){return a.viewport(0,0,e,n)})),ee(a,this.debug,(function(){return a.scissor(0,0,e,n)}))},r.prototype.setOutputMatrixWriteRegionDriver=function(t,e,n,a){var o=this;this.throwIfDisposed(),ee(this.gl,this.debug,(function(){return o.gl.scissor(t,e,n,a)}))},r.prototype.throwIfDisposed=function(){if(this.disposed)throw new Error("Attempted to use disposed GPGPUContext.")},r.prototype.throwIfNoProgram=function(){if(this.program==null)throw new Error("No GPU program is currently set.")},r})();function Yi(r,t){if(r.length!==t.length)throw Error("Binary was compiled with "+r.length+" inputs, but was executed with "+t.length+" inputs");r.forEach((function(e,n){var a=e.logicalShape,o=t[n],i=o.shape;if(!ze(a,i))throw Error("Binary was compiled with different shapes than the current args. Shapes "+a+" and "+i+" must match");if(!e.isUniform||!o.isUniform){var s=e.texShape,u=o.isUniform?null:o.texData.texShape;if(!ze(s,u))throw Error("Binary was compiled with different texture shapes than the current args. Shape "+s+" and "+u+" must match")}}))}var ap=function(r,t,e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=r;for(var n=e.filterWidth,a=e.inChannels,o=e.strideWidth,i=e.strideHeight,s=e.padInfo,u=e.outWidth,c=e.dilationWidth,l=e.dilationHeight,h=e.dataFormat,f=s.left,p=s.top,d=a*n,m=Xe(),v=h==="channelsLast",g=v?0:1,x=v?1:2,b="",y=0;y<=1;y++)for(var w=0;w<=1;w++)b+=`
          blockIndex = rc.y + `+w+`;
          pos = rc.x + `+y+`;

          if(blockIndex < `+r[1]+" && pos < "+r[0]+`) {
            offsetY = int(blockIndex / (`+u+")) * "+i+" - "+p+`;
            d0 = offsetY + `+l+" * (pos / "+d+`);

            if(d0 < `+t[g]+` && d0 >= 0) {

              offsetX = int(mod(float(blockIndex), `+u+".) * "+o+". - "+f+`.);
              d1 = offsetX + `+c+" * (int(mod(float(pos), "+d+".) / "+a+`.));

              if(d1 < `+t[x]+` && d1 >= 0) {

                ch = int(mod(float(pos), `+a+`.));

                if (`+v+`) {
                  innerDims = vec2(d1, ch);
                  result[`+(2*y+w)+`] = getChannel(
                    getA(d0, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                } else {
                  innerDims = vec2(d0, d1);
                  result[`+(2*y+w)+`] = getChannel(
                    getA(ch, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                }
              }
            }
          }
        `;this.userCode=`
      void main() {
        ivec2 rc = getOutputCoords();

        vec4 result = vec4(0);

        int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
        vec2 innerDims;

        `+b+`

        `+m.output+` = result;
      }
    `},op=function(r,t,e,n,a){this.variableNames=["x"],this.outputShape=[];var o,i=t,s=r[3]-1;this.outputShape=r;var u="float("+e+") + float("+n+") * sum";o=a===.5?"inversesqrt("+u+")":a===1?"1.0/("+u+")":"exp(log("+u+") * float(-"+a+"));",this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];
        int d = coords[3];
        float x = getX(b, r, c, d);
        float sum = 0.0;
        for (int j = -`+i+"; j <= "+i+`; j++) {
          int idx = d + j;
          if (idx >= 0 && idx <=  `+s+`) {
            float z = getX(b, r, c, idx);
            sum += z * z;
          }
        }
        float val = x * `+o+`;
        setOutput(val);
      }
    `},ip=function(r,t,e,n,a){this.variableNames=["inputImage","outputImage","dy"],this.outputShape=[],this.outputShape=r,this.depth=r[3],this.depthRadius=t,this.bias=e,this.alpha=n,this.beta=a,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];

        float result = 0.0;
        for (int d = 0; d < `+this.depth+`; ++d) {
          int depthBegin = int(max(0.0, float(d - `+t+`)));
          int depthEnd = int(min(float(`+this.depth+`),
              float(d + `+t+` + 1)));

          const int MIN_DEPTH_BEGIN = 0;
          const int MAX_DEPTH_END = `+this.depth+`;

          float norm = 0.0;
          for (int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k) {
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd) {
              norm += getInputImage(b, r, c, k) * getInputImage(b, r, c, k);
            }
            else {
              break;
            }
          }

          norm = float(`+n+") * norm + float("+e+`);

          for(int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k){
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd){
              float dyi = -2.0 * float(`+n+`)
                * float(`+a+`)
                * getInputImage(b ,r ,c, k) * getOutputImage(b, r, c, d)
                / norm;
              if (k == d) {
                dyi += pow(norm, -1.0 * `+a+`);
              }
              if (k == coords[3]) {
                dyi *= getDy(b, r, c, d);
                result += dyi;
              }
            }
            else {
              break;
            }
          }
      }
      setOutput(result);
      }
    `},sp=function(r,t,e,n,a){this.variableNames=["x"],this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0;var o,i=t,s=r[3]-1;this.outputShape=r;var u="float("+e+") + float("+n+") * sum";o=a===.5?"inversesqrt("+u+")":a===1?"1.0/("+u+")":"exp(log("+u+") * float(-"+a+"));",this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords.x;
        int r = coords.y;
        int c = coords.z;
        int d = coords.w;

        bool hasNextCol = d < `+this.outputShape[3]+`;
        bool hasNextRow = c < `+this.outputShape[2]+`;

        vec4 sum = vec4(0.);
        vec4 xFragAtOutputCoords = getX(b, r, c, d);

        vec4 xAtOutputCoords = vec4(
          getChannel(xFragAtOutputCoords, vec2(c, d)),
          hasNextCol ?
            getChannel(xFragAtOutputCoords, vec2(c, d + 1)) : 0.0,
          hasNextRow ?
            getChannel(xFragAtOutputCoords , vec2(c + 1, d)) : 0.0,
          (hasNextRow && hasNextCol) ?
            getChannel(xFragAtOutputCoords, vec2(c + 1, d + 1)) : 0.0
        );

        int firstChannel = d - `+i+`;
        vec2 cache = vec2(0.);
        if(firstChannel >= 0){
          vec4 firstChannelFrag = getX(b, r, c, firstChannel);
          cache.x = getChannel(firstChannelFrag, vec2(c, firstChannel));
            if(hasNextRow){
              cache.y = getChannel(firstChannelFrag, vec2(c + 1, firstChannel));
            }
        }

        ivec2 depth = ivec2(d, d + 1);
        for (int j = - `+i+"; j <= "+i+`; j++) {
          ivec2 idx = depth + j;
          bvec2 aboveLowerBound = greaterThanEqual(idx, ivec2(0));
          bvec2 belowUpperBound = lessThanEqual(idx, ivec2(`+s+`));

          bool depthInRange = aboveLowerBound.x && belowUpperBound.x;
          bool depthPlusOneInRange = aboveLowerBound.y && belowUpperBound.y;

          if(depthInRange || depthPlusOneInRange){
            vec4 z = vec4(0.);
            vec4 xFragAtCurrentDepth;
            z.xz = cache.xy;
            if(depthPlusOneInRange && hasNextCol){
              xFragAtCurrentDepth = idx.y != d ?
                getX(b, r, c, idx.y) : xFragAtOutputCoords;
              z.y = getChannel(xFragAtCurrentDepth, vec2(c, idx.y));
              if(hasNextRow){
                z.w = getChannel(xFragAtCurrentDepth, vec2(c + 1, idx.y));
              }
            }
            cache.xy = z.yw;
            sum += z * z;
          }
        }
        vec4 result = xAtOutputCoords * `+o+`;
        setOutput(result);
      }
    `},up=function(r){this.variableNames=["dy","maxPos"],this.outputShape=r.inShape;var t=r.strideHeight,e=r.strideWidth,n=r.dilationHeight,a=r.effectiveFilterHeight,o=r.effectiveFilterWidth,i=a-1-r.padInfo.top,s=o-1-r.padInfo.left,u=a*o-1;this.userCode=`
      const ivec2 pads = ivec2(`+i+", "+s+`);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < `+a+`;
          wR += `+n+`) {
          float dyR = float(dyRCorner + wR) / `+t+`.0;

          if (dyR < 0.0 || dyR >= `+r.outHeight+`.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < `+o+`; wC++) {
            float dyC = float(dyCCorner + wC) / `+e+`.0;

            if (dyC < 0.0 || dyC >= `+r.outWidth+`.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);
            int maxPosValue = `+u+` - int(getMaxPos(b, idyR, idyC, d));

            // Get the current value, check it against the value from the
            // position matrix.
            int curPosValue = wR * `+o+` + wC;
            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

            dotProd += dyValue * mask;
          }
        }
        setOutput(dotProd);
      }
    `},cp=function(r){this.variableNames=["dy","maxPos"],this.outputShape=r.inShape;var t=r.strideDepth,e=r.strideHeight,n=r.strideWidth,a=r.dilationDepth,o=r.dilationHeight,i=r.dilationWidth,s=r.effectiveFilterDepth,u=r.effectiveFilterHeight,c=r.effectiveFilterWidth,l=s-1-r.padInfo.front,h=u-1-r.padInfo.top,f=c-1-r.padInfo.left,p=s*u*c-1;this.userCode=`
      const ivec3 pads = ivec3(`+l+", "+h+", "+f+`);

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, ch) with pos mask(:, :, :, d) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < `+s+`;
           wD += `+a+`) {
          float dyD = float(dyDCorner + wD) / `+t+`.0;

          if (dyD < 0.0 || dyD >= `+r.outDepth+`.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < `+u+`;
              wR += `+o+`) {
            float dyR = float(dyRCorner + wR) / `+e+`.0;

            if (dyR < 0.0 || dyR >= `+r.outHeight+`.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < `+c+`;
                wC += `+i+`) {
              float dyC = float(dyCCorner + wC) / `+n+`.0;

              if (dyC < 0.0 || dyC >= `+r.outWidth+`.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);
              int maxPosValue = `+p+` -
                  int(getMaxPos(batch, idyD, idyR, idyC, ch));

              // Get the current value, check it against the value from the
              // position matrix.
              int curPosValue =
                  wD * `+u+" * "+c+` +
                  wR * `+c+` + wC;
              float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

              dotProd += dyValue * mask;
            }
          }
        }
        setOutput(dotProd);
      }
    `},Wa=function(r,t,e,n,a,o,i){e===void 0&&(e=!1),n===void 0&&(n=!1),a===void 0&&(a=!1),o===void 0&&(o=null),i===void 0&&(i=!1),this.variableNames=["matrixA","matrixB"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t;var s=e?r[1]:r[2],u=Math.ceil(s/2),c=e?"i * 2, rc.y":"rc.y, i * 2",l=n?"rc.z, i * 2":"i * 2, rc.z",h=e?["a.xxyy","a.zzww"]:["a.xxzz","a.yyww"],f=n?["b.xzxz","b.ywyw"]:["b.xyxy","b.zwzw"],p="",d="";o&&(p=i?`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          `+o+`
        }`:`vec4 activation(vec4 x) {
          `+o+`
        }`,d="result = activation(result);");var m=a?"result += getBiasAtOutCoords();":"";a&&this.variableNames.push("bias"),i&&this.variableNames.push("preluActivationWeights"),this.userCode=`
      `+p+`

      const float sharedDimension = `+u+`.0;

      vec4 dot2x2ARowBCol(ivec3 rc) {
        vec4 result = vec4(0);
        for (int i = 0; i < `+u+`; i++) {
          vec4 a = getMatrixA(rc.x, `+c+`);
          vec4 b = getMatrixB(rc.x, `+l+`);

          // These swizzled products need to be separately added.
          // See: https://github.com/tensorflow/tfjs/issues/1735
          result += (`+h[0]+" * "+f[0]+`);
          result += (`+h[1]+" * "+f[1]+`);
        }
        return result;
      }

      void main() {
        ivec3 rc = getOutputCoords();
        vec4 result = dot2x2ARowBCol(rc);

        `+m+`

        `+d+`

        setOutput(result);
      }
    `},lp=(function(){function r(t,e,n){this.variableNames=["probs"],this.outputShape=[t,n],this.userCode=`
      uniform float seed;

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];

        float r = random(seed);
        float cdf = 0.0;

        for (int i = 0; i < `+(e-1)+`; i++) {
          cdf += getProbs(batch, i);

          if (r < cdf) {
            setOutput(float(i));
            return;
          }
        }

        // If no other event happened, last event happened.
        setOutput(float(`+(e-1)+`));
      }
    `}return r.prototype.getCustomSetupFunc=function(t){var e=this;return function(n,a){e.seedLoc==null&&(e.seedLoc=n.getUniformLocation(a,"seed")),n.gl.uniform1f(e.seedLoc,t)}},r})(),hp=function(r,t,e,n){this.variableNames=["indices"],this.outputShape=[r,t],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int index = round(getIndices(coords.x));
        setOutput(mix(float(`+n+"), float("+e+`),
                      float(index == coords.y)));
      }
    `},fp=function(r){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outputShape=r;var t=r.length;if(t===0)this.userCode=`
        void main() {
          setOutput(vec4(getA(), 0., 0., 0.));
        }
      `;else{var e=et("rc",t),n=ke(t),a=(function(s,u,c){if(s===1)return"rc > "+u[0];for(var l="",h=s-2;h<s;h++)l+=c[h]+" >= "+u[h],h<s-1&&(l+="||");return l})(t,r,e),o=(function(s,u,c,l){if(s===1)return"";var h=l.slice(-2);return`
    int r = `+h[0]+`;
    int c = `+h[1]+`;
    int rp1 = r + 1;
    int cp1 = c + 1;

    bool cEdge = cp1 >= `+u+`;
    bool rEdge = rp1 >= `+c+`;
  `})(t,r[r.length-1],r[r.length-2],e),i=(function(s,u){var c=s.length,l=(function(h,f){for(var p=[],d=0;d<=1;d++)for(var m=0;m<=1;m++){for(var v=(d===0?"r":"rp1")+", "+(m===0?"c":"cp1"),g=2;g<h;g++)v=f[f.length-1-g]+","+v;p.push(v)}return p})(c,u);return c===1?`getA(rc),
            rc + 1 >= `+s[0]+` ? 0. : getA(rc + 1),
            0, 0`:"getA("+l[0]+`),
          cEdge ? 0. : getA(`+l[1]+`),
          rEdge ? 0. : getA(`+l[2]+`),
          rEdge || cEdge ? 0. : getA(`+l[3]+")"})(r,e);this.userCode=`
        void main() {
          `+n+` rc = getOutputCoords();

          if(`+a+`) {
            setOutput(vec4(0));
          } else {
            `+o+`

            setOutput(vec4(`+i+`));
          }
        }
      `}},pp=function(r,t,e){this.variableNames=["x"],this.outputShape=t.map((function(u,c){return u[0]+r[c]+u[1]}));var n=r.length,a=ke(n),o=t.map((function(u){return u[0]})).join(","),i=t.map((function(u,c){return u[0]+r[c]})).join(","),s=["coords[0]","coords[1]","coords[2]","coords[3]"].slice(0,n);this.userCode=n!==1?`
      `+a+" start = "+a+"("+o+`);
      `+a+" end = "+a+"("+i+`);

      void main() {
        `+a+` outC = getOutputCoords();
        if (any(lessThan(outC, start)) || any(greaterThanEqual(outC, end))) {
          setOutput(float(`+e+`));
        } else {
          `+a+` coords = outC - start;
          setOutput(getX(`+s+`));
        }
      }
    `:`
        int start = `+o+`;
        int end = `+i+`;

        void main() {
          int outC = getOutputCoords();
          if (outC < start || outC >= end) {
            setOutput(float(`+e+`));
          } else {
            setOutput(getX(outC - start));
          }
        }
      `},dp=function(r,t,e){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t.map((function(v,g){return v[0]+r[g]+v[1]}));for(var n=r.length,a=ke(n),o=t.map((function(v){return v[0]})).join(","),i=t.map((function(v,g){return v[0]+r[g]})).join(","),s=et("rc",n),u=et("source",n),c=s[n-1]+" < "+this.outputShape[n-1],l=n===1?"source":"vec2("+u.slice(-2).join()+")",h=[a+" rc = outputLoc;",s[n-1]+` += 1;
       if(`+c+`) {
      `,n===1?"":`}
       rc = outputLoc;
       `+s[n-2]+` += 1;
       if(`+s[n-2]+" < "+this.outputShape[n-2]+") {",n===1?"":"  "+s[n-1]+` += 1;
         if(`+c+") {"],f=n===1?"rc < start || rc >= end":"any(lessThan(rc, start)) || any(greaterThanEqual(rc, end))",p="",d=0,m=n===1?2:4;d<m;d++)p+=`
        `+h[d]+`
        if (`+f+`) {
          result[`+d+"] = float("+e+`);
        } else {
          `+a+` source = rc - start;
          result[`+d+"] = getChannel(getX("+u.join()+"), "+l+`);
        }
      `;p+=n===1?"} ":"}}",this.userCode=`
      const `+a+" start = "+a+"("+o+`);
      const `+a+" end = "+a+"("+i+`);

      void main() {
        `+a+` outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        `+p+`
        setOutput(result);
      }
    `},Ua=function(r,t,e){if(this.variableNames=["x"],t==="avg"&&e)throw new Error("Cannot compute positions for average pool.");var n=r.filterWidth,a=r.strideHeight,o=r.strideWidth,i=r.dilationHeight,s=r.dilationWidth,u=r.effectiveFilterHeight,c=r.effectiveFilterWidth,l=r.padInfo.top,h=r.padInfo.left;this.outputShape=r.outShape;var f=t==="avg",p="0.0";if(f||(p="-1.0 / 1e-20"),e)this.userCode=`
        const ivec2 strides = ivec2(`+a+", "+o+`);
        const ivec2 pads = ivec2(`+l+", "+h+`);

        void main() {
          ivec4 coords = getOutputCoords();
          int batch = coords[0];
          int d = coords[3];

          ivec2 xRCCorner = coords.yz * strides - pads;
          int xRCorner = xRCCorner.x;
          int xCCorner = xRCCorner.y;

          // max/min x(?, ?, d) to get y(yR, yC, d).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;
          float avgValue = 0.0;

          for (int wR = 0; wR < `+u+`;
              wR += `+i+`) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= `+r.inHeight+`) {
              continue;
            }

            for (int wC = 0; wC < `+c+`;
                wC += `+s+`) {
              int xC = xCCorner + wC;

              if (xC < 0 || xC >= `+r.inWidth+`) {
                continue;
              }

              float value = getX(batch, xR, xC, d);

              // If a min / max value has already been found, use it. If not,
              // use the current value.
              float currMinMaxValue = mix(
                  value, minMaxValue, minMaxValueFound);
              if (value >= currMinMaxValue) {
                minMaxValue = value;
                minMaxValueFound = 1.0;
                minMaxPosition = wR * `+c+` + wC;
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;else{var d=t+"("+t+"("+t+"(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])";t==="avg"&&(d="avgValue / count");var m=4*Math.floor(n/4),v=n%4,g=`
      if (`+f+`) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = max(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec2 strides = ivec2(`+a+", "+o+`);
      const ivec2 pads = ivec2(`+l+", "+h+`);
      const float initializationValue = `+p+`;
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xR, int xC, int d) {
        if (xC < 0 || xC >= `+r.inWidth+`) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xR, xC, d);
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d = coords[3];

        ivec2 xRCCorner = coords.yz * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // max/min x(?, ?, d) to get y(yR, yC, d).
        // ? = to be determined
        vec4 minMaxValue = vec4(`+p+`);
        float avgValue = 0.0;
        count = 0.0;

        for (int wR = 0; wR < `+u+`;
            wR += `+i+`) {
          int xR = xRCorner + wR;

          if (xR < 0 || xR >= `+r.inHeight+`) {
            continue;
          }

          for (int wC = 0; wC < `+m+`; wC += 4) {
            int xC = xCCorner + wC * `+s+`;

            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + `+s+`, d),
              getValue(batch, xR, xC + 2 * `+s+`, d),
              getValue(batch, xR, xC + 3 * `+s+`, d)
            );

            `+g+`
          }

          int xC = xCCorner + `+m+`;
          if (`+(v===1)+`) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              initializationValue,
              initializationValue,
              initializationValue
            );

            `+g+`
          } else if (`+(v===2)+`) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + `+s+`, d),
              initializationValue,
              initializationValue
            );

            `+g+`
          } else if (`+(v===3)+`) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + `+s+`, d),
              getValue(batch, xR, xC + 2 * `+s+`, d),
              initializationValue
            );

            `+g+`
          }
        }
        setOutput(`+d+`);
      }
    `}},za=function(r,t,e){if(this.variableNames=["x"],t==="avg"&&e)throw new Error("Cannot compute positions for average pool.");var n=r.filterWidth,a=r.strideDepth,o=r.strideHeight,i=r.strideWidth,s=r.dilationDepth,u=r.dilationHeight,c=r.dilationWidth,l=r.effectiveFilterDepth,h=r.effectiveFilterHeight,f=r.effectiveFilterWidth,p=r.padInfo.front,d=r.padInfo.top,m=r.padInfo.left;this.outputShape=r.outShape;var v=t==="avg",g="0.0";if(v||(g="-1.0 / 1e-20"),e)this.userCode=`
        const ivec3 strides =
            ivec3(`+a+", "+o+", "+i+`);
        const ivec3 pads = ivec3(`+p+", "+d+", "+m+`);

        void main() {
          ivec5 coords = getOutputCoords();
          int batch = coords.x;
          int ch = coords.u;

          ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
          int xDCorner = xCorner.x;
          int xRCorner = xCorner.y;
          int xCCorner = xCorner.z;

          // max/min x(?, ?, ?, ch) to get y(yD, yR, yC, ch).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;

          for (int wD = 0; wD < `+l+`;
              wD += `+s+`) {
            int xD = xDCorner + wD;

            if (xD < 0 || xD >= `+r.inDepth+`) {
              continue;
            }

            for (int wR = 0; wR < `+h+`;
                wR += `+u+`) {
              int xR = xRCorner + wR;

              if (xR < 0 || xR >= `+r.inHeight+`) {
                continue;
              }

              for (int wC = 0; wC < `+f+`;
                  wC += `+c+`) {
                int xC = xCCorner + wC;

                if (xC < 0 || xC >= `+r.inWidth+`) {
                  continue;
                }

                float value = getX(batch, xD, xR, xC, ch);

                // If a min / max value has already been found, use it. If not,
                // use the current value.
                float currMinMaxValue = mix(
                    value, minMaxValue, minMaxValueFound);
                if (value >= currMinMaxValue) {
                  minMaxValue = value;
                  minMaxValueFound = 1.0;
                  minMaxPosition =
                      wD * `+h+" * "+f+` +
                      wR * `+f+` + wC;;
                }
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;else{var x=t+"("+t+"("+t+"(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])";t==="avg"&&(x="avgValue / count");var b=4*Math.floor(n/4),y=n%4,w=`
      if (`+v+`) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = max(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec3 strides =
        ivec3(`+a+", "+o+", "+i+`);
      const ivec3 pads = ivec3(`+p+", "+d+", "+m+`);
      const float initializationValue = `+g+`;
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xD, int xR, int xC, int ch) {
        if (xC < 0 || xC >= `+r.inWidth+`) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xD, xR, xC, ch);
      }

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xDCorner = xCorner.x;
        int xRCorner = xCorner.y;
        int xCCorner = xCorner.z;

        // max/min x(?, ?, ?, d) to get y(yD, yR, yC, ch).
        // ? = to be determined
        vec4 minMaxValue = vec4(`+g+`);
        float avgValue = 0.0;
        count = 0.0;

        for (int wD = 0; wD < `+l+`;
            wD += `+s+`) {
          int xD = xDCorner + wD;

          if (xD < 0 || xD >= `+r.inDepth+`) {
            continue;
          }

          for (int wR = 0; wR < `+h+`;
            wR += `+u+`) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= `+r.inHeight+`) {
              continue;
            }

            for (int wC = 0; wC < `+b+`; wC += 4) {
              int xC = xCCorner + wC * `+c+`;

              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + `+c+`, ch),
                getValue(batch, xD, xR, xC + 2 * `+c+`, ch),
                getValue(batch, xD, xR, xC + 3 * `+c+`, ch)
              );

              `+w+`
            }

            int xC = xCCorner + `+b+`;
            if (`+(y===1)+`) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                initializationValue,
                initializationValue,
                initializationValue
              );

              `+w+`
            } else if (`+(y===2)+`) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + `+c+`, ch),
                initializationValue,
                initializationValue
              );

              `+w+`
            } else if (`+(y===3)+`) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + `+c+`, ch),
                getValue(batch, xD, xR, xC + 2 * `+c+`, ch),
                initializationValue
              );

              `+w+`
            }
          }
          setOutput(`+x+`);
        }
      }
    `}},vp=function(r,t){this.variableNames=["x"];var e=r.windowSize,n=r.batchSize,a=r.inSize,o=Math.ceil(a/e);this.outputShape=[n,o];var i="0.0",s="";t==="prod"?i="1.0":t==="min"?(i="1.0 / 1e-20",s="min"):t==="max"&&(i="-1.0 / 1e-20",s="max");var u=t+"("+t+"("+t+"(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])";t==="sum"?u="sumValue":t==="prod"?u="prodValue":t==="all"?u="allValue":t==="any"&&(u="anyValue");var c=4*Math.floor(e/4),l=e%4,h=`
      if (`+(t==="sum")+`) {
        sumValue += dot(values, ones);
      } else if (`+(t==="prod")+`) {
        vec2 tmp = vec2(values[0], values[1]) * vec2(values[2], values[3]);
        prodValue *= tmp[0] * tmp[1];
      } else {
        minMaxValue = `+s+`(values, minMaxValue);
      }
    `,f="vec4";t==="all"?(i="1.0",h=`
        bool reducedAllValue = all(values);
        float floatedReducedAllValue = float(reducedAllValue);
        allValue = float(allValue >= 1.0 && floatedReducedAllValue >= 1.0);
      `,f="bvec4"):t==="any"&&(i="0.0",h=`
        bool reducedAnyValue = any(values);
        float floatedReducedAnyValue = float(reducedAnyValue);
        anyValue = float(anyValue >= 1.0 || floatedReducedAnyValue >= 1.0);
      `,f="bvec4");var p="";a%e>0&&(p=`
        if (inIdx < 0 || inIdx >= `+a+`) {
          return initializationValue;
        }
      `),this.userCode=`
      const float initializationValue = `+i+`;
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        `+p+`
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * `+e+`;

        vec4 minMaxValue = vec4(`+i+`);
        float prodValue = 1.0;
        float sumValue = 0.0;
        float allValue = 1.0;
        float anyValue = 0.0;

        for (int i = 0; i < `+c+`; i += 4) {
          int inIdx = inOffset + i;
          `+f+" values = "+f+`(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          `+h+`
        }

        int inIdx = inOffset + `+c+`;
        if (`+(l===1)+`) {
          `+f+" values = "+f+`(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          `+h+`
        } else if (`+(l===2)+`) {
          `+f+" values = "+f+`(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          `+h+`
        } else if (`+(l===3)+`) {
          `+f+" values = "+f+`(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          `+h+`
        }
        setOutput(`+u+`);
      }
    `},mp=function(r,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=r;for(var e="",n=0;n<4;n++){var a="thisRC = rc;";n%2==1&&(a+="thisRC.z += 1;"),n>1&&(a+="thisRC.y += 1;"),e+=`
        `+a+`
        `+(n>0?"if(thisRC.y < rows && thisRC.z < cols){":"")+`
          int flatIndex = getFlatIndex(thisRC);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flatIndex);
          vec2 inputRCInnerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[`+n+`] =
            getChannel(getA(inputRC.x, inputRC.y, inputRC.z), inputRCInnerDims);
        `+(n>0?"}":"")+`
      `}this.userCode=`
      
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      `+dn(["r","c","d"],t)+`
      return ivec3(r, c, d);
    }
  
      `+Bo(r)+`

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.);

        ivec3 thisRC;
        int rows = `+r[1]+`;
        int cols = `+r[2]+`;

        `+e+`

        setOutput(result);
      }
    `},gp=function(r,t,e){this.variableNames=["dy"],this.outputShape=[],this.outputShape=t.shape;var n=t.shape,a=n[1],o=n[2],i=r.shape,s=i[1],u=i[2],c=[e&&s>1?a-1:a,e&&u>1?o-1:o],l=[e&&s>1?s-1:s,e&&u>1?u-1:u],h=c[0]/l[0],f=c[1]/l[1],p=1/h,d=1/f,m=2*Math.ceil(p)+2,v=2*Math.ceil(d)+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(`+h+`);
        const float widthScale = float(`+f+`);

        const float invHeightScale = float(`+p+`);
        const float invWidthScale = float(`+d+`);

        const int winHeight = int(`+m+`);
        const int winWidth = int(`+v+`);

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(startRLerp - float(winHeight / 2));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(startCLerp - float(winWidth / 2));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= `+s+`) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= `+u+`) {
              continue;
            }

            float dxR = float(dyR) * heightScale;
            int topDxRIndex = int(floor(dxR));
            int bottomDxRIndex = int(min(ceil(dxR), `+(a-1)+`.0));
            float dxRLerp = dxR - float(topDxRIndex);
            float inverseDxRLerp = 1.0 - dxRLerp;

            float dxC = float(dyC) * widthScale;
            int leftDxCIndex = int(floor(dxC));
            int rightDxCIndex = int(min(ceil(dxC), `+(o-1)+`.0));
            float dxCLerp = dxC - float(leftDxCIndex);
            float inverseDxCLerp = 1.0 - dxCLerp;

            if (r == topDxRIndex && c == leftDxCIndex) {
              // topLeft
              accumulator +=
                getDy(b, dyR, dyC, d) * inverseDxRLerp * inverseDxCLerp;
            }

            if (r == topDxRIndex && c == rightDxCIndex) {
              // topRight
              accumulator += getDy(b, dyR, dyC, d) * inverseDxRLerp * dxCLerp;
            }

            if (r == bottomDxRIndex && c == leftDxCIndex) {
              // bottomLeft
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * inverseDxCLerp;
            }

            if (r == bottomDxRIndex && c == rightDxCIndex) {
              // bottomRight
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * dxCLerp;
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `},yp=function(r,t,e,n){this.variableNames=["A"],this.outputShape=[];var a=r[0],o=r[1],i=r[2],s=r[3];this.outputShape=[a,t,e,s];var u=[n&&t>1?o-1:o,n&&e>1?i-1:i],c=[n&&t>1?t-1:t,n&&e>1?e-1:e];this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          `+u[0]/c[0]+`,
          `+u[1]/c[1]+`);
      const vec2 inputShapeRC = vec2(`+o+".0, "+i+`.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = vec2(yRC) * effectiveInputOverOutputRatioRC;

        // Compute the four integer indices.
        ivec2 sourceFloorRC = ivec2(sourceFracIndexRC);
        ivec2 sourceCeilRC = ivec2(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        float topLeft = getA(b, sourceFloorRC.x, sourceFloorRC.y, d);
        float bottomLeft = getA(b, sourceCeilRC.x, sourceFloorRC.y, d);
        float topRight = getA(b, sourceFloorRC.x, sourceCeilRC.y, d);
        float bottomRight = getA(b, sourceCeilRC.x, sourceCeilRC.y, d);

        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);

        float top = topLeft + (topRight - topLeft) * fracRC.y;
        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;
        float newValue = top + (bottom - top) * fracRC.x;

        setOutput(newValue);
      }
    `},xp=function(r,t,e,n){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];var a=r[0],o=r[1],i=r[2],s=r[3];this.outputShape=[a,t,e,s];var u=[n&&t>1?o-1:o,n&&e>1?i-1:i],c=[n&&t>1?t-1:t,n&&e>1?e-1:e];this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          `+u[0]/c[0]+`,
          `+u[1]/c[1]+`,
          `+u[1]/c[1]+`);
      const vec3 inputShapeRC = vec3(`+o+".0, "+i+`.0,
                                     `+i+`.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = vec3(yRC) * effectiveInputOverOutputRatioRC;

        // Compute the four integer indices.
        ivec3 sourceFloorRC = ivec3(sourceFracIndexRC);
        ivec3 sourceCeilRC = ivec3(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < `+(s-1)+`;
        bool hasNextRow = coords.z < `+(e-1)+`;

        // In parallel, construct four corners for all four components in
        // packed 2x2 cell.
        vec4 topLeft = vec4(
          getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 bottomLeft = vec4(
          getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 topRight = vec4(
          getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec4 bottomRight = vec4(
          getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec3 fracRC = sourceFracIndexRC - vec3(sourceFloorRC);

        vec4 top = mix(topLeft, topRight, fracRC.yyzz);
        vec4 bottom = mix(bottomLeft, bottomRight, fracRC.yyzz);
        vec4 newValue = mix(top, bottom, fracRC.x);

        setOutput(newValue);
      }
    `},bp=function(r,t,e){this.variableNames=["dy"],this.outputShape=[],this.outputShape=t.shape;var n=t.shape,a=n[1],o=n[2],i=r.shape,s=i[1],u=i[2],c=[e&&s>1?a-1:a,e&&u>1?o-1:o],l=[e&&s>1?s-1:s,e&&u>1?u-1:u],h=c[0]/l[0],f=c[1]/l[1],p=1/h,d=1/f,m=2*Math.ceil(p)+2,v=2*Math.ceil(d)+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(`+h+`);
        const float widthScale = float(`+f+`);

        const float invHeightScale = float(`+p+`);
        const float invWidthScale = float(`+d+`);

        const int winHeight = int(`+m+`);
        const int winWidth = int(`+v+`);

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(floor(startRLerp - float(winHeight / 2)));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(floor(startCLerp - float(winWidth / 2)));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= `+s+`) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= `+u+`) {
              continue;
            }

            float sourceFracRow =
              float(`+c[0]+`) *
                (float(dyR) / float(`+l[0]+`));

            float sourceFracCol =
                float(`+c[1]+`) *
                  (float(dyC) / float(`+l[1]+`));

            int sourceNearestRow = int(min(
                float(int(`+a+`) - 1),
                `+e+` ? float(round(sourceFracRow)) :
                                  float(floor(sourceFracRow))));

            int sourceNearestCol = int(min(
                float(int(`+o+`) - 1),
                `+e+` ? float(round(sourceFracCol)) :
                                  float(floor(sourceFracCol))));

            if (r == sourceNearestRow && c == sourceNearestCol) {
              accumulator += getDy(b, dyR, dyC, d);
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `},wp=function(r,t,e,n){this.variableNames=["A"],this.outputShape=[];var a=r[0],o=r[1],i=r[2],s=r[3];this.outputShape=[a,t,e,s];var u=[n&&t>1?o-1:o,n&&e>1?i-1:i],c=[n&&t>1?t-1:t,n&&e>1?e-1:e],l=n?"0.5":"0.0";this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          `+u[0]/c[0]+`,
          `+u[1]/c[1]+`);
      const vec2 inputShapeRC = vec2(`+o+".0, "+i+`.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = vec2(yRC) * effectiveInputOverOutputRatioRC;

        // Compute the coordinators of nearest neighbor point.
        ivec2 sourceNearestRC = ivec2(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + `+l+`)));

        float newValue = getA(b, sourceNearestRC.x, sourceNearestRC.y, d);

        setOutput(newValue);
      }
    `},Cp=function(r,t){this.variableNames=["x"];var e=r.length;if(e>4)throw new Error("WebGL backend: Reverse of rank-"+e+" tensor is not yet supported");if(this.outputShape=r,e!==1){var n=r.map((function(o,i){return(function(s){return t.indexOf(s)!==-1&&r[s]!==1?r[s]+" - coords["+s+"] - 1":"coords["+s+"]"})(i)})).join(","),a=ke(e);this.userCode=`
      void main() {
        `+a+` coords = getOutputCoords();
        setOutput(getX(`+n+`));
      }
    `}else this.userCode=`
        void main() {
          int coord = getOutputCoords();
          setOutput(getX(`+r[0]+` - coord - 1));
        }
      `},_p=function(r,t){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0;var e=r.length;if(e>4)throw new Error("WebGL backend: Reverse of rank-"+e+" tensor is not yet supported");this.outputShape=r;var n=et("rc",e),a=n[e-1]+" + 1 < "+this.outputShape[e-1],o=n[e-2]+" + 1 < "+this.outputShape[e-2],i=ke(e);function s(u){var c=r.map((function(l,h){return(function(f,p){return t.indexOf(f)!==-1&&r[f]!==1?r[f]+" - "+p[f]+" - 1":""+p[f]})(h,u)}));return"getChannel(getX("+c.join(",")+"), vec2("+c.slice(-2).join(",")+"))"}this.userCode=e===1?`
        void main(){
          int rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = getChannel(getX(`+r[0]+` - rc - 1),
            `+r[0]+` - rc - 1);
          if(`+a+`){
              result.g = getChannel(getX(`+r[0]+` - (rc  + 1) - 1),
                `+r[0]+` - (rc  + 1) - 1);
          }
          setOutput(result);
        }
      `:`
        void main() {
          `+i+` rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = `+(function(u){return s(u)})(n.slice())+`;
          if(`+a+`){
            result.g = `+(function(u){return u[e-1]="("+u[e-1]+" + 1)",s(u)})(n.slice())+`;
          }
          if(`+o+`) {
            result.b = `+(function(u){return u[e-2]="("+u[e-2]+" + 1)",s(u)})(n.slice())+`;
            if(`+a+`) {
              result.a = `+(function(u){return u[e-1]="("+u[e-1]+" + 1)",u[e-2]="("+u[e-2]+" + 1)",s(u)})(n.slice())+`;
            }
          }
          setOutput(result);
        }
    `},Ji=function(r,t,e,n,a,o,i){this.variableNames=["updates","indices","defaultValue"],this.outputShape=o;var s=ke(a.length),u=ke(o.length),c="";e===1?c="i":e===2&&(c="i, j");var l="getIndices("+c+")",h="";n===1?h="i":n===2&&(h="i, coords[1]");var f="getUpdates("+h+")",p=t>1?"strides[j]":"strides";this.userCode=`
        `+s+" strides = "+s+"("+a+`);

        void main() {
          `+u+` coords = getOutputCoords();
          float sum = 0.0;
          bool found = false;
          for (int i = 0; i < `+r+`; i++) {
            int flattenedIndex = 0;
            for (int j = 0; j < `+t+`; j++) {
              int index = round(`+l+`);
              flattenedIndex += index * `+p+`;
            }
            if (flattenedIndex == coords[0]) {
              sum += `+f+`;
              found = true;
            }
          }
          setOutput(mix(getDefaultValue(), sum, float(found)));
        }
      `},Ep=function(r,t){this.variableNames=["x","segmentIds"];var e=r.windowSize,n=r.batchSize,a=r.inSize,o=r.numSegments,i=o*Math.ceil(a/e);this.outputShape=[n,i];var s=4*Math.floor(e/4),u=e%4,c=`
        sumValue += dot(values, segFilter);
    `,l="";a%e>0&&(l=`
        if (inIdx < 0 || inIdx >= `+a+`) {
          return initializationValue;
        }
      `);var h="";a%e>0&&(h=`
        if (inIdx < 0 || inIdx >= `+a+`) {
          return -1.0;
        }
      `),this.userCode=`
      const float initializationValue = 0.0;

      float getValue(int batch, int inIdx) {
        `+l+`
        return getX(batch, inIdx);
      }

      float getSegmentIdAtIndex(int inIdx) {
        `+h+`
        return getSegmentIds(inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = int(floor(float(outIdx) / float(
          `+o+")) * float("+e+`));
        int currentSeg = int(mod(float(outIdx), float(`+o+`)));

        float sumValue = 0.0;

        for (int i = 0; i < `+s+`; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 3)) == currentSeg ? 1 : 0
          );

          `+c+`
        }

        int inIdx = inOffset + `+s+`;
        if (`+(u===1)+`) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          int inIdxSeg = int(getSegmentIdAtIndex(inIdx));

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            0,
            0,
            0
          );

          `+c+`
        } else if (`+(u===2)+`) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
              0,
              0
          );

          `+c+`
        } else if (`+(u===3)+`) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            0
          );

          `+c+`
        }
        setOutput(sumValue);
      }
    `},kp=function(r,t,e){var n,a;if(this.variableNames=["c","a","b"],this.outputShape=t,e>4)throw Error("Where for rank "+e+" is not yet supported");if(e===1)a="resRC",n="resRC";else{for(var o=["resRC.x","resRC.y","resRC.z","resRC.w"],i=[],s=[],u=0;u<t.length;u++)s.push(""+o[u]),u<r&&i.push(""+o[u]);n=i.join(),a=s.join()}var c=ke(e);this.userCode=`
      void main() {
        `+c+` resRC = getOutputCoords();
        float cVal = getC(`+n+`);
        if (cVal >= 1.0) {
          setOutput(getA(`+a+`));
        } else {
          setOutput(getB(`+a+`));
        }
      }
    `},Rp=(function(){function r(t){this.variableNames=["source"],this.outputShape=t,this.rank=t.length;var e,n=ke(this.rank),a="uniform int start["+this.rank+"];",o=(function(i){if(i===1)return"sourceLoc";if(i<=6)return Va.slice(0,i).map((function(s){return"sourceLoc."+s})).join(",");throw Error("Slicing for rank "+i+" is not yet supported")})(this.rank);e=`
        `+n+` sourceLoc;
        `+n+` coords = getOutputCoords();
        `+t.map((function(i,s){return"sourceLoc."+Va[s]+" = start["+s+"] + coords."+Va[s]+";"})).join(`
`)+`
      `,this.userCode=`
      `+a+`
      void main() {
        `+e+`
        setOutput(getSource(`+o+`));
      }
    `}return r.prototype.getCustomSetupFunc=function(t){var e=this;if(t.length!==this.rank)throw Error("The rank ("+this.rank+") of the program must match the length of start ("+t.length+")");return function(n,a){e.startLoc==null&&(e.startLoc=n.getUniformLocationNoThrow(a,"start"),e.startLoc==null)||n.gl.uniform1iv(e.startLoc,t)}},r})(),Va=["x","y","z","w","u","v"],Ip=(function(){function r(t){this.variableNames=["source"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t,this.rank=t.length;var e=ke(this.rank),n=et("coords",this.rank),a=et("sourceLoc",this.rank),o=this.rank===1?"sourceLoc":"vec2("+a.slice(-2).join()+")",i="getChannel(getSource("+a.join()+"), "+o+")",s=`
      result.x = `+i+`;
      if (++`+n[this.rank-1]+" < "+t[this.rank-1]+`) {
        ++`+a[this.rank-1]+`;
        result.y = `+i+`;
        --`+a[this.rank-1]+`;
      }
    `,u=this.rank===1?"":`
      --`+n[this.rank-1]+`;
      if (++`+n[this.rank-2]+" < "+t[this.rank-2]+`) {
        ++`+a[this.rank-2]+`;
        result.z = `+i+`;
        if (++`+n[this.rank-1]+" < "+t[this.rank-1]+`) {
          ++`+a[this.rank-1]+`;
          result.w = `+i+`;
        }
      }
    `,c=this.rank<=4?`sourceLoc = coords +
            `+e+"("+t.map((function(l,h){return"start["+h+"]"})).join()+");":t.map((function(l,h){return a[h]+" = "+n[h]+" + start["+h+"];"})).join(`
`);this.userCode=`
      uniform int start[`+this.rank+`];
      void main() {
        `+e+` coords = getOutputCoords();
        `+e+` sourceLoc;
        `+c+`
        vec4 result = vec4(0.);
        `+s+`
        `+u+`
        setOutput(result);
      }
    `}return r.prototype.getCustomSetupFunc=function(t){var e=this;if(t.length!==this.rank)throw Error("The rank ("+this.rank+") of the program must match the length of start ("+t.length+")");return function(n,a){e.startLoc==null&&(e.startLoc=n.getUniformLocationNoThrow(a,"start"),e.startLoc==null)||n.gl.uniform1iv(e.startLoc,t)}},r})(),Sp=function(r,t,e){this.variableNames=["x"],this.outputShape=e;var n=e.length,a=ke(e.length),o=ke(e.length),i="";if(n===1)i="coords * strides + begin";else{var s=0;i=e.map((function(u,c){return s++,e.length===1?"coords * strides["+c+"] + begin["+c+"]":"coords["+(s-1)+"] * strides["+c+"] + begin["+c+"]"})).join(",")}this.userCode=`
      `+a+" begin = "+a+"("+r+`);
      `+a+" strides = "+a+"("+t+`);

      void main() {
        `+o+` coords = getOutputCoords();
        setOutput(getX(`+i+`));
      }
    `},Dp=(function(){function r(t){this.gpgpu=t,this.numUsedTextures=0,this.numFreeTextures=0,this.freeTextures={},this.logEnabled=!1,this.usedTextures={}}return r.prototype.acquireTexture=function(t,e,n){var a,o=Qi(e,n),i=Zi(t,o,n);if(i in this.freeTextures||(this.freeTextures[i]=[]),i in this.usedTextures||(this.usedTextures[i]=[]),this.freeTextures[i].length>0){this.numFreeTextures--,this.numUsedTextures++,this.log();var s=this.freeTextures[i].shift();return this.usedTextures[i].push(s),s}return this.numUsedTextures++,this.log(),o===ut.PACKED_2X2_FLOAT32?a=this.gpgpu.createPackedMatrixTexture(t[0],t[1]):o===ut.PACKED_2X2_FLOAT16?a=this.gpgpu.createFloat16PackedMatrixTexture(t[0],t[1]):o===ut.UNPACKED_FLOAT32?a=this.gpgpu.createFloat32MatrixTexture(t[0],t[1]):o===ut.UNPACKED_FLOAT16?a=this.gpgpu.createFloat16MatrixTexture(t[0],t[1]):o===ut.PACKED_4X1_UNSIGNED_BYTE&&(a=this.gpgpu.createUnsignedBytesMatrixTexture(t[0],t[1])),this.usedTextures[i].push(a),a},r.prototype.releaseTexture=function(t,e,n,a){if(this.freeTextures!=null){var o=Zi(e,Qi(n,a),a);o in this.freeTextures||(this.freeTextures[o]=[]),this.freeTextures[o].push(t),this.numFreeTextures++,this.numUsedTextures--;var i=this.usedTextures[o],s=i.indexOf(t);if(s<0)throw new Error("Cannot release a texture that was never provided by this texture manager");i.splice(s,1),this.log()}},r.prototype.log=function(){if(this.logEnabled){var t=this.numFreeTextures+this.numUsedTextures;console.log("Free/Used",this.numFreeTextures+" / "+this.numUsedTextures,"("+t+")")}},r.prototype.getNumUsedTextures=function(){return this.numUsedTextures},r.prototype.getNumFreeTextures=function(){return this.numFreeTextures},r.prototype.dispose=function(){var t=this;if(this.freeTextures!=null){for(var e in this.freeTextures)this.freeTextures[e].forEach((function(n){t.gpgpu.deleteMatrixTexture(n)}));for(var e in this.usedTextures)this.usedTextures[e].forEach((function(a){t.gpgpu.deleteMatrixTexture(a)}));this.freeTextures=null,this.usedTextures=null,this.numUsedTextures=0,this.numFreeTextures=0}},r})();function Qi(r,t){if(r===ct.UPLOAD)return ut.PACKED_2X2_FLOAT32;if(r===ct.RENDER||r==null)return(function(e){return B().getBool("WEBGL_RENDER_FLOAT32_ENABLED")?e?ut.PACKED_2X2_FLOAT32:ut.UNPACKED_FLOAT32:e?ut.PACKED_2X2_FLOAT16:ut.UNPACKED_FLOAT16})(t);if(r===ct.DOWNLOAD||r===ct.PIXELS)return ut.PACKED_4X1_UNSIGNED_BYTE;throw new Error("Unknown logical texture type "+r)}function Zi(r,t,e){return r[0]+"_"+r[1]+"_"+t+"_"+e}var Ap=function(r,t){this.variableNames=["A"];for(var e=new Array(r.length),n=0;n<e.length;n++)e[n]=r[n]*t[n];this.outputShape=e,this.rank=e.length;var a=ke(this.rank),o=(function(i){var s=i.length;if(s>5)throw Error("Tile for rank "+s+" is not yet supported");if(s===1)return"imod(resRC, "+i[0]+")";for(var u=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u"],c=[],l=0;l<i.length;l++)c.push("imod("+u[l]+", "+i[l]+")");return c.join()})(r);this.userCode=`
      void main() {
        `+a+` resRC = getOutputCoords();
        setOutput(getA(`+o+`));
      }
    `},Tp=function(r,t){this.variableNames=["A"];for(var e=new Array(r.length),n=0;n<e.length;n++)e[n]=r[t[n]];this.outputShape=e,this.rank=e.length;var a=ke(this.rank),o=(function(i){var s=i.length;if(s>6)throw Error("Transpose for rank "+s+" is not yet supported");for(var u=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u","resRC.v"],c=new Array(s),l=0;l<i.length;l++)c[i[l]]=u[l];return c.join()})(t);this.userCode=`
    void main() {
      `+a+` resRC = getOutputCoords();
      setOutput(getA(`+o+`));
    }
    `},Np=function(r,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0;for(var e=new Array(r.length),n=0;n<e.length;n++)e[n]=r[t[n]];if(this.outputShape=e,this.rank=e.length,this.rank>6)throw Error("Packed transpose for rank "+this.rank+" is not yet supported.");var a=ke(this.rank),o=Cu("rc",this.rank),i=new Array(this.rank);for(n=0;n<t.length;n++)i[t[n]]=o[n];var s="vec2("+i.slice(-2).join()+")",u="++"+o[this.rank-1]+" < "+e[this.rank-1],c="getChannel(getA("+i.join()+"), "+s+")";this.userCode=`
    void main() {
      `+a+` rc = getOutputCoords();
      vec4 result = vec4(0.);
      result[0] = `+c+`;
      if(`+u+`) {
        result[1] = `+c+`;
      }
      --`+o[this.rank-1]+`;
      if(++`+o[this.rank-2]+" < "+e[this.rank-2]+`) {
        result[2] = `+c+`;
        if(`+u+`) {
          result[3] = `+c+`;
        }
      }
      setOutput(result);
    }
    `},Lo=1.7580993408473768,Wo=1.0507009873554805,fe=function(r,t){this.variableNames=["A"],this.outputShape=r,this.userCode=`
      float unaryOperation(float x) {
        `+t+`
      }

      void main() {
        float x = getAAtOutCoords();
        float y = unaryOperation(x);

        setOutput(y);
      }
    `},wt="if (isnan(x)) return x;",Fp="return x;",es="return abs(x);",Iu=wt+`
  return (x < 0.0) ? 0.0 : x;
`,Su=wt+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,Du="return (x >= 0.0) ? x : (exp(x) - 1.0);",Pp=`
  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.
  // see: https://arxiv.org/abs/1706.02515
  float scaleAlpha = `+Lo+`;
  float scale = `+Wo+`;
  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);
`,ts="return -x;",ns="return ceil(x);",rs="return floor(x);",as="return exp(x);",os="return exp(x) - 1.0;",Mp=wt+`
  return sin(x);
`,Op=wt+`
  return cos(x);
`,Bp=wt+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return asin(x);
`,Lp=wt+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return acos(x);
`,Wp=wt+`
  return atan(x);
`,Up=wt+"return log(x + sqrt(x * x + 1.0));",zp=wt+`
  if (x < 1.0) return NAN;
  return log(x + sqrt(x * x - 1.0));`,Vp=wt+`
  if ((x < -1.0) || (x > 1.0)) return NAN;
  return (log(1.0 + x) - log(1.0 - x)) / 2.0;`,Rr="return x;",Gp="return x;",Au=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,Tu=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,Nu=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,Qn=function(r,t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=r,this.userCode=`
      vec4 unaryOperation(vec4 x) {
        `+t+`
      }

      void main() {
        vec4 x = getAAtOutCoords();
        vec4 y = unaryOperation(x);

        setOutput(y);
      }
    `},Hp=function(r){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outputShape=r;var t=r.length,e=et("rc",t),n=ke(t),a=(function(s,u){if(s===1)return"rc";for(var c="",l=0;l<s;l++)c+=u[l],l<s-1&&(c+=",");return c})(t,e),o=e.slice(-2),i=t<=1?"rc":"vec2("+o.join(",")+")";this.userCode=`
      void main() {
        `+n+` rc = getOutputCoords();
        vec4 packedInput = getA(`+a+`);

        setOutput(getChannel(packedInput, `+i+`));
      }
    `},Ir={};function Sr(r,t){if(t===void 0&&(t=!1),r==="linear")return t?Gp:Fp;if(r==="relu")return t?Au:Iu;if(r==="elu")return t?Nu:Du;if(r==="relu6")return t?Tu:Su;if(r==="prelu")return t?Ru:ku;throw new Error("Activation "+r+" has not been implemented for the WebGL backend.")}var jp=600,qp=(function(r){function t(e){var n,a=r.call(this)||this;if(a.pendingRead=new WeakMap,a.pendingDisposal=new WeakSet,a.dataRefCount=new WeakMap,a.numBytesInGPU=0,a.uploadWaitMs=0,a.downloadWaitMs=0,a.warnedAboutMemory=!1,a.pendingDeletes=0,a.disposed=!1,!B().getBool("HAS_WEBGL"))throw new Error("WebGL is not supported on this device");if(e==null){var o=Pt(B().getNumber("WEBGL_VERSION"));a.binaryCache=((n=B().getNumber("WEBGL_VERSION"))in Ir||(Ir[n]={}),Ir[n]),a.gpgpu=new rp(o),a.canvas=o.canvas,a.gpgpuCreatedLocally=!0}else a.gpgpu=e,a.binaryCache={},a.gpgpuCreatedLocally=!1,a.canvas=e.gl.canvas;return a.textureManager=new Dp(a.gpgpu),a.numMBBeforeWarning=B().global.screen==null?1024:B().global.screen.height*B().global.screen.width*window.devicePixelRatio*jp/1024/1024,a.texData=new pu(a,T),a}return bt(t,r),t.prototype.numDataIds=function(){return this.texData.numDataIds()+(this.cpuBackend?this.cpuBackend.numDataIds():0)-this.pendingDeletes},t.prototype.write=function(e,n,a){if(B().getBool("DEBUG")&&this.checkNumericalProblems(e),a==="complex64"&&e!=null)throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");var o={};return this.texData.set(o,{shape:n,dtype:a,values:e,usage:ct.UPLOAD}),o},t.prototype.move=function(e,n,a,o){if(B().getBool("DEBUG")&&this.checkNumericalProblems(n),o==="complex64")throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");this.texData.set(e,{shape:a,dtype:o,values:n,usage:ct.UPLOAD})},t.prototype.readSync=function(e){var n=this.texData.get(e),a=n.values,o=n.dtype,i=n.complexTensors,s=n.slice,u=n.shape,c=n.isPacked;if(s!=null){var l=void 0;l=c?new Qn(u,Rr):new fe(u,Rr);var h=this.runWebGLProgram(l,[{dataId:e,shape:u,dtype:o}],o),f=this.readSync(h.dataId);return this.disposeData(h.dataId),f}if(a!=null)return this.convertAndCacheOnCPU(e);if(o==="string")return a;var p,d,m=this.activeTimers!=null;return m&&(p=Rt()),o==="complex64"?d=mo(i.real.dataSync(),i.imag.dataSync()):d=this.getValuesFromTexture(e),m&&(this.downloadWaitMs+=Rt()-p),this.convertAndCacheOnCPU(e,d)},t.prototype.read=function(e){return $(this,void 0,void 0,(function(){var n,a,o,i,s,u,c,l,h,f,p,d,m,v,g,x,b,y,w,C,S,I;return Y(this,(function(k){switch(k.label){case 0:if(this.pendingRead.has(e))return n=this.pendingRead.get(e),[2,new Promise((function(R){return n.push(R)}))];if(a=this.texData.get(e),o=a.values,i=a.shape,s=a.slice,u=a.dtype,c=a.complexTensors,l=a.isPacked,s!=null)return h=void 0,h=l?new Qn(i,Rr):new fe(i,Rr),f=this.runWebGLProgram(h,[{dataId:e,shape:i,dtype:u}],u),p=this.read(f.dataId),this.disposeData(f.dataId),[2,p];if(o!=null)return[2,this.convertAndCacheOnCPU(e)];if(!B().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")&&B().getNumber("WEBGL_VERSION")===2)throw new Error("tensor.data() with WEBGL_DOWNLOAD_FLOAT_ENABLED=false and WEBGL_VERSION=2 not yet supported.");return d=null,u!=="complex64"&&B().get("WEBGL_BUFFER_SUPPORTED")&&(m=this.decode(e),v=this.texData.get(m.dataId),d=(I=this.gpgpu).createBufferFromTexture.apply(I,[v.texture].concat(Zn(i)))),this.pendingRead.set(e,[]),u==="complex64"?[3,2]:[4,this.gpgpu.createAndWaitForFence()];case 1:k.sent(),k.label=2;case 2:return u!=="complex64"?[3,4]:[4,Promise.all([c.real.data(),c.imag.data()])];case 3:return x=k.sent(),b=x[0],y=x[1],g=mo(b,y),[3,5];case 4:d==null?g=this.getValuesFromTexture(e):(w=Q(i),g=this.gpgpu.downloadFloat32MatrixFromBuffer(d,w)),k.label=5;case 5:return m!=null&&this.disposeData(m.dataId),C=this.convertAndCacheOnCPU(e,g),S=this.pendingRead.get(e),this.pendingRead.delete(e),S.forEach((function(R){return R(C)})),this.pendingDisposal.has(e)&&(this.pendingDisposal.delete(e),this.disposeData(e),this.pendingDeletes--),[2,C]}}))}))},t.prototype.checkNumericalProblems=function(e){if(e!=null)for(var n=0;n<e.length;n++){var a=e[n];if(!Fl(a))throw B().getBool("WEBGL_RENDER_FLOAT32_CAPABLE")?Error("The value "+a+" cannot be represented with your current settings. Consider enabling float32 rendering: 'tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);'"):Error("The value "+a+" cannot be represented on this device.")}},t.prototype.getValuesFromTexture=function(e){var n,a=this.texData.get(e),o=a.shape,i=a.dtype,s=a.isPacked,u=Q(o);if(B().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")){var c=this.decode(e),l=this.texData.get(c.dataId),h=(n=this.gpgpu).downloadMatrixFromPackedTexture.apply(n,[l.texture].concat(Zn(o))).subarray(0,u);return this.disposeData(c.dataId),h}var f=B().getBool("WEBGL_PACK")&&s===!0,p=f?Ma(o):o,d=f?new Ff(p):new Nf(p),m=this.runWebGLProgram(d,[{shape:p,dtype:i,dataId:e}],"float32"),v=this.texData.get(m.dataId),g=this.gpgpu.downloadByteEncodedFloatMatrixFromOutputTexture(v.texture,v.texShape[0],v.texShape[1]).subarray(0,u);return this.disposeData(m.dataId),g},t.prototype.time=function(e){return $(this,void 0,void 0,(function(){var n,a,o,i,s,u,c;return Y(this,(function(l){switch(l.label){case 0:return n=this.activeTimers,a=[],o=!1,this.programTimersStack==null?(this.programTimersStack=a,o=!0):this.activeTimers.push(a),this.activeTimers=a,e(),i=Gn(this.activeTimers.map((function(h){return h.query}))).filter((function(h){return h!=null})),s=Gn(this.activeTimers.map((function(h){return h.name}))).filter((function(h){return h!=null})),this.activeTimers=n,o&&(this.programTimersStack=null),u={uploadWaitMs:this.uploadWaitMs,downloadWaitMs:this.downloadWaitMs,kernelMs:null,wallMs:null},B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?[4,Promise.all(i)]:[3,2];case 1:return c=l.sent(),u.kernelMs=pl(c),u.getExtraProfileInfo=function(){return c.map((function(h,f){return{name:s[f],ms:h}})).map((function(h){return h.name+": "+h.ms})).join(", ")},[3,3];case 2:u.kernelMs={error:"WebGL query timers are not supported in this environment."},l.label=3;case 3:return this.uploadWaitMs=0,this.downloadWaitMs=0,[2,u]}}))}))},t.prototype.memory=function(){return{unreliable:!1,numBytesInGPU:this.numBytesInGPU}},t.prototype.startTimer=function(){return B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?this.gpgpu.beginQuery():{startMs:Rt(),endMs:null}},t.prototype.endTimer=function(e){return B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?(this.gpgpu.endQuery(),e):(e.endMs=Rt(),e)},t.prototype.getQueryTime=function(e){return $(this,void 0,void 0,(function(){var n;return Y(this,(function(a){return B().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?[2,this.gpgpu.waitForQueryAndGetTime(e)]:[2,(n=e).endMs-n.startMs]}))}))},t.prototype.disposeData=function(e){if(!this.pendingDisposal.has(e)){if(this.pendingRead.has(e))return this.pendingDisposal.add(e),void this.pendingDeletes++;if(this.texData.has(e)){this.releaseGPUData(e);var n=this.texData.get(e).complexTensors;n!=null&&(n.real.dispose(),n.imag.dispose()),this.texData.delete(e)}}},t.prototype.releaseGPUData=function(e){var n=this.texData.get(e),a=n.texture,o=n.dtype,i=n.texShape,s=n.usage,u=n.isPacked,c=n.slice,l=c&&c.origDataId||e,h=this.dataRefCount.get(l);h>1?this.dataRefCount.set(l,h-1):(this.dataRefCount.delete(l),a!=null&&(this.numBytesInGPU-=this.computeBytes(i,o),this.textureManager.releaseTexture(a,i,s,u)));var f=this.texData.get(e);f.texture=null,f.texShape=null,f.isPacked=!1,f.slice=null},t.prototype.getTexture=function(e){return this.uploadToGPU(e),this.texData.get(e).texture},t.prototype.getDataInfo=function(e){return this.texData.get(e)},t.prototype.getCPUBackend=function(){return B().getBool("WEBGL_CPU_FORWARD")?(this.cpuBackend==null&&(this.cpuBackend=T.findBackend("cpu")),this.cpuBackend):null},t.prototype.shouldExecuteOnCPU=function(e,n){var a=this;return n===void 0&&(n=128),this.getCPUBackend()!=null&&e.every((function(o){return a.texData.get(o.dataId).texture==null&&o.size<n}))},t.prototype.getGPGPUContext=function(){return this.gpgpu},t.prototype.complex=function(e,n){var a=this.makeOutput(e.shape,"complex64");return this.texData.get(a.dataId).complexTensors={real:T.keep(e.clone()),imag:T.keep(n.clone())},a},t.prototype.real=function(e){return this.texData.get(e.dataId).complexTensors.real.clone()},t.prototype.imag=function(e){return this.texData.get(e.dataId).complexTensors.imag.clone()},t.prototype.slice=function(e,n,a){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.slice(e,n,a);if(Q(a)===0)return je([],a,e.dtype);var o=this.texData.get(e.dataId).isPacked,i=hu(e.shape,n,a);if(o||!i){var s=B().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new Ip(a):new Rp(a),u=s.getCustomSetupFunc(n);return this.compileAndRun(s,[e],null,u)}return this.uploadToGPU(e.dataId),this.shallowSlice(e,n,a)},t.prototype.shallowSlice=function(e,n,a){var o=this.texData.get(e.dataId),i=this.makeOutput(a,e.dtype),s=this.texData.get(i.dataId);Object.assign(s,o),s.shape=a,s.dtype=e.dtype;var u=fu(n,e.strides);o.slice&&(u+=o.slice.flatOffset),s.slice={flatOffset:u,origDataId:o.slice&&o.slice.origDataId||e.dataId};var c=this.dataRefCount.get(s.slice.origDataId)||1;return this.dataRefCount.set(s.slice.origDataId,c+1),i},t.prototype.stridedSlice=function(e,n,a,o){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.stridedSlice(e,n,a,o);var i=No(n,a,o);if(i.some((function(u){return u===0})))return je([],i);var s=new Sp(n,o,i);return this.compileAndRun(s,[e])},t.prototype.reverse=function(e,n){var a=B().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new _p(e.shape,n):new Cp(e.shape,n);return this.compileAndRun(a,[e])},t.prototype.concat=function(e,n){if(e[0].dtype==="complex64"){var a=e.map((function(p){return dt(p)})),o=e.map((function(p){return St(p)}));return Ge(this.concat(a,n),this.concat(o,n))}if(this.shouldExecuteOnCPU(e))return this.cpuBackend.concat(e,n);if(e.length===1)return e[0];if(e.length>B().getNumber("WEBGL_MAX_TEXTURES_IN_SHADER")){var i=Math.floor(e.length/2),s=this.concat(e.slice(0,i),n),u=this.concat(e.slice(i),n);return this.concat([s,u],n)}if(B().getBool("WEBGL_PACK_ARRAY_OPERATIONS")&&e[0].rank>1){var c=new yf(e.map((function(p){return p.shape})),n);return this.compileAndRun(c,e)}var l=jn(e.map((function(p){return p.shape})),n),h=e.map((function(p){return p.as2D(-1,Q(p.shape.slice(n)))})),f=new gf(h.map((function(p){return p.shape})));return this.compileAndRun(f,h).reshape(l)},t.prototype.neg=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.neg(e);if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,ts,e.dtype);var n=new fe(e.shape,ts);return this.compileAndRun(n,[e])},t.prototype.batchMatMul=function(e,n,a,o){var i=a?e.shape[2]:e.shape[1],s=o?n.shape[1]:n.shape[2],u=a?e.shape[1]:e.shape[2],c=e.shape[0];if((i===1||s===1)&&u>1e3){a&&(e=e.transpose([0,2,1])),o&&(n=n.transpose([0,2,1]));var l=s===1?e:e.as3D(c,u,1),h=s===1?2:1,f=s===1?n.as3D(c,1,u):n;return this.multiply(l,f).sum(h,!0)}var p=He(e.dtype,n.dtype),d=new Wa(e.shape,[c,i,s],a,o);return this.compileAndRun(d,[e,n],p)},t.prototype.fusedBatchMatMul=function(e){var n=e.a,a=e.b,o=e.transposeA,i=e.transposeB,s=e.bias,u=e.activation,c=e.preluActivationWeights,l=o?n.shape[2]:n.shape[1],h=i?a.shape[1]:a.shape[2],f=n.shape[0],p=He(n.dtype,a.dtype),d=s!=null,m=c!=null,v=u?Sr(u,!0):null,g=new Wa(n.shape,[f,l,h],o,i,d,v,m),x=[n,a];return s&&x.push(s),c&&x.push(c),this.compileAndRun(g,x,p)},t.prototype.multiply=function(e,n){if(e.dtype==="complex64"){var a=this.texData.get(e.dataId),o=this.texData.get(n.dataId),i=new Gi(ff,e.shape,n.shape),s=new Gi(pf,e.shape,n.shape),u=[this.makeComplexComponentTensorInfo(e,a.complexTensors.real),this.makeComplexComponentTensorInfo(e,a.complexTensors.imag),this.makeComplexComponentTensorInfo(n,o.complexTensors.real),this.makeComplexComponentTensorInfo(n,o.complexTensors.imag)],c=this.compileAndRun(i,u),l=this.compileAndRun(s,u),h=this.complex(c,l);return c.dispose(),l.dispose(),h}if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.multiply(e,n);if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,Hi,e.dtype);var f=new Te(Hi,e.shape,n.shape);return this.compileAndRun(f,[e,n],e.dtype)},t.prototype.batchNormalization=function(e,n,a,o,i,s){var u=[e,n,a],c=null;s!=null&&(c=s.shape,u.push(s));var l=null;if(i!=null&&(l=i.shape,u.push(i)),B().getBool("WEBGL_PACK_NORMALIZATION")){var h=new hf(e.shape,n.shape,a.shape,c,l,o);return this.compileAndRun(h,u)}var f=new lf(e.shape,n.shape,a.shape,c,l,o);return this.compileAndRun(f,u)},t.prototype.localResponseNormalization4D=function(e,n,a,o,i){var s=B().getBool("WEBGL_PACK_NORMALIZATION")?new sp(e.shape,n,a,o,i):new op(e.shape,n,a,o,i);return this.compileAndRun(s,[e])},t.prototype.LRNGrad=function(e,n,a,o,i,s,u){var c=new ip(n.shape,o,i,s,u);return this.compileAndRun(c,[n,a,e])},t.prototype.tile=function(e,n){if(e.dtype==="string"){var a=this.readSync(e.dataId).map((function(i){return Wr(i)}));return bu(ce(e.shape,e.dtype,a),n)}var o=new Ap(e.shape,n);return this.compileAndRun(o,[e])},t.prototype.pad=function(e,n,a){var o=B().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new dp(e.shape,n,a):new pp(e.shape,n,a);return this.compileAndRun(o,[e])},t.prototype.transpose=function(e,n){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.transpose(e,n);var a=B().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new Np(e.shape,n):new Tp(e.shape,n);return this.compileAndRun(a,[e])},t.prototype.gather=function(e,n,a){if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.gather(e,n,a);var o=new Wf(e.shape,n.size,a);return this.compileAndRun(o,[e,n])},t.prototype.batchToSpaceND=function(e,n,a){E(e.rank<=4,(function(){return"batchToSpaceND for rank > 4 with a WebGL backend not implemented yet"}));var o=n.reduce((function(h,f){return h*f})),i=jr(e.shape,n,o),s=qr(i.length,n.length),u=Kr(e.shape,n,o),c=su(a,n.length),l=uu(u,a,n.length);return e.reshape(i).transpose(s).reshape(u).slice(c,l)},t.prototype.spaceToBatchND=function(e,n,a){E(e.rank<=4,(function(){return"spaceToBatchND for rank > 4 with a WebGL backend not implemented yet"}));var o=n.reduce((function(f,p){return f*p})),i=[[0,0]];i.push.apply(i,a);for(var s=1+n.length;s<e.shape.length;++s)i.push([0,0]);var u=e.pad(i),c=jr(u.shape,n,o,!1),l=qr(c.length,n.length,!1),h=Kr(u.shape,n,o,!1);return u.reshape(c).transpose(l).reshape(h)},t.prototype.reduce=function(e,n,a){var o=e.shape[0],i=e.shape[1],s=Oa(i),u=new vp({windowSize:s,inSize:i,batchSize:o},n),c=this.compileAndRun(u,[e],a);return c.shape[1]===1?c:this.reduce(c,n,a)},t.prototype.argReduce=function(e,n,a){a===void 0&&(a=null);var o=e.shape[0],i=e.shape[1];a!=null&&(o=a.shape[0],i=a.shape[1]);var s=Oa(i),u=new ef({windowSize:s,inSize:i,batchSize:o},n,a==null),c=[e];a!=null&&c.push(a);var l=this.compileAndRun(u,c,"int32");return l.shape[1]===1?l:this.argReduce(e,n,l)},t.prototype.argReducePacked=function(e,n,a){a===void 0&&(a=null);var o=a!=null?a.shape:e.shape,i=Oa(o[o.length-1]),s=new sf(o,i,n,a==null),u=a==null?[e]:[e,a],c=this.compileAndRun(s,u,"int32");return c.rank===e.rank?this.argReducePacked(e,n,c):c},t.prototype.sum=function(e,n){st("sum",n,e.rank);var a=qe(e.shape,n),o=a[0],i=Q(a[1]),s=e.as2D(-1,i),u=Sa(e.dtype);return this.reduce(s,"sum",u).reshape(o)},t.prototype.prod=function(e,n){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.prod(e,n);var a=qe(e.shape,n),o=a[0],i=Q(a[1]),s=e.as2D(-1,i),u=Sa(e.dtype);return this.reduce(s,"prod",u).reshape(o)},t.prototype.unsortedSegmentSum=function(e,n,a){var o=0,i=Mt([o],e.rank),s=e;i!=null&&(s=e.transpose(i),o=Ot(1,e.rank)[0]);var u=(function(p,d,m){for(var v=[],g=p.length,x=0;x<g;x++)x!==d?v.push(p[x]):v.push(m);return v})(s.shape,o,a),c=Q([s.shape[o]]),l=s.as2D(-1,c),h=Sa(e.dtype),f=this.segOpCompute(l,"unsortedSegmentSum",n,h,a).reshape(u);return i!=null&&(f=f.transpose(So(i))),f},t.prototype.segOpCompute=function(e,n,a,o,i){var s=e.shape[0],u=e.shape[1],c=(function(f,p){var d,m=!1;for(f<=lu?(d=f,m=!0):d=io(f,Math.floor(Math.sqrt(f)));!m;)d>p||d===f?m=!0:d=io(f,d+1);return d})(u,i),l=new Ep({windowSize:c,inSize:u,batchSize:s,numSegments:i}),h=this.compileAndRun(l,[e,a],o);return h.shape[1]===i?h:(a=Hr(0,i).tile([u/c]),this.segOpCompute(h,n,a,o,i))},t.prototype.argMinMaxReduce=function(e,n,a){var o=[n];if(st("arg"+a.charAt(0).toUpperCase()+a.slice(1),o,e.rank),!B().getBool("WEBGL_PACK_REDUCE")||e.rank<=2){var i=qe(e.shape,o),s=i[0],u=Q(i[1]),c=e.as2D(-1,u);return this.argReduce(c,a).reshape(s)}return this.argReducePacked(e,a)},t.prototype.argMin=function(e,n){return this.argMinMaxReduce(e,n,"min")},t.prototype.argMax=function(e,n){return this.argMinMaxReduce(e,n,"max")},t.prototype.cumsum=function(e,n,a,o){if(n!==e.rank-1)throw new Error("WebGL cumsum shader expects an inner-most axis="+(e.rank-1)+" but got axis="+n);var i=new If(e.shape,a,o);return this.compileAndRun(i,[e])},t.prototype.equal=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return vec4(equal(a, b));
`,"bool");var a=new Te("return float(a == b);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.notEqual=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return vec4(notEqual(a, b));
`,"bool");var a=new Te("return float(a != b);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.less=function(e,n){if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.less(e,n);if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return vec4(lessThan(a, b));
`,"bool");var a=new Te("return float(a < b);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.lessEqual=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return vec4(lessThanEqual(a, b));
`,"bool");var a=new Te("return float(a <= b);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.greater=function(e,n){if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.greater(e,n);if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return vec4(greaterThan(a, b));
`,"bool");var a=new Te("return float(a > b);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.greaterEqual=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return vec4(greaterThanEqual(a, b));
`,"bool");var a=new Te("return float(a >= b);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.logicalNot=function(e){var n=new fe(e.shape,"return float(!(x >= 1.0));");return this.compileAndRun(n,[e])},t.prototype.logicalAnd=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return vec4(
    vec4(greaterThanEqual(a, vec4(1.0))) *
    vec4(greaterThanEqual(b, vec4(1.0))));
`,"bool");var a=new Te("return float(a >= 1.0 && b >= 1.0);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.logicalOr=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  return min(
    vec4(greaterThanEqual(a, vec4(1.0))) +
    vec4(greaterThanEqual(b, vec4(1.0))),
    vec4(1.0));
`,"bool");var a=new Te("return float(a >= 1.0 || b >= 1.0);",e.shape,n.shape);return this.compileAndRun(a,[e,n],"bool")},t.prototype.select=function(e,n,a){var o=new kp(e.rank,n.shape,n.rank);return this.compileAndRun(o,[e,n,a],He(n.dtype,a.dtype))},t.prototype.where=function(e){Vr("tf.where() in webgl locks the UI thread. Call tf.whereAsync() instead");var n=e.dataSync();return Oo(e.shape,n)},t.prototype.topk=function(e,n,a){return wu(e.dataSync(),e.shape,e.dtype,n)},t.prototype.min=function(e,n){st("min",n,e.rank);var a=qe(e.shape,n),o=a[0],i=Q(a[1]),s=e.as2D(-1,i);return this.reduce(s,"min",s.dtype).reshape(o)},t.prototype.minimum=function(e,n){if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.minimum(e,n);var a=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt(`
  vec4 result = vec4(min(a, b));
  vec4 isNaN = min(vec4(isnan(a)) + vec4(isnan(b)), vec4(1.0));
  
  result.r = isNaN.r > 0. ? NAN : result.r;
  result.g = isNaN.g > 0. ? NAN : result.g;
  result.b = isNaN.b > 0. ? NAN : result.b;
  result.a = isNaN.a > 0. ? NAN : result.a;

  return result;
`,e.shape,n.shape):new Te(`
  if (isnan(a)) return a;
  if (isnan(b)) return b;

  return min(a, b);
`,e.shape,n.shape);return this.compileAndRun(a,[e,n])},t.prototype.mod=function(e,n){var a=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt(`
  vec4 result = mod(a, b);
  vec4 isNaN = vec4(equal(b, vec4(0.0)));
  
  result.r = isNaN.r > 0. ? NAN : result.r;
  result.g = isNaN.g > 0. ? NAN : result.g;
  result.b = isNaN.b > 0. ? NAN : result.b;
  result.a = isNaN.a > 0. ? NAN : result.a;

  return result;
`,e.shape,n.shape):new Te(`if (b == 0.0) return NAN;
  return mod(a, b);`,e.shape,n.shape);return this.compileAndRun(a,[e,n])},t.prototype.max=function(e,n){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.max(e,n);st("max",n,e.rank);var a=qe(e.shape,n),o=a[0],i=Q(a[1]),s=e.as2D(-1,i);return this.reduce(s,"max",s.dtype).reshape(o)},t.prototype.maximum=function(e,n){if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.maximum(e,n);var a=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt(`
  vec4 result = vec4(max(a, b));
  vec4 isNaN = min(vec4(isnan(a)) + vec4(isnan(b)), vec4(1.0));
  
  result.r = isNaN.r > 0. ? NAN : result.r;
  result.g = isNaN.g > 0. ? NAN : result.g;
  result.b = isNaN.b > 0. ? NAN : result.b;
  result.a = isNaN.a > 0. ? NAN : result.a;

  return result;
`,e.shape,n.shape):new Te(`
  if (isnan(a)) return a;
  if (isnan(b)) return b;

  return max(a, b);
`,e.shape,n.shape);return this.compileAndRun(a,[e,n])},t.prototype.all=function(e,n){st("all",n,e.rank);var a=qe(e.shape,n),o=a[0],i=Q(a[1]),s=e.as2D(-1,i);return this.reduce(s,"all",s.dtype).reshape(o)},t.prototype.any=function(e,n){st("any",n,e.rank);var a=qe(e.shape,n),o=a[0],i=Q(a[1]),s=e.as2D(-1,i);return this.reduce(s,"any",s.dtype).reshape(o)},t.prototype.realDivide=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  // vec4 one = vec4(equal(a, b));
  // return one + (vec4(1.0) - one) * a / b;
  vec4 result = a / b;
  if(a.x == b.x) {
    result.x = 1.;
  }
  if(a.y == b.y) {
    result.y = 1.;
  }
  if(a.z == b.z) {
    result.z = 1.;
  }
  if(a.w == b.w) {
    result.w = 1.;
  }

  return result;
`,"float32",!0);var a=new Te(`
if (a == b) {
  return 1.0;
};
return a / b;`,e.shape,n.shape);return this.compileAndRun(a,[e,n],"float32")},t.prototype.floorDiv=function(e,n){if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,`
  ivec4 ia = round(a);
  ivec4 ib = round(b);
  bvec4 cond = notEqual(ib, ivec4(0));
  ivec4 result = ivec4(0);
  vec4 s = sign(a) * sign(b);

  // Windows (D3D) wants guaranteed non-zero int division at compile-time.
  if (cond[0]) {
    result[0] = idiv(ia[0], ib[0], s[0]);
  }
  if (cond[1]) {
    result[1] = idiv(ia[1], ib[1], s[1]);
  }
  if (cond[2]) {
    result[2] = idiv(ia[2], ib[2], s[2]);
  }
  if (cond[3]) {
    result[3] = idiv(ia[3], ib[3], s[3]);
  }
  return vec4(result);
`,"int32");var a=new Te(`
  float s = sign(a) * sign(b);
  int ia = round(a);
  int ib = round(b);
  if (ib != 0) {
    // Windows (D3D) wants guaranteed non-zero int division at compile-time.
    return float(idiv(ia, ib, s));
  } else {
    return NAN;
  }
`,e.shape,n.shape);return this.compileAndRun(a,[e,n],"int32")},t.prototype.add=function(e,n){if(e.dtype==="complex64"&&n.dtype==="complex64")return this.complexSeparableBinaryOp(e,n,Ba);if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.add(e,n);var a=He(e.dtype,n.dtype);if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,Ba,a);var o=new Te(Ba,e.shape,n.shape);return this.compileAndRun(o,[e,n],a)},t.prototype.packedUnaryOp=function(e,n,a){var o=new Qn(e.shape,n);return this.compileAndRun(o,[e],a)},t.prototype.packedBinaryOp=function(e,n,a,o,i){i===void 0&&(i=!1);var s=new Vt(a,e.shape,n.shape,i);return this.compileAndRun(s,[e,n],o)},t.prototype.complexSeparableBinaryOp=function(e,n,a){var o=this,i=this.texData.get(e.dataId),s=this.texData.get(n.dataId),u=[[i.complexTensors.real,s.complexTensors.real],[i.complexTensors.imag,s.complexTensors.imag]].map((function(f){var p=f[0],d=f[1],m=o.makeComplexComponentTensorInfo(e,p),v=o.makeComplexComponentTensorInfo(n,d),g=new Te(a,e.shape,n.shape);return o.compileAndRun(g,[m,v],He(p.dtype,d.dtype))})),c=u[0],l=u[1],h=this.complex(c,l);return c.dispose(),l.dispose(),h},t.prototype.makeComplexComponentTensorInfo=function(e,n){return{dataId:n.dataId,dtype:n.dtype,shape:e.shape}},t.prototype.addN=function(e){if(e.length===1)return e[0];if(e.length>B().get("WEBGL_MAX_TEXTURES_IN_SHADER")){var n=Math.floor(e.length/2),a=this.addN(e.slice(0,n)),o=this.addN(e.slice(n));return this.addN([a,o])}var i=e.map((function(c){return c.dtype})).reduce((function(c,l){return He(c,l)})),s=e.map((function(c){return c.shape})),u=B().getBool("WEBGL_PACK")?new Zh(e[0].shape,s):new Qh(e[0].shape,s);return this.compileAndRun(u,e,i)},t.prototype.subtract=function(e,n){if(e.dtype==="complex64"&&n.dtype==="complex64")return this.complexSeparableBinaryOp(e,n,La);if(this.shouldExecuteOnCPU([e,n]))return this.cpuBackend.subtract(e,n);var a=He(e.dtype,n.dtype);if(B().getBool("WEBGL_PACK_BINARY_OPERATIONS"))return this.packedBinaryOp(e,n,La,e.dtype);var o=new Te(La,e.shape,n.shape);return this.compileAndRun(o,[e,n],a)},t.prototype.pow=function(e,n){var a=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt(`
  // isModRound1 has 1 for components with round(mod(b, 2.0)) == 1, 0 otherwise.
  vec4 isModRound1 = vec4(equal(round(mod(b, 2.0)), ivec4(1)));
  vec4 multiplier = sign(a) * isModRound1 + (vec4(1.0) - isModRound1);
  vec4 result = multiplier * pow(abs(a), b);

  // Ensure that a^0 = 1, including 0^0 = 1 as this correspond to TF and JS
  bvec4 isExpZero = equal(b, vec4(0.0));
  result.r = isExpZero.r ? 1.0 : result.r;
  result.g = isExpZero.g ? 1.0 : result.g;
  result.b = isExpZero.b ? 1.0 : result.b;
  result.a = isExpZero.a ? 1.0 : result.a;

  vec4 isNaN = vec4(lessThan(a, vec4(0.0))) * vec4(lessThan(floor(b), b));
  
  result.r = isNaN.r > 0. ? NAN : result.r;
  result.g = isNaN.g > 0. ? NAN : result.g;
  result.b = isNaN.b > 0. ? NAN : result.b;
  result.a = isNaN.a > 0. ? NAN : result.a;

  return result;
`,e.shape,n.shape):new Te(`
if(a < 0.0 && floor(b) < b){
  return NAN;
}
if (b == 0.0) {
  return 1.0;
}
return (round(mod(b, 2.0)) != 1) ?
    pow(abs(a), b) : sign(a) * pow(abs(a), b);
`,e.shape,n.shape),o=He(e.dtype,n.dtype);return this.compileAndRun(a,[e,n],o)},t.prototype.ceil=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.ceil(e);if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,ns,e.dtype);var n=new fe(e.shape,ns);return this.compileAndRun(n,[e])},t.prototype.floor=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.floor(e);if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,rs,e.dtype);var n=new fe(e.shape,rs);return this.compileAndRun(n,[e])},t.prototype.sign=function(e){var n=new fe(e.shape,`
  if (isnan(x)) { return 0.0; }
  return sign(x);
`);return this.compileAndRun(n,[e])},t.prototype.isNaN=function(e){var n=new fe(e.shape,"return float(isnan(x));");return this.compileAndRun(n,[e],"bool")},t.prototype.isInf=function(e){var n=new fe(e.shape,"return float(isinf(x));");return this.compileAndRun(n,[e],"bool")},t.prototype.isFinite=function(e){var n=new fe(e.shape,"return float(!isnan(x) && !isinf(x));");return this.compileAndRun(n,[e],"bool")},t.prototype.round=function(e){var n=new fe(e.shape,`
  // OpenGL ES does not support round function.
  // The algorithm is based on banker's rounding.
  float base = floor(x);
  if ((x - base) < 0.5) {
    return floor(x);
  } else if ((x - base) > 0.5) {
    return ceil(x);
  } else {
    if (mod(base, 2.0) == 0.0) {
      return base;
    } else {
      return base + 1.0;
    }
  }
`);return this.compileAndRun(n,[e])},t.prototype.exp=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.exp(e);if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,as,e.dtype);var n=new fe(e.shape,as);return this.compileAndRun(n,[e])},t.prototype.expm1=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.expm1(e);if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,os,e.dtype);var n=new fe(e.shape,os);return this.compileAndRun(n,[e])},t.prototype.softmax=function(e,n){var a=We([n],e.shape),o=this.max(e,a),i=nt(o.shape,a),s=this.subtract(e,o.reshape(i)),u=this.exp(s),c=this.sum(u,a).reshape(i);return this.realDivide(u,c)},t.prototype.log=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.log(e);if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,`
  vec4 result = log(x);
  vec4 isNaN = vec4(lessThan(x, vec4(0.0)));
  result.r = isNaN.r == 1.0 ? NAN : result.r;
  result.g = isNaN.g == 1.0 ? NAN : result.g;
  result.b = isNaN.b == 1.0 ? NAN : result.b;
  result.a = isNaN.a == 1.0 ? NAN : result.a;

  return result;
`,e.dtype);var n=new fe(e.shape,`if (x < 0.0) return NAN;
  return log(x);`);return this.compileAndRun(n,[e])},t.prototype.log1p=function(e){var n=new fe(e.shape,"return log(1.0 + x);");return this.compileAndRun(n,[e])},t.prototype.sqrt=function(e){var n=new fe(e.shape,"return sqrt(x);");return this.compileAndRun(n,[e])},t.prototype.rsqrt=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.rsqrt(e);var n=new fe(e.shape,"return inversesqrt(x);");return this.compileAndRun(n,[e])},t.prototype.reciprocal=function(e){var n=new fe(e.shape,"return 1.0 / x;");return this.compileAndRun(n,[e])},t.prototype.relu=function(e){var n;return n=B().getBool("WEBGL_PACK")?new Qn(e.shape,Au):new fe(e.shape,Iu),this.compileAndRun(n,[e])},t.prototype.relu6=function(e){var n;return n=B().getBool("WEBGL_PACK")?new Qn(e.shape,Tu):new fe(e.shape,Su),this.compileAndRun(n,[e])},t.prototype.prelu=function(e,n){var a=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt(Ru,e.shape,n.shape):new Te(ku,e.shape,n.shape);return this.compileAndRun(a,[e,n])},t.prototype.elu=function(e){if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,Nu,e.dtype);var n=new fe(e.shape,Du);return this.compileAndRun(n,[e])},t.prototype.eluDer=function(e,n){var a=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt(`
  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));
  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));
`,e.shape,n.shape):new Te("return (b >= 1.0) ? a : a * (b + 1.0);",e.shape,n.shape);return this.compileAndRun(a,[e,n])},t.prototype.selu=function(e){var n=new fe(e.shape,Pp);return this.compileAndRun(n,[e])},t.prototype.int=function(e){var n=new fe(e.shape,"return float(int(x));");return this.compileAndRun(n,[e],"int32")},t.prototype.clip=function(e,n,a){var o,i=(o=B().getBool("WEBGL_PACK_CLIP")?new vf(e.shape):new df(e.shape)).getCustomSetupFunc(n,a);return this.compileAndRun(o,[e],null,i)},t.prototype.abs=function(e){if(this.shouldExecuteOnCPU([e]))return this.cpuBackend.abs(e);if(B().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(e,es,e.dtype);var n=new fe(e.shape,es);return this.compileAndRun(n,[e])},t.prototype.complexAbs=function(e){var n=this.texData.get(e.dataId),a=new mf(e.shape),o=[this.makeComplexComponentTensorInfo(e,n.complexTensors.real),this.makeComplexComponentTensorInfo(e,n.complexTensors.imag)];return this.compileAndRun(a,o)},t.prototype.sigmoid=function(e){var n=new fe(e.shape,"return 1.0 / (1.0 + exp(-1.0 * x));");return this.compileAndRun(n,[e])},t.prototype.softplus=function(e){var n=new fe(e.shape,`
  float epsilon = 1.1920928955078125e-7;
  float threshold = log(epsilon) + 2.0;

  bool too_large = x > -threshold;
  bool too_small = x < threshold;

  float result;
  float exp_x = exp(x);

  if (too_large){
    result = x;
  }
  else if (too_small){
    result = exp_x;
  }
  else{
    result = log(exp_x + 1.0);
  }
  return result;
`);return this.compileAndRun(n,[e])},t.prototype.sin=function(e){var n=new fe(e.shape,Mp);return this.compileAndRun(n,[e])},t.prototype.cos=function(e){var n=new fe(e.shape,Op);return this.compileAndRun(n,[e])},t.prototype.tan=function(e){var n=new fe(e.shape,"return tan(x);");return this.compileAndRun(n,[e])},t.prototype.asin=function(e){var n=new fe(e.shape,Bp);return this.compileAndRun(n,[e])},t.prototype.acos=function(e){var n=new fe(e.shape,Lp);return this.compileAndRun(n,[e])},t.prototype.atan=function(e){var n=new fe(e.shape,Wp);return this.compileAndRun(n,[e])},t.prototype.atan2=function(e,n){var a=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt(`
  vec4 result = atan(a, b);
  vec4 isNaN = min(vec4(isnan(a)) + vec4(isnan(b)), vec4(1.0));
  
  result.r = isNaN.r > 0. ? NAN : result.r;
  result.g = isNaN.g > 0. ? NAN : result.g;
  result.b = isNaN.b > 0. ? NAN : result.b;
  result.a = isNaN.a > 0. ? NAN : result.a;

  return result;
`,e.shape,n.shape):new Te(`
  if (isnan(a)) return a;
  if (isnan(b)) return b;

  return atan(a, b);
`,e.shape,n.shape);return this.compileAndRun(a,[e,n])},t.prototype.sinh=function(e){var n=new fe(e.shape,`
  float e2x = exp(x);
  return (e2x - 1.0 / e2x) / 2.0;
`);return this.compileAndRun(n,[e])},t.prototype.cosh=function(e){var n=new fe(e.shape,`
  float e2x = exp(-x);
  return (e2x + 1.0 / e2x) / 2.0;
`);return this.compileAndRun(n,[e])},t.prototype.tanh=function(e){var n=new fe(e.shape,`
  float e2x = exp(-2.0 * abs(x));
  return sign(x) * (1.0 - e2x) / (1.0 + e2x);
`);return this.compileAndRun(n,[e])},t.prototype.asinh=function(e){var n=new fe(e.shape,Up);return this.compileAndRun(n,[e])},t.prototype.acosh=function(e){var n=new fe(e.shape,zp);return this.compileAndRun(n,[e])},t.prototype.atanh=function(e){var n=new fe(e.shape,Vp);return this.compileAndRun(n,[e])},t.prototype.erf=function(e){var n=new fe(e.shape,`
  // Error function is calculated approximately with elementary function.
  // See "Handbook of Mathematical Functions with Formulas,
  // Graphs, and Mathematical Tables", Abramowitz and Stegun.
  float p = 0.3275911;
  float a1 = 0.254829592;
  float a2 = -0.284496736;
  float a3 = 1.421413741;
  float a4 = -1.453152027;
  float a5 = 1.061405429;

  float sign = sign(x);
  x = abs(x);
  float t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*exp(-x*x));
`);return this.compileAndRun(n,[e])},t.prototype.step=function(e,n){var a=new fe(e.shape,(function(o){return o===void 0&&(o=0),wt+`
    return x > 0.0 ? 1.0 : float(`+o+`);
  `})(n));return this.compileAndRun(a,[e])},t.prototype.conv2dByMatMul=function(e,n,a,o,i,s){var u=e.shape,c=this.texData.get(e.dataId),l=a.inChannels,h=u[0]*u[1]*u[2],f=a.outChannels,p=a.dataFormat==="channelsLast",d=(h===1||f===1)&&l>1e3,m=u[2]%2!=0&&!!c.isPacked;if(d||!B().getBool("WEBGL_LAZILY_UNPACK")||!B().getBool("WEBGL_PACK_BINARY_OPERATIONS")||!m){var v=p?u[0]*u[1]*u[2]:u[0]*u[2]*u[3],g=this.reshape(e,[1,v,a.inChannels]),x=this.reshape(n,[1,a.inChannels,a.outChannels]);return this.reshape(this.fusedBatchMatMul({a:g,b:x,transposeA:!1,transposeB:!1,bias:o,activation:i,preluActivationWeights:s}),a.outShape)}var b=p?u[0]*u[1]*(u[2]+1):u[0]*u[2]*(u[3]+1),y={dataId:e.dataId,shape:[1,b,a.inChannels],dtype:e.dtype},w=c.shape;c.shape=c.shape.slice(),c.shape[c.shape.length-2]++,E(Er(c.shape,y.shape),(function(){return"packed reshape "+c.shape+" to "+y.shape+" isn't free"}));var C=this.reshape(n,[1,a.inChannels,a.outChannels]),S=this.fusedBatchMatMul({a:y,b:C,transposeA:!1,transposeB:!1,bias:o,activation:i,preluActivationWeights:s}),I=this.texData.get(S.dataId);return E(I.isPacked,(function(){return"batchMatMul result is expected to be packed"})),c.shape=w,I.shape=a.outShape,T.makeTensorFromDataId(S.dataId,a.outShape,S.dtype)},t.prototype.conv2dWithIm2Row=function(e,n,a,o,i,s){var u=a.filterWidth,c=a.filterHeight,l=a.inChannels,h=a.outWidth,f=a.outHeight,p=a.dataFormat==="channelsLast",d=u*c*l,m=f*h,v=[d,m],g=e.squeeze([0]),x=n.reshape([1,d,-1]),b=new ap(v,g.shape,a),y=this.compileAndRun(b,[g]).reshape([1,v[0],v[1]]),w=o!=null,C=s!=null,S=i?Sr(i,!0):null,I=new Wa(y.shape,[1,m,a.outChannels],!0,!1,w,S,C),k=[y,x];o&&k.push(o),C&&k.push(s);var R=this.compileAndRun(I,k);return p?R.reshape([1,f,h,a.outChannels]):R.reshape([1,a.outChannels,f,h])},t.prototype.fusedConv2d=function(e){var n=e.input,a=e.filter,o=e.convInfo,i=e.bias,s=e.activation,u=e.preluActivationWeights;if(o.filterHeight===1&&o.filterWidth===1&&o.dilationHeight===1&&o.dilationWidth===1&&o.strideHeight===1&&o.strideWidth===1&&(o.padInfo.type==="SAME"||o.padInfo.type==="VALID"))return this.conv2dByMatMul(n,a,o,i,s,u);if(B().getBool("WEBGL_CONV_IM2COL")&&n.shape[0]===1)return this.conv2dWithIm2Row(n,a,o,i,s,u);var c=i!=null,l=u!=null,h=s?Sr(s,!1):null,f=new ji(o,c,h,l),p=[n,a];return i&&p.push(i),u&&p.push(u),this.compileAndRun(f,p)},t.prototype.conv2d=function(e,n,a){if(a.filterHeight===1&&a.filterWidth===1&&a.dilationHeight===1&&a.dilationWidth===1&&a.strideHeight===1&&a.strideWidth===1&&(a.padInfo.type==="SAME"||a.padInfo.type==="VALID"))return this.conv2dByMatMul(e,n,a);if(B().getBool("WEBGL_CONV_IM2COL")&&e.shape[0]===1)return this.conv2dWithIm2Row(e,n,a);var o=new ji(a);return this.compileAndRun(o,[e,n])},t.prototype.conv2dDerInput=function(e,n,a){var o=new bf(a);return this.compileAndRun(o,[e,n])},t.prototype.conv2dDerFilter=function(e,n,a){var o=new xf(a);return this.compileAndRun(o,[e,n])},t.prototype.fusedDepthwiseConv2D=function(e){var n,a=e.input,o=e.filter,i=e.convInfo,s=e.bias,u=e.activation,c=e.preluActivationWeights,l=B().getBool("WEBGL_PACK_DEPTHWISECONV")&&i.strideWidth<=2&&i.outChannels/i.inChannels==1,h=u?Sr(u,l):null,f=[a,o],p=s!=null,d=c!=null;return p&&f.push(s),d&&f.push(c),l?(n=new Ki(i,p,h,d),this.compileAndRun(n,f)):(n=new qi(i,p,h,d),this.compileAndRun(n,f))},t.prototype.depthwiseConv2D=function(e,n,a){var o;return B().getBool("WEBGL_PACK_DEPTHWISECONV")&&a.strideWidth<=2&&a.outChannels/a.inChannels==1?(o=new Ki(a),this.compileAndRun(o,[e,n])):(o=new qi(a),this.compileAndRun(o,[e,n]))},t.prototype.depthwiseConv2DDerInput=function(e,n,a){var o=new Ef(a);return this.compileAndRun(o,[e,n])},t.prototype.depthwiseConv2DDerFilter=function(e,n,a){var o=new _f(a);return this.compileAndRun(o,[e,n])},t.prototype.conv3d=function(e,n,a){var o=new kf(a);return this.compileAndRun(o,[e,n])},t.prototype.conv3dDerInput=function(e,n,a){var o=new Cf(a);return this.compileAndRun(o,[e,n])},t.prototype.conv3dDerFilter=function(e,n,a){var o=new wf(a);return this.compileAndRun(o,[e,n])},t.prototype.maxPool=function(e,n){var a=new Ua(n,"max",!1);return this.compileAndRun(a,[e])},t.prototype.avgPool=function(e,n){var a=new Ua(n,"avg",!1);return this.compileAndRun(a,[e],"float32")},t.prototype.maxPoolBackprop=function(e,n,a,o){var i=new Ua(o,"max",!0),s=this.compileAndRun(i,[n]),u=new up(o),c=this.compileAndRun(u,[e,s],n.dtype);return s.dispose(),c},t.prototype.avgPoolBackprop=function(e,n,a){var o=new uf(a);return this.compileAndRun(o,[e],n.dtype)},t.prototype.cast=function(e,n){return mu(e,n,this)},t.prototype.unstack=function(e,n){for(var a=e.shape[n],o=new Array(e.rank-1),i=0,s=0;s<e.rank;s++)s!==n&&(o[i++]=e.shape[s]);var u=new Array(e.rank).fill(0),c=e.shape.slice();c[n]=1;var l=new Array(a);for(s=0;s<l.length;s++)u[n]=s,l[s]=this.slice(e,u,c).reshape(o);return l},t.prototype.avgPool3d=function(e,n){var a=new za(n,"avg",!1);return this.compileAndRun(a,[e],"float32")},t.prototype.avgPool3dBackprop=function(e,n,a){var o=new cf(a);return this.compileAndRun(o,[e],n.dtype)},t.prototype.maxPool3d=function(e,n){var a=new za(n,"max",!1);return this.compileAndRun(a,[e],"float32")},t.prototype.maxPool3dBackprop=function(e,n,a,o){var i=new za(o,"max",!0),s=this.compileAndRun(i,[n]),u=new cp(o),c=this.compileAndRun(u,[e,s],n.dtype);return s.dispose(),c},t.prototype.reshape=function(e,n){var a=this.texData.get(e.dataId);if(a.isPacked&&!Er(e.shape,n)&&(a.texture===null||!Er(a.shape,n))){var o=this.packedReshape(e,n);return T.makeTensorFromDataId(o.dataId,o.shape,o.dtype)}return vo(e,n)},t.prototype.resizeBilinear=function(e,n,a,o){var i=B().getBool("WEBGL_PACK_IMAGE_OPERATIONS")?new xp(e.shape,n,a,o):new yp(e.shape,n,a,o);return this.compileAndRun(i,[e],"float32")},t.prototype.resizeBilinearBackprop=function(e,n,a){var o=new gp(e,n,a);return this.compileAndRun(o,[e])},t.prototype.resizeNearestNeighbor=function(e,n,a,o){var i=new wp(e.shape,n,a,o);return this.compileAndRun(i,[e])},t.prototype.resizeNearestNeighborBackprop=function(e,n,a){var o=new bp(e,n,a);return this.compileAndRun(o,[e])},t.prototype.multinomial=function(e,n,a,o){var i=n?e:jt(e),s=i.shape[0],u=i.shape[1],c=new lp(s,u,a),l=c.getCustomSetupFunc(o);return this.compileAndRun(c,[i],"int32",l)},t.prototype.oneHot=function(e,n,a,o){var i=new hp(e.size,n,a,o);return this.compileAndRun(i,[e])},t.prototype.diag=function(e){var n=new Tf(e.size);return this.compileAndRun(n,[e])},t.prototype.nonMaxSuppression=function(e,n,a,o,i){return Vr("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead"),Po(e.dataSync(),n.dataSync(),a,o,i)},t.prototype.cropAndResize=function(e,n,a,o,i,s){var u=new Rf(e.shape,n.shape,o,i,s);return this.compileAndRun(u,[e,n,a],"float32")},t.prototype.depthToSpace=function(e,n,a){E(n>1,(function(){return"blockSize should be > 1 for depthToSpace, but was: "+n}));var o=e.shape[0],i=a==="NHWC"?e.shape[1]:e.shape[2],s=a==="NHWC"?e.shape[2]:e.shape[3],u=a==="NHWC"?e.shape[3]:e.shape[1],c=i*n,l=s*n,h=u/(n*n),f=new Af(a==="NHWC"?[o,c,l,h]:[o,h,c,l],n,a);return this.compileAndRun(f,[e])},t.prototype.split=function(e,n,a){return xu(e,n,a)},t.prototype.scatterND=function(e,n,a){var o=Xr(0,e,a),i=o.sliceRank,s=o.numUpdates,u=o.sliceSize,c=o.strides,l=o.outputSize,h=[l/u,u],f=e.reshape([s,i]),p=n.reshape([s,u]);if(l===0)return vo(je([]),a);var d=q(0),m=new Ji(s,i,f.rank,p.rank,c,h);return this.compileAndRun(m,[p,f,d]).reshape(a)},t.prototype.sparseToDense=function(e,n,a,o){var i=Xr(0,e,a),s=i.sliceRank,u=i.numUpdates,c=i.strides,l=i.outputSize,h=new Ji(u,s,e.rank,n.rank,c,[l,1]);return this.compileAndRun(h,[n,e,o]).reshape(a)},t.prototype.fft=function(e){return this.fftImpl(e,!1)},t.prototype.ifft=function(e){return this.fftImpl(e,!0)},t.prototype.fftImpl=function(e,n){var a=this.texData.get(e.dataId),o=new $i(Of,e.shape,n),i=new $i(Bf,e.shape,n),s=[this.makeComplexComponentTensorInfo(e,a.complexTensors.real),this.makeComplexComponentTensorInfo(e,a.complexTensors.imag)],u=this.compileAndRun(o,s),c=this.compileAndRun(i,s),l=this.complex(u,c).as2D(e.shape[0],e.shape[1]);return u.dispose(),c.dispose(),l},t.prototype.gatherND=function(e,n){var a=n.shape,o=a[a.length-1],i=cu(e,n),s=i[0],u=i[1],c=i[2],l=i[3],h=n.reshape([u,o]),f=e.reshape([e.size/c,c]),p=new Uf(o,l,[u,c]);return this.compileAndRun(p,[f,h]).reshape(s)},t.prototype.fill=function(e,n,a){if((a=a||cr(n))==="string"){var o=Lr(a,Q(e));return o.fill(n),T.makeTensor(o,e,a,this)}var i=new Lf(e,n),s=i.getCustomSetupFunc(n);return this.compileAndRun(i,[],a,s)},t.prototype.onesLike=function(e){if(e.dtype==="string")throw new Error("onesLike is not supported under string dtype");return this.fill(e.shape,1,e.dtype)},t.prototype.zerosLike=function(e){return this.fill(e.shape,e.dtype==="string"?"":0,e.dtype)},t.prototype.linspace=function(e,n,a){return gu(e,n,a)},t.prototype.makeTensorInfo=function(e,n){var a=this.write(null,e,n);return this.texData.get(a).usage=null,{dataId:a,shape:e,dtype:n}},t.prototype.makeOutput=function(e,n){var a=this.makeTensorInfo(e,n).dataId;return T.makeTensorFromDataId(a,e,n,this)},t.prototype.unpackTensor=function(e){var n=new Hp(e.shape);return this.runWebGLProgram(n,[e],e.dtype)},t.prototype.packTensor=function(e){var n=new fp(e.shape);return this.runWebGLProgram(n,[e],e.dtype,null,!0)},t.prototype.packedReshape=function(e,n){var a=[Ur(e.shape)].concat(zr(e.shape)),o={dtype:e.dtype,shape:a,dataId:e.dataId},i=[Ur(n)].concat(zr(n)),s=new mp(i,a),u=this.runWebGLProgram(s,[o],e.dtype,null,!0);return{dataId:u.dataId,shape:n,dtype:u.dtype}},t.prototype.decode=function(e){var n,a=this.texData.get(e),o=a.isPacked,i=a.shape,s=a.dtype,u=Ma(i);return n=o?new Df(u):new Sf(u),{dtype:s,shape:i,dataId:this.runWebGLProgram(n,[{shape:u,dtype:s,dataId:e}],s,null,!0).dataId}},t.prototype.runWebGLProgram=function(e,n,a,o,i){var s=this;i===void 0&&(i=!1);var u=this.makeTensorInfo(e.outputShape,a),c=this.texData.get(u.dataId);if(e.packedOutput&&(c.isPacked=!0),e.outPackingScheme===ar.DENSE){var l=Zn(e.outputShape);c.texShape=l.map((function(b){return 2*b}))}if(e.outTexUsage!=null&&(c.usage=e.outTexUsage),Q(u.shape)===0)return c.values=nr(u.dtype,0),u;var h=[],f=n.map((function(b){if(b.dtype==="complex64")throw new Error("GPGPUProgram does not support complex64 input. For complex64 dtypes, please separate the program into real and imaginary parts.");var y=s.texData.get(b.dataId);if(y.texture==null){if(!e.packedInputs&&Q(b.shape)<=B().getNumber("WEBGL_SIZE_UPLOAD_UNIFORM"))return{shape:b.shape,texData:null,isUniform:!0,uniformValues:y.values};e.packedInputs&&(y.isPacked=!0,y.shape=b.shape)}else if(!!y.isPacked!=!!e.packedInputs)b=y.isPacked?s.unpackTensor(b):s.packTensor(b),h.push(b),y=s.texData.get(b.dataId);else if(y.isPacked&&!Er(y.shape,b.shape)){var w=b,C=b.shape;b.shape=y.shape,b=s.packedReshape(b,C),h.push(b),y=s.texData.get(b.dataId),w.shape=C}return s.uploadToGPU(b.dataId),{shape:b.shape,texData:y,isUniform:!1}}));this.uploadToGPU(u.dataId);var p,d={shape:u.shape,texData:c,isUniform:!1},m=(function(b,y,w){var C="";y.concat(w).forEach((function(k){var R=k.texData!=null&&k.texData.slice!=null&&k.texData.slice.flatOffset>0,N=k.isUniform?"uniform":k.texData.texShape;C+=k.shape+"_"+N+"_"+R}));var S=b.userCode,I=b.constructor.name;return I+="_"+C+"_"+S})(e,f,d),v=this.getAndSaveBinary(m,(function(){return(function(b,y,w,C){var S=y.userCode,I=w.map((function(W,z){var H={logicalShape:W.shape,texShape:W.isUniform?null:W.texData.texShape,isUniform:W.isUniform,isPacked:!W.isUniform&&W.texData.isPacked,flatOffset:null};return W.texData!=null&&W.texData.slice!=null&&W.texData.slice.flatOffset>0&&(H.flatOffset=W.texData.slice.flatOffset),{name:y.variableNames[z],shapeInfo:H}})),k=I.map((function(W){return W.shapeInfo})),R={logicalShape:C.shape,texShape:C.texData.texShape,isUniform:!1,isPacked:C.texData.isPacked,flatOffset:null},N=tf(I,R,S,y.packedInputs),A=b.createProgram(N),L=null,M=b.getUniformLocation(A,"NAN",!1);B().getNumber("WEBGL_VERSION")===1&&(L=b.getUniformLocation(A,"INFINITY",!1));for(var O={},V=0;V<y.variableNames.length;V++){var U=y.variableNames[V];O[U]=b.getUniformLocation(A,U,!1),O["offset"+U]=b.getUniformLocation(A,"offset"+U,!1)}return{program:y,source:N,webGLProgram:A,uniformLocations:O,inShapeInfos:k,outShapeInfo:R,infLoc:L,nanLoc:M}})(s.gpgpu,e,f,d)})),g=this.activeTimers!=null;if(g&&(p=this.startTimer()),(function(b,y,w,C,S){Yi(y.inShapeInfos,w),Yi([y.outShapeInfo],[C]);var I=C.texData.texture,k=C.texData.texShape;C.texData.isPacked?b.setOutputPackedMatrixTexture(I,k[0],k[1]):b.setOutputMatrixTexture(I,k[0],k[1]),b.setProgram(y.webGLProgram),B().getNumber("WEBGL_VERSION")===1&&y.infLoc!==null&&b.gl.uniform1f(y.infLoc,1/0),y.nanLoc!==null&&b.gl.uniform1f(y.nanLoc,NaN),w.forEach((function(R,N){var A=y.program.variableNames[N],L=y.uniformLocations[A],M=y.uniformLocations["offset"+A];if(L!=null)if(R.isUniform)if(Q(R.shape)<2)b.gl.uniform1f(L,R.uniformValues[0]);else{var O=R.uniformValues;O instanceof Float32Array||(O=new Float32Array(O)),b.gl.uniform1fv(L,O)}else R.texData.slice!=null&&M!=null&&b.gl.uniform1i(M,R.texData.slice.flatOffset),b.setInputMatrixTexture(R.texData.texture,L,N)})),S?.(b,y.webGLProgram),b.executeProgram()})(this.gpgpu,v,f,d,o),h.forEach((function(b){return s.disposeData(b.dataId)})),g&&(p=this.endTimer(p),this.activeTimers.push({name:e.constructor.name,query:this.getQueryTime(p)})),!B().getBool("WEBGL_LAZILY_UNPACK")&&c.isPacked&&i===!1){var x=this.unpackTensor(u);return this.disposeData(u.dataId),x}return u},t.prototype.compileAndRun=function(e,n,a,o,i){i===void 0&&(i=!1),a=a||n[0].dtype;var s=this.runWebGLProgram(e,n,a,o,i);return T.makeTensorFromDataId(s.dataId,s.shape,s.dtype)},t.prototype.getAndSaveBinary=function(e,n){return e in this.binaryCache||(this.binaryCache[e]=n()),this.binaryCache[e]},t.prototype.getTextureManager=function(){return this.textureManager},t.prototype.dispose=function(){var e=this;this.disposed||(B().getBool("IS_TEST")||Object.keys(this.binaryCache).forEach((function(n){e.gpgpu.deleteProgram(e.binaryCache[n].webGLProgram),delete e.binaryCache[n]})),this.textureManager.dispose(),this.canvas!=null&&typeof HTMLCanvasElement<"u"&&this.canvas instanceof HTMLCanvasElement?this.canvas.remove():this.canvas=null,this.gpgpuCreatedLocally&&(this.gpgpu.program=null,this.gpgpu.dispose()),this.disposed=!0)},t.prototype.floatPrecision=function(){var e=this;return this.floatPrecisionValue==null&&(this.floatPrecisionValue=X((function(){if(!B().get("WEBGL_RENDER_FLOAT32_ENABLED")){var n=B().getBool("DEBUG");B().set("DEBUG",!1);var a=e.abs(q(1e-8)).dataSync()[0];if(B().set("DEBUG",n),a>0)return 32}return 16}))),this.floatPrecisionValue},t.prototype.epsilon=function(){return this.floatPrecision()===32?1e-7:1e-4},t.prototype.uploadToGPU=function(e){var n,a=this.texData.get(e),o=a.shape,i=a.dtype,s=a.values,u=a.texture,c=a.usage,l=a.isPacked;if(u==null){var h,f=this.activeTimers!=null;f&&(h=Rt());var p=a.texShape;if(p==null&&(p=Jl(o,l),a.texShape=p),s!=null){var d=Ma(o),m=void 0,v=p[1],g=p[0],x=s instanceof Uint8Array;l?(v=(n=hr(p[0],p[1]))[0],g=n[1],m=new Mf(d,[g,v],x)):m=new Pf(d,[g,v],x);var b=this.makeTensorInfo([g,v],i);this.texData.get(b.dataId).usage=x?ct.PIXELS:ct.UPLOAD,this.gpgpu.uploadDenseMatrixToTexture(this.getTexture(b.dataId),v,g,s);var y=this.runWebGLProgram(m,[b],i,null,!0),w=this.texData.get(y.dataId);a.texture=w.texture,a.texShape=w.texShape,a.isPacked=w.isPacked,a.usage=w.usage,this.disposeData(b.dataId),this.texData.delete(y.dataId),a.values=null,f&&(this.uploadWaitMs+=Rt()-h)}else{var C=this.acquireTexture(p,c,i,l);a.texture=C}}},t.prototype.convertAndCacheOnCPU=function(e,n){var a=this.texData.get(e),o=a.dtype;return this.releaseGPUData(e),n!=null&&(a.values=(function(i,s){if(s==="float32"||s==="complex64")return i;if(s==="int32"||s==="bool"){for(var u=s==="int32"?new Int32Array(i.length):new Uint8Array(i.length),c=0;c<u.length;++c)u[c]=Math.round(i[c]);return u}throw new Error("Unknown dtype "+s)})(n,o)),a.values},t.prototype.acquireTexture=function(e,n,a,o){if(this.numBytesInGPU+=this.computeBytes(e,a),!this.warnedAboutMemory&&this.numBytesInGPU>1024*this.numMBBeforeWarning*1024){var i=(this.numBytesInGPU/1024/1024).toFixed(2);this.warnedAboutMemory=!0,console.warn("High memory usage in GPU: "+i+" MB, most likely due to a memory leak")}return this.textureManager.acquireTexture(e,n,o)},t.prototype.computeBytes=function(e,n){return e[0]*e[1]*js(n)},t})(du);Qs()&&T.registerBackend("webgl",(function(){return new qp}),2);var Kp=D({square_:function(r){var t=_(r,"x","square"),e=[t];return T.runKernelFunc((function(n,a){return a([t]),n.square(t)}),{x:t},null,"Square",{},e,[])}}),ir="SquaredDifference",Fu=D({squaredDifference_:function(r,t){var e,n=_(r,"a","squaredDifference"),a=_(t,"b","squaredDifference");e=Ae(n,a),n=e[0],a=e[1],me(n.shape,a.shape);var o={a:n,b:a},i=[n,a];return T.runKernelFunc((function(s,u){var c=s.squaredDifference(n,a);return u([n,a]),c}),o,(function(s,u){var c=u[0],l=u[1],h=q(2);return{a:function(){return s.mul(c.sub(l).mul(h))},b:function(){return s.mul(l.sub(c).mul(h))}}}),ir,{},i,[])}}),Xp=D({abs_:function(r){var t=_(r,"x","abs");return t.dtype==="complex64"?T.runKernelFunc((function(e){return e.complexAbs(t)}),{$x:t}):T.runKernelFunc((function(e,n){var a=e.abs(t);return n([t]),a}),{x:t},(function(e,n){var a=n[0];return{x:function(){return e.mul(a.toFloat().step(-1))}}}),"Abs")}}),$p=D({acos_:function(r){var t=_(r,"x","acos");return T.runKernelFunc((function(e,n){var a=e.acos(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.divStrict(q(1).sub(a.toFloat().square()).sqrt()).neg()}}}))}}),Yp=D({acosh_:function(r){var t=_(r,"x","acosh");return T.runKernelFunc((function(e,n){var a=e.acosh(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.divStrict(a.toFloat().square().sub(1).sqrt())}}}))}}),Jp=D({asin_:function(r){var t=_(r,"x","asin");return T.runKernelFunc((function(e,n){var a=e.asin(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.divStrict(q(1).sub(a.toFloat().square()).sqrt())}}}))}}),Qp=D({asinh_:function(r){var t=_(r,"x","asinh");return T.runKernelFunc((function(e,n){var a=e.asinh(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.divStrict(q(1).add(a.toFloat().square()).sqrt())}}}))}}),Zp=D({atan_:function(r){var t=_(r,"x","atan");return T.runKernelFunc((function(e,n){var a=e.atan(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.div(a.toFloat().square().add(1))}}}))}}),ed=D({atanh_:function(r){var t=_(r,"x","atanh");return T.runKernelFunc((function(e,n){var a=e.atanh(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.div(q(1).sub(a.toFloat().square()))}}}))}}),td=D({ceil_:function(r){var t=_(r,"x","ceil");return T.runKernelFunc((function(e){return e.ceil(t)}),{$x:t},(function(e){return{$x:function(){return xe(e)}}}))}}),Uo=D({clipByValue_:function(r,t,e){var n=_(r,"x","clipByValue");E(t<=e,(function(){return"Error in clip: min ("+t+") must be less than or equal to max ("+e+")."}));var a=[n],o={min:t,max:e};return T.runKernelFunc((function(i,s){var u=i.clip(n,t,e);return s([n]),u}),{x:n},(function(i,s){var u=s[0];return{x:function(){return i.where(u.greaterEqual(t).logicalAnd(u.lessEqual(e)),xe(i))}}}),"ClipByValue",o,a)}}),nd=D({cos_:function(r){var t=_(r,"x","cos"),e=[t];return T.runKernelFunc((function(n,a){var o=n.cos(t);return a([t]),o}),{x:t},(function(n,a){var o=a[0];return{x:function(){return o.toFloat().sin().neg().mul(n)}}}),"Cos",{},e)}}),rd=D({cosh_:function(r){var t=_(r,"x","cosh");return T.runKernelFunc((function(e,n){var a=e.cosh(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return a.toFloat().sinh().mulStrict(e)}}}))}}),ad=D({erf_:function(r){var t=_(r,"x","erf");return E(t.dtype==="int32"||t.dtype==="float32",(function(){return"Input dtype must be `int32` or `float32`."})),t.dtype==="int32"&&(t=t.toFloat()),T.runKernelFunc((function(e,n){var a=e.erf(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.mul(a.square().neg().exp().mul(2/Math.sqrt(Math.PI)))}}}))}}),go=D({exp_:function(r){var t=_(r,"x","exp");return T.runKernelFunc((function(e,n){var a=e.exp(t);return n([a]),a}),{x:t},(function(e,n){return{x:function(){return e.mulStrict(n[0])}}}),"Exp",{},[],[!0])}}),od=D({expm1_:function(r){var t=_(r,"x","expm1");return T.runKernelFunc((function(e,n){var a=e.expm1(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.mul(a.exp())}}}))}}),id=D({floor_:function(r){var t=_(r,"x","floor");return T.runKernelFunc((function(e){return e.floor(t)}),{$x:t},(function(e){return{$x:function(){return xe(e)}}}))}}),sd=D({log_:function(r){var t=_(r,"x","log"),e=[t];return T.runKernelFunc((function(n,a){var o=n.log(t);return a([t]),o}),{x:t},(function(n,a){var o=a[0];return{x:function(){return n.div(o.toFloat())}}}),"Log",{},e)}}),ud=D({log1p_:function(r){var t=_(r,"x","log1p");return T.runKernelFunc((function(e,n){var a=e.log1p(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.div(a.add(1))}}}))}}),cd=D({logSigmoid_:function(r){var t=_(r,"x","logSigmoid");return T.runKernelFunc((function(e,n){var a=e.softplus(t.neg()).neg();return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.mul(a.neg().sigmoid())}}}))}}),Qr=D({neg_:function(r){var t=_(r,"x","neg"),e=[t];return T.runKernelFunc((function(n){return n.neg(t)}),{x:t},(function(n){return{x:function(){return n.neg()}}}),"Neg",{},e)}}),ld=D({reciprocal_:function(r){var t=_(r,"x","reciprocal");return T.runKernelFunc((function(e,n){var a=e.reciprocal(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.div(a.square().neg())}}}))}}),hd=D({round_:function(r){var t=_(r,"x","round");return T.runKernelFunc((function(e){return e.round(t)}),{$x:t},(function(e){return{$x:function(){return xe(e)}}}))}}),Pu=D({rsqrt_:function(r){var t=_(r,"x","rsqrt"),e=[t];return T.runKernelFunc((function(n,a){var o=n.rsqrt(t);return a([t]),o}),{x:t},(function(n,a){var o=a[0];return{x:function(){return n.div(o.pow(1.5).mul(2)).neg()}}}),"Rsqrt",{},e)}}),Mu=D({sigmoid_:function(r){var t=_(r,"x","sigmoid");return T.runKernelFunc((function(e,n){var a=e.sigmoid(t);return n([a]),a}),{x:t},(function(e,n){var a=n[0];return{x:function(){return e.mul(a.mul(q(1).sub(a)))}}}),"Sigmoid")}}),fd=D({sign_:function(r){var t=_(r,"x","sign");return T.runKernelFunc((function(e){return e.sign(t)}),{$x:t},(function(e){return{$x:function(){return xe(e)}}}))}}),pd=D({isNaN_:function(r){var t=_(r,"x","isNaN");return T.runKernelFunc((function(e){return e.isNaN(t)}),{$x:t},(function(e){return{$x:function(){return xe(e)}}}))}}),dd=D({isInf_:function(r){var t=_(r,"x","isInf");return T.runKernelFunc((function(e){return e.isInf(t)}),{$x:t},(function(e){return{$x:function(){return xe(e)}}}))}}),vd=D({isFinite_:function(r){var t=_(r,"x","isFinite");return T.runKernelFunc((function(e){return e.isFinite(t)}),{$x:t},(function(e){return{$x:function(){return xe(e)}}}))}}),md=D({sin_:function(r){var t=_(r,"x","sin"),e=[t];return T.runKernelFunc((function(n,a){var o=n.sin(t);return a([t]),o}),{x:t},(function(n,a){var o=a[0];return{x:function(){return o.toFloat().cos().mul(n)}}}),"Sin",{},e)}}),gd=D({sinh_:function(r){var t=_(r,"x","sinh");return T.runKernelFunc((function(e,n){var a=e.sinh(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return a.toFloat().cosh().mulStrict(e)}}}))}}),yd=D({softplus_:function(r){var t=_(r,"x","softplus");return T.runKernelFunc((function(e,n){var a=e.softplus(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.mul(a.sigmoid())}}}))}}),xd=D({sqrt_:function(r){var t=_(r,"x","sqrt");return T.runKernelFunc((function(e,n){var a=e.sqrt(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.div(a.toFloat().sqrt().mul(2))}}}))}}),bd=D({step_:function(r,t){t===void 0&&(t=0);var e=_(r,"x","step");return T.runKernelFunc((function(n){return n.step(e,t)}),{$x:e},(function(n){return{$x:function(){return xe(n)}}}))}}),wd=D({tan_:function(r){var t=_(r,"x","tan");return T.runKernelFunc((function(e,n){var a=e.tan(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return e.div(a.cos().square())}}}))}}),Cd=D({tanh_:function(r){var t=_(r,"x","tanh");return T.runKernelFunc((function(e,n){var a=e.tanh(t);return n([a]),a}),{x:t},(function(e,n){var a=n[0];return{x:function(){return q(1).sub(a.square()).mulStrict(e)}}}),"Tanh",{},null,[!0])}});function Ou(r,t,e,n,a,o){var i,s,u=_(r,"x","batchNorm"),c=_(t,"mean","batchNorm"),l=_(e,"variance","batchNorm");return a!=null&&(i=_(a,"scale","batchNorm")),n!=null&&(s=_(n,"offset","batchNorm")),E(u.rank===2,(function(){return"Error in batchNorm3D: x must be rank 3 but got rank "+u.rank+"."})),E(c.rank===2||c.rank===1,(function(){return"Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank "+c.rank+"."})),E(l.rank===2||l.rank===1,(function(){return"Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank "+l.rank+"."})),i!=null&&E(i.rank===2||i.rank===1,(function(){return"Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank "+i.rank+"."})),s!=null&&E(s.rank===2||s.rank===1,(function(){return"Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank "+s.rank+"."})),pr(u,c,l,s,i,o)}function Bu(r,t,e,n,a,o){var i,s,u=_(r,"x","batchNorm"),c=_(t,"mean","batchNorm"),l=_(e,"variance","batchNorm");return a!=null&&(i=_(a,"scale","batchNorm")),n!=null&&(s=_(n,"offset","batchNorm")),E(u.rank===3,(function(){return"Error in batchNorm3D: x must be rank 3 but got rank "+u.rank+"."})),E(c.rank===3||c.rank===1,(function(){return"Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank "+c.rank+"."})),E(l.rank===3||l.rank===1,(function(){return"Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank "+l.rank+"."})),i!=null&&E(i.rank===3||i.rank===1,(function(){return"Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank "+i.rank+"."})),s!=null&&E(s.rank===3||s.rank===1,(function(){return"Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank "+s.rank+"."})),pr(u,c,l,s,i,o)}function Lu(r,t,e,n,a,o){var i,s,u=_(r,"x","batchNorm"),c=_(t,"mean","batchNorm"),l=_(e,"variance","batchNorm");return a!=null&&(i=_(a,"scale","batchNorm")),n!=null&&(s=_(n,"offset","batchNorm")),E(u.rank===4,(function(){return"Error in batchNorm4D: x must be rank 4 but got rank "+u.rank+"."})),E(c.rank===4||c.rank===1,(function(){return"Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank "+c.rank+"."})),E(l.rank===4||l.rank===1,(function(){return"Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank "+l.rank+"."})),i!=null&&E(i.rank===4||i.rank===1,(function(){return"Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank "+i.rank+"."})),s!=null&&E(s.rank===4||s.rank===1,(function(){return"Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank "+s.rank+"."})),pr(u,c,l,s,i,o)}function pr(r,t,e,n,a,o){o==null&&(o=.001);var i,s,u,c=_(r,"x","batchNorm"),l=_(t,"mean","batchNorm"),h=_(e,"variance","batchNorm");a!=null&&(i=_(a,"scale","batchNorm")),n!=null&&(s=_(n,"offset","batchNorm")),E(l.rank===h.rank,(function(){return"Batch normalization gradient requires mean and variance to have equal ranks."})),E(s==null||l.rank===s.rank,(function(){return"Batch normalization gradient requires mean and offset to have equal ranks."})),E(i==null||l.rank===i.rank,(function(){return"Batch normalization gradient requires mean and scale to have equal ranks."})),u=c.rank===0||c.rank===1?c.as4D(1,1,1,c.size):c.rank===2?c.as4D(1,1,c.shape[0],c.shape[1]):c.rank===3?c.as4D(1,c.shape[0],c.shape[1],c.shape[2]):c;var f=[c,l,h,i];return T.runKernelFunc((function(p,d){var m=p.batchNormalization(u,Dr(l),Dr(h),o,Dr(i),Dr(s));return d([c,l,h,i]),m}),{x:c,mean:l,variance:h,scale:i,offset:s},(function(p,d){var m=d,v=m[0],g=m[1],x=m[2],b=m[3],y=b??q(1),w=Be(g.shape,u.shape),C=[];if(g.rank===1){for(var S=0;S<u.shape.length-1;++S)C.push(u.shape[S]);C.push(1)}var I=v.sub(g),k=p.mul(y),R=Pu(x.add(q(o))),N=R.mul(R).mul(R).mul(q(-.5));return{x:function(){return g.rank===1?p.mul(On(R.as4D(1,1,1,g.shape[0]),C)).mul(y).reshape(v.shape):p.mul(R).mul(y).reshape(v.shape)},mean:function(){var A=R.mul(q(-1)).mul(k);return g.rank===1&&(A=A.sum(w)),A.reshape(g.shape)},variance:function(){var A=N.mul(I).mul(k);return g.rank===1&&(A=A.sum(w)),A.reshape(g.shape)},scale:function(){var A=I.mul(R),L=p.mul(A);return g.rank===1&&(L=L.sum(w)),L.reshape(g.shape)},offset:function(){var A=p;return g.rank===1&&(A=A.sum(w)),A.reshape(g.shape)}}}),"BatchNormalization",{varianceEpsilon:o},f).reshape(c.shape)}function Dr(r){return r==null?null:r.rank===0?r.as1D():r.rank===1?r:r.rank===2?r.as4D(1,1,r.shape[0],r.shape[1]):r.rank===3?r.as4D(1,r.shape[0],r.shape[1],r.shape[2]):r}function la(){Zs("tf.batchNormalization() is going away. Use tf.batchNorm() instead, and note the positional argument change of scale, offset, and varianceEpsilon")}var _d=D({batchNormalization2d_:function(r,t,e,n,a,o){return n===void 0&&(n=.001),la(),Ou(r,t,e,o,a,n)}}),Ed=D({batchNormalization3d_:function(r,t,e,n,a,o){return n===void 0&&(n=.001),la(),Bu(r,t,e,o,a,n)}}),kd=D({batchNormalization4d_:function(r,t,e,n,a,o){return n===void 0&&(n=.001),la(),Lu(r,t,e,o,a,n)}}),Rd=D({batchNormalization_:function(r,t,e,n,a,o){return n===void 0&&(n=.001),la(),pr(r,t,e,o,a,n)}}),Wu=D({batchNorm_:pr}),Id=D({batchNorm2d_:Ou}),Sd=D({batchNorm3d_:Bu}),Dd=D({batchNorm4d_:Lu}),ha=D({logicalAnd_:function(r,t){var e=_(r,"a","logicalAnd","bool"),n=_(t,"b","logicalAnd","bool");return me(e.shape,n.shape),T.runKernelFunc((function(a){return a.logicalAnd(e,n)}),{a:e,b:n},null,"LogicalAnd")}}),Ad=D({logicalNot_:function(r){var t=_(r,"x","logicalNot","bool");return T.runKernelFunc((function(e){return e.logicalNot(t)}),{$x:t})}}),Uu=D({logicalOr_:function(r,t){var e=_(r,"a","logicalOr","bool"),n=_(t,"b","logicalOr","bool");return me(e.shape,n.shape),T.runKernelFunc((function(a){return a.logicalOr(e,n)}),{$a:e,$b:n})}}),Td=D({logicalXor_:function(r,t){var e=_(r,"a","logicalXor","bool"),n=_(t,"b","logicalXor","bool");return me(e.shape,n.shape),Uu(r,t).logicalAnd(ha(r,t).logicalNot())}}),gn=D({where_:function(r,t,e){var n=_(t,"a","where"),a=_(e,"b","where"),o=_(r,"condition","where","bool");return Ce(n.shape,a.shape,"Error in where: "),o.rank===1?E(o.shape[0]===n.shape[0],(function(){return"The first dimension of `a` must match the size of `condition`."})):Ce(o.shape,a.shape,"Error in where: "),T.runKernelFunc((function(i,s){var u=i.select(o,n,a);return s([o]),u}),{$condition:o,$a:n,$b:a},(function(i,s){var u=s[0];return{$condition:function(){return xe(u).toFloat()},$a:function(){return i.mul(u.cast(i.dtype))},$b:function(){return i.mul(u.logicalNot().cast(i.dtype))}}}))}}),zu=function(r){return $(this,void 0,void 0,(function(){var t,e,n;return Y(this,(function(a){switch(a.label){case 0:return[4,(t=_(r,"condition","whereAsync","bool")).data()];case 1:return e=a.sent(),n=Oo(t.shape,e),r!==t&&t.dispose(),[2,n]}}))}))},de=D({add_:function(r,t){var e,n=_(r,"a","add"),a=_(t,"b","add");e=Ae(n,a),n=e[0],a=e[1];var o=me(n.shape,a.shape);return T.runKernelFunc((function(i){return i.add(n,a)}),{a:n,b:a},(function(i){return{a:function(){var s=i,u=Be(n.shape,o);return u.length>0&&(s=s.sum(u)),s.reshape(n.shape)},b:function(){var s=i,u=Be(a.shape,o);return u.length>0&&(s=s.sum(u)),s.reshape(a.shape)}}}),"Add")}}),Nd=D({addN_:function(r){E(Array.isArray(r),(function(){return"The argument passed to tf.addN() must be a list of tensors"})),E(r.length>=1,(function(){return"Must pass at least one tensor to tf.addN(), but got "+r.length}));var t=r.map((function(a,o){return _(a,"tensors"+o,"addN")})),e=t[0];t.forEach((function(a){if(a.dtype!==e.dtype)throw new Error("All tensors passed to tf.addN() must have the same dtype")})),t.forEach((function(a){if(!ze(a.shape,e.shape))throw new Error("All tensors passed to tf.addN() must have the same shape")}));var n=t;return T.runKernelFunc((function(a){return a.addN(t)}),n,(function(a){var o={};return t.forEach((function(i,s){o[s]=function(){return a.clone()}})),o}),"AddN")}}),Fd=D({addStrict_:function(r,t){var e=_(r,"a","addStrict"),n=_(t,"b","addStrict");return Ce(e.shape,n.shape,"Error in addStrict: "),e.add(n)}}),Pd=D({atan2_:function(r,t){var e,n=_(r,"a","atan2"),a=_(t,"b","atan2");e=Ae(n,a),n=e[0],a=e[1];var o=me(n.shape,a.shape);return T.runKernelFunc((function(i,s){var u=i.atan2(n,a);return s([n,a]),u}),{$a:n,$b:a},(function(i,s){var u=s[0],c=s[1];return{$a:function(){var l=de(u.square(),c.square()),h=i.mul(c.div(l)),f=Be(u.shape,o);return f.length>0&&(h=h.sum(f)),h.reshape(u.shape)},$b:function(){var l=de(u.square(),c.square()),h=Qr(i.mul(u.div(l))),f=Be(c.shape,o);return f.length>0&&(h=h.sum(f)),h.reshape(c.shape)}}}))}}),gt=D({div_:function(r,t){var e,n=_(r,"a","div"),a=_(t,"b","div");if(e=Ae(n,a),n=e[0],a=e[1],n.dtype==="int32"&&a.dtype==="int32")return Vu(n,a);var o=me(n.shape,a.shape);return T.runKernelFunc((function(i,s){var u=i.realDivide(n,a);return s([n,a]),u}),{a:n,b:a},(function(i,s){var u=s[0],c=s[1];return{a:function(){var l=i.div(c.toFloat()),h=Be(u.shape,o);return h.length>0?l.sum(h).reshape(u.shape):l},b:function(){var l=i.mul(u.toFloat()),h=Be(c.shape,o);h.length>0&&(l=l.sum(h).reshape(c.shape));var f=c.square();return l.div(f.toFloat()).neg()}}}),"Div")}}),Md=D({divNoNan_:function(r,t){var e,n=_(r,"a","div"),a=_(t,"b","div");n=(e=Ae(n,a))[0],a=e[1];var o=gt(n,a),i=xe(o),s=a.equal(i);return gn(s,i,o)}}),Od=D({divStrict_:function(r,t){var e=_(r,"a","div"),n=_(t,"b","div");return Ce(e.shape,n.shape,"Error in divideStrict: "),e.div(n)}}),Vu=D({floorDiv_:function(r,t){var e,n=_(r,"a","floorDiv"),a=_(t,"b","floorDiv");e=Ae(n,a),n=e[0],a=e[1];var o=me(n.shape,a.shape);return T.runKernelFunc((function(i,s){var u=i.floorDiv(n,a);return s([n,a]),u}),{a:n,b:a},(function(i,s){var u=s[0],c=s[1];return{a:function(){var l=i.div(c.toFloat()),h=Be(u.shape,o);return h.length>0?l.sum(h).reshape(u.shape):l},b:function(){var l=i.mul(u.toFloat()),h=Be(c.shape,o);h.length>0&&(l=l.sum(h).reshape(c.shape));var f=c.square();return l.div(f.toFloat()).neg()}}}),"FloorDiv")}}),zo=D({maximum_:function(r,t){var e,n=_(r,"a","maximum"),a=_(t,"b","maximum");return e=Ae(n,a),n=e[0],a=e[1],n.dtype==="bool"&&(n=n.toInt(),a=a.toInt()),me(n.shape,a.shape),T.runKernelFunc((function(o,i){var s=o.maximum(n,a);return i([n,a]),s}),{a:n,b:a},(function(o,i){var s=i[0],u=i[1];return{a:function(){return o.mul(s.greaterEqual(u).toFloat())},b:function(){return o.mul(s.less(u).toFloat())}}}),"Maximum")}}),Bd=D({maximumStrict_:function(r,t){var e=_(r,"a","maximumStrict"),n=_(t,"b","maximumStrict");return Ce(e.shape,n.shape,"Error in maximumStrict: "),e.maximum(n)}}),Gu=D({minimum_:function(r,t){var e,n=_(r,"a","minimum"),a=_(t,"b","minimum");return e=Ae(n,a),n=e[0],a=e[1],n.dtype==="bool"&&(n=n.toInt(),a=a.toInt()),me(n.shape,a.shape),T.runKernelFunc((function(o,i){var s=o.minimum(n,a);return i([n,a]),s}),{a:n,b:a},(function(o,i){var s=i[0],u=i[1];return{a:function(){return o.mul(s.lessEqual(u).toFloat())},b:function(){return o.mul(s.greater(u).toFloat())}}}),"Minimum")}}),Ld=D({minimumStrict_:function(r,t){var e=_(r,"a","minimumStrict"),n=_(t,"b","minimumStrict");return Ce(e.shape,n.shape,"Error in minimumStrict: "),e.minimum(n)}}),Wd=D({mod_:function(r,t){var e,n=_(r,"a","mod"),a=_(t,"b","mod");e=Ae(n,a),n=e[0],a=e[1];var o=me(n.shape,a.shape);return T.runKernelFunc((function(i,s){var u=i.mod(n,a);return s([n,a]),u}),{$a:n,$b:a},(function(i,s){var u=s[0],c=s[1];return{$a:function(){var l=Be(u.shape,o);return l.length>0?i.sum(l).reshape(u.shape):i},$b:function(){var l=i.mul(u.div(c).floor().neg()),h=Be(c.shape,o);return h.length>0?l.sum(h).reshape(c.shape):l}}}))}}),Ud=D({modStrict_:function(r,t){var e=_(r,"a","modStrict"),n=_(t,"b","modStrict");return Ce(e.shape,n.shape,"Error in modStrict: "),e.mod(n)}}),Ye=D({mul_:function(r,t){var e,n=_(r,"a","mul"),a=_(t,"b","mul");e=Ae(n,a),n=e[0],a=e[1];var o=me(n.shape,a.shape);return T.runKernelFunc((function(i,s){var u=i.multiply(n,a);return s([n,a]),u}),{a:n,b:a},(function(i,s){var u=s[0],c=s[1];return{a:function(){var l=i.mul(c.toFloat()),h=Be(u.shape,o);return h.length>0?l.sum(h).reshape(u.shape):l},b:function(){var l=i.mul(u.toFloat()),h=Be(c.shape,o);return h.length>0?l.sum(h).reshape(c.shape):l}}}),"Mul")}}),zd=D({mulStrict_:function(r,t){var e=_(r,"a","mul"),n=_(t,"b","mul");return Ce(e.shape,n.shape,"Error in multiplyStrict: "),e.mul(n)}}),Zr=D({pow_:function(r,t){var e,n=_(r,"base","pow"),a=_(t,"exp","pow");e=Ae(n,a),n=e[0],a=e[1];var o=me(n.shape,a.shape),i=[n,a];return T.runKernelFunc((function(s,u){var c=s.pow(n,a);return u([n,a,c]),c}),{a:n,b:a},(function(s,u){var c=u[0],l=u[1],h=u[2];return{a:function(){var f=l.toFloat(),p=s.mul(f.mul(c.pow(f.sub(q(1))))),d=Be(c.shape,o);return d.length>0&&(p=p.sum(d)),p.reshape(c.shape)},b:function(){var f=c.greater(0),p=c.log().where(f,xe(c)),d=s.mul(h.mul(p)),m=Be(l.shape,o);return m.length>0&&(d=d.sum(m)),d.reshape(l.shape)}}}),"Pow",{},i,[!0])}}),Vd=D({powStrict_:function(r,t){return Ce(r.shape,t.shape,"Error in powStrict: "),r.pow(t)}}),Gd=D({squaredDifferenceStrict_:function(r,t){var e=_(r,"a","squaredDifferenceStrict"),n=_(t,"b","squaredDifferenceStrict");return Ce(e.shape,n.shape,"Error in squaredDifferenceStrict: "),e.squaredDifference(n)}}),Le=D({sub_:function(r,t){var e,n=_(r,"a","sub"),a=_(t,"b","sub");e=Ae(n,a),n=e[0],a=e[1];var o=me(n.shape,a.shape);return T.runKernelFunc((function(i){return i.subtract(n,a)}),{a:n,b:a},(function(i){return{a:function(){var s=i,u=Be(n.shape,o);return u.length>0&&(s=s.sum(u)),s.reshape(n.shape)},b:function(){var s=i,u=Be(a.shape,o);return u.length>0&&(s=s.sum(u)),s.neg().reshape(a.shape)}}}),"Sub")}}),Hd=D({subStrict_:function(r,t){var e=_(r,"a","subStrict"),n=_(t,"b","subStrict");return Ce(e.shape,n.shape,"Error in subStrict: "),e.sub(n)}}),Hu=D({equal_:function(r,t){var e,n=_(r,"a","equal"),a=_(t,"b","equal");return e=Ae(n,a),n=e[0],a=e[1],me(n.shape,a.shape),T.runKernelFunc((function(o){return o.equal(n,a)}),{$a:n,$b:a})}}),jd=D({equalStrict_:function(r,t){var e=_(r,"a","equalStrict"),n=_(t,"b","equalStrict");return Ce(e.shape,n.shape,"Error in equalStrict: "),e.equal(n)}}),qd=D({greater_:function(r,t){var e,n=_(r,"a","greater"),a=_(t,"b","greater");return e=Ae(n,a),n=e[0],a=e[1],me(n.shape,a.shape),T.runKernelFunc((function(o){return o.greater(n,a)}),{a:n,b:a},null,"Greater")}}),ju=D({greaterEqual_:function(r,t){var e,n=_(r,"a","greaterEqual"),a=_(t,"b","greaterEqual");return e=Ae(n,a),n=e[0],a=e[1],me(n.shape,a.shape),T.runKernelFunc((function(o,i){var s=o.greaterEqual(n,a);return i([n,a]),s}),{a:n,b:a},(function(o,i){var s=i[0],u=i[1];return{a:function(){return xe(s)},b:function(){return xe(u)}}}),"GreaterEqual")}}),Kd=D({greaterEqualStrict_:function(r,t){var e=_(r,"a","greaterEqualStrict"),n=_(t,"b","greaterEqualStrict");return Ce(e.shape,n.shape,"Error in greaterEqualStrict: "),e.greaterEqual(n)}}),Xd=D({greaterStrict_:function(r,t){var e=_(r,"a","greaterStrict"),n=_(t,"b","greaterStrict");return Ce(e.shape,n.shape,"Error in greaterStrict: "),e.greater(n)}}),$d=D({less_:function(r,t){var e,n=_(r,"a","less"),a=_(t,"b","less");return e=Ae(n,a),n=e[0],a=e[1],me(n.shape,a.shape),T.runKernelFunc((function(o){return o.less(n,a)}),{a:n,b:a},null,"Less")}}),Yd=D({lessEqual_:function(r,t){var e,n=_(r,"a","lessEqual"),a=_(t,"b","lessEqual");return e=Ae(n,a),n=e[0],a=e[1],me(n.shape,a.shape),T.runKernelFunc((function(o,i){var s=o.lessEqual(n,a);return i([n,a]),s}),{a:n,b:a},null,"LessEqual")}}),Jd=D({lessEqualStrict_:function(r,t){var e=_(r,"a","lessEqualStrict"),n=_(t,"b","lessEqualStrict");return Ce(e.shape,n.shape,"Error in lessEqualStrict: "),e.lessEqual(n)}}),Qd=D({lessStrict_:function(r,t){var e=_(r,"a","lessStrict"),n=_(t,"b","lessStrict");return Ce(e.shape,n.shape,"Error in lessStrict: "),e.less(n)}}),Zd=D({notEqual_:function(r,t){var e,n=_(r,"a","notEqual"),a=_(t,"b","notEqual");return e=Ae(n,a),n=e[0],a=e[1],me(n.shape,a.shape),T.runKernelFunc((function(o){return o.notEqual(n,a)}),{a:n,b:a},null,"NotEqual")}}),ev=D({notEqualStrict_:function(r,t){var e=_(r,"a","notEqualStrict"),n=_(t,"b","notEqualStrict");return Ce(e.shape,n.shape,"Error in notEqualStrict: "),e.notEqual(n)}});function is(r,t){for(var e=[],n=r;n<t;++n)e.push(n);return e}function ss(r){for(var t=[],e=0;e<r.length;++e)for(var n=0;n<r[e].length;++n)t.push(r[e][n]);return t}var Vo=D({gather_:function(r,t,e){e===void 0&&(e=0);var n=_(r,"x","gather"),a=_(t,"indices","gather","int32");e=We(e,n.shape)[0];var o=(function(i,s,u){for(var c=i.shape[u],l=[],h=1,f=1,p=0;p<u;p++)l.push(i.shape[p]),h*=i.shape[p];for(p=0;p<s.rank;p++)l.push(s.shape[p]);for(p=u+1;p<i.rank;p++)l.push(i.shape[p]),f*=i.shape[p];return{batchSize:h,sliceSize:f,dimSize:c,outputShape:l}})(n,a,e);return T.runKernelFunc((function(i,s){var u=i.gather(n,a.flatten(),e);return s([a]),u}),{x:n,indices:a},(function(i,s){var u=s[0];return{x:function(){var c=n.shape,l=u.size,h=c.slice(0,e),f=h.length,p=c.slice(e,c.length).slice(1),d=p.length,m=is(0,f),v=is(f+1,f+1+d),g=ss([h,[l],p]),x=i.reshape(g),b=u.reshape([l]),y=ss([[f],m,v]),w=x.transpose(y),C=qu(w,b,n.shape[e]),S=So(y);return C=C.transpose(S)},indices:function(){return u}}}),"Gather",{axis:e}).reshape(o.outputShape)}}),qu=D({unsortedSegmentSum_:function(r,t,e){var n=_(r,"x","unsortedSegmentSum"),a=_(t,"segmentIds","unsortedSegmentSum","int32");return E(Ne(e),(function(){return"numSegments must be of dtype int"})),T.runKernelFunc((function(o,i){var s=o.unsortedSegmentSum(n,a,e);return i([a]),s}),{$x:n},(function(o,i){var s=i[0];return{$x:function(){return(function(u,c){for(var l=zo(c,xe(c)),h=Vo(u,l),f=ju(c,q(0,"int32")),p=h.rank-f.rank,d=0;d<p;++d)f=pt(f,d+1);f=ha(f,Xn(h.shape,"bool"));var m=xe(h);return gn(f,h,m)})(o,s)}}}))}}),tv=function(r,t,e){return $(this,void 0,void 0,(function(){var n,a,o,i,s,u,c,l,h,f,p,d,m;return Y(this,(function(v){switch(v.label){case 0:for(n=_(r,"tensor","boolMask"),a=_(t,"mask","boolMask","bool"),o=e??0,i=a.rank,s=n.shape,E(i>0,(function(){return"mask cannot be scalar"})),Ce(s.slice(o,o+i),a.shape,"mask's shape must match the first K dimensions of tensor's shape,"),u=1,c=o;c<o+i;c++)u*=s[c];return l=s.slice(0,o).concat([u],s.slice(o+i)),h=n.reshape(l),f=a.reshape([-1]),[4,zu(f)];case 1:return p=v.sent(),d=p.squeeze([1]),m=Vo(h,d,o),r!==n&&n.dispose(),t!==a&&a.dispose(),d.dispose(),h.dispose(),f.dispose(),p.dispose(),[2,m]}}))}))};function Ku(r,t,e,n,a,o,i){o===void 0&&(o="NHWC"),E(r.length===t.rank,(function(){return"Length of inShape ("+r.length+") and rank of dy ("+t.rank+") must match"}));var s=r,u=t,c=!1;t.rank===3&&(c=!0,u=t.as4D(1,t.shape[0],t.shape[1],t.shape[2]),s=[1,r[0],r[1],r[2]]),E(s.length===4,(function(){return"Error in conv2dDerInput: inShape must be length 4, but got length "+s.length+"."})),E(u.rank===4,(function(){return"Error in conv2dDerInput: dy must be rank 4, but got rank "+u.rank})),E(e.rank===4,(function(){return"Error in conv2dDerInput: filter must be rank 4, but got rank "+e.rank}));var l=o==="NHWC"?s[3]:s[1],h=o==="NHWC"?u.shape[3]:u.shape[1];E(l===e.shape[2],(function(){return"Error in conv2dDerInput: depth of input ("+l+") must match input depth for filter "+e.shape[2]+"."})),E(h===e.shape[3],(function(){return"Error in conv2dDerInput: depth of output ("+h+") must match output depth for filter "+e.shape[3]+"."})),i!=null&&E(Ne(a),(function(){return"Error in conv2dDerInput: pad must be an integer when using, dimRoundingMode "+i+" but got pad "+a+"."}));var f=Fo(o),p=wn(s,e.shape,n,1,a,i,!1,f),d=T.runKernelFunc((function(m,v){var g=m.conv2dDerInput(u,e,p);return v([e,u]),g}),{dy4D:u,filter:e},(function(m,v){var g=v[0],x=v[1];return{dy4D:function(){return mt(m,g,n,a,o,1,i)},filter:function(){return Go(m,x,g.shape,n,a,o,i)}}}));return c?d.as3D(d.shape[1],d.shape[2],d.shape[3]):d}function Ga(r){var t=(function(o){return typeof o=="number"?[o,o,o]:o.length===2?[o[0],o[1],1]:o})(r),e=t[0],n=t[1],a=t[2];return e===1&&n===1&&a===1}function Xu(r,t,e,n,a){E(r.length===t.rank,(function(){return"Length of inShape ("+r.length+") and rank of dy ("+t.rank+") must match"}));var o=r,i=t,s=!1;t.rank===4&&(s=!0,i=t.as5D(1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]),o=[1,r[0],r[1],r[2],r[3]]);var u=o[4],c=i.shape[4];E(o.length===5,(function(){return"Error in conv3dDerInput: inShape must be length 5, but got length "+o.length+"."})),E(i.rank===5,(function(){return"Error in conv3dDerInput: dy must be rank 5, but got rank "+i.rank})),E(e.rank===5,(function(){return"Error in conv3dDerInput: filter must be rank 5, but got rank "+e.rank})),E(u===e.shape[3],(function(){return"Error in conv3dDerInput: depth of input ("+u+") must match input depth for filter "+e.shape[3]+"."})),E(c===e.shape[4],(function(){return"Error in conv3dDerInput: depth of output ("+c+") must match output depth for filter "+e.shape[4]+"."}));var l=Yr(o,e.shape,n,1,a),h=T.runKernelFunc((function(f){return f.conv3dDerInput(i,e,l)}),{dy5D:i});return s?h.as4D(h.shape[1],h.shape[2],h.shape[3],h.shape[4]):h}var nv=D({conv1d_:function(r,t,e,n,a,o,i){a===void 0&&(a="NWC"),o===void 0&&(o=1);var s=_(r,"x","conv1d"),u=_(t,"filter","conv1d"),c=s,l=!1;s.rank===2&&(l=!0,c=s.as3D(1,s.shape[0],s.shape[1])),E(c.rank===3,(function(){return"Error in conv1d: input must be rank 3, but got rank "+c.rank+"."})),E(u.rank===3,(function(){return"Error in conv1d: filter must be rank 3, but got rank "+u.rank+"."})),i!=null&&E(Ne(n),(function(){return"Error in conv1d: pad must be an integer when using, dimRoundingMode "+i+" but got pad "+n+"."})),E(c.shape[2]===u.shape[1],(function(){return"Error in conv1d: depth of input ("+c.shape[2]+") must match input depth for filter "+u.shape[1]+"."})),E(rt(e,o),(function(){return"Error in conv1D: Either stride or dilation must be 1. Got stride "+e+" and dilation '"+o+"'"})),E(a==="NWC",(function(){return"Error in conv1d: got dataFormat of "+a+" but only NWC is currently supported."}));var h=u.as4D(1,u.shape[0],u.shape[1],u.shape[2]),f=c.as4D(c.shape[0],1,c.shape[1],c.shape[2]),p=mt(f,h,[1,e],n,"NHWC",[1,o],i);return l?p.as2D(p.shape[2],p.shape[3]):p.as3D(p.shape[0],p.shape[2],p.shape[3])}}),mt=D({conv2d_:function(r,t,e,n,a,o,i){a===void 0&&(a="NHWC"),o===void 0&&(o=[1,1]);var s=_(r,"x","conv2d"),u=_(t,"filter","conv2d"),c=s,l=!1;s.rank===3&&(l=!0,c=s.as4D(1,s.shape[0],s.shape[1],s.shape[2])),E(c.rank===4,(function(){return"Error in conv2d: input must be rank 4, but got rank "+c.rank+"."})),E(u.rank===4,(function(){return"Error in conv2d: filter must be rank 4, but got rank "+u.rank+"."})),i!=null&&E(Ne(n),(function(){return"Error in conv2d: pad must be an integer when using, dimRoundingMode "+i+" but got pad "+n+"."}));var h=a==="NHWC"?c.shape[3]:c.shape[1];E(h===u.shape[2],(function(){return"Error in conv2d: depth of input ("+h+") must match input depth for filter "+u.shape[2]+"."})),E(rt(e,o),(function(){return"Error in conv2D: Either strides or dilations must be 1. Got strides "+e+" and dilations '"+o+"'"}));var f=Fo(a),p=wn(c.shape,u.shape,e,o,n,i,!1,f),d=[u,c],m=T.runKernelFunc((function(v,g){var x=v.conv2d(c,u,p);return g([u,c]),x}),{x:c,filter:u},(function(v,g){var x=g,b=x[0],y=x[1];return E(qn(o),(function(){return"Error in gradient of conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '"+o+"'"})),{x:function(){return $u(y.shape,v,b,e,n,a)},filter:function(){return Go(y,v,b.shape,e,n,a)}}}),"Conv2D",p,d);return l?m.as3D(m.shape[1],m.shape[2],m.shape[3]):m}}),rv=D({conv3d_:function(r,t,e,n,a,o){a===void 0&&(a="NDHWC"),o===void 0&&(o=[1,1,1]);var i=_(r,"x","conv3d"),s=_(t,"filter","conv3d"),u=i,c=!1;i.rank===4&&(c=!0,u=i.as5D(1,i.shape[0],i.shape[1],i.shape[2],i.shape[3])),E(u.rank===5,(function(){return"Error in conv3d: input must be rank 5, but got rank "+u.rank+"."})),E(s.rank===5,(function(){return"Error in conv3d: filter must be rank 5, but got rank "+s.rank+"."})),E(u.shape[4]===s.shape[3],(function(){return"Error in conv3d: depth of input ("+u.shape[4]+") must match input depth for filter "+s.shape[3]+"."})),E((function(f,p){return Ga(f)||Ga(p)})(e,o),(function(){return"Error in conv3D: Either strides or dilations must be 1. Got strides "+e+" and dilations '"+o+"'"})),E(a==="NDHWC",(function(){return"Error in conv3d: got dataFormat of "+a+" but only NDHWC is currently supported."}));var l=Yr(u.shape,s.shape,e,o,n),h=T.runKernelFunc((function(f,p){var d=f.conv3d(u,s,l);return p([u,s]),d}),{x:u,$filter:s},(function(f,p){E(Ga(o),(function(){return"Error in gradient of conv3D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '"+o+"'"}));var d=p[0],m=p[1];return{x:function(){return Xu(d.shape,f,m,e,n)},$filter:function(){return(function(v,g,x,b,y){var w=v;v.rank===4&&(w=v.as5D(1,v.shape[0],v.shape[1],v.shape[2],v.shape[3]));var C=g;C.rank===4&&(C=g.as5D(1,g.shape[0],g.shape[1],g.shape[2],g.shape[3])),E(w.rank===5,(function(){return"Error in conv3dDerFilter: input must be rank 5, but got shape "+w.shape+"."})),E(C.rank===5,(function(){return"Error in conv3dDerFilter: dy must be rank 5, but got shape "+C.shape+"."})),E(x.length===5,(function(){return"Error in conv3dDerFilter: filterShape must be length 5, but got "+x+"."})),E(w.shape[4]===x[3],(function(){return"Error in conv3dDerFilter: depth of input "+w.shape[4]+") must match input depth in filter ("+x[3]+"."})),E(C.shape[4]===x[4],(function(){return"Error in conv3dDerFilter: depth of dy ("+C.shape[4]+") must match output depth for filter ("+x[4]+")."}));var S=Yr(w.shape,x,b,1,y);return T.runKernelFunc((function(I){return I.conv3dDerFilter(w,C,S)}),{x5D:w,dy5D:C})})(d,f,m.shape,e,n)}}}));return c?h.as4D(h.shape[1],h.shape[2],h.shape[3],h.shape[4]):h}}),Go=D({conv2dDerFilter_:function(r,t,e,n,a,o,i){o===void 0&&(o="NHWC");var s=r;r.rank===3&&(s=r.as4D(1,r.shape[0],r.shape[1],r.shape[2]));var u=t;u.rank===3&&(u=t.as4D(1,t.shape[0],t.shape[1],t.shape[2])),E(s.rank===4,(function(){return"Error in conv2dDerFilter: input must be rank 4, but got shape "+s.shape+"."})),E(u.rank===4,(function(){return"Error in conv2dDerFilter: dy must be rank 4, but got shape "+u.shape+"."})),E(e.length===4,(function(){return"Error in conv2dDerFilter: filterShape must be length 4, but got "+e+"."}));var c=o==="NHWC"?s.shape[3]:s.shape[1],l=o==="NHWC"?u.shape[3]:u.shape[1];E(c===e[2],(function(){return"Error in conv2dDerFilter: depth of input "+c+") must match input depth in filter ("+e[2]+"."})),E(l===e[3],(function(){return"Error in conv2dDerFilter: depth of dy ("+l+") must match output depth for filter ("+e[3]+")."})),i!=null&&E(Ne(a),(function(){return"Error in conv2dDerFilter: pad must be an integer when using, dimRoundingMode "+i+" but got pad "+a+"."}));var h=Fo(o),f=wn(s.shape,e,n,1,a,i,!1,h);return T.runKernelFunc((function(p){return p.conv2dDerFilter(s,u,f)}),{x4D:s,dy4D:u})}}),$u=D({conv2dDerInput_:Ku}),fa=D({depthwiseConv2d_:function(r,t,e,n,a,o,i){o===void 0&&(o=[1,1]);var s=_(r,"x","depthwiseConv2d"),u=_(t,"filter","depthwiseConv2d"),c=s,l=!1;s.rank===3&&(l=!0,c=s.as4D(1,s.shape[0],s.shape[1],s.shape[2])),E(c.rank===4,(function(){return"Error in depthwiseConv2d: input must be rank 4, but got rank "+c.rank+"."})),E(u.rank===4,(function(){return"Error in depthwiseConv2d: filter must be rank 4, but got rank "+u.rank+"."})),E(c.shape[3]===u.shape[2],(function(){return"Error in depthwiseConv2d: number of input channels ("+c.shape[3]+") must match the inChannels dimension in filter "+u.shape[2]+"."})),o==null&&(o=[1,1]),E(rt(e,o),(function(){return"Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides "+e+" and dilations '"+o+"'"})),i!=null&&E(Ne(n),(function(){return"Error in depthwiseConv2d: pad must be an integer when using, dimRoundingMode "+i+" but got pad "+n+"."}));var h=wn(c.shape,u.shape,e,o,n,i,!0),f=[c,u],p=T.runKernelFunc((function(d,m){var v=d.depthwiseConv2D(c,u,h);return m([c,u]),v}),{x:c,filter:u},(function(d,m){E(qn(o),(function(){return"Error in gradient of depthwiseConv2d: dilation rates greater than 1 are not yet supported. Got dilations '"+o+"'"}));var v=m[0],g=m[1];return{x:function(){return Yu(v.shape,d,g,h)},filter:function(){return Ju(v,d,g.shape,h)}}}),"DepthwiseConv2dNative",h,f);return l?p.as3D(p.shape[1],p.shape[2],p.shape[3]):p}}),Yu=D({depthwiseConv2dDerInput_:function(r,t,e,n){var a=t,o=!1;t.rank===3&&(o=!0,a=t.as4D(1,t.shape[0],t.shape[1],t.shape[2]));var i=T.runKernelFunc((function(s){return s.depthwiseConv2DDerInput(a,e,n)}),{dy4D:a});return o?i.as3D(i.shape[1],i.shape[2],i.shape[3]):i}}),Ju=D({depthwiseConv2dDerFilter_:function(r,t,e,n){var a=r;r.rank===3&&(a=r.as4D(1,r.shape[0],r.shape[1],r.shape[2]));var o=t;return o.rank===3&&(o=t.as4D(1,t.shape[0],t.shape[1],t.shape[2])),T.runKernelFunc((function(i){return i.depthwiseConv2DDerFilter(a,o,n)}),{x4D:a,dy4D:o})}}),Ho=D({separableConv2d_:function(r,t,e,n,a,o,i){o===void 0&&(o=[1,1]),i===void 0&&(i="NHWC");var s=_(r,"x","separableConv2d"),u=_(t,"depthwiseFilter","separableConv2d"),c=_(e,"pointwiseFilter","separableConv2d"),l=s,h=!1;if(s.rank===3&&(h=!0,l=s.as4D(1,s.shape[0],s.shape[1],s.shape[2])),i==="NCHW")throw new Error("separableConv2d currently does not support dataFormat NCHW; only NHWC is supported");E(l.rank===4,(function(){return"Error in separableConv2d: input must be rank 4, but got rank "+l.rank+"."})),E(u.rank===4,(function(){return"Error in separableConv2d: depthwise filter must be rank 4, but got rank "+u.rank+"."})),E(c.rank===4,(function(){return"Error in separableConv2d: pointwise filter must be rank 4, but got rank "+u.rank+"."})),E(c.shape[0]===1,(function(){return"Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got "+c.shape[0]+"."})),E(c.shape[1]===1,(function(){return"Error in separableConv2d: the second dimension of pointwise filter must be 1, but got "+c.shape[1]+"."}));var f=u.shape[2],p=u.shape[3];E(c.shape[2]===f*p,(function(){return"Error in separableConv2d: the third dimension of pointwise filter must be "+f*p+", but got "+c.shape[2]+"."}));var d=fa(l,u,n,a,i,o),m=mt(d,c,1,"valid",i);return h?m.as3D(m.shape[1],m.shape[2],m.shape[3]):m}}),av=D({conv2dTranspose_:function(r,t,e,n,a,o){return Ku(e,_(r,"x","conv2dTranspose"),_(t,"filter","conv2dTranspose"),n,a,"NHWC",o)}}),ov=D({conv3dTranspose_:function(r,t,e,n,a){return Xu(e,_(r,"x","conv3dTranspose"),_(t,"filter","conv3dTranspose"),n,a)}}),pa=D({matMul_:function(r,t,e,n){var a;e===void 0&&(e=!1),n===void 0&&(n=!1);var o=_(r,"a","matMul"),i=_(t,"b","matMul");a=Ae(o,i),o=a[0],i=a[1];var s=e?o.shape[o.rank-2]:o.shape[o.rank-1],u=n?i.shape[i.rank-1]:i.shape[i.rank-2],c=e?o.shape[o.rank-1]:o.shape[o.rank-2],l=n?i.shape[i.rank-2]:i.shape[i.rank-1],h=o.shape.slice(0,-2),f=i.shape.slice(0,-2),p=Q(h),d=Q(f);E(o.rank>=2&&i.rank>=2&&o.rank===i.rank,(function(){return"Error in matMul: inputs must have the same rank of at least 2, got ranks "+o.rank+" and "+i.rank+"."})),E(ze(h,f),(function(){return"Error in matMul: outer dimensions ("+h+") and ("+f+") of Tensors with shapes "+o.shape+" and "+i.shape+" must match."})),E(s===u,(function(){return"Error in matMul: inner shapes ("+s+") and ("+u+") of Tensors with shapes "+o.shape+" and "+i.shape+" and transposeA="+e+" and transposeB="+n+" must match."}));var m=o.shape.slice(0,-2).concat([c,l]),v=e?o.as3D(p,s,c):o.as3D(p,c,s),g=n?i.as3D(d,l,u):i.as3D(d,u,l),x={transposeA:e,transposeB:n};return T.runKernelFunc((function(b,y){var w=b.batchMatMul(v,g,e,n);return y([v,g]),w}),{a:v,b:g},(function(b,y){var w=y,C=w[0],S=w[1];return e||n?!e&&n?{a:function(){return b.matMul(S,!1,!1)},b:function(){return b.matMul(C,!0,!1)}}:e&&!n?{a:function(){return S.matMul(b,!1,!0)},b:function(){return C.matMul(b,!1,!1)}}:{a:function(){return S.matMul(b,!0,!0)},b:function(){return b.matMul(C,!0,!0)}}:{a:function(){return b.matMul(S,!1,!0)},b:function(){return C.matMul(b,!0,!1)}}}),"BatchMatMul",x).reshape(m)}}),iv=D({dot_:function(r,t){var e=_(r,"t1","dot"),n=_(t,"t2","dot");E(!(e.rank!==1&&e.rank!==2||n.rank!==1&&n.rank!==2),(function(){return"Error in dot: inputs must all be rank 1 or 2, but got ranks "+e.rank+" and "+n.rank+"."}));var a=e.rank===1?e.size:e.shape[1],o=n.rank===1?n.size:n.shape[0];return E(a===o,(function(){return"Error in dot: inner dimensions of inputs must match, but got "+a+" and "+o+"."})),e.rank===1&&n.rank===1?e.as2D(1,-1).matMul(n.as2D(-1,1)).asScalar():e.rank===1&&n.rank===2?e.as2D(1,-1).matMul(n.as2D(n.shape[0],n.shape[1])).as1D():e.rank===2&&n.rank===1?e.matMul(n.as2D(-1,1)).as1D():e.matMul(n.as2D(n.shape[0],n.shape[1]))}}),sv=D({outerProduct_:function(r,t){var e=_(r,"v1","outerProduct"),n=_(t,"v2","outerProduct");return E(e.rank===1&&n.rank===1,(function(){return"Error in outerProduct: inputs must be rank 1, but got ranks "+e.rank+" and "+n.rank+"."})),e.as2D(-1,1).matMul(n.as2D(1,-1))}}),dr=D({reverse_:function(r,t){var e=_(r,"x","reverse");if(e.rank===0)return e.clone();var n=We(t,e.shape);return T.runKernelFunc((function(a){return a.reverse(e,n)}),{$x:e},(function(a){return{$x:function(){return a.reverse(n)}}})).reshapeAs(e)}}),uv=D({reverse1d_:function(r){var t=_(r,"x","reverse");return E(t.rank===1,(function(){return"Error in reverse1D: x must be rank 1 but got rank "+t.rank+"."})),dr(t,0)}}),cv=D({reverse2d_:function(r,t){var e=_(r,"x","reverse");return E(e.rank===2,(function(){return"Error in reverse2D: x must be rank 2 but got rank "+e.rank+"."})),dr(e,t)}}),lv=D({reverse3d_:function(r,t){var e=_(r,"x","reverse");return E(e.rank===3,(function(){return"Error in reverse3D: x must be rank 3 but got rank "+e.rank+"."})),dr(e,t)}}),hv=D({reverse4d_:function(r,t){var e=_(r,"x","reverse");return E(e.rank===4,(function(){return"Error in reverse4D: x must be rank 4 but got rank "+e.rank+"."})),dr(e,t)}});function Qu(r,t,e,n,a,o){var i=_(r,"x","maxPool"),s=i,u=!1;i.rank===3&&(u=!0,s=i.as4D(1,i.shape[0],i.shape[1],i.shape[2])),E(s.rank===4,(function(){return"Error in maxPool: input must be rank 4 but got rank "+s.rank+"."})),E(rt(e,n),(function(){return"Error in maxPool: Either strides or dilations must be 1. Got strides "+e+" and dilations '"+n+"'"})),o!=null&&E(Ne(a),(function(){return"Error in maxPool: pad must be an integer when using, dimRoundingMode "+o+" but got pad "+a+"."}));var c=or(s.shape,t,e,n,a,o);if(c.filterWidth===1&&c.filterHeight===1&&ze(c.inShape,c.outShape))return i.clone();var l=[s],h=T.runKernelFunc((function(f,p){var d=f.maxPool(s,c);return p([s,d]),d}),{x:s},(function(f,p){var d=p[0],m=p[1];return{x:function(){return(function(v,g,x,b,y,w,C,S){var I=_(v,"dy","maxPoolBackprop"),k=_(g,"input","maxPoolBackprop"),R=_(x,"output","maxPoolBackprop");E(k.rank===I.rank,(function(){return"Rank of input ("+k.rank+") does not match rank of dy ("+I.rank+")"})),E(rt(y,w),(function(){return"Error in maxPoolBackProp: Either strides or dilations must be 1. Got strides "+y+" and dilations '"+w+"'"})),E(I.rank===4,(function(){return"Error in maxPoolBackprop: dy must be rank 4 but got rank "+I.rank+"."})),E(k.rank===4,(function(){return"Error in maxPoolBackprop: input must be rank 4 but got rank "+k.rank+"."}));var N=or(k.shape,b,y,w,C,S);return T.runKernelFunc((function(A){return A.maxPoolBackprop(I,k,R,N)}),{$dy:I,$input:k})})(f,d,m,t,e,n,a)}}}),"MaxPool",c,l);return u?h.as3D(h.shape[1],h.shape[2],h.shape[3]):h}function Zu(r,t,e,n,a,o){var i=_(r,"x","avgPool","float32");E(rt(e,n),(function(){return"Error in avgPool: Either strides or dilations must be 1. Got strides "+e+" and dilations '"+n+"'"}));var s=i,u=!1;i.rank===3&&(u=!0,s=i.as4D(1,i.shape[0],i.shape[1],i.shape[2])),E(s.rank===4,(function(){return"Error in avgPool: x must be rank 4 but got rank "+s.rank+"."})),o!=null&&E(Ne(a),(function(){return"Error in avgPool: pad must be an integer when using, dimRoundingMode "+o+" but got pad "+a+"."}));var c=or(s.shape,t,e,n,a,o);if(c.filterWidth===1&&c.filterHeight===1&&ze(c.inShape,c.outShape))return i.clone();var l=T.runKernelFunc((function(h){return h.avgPool(s,c)}),{x:s},(function(h){return{x:function(){return(function(f,p,d,m,v,g){var x=_(f,"dy","avgPoolBackprop"),b=_(p,"input","avgPoolBackprop");E(b.rank===x.rank,(function(){return"Rank of input ("+b.rank+") does not match rank of dy ("+x.rank+")"})),E(rt(m,v),(function(){return"Error in avgPoolBackprop: Either strides or dilations must be 1. Got strides "+m+" and dilations '"+v+"'"}));var y=b,w=x,C=!1;b.rank===3&&(C=!0,y=b.as4D(1,b.shape[0],b.shape[1],b.shape[2]),w=x.as4D(1,x.shape[0],x.shape[1],x.shape[2])),E(w.rank===4,(function(){return"Error in avgPoolBackprop: dy must be rank 4 but got rank "+w.rank+"."})),E(y.rank===4,(function(){return"Error in avgPoolBackprop: input must be rank 4 but got rank "+y.rank+"."}));var S=or(y.shape,d,m,v,g),I=T.runKernelFunc((function(k){return k.avgPoolBackprop(w,y,S)}),{dy4D:w,input4D:y});return C?I.as3D(I.shape[1],I.shape[2],I.shape[3]):I})(h,s,t,e,n,a)}}}),"AvgPool",c);return l=l.cast(i.dtype),u?l.as3D(l.shape[1],l.shape[2],l.shape[3]):l}var Ue=D({maxPool_:function(r,t,e,n,a){return Qu(r,t,e,1,n,a)}}),vr=D({avgPool_:function(r,t,e,n,a){return Zu(r,t,e,1,n,a)}}),fv=D({pool_:function(r,t,e,n,a,o){a==null&&(a=[1,1]),o==null&&(o=1),n===0&&(n="valid");var i=_(r,"x","maxPool"),s=i,u=!1;i.rank===3&&(u=!0,s=i.as4D(1,i.shape[0],i.shape[1],i.shape[2])),E(rt(o,a),(function(){return"Error in pool: Either strides or dilations must be 1. Got strides "+o+" and dilations '"+a+"'"}));var c,l=or(s.shape,t,o,a,n),h=[l.dilationHeight,l.dilationWidth];c=n==="same"?(function(y,w){var C=y.map((function(k,R){return k+(k-1)*(w[R]-1)})).map((function(k){return k-1})),S=C.map((function(k){return Math.floor(k/2)})),I=C.map((function(k,R){return k-S[R]}));return C.map((function(k,R){return[S[R],I[R]]}))})([l.filterHeight,l.filterWidth],h):[[0,0],[0,0]];var f=h[0]===1&&h[1]===1,p=(function(y,w,C){var S=C.map((function(M){return M[0]})),I=C.map((function(M){return M[1]})),k=y.concat(S,I),R=w.map((function(M,O){return(M-k[O]%M)%M})),N=I.map((function(M,O){return M+R[O]})),A=w.map((function(M,O){return[S[O],N[O]]})),L=w.map((function(M,O){return[0,R[O]]}));return[A,L]})([l.inHeight,l.inWidth],h,c),d=p[0],m=p[1],v=f?n:"valid",g=f?s:ou(s,h,d),x=(e==="avg"?function(){return Zu(g,t,o,1,v)}:function(){return Qu(g,t,o,1,v)})(),b=f?x:nu(x,h,m);return u?b.as3D(b.shape[1],b.shape[2],b.shape[3]):b}}),pv=D({maxPool3d_:function(r,t,e,n,a,o,i){o===void 0&&(o="NDHWC");var s=_(r,"x","maxPool3d"),u=s,c=!1;s.rank===4&&(c=!0,u=s.as5D(1,s.shape[0],s.shape[1],s.shape[2],s.shape[3])),i==null&&(i=[1,1,1]),E(u.rank===5,(function(){return"Error in maxPool3d: x must be rank 5 but got rank "+u.rank+"."})),E(o==="NDHWC",(function(){return"Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of "+o})),E(rt(e,i),(function(){return"Error in maxPool3d: Either strides or dilations must be 1. Got strides "+e+" and dilations '"+i+"'"})),a!=null&&E(Ne(n),(function(){return"Error in maxPool3d: pad must be an integer when using, dimRoundingMode "+a+" but got pad "+n+"."}));var l=$r(u.shape,t,e,i,n,a,o),h=T.runKernelFunc((function(f,p){var d=f.maxPool3d(u,l);return p([u,d]),d}),{x:u},(function(f,p){var d=p[0],m=p[1];return{x:function(){return(function(v,g,x,b,y,w,C,S){var I=_(v,"dy","maxPool3dBackprop"),k=_(g,"input","maxPool3dBackprop"),R=_(x,"output","maxPool3dBackprop"),N=I,A=k,L=R,M=!1;k.rank===4&&(M=!0,N=I.as5D(1,I.shape[0],I.shape[1],I.shape[2],I.shape[3]),A=k.as5D(1,k.shape[0],k.shape[1],k.shape[2],k.shape[3]),L=R.as5D(1,R.shape[0],R.shape[1],R.shape[2],R.shape[3])),E(N.rank===5,(function(){return"Error in maxPool3dBackprop: dy must be rank 5 but got rank "+N.rank+"."})),E(A.rank===5,(function(){return"Error in maxPool3dBackprop: input must be rank 5 but got rank "+A.rank+"."})),E(L.rank===5,(function(){return"Error in maxPool3dBackprop: output must be rank 5 but got rank "+L.rank+"."})),w==null&&(w=[1,1,1]),E(rt(y,w),(function(){return"Error in maxPool3dBackprop: Either strides or dilations must be 1. Got strides "+y+" and dilations '"+w+"'"})),S!=null&&E(Ne(C),(function(){return"Error in maxPool3dBackprop: pad must be an integer when using, dimRoundingMode "+S+" but got pad "+C+"."}));var O=$r(A.shape,b,y,w,C,S),V=T.runKernelFunc((function(U){return U.maxPool3dBackprop(N,A,L,O)}),{dy5D:N,input5D:A});return M?V.as4D(V.shape[1],V.shape[2],V.shape[3],V.shape[4]):V})(f,d,m,t,e,i,n,a)}}}));return c?h.as4D(h.shape[1],h.shape[2],h.shape[3],h.shape[4]):h}}),dv=D({avgPool3d_:function(r,t,e,n,a,o,i){o===void 0&&(o="NDHWC");var s=_(r,"x","avgPool3d","float32"),u=s,c=!1;s.rank===4&&(c=!0,u=s.as5D(1,s.shape[0],s.shape[1],s.shape[2],s.shape[3])),i==null&&(i=[1,1,1]),E(u.rank===5,(function(){return"Error in avgPool3d: x must be rank 5 but got rank "+u.rank+"."})),E(o==="NDHWC",(function(){return"Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of "+o})),E(rt(e,i),(function(){return"Error in avgPool3d: Either strides or dilations must be 1. Got strides "+e+" and dilations '"+i+"'"})),a!=null&&E(Ne(n),(function(){return"Error in avgPool3d: pad must be an integer when using, dimRoundingMode "+a+" but got pad "+n+"."}));var l=$r(u.shape,t,e,i,n,a,o),h=T.runKernelFunc((function(f){return f.avgPool3d(u,l)}),{x:u},(function(f){return{x:function(){return(function(p,d,m,v,g,x,b){var y=_(p,"dy","avgPool3dBackprop"),w=_(d,"input","avgPool3dBackprop"),C=y,S=w,I=!1;w.rank===4&&(I=!0,C=y.as5D(1,y.shape[0],y.shape[1],y.shape[2],y.shape[3]),S=w.as5D(1,w.shape[0],w.shape[1],w.shape[2],w.shape[3])),E(C.rank===5,(function(){return"Error in avgPool3dBackprop: dy must be rank 5 but got rank "+C.rank+"."})),E(S.rank===5,(function(){return"Error in avgPool3dBackprop: input must be rank 5 but got rank "+S.rank+"."})),g==null&&(g=[1,1,1]),E(rt(v,g),(function(){return"Error in avgPool3dBackprop: Either strides or dilations must be 1. Got strides "+v+" and dilations '"+g+"'"})),b!=null&&E(Ne(x),(function(){return"Error in maxPool3dBackprop: pad must be an integer when using, dimRoundingMode "+b+" but got pad "+x+"."}));var k=$r(S.shape,m,v,g,x,b),R=T.runKernelFunc((function(N){return N.avgPool3dBackprop(C,S,k)}),{dy5D:C,input5D:S});return I?R.as4D(R.shape[1],R.shape[2],R.shape[3],R.shape[4]):R})(f,u,t,e,i,n,a)}}}));return h=h.cast(u.dtype),c?h.as4D(h.shape[1],h.shape[2],h.shape[3],h.shape[4]):h}}),Ft=D({slice_:function(r,t,e){var n,a,o=_(r,"x","slice");if(o.rank===0)throw new Error("Slicing scalar is not possible");(n=typeof t=="number"?[t].concat(new Array(o.rank-1).fill(0)):t.length<o.rank?t.concat(new Array(o.rank-t.length).fill(0)):t.slice()).forEach((function(u){E(u!==-1,(function(){return"slice() does not support negative begin indexing."}))})),a=(a=e==null?new Array(o.rank).fill(-1):typeof e=="number"?[e].concat(new Array(o.rank-1).fill(-1)):e.length<o.rank?e.concat(new Array(o.rank-e.length).fill(-1)):e).map((function(u,c){return u>=0?u:(E(u===-1,(function(){return"Negative size values should be exactly -1 but got "+u+" for the slice() size at index "+c+"."})),o.shape[c]-n[c])})),zh(o,n,a);var i=o.shape,s={begin:n,size:a};return T.runKernelFunc((function(u){return u.slice(o,n,a)}),{x:o},(function(u){for(var c=[],l=0;l<u.rank;l++)c.push([n[l],i[l]-n[l]-a[l]]);return{x:function(){return u.pad(c)}}}),"Slice",s)}}),vv=D({slice1d_:function(r,t,e){var n=_(r,"x","slice1d");return E(n.rank===1,(function(){return"slice1d expects a rank-1 tensor, but got a rank-"+n.rank+" tensor"})),Ft(n,[t],[e])}}),mv=D({slice2d_:function(r,t,e){var n=_(r,"x","slice2d");return E(n.rank===2,(function(){return"slice2d expects a rank-2 tensor, but got a rank-"+n.rank+" tensor"})),Ft(n,t,e)}}),ec=D({slice3d_:function(r,t,e){var n=_(r,"x","slice3d");return E(n.rank===3,(function(){return"slice3d expects a rank-3 tensor, but got a rank-"+n.rank+" tensor"})),Ft(n,t,e)}}),gv=D({slice4d_:function(r,t,e){var n=_(r,"x","slice4d");return E(n.rank===4,(function(){return"slice4d expects a rank-4 tensor, but got a rank-"+n.rank+" tensor"})),Ft(n,t,e)}});function tc(r,t,e,n,a){return t.rank<e.rank&&(t=t.reshape(nt(t.shape,n))),r.rank<e.rank&&(r=r.reshape(nt(r.shape,n))),{x:function(){var o=r.mul(e.equal(t).cast(r.dtype));return a==null?o:o.transpose(a)}}}var yv=D({all_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","all","bool"),a=We(t,n.shape),o=a,i=Mt(o,n.rank);i!=null&&(n=n.transpose(i),o=Ot(o.length,n.rank));var s=T.runKernelFunc((function(c){return c.all(n,o)}),{$x:n});if(e){var u=nt(s.shape,a);return s.reshape(u)}return s}}),xv=D({any_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","any","bool"),a=We(t,n.shape),o=a,i=Mt(o,n.rank);i!=null&&(n=n.transpose(i),o=Ot(o.length,n.rank));var s=T.runKernelFunc((function(c){return c.any(n,o)}),{$x:n});if(e){var u=nt(s.shape,a);return s.reshape(u)}return s}}),bv=D({argMax_:function(r,t){t===void 0&&(t=0);var e=_(r,"x","argMax");t==null&&(t=0);var n=We(t,e.shape),a=Mt(n,e.rank);a!=null&&(e=e.transpose(a),n=Ot(n.length,e.rank));var o={axis:n[0]},i=[e];return T.runKernelFunc((function(s,u){var c=s.argMax(e,n[0]);return u([e]),c}),{x:e},(function(s,u){var c=u[0];return{x:function(){return xe(c)}}}),"ArgMax",o,i)}}),wv=D({argMin_:function(r,t){t===void 0&&(t=0);var e=_(r,"x","argMin");t==null&&(t=0);var n=We(t,e.shape),a=Mt(n,e.rank);return a!=null&&(e=e.transpose(a),n=Ot(n.length,e.rank)),T.runKernelFunc((function(o,i){var s=o.argMin(e,n[0]);return i([e]),s}),{$x:e},(function(o,i){var s=i[0];return{$x:function(){return xe(s)}}}))}}),Cv=D({logSumExp_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","logSumExp"),a=We(t,n.shape),o=n.max(a,!0),i=n.sub(o).exp().sum(a).log(),s=o.reshape(i.shape).add(i);if(e){var u=nt(s.shape,a);return s.reshape(u)}return s}}),da=D({max_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","max"),a=n,o=We(t,n.shape),i=o,s=Mt(i,n.rank);s!=null&&(n=n.transpose(s),i=Ot(i.length,n.rank));var u=[n],c=T.runKernelFunc((function(h,f){var p=h.max(n,i);return f([a,p]),p}),{x:n},(function(h,f){return tc(h,f[1],f[0],o,s)}),"Max",{axes:i},u,[!0]);if(e){var l=nt(c.shape,o);c=c.reshape(l)}return c}}),_v=D({mean_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","mean"),a=We(t,n.shape),o=Q(qe(n.shape,a)[1]);return ca((function(i){var s=q(o);return{value:(s.dtype===i.dtype?i:i.cast(s.dtype)).div(s).sum(t,e),gradFunc:function(u){var c=i.shape.slice();return a.forEach((function(l){c[l]=1})),u.reshape(c).mul(Xn(i.shape,"float32")).div(o)}}}))(n)}}),Ev=D({min_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","min"),a=n,o=We(t,n.shape),i=o,s=Mt(i,n.rank);s!=null&&(n=n.transpose(s),i=Ot(i.length,n.rank));var u=[n],c=T.runKernelFunc((function(h,f){var p=h.min(n,i);return f([a,p]),p}),{x:n},(function(h,f){return tc(h,f[1],f[0],o,s)}),"Min",{axes:i},u,[!0]);if(e){var l=nt(c.shape,o);c=c.reshape(l)}return c}}),kv=D({moments_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=We(t,(r=_(r,"x","moments")).shape),a=r.mean(n,e),o=a.shape;e||(o=nt(a.shape,n));var i=r.toFloat().sub(a.reshape(o)).square();return{mean:a,variance:i.mean(n,e)}}}),nc=D({sum_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","sum");n.dtype==="bool"&&(n=n.toInt());var a=We(t,n.shape);return ca((function(o){var i=Mt(a,o.rank),s=a,u=o;i!=null&&(u=o.transpose(i),s=Ot(s.length,o.rank));var c=function(p){var d=o.shape.slice();return a.forEach((function(m){d[m]=1})),p.reshape(d).mul(Xn(o.shape,"float32"))},l={axes:s},h=T.runKernelFunc((function(p){return p.sum(u,s)}),{x:u},(function(p){return{x:function(){return c(p)}}}),"Sum",l);if(e){var f=nt(h.shape,a);h=h.reshape(f)}return{value:h,gradFunc:c}}))(n)}}),Rv=D({prod_:function(r,t,e){t===void 0&&(t=null),e===void 0&&(e=!1);var n=_(r,"x","prod");n.dtype==="bool"&&(n=n.toInt());var a=We(t,n.shape),o=Mt(a,n.rank),i=a,s=n;o!=null&&(s=n.transpose(o),i=Ot(i.length,n.rank));var u=T.runKernelFunc((function(l){return l.prod(s,i)}),{permutedX:s});if(e){var c=nt(u.shape,a);u=u.reshape(c)}return u}}),rc=D({elu_:function(r){var t=_(r,"x","elu");return T.runKernelFunc((function(e,n){var a=e.elu(t);return n([a]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){return T.runKernelFunc((function(o){return o.eluDer(e,a)}),{dy:e,y:a})}}}))}}),Iv=D({leakyRelu_:function(r,t){t===void 0&&(t=.2);var e=_(r,"x","leakyRelu");return zo(q(t).mul(e),e)}}),ac=D({prelu_:function(r,t){var e=_(r,"x","prelu"),n=_(t,"alpha","prelu");return T.runKernelFunc((function(a,o){var i=a.prelu(e,n);return o([e,n]),i}),{x:e,alpha:n},(function(a,o){var i=o[0],s=o[1],u=i.greater(0);return{x:function(){return gn(u,a,a.mul(s))},alpha:function(){var c=gn(u,xe(a),a.mul(i)),l=Be(s.shape,a.shape);return l.length>0&&(c=c.sum(l)),c.reshape(s.shape)}}}),"Prelu")}}),De=D({relu_:function(r){var t=_(r,"x","relu");return t.dtype==="bool"?t.toInt():T.runKernelFunc((function(e,n){var a=e.relu(t);return n([t]),a}),{x:t},(function(e,n){var a=n[0];return{x:function(){return e.mulStrict(a.step().toFloat())}}}),"Relu")}}),oc=D({relu6_:function(r){var t=_(r,"x","relu6");return t.dtype==="bool"?t.toInt():T.runKernelFunc((function(e,n){var a=e.relu6(t);return n([t]),a}),{x:t},(function(e,n){var a=n[0],o=a.lessEqual(6).mul(a.step());return{x:function(){return e.mulStrict(o.toFloat())}}}),"Relu6")}}),Sv=D({selu_:function(r){var t=_(r,"x","selu");return T.runKernelFunc((function(e,n){var a=e.selu(t);return n([t]),a}),{$x:t},(function(e,n){var a=n[0];return{$x:function(){var o=a.greater(q(0)),i=q(Lo),s=q(Wo),u=e.mul(s),c=e.mul(i).mul(a.toFloat().exp());return gn(o,u,c)}}}))}}),an=D({transpose_:function(r,t){var e=_(r,"x","transpose");if(t==null&&(t=e.shape.map((function(a,o){return o})).reverse()),E(e.rank===t.length,(function(){return"Error in transpose: rank of input "+e.rank+" must match length of perm "+t+"."})),t.forEach((function(a){E(a>=0&&a<e.rank,(function(){return"All entries in 'perm' must be between 0 and "+(e.rank-1)+" but got "+t}))})),e.rank<=1)return e.clone();var n={perm:t};return T.runKernelFunc((function(a){return a.transpose(e,t)}),{x:e},(function(a){var o=So(t);return{x:function(){return a.transpose(o)}}}),"Transpose",n)}}),Dv=D({localResponseNormalization_:function(r,t,e,n,a){t===void 0&&(t=5),e===void 0&&(e=1),n===void 0&&(n=1),a===void 0&&(a=.5);var o=_(r,"x","localResponseNormalization");E(o.rank===4||o.rank===3,(function(){return`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank `+o.rank+"."})),E(Ne(t),(function(){return"Error in localResponseNormalization: depthRadius must be an integer but got depthRadius "+t+"."}));var i=o,s=!1;o.rank===3&&(s=!0,i=o.as4D(1,o.shape[0],o.shape[1],o.shape[2]));var u=T.runKernelFunc((function(c,l){var h=c.localResponseNormalization4D(i,t,e,n,a);return l([i,h]),h}),{x4D:i},(function(c,l){var h=l[0],f=l[1];return{x4D:function(){return T.runKernelFunc((function(p){return p.LRNGrad(c,h,f,t,e,n,a)}),{})}}}));return s?u.as3D(u.shape[1],u.shape[2],u.shape[3]):u}}),ic=D({norm_:function(r,t,e,n){t===void 0&&(t="euclidean"),e===void 0&&(e=null),n===void 0&&(n=!1);var a=(function s(u,c,l){if(l===void 0&&(l=null),u.rank===0)return u.abs();if(u.rank!==1&&l===null)return s(u.reshape([-1]),c,l);if(u.rank===1||typeof l=="number"||Array.isArray(l)&&l.length===1){if(c===1)return u.abs().sum(l);if(c===1/0)return u.abs().max(l);if(c===-1/0)return u.abs().min(l);if(c==="euclidean"||c===2)return u.abs().pow(q(2,"int32")).sum(l).sqrt();throw new Error("Error in norm: invalid ord value: "+c)}if(Array.isArray(l)&&l.length===2){if(c===1)return u.abs().sum(l[0]).max(l[1]-1);if(c===1/0)return u.abs().sum(l[1]).max(l[0]);if(c===-1/0)return u.abs().sum(l[1]).min(l[0]);if(c==="fro"||c==="euclidean")return u.square().sum(l).sqrt();throw new Error("Error in norm: invalid ord value: "+c)}throw new Error("Error in norm: invalid axis: "+l)})(r=_(r,"x","norm"),t,e),o=a.shape;if(n){var i=We(e,r.shape);o=nt(a.shape,i)}return a.reshape(o)}}),Av=D({basicLSTMCell_:function(r,t,e,n,a,o){var i=_(r,"forgetBias","basicLSTMCell"),s=_(t,"lstmKernel","basicLSTMCell"),u=_(e,"lstmBias","basicLSTMCell"),c=_(n,"data","basicLSTMCell"),l=_(a,"c","basicLSTMCell"),h=_(o,"h","basicLSTMCell"),f=c.concat(h,1).matMul(s).add(u),p=f.shape[0],d=f.shape[1]/4,m=[p,d],v=f.slice([0,0],m),g=f.slice([0,d],m),x=f.slice([0,2*d],m),b=f.slice([0,3*d],m),y=v.sigmoid().mulStrict(g.tanh()).addStrict(l.mulStrict(i.add(x).sigmoid())),w=y.tanh().mulStrict(b.sigmoid());return[y,w]}}),Tv=D({multiRNNCell_:function(r,t,e,n){for(var a=_(t,"data","multiRNNCell"),o=Gr(e,"c","multiRNNCell"),i=Gr(n,"h","multiRNNCell"),s=a,u=[],c=0;c<r.length;c++){var l=r[c](s,o[c],i[c]);u.push(l[0]),u.push(l[1]),s=l[1]}var h=[],f=[];for(c=0;c<u.length;c+=2)h.push(u[c]),f.push(u[c+1]);return[h,f]}}),Nv=D({movingAverage_:function(r,t,e,n,a){a===void 0&&(a=!0);var o=_(r,"v","movingAverage"),i=_(t,"x","movingAverage"),s=_(e,"decay","movingAverage");Sl(o,i),E(ze(o.shape,i.shape),(function(){return"Shape mismatch in v and x"}));var u=q(1),c=u.sub(s),l=i.sub(o).mul(c);if(a){E(n!=null,(function(){return"When using zeroDebias: true, step is required."}));var h=_(n,"step","movingAverage");l=l.div(u.sub(Zr(s,h)))}return o.add(l)}}),Fv=D({stridedSlice_:function(r,t,e,n,a,o,i,s,u){if(a===void 0&&(a=0),o===void 0&&(o=0),i===void 0&&(i=0),s===void 0&&(s=0),u===void 0&&(u=0),n==null&&(n=new Array(t.length)),i!==0)throw new Error("ellipsis mask is not yet supported");var c=_(r,"x","stridedSlice"),l=Ui(s),h=c.shape.slice();l.forEach((function(v){t[v]=0,e[v]=1,h.splice(v,0,1)})),c=c.reshape(h);for(var f=0;f<c.rank;f++)t[f]=Vh(a,t,n,c.shape,f),e[f]=Gh(o,e,n,c.shape,f),n[f]=n[f]||1;var p=Ui(u);p.forEach((function(v){e[v]=t[v]+1,n[v]=1}));var d=No(t,e,n),m=d.filter((function(v,g){return p.indexOf(g)===-1}));return n.every((function(v){return v===1}))?Ft(c,t,d).reshape(m):T.runKernelFunc((function(v){return v.stridedSlice(c,t,e,n)}),{$x:c}).reshape(m)}}),Pv=D({topk_:function(r,t,e){t===void 0&&(t=1),e===void 0&&(e=!0);var n=_(r,"x","topk");if(n.rank===0)throw new Error("topk() expects the input to be of rank 1 or higher");var a=n.shape[n.shape.length-1];if(t>a)throw new Error("'k' passed to topk() must be <= the last dimension ("+a+") but got "+t);var o=T.runKernelFunc((function(i){return i.topk(n,t,e)}),{$x:n});return{values:o[0],indices:o[1]}}}),Mv=D({scatterND_:function(r,t,e){var n=_(r,"indices","scatterND","int32"),a=_(t,"updates","scatterND");return Uh(a,n,e),T.runKernelFunc((function(o){return o.scatterND(n,a,e)}),{indices:n,updates:a},null,"ScatterNd",{shape:e})}}),jo=D({fft_:function(r){E(r.dtype==="complex64",(function(){return"The dtype for tf.spectral.fft() must be complex64 but got "+r.dtype+"."}));var t=r.shape[r.shape.length-1],e=r.size/t,n=r.as2D(e,t);return T.runKernelFunc((function(a){return a.fft(n)}),{input:r}).reshape(r.shape)}}),ea=D({ifft_:function(r){E(r.dtype==="complex64",(function(){return"The dtype for tf.spectral.ifft() must be complex64 but got "+r.dtype+"."}));var t=r.shape[r.shape.length-1],e=r.size/t,n=r.as2D(e,t);return T.runKernelFunc((function(a){return a.ifft(n)}),{input:r}).reshape(r.shape)}}),qo=D({rfft_:function(r,t){E(r.dtype==="float32",(function(){return"The dtype for rfft() must be real value but got "+r.dtype}));var e,n=r.shape[r.shape.length-1],a=r.size/n;if(t!=null&&t<n){var o=r.shape.map((function(g){return 0})),i=r.shape.map((function(g){return g}));i[r.shape.length-1]=t,e=r.slice(o,i),n=t}else if(t!=null&&t>n){var s=r.shape.map((function(g){return g}));s[r.shape.length-1]=t-n,e=r.concat(Ie(s),r.shape.length-1),n=t}else e=r;var u=e.zerosLike(),c=Ge(e,u).as2D(a,n),l=jo(c),h=Math.floor(n/2)+1,f=dt(l),p=St(l),d=f.split([h,n-h],f.shape.length-1),m=p.split([h,n-h],p.shape.length-1),v=e.shape.slice();return v[e.shape.length-1]=h,Ge(d[0],m[0]).reshape(v)}}),sc=D({irfft_:function(r){var t=r.shape[r.shape.length-1],e=r.size/t;if(t<=2){var n=r.as2D(e,t),a=ea(n);return dt(a)}var o=[e,2*(t-1)],i=dt(r).as2D(e,t),s=St(r).as2D(e,t),u=i.slice([0,1],[e,t-2]).reverse(1),c=s.slice([0,1],[e,t-2]).reverse(1).mul(q(-1)),l=i.concat(u,1),h=s.concat(c,1);return n=Ge(l,h).as2D(o[0],o[1]),a=ea(n),dt(a)}}),Ov=Object.freeze({fft:jo,ifft:ea,rfft:qo,irfft:sc}),Bv=D({sparseToDense_:function(r,t,e,n){n===void 0&&(n=0);var a=_(r,"sparseIndices","sparseToDense","int32"),o=_(t,"sparseValues","sparseToDense"),i=_(n,"defaultValue","sparseToDense",o.dtype);return(function(s,u,c,l){if(s.dtype!=="int32")throw new Error("tf.sparseToDense() expects the indices to be int32 type, but the dtype was "+s.dtype+".");if(s.rank>2)throw new Error("sparseIndices should be a scalar, vector, or matrix, but got shape "+s.shape+".");var h=s.rank>0?s.shape[0]:1,f=s.rank>1?s.shape[1]:1;if(c.length!==f)throw new Error("outputShape has incorrect number of elements:, "+c.length+", should be: "+f+".");var p=u.size;if(u.rank!==0&&(u.rank!==1||p!==h))throw new Error("sparseValues has incorrect shape "+u.shape+", should be [] or ["+h+"]");if(u.dtype!==l.dtype)throw new Error("sparseValues.dtype must match defaultValues.dtype")})(a,o,e,i),T.runKernelFunc((function(s){return s.sparseToDense(a,o,e,i)}),{$sparseIndices:a,$sparseValues:o,$defaultValue:i})}}),Lv=D({gatherND_:function(r,t){var e=_(t,"indices","gatherND","int32"),n=_(r,"x","gatherND");return T.runKernelFunc((function(a){return a.gatherND(n,e)}),{x:n,indices:e},null,"GatherNd")}}),Wv=D({diag_:function(r){var t=_(r,"x","diag").flatten(),e=r.shape.concat(r.shape);return T.runKernelFunc((function(n){return n.diag(t)}),{$x:t}).reshape(e)}}),Uv=D({dropout_:function(r,t,e,n){var a=_(r,"x","dropout");if(E(a.dtype==="float32",(function(){return"x has to be a floating point tensor since it's going to be scaled, but got a "+a.dtype+" tensor instead."})),E(t>=0&&t<1,(function(){return"rate must be a float in the range [0, 1), but got "+t+"."})),t===0)return r instanceof Se?a.clone():a;var o=(function(u,c){if(c==null)return u.shape.slice();if(ze(u.shape,c))return c;if(u.shape.length===c.length){for(var l=[],h=0;h<u.shape.length;h++)c[h]==null&&u.shape[h]!=null?l.push(u.shape[h]):l.push(c[h]);return l}return c})(a,e),i=1-t,s=au(o,0,1,"float32",n).add(i).floor().div(i);return a.mul(s)}});function uc(r,t,e){for(var n=1-r%2,a=new Float32Array(r),o=0;o<r;++o){var i=2*Math.PI*o/(r+n-1);a[o]=t-e*Math.cos(i)}return Fe(a,"float32")}var Ko=D({hannWindow_:function(r){return uc(r,.5,.5)}}),cc=D({hammingWindow_:function(r){return uc(r,.54,.46)}}),Xo=D({frame_:function(r,t,e,n,a){n===void 0&&(n=!1),a===void 0&&(a=0);for(var o=0,i=[];o+t<=r.size;)i.push(Ft(r,o,t)),o+=e;if(n)for(;o<r.size;){var s=o+t-r.size,u=Me([Ft(r,o,t-s),Nt([s],a)]);i.push(u),o+=e}return i.length===0?tn([],[0,t]):Me(i).as2D(i.length,t)}}),lc=D({stft_:function(r,t,e,n,a){var o;a===void 0&&(a=Ko),n==null&&(o=t,n=Math.floor(Math.pow(2,Math.ceil(Math.log(o)/Math.log(2)))));for(var i=Xo(r,t,e),s=Ye(i,a(t)),u=[],c=0;c<i.shape[0];c++)u.push(qo(s.slice([c,0],[1,t]),n));return Me(u)}}),zv=Object.freeze({hannWindow:Ko,hammingWindow:cc,frame:Xo,stft:lc}),$e,Vv=function(r,t,e){return e===void 0&&(e=1),$(this,void 0,void 0,(function(){var n,a,o,i,s,u,c,l,h,f,p,d,m,v;return Y(this,(function(g){switch(g.label){case 0:return n=_(r,"predictions","inTopK"),a=_(t,"targets","inTopK"),E(n.rank>1,(function(){return"inTopK() expects the predictions to be of rank 2 or higher, but got "+n.rank})),E(n.rank-1===a.rank,(function(){return"predictions rank should be 1 larger than targets rank, but got predictions rank "+n.rank+" and targets rank "+a.rank})),Ce(n.shape.slice(0,n.shape.length-1),a.shape,"predictions's shape should be align with the targets' shape, except the last dimension."),o=n.shape[n.shape.length-1],E(e>0&&e<=o,(function(){return"'k' passed to inTopK() must be > 0 && <= the predictions last dimension ("+o+"), but got "+e})),[4,n.data()];case 1:return i=g.sent(),[4,a.data()];case 2:for(s=g.sent(),u=[i.length/o,o],l=u[1],h=nr("bool",c=u[0]),f=0;f<c;f++){for(p=f*l,d=i.subarray(p,p+l),m=[],v=0;v<d.length;v++)m.push({value:d[v],index:v});for(m.sort((function(x,b){return b.value-x.value})),h[f]=0,v=0;v<e;v++)if(m[v].index===s[f]){h[f]=1;break}}return r!==n&&n.dispose(),t!==a&&a.dispose(),[2,je(h,a.shape,"bool")]}}))}))};(function(r){r[r.NONE=0]="NONE",r[r.MEAN=1]="MEAN",r[r.SUM=2]="SUM",r[r.SUM_BY_NONZERO_WEIGHTS=3]="SUM_BY_NONZERO_WEIGHTS"})($e||($e={}));var Gv=D({absoluteDifference_:function(r,t,e,n){n===void 0&&(n=$e.SUM_BY_NONZERO_WEIGHTS);var a=_(r,"labels","absoluteDifference"),o=_(t,"predictions","absoluteDifference"),i=null;e!=null&&(i=_(e,"weights","absoluteDifference")),Ce(a.shape,o.shape,"Error in absoluteDifference: ");var s=a.sub(o).abs();return qt(s,i,n)}}),qt=D({computeWeightedLoss_:function(r,t,e){e===void 0&&(e=$e.SUM_BY_NONZERO_WEIGHTS);var n=_(r,"losses","computeWeightedLoss"),a=null;t!=null&&(a=_(t,"weights","computeWeightedLoss"));var o=a==null?n:n.mul(a);if(e===$e.NONE)return o;if(e===$e.SUM)return o.sum();if(e===$e.MEAN){if(a==null)return o.mean();var i=n.size/a.size,s=o.sum().div(a.sum());return i>1?s.div(q(i)):s}if(e===$e.SUM_BY_NONZERO_WEIGHTS){if(a==null)return o.sum().div(q(n.size));var u=a.mul(Xn(n.shape)).notEqual(q(0)).sum().toFloat();return o.sum().div(u)}throw Error("Unknown reduction: "+e)}}),Hv=D({cosineDistance_:function(r,t,e,n,a){a===void 0&&(a=$e.SUM_BY_NONZERO_WEIGHTS);var o=_(r,"labels","cosineDistance"),i=_(t,"predictions","cosineDistance"),s=null;n!=null&&(s=_(n,"weights","cosineDistance")),Ce(o.shape,i.shape,"Error in cosineDistance: ");var u=q(1).sub(o.mul(i).sum(e,!0));return qt(u,s,a)}}),jv=D({hingeLoss_:function(r,t,e,n){n===void 0&&(n=$e.SUM_BY_NONZERO_WEIGHTS);var a=_(r,"labels","hingeLoss"),o=_(t,"predictions","hingeLoss"),i=null;e!=null&&(i=_(e,"weights","hingeLoss")),Ce(a.shape,o.shape,"Error in hingeLoss: ");var s=q(1);a=q(2).mul(a).sub(s);var u=s.sub(a.mul(o)).relu();return qt(u,i,n)}}),qv=D({huberLoss_:function(r,t,e,n,a){n===void 0&&(n=1),a===void 0&&(a=$e.SUM_BY_NONZERO_WEIGHTS);var o=_(r,"labels","huberLoss"),i=_(t,"predictions","huberLoss"),s=null;e!=null&&(s=_(e,"weights","huberLoss")),Ce(o.shape,i.shape,"Error in huberLoss: ");var u=q(n),c=i.sub(o).abs(),l=Gu(c,u),h=c.sub(l),f=q(.5).mul(l.square()).add(u.mul(h));return qt(f,s,a)}}),Kv=D({logLoss_:function(r,t,e,n,a){n===void 0&&(n=1e-7),a===void 0&&(a=$e.SUM_BY_NONZERO_WEIGHTS);var o=_(r,"labels","logLoss"),i=_(t,"predictions","logLoss"),s=null;e!=null&&(s=_(e,"weights","logLoss")),Ce(o.shape,i.shape,"Error in logLoss: ");var u=q(1),c=q(n),l=o.mul(i.add(c).log()).neg().sub(u.sub(o).mul(u.sub(i).add(c).log()));return qt(l,s,a)}}),Xv=D({meanSquaredError_:function(r,t,e,n){n===void 0&&(n=$e.SUM_BY_NONZERO_WEIGHTS);var a=_(r,"labels","meanSquaredError"),o=_(t,"predictions","meanSquaredError"),i=null;e!=null&&(i=_(e,"weights","meanSquaredError")),Ce(a.shape,o.shape,"Error in meanSquaredError: ");var s=a.squaredDifference(o);return qt(s,i,n)}}),$v=D({sigmoidCrossEntropy_:function(r,t,e,n,a){n===void 0&&(n=0),a===void 0&&(a=$e.SUM_BY_NONZERO_WEIGHTS);var o=_(r,"multiClassLabels","sigmoidCrossEntropy"),i=_(t,"logits","sigmoidCrossEntropy"),s=null;if(e!=null&&(s=_(e,"weights","sigmoidCrossEntropy")),Ce(o.shape,i.shape,"Error in sigmoidCrossEntropy: "),n>0){var u=q(n),c=q(1),l=q(.5);o=o.mul(c.sub(u)).add(l.mul(u))}var h=(function(f,p){var d=_(f,"labels","sigmoidCrossEntropyWithLogits"),m=_(p,"logits","sigmoidCrossEntropyWithLogits");Ce(d.shape,m.shape,"Error in sigmoidCrossEntropyWithLogits: ");var v=m.relu(),g=m.mul(d),x=m.abs().neg().exp().log1p();return v.sub(g).add(x)})(o,i);return qt(h,s,a)}}),Yv=D({softmaxCrossEntropy_:function(r,t,e,n,a){n===void 0&&(n=0),a===void 0&&(a=$e.SUM_BY_NONZERO_WEIGHTS);var o=_(r,"onehotLabels","softmaxCrossEntropy"),i=_(t,"logits","softmaxCrossEntropy"),s=null;if(e!=null&&(s=_(e,"weights","softmaxCrossEntropy")),Ce(o.shape,i.shape,"Error in softmaxCrossEntropy: "),n>0){var u=q(n),c=q(1),l=q(o.shape[1]);o=o.mul(c.sub(u)).add(u.div(l))}var h=(function(f,p,d){if(d===void 0&&(d=-1),d===-1&&(d=p.rank-1),d!==p.rank-1)throw Error("Softmax cross entropy along a non-last dimension is not yet supported. Labels / logits was rank "+p.rank+" and dim was "+d);return ca((function(m,v,g){var x=v.logSumExp([d],!0),b=v.toFloat().sub(x);return g([m,b]),{value:b.mul(m).neg().sum([d]),gradFunc:function(y,w){var C=w[0],S=w[1],I=nt(y.shape,[d]);return[y.reshape(I).mul(C.toFloat().sub(S.exp())),y.reshape(I).mul(S.exp().sub(C.toFloat()))]}}}))(f,p)})(o,i);return qt(h,s,a)}}),Jv=Object.freeze({get Reduction(){return $e},absoluteDifference:Gv,computeWeightedLoss:qt,cosineDistance:Hv,hingeLoss:jv,huberLoss:qv,logLoss:Kv,meanSquaredError:Xv,sigmoidCrossEntropy:$v,softmaxCrossEntropy:Yv});function us(r,t){return t===void 0&&(t=!1),T.tidy((function(){if(r.shape.length!==2)throw new Error("qr2d() requires a 2D Tensor, but got a "+r.shape.length+"D Tensor.");for(var e=r.shape[0],n=r.shape[1],a=ru(e),o=r.clone(),i=tn([[1]],[1,1]),s=i.clone(),u=e>=n?n:e,c=function(h){var f,p=o,d=s,m=a;f=T.tidy((function(){var v=o.slice([h,h],[e-h,1]),g=v.norm(),x=o.slice([h,h],[1,1]),b=tn([[-1]]).where(x.greater(0),tn([[1]])),y=x.sub(b.mul(g)),w=v.div(y);s=w.shape[0]===1?i.clone():i.concat(w.slice([1,0],[w.shape[0]-1,w.shape[1]]),0);var C=b.matMul(y).div(g).neg(),S=o.slice([h,0],[e-h,n]),I=C.mul(s);if(h===0)o=S.sub(I.matMul(s.transpose().matMul(S)));else{var k=S.sub(I.matMul(s.transpose().matMul(S)));o=o.slice([0,0],[h,n]).concat(k,0)}var R=a.slice([0,h],[e,a.shape[1]-h]);if(h===0)a=R.sub(R.matMul(s).matMul(I.transpose()));else{var N=R.sub(R.matMul(s).matMul(I.transpose()));a=a.slice([0,0],[e,h]).concat(N,1)}return[s,o,a]})),s=f[0],o=f[1],a=f[2],tt([p,d,m])},l=0;l<u;++l)c(l);return!t&&e>n&&(a=a.slice([0,0],[e,n]),o=o.slice([0,0],[n,n])),[a,o]}))}var Qv=D({bandPart_:function(r,t,e){if(t%1!=0)throw new Error("bandPart(): numLower must be an integer, got "+t+".");if(e%1!=0)throw new Error("bandPart(): numUpper must be an integer, got "+e+".");var n=_(r,"a","bandPart");if(n.rank<2)throw new Error("bandPart(): Rank must be at least 2, got "+n.rank+".");var a=n.shape,o=n.shape.slice(-2),i=o[0],s=o[1];if(!(t<=i))throw new Error("bandPart(): numLower ("+t+") must not be greater than the number of rows ("+i+").");if(!(e<=s))throw new Error("bandPart(): numUpper ("+e+") must not be greater than the number of columns ("+s+").");t<0&&(t=i),e<0&&(e=s);var u=Hr(0,i,1,"int32").reshape([-1,1]),c=Hr(0,s,1,"int32"),l=Le(u,c),h=ha(l.lessEqual(q(+t,"int32")),l.greaterEqual(q(-e,"int32"))),f=Ie([i,s],n.dtype);return ft(Oe(n.reshape([-1,i,s])).map((function(p){return gn(h,p,f)}))).reshape(a)}}),Zv=D({gramSchmidt_:function(r){var t;if(Array.isArray(r)){t=!1,E(r!=null&&r.length>0,(function(){return"Gram-Schmidt process: input must not be null, undefined, or empty"}));for(var e=r[0].shape[0],n=function(u){E(r[u].shape[0]===e,(function(){return"Gram-Schmidt: Non-unique lengths found in the input vectors: ("+r[u].shape[0]+" vs. "+e+")"}))},a=1;a<r.length;++a)n(a)}else t=!0,r=Ao(r,r.shape[0],0).map((function(u){return iu(u,[0])}));E(r.length<=r[0].shape[0],(function(){return"Gram-Schmidt: Number of vectors ("+r.length+") exceeds number of dimensions ("+r[0].shape[0]+")."}));var o=[],i=r,s=function(u){o.push(T.tidy((function(){var c=i[u];if(u>0)for(var l=0;l<u;++l){var h=nc(o[l].mulStrict(c)).mul(o[l]);c=c.sub(h)}return c.div(ic(c,"euclidean"))})))};for(a=0;a<r.length;++a)s(a);return t?ft(o,0):o}}),em=D({qr_:function(r,t){if(t===void 0&&(t=!1),r.rank<2)throw new Error("qr() requires input tensor to have a rank >= 2, but got rank "+r.rank);if(r.rank===2)return us(r,t);var e=r.shape.slice(0,r.shape.length-2).reduce((function(i,s){return i*s})),n=Oe(r.reshape([e,r.shape[r.shape.length-2],r.shape[r.shape.length-1]]),0),a=[],o=[];return n.forEach((function(i){var s=us(i,t),u=s[0],c=s[1];a.push(u),o.push(c)})),[ft(a,0).reshape(r.shape),ft(o,0).reshape(r.shape)]}}),tm=Object.freeze({bandPart:Qv,gramSchmidt:Zv,qr:em});function va(r,t,e,n,a,o){n==null&&(n=.5),a==null&&(a=Number.NEGATIVE_INFINITY),o==null&&(o=0);var i=r.shape[0];return e=Math.min(e,i),E(0<=n&&n<=1,(function(){return"iouThreshold must be in [0, 1], but was '"+n+"'"})),E(r.rank===2,(function(){return"boxes must be a 2D tensor, but was of rank '"+r.rank+"'"})),E(r.shape[1]===4,(function(){return"boxes must have 4 columns, but 2nd dimension was "+r.shape[1]})),E(t.rank===1,(function(){return"scores must be a 1D tensor"})),E(t.shape[0]===i,(function(){return"scores has incompatible shape with boxes. Expected "+i+", but was "+t.shape[0]})),E(0<=o&&o<=1,(function(){return"softNmsSigma must be in [0, 1], but was '"+o+"'"})),{maxOutputSize:e,iouThreshold:n,scoreThreshold:a,softNmsSigma:o}}var nm=D({resizeBilinear_:function(r,t,e){e===void 0&&(e=!1);var n=_(r,"images","resizeBilinear");E(n.rank===3||n.rank===4,(function(){return"Error in resizeBilinear: x must be rank 3 or 4, but got rank "+n.rank+"."})),E(t.length===2,(function(){return"Error in resizeBilinear: new shape must 2D, but got shape "+t+"."}));var a=n,o=!1;n.rank===3&&(o=!0,a=n.as4D(1,n.shape[0],n.shape[1],n.shape[2]));var i=t[0],s=t[1],u=T.runKernelFunc((function(c,l){return l([a]),c.resizeBilinear(a,i,s,e)}),{x:a},(function(c,l){return{x:function(){return T.runKernelFunc((function(h){return h.resizeBilinearBackprop(c,l[0],e)}),{})}}}),"ResizeBilinear",{alignCorners:e,newHeight:i,newWidth:s});return o?u.as3D(u.shape[1],u.shape[2],u.shape[3]):u}}),rm=D({resizeNearestNeighbor_:function(r,t,e){e===void 0&&(e=!1);var n=_(r,"images","resizeNearestNeighbor");E(n.rank===3||n.rank===4,(function(){return"Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank "+n.rank+"."})),E(t.length===2,(function(){return"Error in resizeNearestNeighbor: new shape must 2D, but got shape "+t+"."})),E(n.dtype==="float32"||n.dtype==="int32",(function(){return"`images` must have `int32` or `float32` as dtype"}));var a=n,o=!1;n.rank===3&&(o=!0,a=n.as4D(1,n.shape[0],n.shape[1],n.shape[2]));var i=t[0],s=t[1],u=T.runKernelFunc((function(c,l){return l([a]),c.resizeNearestNeighbor(a,i,s,e)}),{batchImages:a},(function(c,l){return{batchImages:function(){return T.runKernelFunc((function(h){return h.resizeNearestNeighborBackprop(c,l[0],e)}),{})}}}));return o?u.as3D(u.shape[1],u.shape[2],u.shape[3]):u}}),am=D({nonMaxSuppression_:function(r,t,e,n,a){n===void 0&&(n=.5),a===void 0&&(a=Number.NEGATIVE_INFINITY);var o=_(r,"boxes","nonMaxSuppression"),i=_(t,"scores","nonMaxSuppression"),s=va(o,i,e,n,a);e=s.maxOutputSize,n=s.iouThreshold,a=s.scoreThreshold;var u={maxOutputSize:e,iouThreshold:n,scoreThreshold:a};return T.runKernelFunc((function(c){return c.nonMaxSuppression(o,i,e,n,a)}),{boxes:o,scores:i},null,"NonMaxSuppressionV3",u)}}),om=function(r,t,e,n,a){return n===void 0&&(n=.5),a===void 0&&(a=Number.NEGATIVE_INFINITY),$(this,void 0,void 0,(function(){var o,i,s,u,c,l,h;return Y(this,(function(f){switch(f.label){case 0:return o=_(r,"boxes","nonMaxSuppressionAsync"),i=_(t,"scores","nonMaxSuppressionAsync"),s=va(o,i,e,n,a),e=s.maxOutputSize,n=s.iouThreshold,a=s.scoreThreshold,[4,Promise.all([o.data(),i.data()])];case 1:return u=f.sent(),c=u[0],l=u[1],h=Po(c,l,e,n,a),o!==r&&o.dispose(),i!==t&&i.dispose(),[2,h]}}))}))},im=D({nonMaxSuppressionWithScore_:function(r,t,e,n,a,o){n===void 0&&(n=.5),a===void 0&&(a=Number.NEGATIVE_INFINITY),o===void 0&&(o=0);var i=_(r,"boxes","nonMaxSuppression"),s=_(t,"scores","nonMaxSuppression"),u=va(i,s,e,n,a,o),c={maxOutputSize:e=u.maxOutputSize,iouThreshold:n=u.iouThreshold,scoreThreshold:a=u.scoreThreshold,softNmsSigma:o=u.softNmsSigma},l=T.runKernel("NonMaxSuppressionV5",{boxes:i,scores:s},c);return{selectedIndices:l[0],selectedScores:l[1]}}}),sm=function(r,t,e,n,a,o){return n===void 0&&(n=.5),a===void 0&&(a=Number.NEGATIVE_INFINITY),o===void 0&&(o=0),$(this,void 0,void 0,(function(){var i,s,u,c,l,h,f;return Y(this,(function(p){switch(p.label){case 0:return i=_(r,"boxes","nonMaxSuppressionAsync"),s=_(t,"scores","nonMaxSuppressionAsync"),u=va(i,s,e,n,a,o),e=u.maxOutputSize,n=u.iouThreshold,a=u.scoreThreshold,o=u.softNmsSigma,[4,Promise.all([i.data(),s.data()])];case 1:return c=p.sent(),l=c[0],h=c[1],f=Mo(l,h,e,n,a,o),i!==r&&i.dispose(),s!==t&&s.dispose(),[2,f]}}))}))},um=D({cropAndResize_:function(r,t,e,n,a,o){var i=_(r,"image","cropAndResize"),s=_(t,"boxes","cropAndResize","float32"),u=_(e,"boxInd","cropAndResize","int32");a=a||"bilinear",o=o||0;var c=s.shape[0];return E(i.rank===4,(function(){return"Error in cropAndResize: image must be rank 4,but got rank "+i.rank+"."})),E(s.rank===2&&s.shape[1]===4,(function(){return"Error in cropAndResize: boxes must be have size ["+c+",4] but had shape "+s.shape+"."})),E(u.rank===1&&u.shape[0]===c,(function(){return"Error in cropAndResize: boxInd must be have size ["+c+"] but had shape "+s.shape+"."})),E(n.length===2,(function(){return"Error in cropAndResize: cropSize must be of length 2, but got length "+n.length+"."})),E(n[0]>=1&&n[1]>=1,(function(){return"cropSize must be atleast [1,1], but was "+n})),E(a==="bilinear"||a==="nearest",(function(){return"method must be bilinear or nearest, but was "+a})),T.runKernelFunc((function(l,h){return l.cropAndResize(i,s,u,n,a,o)}),{images:i,boxes:s,boxInd:u},null,"CropAndResize",{method:a,extrapolationValue:o,cropSize:n})}}),$o=Object.freeze({resizeBilinear:nm,resizeNearestNeighbor:rm,nonMaxSuppression:am,nonMaxSuppressionAsync:om,nonMaxSuppressionWithScore:im,nonMaxSuppressionWithScoreAsync:sm,cropAndResize:um}),Yo=function(r,t){return!(r>0)||t==="linear"},Jo=function(r,t,e){if(e==null||e==="linear")return r;if(e==="relu")return r.mul(t.step());throw new Error("Gradient for activation "+e+" has not been implemented yet.")},Qo=function(r,t){var e=t,n=Be(r.shape,t.shape);return n.length>0&&(e=e.sum(n)),e.reshape(r.shape)},Zo=function(r,t,e){if(t==="linear")return r;if(t==="relu")return De(r);if(t==="elu")return rc(r);if(t==="relu6")return oc(r);if(t==="prelu")return ac(r,e);throw new Error("Unknown fused activation "+t+".")},cm=D({fusedMatMul_:function(r){var t,e=r.a,n=r.b,a=r.transposeA,o=a!==void 0&&a,i=r.transposeB,s=i!==void 0&&i,u=r.bias,c=r.activation,l=c===void 0?"linear":c,h=r.preluActivationWeights;if(Yo(T.state.gradientDepth,l)===!1){var f=pa(e,n,o,s);return u!=null&&(f=de(f,u)),Zo(f,l,h)}var p=_(e,"a","fused matMul"),d=_(n,"b","fused matMul");t=Ae(p,d),p=t[0],d=t[1];var m=o?p.shape[p.rank-2]:p.shape[p.rank-1],v=s?d.shape[d.rank-1]:d.shape[d.rank-2],g=o?p.shape[p.rank-1]:p.shape[p.rank-2],x=s?d.shape[d.rank-2]:d.shape[d.rank-1],b=p.shape.slice(0,-2),y=d.shape.slice(0,-2),w=Q(b),C=Q(y);E(p.rank>=2&&d.rank>=2&&p.rank===d.rank,(function(){return"Error in fused matMul: inputs must have the same rank of at least 2, got ranks "+p.rank+" and "+d.rank+"."})),E(ze(b,y),(function(){return"Error in fused matMul: outer dimensions ("+b+") and ("+y+") of Tensors with shapes "+p.shape+" and "+d.shape+" must match."})),E(m===v,(function(){return"Error in fused matMul: inner shapes ("+m+") and ("+v+") of Tensors with shapes "+p.shape+" and "+d.shape+" and transposeA="+o+" and transposeB="+s+" must match."}));var S,I,k=p.shape.slice(0,-2).concat([g,x]),R=o?p.as3D(w,m,g):p.as3D(w,g,m),N=s?d.as3D(C,x,v):d.as3D(C,v,x);u!=null&&me(k,(S=Ae(S=_(u,"bias","fused matMul"),p)[0]).shape),h!=null&&(I=_(h,"prelu weights","fused matMul"));var A={a:R,b:N};u!=null&&(A.bias=S),h!=null&&(A.preluActivationWeights=I);var L=[R,N];return T.runKernelFunc((function(M,O){var V=M.fusedBatchMatMul({a:R,b:N,transposeA:o,transposeB:s,bias:S,activation:l,preluActivationWeights:I});return O([R,N,V]),V}),A,(function(M,O){var V=O[0],U=O[1],W=O[2],z=Jo(M,W,l),H={};return u!=null&&(H={bias:function(){return Qo(S,z)}}),Object.assign(o||s?!o&&s?{a:function(){return z.matMul(U,!1,!1)},b:function(){return z.matMul(V,!0,!1)}}:o&&!s?{a:function(){return U.matMul(z,!1,!0)},b:function(){return V.matMul(z,!1,!1)}}:{a:function(){return U.matMul(z,!0,!0)},b:function(){return z.matMul(V,!0,!0)}}:{a:function(){return z.matMul(U,!1,!0)},b:function(){return V.matMul(z,!0,!1)}},H)}),"_FusedMatMul",{transposeA:o,transposeB:s,activation:l},L,[!0]).reshape(k)}}),lm=D({fusedConv2d_:function(r){var t=r.x,e=r.filter,n=r.strides,a=r.pad,o=r.dataFormat,i=o===void 0?"NHWC":o,s=r.dilations,u=s===void 0?[1,1]:s,c=r.dimRoundingMode,l=r.bias,h=r.activation,f=h===void 0?"linear":h,p=r.preluActivationWeights;if(f=f||"linear",Yo(T.state.gradientDepth,f)===!1){var d=mt(t,e,n,a,i,u,c);return l!=null&&(d=de(d,l)),Zo(d,f,p)}var m=_(t,"x","conv2d"),v=_(e,"filter","conv2d"),g=m,x=!1;m.rank===3&&(x=!0,g=m.as4D(1,m.shape[0],m.shape[1],m.shape[2])),E(g.rank===4,(function(){return"Error in fused conv2d: input must be rank 4, but got rank "+g.rank+"."})),E(v.rank===4,(function(){return"Error in fused conv2d: filter must be rank 4, but got rank "+v.rank+"."})),c!=null&&E(Ne(a),(function(){return"Error in fused conv2d: pad must be an integer when using, dimRoundingMode "+c+" but got pad "+a+"."})),E(g.shape[3]===v.shape[2],(function(){return"Error in conv2d: depth of input ("+g.shape[3]+") must match input depth for filter "+v.shape[2]+"."})),E(rt(n,u),(function(){return"Error in conv2D: Either strides or dilations must be 1. Got strides "+n+" and dilations '"+u+"'"})),E(i==="NHWC",(function(){return"Error in conv2d: got dataFormat of "+i+" but only NHWC is currently supported."}));var b,y,w=wn(g.shape,v.shape,n,u,a,c);l!=null&&(b=Ae(b=_(l,"bias","fused conv2d"),m)[0],me(w.outShape,b.shape)),p!=null&&(y=_(p,"prelu weights","fused conv2d"));var C={x:g,filter:v};l!=null&&(C.bias=b),p!=null&&(C.preluActivationWeights=y);var S=[v,g],I=T.runKernelFunc((function(k,R){var N=k.fusedConv2d({input:g,filter:v,convInfo:w,bias:b,activation:f,preluActivationWeights:y});return R([v,g,N]),N}),C,(function(k,R){var N=R,A=N[0],L=N[1],M=N[2],O=Jo(k,M,f);E(qn(u),(function(){return"Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '"+u+"'"}));var V={};return l!=null&&(V={bias:function(){return Qo(b,O)}}),Object.assign({x:function(){return $u(L.shape,O,A,n,a)},filter:function(){return Go(L,O,A.shape,n,a)}},V)}),"FusedConv2D",{convInfo:w,activation:f},S,[!0]);return x?I.as3D(I.shape[1],I.shape[2],I.shape[3]):I}}),hm=D({fusedDepthwiseConv2d_:function(r){var t=r.x,e=r.filter,n=r.strides,a=r.pad,o=r.dataFormat,i=o===void 0?"NHWC":o,s=r.dilations,u=s===void 0?[1,1]:s,c=r.dimRoundingMode,l=r.bias,h=r.activation,f=h===void 0?"linear":h,p=r.preluActivationWeights;if(Yo(T.state.gradientDepth,f)===!1){var d=fa(t,e,n,a,i,u,c);return l!=null&&(d=de(d,l)),Zo(d,f,p)}var m=_(t,"x","depthwiseConv2d"),v=_(e,"filter","depthwiseConv2d"),g=m,x=!1;m.rank===3&&(x=!0,g=m.as4D(1,m.shape[0],m.shape[1],m.shape[2])),E(g.rank===4,(function(){return"Error in fused depthwiseConv2d: input must be rank 4, but got rank "+g.rank+"."})),E(v.rank===4,(function(){return"Error in fused depthwiseConv2d: filter must be rank 4, but got rank "+v.rank+"."})),E(g.shape[3]===v.shape[2],(function(){return"Error in fused depthwiseConv2d: number of input channels ("+g.shape[3]+") must match the inChannels dimension in filter "+v.shape[2]+"."})),u==null&&(u=[1,1]),E(rt(n,u),(function(){return"Error in fused depthwiseConv2d: Either strides or dilations must be 1. Got strides "+n+" and dilations '"+u+"'"})),c!=null&&E(Ne(a),(function(){return"Error in fused depthwiseConv2d: pad must be an integer when using dimRoundingMode "+c+" but got pad "+a+"."}));var b,y,w=wn(g.shape,v.shape,n,u,a,c,!0);l!=null&&(b=Ae(b=_(l,"bias","fused conv2d"),m)[0],me(w.outShape,b.shape)),p!=null&&(y=_(p,"prelu weights","fused depthwiseConv2d"));var C={x:g,filter:v};l!=null&&(C.bias=b),p!=null&&(C.preluActivationWeights=y);var S=[v,g],I=T.runKernelFunc((function(k,R){var N=k.fusedDepthwiseConv2D({input:g,filter:v,convInfo:w,bias:b,activation:f,preluActivationWeights:y});return R([v,g,N]),N}),C,(function(k,R){E(qn(u),(function(){return"Error in gradient of fused depthwiseConv2d: dilation rates greater than 1 are not yet supported. Got dilations '"+u+"'"}));var N=R[0],A=R[1],L=R[2],M=Jo(k,L,f),O={};return l!=null&&(O={bias:function(){return Qo(b,M)}}),Object.assign({x:function(){return Yu(A.shape,M,N,w)},filter:function(){return Ju(A,M,N.shape,w)}},O)}),"FusedDepthwiseConv2D",{convInfo:w,activation:f},S,[!0]);return x?I.as3D(I.shape[1],I.shape[2],I.shape[3]):I}}),fm=Object.freeze({matMul:cm,conv2d:lm,depthwiseConv2d:hm}),pm=Object.freeze({image:$o,linalg:tm,losses:Jv,spectral:Ov,fused:fm,signal:zv,square:Kp,squaredDifference:Fu,conv1d:nv,conv2d:mt,conv3d:rv,depthwiseConv2d:fa,separableConv2d:Ho,conv2dTranspose:av,conv3dTranspose:ov,op:D,batchNormalization2d:_d,batchNormalization3d:Ed,batchNormalization4d:kd,batchNormalization:Rd,batchNorm:Wu,batchNorm2d:Id,batchNorm3d:Sd,batchNorm4d:Dd,booleanMaskAsync:tv,complex:Ge,real:dt,imag:St,concat:Me,concat1d:hh,concat2d:fh,concat3d:ph,concat4d:dh,split:Ao,matMul:pa,dot:iv,outerProduct:sv,reverse:dr,reverse1d:uv,reverse2d:cv,reverse3d:lv,reverse4d:hv,maxPool:Ue,avgPool:vr,pool:fv,maxPool3d:pv,avgPool3d:dv,slice:Ft,slice1d:vv,slice2d:mv,slice3d:ec,slice4d:gv,abs:Xp,acos:$p,acosh:Yp,asin:Jp,asinh:Qp,atan:Zp,atanh:ed,ceil:td,clipByValue:Uo,cos:nd,cosh:rd,erf:ad,exp:go,expm1:od,floor:id,log:sd,log1p:ud,logSigmoid:cd,neg:Qr,reciprocal:ld,round:hd,rsqrt:Pu,sigmoid:Mu,sign:fd,isNaN:pd,isInf:dd,isFinite:vd,sin:md,sinh:gd,softplus:yd,sqrt:xd,step:bd,tan:wd,tanh:Cd,all:yv,any:xv,argMax:bv,argMin:wv,logSumExp:Cv,max:da,mean:_v,min:Ev,moments:kv,sum:nc,prod:Rv,equal:Hu,equalStrict:jd,greater:qd,greaterEqual:ju,greaterEqualStrict:Kd,greaterStrict:Xd,less:$d,lessEqual:Yd,lessEqualStrict:Jd,lessStrict:Qd,notEqual:Zd,notEqualStrict:ev,add:de,addN:Nd,addStrict:Fd,atan2:Pd,div:gt,divNoNan:Md,divStrict:Od,floorDiv:Vu,maximum:zo,maximumStrict:Bd,minimum:Gu,minimumStrict:Ld,mod:Wd,modStrict:Ud,mul:Ye,mulStrict:zd,pow:Zr,powStrict:Vd,squaredDifferenceStrict:Gd,sub:Le,subStrict:Hd,elu:rc,leakyRelu:Iv,prelu:ac,relu:De,relu6:oc,selu:Sv,logicalAnd:ha,logicalNot:Ad,logicalOr:Uu,logicalXor:Td,where:gn,whereAsync:zu,buffer:ce,print:_h,batchToSpaceND:nu,broadcastTo:Eh,cast:kh,clone:Rh,cumsum:Ih,depthToSpace:Sh,expandDims:pt,eye:ru,multinomial:Dh,oneHot:fo,pad:bn,pad1d:Ah,pad2d:Th,pad3d:Nh,pad4d:Fh,rand:Ph,randomNormal:Mh,randomGamma:Oh,randomUniform:au,reshape:yt,spaceToBatchND:ou,squeeze:iu,stack:ft,tile:On,truncatedNormal:Bh,unstack:Oe,setdiff1dAsync:Lh,fill:Nt,linspace:lh,ones:Xn,range:Hr,scalar:q,tensor:je,tensor1d:Fe,tensor2d:tn,tensor3d:Do,tensor4d:Ze,tensor5d:sh,tensor6d:uh,variable:ch,zeros:Ie,onesLike:tu,zerosLike:xe,transpose:an,softmax:jt,logSoftmax:jh,localResponseNormalization:Dv,norm:ic,gather:Vo,unsortedSegmentSum:qu,basicLSTMCell:Av,multiRNNCell:Tv,movingAverage:Nv,stridedSlice:Fv,topk:Pv,scatterND:Mv,fft:jo,ifft:ea,rfft:qo,irfft:sc,sparseToDense:Bv,gatherND:Lv,diag:Wv,dropout:Uv,hannWindow:Ko,hammingWindow:cc,frame:Xo,stft:lc,inTopKAsync:Vv});function G(r,t){Array.isArray(r)||(r=[r]),r.forEach((function(e){e!=null&&E(e.dtype!=="complex64",(function(){return t+" does not support complex64 tensors."}))}))}function Ha(r,t,e,n){if(e==="linear")return r.linear(t);if(e==="relu")return r.relu(t);if(e==="elu")return r.elu(t);if(e==="relu6")return r.relu6(t);if(e==="prelu")return r.prelu(t,n);throw new Error("Activation "+e+" has not been implemented for the CPU backend.")}var dm=(function(r){function t(){var e=r.call(this)||this;return e.blockSize=48,e.firstUse=!0,e.data=new pu(e,T),e}return bt(t,r),t.prototype.write=function(e,n,a){this.firstUse&&(this.firstUse=!1,B().get("IS_NODE")&&Vr(`
============================
Hi there 👋. Looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, which binds to TensorFlow C++, by running npm i @tensorflow/tfjs-node, or npm i @tensorflow/tfjs-node-gpu if you have CUDA. Then call require('@tensorflow/tfjs-node'); (-gpu suffix for CUDA) at the start of your program. Visit https://github.com/tensorflow/tfjs-node for more details.
============================`));var o={};return this.data.set(o,{values:e,dtype:a}),o},t.prototype.move=function(e,n,a,o){this.data.set(e,{values:n,dtype:o})},t.prototype.numDataIds=function(){return this.data.numDataIds()},t.prototype.read=function(e){return $(this,void 0,void 0,(function(){return Y(this,(function(n){return[2,this.readSync(e)]}))}))},t.prototype.readSync=function(e){var n=this.data.get(e),a=n.dtype,o=n.complexTensors;return a==="complex64"?mo(this.readSync(o.real.dataId),this.readSync(o.imag.dataId)):this.data.get(e).values},t.prototype.bufferSync=function(e){var n=this.readSync(e.dataId),a=n;if(e.dtype==="string")try{a=n.map((function(o){return Wr(o)}))}catch{throw new Error("Failed to decode encoded string bytes into utf-8")}return ce(e.shape,e.dtype,a)},t.prototype.makeOutput=function(e,n,a){var o=this.write(e,n,a);return T.makeTensorFromDataId(o,n,a,this)},t.prototype.disposeData=function(e){if(this.data.has(e)){var n=this.data.get(e).complexTensors;n!=null&&(n.real.dispose(),n.imag.dispose()),this.data.delete(e)}},t.prototype.time=function(e){return $(this,void 0,void 0,(function(){var n;return Y(this,(function(a){return n=Rt(),e(),[2,{kernelMs:Rt()-n}]}))}))},t.prototype.memory=function(){return{unreliable:!0,reasons:["The reported memory is an upper bound. Due to automatic garbage collection, the true allocated memory may be less."]}},t.prototype.complex=function(e,n){var a=this.makeOutput(null,e.shape,"complex64");return this.data.get(a.dataId).complexTensors={real:T.keep(e.clone()),imag:T.keep(n.clone())},a},t.prototype.real=function(e){return this.data.get(e.dataId).complexTensors.real.clone()},t.prototype.imag=function(e){return this.data.get(e.dataId).complexTensors.imag.clone()},t.prototype.slice=function(e,n,a){if(G(e,"slice"),hu(e.shape,n,a)){var o=fu(n,e.strides),i=Q(a);return je(this.readSync(e.dataId).subarray(o,o+i),a,e.dtype)}for(var s=ce(a,e.dtype),u=this.bufferSync(e),c=0;c<s.size;++c){var l=s.indexToLoc(c).map((function(h,f){return h+n[f]}));s.values[c]=u.get.apply(u,l)}return s.toTensor()},t.prototype.stridedSlice=function(e,n,a,o){G(e,"stridedSlice");var i=No(n,a,o);if(i.some((function(p){return p===0})))return je([],i);for(var s=ce(i,e.dtype),u=this.bufferSync(e),c=0;c<s.size;c++){for(var l=s.indexToLoc(c),h=new Array(l.length),f=0;f<h.length;f++)h[f]=l[f]*o[f]+n[f];s.set.apply(s,[u.get.apply(u,h)].concat(l))}return s.toTensor()},t.prototype.diag=function(e){for(var n=this.readSync(e.dataId),a=ce([e.size,e.size],e.dtype),o=a.values,i=0;i<n.length;i++)o[i*e.size+i]=n[i];return a.toTensor()},t.prototype.unstack=function(e,n){for(var a=e.shape[n],o=new Array(e.rank-1),i=0,s=0;s<e.rank;s++)s!==n&&(o[i++]=e.shape[s]);var u=new Array(e.rank).fill(0),c=e.shape.slice();c[n]=1;var l=new Array(a);for(s=0;s<l.length;s++)u[n]=s,l[s]=this.slice(e,u,c).reshape(o);return l},t.prototype.reverse=function(e,n){G(e,"reverse");for(var a=ce(e.shape,e.dtype),o=this.bufferSync(e),i=function(u){var c=a.indexToLoc(u),l=c.slice();n.forEach((function(h){return l[h]=e.shape[h]-1-l[h]})),a.set.apply(a,[o.get.apply(o,l)].concat(c))},s=0;s<a.size;s++)i(s);return a.toTensor()},t.prototype.concat=function(e,n){var a=this;if(e[0].dtype==="complex64"){var o=e.map((function(p){return dt(p)})),i=e.map((function(p){return St(p)}));return Ge(this.concat(o,n),this.concat(i,n))}var s=e.map((function(p){var d=Q(p.shape.slice(n));return p.as2D(-1,d)})),u=jn(s.map((function(p){return p.shape})),1),c=ce(u,e[0].dtype).values;if(s[0].shape[0]===1){var l=0;s.forEach((function(p){c.set(a.readSync(p.dataId),l),l+=p.size}))}else{var h=0;s.forEach((function(p){for(var d=a.readSync(p.dataId),m=0,v=0;v<p.shape[0];++v)for(var g=v*u[1]+h,x=0;x<p.shape[1];++x)c[g+x]=d[m++];h+=p.shape[1]}))}var f=jn(e.map((function(p){return p.shape})),n);return je(c,f,e[0].dtype)},t.prototype.neg=function(e){return G(e,"neg"),this.multiply(q(-1),e)},t.prototype.add=function(e,n){return e.dtype==="complex64"||n.dtype==="complex64"?this.broadcastedBinaryComplexOp(e.cast("complex64"),n.cast("complex64"),(function(a,o,i,s){return{real:a+i,imag:o+s}})):this.broadcastedBinaryOp(e,n,He(e.dtype,n.dtype),(function(a,o){return a+o}))},t.prototype.addN=function(e){var n=this;G(e,"addN");for(var a=e.map((function(l){return n.readSync(l.dataId)})),o=ce(e[0].shape,e[0].dtype),i=o.values,s=0;s<e.length;s++)for(var u=a[s],c=0;c<i.length;c++)i[c]+=u[c];return o.toTensor()},t.prototype.softmax=function(e,n){var a=We([n],e.shape),o=this.max(e,a),i=nt(o.shape,a),s=this.subtract(e,o.reshape(i)),u=this.exp(s),c=this.sum(u,a).reshape(i);return this.realDivide(u,c)},t.prototype.subtract=function(e,n){return e.dtype==="complex64"||n.dtype==="complex64"?this.broadcastedBinaryComplexOp(e.cast("complex64"),n.cast("complex64"),(function(a,o,i,s){return{real:a-i,imag:o-s}})):this.broadcastedBinaryOp(e,n,He(e.dtype,n.dtype),(function(a,o){return a-o}))},t.prototype.pow=function(e,n){return G([e,n],"pow"),this.broadcastedBinaryOp(e,n,e.dtype,(function(a,o){return Math.pow(a,o)}))},t.prototype.batchMatMul=function(e,n,a,o){G([e,n],"matMul");for(var i=a?e.shape[1]:e.shape[2],s=a?e.shape[2]:e.shape[1],u=o?n.shape[1]:n.shape[2],c=e.shape[0],l=this.readSync(e.dataId),h=this.readSync(n.dataId),f=a?[e.strides[0],1,e.strides[1]]:[e.strides[0],e.strides[1],1],p=f[0],d=f[1],m=f[2],v=o?[1,n.strides[1],n.strides[0]]:[n.strides[1],1,n.strides[0]],g=v[0],x=v[1],b=v[2],y=s*u,w=ce([c,s,u],e.dtype),C=w.values,S=this.blockSize,I=0;I<c;I++)for(var k=0;k<s;k+=S)for(var R=0;R<u;R+=S)for(var N=0;N<i;N+=S)for(var A=Math.min(k+S,s),L=Math.min(R+S,u),M=Math.min(N+S,i),O=k;O<A;O++)for(var V=R;V<L;V++){for(var U=0,W=N;W<M;W++)U+=l[I*p+O*d+W*m]*h[W*g+V*x+I*b];C[I*y+(O*u+V)]+=U}return w.toTensor()},t.prototype.fusedBatchMatMul=function(e){var n=e.a,a=e.b,o=e.transposeA,i=e.transposeB,s=e.bias,u=e.activation,c=e.preluActivationWeights,l=this.batchMatMul(n,a,o,i);return s&&(l=this.add(l,s)),u&&(l=Ha(this,l,u,c)),l},t.prototype.multiply=function(e,n){return e.dtype==="complex64"||n.dtype==="complex64"?this.broadcastedBinaryComplexOp(e.cast("complex64"),n.cast("complex64"),(function(a,o,i,s){return{real:a*i-o*s,imag:a*s+o*i}})):this.broadcastedBinaryOp(e,n,He(e.dtype,n.dtype),(function(a,o){return a*o}))},t.prototype.realDivide=function(e,n){return G([e,n],"realDivide"),this.broadcastedBinaryOp(e,n,"float32",(function(a,o){return a/o}))},t.prototype.floorDiv=function(e,n){return G([e,n],"floorDiv"),this.broadcastedBinaryOp(e,n,"int32",(function(a,o){return Math.floor(a/o)}))},t.prototype.sum=function(e,n){G(e,"sum"),st("sum",n,e.rank);for(var a=qe(e.shape,n),o=a[0],i=a[1],s=Ie(o,He(e.dtype,"int32")),u=Q(i),c=this.readSync(s.dataId),l=this.readSync(e.dataId),h=0;h<c.length;++h){for(var f=h*u,p=0,d=0;d<u;++d)p+=l[f+d];c[h]=p}return s},t.prototype.prod=function(e,n){G(e,"sum");for(var a=qe(e.shape,n),o=a[0],i=a[1],s=Ie(o,He(e.dtype,"int32")),u=Q(i),c=this.readSync(s.dataId),l=this.readSync(e.dataId),h=0;h<c.length;++h){for(var f=h*u,p=1,d=0;d<u;++d)p*=l[f+d];c[h]=p}return s},t.prototype.unsortedSegmentSum=function(e,n,a){G(e,"unsortedSegmentSum");for(var o=[],i=e.rank-n.rank,s=0;s<i;++s)n=n.expandDims(s+1);for(s=0;s<a;++s){var u=q(s,"int32"),c=Hu(u,n).asType("float32").mul(e).sum(0);o.push(c)}return ft(o)},t.prototype.argMin=function(e,n){G(e,"argMin");var a=[n];st("argMin",a,e.rank);for(var o=qe(e.shape,a),i=o[0],s=o[1],u=Ie(i,"int32"),c=Q(s),l=this.readSync(u.dataId),h=this.readSync(e.dataId),f=0;f<l.length;++f){for(var p=f*c,d=h[p],m=0,v=0;v<c;++v){var g=h[p+v];g<d&&(d=g,m=v)}l[f]=m}return u},t.prototype.argMax=function(e,n){G(e,"argMax");var a=[n];st("argMax",a,e.rank);for(var o=qe(e.shape,a),i=o[0],s=o[1],u=Ie(i,"int32"),c=Q(s),l=this.readSync(u.dataId),h=this.readSync(e.dataId),f=0;f<l.length;++f){for(var p=f*c,d=h[p],m=0,v=0;v<c;++v){var g=h[p+v];g>d&&(d=g,m=v)}l[f]=m}return u},t.prototype.cumsum=function(e,n,a,o){if(G(e,"cumsum"),n!==e.rank-1)throw new Error("backend.cumsum in CPU expects an inner-most axis="+(e.rank-1)+" but got axis="+n);for(var i=He(e.dtype,"int32"),s=Ie(e.shape,i),u=this.readSync(s.dataId),c=this.readSync(e.dataId),l=e.shape[e.rank-1],h=o?function(v,g){return v+l-g-1}:function(v,g){return v+g},f=0;f<c.length;f+=l)for(var p=0;p<l;p++){var d=h(f,p);if(p===0)u[d]=a?0:c[d];else{var m=h(f,p-1);u[d]=a?c[m]+u[m]:c[d]+u[m]}}return s},t.prototype.equal=function(e,n){return G([e,n],"equal"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a===o?1:0}))},t.prototype.notEqual=function(e,n){return G([e,n],"notEqual"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a!==o?1:0}))},t.prototype.less=function(e,n){return G([e,n],"less"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a<o?1:0}))},t.prototype.lessEqual=function(e,n){return G([e,n],"lessEqual"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a<=o?1:0}))},t.prototype.greater=function(e,n){return G([e,n],"greater"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a>o?1:0}))},t.prototype.greaterEqual=function(e,n){return G([e,n],"greaterEqual"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a>=o?1:0}))},t.prototype.logicalNot=function(e){G(e,"logicalNot");for(var n=this.readSync(e.dataId),a=new Uint8Array(n.length),o=0;o<n.length;++o)a[o]=n[o]?0:1;return this.makeOutput(a,e.shape,"bool")},t.prototype.logicalAnd=function(e,n){return G([e,n],"logicalAnd"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a&&o}))},t.prototype.logicalOr=function(e,n){return G([e,n],"logicalOr"),this.broadcastedBinaryOp(e,n,"bool",(function(a,o){return a||o}))},t.prototype.select=function(e,n,a){G([e,n,a],"select");for(var o=this.readSync(e.dataId),i=this.readSync(n.dataId),s=this.readSync(a.dataId),u=Ie(n.shape,He(n.dtype,a.dtype)),c=this.readSync(u.dataId),l=0,h=e.rank===0||e.rank>1||n.rank===1?1:Q(n.shape.slice(1)),f=0;f<o.length;f++)for(var p=0;p<h;p++)o[f]===1?c[l++]=i[f]:c[l++]=s[f];return u},t.prototype.where=function(e){G([e],"where");var n=this.readSync(e.dataId);return Oo(e.shape,n)},t.prototype.topk=function(e,n,a){return G(e,"topk"),wu(this.readSync(e.dataId),e.shape,e.dtype,n)},t.prototype.min=function(e,n){G(e,"min"),st("min",n,e.rank);for(var a=qe(e.shape,n),o=a[0],i=a[1],s=Ie(o,e.dtype),u=Q(i),c=this.readSync(s.dataId),l=this.readSync(e.dataId),h=0;h<c.length;++h){for(var f=h*u,p=l[f],d=0;d<u;++d){var m=l[f+d];m<p&&(p=m)}c[h]=p}return s},t.prototype.minimum=function(e,n){return G([e,n],"minimum"),this.broadcastedBinaryOp(e,n,e.dtype,(function(a,o){return Math.min(a,o)}))},t.prototype.mod=function(e,n){return G([e,n],"mod"),this.broadcastedBinaryOp(e,n,e.dtype,(function(a,o){var i=a%o;return a<0&&o<0||a>=0&&o>=0?i:(i+o)%o}))},t.prototype.max=function(e,n){G(e,"max"),st("max",n,e.rank);for(var a=qe(e.shape,n),o=a[0],i=a[1],s=Ie(o,e.dtype),u=Q(i),c=this.readSync(s.dataId),l=this.readSync(e.dataId),h=0;h<c.length;++h){for(var f=h*u,p=l[f],d=0;d<u;++d){var m=l[f+d];m>p&&(p=m)}c[h]=p}return s},t.prototype.maximum=function(e,n){return G([e,n],"maximum"),this.broadcastedBinaryOp(e,n,e.dtype,(function(a,o){return Math.max(a,o)}))},t.prototype.all=function(e,n){G(e,"all"),st("all",n,e.rank);for(var a=qe(e.shape,n),o=a[0],i=a[1],s=Ie(o,e.dtype),u=Q(i),c=this.readSync(s.dataId),l=this.readSync(e.dataId),h=0;h<c.length;++h){for(var f=h*u,p=l[f],d=0;d<u;++d){var m=l[f+d];p=p&&m}c[h]=p}return s},t.prototype.any=function(e,n){G(e,"any"),st("any",n,e.rank);for(var a=qe(e.shape,n),o=a[0],i=a[1],s=Ie(o,e.dtype),u=Q(i),c=this.readSync(s.dataId),l=this.readSync(e.dataId),h=0;h<c.length;++h){for(var f=h*u,p=l[f],d=0;d<u;++d){var m=l[f+d];p=p||m}c[h]=p}return s},t.prototype.squaredDifference=function(e,n){return G([e,n],"squaredDifference"),this.broadcastedBinaryOp(e,n,e.dtype,(function(a,o){var i=a-o;return i*i}))},t.prototype.ceil=function(e){G(e,"ceil");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o)a[o]=Math.ceil(n[o]);return this.makeOutput(a,e.shape,"float32")},t.prototype.floor=function(e){G(e,"floor");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o)a[o]=Math.floor(n[o]);return this.makeOutput(a,e.shape,"float32")},t.prototype.sign=function(e){G(e,"x");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o)n[o]<0?a[o]=-1:n[o]>0?a[o]=1:a[o]=0;return this.makeOutput(a,e.shape,"float32")},t.prototype.isNaN=function(e){G(e,"x");for(var n=this.readSync(e.dataId),a=new Uint8Array(n.length),o=0;o<n.length;++o)Number.isNaN(n[o])&&(a[o]=1);return this.makeOutput(a,e.shape,"bool")},t.prototype.isInf=function(e){G(e,"x");for(var n=this.readSync(e.dataId),a=new Uint8Array(n.length),o=0;o<n.length;++o)Math.abs(n[o])===1/0&&(a[o]=1);return this.makeOutput(a,e.shape,"bool")},t.prototype.isFinite=function(e){G(e,"x");for(var n=this.readSync(e.dataId),a=new Uint8Array(n.length),o=0;o<n.length;++o)Number.isFinite(n[o])&&(a[o]=1);return this.makeOutput(a,e.shape,"bool")},t.prototype.round=function(e){G(e,"round");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o){var i=Math.floor(n[o]);n[o]-i<.5?a[o]=Math.floor(n[o]):n[o]-i>.5?a[o]=Math.ceil(n[o]):a[o]=i%2==0?i:i+1}return this.makeOutput(a,e.shape,"float32")},t.prototype.exp=function(e){G(e,"exp");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o)a[o]=Math.exp(n[o]);return this.makeOutput(a,e.shape,"float32")},t.prototype.expm1=function(e){G(e,"expm1");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o)a[o]=Math.expm1(n[o]);return this.makeOutput(a,e.shape,"float32")},t.prototype.log=function(e){G(e,"log");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o){var i=n[o];a[o]=Math.log(i)}return this.makeOutput(a,e.shape,"float32")},t.prototype.log1p=function(e){G(e,"log1p");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o){var i=n[o];a[o]=Math.log1p(i)}return this.makeOutput(a,e.shape,"float32")},t.prototype.sqrt=function(e){G(e,"sqrt");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o){var i=n[o];a[o]=Math.sqrt(i)}return this.makeOutput(a,e.shape,"float32")},t.prototype.rsqrt=function(e){G(e,"rsqrt");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o){var i=n[o];a[o]=1/Math.sqrt(i)}return this.makeOutput(a,e.shape,"float32")},t.prototype.reciprocal=function(e){G(e,"reciprocal");for(var n=this.readSync(e.dataId),a=new Float32Array(n.length),o=0;o<n.length;++o)a[o]=1/n[o];return this.makeOutput(a,e.shape,"float32")},t.prototype.linear=function(e){return e},t.prototype.relu=function(e){G(e,"relu");for(var n=Ie(e.shape,e.dtype),a=this.readSync(n.dataId),o=this.readSync(e.dataId),i=0;i<o.length;++i)a[i]=Math.max(0,o[i]);return n},t.prototype.relu6=function(e){G(e,"relu");for(var n=Ie(e.shape,e.dtype),a=this.readSync(n.dataId),o=this.readSync(e.dataId),i=0;i<o.length;++i)a[i]=Math.min(Math.max(0,o[i]),6);return n},t.prototype.prelu=function(e,n){return G([e,n],"prelu"),this.broadcastedBinaryOp(e,n,e.dtype,(function(a,o){return a<0?o*a:a}))},t.prototype.elu=function(e){G(e,"elu");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o){var i=a[o];n[o]=i>=0?i:Math.exp(i)-1}return this.makeOutput(n,e.shape,"float32")},t.prototype.eluDer=function(e,n){G([e,n],"eluDer");for(var a=new Float32Array(n.size),o=this.readSync(n.dataId),i=this.readSync(e.dataId),s=0;s<o.length;++s){var u=o[s];a[s]=u>=1?i[s]:i[s]*(u+1)}return this.makeOutput(a,n.shape,"float32")},t.prototype.selu=function(e){G(e,"selu");for(var n=Lo,a=Wo,o=new Float32Array(e.size),i=this.readSync(e.dataId),s=0;s<i.length;++s){var u=i[s];o[s]=u>=0?a*u:n*(Math.exp(u)-1)}return this.makeOutput(o,e.shape,"float32")},t.prototype.clip=function(e,n,a){G(e,"clip");for(var o=new Float32Array(e.size),i=this.readSync(e.dataId),s=0;s<i.length;++s){var u=i[s];o[s]=u>a?a:u<n?n:u}return this.makeOutput(o,e.shape,"float32")},t.prototype.abs=function(e){for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.abs(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.complexAbs=function(e){for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<e.size;++o){var i=a[2*o],s=a[2*o+1];n[o]=Math.hypot(i,s)}return this.makeOutput(n,e.shape,"float32")},t.prototype.int=function(e){G(e,"int");for(var n=new Int32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=a[o];return this.makeOutput(n,e.shape,"int32")},t.prototype.sigmoid=function(e){G(e,"sigmoid");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=1/(1+Math.exp(-a[o]));return this.makeOutput(n,e.shape,"float32")},t.prototype.softplus=function(e){G(e,"softplus");for(var n=Math.log(11920928955078125e-23)+2,a=new Float32Array(e.size),o=this.readSync(e.dataId),i=0;i<o.length;++i){var s=o[i]>-n,u=o[i]<n,c=Math.exp(o[i]),l=void 0;l=u?c:s?o[i]:Math.log(1+c),a[i]=l}return this.makeOutput(a,e.shape,"float32")},t.prototype.sin=function(e){G(e,"sin");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.sin(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.cos=function(e){G(e,"cos");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.cos(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.tan=function(e){G(e,"tan");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.tan(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.asin=function(e){G(e,"asin");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.asin(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.acos=function(e){G(e,"acos");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.acos(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.atan=function(e){G(e,"atan");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.atan(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.atan2=function(e,n){return G([e,n],"atan2"),this.broadcastedBinaryOp(e,n,e.dtype,(function(a,o){return Math.atan2(a,o)}))},t.prototype.sinh=function(e){G(e,"sinh");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.sinh(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.cosh=function(e){G(e,"cosh");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.cosh(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.tanh=function(e){G(e,"tanh");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=dl(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.asinh=function(e){G(e,"asinh");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.asinh(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.acosh=function(e){G(e,"acosh");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.acosh(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.atanh=function(e){G(e,"atanh");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o)n[o]=Math.atanh(a[o]);return this.makeOutput(n,e.shape,"float32")},t.prototype.erf=function(e){G(e,"erf");for(var n=new Float32Array(e.size),a=this.readSync(e.dataId),o=0;o<a.length;++o){var i=Math.sign(a[o]),s=Math.abs(a[o]),u=1/(1+.3275911*s);n[o]=i*(1-((((1.061405429*u-1.453152027)*u+1.421413741)*u-.284496736)*u+.254829592)*u*Math.exp(-s*s))}return this.makeOutput(n,e.shape,"float32")},t.prototype.step=function(e,n){n===void 0&&(n=0),G(e,"step");for(var a=new Float32Array(e.size),o=this.readSync(e.dataId),i=0;i<o.length;++i){var s=o[i];isNaN(s)?a[i]=NaN:a[i]=s>0?1:n}return this.makeOutput(a,e.shape,"float32")},t.prototype.fusedConv2d=function(e){var n=e.input,a=e.filter,o=e.convInfo,i=e.bias,s=e.activation,u=e.preluActivationWeights,c=this.conv2d(n,a,o);return i&&(c=this.add(c,i)),s&&(c=Ha(this,c,s,u)),c},t.prototype.conv2d=function(e,n,a){G([e,n],"conv2d");for(var o=a.filterHeight,i=a.filterWidth,s=a.dilationHeight,u=a.dilationWidth,c=a.padInfo.left,l=a.padInfo.top,h=a.dataFormat==="channelsLast",f=ce(a.outShape,e.dtype),p=e.strides[0],d=h?e.strides[1]:e.strides[2],m=h?e.strides[2]:1,v=h?1:e.strides[1],g=f.strides[0],x=h?f.strides[1]:f.strides[2],b=h?f.strides[2]:1,y=h?1:f.strides[1],w=this.readSync(e.dataId),C=this.readSync(n.dataId),S=f.values,I=0;I<a.batchSize;++I)for(var k=I*p,R=I*g,N=0;N<a.outHeight;++N)for(var A=R+N*x,L=N*a.strideHeight-l,M=0;M<o;M++){var O=L+M*s;if(!(O<0||O>=a.inHeight))for(var V=M*n.strides[0],U=k+O*d,W=0;W<a.outWidth;++W)for(var z=A+W*b,H=W*a.strideWidth-c,j=0;j<i;j++){var J=H+j*u;if(!(J<0||J>=a.inWidth))for(var re=U+J*m,le=V+j*n.strides[1],he=0;he<a.inChannels;++he){for(var pe=w[re+he*v],K=0;K<a.outChannels;++K)S[z+K*y]+=pe*C[le+K];le+=a.outChannels}}}return f.toTensor()},t.prototype.conv3d=function(e,n,a){for(var o=a.filterDepth,i=a.filterHeight,s=a.filterWidth,u=a.dilationDepth,c=a.dilationHeight,l=a.dilationWidth,h=a.padInfo.front,f=a.padInfo.left,p=a.padInfo.top,d=ce(a.outShape,e.dtype),m=this.readSync(e.dataId),v=this.readSync(n.dataId),g=d.values,x=0;x<a.batchSize;++x)for(var b=x*e.strides[0],y=x*d.strides[0],w=0;w<a.outDepth;++w)for(var C=y+w*d.strides[1],S=w*a.strideDepth-h,I=0;I<o;I++){var k=S+I*u;if(!(k<0||k>=a.inDepth))for(var R=I*n.strides[0],N=b+k*e.strides[1],A=0;A<a.outHeight;++A)for(var L=C+A*d.strides[2],M=A*a.strideHeight-p,O=0;O<i;O++){var V=M+O*c;if(!(V<0||V>=a.inHeight))for(var U=R+O*n.strides[1],W=N+V*e.strides[2],z=0;z<a.outWidth;++z)for(var H=L+z*a.outChannels,j=z*a.strideWidth-f,J=0;J<s;J++){var re=j+J*l;if(!(re<0||re>=a.inWidth))for(var le=U+J*n.strides[2],he=W+re*a.inChannels,pe=le,K=0;K<a.inChannels;++K){for(var Z=m[he+K],oe=0;oe<a.outChannels;++oe)g[H+oe]+=Z*v[pe+oe];pe+=a.outChannels}}}}return d.toTensor()},t.prototype.conv2dDerInput=function(e,n,a){G([e,n],"conv2dDerInput");for(var o=ce(a.inShape,"float32"),i=o.values,s=this.readSync(e.dataId),u=this.readSync(n.dataId),c=n.strides,l=c[0],h=c[1],f=c[2],p=a.batchSize,d=a.filterHeight,m=a.filterWidth,v=a.inChannels,g=a.inHeight,x=a.inWidth,b=a.outChannels,y=a.outHeight,w=a.outWidth,C=a.strideHeight,S=a.strideWidth,I=a.dataFormat,k=d-1-a.padInfo.top,R=m-1-a.padInfo.left,N=I==="channelsLast",A=o.strides[0],L=N?o.strides[1]:o.strides[2],M=N?o.strides[2]:1,O=N?1:o.strides[1],V=e.strides[0],U=N?e.strides[1]:e.strides[2],W=N?e.strides[2]:1,z=N?1:e.strides[1],H=0;H<p;++H)for(var j=0;j<v;++j)for(var J=0;J<g;++J)for(var re=J-k,le=Math.max(0,Math.ceil(re/C)),he=Math.min(y,(d+re)/C),pe=0;pe<x;++pe){for(var K=pe-R,Z=Math.max(0,Math.ceil(K/S)),oe=Math.min(w,(m+K)/S),ae=0,ie=le;ie<he;++ie)for(var ve=ie*C-re,ge=Z;ge<oe;++ge)for(var Re=V*H+U*ie+W*ge,_e=l*(d-1-ve)+h*(m-1-(ge*S-K))+f*j,Ee=0;Ee<b;++Ee)ae+=s[Re+z*Ee]*u[_e+Ee];i[A*H+L*J+M*pe+O*j]=ae}return o.toTensor()},t.prototype.conv3dDerInput=function(e,n,a){for(var o=ce(a.inShape,"float32"),i=o.values,s=o.strides,u=s[0],c=s[1],l=s[2],h=s[3],f=this.readSync(e.dataId),p=e.strides,d=p[0],m=p[1],v=p[2],g=p[3],x=this.readSync(n.dataId),b=n.strides,y=b[0],w=b[1],C=b[2],S=b[3],I=a.batchSize,k=a.filterDepth,R=a.filterHeight,N=a.filterWidth,A=a.inChannels,L=a.inDepth,M=a.inHeight,O=a.inWidth,V=a.outChannels,U=a.outDepth,W=a.outHeight,z=a.outWidth,H=a.strideDepth,j=a.strideHeight,J=a.strideWidth,re=k-1-a.padInfo.front,le=R-1-a.padInfo.top,he=N-1-a.padInfo.left,pe=0;pe<I;++pe)for(var K=0;K<A;++K)for(var Z=0;Z<L;++Z)for(var oe=Z-re,ae=Math.max(0,Math.ceil(oe/H)),ie=Math.min(U,(k+oe)/H),ve=0;ve<M;++ve)for(var ge=ve-le,Re=Math.max(0,Math.ceil(ge/j)),_e=Math.min(W,(R+ge)/j),Ee=0;Ee<O;++Ee){for(var at=Ee-he,Ct=Math.max(0,Math.ceil(at/J)),ot=Math.min(z,(N+at)/J),En=0,Lt=ae;Lt<ie;++Lt)for(var Yt=Lt*H-oe,Wt=Re;Wt<_e;++Wt)for(var kn=Wt*j-ge,Ut=Ct;Ut<ot;++Ut)for(var Ca=d*pe+m*Lt+v*Wt+g*Ut,Rn=y*(k-1-Yt)+w*(R-1-kn)+C*(N-1-(Ut*J-at))+S*K,_t=0;_t<V;++_t)En+=f[Ca+_t]*x[Rn+_t];i[u*pe+c*Z+l*ve+h*Ee+K]=En}return o.toTensor()},t.prototype.conv2dDerFilter=function(e,n,a){G([e,n],"conv2dDerFilter");for(var o=a.strideHeight,i=a.strideWidth,s=a.filterHeight,u=a.filterWidth,c=a.dataFormat==="channelsLast",l=ce(a.filterShape,"float32"),h=a.padInfo.left,f=a.padInfo.top,p=this.bufferSync(e),d=this.bufferSync(n),m=0;m<s;++m)for(var v=Math.max(0,Math.ceil((f-m)/o)),g=Math.min(a.outHeight,(a.inHeight+f-m)/o),x=0;x<u;++x)for(var b=Math.max(0,Math.ceil((h-x)/i)),y=Math.min(a.outWidth,(a.inWidth+h-x)/i),w=0;w<a.inChannels;++w)for(var C=0;C<a.outChannels;++C){for(var S=0,I=0;I<a.batchSize;++I)for(var k=v;k<g;++k)for(var R=m+k*o-f,N=b;N<y;++N){var A=x+N*i-h;S+=c?p.get(I,R,A,w)*d.get(I,k,N,C):p.get(I,w,R,A)*d.get(I,C,k,N)}l.set(S,m,x,w,C)}return l.toTensor()},t.prototype.conv3dDerFilter=function(e,n,a){for(var o=a.strideDepth,i=a.strideHeight,s=a.strideWidth,u=a.filterDepth,c=a.filterHeight,l=a.filterWidth,h=ce(a.filterShape,"float32"),f=h.values,p=h.strides,d=p[0],m=p[1],v=p[2],g=p[3],x=this.readSync(n.dataId),b=n.strides,y=b[0],w=b[1],C=b[2],S=b[3],I=this.readSync(e.dataId),k=e.strides,R=k[0],N=k[1],A=k[2],L=k[3],M=a.padInfo.front,O=a.padInfo.left,V=a.padInfo.top,U=0;U<u;++U)for(var W=Math.max(0,Math.ceil((M-U)/o)),z=Math.min(a.outDepth,(a.inDepth+M-U)/o),H=U*d,j=0;j<c;++j)for(var J=Math.max(0,Math.ceil((V-j)/i)),re=Math.min(a.outHeight,(a.inHeight+V-j)/i),le=j*m+H,he=0;he<l;++he)for(var pe=Math.max(0,Math.ceil((O-he)/s)),K=Math.min(a.outWidth,(a.inWidth+O-he)/s),Z=he*v+le,oe=0;oe<a.inChannels;++oe)for(var ae=oe*g+Z,ie=0;ie<a.outChannels;++ie){for(var ve=0,ge=0;ge<a.batchSize;++ge)for(var Re=ge*R,_e=ge*y,Ee=W;Ee<z;++Ee)for(var at=(U+Ee*o-M)*N+Re,Ct=Ee*w+_e,ot=J;ot<re;++ot)for(var En=(j+ot*i-V)*A+at,Lt=ot*C+Ct,Yt=pe;Yt<K;++Yt){var Wt=Yt*S+Lt;ve+=I[(he+Yt*s-O)*L+En+oe]*x[Wt+ie]}f[ae+ie]=ve}return h.toTensor()},t.prototype.fusedDepthwiseConv2D=function(e){var n=e.input,a=e.filter,o=e.convInfo,i=e.bias,s=e.activation,u=e.preluActivationWeights,c=this.depthwiseConv2D(n,a,o);return i&&(c=this.add(c,i)),s&&(c=Ha(this,c,s,u)),c},t.prototype.depthwiseConv2D=function(e,n,a){G([e,n],"depthwiseConv2D");for(var o=a.filterHeight,i=a.filterWidth,s=a.dilationHeight,u=a.dilationWidth,c=a.padInfo.left,l=a.padInfo.top,h=a.outChannels/a.inChannels,f=ce(a.outShape,e.dtype),p=this.readSync(e.dataId),d=this.readSync(n.dataId),m=f.values,v=0;v<a.batchSize;++v)for(var g=v*e.strides[0],x=v*f.strides[0],b=0;b<a.outHeight;++b)for(var y=x+b*f.strides[1],w=b*a.strideHeight-c,C=0;C<o;++C){var S=w+C*s;if(!(S<0||S>=a.inHeight))for(var I=C*n.strides[0],k=g+S*e.strides[1],R=0;R<a.outWidth;++R)for(var N=y+R*f.strides[2],A=R*a.strideWidth-l,L=0;L<i;++L){var M=A+L*u;if(!(M<0||M>=a.inWidth))for(var O=I+L*n.strides[1],V=k+M*a.inChannels,U=N,W=O,z=0;z<a.inChannels;++z){for(var H=p[V+z],j=0;j<h;++j)m[U+j]+=H*d[W+j];U+=h,W+=h}}}return f.toTensor()},t.prototype.depthwiseConv2DDerInput=function(e,n,a){G([e,n],"depthwiseConv2DDerInput");for(var o=ce(a.inShape,"float32"),i=o.values,s=o.strides,u=s[0],c=s[1],l=s[2],h=this.readSync(e.dataId),f=e.strides,p=f[0],d=f[1],m=f[2],v=this.readSync(n.dataId),g=n.strides,x=g[0],b=g[1],y=g[2],w=a.batchSize,C=a.filterHeight,S=a.filterWidth,I=a.inChannels,k=a.inHeight,R=a.inWidth,N=a.outChannels,A=a.outHeight,L=a.outWidth,M=a.strideHeight,O=a.strideWidth,V=C-1-a.padInfo.top,U=S-1-a.padInfo.left,W=N/I,z=0;z<w;++z)for(var H=0;H<I;++H)for(var j=0;j<k;++j)for(var J=j-V,re=Math.max(0,Math.ceil(J/M)),le=Math.min(A,(C+J)/M),he=0;he<R;++he){for(var pe=he-U,K=Math.max(0,Math.ceil(pe/O)),Z=Math.min(L,(S+pe)/O),oe=0,ae=re;ae<le;++ae)for(var ie=ae*M-J,ve=K;ve<Z;++ve)for(var ge=p*z+d*ae+m*ve,Re=x*(C-1-ie)+b*(S-1-(ve*O-pe))+y*H,_e=0;_e<W;++_e)oe+=h[ge+(H*W+_e)]*v[Re+_e];i[u*z+c*j+l*he+H]=oe}return o.toTensor()},t.prototype.depthwiseConv2DDerFilter=function(e,n,a){G([e,n],"depthwiseConv2DDerFilter");for(var o=a.strideHeight,i=a.strideWidth,s=a.filterHeight,u=a.filterWidth,c=ce(a.filterShape,"float32"),l=a.padInfo.left,h=a.padInfo.top,f=a.outChannels/a.inChannels,p=this.bufferSync(e),d=this.bufferSync(n),m=0;m<s;++m)for(var v=Math.max(0,Math.ceil((h-m)/o)),g=Math.min(a.outHeight,(a.inHeight+h-m)/o),x=0;x<u;++x)for(var b=Math.max(0,Math.ceil((l-x)/i)),y=Math.min(a.outWidth,(a.inWidth+l-x)/i),w=0;w<a.outChannels;++w){for(var C=Math.trunc(w/f),S=w%f,I=0,k=0;k<a.batchSize;++k)for(var R=v;R<g;++R)for(var N=m+R*o-h,A=b;A<y;++A){var L=x+A*i-l;I+=p.get(k,N,L,C)*d.get(k,R,A,w)}c.set(I,m,x,C,S)}return c.toTensor()},t.prototype.tile=function(e,n){return G(e,"tile"),bu(this.bufferSync(e),n)},t.prototype.pad=function(e,n,a){G(e,"pad");var o=n.map((function(f,p){return f[0]+e.shape[p]+f[1]})),i=n.map((function(f){return f[0]})),s=this.bufferSync(e),u=ce(o,e.dtype);a!==0&&u.values.fill(a);for(var c=0;c<e.size;c++){var l=s.indexToLoc(c),h=l.map((function(f,p){return f+i[p]}));u.set.apply(u,[s.get.apply(s,l)].concat(h))}return u.toTensor()},t.prototype.transpose=function(e,n){G(e,"transpose");for(var a=new Array(e.rank),o=0;o<a.length;o++)a[o]=e.shape[n[o]];var i=this.readSync(e.dataId),s=ce(a,e.dtype),u=this.bufferSync(e);for(o=0;o<e.size;++o){for(var c=u.indexToLoc(o),l=new Array(c.length),h=0;h<l.length;h++)l[h]=c[n[h]];var f=s.locToIndex(l);s.values[f]=i[o]}return s.toTensor()},t.prototype.gather=function(e,n,a){G([e,n],"gather");var o=e.shape.slice(),i=this.readSync(n.dataId);o[a]=i.length;for(var s=ce(o,e.dtype),u=this.bufferSync(e),c=0;c<s.size;++c){var l=s.indexToLoc(c),h=l.slice();h[a]=i[l[a]];var f=u.locToIndex(h);s.values[c]=u.values[f]}return s.toTensor()},t.prototype.batchToSpaceND=function(e,n,a){G([e],"batchToSpaceND");var o=n.reduce((function(h,f){return h*f})),i=jr(e.shape,n,o),s=qr(i.length,n.length),u=Kr(e.shape,n,o),c=su(a,n.length),l=uu(u,a,n.length);return e.reshape(i).transpose(s).reshape(u).slice(c,l)},t.prototype.spaceToBatchND=function(e,n,a){G([e],"spaceToBatchND");var o=n.reduce((function(f,p){return f*p})),i=[[0,0]];i.push.apply(i,a);for(var s=1+n.length;s<e.shape.length;++s)i.push([0,0]);var u=e.pad(i),c=jr(u.shape,n,o,!1),l=qr(c.length,n.length,!1),h=Kr(u.shape,n,o,!1);return u.reshape(c).transpose(l).reshape(h)},t.prototype.pool=function(e,n,a){G(e,"pool");for(var o=n.strideHeight,i=n.strideWidth,s=n.dilationHeight,u=n.dilationWidth,c=n.effectiveFilterHeight,l=n.effectiveFilterWidth,h=n.padInfo.top,f=n.padInfo.left,p=a==="max"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,d=this.readSync(e.dataId),m=ce(n.outShape,e.dtype),v=m.values,g=n.outShape[1]*n.outShape[2]*n.outShape[3],x=n.outShape[2]*n.outShape[3],b=n.outShape[3],y=0;y<n.batchSize;++y)for(var w=y*g,C=y*e.strides[0],S=0;S<n.inChannels;++S)for(var I=0;I<n.outHeight;++I)for(var k=I*o-h,R=Math.max(0,k),N=Math.min(n.inHeight,c+k),A=w+I*x,L=0;L<n.outWidth;++L){for(var M=L*i-f,O=Math.max(0,M),V=Math.min(n.inWidth,l+M),U=p,W=0,z=0,H=R;H<N;H+=s){for(var j=C+H*e.strides[1],J=O;J<V;J+=u){var re=d[j+J*e.strides[2]+S];a==="max"&&re>U?U=re:a==="avg"&&(W+=re,z++)}if(isNaN(U))break}v[A+L*b+S]=a==="avg"?W/z:U}return m.toTensor()},t.prototype.maxPool=function(e,n){return this.pool(e,n,"max")},t.prototype.maxPoolPositions=function(e,n){for(var a=ce(n.outShape,"int32"),o=n.strideHeight,i=n.strideWidth,s=n.dilationHeight,u=n.dilationWidth,c=n.effectiveFilterHeight,l=n.effectiveFilterWidth,h=n.padInfo.top,f=n.padInfo.left,p=this.bufferSync(e),d=0;d<n.batchSize;++d)for(var m=0;m<n.inChannels;++m)for(var v=0;v<n.outHeight;++v){for(var g=v*o-h,x=g;x<0;)x+=s;for(var b=Math.min(n.inHeight,c+g),y=0;y<n.outWidth;++y){for(var w=y*i-f,C=w;C<0;)C+=u;for(var S=Math.min(n.inWidth,l+w),I=Number.NEGATIVE_INFINITY,k=-1,R=x;R<b;R+=s)for(var N=R-g,A=C;A<S;A+=u){var L=A-w,M=p.get(d,R,A,m);M>I&&(I=M,k=N*l+L)}a.set(k,d,v,y,m)}}return a.toTensor()},t.prototype.maxPoolBackprop=function(e,n,a,o){G([n,a],"maxPoolBackprop");for(var i=this.maxPoolPositions(n,o),s=o.strideHeight,u=o.strideWidth,c=o.dilationHeight,l=o.dilationWidth,h=o.effectiveFilterHeight,f=o.effectiveFilterWidth,p=f-1-o.padInfo.left,d=h-1-o.padInfo.top,m=ce(n.shape,"float32"),v=this.bufferSync(i),g=this.bufferSync(e),x=0;x<o.batchSize;++x)for(var b=0;b<o.inChannels;++b)for(var y=0;y<o.inHeight;++y)for(var w=0;w<o.inWidth;++w){for(var C=y-d,S=w-p,I=0,k=0;k<h;k+=c){var R=(C+k)/s;if(!(R<0||R>=o.outHeight||Math.floor(R)!==R))for(var N=0;N<f;N+=l){var A=(S+N)/u;if(!(A<0||A>=o.outWidth||Math.floor(A)!==A)){var L=h*f-1-v.get(x,R,A,b)===k*f+N?1:0;L!==0&&(I+=g.get(x,R,A,b)*L)}}}m.set(I,x,y,w,b)}return m.toTensor()},t.prototype.avgPoolBackprop=function(e,n,a){G([e,n],"avgPoolBackprop");for(var o=a.strideHeight,i=a.strideWidth,s=a.filterHeight,u=a.filterWidth,c=a.dilationHeight,l=a.dilationWidth,h=a.effectiveFilterHeight,f=a.effectiveFilterWidth,p=f-1-a.padInfo.left,d=h-1-a.padInfo.top,m=ce(n.shape,"float32"),v=1/(s*u),g=this.bufferSync(e),x=0;x<a.batchSize;++x)for(var b=0;b<a.inChannels;++b)for(var y=0;y<a.inHeight;++y)for(var w=0;w<a.inWidth;++w){for(var C=y-d,S=w-p,I=0,k=0;k<h;k+=c){var R=(C+k)/o;if(!(R<0||R>=a.outHeight||Math.floor(R)!==R))for(var N=0;N<f;N+=l){var A=(S+N)/i;A<0||A>=a.outWidth||Math.floor(A)!==A||(I+=g.get(x,R,A,b))}}m.set(I*v,x,y,w,b)}return m.toTensor()},t.prototype.pool3d=function(e,n,a){G(e,"pool3d");for(var o=n.strideDepth,i=n.strideHeight,s=n.strideWidth,u=n.dilationDepth,c=n.dilationHeight,l=n.dilationWidth,h=n.effectiveFilterDepth,f=n.effectiveFilterHeight,p=n.effectiveFilterWidth,d=n.padInfo.front,m=n.padInfo.top,v=n.padInfo.left,g=a==="max"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,x=this.readSync(e.dataId),b=ce(n.outShape,e.dtype),y=b.values,w=n.outShape[1]*n.outShape[2]*n.outShape[3]*n.outShape[4],C=n.outShape[2]*n.outShape[3]*n.outShape[4],S=n.outShape[3]*n.outShape[4],I=n.outShape[4],k=0;k<n.batchSize;++k)for(var R=k*w,N=k*e.strides[0],A=0;A<n.inChannels;++A)for(var L=0;L<n.outDepth;++L){for(var M=L*o-d,O=M;O<0;)O+=u;for(var V=Math.min(n.inDepth,h+M),U=R+L*C,W=0;W<n.outHeight;++W){for(var z=W*i-m,H=z;H<0;)H+=c;for(var j=Math.min(n.inHeight,f+z),J=U+W*S,re=0;re<n.outWidth;++re){for(var le=re*s-v,he=le;he<0;)he+=l;for(var pe=Math.min(n.inWidth,p+le),K=J+re*I,Z=g,oe=0,ae=0,ie=O;ie<V;ie+=u){for(var ve=N+ie*e.strides[1],ge=H;ge<j;ge+=c){for(var Re=ve+ge*e.strides[2],_e=he;_e<pe;_e+=l){var Ee=x[Re+_e*e.strides[3]+A];if(a==="max"&&Ee>Z?Z=Ee:a==="avg"&&(oe+=Ee,ae++),isNaN(Z))break}if(isNaN(Z))break}if(isNaN(Z))break}y[K+A]=a==="avg"?oe/ae:Z}}}return b.toTensor()},t.prototype.avgPool3d=function(e,n){return G(e,"avgPool3d"),this.pool3d(e,n,"avg").toFloat()},t.prototype.avgPool3dBackprop=function(e,n,a){G([e,n],"avgPool3dBackprop");for(var o=a.strideDepth,i=a.strideHeight,s=a.strideWidth,u=a.filterDepth,c=a.filterHeight,l=a.filterWidth,h=a.dilationDepth,f=a.dilationHeight,p=a.dilationWidth,d=a.effectiveFilterDepth,m=a.effectiveFilterHeight,v=a.effectiveFilterWidth,g=d-1-a.padInfo.front,x=v-1-a.padInfo.left,b=m-1-a.padInfo.top,y=ce(n.shape,"float32"),w=1/(u*c*l),C=this.bufferSync(e),S=0;S<a.batchSize;++S)for(var I=0;I<a.inChannels;++I)for(var k=0;k<a.inDepth;++k)for(var R=0;R<a.inHeight;++R)for(var N=0;N<a.inWidth;++N){for(var A=k-g,L=R-b,M=N-x,O=0,V=0;V<d;V+=h){var U=(A+V)/o;if(!(U<0||U>=a.outDepth||Math.floor(U)!==U))for(var W=0;W<m;W+=f){var z=(L+W)/i;if(!(z<0||z>=a.outHeight||Math.floor(z)!==z))for(var H=0;H<v;H+=p){var j=(M+H)/s;j<0||j>=a.outWidth||Math.floor(j)!==j||(O+=C.get(S,U,z,j,I))}}}y.set(O*w,S,k,R,N,I)}return y.toTensor()},t.prototype.maxPool3d=function(e,n){return G(e,"maxPool3d"),this.pool3d(e,n,"max").toFloat()},t.prototype.maxPool3dPositions=function(e,n){for(var a=ce(n.outShape,"int32"),o=n.strideDepth,i=n.strideHeight,s=n.strideWidth,u=n.dilationDepth,c=n.dilationHeight,l=n.dilationWidth,h=n.effectiveFilterDepth,f=n.effectiveFilterHeight,p=n.effectiveFilterWidth,d=n.padInfo.front,m=n.padInfo.top,v=n.padInfo.left,g=this.bufferSync(e),x=0;x<n.batchSize;++x)for(var b=0;b<n.inChannels;++b)for(var y=0;y<n.outDepth;++y){for(var w=y*o-d,C=w;C<0;)C+=u;for(var S=Math.min(n.inDepth,h+w),I=0;I<n.outHeight;++I){for(var k=I*i-m,R=k;R<0;)R+=c;for(var N=Math.min(n.inHeight,f+k),A=0;A<n.outWidth;++A){for(var L=A*s-v,M=L;M<0;)M+=l;for(var O=Math.min(n.inWidth,p+L),V=Number.NEGATIVE_INFINITY,U=-1,W=C;W<S;W+=u)for(var z=W-w,H=R;H<N;H+=c)for(var j=H-k,J=M;J<O;J+=l){var re=J-L,le=g.get(x,W,H,J,b);le>=V&&(V=le,U=z*f*p+j*f+re)}a.set(U,x,y,I,A,b)}}}return a.toTensor()},t.prototype.maxPool3dBackprop=function(e,n,a,o){G([n,a],"maxPool3dBackprop");for(var i=this.maxPool3dPositions(n,o),s=o.strideDepth,u=o.strideHeight,c=o.strideWidth,l=o.dilationDepth,h=o.dilationHeight,f=o.dilationWidth,p=o.effectiveFilterDepth,d=o.effectiveFilterHeight,m=o.effectiveFilterWidth,v=p-1-o.padInfo.front,g=m-1-o.padInfo.left,x=d-1-o.padInfo.top,b=ce(n.shape,"float32"),y=this.bufferSync(i),w=this.bufferSync(e),C=0;C<o.batchSize;++C)for(var S=0;S<o.inChannels;++S)for(var I=0;I<o.inDepth;++I)for(var k=0;k<o.inHeight;++k)for(var R=0;R<o.inWidth;++R){for(var N=I-v,A=k-x,L=R-g,M=0,O=0;O<p;O+=l){var V=(N+O)/s;if(!(V<0||V>=o.outDepth||Math.floor(V)!==V))for(var U=0;U<d;U+=h){var W=(A+U)/u;if(!(W<0||W>=o.outHeight||Math.floor(W)!==W))for(var z=0;z<m;z+=f){var H=(L+z)/c;if(!(H<0||H>=o.outWidth||Math.floor(H)!==H)){var j=p*d*m-1-y.get(C,V,W,H,S)===O*d*m+U*m+z?1:0;j!==0&&(M+=w.get(C,V,W,H,S)*j)}}}}b.set(M,C,I,k,R,S)}return b.toTensor()},t.prototype.cast=function(e,n){return mu(e,n,this)},t.prototype.reshape=function(e,n){return vo(e,n)},t.prototype.avgPool=function(e,n){return G(e,"avgPool"),this.pool(e,n,"avg").toFloat()},t.prototype.resizeBilinear=function(e,n,a,o){G(e,"resizeBilinear");for(var i=e.shape,s=i[0],u=i[1],c=i[2],l=i[3],h=this.readSync(e.dataId),f=new Float32Array(Q([s,n,a,l])),p=[o&&n>1?u-1:u,o&&a>1?c-1:c],d=[o&&n>1?n-1:n,o&&a>1?a-1:a],m=0,v=p[0]/d[0],g=p[1]/d[1],x=0;x<s;x++)for(var b=0;b<n;b++)for(var y=v*b,w=Math.floor(y),C=y-w,S=Math.min(u-1,Math.ceil(y)),I=x*e.strides[0]+w*e.strides[1],k=x*e.strides[0]+S*e.strides[1],R=0;R<a;R++)for(var N=g*R,A=Math.floor(N),L=N-A,M=Math.min(c-1,Math.ceil(N)),O=I+A*e.strides[2],V=k+A*e.strides[2],U=I+M*e.strides[2],W=k+M*e.strides[2],z=0;z<l;z++){var H=h[O+z],j=h[V+z],J=H+(h[U+z]-H)*L,re=J+(j+(h[W+z]-j)*L-J)*C;f[m++]=re}return je(f,[s,n,a,l])},t.prototype.resizeBilinearBackprop=function(e,n,a){G([e,n],"resizeBilinearBackprop");for(var o=n.shape,i=o[0],s=o[1],u=o[2],c=o[3],l=e.shape,h=l[1],f=l[2],p=new Float32Array(i*s*u*c),d=[a&&h>1?s-1:s,a&&f>1?u-1:u],m=[a&&h>1?h-1:h,a&&f>1?f-1:f],v=d[0]/m[0],g=d[1]/m[1],x=this.readSync(e.dataId),b=0,y=0;y<i;y++)for(var w=y*n.strides[0],C=0;C<h;C++)for(var S=C*v,I=Math.floor(S),k=Math.min(Math.ceil(S),s-1),R=w+I*n.strides[1],N=w+k*n.strides[1],A=S-I,L=1-A,M=0;M<f;M++)for(var O=M*g,V=Math.floor(O),U=Math.min(Math.ceil(O),u-1),W=O-V,z=1-W,H=R+V*n.strides[2],j=R+U*n.strides[2],J=N+V*n.strides[2],re=N+U*n.strides[2],le=L*z,he=L*W,pe=A*z,K=A*W,Z=0;Z<c;Z++){var oe=x[b++];p[H+Z]+=oe*le,p[j+Z]+=oe*he,p[J+Z]+=oe*pe,p[re+Z]+=oe*K}return Ze(p,[i,u,s,c],n.dtype)},t.prototype.resizeNearestNeighbor=function(e,n,a,o){G(e,"resizeNearestNeighbor");for(var i=e.shape,s=i[0],u=i[1],c=i[2],l=i[3],h=this.readSync(e.dataId),f=new Float32Array(s*n*a*l),p=[o&&n>1?u-1:u,o&&a>1?c-1:c],d=[o&&n>1?n-1:n,o&&a>1?a-1:a],m=p[0]/d[0],v=p[1]/d[1],g=0,x=0;x<s;x++)for(var b=x*e.strides[0],y=0;y<n;y++)for(var w=m*y,C=b+Math.min(u-1,o?Math.round(w):Math.floor(w))*e.strides[1],S=0;S<a;S++)for(var I=v*S,k=C+Math.min(c-1,o?Math.round(I):Math.floor(I))*e.strides[2],R=0;R<l;R++){var N=h[k+R];f[g++]=N}return je(f,[s,n,a,l],e.dtype)},t.prototype.resizeNearestNeighborBackprop=function(e,n,a){G([e,n],"resizeNearestNeighborBackprop");for(var o=n.shape,i=o[0],s=o[1],u=o[2],c=o[3],l=e.shape,h=l[1],f=l[2],p=new Float32Array(i*s*u*c),d=this.readSync(e.dataId),m=[a&&h>1?s-1:s,a&&f>1?u-1:u],v=[a&&h>1?h-1:h,a&&f>1?f-1:f],g=m[0]/v[0],x=m[1]/v[1],b=1/g,y=1/x,w=2*Math.ceil(b)+2,C=2*Math.ceil(y)+2,S=0;S<i;S++)for(var I=S*n.strides[0],k=0;k<s;k++)for(var R=I+k*n.strides[1],N=Math.floor(k*b),A=Math.floor(N-w/2),L=0;L<u;L++)for(var M=R+L*n.strides[2],O=Math.floor(L*y),V=Math.floor(O-C/2),U=0;U<c;U++){for(var W=0,z=0;z<w;z++){var H=z+A;if(!(H<0||H>=h)){var j=I+H*e.strides[1],J=H*g;if(k===Math.min(s-1,a?Math.round(J):Math.floor(J)))for(var re=0;re<C;re++){var le=re+V;if(!(le<0||le>=f)){var he=j+le*e.strides[2],pe=le*x;L===Math.min(u-1,a?Math.round(pe):Math.floor(pe))&&(W+=d[he+U])}}}}p[M+U]=W}return Ze(p,n.shape,n.dtype)},t.prototype.batchNormalization=function(e,n,a,o,i,s){G([e,n,a,i,s],"batchNorm");for(var u=this.readSync(e.dataId),c=this.readSync(n.dataId),l=this.readSync(a.dataId),h=i?this.readSync(i.dataId):new Float32Array([1]),f=s?this.readSync(s.dataId):new Float32Array([0]),p=new Float32Array(u.length),d=f.length,m=h.length,v=l.length,g=c.length,x=0,b=0,y=0,w=0,C=0;C<u.length;++C)p[C]=f[x++]+(u[C]-c[b++])*h[y++]/Math.sqrt(l[w++]+o),x>=d&&(x=0),b>=g&&(b=0),y>=m&&(y=0),w>=v&&(w=0);return Ze(p,e.shape)},t.prototype.localResponseNormalization4D=function(e,n,a,o,i){G(e,"localResponseNormalization4D");var s=e.shape[3],u=s-1,c=this.readSync(e.dataId),l=e.size,h=new Float32Array(l);function f(v){for(var g=v%s,x=v-g+Math.max(0,g-n),b=v-g+Math.min(g+n,u),y=0;x<=b;x++){var w=c[x];y+=w*w}return y}for(var p=0;p<l;p++){var d=f(p),m=c[p]*Math.pow(a+o*d,-i);h[p]=m}return Ze(h,e.shape)},t.prototype.LRNGrad=function(e,n,a,o,i,s,u){G(e,"LRNGrad");for(var c=e.shape[3],l=this.readSync(e.dataId),h=this.readSync(n.dataId),f=this.readSync(a.dataId),p=new Float32Array(e.size),d=e.size,m=0;m<d;m++){for(var v=m%c,g=m-v+Math.max(0,v-o),x=m-v+Math.min(c,v+o+1),b=0,y=g;y<x;y++)b+=Math.pow(h[y],2);for(b=s*b+i,y=g;y<x;y++){var w=-2*s*u*h[y]*f[m]/b;m===y&&(w+=Math.pow(b,-u)),w*=l[m],p[y]+=w}}return Ze(p,e.shape)},t.prototype.multinomial=function(e,n,a,o){G(e,"multinomial");for(var i=n?e:jt(e),s=i.shape[0],u=i.shape[1],c=Ie([s,a],"int32"),l=this.readSync(c.dataId),h=this.readSync(i.dataId),f=0;f<s;++f){var p=f*u,d=new Float32Array(u-1);d[0]=h[p];for(var m=1;m<d.length;++m)d[m]=d[m-1]+h[p+m];for(var v=ua(o.toString()),g=f*a,x=0;x<a;++x){var b=v();l[g+x]=d.length;for(var y=0;y<d.length;y++)if(b<d[y]){l[g+x]=y;break}}}return c},t.prototype.oneHot=function(e,n,a,o){G(e,"oneHot");var i=new Float32Array(e.size*n);i.fill(o);for(var s=this.readSync(e.dataId),u=0;u<e.size;++u)s[u]>=0&&s[u]<n&&(i[u*n+s[u]]=a);return tn(i,[e.size,n],"int32")},t.prototype.nonMaxSuppression=function(e,n,a,o,i){return G(e,"nonMaxSuppression"),Po(this.readSync(e.dataId),this.readSync(n.dataId),a,o,i)},t.prototype.fft=function(e){return this.fftBatch(e,!1)},t.prototype.ifft=function(e){return this.fftBatch(e,!0)},t.prototype.fftBatch=function(e,n){for(var a=e.shape[0],o=e.shape[1],i=ce(e.shape,"float32"),s=ce(e.shape,"float32"),u=dt(e).as2D(a,o),c=St(e).as2D(a,o),l=0;l<a;l++)for(var h=u.slice([l,0],[1,o]),f=c.slice([l,0],[1,o]),p=Ge(h,f),d=this.readSync(this.fftImpl(p,n).dataId),m=0;m<o;m++){var v=zi(d,m);i.values[l*o+m]=v.real,s.values[l*o+m]=v.imag}return Ge(i.toTensor(),s.toTensor()).as2D(a,o)},t.prototype.fftImpl=function(e,n){var a=e.as1D(),o=a.size;if(this.isExponentOf2(o)){var i=this.fftRadix2(a,o,n).as2D(e.shape[0],e.shape[1]);return n&&(i=Ge(dt(i).div(q(o)),St(i).div(q(o)))),i}var s=this.readSync(e.dataId),u=(function(c){for(var l=new Float32Array(c.length/2),h=new Float32Array(c.length/2),f=0;f<c.length;f+=2)l[f/2]=c[f],h[f/2]=c[f+1];return{real:l,imag:h}})(this.fourierTransformByMatmul(s,o,n));return Ge(u.real,u.imag).as2D(e.shape[0],e.shape[1])},t.prototype.isExponentOf2=function(e){return(e&e-1)==0},t.prototype.fftRadix2=function(e,n,a){if(n===1)return e;var o=this.readSync(e.dataId),i=n/2,s=(function(g){for(var x=Math.ceil(g.length/4),b=new Float32Array(x),y=new Float32Array(x),w=0;w<g.length;w+=4)b[Math.floor(w/4)]=g[w],y[Math.floor(w/4)]=g[w+1];return{real:b,imag:y}})(o),u=Ge(s.real,s.imag).as1D(),c=(function(g){for(var x=Math.floor(g.length/4),b=new Float32Array(x),y=new Float32Array(x),w=2;w<g.length;w+=4)b[Math.floor(w/4)]=g[w],y[Math.floor(w/4)]=g[w+1];return{real:b,imag:y}})(o),l=Ge(c.real,c.imag).as1D();u=this.fftRadix2(u,i,a),l=this.fftRadix2(l,i,a);var h=(function(g,x){for(var b=new Float32Array(g/2),y=new Float32Array(g/2),w=0;w<Math.ceil(g/2);w++){var C=(x?2:-2)*Math.PI*(w/g);b[w]=Math.cos(C),y[w]=Math.sin(C)}return{real:b,imag:y}})(n,a),f=Ge(h.real,h.imag).mul(l),p=u.add(f),d=u.sub(f),m=dt(p).concat(dt(d)),v=St(p).concat(St(d));return Ge(m,v).as1D()},t.prototype.fourierTransformByMatmul=function(e,n,a){for(var o=new Float32Array(2*n),i=0;i<n;i++){for(var s=0,u=0,c=0;c<n;c++){var l=Kh(i*c,n,a),h=zi(e,c);s+=h.real*l.real-h.imag*l.imag,u+=h.real*l.imag+h.imag*l.real}a&&(s/=n,u/=n),qh(o,s,u,i)}return o},t.prototype.depthToSpace=function(e,n,a){E(a==="NHWC",(function(){return"Only NHWC dataFormat supported on CPU for depthToSpace. Got "+a})),E(n>1,(function(){return"blockSize should be > 1 for depthToSpace, but was: "+n}));for(var o=e.shape[0],i=e.shape[1],s=e.shape[2],u=e.shape[3],c=i*n,l=s*n,h=u/(n*n),f=this.readSync(e.dataId),p=new Float32Array(o*c*l*h),d=0,m=0;m<o;++m)for(var v=0;v<c;++v)for(var g=Math.floor(v/n),x=v%n,b=0;b<l;++b)for(var y=Math.floor(b/n),w=(x*n+b%n)*h,C=0;C<h;++C){var S=C+w+u*(y+s*(g+i*m));p[d++]=f[S]}return Ze(p,[o,c,l,h])},t.prototype.broadcastedBinaryOp=function(e,n,a,o){var i=me(e.shape,n.shape),s=ce(i,a),u=this.readSync(e.dataId),c=this.readSync(n.dataId),l=Zt(e.shape,i),h=Zt(n.shape,i),f=s.values;if(l.length+h.length===0)for(var p=0;p<f.length;++p)f[p]=o(u[p%u.length],c[p%c.length]);else{var d=this.bufferSync(e),m=this.bufferSync(n),v=function(g){var x=s.indexToLoc(g),b=x.slice(-e.rank);l.forEach((function(S){return b[S]=0}));var y=d.locToIndex(b),w=x.slice(-n.rank);h.forEach((function(S){return w[S]=0}));var C=m.locToIndex(w);f[g]=o(u[y],c[C])};for(p=0;p<f.length;++p)v(p)}return s.toTensor()},t.prototype.broadcastedBinaryComplexOp=function(e,n,a){var o=me(e.shape,n.shape),i=ce(o,"float32"),s=ce(o,"float32"),u=this.readSync(e.dataId),c=this.readSync(n.dataId),l=Zt(e.shape,o),h=Zt(n.shape,o),f=i.values,p=s.values;if(l.length+h.length===0)for(var d=0;d<f.length;d++){var m=d%u.length,v=d%c.length,g=a(u[2*m],u[2*m+1],c[2*v],c[2*v+1]);f[d]=g.real,p[d]=g.imag}else{var x=this.bufferSync(this.data.get(e.dataId).complexTensors.real),b=this.bufferSync(this.data.get(n.dataId).complexTensors.real),y=function(w){var C=i.indexToLoc(w),S=C.slice(-e.rank);l.forEach((function(A){return S[A]=0}));var I=x.locToIndex(S),k=C.slice(-n.rank);h.forEach((function(A){return k[A]=0}));var R=b.locToIndex(k),N=a(u[2*I],u[2*I+1],c[2*R],c[2*R+1]);f[w]=N.real,p[w]=N.imag};for(d=0;d<f.length;d++)y(d)}return this.complex(i.toTensor(),s.toTensor())},t.prototype.split=function(e,n,a){return xu(e,n,a)},t.prototype.dispose=function(){},t.prototype.floatPrecision=function(){return 32},t.prototype.epsilon=function(){return 1e-7},t.prototype.cropAndResize=function(e,n,a,o,i,s){for(var u=e.shape,c=u[0],l=u[1],h=u[2],f=u[3],p=n.shape[0],d=o[0],m=o[1],v=ce([p,d,m,f],"float32"),g=this.readSync(n.dataId),x=this.readSync(a.dataId),b=this.readSync(e.dataId),y=e.strides,w=v.strides,C=0;C<p;C++){var S=4*C,I=g[S],k=g[S+1],R=g[S+2],N=g[S+3],A=x[C];if(!(A>=c))for(var L=d>1?(R-I)*(l-1)/(d-1):0,M=m>1?(N-k)*(h-1)/(m-1):0,O=0;O<d;O++){var V=d>1?I*(l-1)+O*L:.5*(I+R)*(l-1);if(V<0||V>l-1)for(var U=0;U<m;U++)for(var W=0;W<f;W++){var z=W+U*w[2]+O*w[1]+C*w[0];v.values[z]=s}else if(i==="bilinear"){var H=Math.floor(V),j=Math.ceil(V),J=V-H;for(U=0;U<m;U++)if((ie=m>1?k*(h-1)+U*M:.5*(k+N)*(h-1))<0||ie>h-1)for(W=0;W<f;W++)z=W+U*w[2]+O*w[1]+C*w[0],v.values[z]=s;else{var re=Math.floor(ie),le=Math.ceil(ie),he=ie-re;for(W=0;W<f;W++){var pe=b[z=W+re*y[2]+H*y[1]+A*y[0]],K=b[z=W+le*y[2]+H*y[1]+A*y[0]],Z=b[z=W+re*y[2]+j*y[1]+A*y[0]],oe=pe+(K-pe)*he,ae=Z+(b[z=W+le*y[2]+j*y[1]+A*y[0]]-Z)*he;z=W+U*w[2]+O*w[1]+C*w[0],v.values[z]=oe+(ae-oe)*J}}}else for(U=0;U<m;++U){var ie;if((ie=m>1?k*(h-1)+U*M:.5*(k+N)*(h-1))<0||ie>h-1)for(W=0;W<f;W++)z=W+U*w[2]+O*w[1]+C*w[0],v.values[z]=s;else{var ve=Math.round(ie),ge=Math.round(V);for(W=0;W<f;W++){var Re=W+ve*y[2]+ge*y[1]+A*y[0],_e=W+U*w[2]+O*w[1]+C*w[0];v.values[_e]=b[Re]}}}}}return v.toTensor()},t.prototype.sparseToDense=function(e,n,a,o){var i=Xr(0,e,a),s=i.sliceRank,u=i.numUpdates,c=i.sliceSize,l=i.strides,h=i.outputSize;return this.scatter(e,n,a,h,c,u,s,l,o,!1)},t.prototype.gatherND=function(e,n){var a=n.shape,o=a[a.length-1],i=cu(e,n),s=i[0],u=i[1],c=i[2],l=i[3];if(u===0)return je([],s,e.dtype);for(var h=new rr([u,c],e.dtype),f=this.readSync(n.dataId),p=this.readSync(e.dataId),d=0;d<u;d++){for(var m=[],v=0,g=0;g<o;g++){var x=f[d*o+g];v+=x*l[g],m.push(x)}if(v<0||v>=e.size/c)throw new Error("Invalid indices: "+m+" does not index into "+e.shape);for(var b=0;b<c;b++)h.values[d*c+b]=p[v*c+b]}return h.toTensor().reshape(s)},t.prototype.scatterND=function(e,n,a){var o=Xr(0,e,a),i=o.sliceRank,s=o.numUpdates,u=o.sliceSize,c=o.strides,l=o.outputSize,h=q(0);return this.scatter(e,n,a,l,u,s,i,c,h,!0)},t.prototype.fill=function(e,n,a){var o=Lr(a=a||cr(n),Q(e));return o.fill(n),T.makeTensor(o,e,a,this)},t.prototype.onesLike=function(e){if(e.dtype==="string")throw new Error("onesLike is not supported for string tensors");return this.fill(e.shape,1,e.dtype)},t.prototype.zerosLike=function(e){var n=Lr(e.dtype,Q(e.shape));return this.makeOutput(n,e.shape,e.dtype)},t.prototype.linspace=function(e,n,a){return gu(e,n,a)},t.prototype.scatter=function(e,n,a,o,i,s,u,c,l,h){var f=[o/i,i],p=this.readSync(e.dataId),d=this.readSync(n.dataId);if(o===0)return je([],a,n.dtype);var m=new rr(f,n.dtype);m.values.fill(this.readSync(l.dataId)[0]);for(var v=0;v<s;v++){for(var g=[],x=0,b=0;b<u;b++){var y=p[v*u+b];g.push(y),x+=y*c[b]}if(x<0||x>=o/i)throw new Error("Invalid indices: "+g+" does not index into "+a);for(var w=0;w<i;w++)h?m.values[x*i+w]+=d[v*i+w]:m.values[x*i+w]=n.rank===0?d[0]:d[v*i+w]}return m.toTensor().reshape(a)},t})(du);T.registerBackend("cpu",(function(){return new dm}),1);for(var ja=0,cs=[{kernelName:"NonMaxSuppressionV5",backendName:"cpu",kernelFunc:function(r){var t=r.inputs,e=r.backend,n=r.attrs,a=t,o=a.boxes,i=a.scores,s=n,u=s.maxOutputSize,c=s.iouThreshold,l=s.scoreThreshold,h=s.softNmsSigma,f=e;G(o,"NonMaxSuppressionWithScore");var p=Mo(f.data.get(o.dataId).values,f.data.get(i.dataId).values,u,c,l,h);return[p.selectedIndices,p.selectedScores]}},{kernelName:"Square",backendName:"cpu",kernelFunc:function(r){var t=r.inputs,e=r.backend,n=t.x,a=e;G(n,"square");for(var o=a.data.get(n.dataId).values,i=new Float32Array(o.length),s=0;s<o.length;++s){var u=o[s];i[s]=u*u}return{dataId:a.write(i,n.shape,n.dtype),shape:n.shape,dtype:n.dtype}}},{kernelName:ir,backendName:"cpu",kernelFunc:function(r){var t=r.inputs,e=r.backend,n=t,a=n.a,o=n.b,i=e;G([a,o],ir);var s=i.data.get(a.dataId).values,u=i.data.get(o.dataId).values,c=(function(f,p,d,m,v,g){var x=me(f,p),b=x.length,y=Tt(x),w=nr(v,Q(x)),C=f.length,S=p.length,I=Tt(f),k=Tt(p),R=Zt(f,x),N=Zt(p,x);if(R.length+N.length===0)for(var A=0;A<w.length;++A)w[A]=g(d[A%d.length],m[A%m.length]);else{var L=function(M){var O=_l(M,b,y),V=O.slice(-C);R.forEach((function(H){return V[H]=0}));var U=Ni(V,C,I),W=O.slice(-S);N.forEach((function(H){return W[H]=0}));var z=Ni(W,S,k);w[M]=g(d[U],m[z])};for(A=0;A<w.length;++A)L(A)}return[w,x]})(a.shape,o.shape,s,u,a.dtype,(function(f,p){var d=f-p;return d*d})),l=c[0],h=c[1];return{dataId:i.write(l,h,a.dtype),shape:h,dtype:a.dtype}}}];ja<cs.length;ja++)Vs(cs[ja]);var Sn,vm=function(r){this.variableNames=["A"];var t=Xe(),e=r[0],n=r[1];this.outputShape=r,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(`+n+".0, "+e+`.0);

        vec4 values = `+t.texture2D+`(A, uv);
        float value;
        if (depth == 0) {
          value = values.r;
        } else if (depth == 1) {
          value = values.g;
        } else if (depth == 2) {
          value = values.b;
        } else if (depth == 3) {
          value = values.a;
        }

        setOutput(floor(value * 255.0 + 0.5));
      }
    `},mm=function(r){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0;var t=Xe(),e=r[0],n=r[1];this.outputShape=r,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];

        vec4 result = vec4(0.);

        for(int row=0; row<=1; row++) {
          for(int col=0; col<=1; col++) {
            texC = coords[1] + row;
            depth = coords[2] + col;

            vec2 uv = (vec2(texC, texR) + halfCR) /
                       vec2(`+n+".0, "+e+`.0);
            vec4 values = `+t.texture2D+`(A, uv);
            float value;
            if (depth == 0) {
              value = values.r;
            } else if (depth == 1) {
              value = values.g;
            } else if (depth == 2) {
              value = values.b;
            } else if (depth == 3) {
              value = values.a;
            }

            result[row * 2 + col] = floor(value * 255.0 + 0.5);
          }
        }

        `+t.output+` = result;
      }
    `};for(var qa=0,ls=[{kernelName:"FromPixels",backendName:"webgl",kernelFunc:function(r){var t=r.inputs,e=r.backend,n=r.attrs,a=t.pixels,o=n.numChannels,i=typeof HTMLVideoElement<"u"&&a instanceof HTMLVideoElement,s=typeof HTMLImageElement<"u"&&a instanceof HTMLImageElement,u=i?[a.videoWidth,a.videoHeight]:[a.width,a.height],c=u[0],l=u[1],h=[l,c],f=[l,c,o];(s||i)&&(Sn==null&&(Sn=document.createElement("canvas").getContext("2d")),Sn.canvas.width=c,Sn.canvas.height=l,Sn.drawImage(a,0,0,c,l),a=Sn.canvas);var p=e.makeTensorInfo(h,"int32");e.texData.get(p.dataId).usage=ct.PIXELS,e.gpgpu.uploadPixelDataToTexture(e.getTexture(p.dataId),a);var d=B().getBool("WEBGL_PACK")?new mm(f):new vm(f),m=e.runWebGLProgram(d,[p],"int32");return e.disposeData(p.dataId),m}},{kernelName:"NonMaxSuppressionV5",backendName:"webgl",kernelFunc:function(r){var t=r.inputs,e=r.backend,n=r.attrs;Vr("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");var a=t,o=a.boxes,i=a.scores,s=n,u=s.maxOutputSize,c=s.iouThreshold,l=s.scoreThreshold,h=s.softNmsSigma,f=e,p=Mo(f.readSync(o.dataId),f.readSync(i.dataId),u,c,l,h);return[p.selectedIndices,p.selectedScores]}},{kernelName:"Square",backendName:"webgl",kernelFunc:function(r){var t=r.inputs,e=r.backend,n=t.x,a=e,o=new fe(n.shape,"return x * x;");return a.runWebGLProgram(o,[n],n.dtype)}},{kernelName:ir,backendName:"webgl",kernelFunc:function(r){var t=r.inputs,e=r.backend,n=t,a=n.a,o=n.b,i=e,s=B().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Vt("return (a - b) * (a - b);",a.shape,o.shape):new Te("return (a - b) * (a - b);",a.shape,o.shape);return i.compileAndRun(s,[a,o])}}];qa<ls.length;qa++)Vs(ls[qa]);for(var Ka=0,hs=[{kernelName:"Square",gradFunc:function(r,t){var e=t[0];return{x:function(){return r.mul(e.toFloat().mul(2))}}}},{kernelName:ir,gradFunc:function(r,t){var e=t[0],n=t[1],a=q(2);return{a:function(){return Ye(r,Ye(a,Le(e,n)))},b:function(){return Ye(r,Ye(a,Le(n,e)))}}}}];Ka<hs.length;Ka++)fl(hs[Ka]);var gm=(function(){function r(){}return r.prototype.fetch=function(t,e){return fetch(t,e)},r.prototype.now=function(){return performance.now()},r.prototype.encode=function(t,e){if(e!=="utf-8"&&e!=="utf8")throw new Error("Browser's encoder only supports utf-8, but got "+e);return this.textEncoder==null&&(this.textEncoder=new TextEncoder),this.textEncoder.encode(t)},r.prototype.decode=function(t,e){return new TextDecoder(e).decode(t)},r})();B().get("IS_BROWSER")&&B().setPlatform("browser",new gm);var Xa,ym=function(){return require("node-fetch")},xm=(function(){function r(){this.util=require("util"),this.textEncoder=new this.util.TextEncoder}return r.prototype.fetch=function(t,e){return B().global.fetch!=null?B().global.fetch(t,e):(Xa==null&&(Xa=ym()),Xa(t,e))},r.prototype.now=function(){var t=process.hrtime();return 1e3*t[0]+t[1]/1e6},r.prototype.encode=function(t,e){if(e!=="utf-8"&&e!=="utf8")throw new Error("Node built-in encoder only supports utf-8, but got "+e);return this.textEncoder.encode(t)},r.prototype.decode=function(t,e){return t.length===0?"":new this.util.TextDecoder(e).decode(t)},r})();B().get("IS_NODE")&&B().setPlatform("node",new xm);var yo={float32:4,int32:4,uint16:2,uint8:1,bool:1},ta=4;function hc(r,t){for(var e={},n=0,a=function(s){var u=s.name,c=s.dtype,l=s.shape,h=Q(l),f=void 0;if("quantization"in s){var p=s.quantization;if(p.dtype!=="uint8"&&p.dtype!=="uint16")throw new Error("Weight "+s.name+" has unknown quantization dtype "+p.dtype+". Supported quantization dtypes are: 'uint8' and 'uint16'.");var d=yo[p.dtype],m=r.slice(n,n+h*d),v=p.dtype==="uint8"?new Uint8Array(m):new Uint16Array(m);if(c==="float32")f=Float32Array.from(v,(function(C){return C*p.scale+p.min}));else{if(c!=="int32")throw new Error("Unsupported dtype in weight '"+u+"': "+c);f=Int32Array.from(v,(function(C){return Math.round(C*p.scale+p.min)}))}n+=h*d}else if(c==="string"){var g=Q(s.shape);f=[];for(var x=0;x<g;x++){var b=new Uint32Array(r.slice(n,n+ta))[0];n+=ta;var y=new Uint8Array(r.slice(n,n+b));f.push(y),n+=b}}else{var w=yo[c];if(m=r.slice(n,n+h*w),c==="float32")f=new Float32Array(m);else if(c==="int32")f=new Int32Array(m);else{if(c!=="bool")throw new Error("Unsupported dtype in weight '"+u+"': "+c);f=new Uint8Array(m)}n+=h*w}e[u]=je(f,l,c)},o=0,i=t;o<i.length;o++)a(i[o]);return e}function bm(r){if(r===null)throw new Error("Invalid input value: "+JSON.stringify(r));var t=0,e=[];r.forEach((function(o){if(t+=o.byteLength,e.push(o.byteLength===o.buffer.byteLength?o:new o.constructor(o)),!(o instanceof Float32Array||o instanceof Int32Array||o instanceof Uint8Array))throw new Error("Unsupported TypedArray subtype: "+o.constructor.name)}));var n=new Uint8Array(t),a=0;return e.forEach((function(o){n.set(new Uint8Array(o.buffer),a),a+=o.byteLength})),n.buffer}var xo=typeof Buffer<"u"&&(typeof Blob>"u"||typeof atob>"u"||typeof btoa>"u");function fs(r){return xo?Buffer.byteLength(r):new Blob([r]).size}function ei(r){var t=0;r.forEach((function(a){t+=a.byteLength}));var e=new Uint8Array(t),n=0;return r.forEach((function(a){e.set(new Uint8Array(a),n),n+=a.byteLength})),e.buffer}function ps(r){for(r=r.trim();r.endsWith("/");)r=r.slice(0,r.length-1);var t=r.split("/");return t[t.length-1]}function mr(r){if(r.modelTopology instanceof ArrayBuffer)throw new Error("Expected JSON model topology, received ArrayBuffer.");return{dateSaved:new Date,modelTopologyType:"JSON",modelTopologyBytes:r.modelTopology==null?0:fs(JSON.stringify(r.modelTopology)),weightSpecsBytes:r.weightSpecs==null?0:fs(JSON.stringify(r.weightSpecs)),weightDataBytes:r.weightData==null?0:r.weightData.byteLength}}var lt=(function(){function r(){this.saveRouters=[],this.loadRouters=[]}return r.getInstance=function(){return r.instance==null&&(r.instance=new r),r.instance},r.registerSaveRouter=function(t){r.getInstance().saveRouters.push(t)},r.registerLoadRouter=function(t){r.getInstance().loadRouters.push(t)},r.getSaveHandlers=function(t){return r.getHandlers(t,"save")},r.getLoadHandlers=function(t,e){return r.getHandlers(t,"load",e)},r.getHandlers=function(t,e,n){var a=[];return(e==="load"?r.getInstance().loadRouters:r.getInstance().saveRouters).forEach((function(o){var i=o(t,n);i!==null&&a.push(i)})),a},r})(),Ln="://",nn=(function(){function r(){this.managers={}}return r.getInstance=function(){return r.instance==null&&(r.instance=new r),r.instance},r.registerManager=function(t,e){E(t!=null,(function(){return"scheme must not be undefined or null."})),t.endsWith(Ln)&&(t=t.slice(0,t.indexOf(Ln))),E(t.length>0,(function(){return"scheme must not be an empty string."}));var n=r.getInstance();E(n.managers[t]==null,(function(){return"A model store manager is already registered for scheme '"+t+"'."})),n.managers[t]=e},r.getManager=function(t){var e=this.getInstance().managers[t];if(e==null)throw new Error("Cannot find model manager for scheme '"+t+"'");return e},r.getSchemes=function(){return Object.keys(this.getInstance().managers)},r})();function Or(r){if(r.indexOf(Ln)===-1)throw new Error("The url string provided does not contain a scheme. Supported schemes are: "+nn.getSchemes().join(","));return{scheme:r.split(Ln)[0],path:r.split(Ln)[1]}}function ds(r,t,e){return e===void 0&&(e=!1),$(this,void 0,void 0,(function(){var n,a,o,i,s,u,c,l,h;return Y(this,(function(f){switch(f.label){case 0:return E(r!==t,(function(){return"Old path and new path are the same: '"+r+"'"})),E((n=lt.getLoadHandlers(r)).length>0,(function(){return"Copying failed because no load handler is found for source URL "+r+"."})),E(n.length<2,(function(){return"Copying failed because more than one ("+n.length+") load handlers for source URL "+r+"."})),a=n[0],E((o=lt.getSaveHandlers(t)).length>0,(function(){return"Copying failed because no save handler is found for destination URL "+t+"."})),E(o.length<2,(function(){return"Copying failed because more than one ("+n.length+") save handlers for destination URL "+t+"."})),i=o[0],s=Or(r).scheme,u=Or(r).path,c=s===Or(r).scheme,[4,a.load()];case 1:return l=f.sent(),e&&c?[4,nn.getManager(s).removeModel(u)]:[3,3];case 2:f.sent(),f.label=3;case 3:return[4,i.save(l)];case 4:return h=f.sent(),!e||c?[3,6]:[4,nn.getManager(s).removeModel(u)];case 5:f.sent(),f.label=6;case 6:return[2,h.modelArtifactsInfo]}}))}))}var vn="models_store",en="model_info_store";function fc(){if(!B().getBool("IS_BROWSER"))throw new Error("Failed to obtain IndexedDB factory because the current environmentis not a web browser.");var r=window||self,t=r.indexedDB||r.mozIndexedDB||r.webkitIndexedDB||r.msIndexedDB||r.shimIndexedDB;if(t==null)throw new Error("The current browser does not appear to support IndexedDB.");return t}function bo(r){var t=r.result;t.createObjectStore(vn,{keyPath:"modelPath"}),t.createObjectStore(en,{keyPath:"modelPath"})}var Wn=(function(){function r(t){if(this.indexedDB=fc(),t==null||!t)throw new Error("For IndexedDB, modelPath must not be null, undefined or empty.");this.modelPath=t}return r.prototype.save=function(t){return $(this,void 0,void 0,(function(){return Y(this,(function(e){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");return[2,this.databaseAction(this.modelPath,t)]}))}))},r.prototype.load=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(t){return[2,this.databaseAction(this.modelPath)]}))}))},r.prototype.databaseAction=function(t,e){var n=this;return new Promise((function(a,o){var i=n.indexedDB.open("tensorflowjs",1);i.onupgradeneeded=function(){return bo(i)},i.onsuccess=function(){var s=i.result;if(e==null){var u=s.transaction(vn,"readonly"),c=u.objectStore(vn).get(n.modelPath);c.onsuccess=function(){if(c.result==null)return s.close(),o(new Error("Cannot find model with path '"+n.modelPath+"' in IndexedDB."));a(c.result.modelArtifacts)},c.onerror=function(m){return s.close(),o(c.error)},u.oncomplete=function(){return s.close()}}else{var l,h=mr(e),f=s.transaction(en,"readwrite"),p=f.objectStore(en),d=p.put({modelPath:n.modelPath,modelArtifactsInfo:h});d.onsuccess=function(){var m=(l=s.transaction(vn,"readwrite")).objectStore(vn).put({modelPath:n.modelPath,modelArtifacts:e,modelArtifactsInfo:h});m.onsuccess=function(){return a({modelArtifactsInfo:h})},m.onerror=function(v){var g=(p=f.objectStore(en)).delete(n.modelPath);g.onsuccess=function(){return s.close(),o(m.error)},g.onerror=function(x){return s.close(),o(m.error)}}},d.onerror=function(m){return s.close(),o(d.error)},f.oncomplete=function(){l==null?s.close():l.oncomplete=function(){return s.close()}}}},i.onerror=function(s){return o(i.error)}}))},r.URL_SCHEME="indexeddb://",r})(),vs=function(r){return B().getBool("IS_BROWSER")&&!Array.isArray(r)&&r.startsWith(Wn.URL_SCHEME)?(t=r.slice(Wn.URL_SCHEME.length),new Wn(t)):null;var t};lt.registerSaveRouter(vs),lt.registerLoadRouter(vs);var wm=(function(){function r(){this.indexedDB=fc()}return r.prototype.listModels=function(){return $(this,void 0,void 0,(function(){var t=this;return Y(this,(function(e){return[2,new Promise((function(n,a){var o=t.indexedDB.open("tensorflowjs",1);o.onupgradeneeded=function(){return bo(o)},o.onsuccess=function(){var i=o.result,s=i.transaction(en,"readonly"),u=s.objectStore(en).getAll();u.onsuccess=function(){for(var c={},l=0,h=u.result;l<h.length;l++){var f=h[l];c[f.modelPath]=f.modelArtifactsInfo}n(c)},u.onerror=function(c){return i.close(),a(u.error)},s.oncomplete=function(){return i.close()}},o.onerror=function(i){return a(o.error)}}))]}))}))},r.prototype.removeModel=function(t){return $(this,void 0,void 0,(function(){var e=this;return Y(this,(function(n){var a;return t=(a=t).startsWith(Wn.URL_SCHEME)?a.slice(Wn.URL_SCHEME.length):a,[2,new Promise((function(o,i){var s=e.indexedDB.open("tensorflowjs",1);s.onupgradeneeded=function(){return bo(s)},s.onsuccess=function(){var u,c=s.result,l=c.transaction(en,"readwrite"),h=l.objectStore(en),f=h.get(t);f.onsuccess=function(){if(f.result==null)return c.close(),i(new Error("Cannot find model with path '"+t+"' in IndexedDB."));var p=h.delete(t),d=function(){var m=(u=c.transaction(vn,"readwrite")).objectStore(vn).delete(t);m.onsuccess=function(){return o(f.result.modelArtifactsInfo)},m.onerror=function(v){return i(f.error)}};p.onsuccess=d,p.onerror=function(m){return d(),c.close(),i(f.error)}},f.onerror=function(p){return c.close(),i(f.error)},l.oncomplete=function(){u==null?c.close():u.oncomplete=function(){return c.close()}}},s.onerror=function(u){return i(s.error)}}))]}))}))},r})();if(B().getBool("IS_BROWSER"))try{nn.registerManager(Wn.URL_SCHEME,new wm)}catch{}var Gt="/",Pn="tensorflowjs_models",pc="info",Cm="model_topology",_m="weight_specs",Em="weight_data",km="model_metadata";function dc(r){return{info:[Pn,r,pc].join(Gt),topology:[Pn,r,Cm].join(Gt),weightSpecs:[Pn,r,_m].join(Gt),weightData:[Pn,r,Em].join(Gt),modelMetadata:[Pn,r,km].join(Gt)}}function Rm(r){var t=r.split(Gt);if(t.length<3)throw new Error("Invalid key format: "+r);return t.slice(1,t.length-1).join(Gt)}var Un=(function(){function r(t){if(!B().getBool("IS_BROWSER")||typeof window>"u"||window.localStorage===void 0)throw new Error("The current environment does not support local storage.");if(this.LS=window.localStorage,t==null||!t)throw new Error("For local storage, modelPath must not be null, undefined or empty.");this.modelPath=t,this.keys=dc(this.modelPath)}return r.prototype.save=function(t){return $(this,void 0,void 0,(function(){var e,n,a;return Y(this,(function(o){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");e=JSON.stringify(t.modelTopology),n=JSON.stringify(t.weightSpecs),a=mr(t);try{return this.LS.setItem(this.keys.info,JSON.stringify(a)),this.LS.setItem(this.keys.topology,e),this.LS.setItem(this.keys.weightSpecs,n),this.LS.setItem(this.keys.weightData,(function(i){if(xo)return Buffer.from(i).toString("base64");for(var s=new Uint8Array(i),u="",c=0,l=s.length;c<l;c++)u+=String.fromCharCode(s[c]);return btoa(u)})(t.weightData)),this.LS.setItem(this.keys.modelMetadata,JSON.stringify({format:t.format,generatedBy:t.generatedBy,convertedBy:t.convertedBy,userDefinedMetadata:t.userDefinedMetadata})),[2,{modelArtifactsInfo:a}]}catch{throw this.LS.removeItem(this.keys.info),this.LS.removeItem(this.keys.topology),this.LS.removeItem(this.keys.weightSpecs),this.LS.removeItem(this.keys.weightData),this.LS.removeItem(this.keys.modelMetadata),new Error("Failed to save model '"+this.modelPath+"' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes="+a.modelTopologyBytes+", weightSpecsBytes="+a.weightSpecsBytes+", weightDataBytes="+a.weightDataBytes+".")}return[2]}))}))},r.prototype.load=function(){return $(this,void 0,void 0,(function(){var t,e,n,a,o,i,s;return Y(this,(function(u){if((t=JSON.parse(this.LS.getItem(this.keys.info)))==null)throw new Error("In local storage, there is no model with name '"+this.modelPath+"'");if(t.modelTopologyType!=="JSON")throw new Error("BrowserLocalStorage does not support loading non-JSON model topology yet.");if(e={},(n=JSON.parse(this.LS.getItem(this.keys.topology)))==null)throw new Error("In local storage, the topology of model '"+this.modelPath+"' is missing.");if(e.modelTopology=n,(a=JSON.parse(this.LS.getItem(this.keys.weightSpecs)))==null)throw new Error("In local storage, the weight specs of model '"+this.modelPath+"' are missing.");if(e.weightSpecs=a,(o=this.LS.getItem(this.keys.modelMetadata))!=null&&(i=JSON.parse(o),e.format=i.format,e.generatedBy=i.generatedBy,e.convertedBy=i.convertedBy,e.userDefinedMetadata=i.userDefinedMetadata),(s=this.LS.getItem(this.keys.weightData))==null)throw new Error("In local storage, the binary weight values of model '"+this.modelPath+"' are missing.");return e.weightData=(function(c){if(xo){var l=Buffer.from(c,"base64");return l.buffer.slice(l.byteOffset,l.byteOffset+l.byteLength)}for(var h=atob(c),f=new Uint8Array(h.length),p=0;p<h.length;++p)f.set([h.charCodeAt(p)],p);return f.buffer})(s),[2,e]}))}))},r.URL_SCHEME="localstorage://",r})(),ms=function(r){return B().getBool("IS_BROWSER")&&!Array.isArray(r)&&r.startsWith(Un.URL_SCHEME)?(t=r.slice(Un.URL_SCHEME.length),new Un(t)):null;var t};lt.registerSaveRouter(ms),lt.registerLoadRouter(ms);var Im=(function(){function r(){E(B().getBool("IS_BROWSER"),(function(){return"Current environment is not a web browser"})),E(typeof window>"u"||window.localStorage!==void 0,(function(){return"Current browser does not appear to support localStorage"})),this.LS=window.localStorage}return r.prototype.listModels=function(){return $(this,void 0,void 0,(function(){var t,e,n,a,o,i;return Y(this,(function(s){for(t={},e=Pn+Gt,n=Gt+pc,a=0;a<this.LS.length;++a)(o=this.LS.key(a)).startsWith(e)&&o.endsWith(n)&&(i=Rm(o),t[i]=JSON.parse(this.LS.getItem(o)));return[2,t]}))}))},r.prototype.removeModel=function(t){return $(this,void 0,void 0,(function(){var e,n;return Y(this,(function(a){var o;if(t=(o=t).startsWith(Un.URL_SCHEME)?o.slice(Un.URL_SCHEME.length):o,e=dc(t),this.LS.getItem(e.info)==null)throw new Error("Cannot find model at path '"+t+"'");return n=JSON.parse(this.LS.getItem(e.info)),this.LS.removeItem(e.info),this.LS.removeItem(e.topology),this.LS.removeItem(e.weightSpecs),this.LS.removeItem(e.weightData),[2,n]}))}))},r})();if(B().getBool("IS_BROWSER"))try{nn.registerManager(Un.URL_SCHEME,new Im)}catch{}var Sm="model",Dm=".json",Am=".weights.bin";function gs(r){return new Promise((function(t){return setTimeout(t)})).then(r)}var $a=(function(){function r(t){if(!B().getBool("IS_BROWSER"))throw new Error("browserDownloads() cannot proceed because the current environment is not a browser.");t.startsWith(r.URL_SCHEME)&&(t=t.slice(r.URL_SCHEME.length)),t!=null&&t.length!==0||(t=Sm),this.modelTopologyFileName=t+Dm,this.weightDataFileName=t+Am}return r.prototype.save=function(t){return $(this,void 0,void 0,(function(){var e,n,a,o,i,s;return Y(this,(function(u){switch(u.label){case 0:if(typeof document>"u")throw new Error("Browser downloads are not supported in this environment since `document` is not present");if(e=window.URL.createObjectURL(new Blob([t.weightData],{type:"application/octet-stream"})),!(t.modelTopology instanceof ArrayBuffer))return[3,1];throw new Error("BrowserDownloads.save() does not support saving model topology in binary formats yet.");case 1:return n=[{paths:["./"+this.weightDataFileName],weights:t.weightSpecs}],a={modelTopology:t.modelTopology,format:t.format,generatedBy:t.generatedBy,convertedBy:t.convertedBy,weightsManifest:n},o=window.URL.createObjectURL(new Blob([JSON.stringify(a)],{type:"application/json"})),(i=this.jsonAnchor==null?document.createElement("a"):this.jsonAnchor).download=this.modelTopologyFileName,i.href=o,[4,gs((function(){return i.dispatchEvent(new MouseEvent("click"))}))];case 2:return u.sent(),t.weightData==null?[3,4]:((s=this.weightDataAnchor==null?document.createElement("a"):this.weightDataAnchor).download=this.weightDataFileName,s.href=e,[4,gs((function(){return s.dispatchEvent(new MouseEvent("click"))}))]);case 3:u.sent(),u.label=4;case 4:return[2,{modelArtifactsInfo:mr(t)}]}}))}))},r.URL_SCHEME="downloads://",r})(),Tm=(function(){function r(t){if(t==null||t.length<1)throw new Error("When calling browserFiles, at least 1 file is required, but received "+t);this.files=t}return r.prototype.load=function(){return $(this,void 0,void 0,(function(){var t,e,n=this;return Y(this,(function(a){return t=this.files[0],e=this.files.slice(1),[2,new Promise((function(o,i){var s=new FileReader;s.onload=function(u){var c=JSON.parse(u.target.result),l=c.modelTopology;if(l!=null){e.length===0&&o({modelTopology:l});var h=c.weightsManifest;if(h!=null){var f;try{f=n.checkManifestAndWeightFiles(h,e)}catch(v){return void i(v)}var p=[],d=[],m=[];h.forEach((function(v){v.paths.forEach((function(g){d.push(g),m.push(null)})),p.push.apply(p,v.weights)})),h.forEach((function(v){v.paths.forEach((function(g){var x=new FileReader;x.onload=function(b){var y=b.target.result,w=d.indexOf(g);m[w]=y,m.indexOf(null)===-1&&o({modelTopology:l,weightSpecs:p,weightData:ei(m),format:c.format,generatedBy:c.generatedBy,convertedBy:c.convertedBy,userDefinedMetadata:c.userDefinedMetadata})},x.onerror=function(b){return i("Failed to weights data from file of path '"+g+"'.")},x.readAsArrayBuffer(f[g])}))}))}else i(new Error("weightManifest field is missing from file "+t.name))}else i(new Error("modelTopology field is missing from file "+t.name))},s.onerror=function(u){return i("Failed to read model topology and weights manifest JSON from file '"+t.name+"'. BrowserFiles supports loading Keras-style tf.Model artifacts only.")},s.readAsText(t)}))]}))}))},r.prototype.checkManifestAndWeightFiles=function(t,e){for(var n=[],a=e.map((function(u){return ps(u.name)})),o={},i=0,s=t;i<s.length;i++)s[i].paths.forEach((function(u){var c=ps(u);if(n.indexOf(c)!==-1)throw new Error("Duplicate file basename found in weights manifest: '"+c+"'");if(n.push(c),a.indexOf(c)===-1)throw new Error("Weight file with basename '"+c+"' is not provided.");o[u]=e[a.indexOf(c)]}));if(n.length!==e.length)throw new Error("Mismatch in the number of files in weights manifest ("+n.length+") and the number of weight files provided ("+e.length+").");return o},r})();function ys(r,t,e,n){(function(o){E(o!=null&&Array.isArray(o)&&o.length>0,(function(){return"promises must be a none empty array"}))})(r),(function(o,i){E(o>=0&&o<=1,(function(){return"Progress fraction must be in range [0, 1], but got startFraction "+o})),E(i>=0&&i<=1,(function(){return"Progress fraction must be in range [0, 1], but got endFraction "+i})),E(i>=o,(function(){return"startFraction must be no more than endFraction, but got startFraction "+o+" and endFraction "+i}))})(e=e??0,n=n??1);var a=0;return Promise.all(r.map((function(o){return o.then((function(i){var s=e+ ++a/r.length*(n-e);return t(s),i})),o})))}function vc(r,t){return $(this,void 0,void 0,(function(){var e,n,a,o,i,s,u,c,l;return Y(this,(function(h){switch(h.label){case 0:return t==null&&(t={}),e=t.fetchFunc==null?B().platform.fetch:t.fetchFunc,n=r.map((function(f){return e(f,t.requestInit,{isBinary:!0})})),a=0,o=.5,t.onProgress!=null?[3,2]:[4,Promise.all(n)];case 1:return i=h.sent(),[3,4];case 2:return[4,ys(n,t.onProgress,a,o)];case 3:i=h.sent(),h.label=4;case 4:return s=i.map((function(f){return f.arrayBuffer()})),u=.5,c=1,t.onProgress!=null?[3,6]:[4,Promise.all(s)];case 5:return l=h.sent(),[3,8];case 6:return[4,ys(s,t.onProgress,u,c)];case 7:l=h.sent(),h.label=8;case 8:return[2,l]}}))}))}function xs(r){var t=this;return function(e,n,a){return n===void 0&&(n=""),$(t,void 0,void 0,(function(){var o,i,s,u,c,l,h,f,p,d;return Y(this,(function(m){switch(m.label){case 0:if(o=e.map((function(){return!1})),i={},s=a!=null?a.map((function(){return!1})):[],u=[],e.forEach((function(v,g){var x=0;v.weights.forEach((function(b){var y="quantization"in b?b.quantization.dtype:b.dtype,w=yo[y]*Q(b.shape),C=function(){o[g]=!0,i[g]==null&&(i[g]=[]),i[g].push({manifestEntry:b,groupOffset:x,sizeBytes:w})};a!=null?a.forEach((function(S,I){S===b.name&&(C(),s[I]=!0)})):C(),u.push(b.name),x+=w}))})),!s.every((function(v){return v})))throw c=a.filter((function(v,g){return!s[g]})),new Error("Could not find weights in manifest with names: "+c.join(", ")+`. 
Manifest JSON has weights with names: `+u.join(", ")+".");return l=o.reduce((function(v,g,x){return g&&v.push(x),v}),[]),h=[],l.forEach((function(v){e[v].paths.forEach((function(g){var x=n+(n.endsWith("/")?"":"/")+g;h.push(x)}))})),[4,r(h)];case 1:return f=m.sent(),p={},d=0,l.forEach((function(v){for(var g=e[v].paths.length,x=0,b=0;b<g;b++)x+=f[d+b].byteLength;for(var y=new ArrayBuffer(x),w=new Uint8Array(y),C=0,S=0;S<g;S++){var I=new Uint8Array(f[d+S]);w.set(I,C),C+=I.byteLength}i[v].forEach((function(k){var R=hc(y.slice(k.groupOffset,k.groupOffset+k.sizeBytes),[k.manifestEntry]);for(var N in R)p[N]=R[N]})),d+=g})),[2,p]}}))}))}}lt.registerSaveRouter((function(r){return B().getBool("IS_BROWSER")&&!Array.isArray(r)&&r.startsWith($a.URL_SCHEME)?(function(t){return t===void 0&&(t="model"),new $a(t)})(r.slice($a.URL_SCHEME.length)):null}));var mc=(function(){function r(t,e){if(this.DEFAULT_METHOD="POST",e==null&&(e={}),this.weightPathPrefix=e.weightPathPrefix,this.onProgress=e.onProgress,e.fetchFunc!=null?(E(typeof e.fetchFunc=="function",(function(){return"Must pass a function that matches the signature of `fetch` (see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)"})),this.fetch=e.fetchFunc):this.fetch=B().platform.fetch,E(t!=null&&t.length>0,(function(){return"URL path for http must not be null, undefined or empty."})),Array.isArray(t)&&E(t.length===2,(function(){return"URL paths for http must have a length of 2, (actual length is "+t.length+")."})),this.path=t,e.requestInit!=null&&e.requestInit.body!=null)throw new Error("requestInit is expected to have no pre-existing body, but has one.");this.requestInit=e.requestInit||{}}return r.prototype.save=function(t){return $(this,void 0,void 0,(function(){var e,n,a,o;return Y(this,(function(i){switch(i.label){case 0:if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserHTTPRequest.save() does not support saving model topology in binary formats yet.");return(e=Object.assign({method:this.DEFAULT_METHOD},this.requestInit)).body=new FormData,n=[{paths:["./model.weights.bin"],weights:t.weightSpecs}],a={modelTopology:t.modelTopology,format:t.format,generatedBy:t.generatedBy,convertedBy:t.convertedBy,userDefinedMetadata:t.userDefinedMetadata,weightsManifest:n},e.body.append("model.json",new Blob([JSON.stringify(a)],{type:"application/json"}),"model.json"),t.weightData!=null&&e.body.append("model.weights.bin",new Blob([t.weightData],{type:"application/octet-stream"}),"model.weights.bin"),[4,this.fetch(this.path,e)];case 1:if((o=i.sent()).ok)return[2,{modelArtifactsInfo:mr(t),responses:[o]}];throw new Error("BrowserHTTPRequest.save() failed due to HTTP response status "+o.status+".")}}))}))},r.prototype.load=function(){return $(this,void 0,void 0,(function(){var t,e,n,a,o,i,s,u,c,l,h,f;return Y(this,(function(p){switch(p.label){case 0:return[4,this.fetch(this.path,this.requestInit)];case 1:if(!(t=p.sent()).ok)throw new Error("Request to "+this.path+" failed with status code "+t.status+". Please verify this URL points to the model JSON of the model to load.");p.label=2;case 2:return p.trys.push([2,4,,5]),[4,t.json()];case 3:return e=p.sent(),[3,5];case 4:throw p.sent(),n="Failed to parse model JSON of response from "+this.path+".",this.path.endsWith(".pb")?n+=" Your path contains a .pb file extension. Support for .pb models have been removed in TensorFlow.js 1.0 in favor of .json models. You can re-convert your Python TensorFlow model using the TensorFlow.js 1.0 conversion scripts or you can convert your.pb models with the 'pb2json'NPM script in the tensorflow/tfjs-converter repository.":n+=" Please make sure the server is serving valid JSON for this request.",new Error(n);case 5:if(a=e.modelTopology,o=e.weightsManifest,i=e.generatedBy,s=e.convertedBy,u=e.format,c=e.userDefinedMetadata,a==null&&o==null)throw new Error("The JSON from HTTP path "+this.path+" contains neither model topology or manifest for weights.");return o==null?[3,7]:[4,this.loadWeights(o)];case 6:f=p.sent(),l=f[0],h=f[1],p.label=7;case 7:return[2,{modelTopology:a,weightSpecs:l,weightData:h,userDefinedMetadata:c,generatedBy:i,convertedBy:s,format:u}]}}))}))},r.prototype.loadWeights=function(t){return $(this,void 0,void 0,(function(){var e,n,a,o,i,s,u,c,l,h,f;return Y(this,(function(p){switch(p.label){case 0:for(e=Array.isArray(this.path)?this.path[1]:this.path,n=(function(d){var m=d.lastIndexOf("/"),v=d.lastIndexOf("?"),g=d.substring(0,m),x=v>m?d.substring(v):"";return[g+"/",x]})(e),a=n[0],o=n[1],i=this.weightPathPrefix||a,s=[],u=0,c=t;u<c.length;u++)l=c[u],s.push.apply(s,l.weights);return h=[],t.forEach((function(d){d.paths.forEach((function(m){h.push(i+m+o)}))})),[4,vc(h,{requestInit:this.requestInit,fetchFunc:this.fetch,onProgress:this.onProgress})];case 1:return f=p.sent(),[2,[s,ei(f)]]}}))}))},r.URL_SCHEME_REGEX=/^https?:\/\//,r})();function wo(r){return r.match(mc.URL_SCHEME_REGEX)!=null}var bs=function(r,t){return typeof fetch>"u"?null:(Array.isArray(r)?r.every((function(e){return wo(e)})):wo(r))?Co(r,{onProgress:t}):null};function Co(r,t){return new mc(r,t)}lt.registerSaveRouter(bs),lt.registerLoadRouter(bs);var Ya=(function(){function r(t){this.modelArtifacts=t}return r.prototype.load=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(t){return[2,this.modelArtifacts]}))}))},r})(),Nm=(function(){function r(t){this.saveHandler=t}return r.prototype.save=function(t){return $(this,void 0,void 0,(function(){return Y(this,(function(e){return[2,this.saveHandler(t)]}))}))},r})(),gc=Object.freeze({browserFiles:function(r){return new Tm(r)},browserHTTPRequest:function(r,t){return Co(r,t)},concatenateArrayBuffers:ei,decodeWeights:hc,encodeWeights:function(r,t){return $(this,void 0,void 0,(function(){var e,n,a,o,i,s=this;return Y(this,(function(u){switch(u.label){case 0:for(e=[],n=[],a=Array.isArray(r)?r.map((function(c){return c.name})):Object.keys(r),o=function(c){var l=a[c],h=Array.isArray(r)?r[c].tensor:r[l];if(h.dtype!=="float32"&&h.dtype!=="int32"&&h.dtype!=="bool"&&h.dtype!=="string")throw new Error("Unsupported dtype in weight '"+l+"': "+h.dtype);var f={name:l,shape:h.shape,dtype:h.dtype};if(h.dtype==="string"){var p=new Promise((function(d){return $(s,void 0,void 0,(function(){var m,v,g,x,b,y,w;return Y(this,(function(C){switch(C.label){case 0:return[4,h.bytes()];case 1:for(m=C.sent(),v=m.reduce((function(S,I){return S+I.length}),0)+ta*m.length,g=new Uint8Array(v),x=0,b=0;b<m.length;b++)y=m[b],w=new Uint8Array(new Uint32Array([y.length]).buffer),g.set(w,x),x+=ta,g.set(y,x),x+=y.length;return d(g),[2]}}))}))}));n.push(p)}else n.push(h.data());t!=null&&(f.group=t),e.push(f)},i=0;i<a.length;++i)o(i);return[4,Promise.all(n)];case 1:return[2,{data:bm(u.sent()),specs:e}]}}))}))},fromMemory:function(r,t,e,n){return arguments.length===1?r.modelTopology!=null||r.weightSpecs!=null?new Ya(r):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Ya({modelTopology:r})):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Ya({modelTopology:r,weightSpecs:t,weightData:e,trainingConfig:n}))},getLoadHandlers:function(r,t){return lt.getLoadHandlers(r,t)},getModelArtifactsInfoForJSON:mr,getSaveHandlers:function(r){return lt.getSaveHandlers(r)},http:Co,isHTTPScheme:wo,loadWeights:function(r,t,e,n){return t===void 0&&(t=""),$(this,void 0,void 0,(function(){return Y(this,(function(a){return[2,xs((function(o){return vc(o,{requestInit:n})}))(r,t,e)]}))}))},registerLoadRouter:function(r){return lt.registerLoadRouter(r)},registerSaveRouter:function(r){return lt.registerSaveRouter(r)},weightsLoaderFactory:xs,withSaveHandler:function(r){return new Nm(r)},copyModel:function(r,t){return $(this,void 0,void 0,(function(){return Y(this,(function(e){return[2,ds(r,t,!1)]}))}))},listModels:function(){return $(this,void 0,void 0,(function(){var r,t,e,n,a,o,i;return Y(this,(function(s){switch(s.label){case 0:r=nn.getSchemes(),t={},e=0,n=r,s.label=1;case 1:return e<n.length?(a=n[e],[4,nn.getManager(a).listModels()]):[3,4];case 2:for(i in o=s.sent())t[a+Ln+i]=o[i];s.label=3;case 3:return e++,[3,1];case 4:return[2,t]}}))}))},moveModel:function(r,t){return $(this,void 0,void 0,(function(){return Y(this,(function(e){return[2,ds(r,t,!0)]}))}))},removeModel:function(r){return $(this,void 0,void 0,(function(){var t;return Y(this,(function(e){return t=Or(r),[2,nn.getManager(t.scheme).removeModel(t.path)]}))}))}}),Dn;D({confusionMatrix_:function(r,t,e){var n=_(r,"labels","confusionMatrix"),a=_(t,"predictions","confusionMatrix");E(e==null||e>0&&Number.isInteger(e),(function(){return"If provided, numClasses must be a positive integer, but got "+e})),E(n.rank===1,(function(){return"Expected the rank of labels to be 1, but got "+n.rank})),E(a.rank===1,(function(){return"Expected the rank of predictions to be 1, but got "+a.rank})),E(n.shape[0]===a.shape[0],(function(){return"Mismatch in the number of examples: "+n.shape[0]+" vs. "+a.shape[0]+". Labels and predictions should have the same number of elements."})),E(e>0&&Number.isInteger(e),(function(){return"numClasses is required to be a positive integer, but got "+e}));var o=fo(n.asType("int32"),e),i=fo(a.asType("int32"),e);return o.transpose().matMul(i).asType("int32")}});var Fm=D({fromPixels_:function(r,t){if(t===void 0&&(t=3),t>4)throw new Error("Cannot construct Tensor with more than 4 channels from pixels.");if(r==null)throw new Error("pixels passed to tf.browser.fromPixels() can not be null");var e=!1,n=!1,a=!1,o=!1,i=!1;if(r.data instanceof Uint8Array)e=!0;else if(typeof ImageData<"u"&&r instanceof ImageData)n=!0;else if(typeof HTMLVideoElement<"u"&&r instanceof HTMLVideoElement)a=!0;else if(typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement)o=!0;else{if(r.getContext==null)throw new Error("pixels passed to tf.browser.fromPixels() must be either an HTMLVideoElement, HTMLImageElement, HTMLCanvasElement, ImageData in browser, or OffscreenCanvas, ImageData in webworker or {data: Uint32Array, width: number, height: number}, but was "+r.constructor.name);i=!0}if(a&&a&&r.readyState<2)throw new Error("The video element has not loaded data yet. Please wait for `loadeddata` event on the <video> element.");if(zs("FromPixels",T.backendName)!=null)return T.runKernel("FromPixels",{pixels:r},{numChannels:t});var s,u,c=a?[r.videoWidth,r.videoHeight]:[r.width,r.height],l=c[0],h=c[1];if(i?s=r.getContext("2d").getImageData(0,0,l,h).data:n||e?s=r.data:(o||a)&&(Dn==null&&(Dn=document.createElement("canvas").getContext("2d")),Dn.canvas.width=l,Dn.canvas.height=h,Dn.drawImage(r,0,0,l,h),s=Dn.getImageData(0,0,l,h).data),t===4)u=new Int32Array(s);else{var f=l*h;u=new Int32Array(f*t);for(var p=0;p<f;p++)for(var d=0;d<t;++d)u[p*t+d]=s[4*p+d]}return Do(u,[h,l,t],"int32")}}),ti=Object.freeze({toPixels:function(r,t){return $(this,void 0,void 0,(function(){var e,n,a,o,i,s,u,c,l,h,f,p,d,m,v,g,x,b,y,w,C,S,I;return Y(this,(function(k){switch(k.label){case 0:if(e=_(r,"img","toPixels"),r instanceof Se||(e=e.toInt()),e.rank!==2&&e.rank!==3)throw new Error("toPixels only supports rank 2 or 3 tensors, got rank "+e.rank+".");if(n=e.shape.slice(0,2),a=n[0],o=n[1],(i=e.rank===2?1:e.shape[2])>4||i===2)throw new Error("toPixels only supports depth of size 1, 3 or 4 but got "+i);return[4,e.data()];case 1:return s=k.sent(),u=e.min(),c=e.max(),[4,Promise.all([u.data(),c.data()])];case 2:if(l=k.sent(),h=l[0],f=l[1],p=h[0],d=f[0],u.dispose(),c.dispose(),e.dtype==="float32"){if(p<0||d>1)throw new Error("Tensor values for a float32 Tensor must be in the range [0 - 1] but got range ["+p+" - "+d+"].")}else{if(e.dtype!=="int32")throw new Error("Unsupported type for toPixels: "+e.dtype+". Please use float32 or int32 tensors.");if(p<0||d>255)throw new Error("Tensor values for a int32 Tensor must be in the range [0 - 255] but got range ["+p+" - "+d+"].")}for(m=e.dtype==="float32"?255:1,v=new Uint8ClampedArray(o*a*4),g=0;g<a*o;++g)x=void 0,b=void 0,y=void 0,w=void 0,i===1?(x=s[g]*m,b=s[g]*m,y=s[g]*m,w=255):i===3?(x=s[3*g]*m,b=s[3*g+1]*m,y=s[3*g+2]*m,w=255):i===4&&(x=s[4*g]*m,b=s[4*g+1]*m,y=s[4*g+2]*m,w=s[4*g+3]*m),v[(C=4*g)+0]=Math.round(x),v[C+1]=Math.round(b),v[C+2]=Math.round(y),v[C+3]=Math.round(w);return t!=null&&(t.width=o,t.height=a,S=t.getContext("2d"),I=new ImageData(v,o,a),S.putImageData(I,0,0)),e!==r&&e.dispose(),[2,v]}}))}))},fromPixels:Fm}),Pm=(function(){function r(){}return r.prototype.getClassName=function(){return this.constructor.className},r.fromConfig=function(t,e){return new t(e)},r})(),Mm=(function(){function r(){this.classNameMap={}}return r.getMap=function(){return r.instance==null&&(r.instance=new r),r.instance},r.register=function(t){r.getMap().classNameMap[t.className]=[t,t.fromConfig]},r})();function Cn(r){E(r.className!=null,(function(){return"Class being registered does not have the static className property defined."})),E(typeof r.className=="string",(function(){return"className is required to be a string, but got type "+typeof r.className})),E(r.className.length>0,(function(){return"Class being registered has an empty-string as its className, which is disallowed."})),Mm.register(r)}var _n=(function(r){function t(){return r!==null&&r.apply(this,arguments)||this}return bt(t,r),t.prototype.minimize=function(e,n,a){n===void 0&&(n=!1);var o=this.computeGradients(e,a),i=o.value,s=o.grads;if(a!=null){var u=a.map((function(c){return{name:c.name,tensor:s[c.name]}}));this.applyGradients(u)}else this.applyGradients(s);return tt(s),n?i:(i.dispose(),null)},Object.defineProperty(t.prototype,"iterations",{get:function(){return this.iterations_==null&&(this.iterations_=0),this.iterations_},enumerable:!0,configurable:!0}),t.prototype.incrementIterations=function(){this.iterations_=this.iterations+1},t.prototype.computeGradients=function(e,n){return Hh(e,n)},t.prototype.dispose=function(){this.iterations_!=null&&tt(this.iterations_)},t.prototype.saveIterations=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(e){return this.iterations_==null&&(this.iterations_=0),[2,{name:"iter",tensor:q(this.iterations_,"int32")}]}))}))},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(e){throw new Error("getWeights() is not implemented for this optimizer yet.")}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){return Y(this,(function(n){throw new Error("setWeights() is not implemented for this optimizer class "+this.getClassName())}))}))},t.prototype.extractIterations=function(e){return $(this,void 0,void 0,(function(){var n;return Y(this,(function(a){switch(a.label){case 0:return n=this,[4,e[0].tensor.data()];case 1:return n.iterations_=a.sent()[0],[2,e.slice(1)]}}))}))},t})(Pm);Object.defineProperty(_n,Symbol.hasInstance,{value:function(r){return r.minimize!=null&&r.computeGradients!=null&&r.applyGradients!=null}});var Om=(function(r){function t(e,n,a){a===void 0&&(a=null);var o=r.call(this)||this;return o.learningRate=e,o.rho=n,o.epsilon=a,o.accumulatedGrads=[],o.accumulatedUpdates=[],a==null&&(o.epsilon=T.backend.epsilon()),o}return bt(t,r),t.prototype.applyGradients=function(e){var n=this;(Array.isArray(e)?e.map((function(a){return a.name})):Object.keys(e)).forEach((function(a,o){var i=T.registeredVariables[a];n.accumulatedGrads[o]==null&&(n.accumulatedGrads[o]={originalName:a+"/accum_grad",variable:X((function(){return xe(i).variable(!1)}))}),n.accumulatedUpdates[o]==null&&(n.accumulatedUpdates[o]={originalName:a+"/accum_var",variable:X((function(){return xe(i).variable(!1)}))});var s=Array.isArray(e)?e[o].tensor:e[a];if(s!=null){var u=n.accumulatedGrads[o].variable,c=n.accumulatedUpdates[o].variable;X((function(){var l=u.mul(n.rho).add(s.square().mul(1-n.rho)),h=c.add(n.epsilon).sqrt().div(u.add(n.epsilon).sqrt()).mul(s),f=c.mul(n.rho).add(h.square().mul(1-n.rho));u.assign(l),c.assign(f);var p=h.mul(-n.learningRate).add(i);i.assign(p)}))}})),this.incrementIterations()},t.prototype.dispose=function(){this.accumulatedUpdates!=null&&(tt(this.accumulatedGrads.map((function(e){return e.variable}))),tt(this.accumulatedUpdates.map((function(e){return e.variable}))))},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){var e;return Y(this,(function(n){switch(n.label){case 0:return e=this.accumulatedGrads.concat(this.accumulatedUpdates),[4,this.saveIterations()];case 1:return[2,[n.sent()].concat(e.map((function(a){return{name:a.originalName,tensor:a.variable}})))]}}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){var n;return Y(this,(function(a){switch(a.label){case 0:return[4,this.extractIterations(e)];case 1:return e=a.sent(),n=e.length/2,this.accumulatedGrads=e.slice(0,n).map((function(o){return{originalName:o.name,variable:o.tensor.variable(!1)}})),this.accumulatedUpdates=e.slice(n,2*n).map((function(o){return{originalName:o.name,variable:o.tensor.variable(!1)}})),[2]}}))}))},t.prototype.getConfig=function(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}},t.fromConfig=function(e,n){return new e(n.learningRate,n.rho,n.epsilon)},t.className="Adadelta",t})(_n);Cn(Om);var Bm=(function(r){function t(e,n){n===void 0&&(n=.1);var a=r.call(this)||this;return a.learningRate=e,a.initialAccumulatorValue=n,a.accumulatedGrads=[],a}return bt(t,r),t.prototype.applyGradients=function(e){var n=this;(Array.isArray(e)?e.map((function(a){return a.name})):Object.keys(e)).forEach((function(a,o){var i=T.registeredVariables[a];n.accumulatedGrads[o]==null&&(n.accumulatedGrads[o]={originalName:a+"/accumulator",variable:X((function(){return Nt(i.shape,n.initialAccumulatorValue).variable(!1)}))});var s=Array.isArray(e)?e[o].tensor:e[a];if(s!=null){var u=n.accumulatedGrads[o].variable;X((function(){var c=u.add(s.square());u.assign(c);var l=s.div(c.add(T.backend.epsilon()).sqrt()).mul(-n.learningRate).add(i);i.assign(l)}))}})),this.incrementIterations()},t.prototype.dispose=function(){this.accumulatedGrads!=null&&tt(this.accumulatedGrads.map((function(e){return e.variable})))},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(e){switch(e.label){case 0:return[4,this.saveIterations()];case 1:return[2,[e.sent()].concat(this.accumulatedGrads.map((function(n){return{name:n.originalName,tensor:n.variable}})))]}}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){return Y(this,(function(n){switch(n.label){case 0:return[4,this.extractIterations(e)];case 1:return e=n.sent(),this.accumulatedGrads=e.map((function(a){return{originalName:a.name,variable:a.tensor.variable(!1)}})),[2]}}))}))},t.prototype.getConfig=function(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}},t.fromConfig=function(e,n){return new e(n.learningRate,n.initialAccumulatorValue)},t.className="Adagrad",t})(_n);Cn(Bm);var Lm=(function(r){function t(e,n,a,o){o===void 0&&(o=null);var i=r.call(this)||this;return i.learningRate=e,i.beta1=n,i.beta2=a,i.epsilon=o,i.accumulatedFirstMoment=[],i.accumulatedSecondMoment=[],X((function(){i.accBeta1=q(n).variable(),i.accBeta2=q(a).variable()})),o==null&&(i.epsilon=T.backend.epsilon()),i}return bt(t,r),t.prototype.applyGradients=function(e){var n=this,a=Array.isArray(e)?e.map((function(o){return o.name})):Object.keys(e);X((function(){var o=Le(1,n.accBeta1),i=Le(1,n.accBeta2);a.forEach((function(s,u){var c=T.registeredVariables[s];n.accumulatedFirstMoment[u]==null&&(n.accumulatedFirstMoment[u]={originalName:s+"/m",variable:X((function(){return xe(c).variable(!1)}))}),n.accumulatedSecondMoment[u]==null&&(n.accumulatedSecondMoment[u]={originalName:s+"/v",variable:X((function(){return xe(c).variable(!1)}))});var l=Array.isArray(e)?e[u].tensor:e[s];if(l!=null){var h=n.accumulatedFirstMoment[u].variable,f=n.accumulatedSecondMoment[u].variable,p=h.mul(n.beta1).add(l.mul(1-n.beta1)),d=f.mul(n.beta2).add(l.square().mul(1-n.beta2)),m=p.div(o),v=d.div(i);h.assign(p),f.assign(d);var g=m.div(v.sqrt().add(n.epsilon)).mul(-n.learningRate).add(c);c.assign(g)}})),n.accBeta1.assign(n.accBeta1.mul(n.beta1)),n.accBeta2.assign(n.accBeta2.mul(n.beta2))})),this.incrementIterations()},t.prototype.dispose=function(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&tt(this.accumulatedFirstMoment.map((function(e){return e.variable}))),this.accumulatedSecondMoment!=null&&tt(this.accumulatedSecondMoment.map((function(e){return e.variable})))},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){var e;return Y(this,(function(n){switch(n.label){case 0:return e=this.accumulatedFirstMoment.concat(this.accumulatedSecondMoment),[4,this.saveIterations()];case 1:return[2,[n.sent()].concat(e.map((function(a){return{name:a.originalName,tensor:a.variable}})))]}}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){var n,a=this;return Y(this,(function(o){switch(o.label){case 0:return[4,this.extractIterations(e)];case 1:return e=o.sent(),X((function(){a.accBeta1.assign(Zr(a.beta1,a.iterations_+1)),a.accBeta2.assign(Zr(a.beta2,a.iterations_+1))})),n=e.length/2,this.accumulatedFirstMoment=e.slice(0,n).map((function(i){return{originalName:i.name,variable:i.tensor.variable(!1)}})),this.accumulatedSecondMoment=e.slice(n,2*n).map((function(i){return{originalName:i.name,variable:i.tensor.variable(!1)}})),[2]}}))}))},t.prototype.getConfig=function(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}},t.fromConfig=function(e,n){return new e(n.learningRate,n.beta1,n.beta2,n.epsilon)},t.className="Adam",t})(_n);Cn(Lm);var Wm=(function(r){function t(e,n,a,o,i){o===void 0&&(o=null),i===void 0&&(i=0);var s=r.call(this)||this;return s.learningRate=e,s.beta1=n,s.beta2=a,s.epsilon=o,s.decay=i,s.accumulatedFirstMoment=[],s.accumulatedWeightedInfNorm=[],X((function(){s.iteration=q(0).variable(),s.accBeta1=q(n).variable()})),o==null&&(s.epsilon=T.backend.epsilon()),s}return bt(t,r),t.prototype.applyGradients=function(e){var n=this,a=Array.isArray(e)?e.map((function(o){return o.name})):Object.keys(e);X((function(){var o=Le(1,n.accBeta1),i=gt(-n.learningRate,n.iteration.mul(n.decay).add(1));a.forEach((function(s,u){var c=T.registeredVariables[s];n.accumulatedFirstMoment[u]==null&&(n.accumulatedFirstMoment[u]={originalName:s+"/m",variable:xe(c).variable(!1)}),n.accumulatedWeightedInfNorm[u]==null&&(n.accumulatedWeightedInfNorm[u]={originalName:s+"/v",variable:xe(c).variable(!1)});var l=Array.isArray(e)?e[u].tensor:e[s];if(l!=null){var h=n.accumulatedFirstMoment[u].variable,f=n.accumulatedWeightedInfNorm[u].variable,p=h.mul(n.beta1).add(l.mul(1-n.beta1)),d=f.mul(n.beta2),m=l.abs(),v=d.maximum(m);h.assign(p),f.assign(v);var g=i.div(o).mul(p.div(v.add(n.epsilon))).add(c);c.assign(g)}})),n.iteration.assign(n.iteration.add(1)),n.accBeta1.assign(n.accBeta1.mul(n.beta1))})),this.incrementIterations()},t.prototype.dispose=function(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&tt(this.accumulatedFirstMoment.map((function(e){return e.variable}))),this.accumulatedWeightedInfNorm!=null&&tt(this.accumulatedWeightedInfNorm.map((function(e){return e.variable})))},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(e){throw new Error("getWeights() is not implemented for Adamax yet.")}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){return Y(this,(function(n){throw new Error("setWeights() is not implemented for Adamax yet.")}))}))},t.prototype.getConfig=function(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}},t.fromConfig=function(e,n){return new e(n.learningRate,n.beta1,n.beta2,n.epsilon,n.decay)},t.className="Adamax",t})(_n);Cn(Wm);var yc=(function(r){function t(e){var n=r.call(this)||this;return n.learningRate=e,n.setLearningRate(e),n}return bt(t,r),t.prototype.applyGradients=function(e){var n=this;(Array.isArray(e)?e.map((function(a){return a.name})):Object.keys(e)).forEach((function(a,o){var i=Array.isArray(e)?e[o].tensor:e[a];if(i!=null){var s=T.registeredVariables[a];X((function(){var u=n.c.mul(i).add(s);s.assign(u)}))}})),this.incrementIterations()},t.prototype.setLearningRate=function(e){this.learningRate=e,this.c!=null&&this.c.dispose(),this.c=ah(q(-e))},t.prototype.dispose=function(){this.c.dispose()},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(e){switch(e.label){case 0:return[4,this.saveIterations()];case 1:return[2,[e.sent()]]}}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){return Y(this,(function(n){switch(n.label){case 0:return[4,this.extractIterations(e)];case 1:if((e=n.sent()).length!==0)throw new Error("SGD optimizer does not have settable weights.");return[2]}}))}))},t.prototype.getConfig=function(){return{learningRate:this.learningRate}},t.fromConfig=function(e,n){return new e(n.learningRate)},t.className="SGD",t})(_n);Cn(yc);var Um=(function(r){function t(e,n,a){a===void 0&&(a=!1);var o=r.call(this,e)||this;return o.learningRate=e,o.momentum=n,o.useNesterov=a,o.accumulations=[],o.m=q(o.momentum),o}return bt(t,r),t.prototype.applyGradients=function(e){var n=this;(Array.isArray(e)?e.map((function(a){return a.name})):Object.keys(e)).forEach((function(a,o){var i=T.registeredVariables[a];n.accumulations[o]==null&&(n.accumulations[o]={originalName:a+"/momentum",variable:X((function(){return xe(i).variable(!1)}))});var s=n.accumulations[o].variable,u=Array.isArray(e)?e[o].tensor:e[a];u!=null&&X((function(){var c,l=n.m.mul(s).add(u);c=n.useNesterov?n.c.mul(u.add(l.mul(n.m))).add(i):n.c.mul(l).add(i),s.assign(l),i.assign(c)}))})),this.incrementIterations()},t.prototype.dispose=function(){this.m.dispose(),this.accumulations!=null&&tt(this.accumulations.map((function(e){return e.variable})))},t.prototype.setMomentum=function(e){this.momentum=e},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){return Y(this,(function(e){switch(e.label){case 0:return[4,this.saveIterations()];case 1:return[2,[e.sent()].concat(this.accumulations.map((function(n){return{name:n.originalName,tensor:n.variable}})))]}}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){return Y(this,(function(n){switch(n.label){case 0:return[4,this.extractIterations(e)];case 1:return e=n.sent(),this.accumulations=e.map((function(a){return{originalName:a.name,variable:a.tensor.variable(!1)}})),[2]}}))}))},t.prototype.getConfig=function(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}},t.fromConfig=function(e,n){return new e(n.learningRate,n.momentum,n.useNesterov)},t.className="Momentum",t})(yc);Cn(Um);var zm=(function(r){function t(e,n,a,o,i){n===void 0&&(n=.9),a===void 0&&(a=0),o===void 0&&(o=null),i===void 0&&(i=!1);var s=r.call(this)||this;if(s.learningRate=e,s.decay=n,s.momentum=a,s.epsilon=o,s.accumulatedMeanSquares=[],s.accumulatedMoments=[],s.accumulatedMeanGrads=[],s.centered=i,o==null&&(s.epsilon=T.backend.epsilon()),e==null)throw new Error("learningRate for RMSPropOptimizer must be defined.");return s}return bt(t,r),t.prototype.applyGradients=function(e){var n=this;(Array.isArray(e)?e.map((function(a){return a.name})):Object.keys(e)).forEach((function(a,o){var i=T.registeredVariables[a];n.accumulatedMeanSquares[o]==null&&(n.accumulatedMeanSquares[o]={originalName:a+"/rms",variable:X((function(){return xe(i).variable(!1)}))}),n.accumulatedMoments[o]==null&&(n.accumulatedMoments[o]={originalName:a+"/momentum",variable:X((function(){return xe(i).variable(!1)}))}),n.accumulatedMeanGrads[o]==null&&n.centered&&(n.accumulatedMeanGrads[o]={originalName:a+"/mg",variable:X((function(){return xe(i).variable(!1)}))});var s=Array.isArray(e)?e[o].tensor:e[a];if(s!=null){var u=n.accumulatedMeanSquares[o].variable,c=n.accumulatedMoments[o].variable;X((function(){var l=u.mul(n.decay).add(s.square().mul(1-n.decay));if(n.centered){var h=n.accumulatedMeanGrads[o].variable,f=h.mul(n.decay).add(s.mul(1-n.decay)),p=c.mul(n.momentum).add(s.mul(n.learningRate).div(l.sub(f.square().add(n.epsilon)).sqrt()));u.assign(l),h.assign(f),c.assign(p);var d=i.sub(p);i.assign(d)}else{var m=u.mul(n.decay).add(s.square().mul(1-n.decay));p=c.mul(n.momentum).add(s.mul(n.learningRate).div(m.add(n.epsilon).sqrt())),u.assign(m),c.assign(p),d=i.sub(p),i.assign(d)}}))}})),this.incrementIterations()},t.prototype.dispose=function(){this.accumulatedMeanSquares!=null&&tt(this.accumulatedMeanSquares.map((function(e){return e.variable}))),this.accumulatedMeanGrads!=null&&this.centered&&tt(this.accumulatedMeanGrads.map((function(e){return e.variable}))),this.accumulatedMoments!=null&&tt(this.accumulatedMoments.map((function(e){return e.variable})))},t.prototype.getWeights=function(){return $(this,void 0,void 0,(function(){var e;return Y(this,(function(n){switch(n.label){case 0:return e=this.accumulatedMeanSquares.concat(this.accumulatedMoments),this.centered&&e.push.apply(e,this.accumulatedMeanGrads),[4,this.saveIterations()];case 1:return[2,[n.sent()].concat(e.map((function(a){return{name:a.originalName,tensor:a.variable}})))]}}))}))},t.prototype.setWeights=function(e){return $(this,void 0,void 0,(function(){var n;return Y(this,(function(a){switch(a.label){case 0:return[4,this.extractIterations(e)];case 1:return e=a.sent(),n=this.centered?e.length/3:e.length/2,this.accumulatedMeanSquares=e.slice(0,n).map((function(o){return{originalName:o.name,variable:o.tensor.variable(!1)}})),this.accumulatedMoments=e.slice(n,2*n).map((function(o){return{originalName:o.name,variable:o.tensor.variable(!1)}})),this.centered&&(this.accumulatedMeanGrads=e.slice(2*n,3*n).map((function(o){return{originalName:o.name,variable:o.tensor.variable(!1)}}))),[2]}}))}))},t.prototype.getConfig=function(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}},t.fromConfig=function(e,n){return new e(n.learningRate,n.decay,n.momentum,n.epsilon,n.centered)},t.className="RMSProp",t})(_n);Cn(zm);Se.prototype.squaredDifference=function(r){return Fu(this,r)},P=pm;var _o=function(r,t){return _o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var a in n)n.hasOwnProperty(a)&&(e[a]=n[a])},_o(r,t)};function ue(r,t){_o(r,t);function e(){this.constructor=r}r.prototype=t===null?Object.create(t):(e.prototype=t.prototype,new e)}var Ke=function(){return Ke=Object.assign||function(t){for(var e,n=1,a=arguments.length;n<a;n++){e=arguments[n];for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])}return t},Ke.apply(this,arguments)};function te(r,t,e,n){function a(o){return o instanceof e?o:new e(function(i){i(o)})}return new(e||(e=Promise))(function(o,i){function s(l){try{c(n.next(l))}catch(h){i(h)}}function u(l){try{c(n.throw(l))}catch(h){i(h)}}function c(l){l.done?o(l.value):a(l.value).then(s,u)}c((n=n.apply(r,[])).next())})}function ne(r,t){var e={label:0,sent:function(){if(o[0]&1)throw o[1];return o[1]},trys:[],ops:[]},n,a,o,i;return i={next:s(0),throw:s(1),return:s(2)},typeof Symbol=="function"&&(i[Symbol.iterator]=function(){return this}),i;function s(c){return function(l){return u([c,l])}}function u(c){if(n)throw new TypeError("Generator is already executing.");for(;e;)try{if(n=1,a&&(o=c[0]&2?a.return:c[0]?a.throw||((o=a.return)&&o.call(a),0):a.next)&&!(o=o.call(a,c[1])).done)return o;switch(a=0,o&&(c=[c[0]&2,o.value]),c[0]){case 0:case 1:o=c;break;case 4:return e.label++,{value:c[1],done:!1};case 5:e.label++,a=c[1],c=[0];continue;case 7:c=e.ops.pop(),e.trys.pop();continue;default:if(o=e.trys,!(o=o.length>0&&o[o.length-1])&&(c[0]===6||c[0]===2)){e=0;continue}if(c[0]===3&&(!o||c[1]>o[0]&&c[1]<o[3])){e.label=c[1];break}if(c[0]===6&&e.label<o[1]){e.label=o[1],o=c;break}if(o&&e.label<o[2]){e.label=o[2],e.ops.push(c);break}o[2]&&e.ops.pop(),e.trys.pop();continue}c=t.call(r,e)}catch(l){c=[6,l],a=0}finally{n=o=0}if(c[0]&5)throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}}function tr(){for(var r=0,t=0,e=arguments.length;t<e;t++)r+=arguments[t].length;for(var n=Array(r),a=0,t=0;t<e;t++)for(var o=arguments[t],i=0,s=o.length;i<s;i++,a++)n[a]=o[i];return n}var zn=(function(){function r(t,e){if(!mn(t)||!mn(e))throw new Error("Dimensions.constructor - expected width and height to be valid numbers, instead have "+JSON.stringify({width:t,height:e}));this._width=t,this._height=e}return Object.defineProperty(r.prototype,"width",{get:function(){return this._width},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"height",{get:function(){return this._height},enumerable:!0,configurable:!0}),r.prototype.reverse=function(){return new r(1/this.width,1/this.height)},r})();function ma(r,t){return r instanceof Se&&r.shape.length===t}function Vm(r){return ma(r,2)}function ga(r){return ma(r,3)}function rn(r){return ma(r,4)}function Gm(r){return r%1!==0}function ws(r){return r%2===0}function Hm(r,t){t===void 0&&(t=2);var e=Math.pow(10,t);return Math.floor(r*e)/e}function Cs(r){return r&&r.width&&r.height}function jm(r,t){var e=r.width,n=r.height,a=t/Math.max(n,e);return new zn(Math.round(e*a),Math.round(n*a))}function ni(r){return r.reduce(function(t,e){return t.add(e)},new be(0,0)).div(new be(r.length,r.length))}function sr(r,t,e){return Array(r).fill(0).map(function(n,a){return t+a*e})}function mn(r){return!!r&&r!==1/0&&r!==-1/0&&!isNaN(r)||r===0}function _s(r){return mn(r)&&0<=r&&r<=1}var be=(function(){function r(t,e){this._x=t,this._y=e}return Object.defineProperty(r.prototype,"x",{get:function(){return this._x},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"y",{get:function(){return this._y},enumerable:!0,configurable:!0}),r.prototype.add=function(t){return new r(this.x+t.x,this.y+t.y)},r.prototype.sub=function(t){return new r(this.x-t.x,this.y-t.y)},r.prototype.mul=function(t){return new r(this.x*t.x,this.y*t.y)},r.prototype.div=function(t){return new r(this.x/t.x,this.y/t.y)},r.prototype.abs=function(){return new r(Math.abs(this.x),Math.abs(this.y))},r.prototype.magnitude=function(){return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2))},r.prototype.floor=function(){return new r(Math.floor(this.x),Math.floor(this.y))},r})(),on=(function(){function r(t,e){e===void 0&&(e=!0);var n=t||{},a=[n.left,n.top,n.right,n.bottom].every(mn),o=[n.x,n.y,n.width,n.height].every(mn);if(!o&&!a)throw new Error("Box.constructor - expected box to be IBoundingBox | IRect, instead have "+JSON.stringify(n));var i=o?[n.x,n.y,n.width,n.height]:[n.left,n.top,n.right-n.left,n.bottom-n.top],s=i[0],u=i[1],c=i[2],l=i[3];r.assertIsValidBox({x:s,y:u,width:c,height:l},"Box.constructor",e),this._x=s,this._y=u,this._width=c,this._height=l}return r.isRect=function(t){return!!t&&[t.x,t.y,t.width,t.height].every(mn)},r.assertIsValidBox=function(t,e,n){if(n===void 0&&(n=!1),!r.isRect(t))throw new Error(e+" - invalid box: "+JSON.stringify(t)+", expected object with properties x, y, width, height");if(!n&&(t.width<0||t.height<0))throw new Error(e+" - width ("+t.width+") and height ("+t.height+") must be positive numbers")},Object.defineProperty(r.prototype,"x",{get:function(){return this._x},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"y",{get:function(){return this._y},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"width",{get:function(){return this._width},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"height",{get:function(){return this._height},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"left",{get:function(){return this.x},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"top",{get:function(){return this.y},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"right",{get:function(){return this.x+this.width},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"bottom",{get:function(){return this.y+this.height},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"area",{get:function(){return this.width*this.height},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"topLeft",{get:function(){return new be(this.left,this.top)},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"topRight",{get:function(){return new be(this.right,this.top)},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"bottomLeft",{get:function(){return new be(this.left,this.bottom)},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"bottomRight",{get:function(){return new be(this.right,this.bottom)},enumerable:!0,configurable:!0}),r.prototype.round=function(){var t=[this.x,this.y,this.width,this.height].map(function(i){return Math.round(i)}),e=t[0],n=t[1],a=t[2],o=t[3];return new r({x:e,y:n,width:a,height:o})},r.prototype.floor=function(){var t=[this.x,this.y,this.width,this.height].map(function(i){return Math.floor(i)}),e=t[0],n=t[1],a=t[2],o=t[3];return new r({x:e,y:n,width:a,height:o})},r.prototype.toSquare=function(){var t=this,e=t.x,n=t.y,a=t.width,o=t.height,i=Math.abs(a-o);return a<o&&(e-=i/2,a+=i),o<a&&(n-=i/2,o+=i),new r({x:e,y:n,width:a,height:o})},r.prototype.rescale=function(t){var e=Cs(t)?t.width:t,n=Cs(t)?t.height:t;return new r({x:this.x*e,y:this.y*n,width:this.width*e,height:this.height*n})},r.prototype.pad=function(t,e){var n=[this.x-t/2,this.y-e/2,this.width+t,this.height+e],a=n[0],o=n[1],i=n[2],s=n[3];return new r({x:a,y:o,width:i,height:s})},r.prototype.clipAtImageBorders=function(t,e){var n=this,a=n.x,o=n.y,i=n.right,s=n.bottom,u=Math.max(a,0),c=Math.max(o,0),l=i-u,h=s-c,f=Math.min(l,t-u),p=Math.min(h,e-c);return new r({x:u,y:c,width:f,height:p}).floor()},r.prototype.shift=function(t,e){var n=this,a=n.width,o=n.height,i=this.x+t,s=this.y+e;return new r({x:i,y:s,width:a,height:o})},r.prototype.padAtBorders=function(t,e){var n=this.width+1,a=this.height+1,o=1,i=1,s=n,u=a,c=this.left,l=this.top,h=this.right,f=this.bottom;return h>e&&(s=-h+e+n,h=e),f>t&&(u=-f+t+a,f=t),c<1&&(u=2-c,c=1),l<1&&(u=2-l,l=1),{dy:i,edy:u,dx:o,edx:s,y:l,ey:f,x:c,ex:h,w:n,h:a}},r.prototype.calibrate=function(t){return new r({left:this.left+t.left*this.width,top:this.top+t.top*this.height,right:this.right+t.right*this.width,bottom:this.bottom+t.bottom*this.height}).toSquare().round()},r})(),ya=(function(r){ue(t,r);function t(e,n,a,o,i){return i===void 0&&(i=!1),r.call(this,{left:e,top:n,right:a,bottom:o},i)||this}return t})(on),xc=(function(){function r(t,e,n,a,o){this._imageDims=new zn(o.width,o.height),this._score=t,this._classScore=e,this._className=n,this._box=new on(a).rescale(this._imageDims)}return Object.defineProperty(r.prototype,"score",{get:function(){return this._score},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"classScore",{get:function(){return this._classScore},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"className",{get:function(){return this._className},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"box",{get:function(){return this._box},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"imageDims",{get:function(){return this._imageDims},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"imageWidth",{get:function(){return this.imageDims.width},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"imageHeight",{get:function(){return this.imageDims.height},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"relativeBox",{get:function(){return new on(this._box).rescale(this.imageDims.reverse())},enumerable:!0,configurable:!0}),r.prototype.forSize=function(t,e){return new r(this.score,this.classScore,this.className,this.relativeBox,{width:t,height:e})},r})(),Bt=(function(r){ue(t,r);function t(e,n,a){return r.call(this,e,e,"",n,a)||this}return t.prototype.forSize=function(e,n){var a=r.prototype.forSize.call(this,e,n),o=a.score,i=a.relativeBox,s=a.imageDims;return new t(o,i,s)},t})(xc);function qm(r,t,e){e===void 0&&(e=!0);var n=Math.max(0,Math.min(r.right,t.right)-Math.max(r.left,t.left)),a=Math.max(0,Math.min(r.bottom,t.bottom)-Math.max(r.top,t.top)),o=n*a;return e?o/(r.area+t.area-o):o/Math.min(r.area,t.area)}function Km(r){var t=r.map(function(s){return s.x}),e=r.map(function(s){return s.y}),n=t.reduce(function(s,u){return u<s?u:s},1/0),a=e.reduce(function(s,u){return u<s?u:s},1/0),o=t.reduce(function(s,u){return s<u?u:s},0),i=e.reduce(function(s,u){return s<u?u:s},0);return new ya(n,a,o,i)}function ur(r,t,e,n){n===void 0&&(n=!0);for(var a=t.map(function(s,u){return{score:s,boxIndex:u}}).sort(function(s,u){return s.score-u.score}).map(function(s){return s.boxIndex}),o=[],i=function(){var s=a.pop();o.push(s);for(var u=a,c=[],l=0;l<u.length;l++){var h=u[l],f=r[s],p=r[h];c.push(qm(f,p,n))}a=a.filter(function(d,m){return c[m]<=e})};a.length>0;)i();return o}function gr(r,t){return X(function(){var e=t[0],n=t[1],a=t[2],o=Nt(tr(r.shape.slice(0,3),[1]),e),i=Nt(tr(r.shape.slice(0,3),[1]),n),s=Nt(tr(r.shape.slice(0,3),[1]),a),u=Me([o,i,s],3);return Le(r,u)})}function Xm(r,t){return t===void 0&&(t=!1),X(function(){var e=r.shape.slice(1),n=e[0],a=e[1];if(n===a)return r;var o=Math.abs(n-a),i=Math.round(o*(t?.5:1)),s=n>a?2:1,u=function(p){var d=r.shape.slice();return d[s]=p,Nt(d,0)},c=u(i),l=o-c.shape[s],h=t&&l?u(l):null,f=[h,r,c].filter(function(p){return!!p}).map(function(p){return p.toFloat()});return Me(f,s)})}function Ja(r){return 1/(1+Math.exp(-r))}var ri=(function(r){ue(t,r);function t(e,n,a,o,i){return i===void 0&&(i=!1),r.call(this,{x:e,y:n,width:a,height:o},i)||this}return t})(on),$m=.5,Ym=.43,Jm=.45,na=(function(){function r(t,e,n){n===void 0&&(n=new be(0,0));var a=e.width,o=e.height;this._imgDims=new zn(a,o),this._shift=n,this._positions=t.map(function(i){return i.mul(new be(a,o)).add(n)})}return Object.defineProperty(r.prototype,"shift",{get:function(){return new be(this._shift.x,this._shift.y)},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"imageWidth",{get:function(){return this._imgDims.width},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"imageHeight",{get:function(){return this._imgDims.height},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"positions",{get:function(){return this._positions},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"relativePositions",{get:function(){var t=this;return this._positions.map(function(e){return e.sub(t._shift).div(new be(t.imageWidth,t.imageHeight))})},enumerable:!0,configurable:!0}),r.prototype.forSize=function(t,e){return new this.constructor(this.relativePositions,{width:t,height:e})},r.prototype.shiftBy=function(t,e){return new this.constructor(this.relativePositions,this._imgDims,new be(t,e))},r.prototype.shiftByPoint=function(t){return this.shiftBy(t.x,t.y)},r.prototype.align=function(t,e){if(e===void 0&&(e={}),t){var n=t instanceof Bt?t.box.floor():new on(t);return this.shiftBy(n.x,n.y).align(null,e)}var a=Object.assign({},{useDlibAlignment:!1,minBoxPadding:.2},e),o=a.useDlibAlignment,i=a.minBoxPadding;return o?this.alignDlib():this.alignMinBbox(i)},r.prototype.alignDlib=function(){var t=this.getRefPointsForAlignment(),e=t[0],n=t[1],a=t[2],o=function(h){return a.sub(h).magnitude()},i=(o(e)+o(n))/2,s=Math.floor(i/Jm),u=ni(t),c=Math.floor(Math.max(0,u.x-$m*s)),l=Math.floor(Math.max(0,u.y-Ym*s));return new ri(c,l,Math.min(s,this.imageWidth+c),Math.min(s,this.imageHeight+l))},r.prototype.alignMinBbox=function(t){var e=Km(this.positions);return e.pad(e.width*t,e.height*t)},r.prototype.getRefPointsForAlignment=function(){throw new Error("getRefPointsForAlignment not implemented by base class")},r})(),Qm=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.getRefPointsForAlignment=function(){var e=this.positions;return[e[0],e[1],ni([e[3],e[4]])]},t})(na),Zm=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.getJawOutline=function(){return this.positions.slice(0,17)},t.prototype.getLeftEyeBrow=function(){return this.positions.slice(17,22)},t.prototype.getRightEyeBrow=function(){return this.positions.slice(22,27)},t.prototype.getNose=function(){return this.positions.slice(27,36)},t.prototype.getLeftEye=function(){return this.positions.slice(36,42)},t.prototype.getRightEye=function(){return this.positions.slice(42,48)},t.prototype.getMouth=function(){return this.positions.slice(48,68)},t.prototype.getRefPointsForAlignment=function(){return[this.getLeftEye(),this.getRightEye(),this.getMouth()].map(ni)},t})(na),Es=(function(){function r(t,e){this._label=t,this._distance=e}return Object.defineProperty(r.prototype,"label",{get:function(){return this._label},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"distance",{get:function(){return this._distance},enumerable:!0,configurable:!0}),r.prototype.toString=function(t){return t===void 0&&(t=!0),""+this.label+(t?" ("+Hm(this.distance)+")":"")},r})(),ks=(function(r){ue(t,r);function t(e,n){var a=r.call(this,e)||this;return a._label=n,a}return t.assertIsValidLabeledBox=function(e,n){if(on.assertIsValidBox(e,n),!mn(e.label))throw new Error(n+" - expected property label ("+e.label+") to be a number")},Object.defineProperty(t.prototype,"label",{get:function(){return this._label},enumerable:!0,configurable:!0}),t})(on),Ar=(function(){function r(t,e){if(typeof t!="string")throw new Error("LabeledFaceDescriptors - constructor expected label to be a string");if(!Array.isArray(e)||e.some(function(n){return!(n instanceof Float32Array)}))throw new Error("LabeledFaceDescriptors - constructor expected descriptors to be an array of Float32Array");this._label=t,this._descriptors=e}return Object.defineProperty(r.prototype,"label",{get:function(){return this._label},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"descriptors",{get:function(){return this._descriptors},enumerable:!0,configurable:!0}),r.prototype.toJSON=function(){return{label:this.label,descriptors:this.descriptors.map(function(t){return Array.from(t)})}},r.fromJSON=function(t){var e=t.descriptors.map(function(n){return new Float32Array(n)});return new r(t.label,e)},r})();(function(r){ue(t,r);function t(e,n,a,o){var i=r.call(this,e,n)||this;return i._score=a,i._classScore=o,i}return t.assertIsValidPredictedBox=function(e,n){if(ks.assertIsValidLabeledBox(e,n),!_s(e.score)||!_s(e.classScore))throw new Error(n+" - expected properties score ("+e.score+") and ("+e.classScore+") to be a number between [0, 1]")},Object.defineProperty(t.prototype,"score",{get:function(){return this._score},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"classScore",{get:function(){return this._classScore},enumerable:!0,configurable:!0}),t})(ks);function eg(r){return r.detection instanceof Bt}function ai(r,t){var e={detection:t};return Object.assign({},r,e)}function bc(){var r=window.fetch||function(){throw new Error("fetch - missing fetch implementation for browser environment")},t=function(){throw new Error("readFile - filesystem not available for browser environment")};return{Canvas:HTMLCanvasElement,CanvasRenderingContext2D,Image:HTMLImageElement,ImageData,Video:HTMLVideoElement,createCanvasElement:function(){return document.createElement("canvas")},createImageElement:function(){return document.createElement("img")},fetch:r,readFile:t}}function wc(r){var t="";if(!r)try{r=require("fs")}catch(n){t=n.toString()}var e=r?function(n){return new Promise(function(a,o){r.readFile(n,function(i,s){return i?o(i):a(s)})})}:function(){throw new Error("readFile - failed to require fs in nodejs environment with error: "+t)};return{readFile:e}}function Cc(){var r=global.Canvas||global.HTMLCanvasElement,t=global.Image||global.HTMLImageElement,e=function(){if(r)return new r;throw new Error("createCanvasElement - missing Canvas implementation for nodejs environment")},n=function(){if(t)return new t;throw new Error("createImageElement - missing Image implementation for nodejs environment")},a=global.fetch||function(){throw new Error("fetch - missing fetch implementation for nodejs environment")},o=wc();return Ke({Canvas:r||(function(){function i(){}return i})(),CanvasRenderingContext2D:global.CanvasRenderingContext2D||(function(){function i(){}return i})(),Image:t||(function(){function i(){}return i})(),ImageData:global.ImageData||(function(){function i(){}return i})(),Video:global.HTMLVideoElement||(function(){function i(){}return i})(),createCanvasElement:e,createImageElement:n,fetch:a},o)}function _c(){return typeof window=="object"&&typeof document<"u"&&typeof HTMLImageElement<"u"&&typeof HTMLCanvasElement<"u"&&typeof HTMLVideoElement<"u"&&typeof ImageData<"u"&&typeof CanvasRenderingContext2D<"u"}function Ec(){return typeof global=="object"&&typeof require=="function"&&typeof module<"u"&&typeof process<"u"&&!!process.version}var Pe;function tg(){if(!Pe)throw new Error("getEnv - environment is not defined, check isNodejs() and isBrowser()");return Pe}function Eo(r){Pe=r}function oi(){_c()&&Eo(bc()),Ec()&&Eo(Cc())}function ng(r){if(Pe||oi(),!Pe)throw new Error("monkeyPatch - environment is not defined, check isNodejs() and isBrowser()");var t=r.Canvas,e=t===void 0?Pe.Canvas:t,n=r.Image,a=n===void 0?Pe.Image:n;Pe.Canvas=e,Pe.Image=a,Pe.createCanvasElement=r.createCanvasElement||(function(){return new e}),Pe.createImageElement=r.createImageElement||(function(){return new a}),Pe.ImageData=r.ImageData||Pe.ImageData,Pe.Video=r.Video||Pe.Video,Pe.fetch=r.fetch||Pe.fetch,Pe.readFile=r.readFile||Pe.readFile}var Qe={getEnv:tg,setEnv:Eo,initialize:oi,createBrowserEnv:bc,createFileSystem:wc,createNodejsEnv:Cc,monkeyPatch:ng,isBrowser:_c,isNodejs:Ec};oi();function kc(r){return!Qe.isNodejs()&&typeof r=="string"?document.getElementById(r):r}function yn(r){var t=Qe.getEnv(),e=t.Canvas,n=t.CanvasRenderingContext2D;if(r instanceof n)return r;var a=kc(r);if(!(a instanceof e))throw new Error("resolveContext2d - expected canvas to be of instance of Canvas");var o=a.getContext("2d");if(!o)throw new Error("resolveContext2d - canvas 2d context is null");return o}var Rs;(function(r){r.TOP_LEFT="TOP_LEFT",r.TOP_RIGHT="TOP_RIGHT",r.BOTTOM_LEFT="BOTTOM_LEFT",r.BOTTOM_RIGHT="BOTTOM_RIGHT"})(Rs||(Rs={}));function Rc(r){var t=Qe.getEnv(),e=t.Image,n=t.Video;return r instanceof e&&r.complete||r instanceof n&&r.readyState>=3}function rg(r){return new Promise(function(t,e){if(r instanceof Qe.getEnv().Canvas||Rc(r))return t();function n(o){o.currentTarget&&(o.currentTarget.removeEventListener("load",n),o.currentTarget.removeEventListener("error",a),t(o))}function a(o){o.currentTarget&&(o.currentTarget.removeEventListener("load",n),o.currentTarget.removeEventListener("error",a),e(o))}r.addEventListener("load",n),r.addEventListener("error",a)})}function Ic(r){var t=Qe.getEnv(),e=t.Image,n=t.Video;return r instanceof e?new zn(r.naturalWidth,r.naturalHeight):r instanceof n?new zn(r.videoWidth,r.videoHeight):new zn(r.width,r.height)}function xa(r){var t=r.width,e=r.height,n=Qe.getEnv().createCanvasElement,a=n();return a.width=t,a.height=e,a}function ii(r,t){var e=Qe.getEnv().ImageData;if(!(r instanceof e)&&!Rc(r))throw new Error("createCanvasFromMedia - media has not finished loading yet");var n=Ic(r),a=n.width,o=n.height,i=xa({width:a,height:o});return r instanceof e?yn(i).putImageData(r,0,0):yn(i).drawImage(r,0,0,a,o),i}function ag(r,t){return te(this,void 0,void 0,function(){var e,n,a,o,i,s;return ne(this,function(u){switch(u.label){case 0:return e=Qe.getEnv().createCanvasElement(),n=r.shape.slice(rn(r)?1:0),a=n[0],o=n[1],i=n[2],s=X(function(){return r.as3D(a,o,i).toInt()}),[4,ti.toPixels(s,e)];case 1:return u.sent(),s.dispose(),[2,e]}})})}function Is(r){var t=Qe.getEnv(),e=t.Image,n=t.Canvas,a=t.Video;return r instanceof e||r instanceof n||r instanceof a}function og(r,t,e){e===void 0&&(e=!1);var n=Qe.getEnv(),a=n.Image,o=n.Canvas;if(!(r instanceof a||r instanceof o))throw new Error("imageToSquare - expected arg0 to be HTMLImageElement | HTMLCanvasElement");var i=Ic(r),s=t/Math.max(i.height,i.width),u=s*i.width,c=s*i.height,l=xa({width:t,height:t}),h=r instanceof o?r:ii(r),f=Math.abs(u-c)/2,p=e&&u<c?f:0,d=e&&c<u?f:0;return yn(l).drawImage(h,p,d,u,c),l}var ra=(function(){function r(t,e){var n=this;if(e===void 0&&(e=!1),this._imageTensors=[],this._canvases=[],this._treatAsBatchInput=!1,this._inputDimensions=[],!Array.isArray(t))throw new Error("NetInput.constructor - expected inputs to be an Array of TResolvedNetInput or to be instanceof tf.Tensor4D, instead have "+t);this._treatAsBatchInput=e,this._batchSize=t.length,t.forEach(function(a,o){if(ga(a)){n._imageTensors[o]=a,n._inputDimensions[o]=a.shape;return}if(rn(a)){var i=a.shape[0];if(i!==1)throw new Error("NetInput - tf.Tensor4D with batchSize "+i+" passed, but not supported in input array");n._imageTensors[o]=a,n._inputDimensions[o]=a.shape.slice(1);return}var s=a instanceof Qe.getEnv().Canvas?a:ii(a);n._canvases[o]=s,n._inputDimensions[o]=[s.height,s.width,3]})}return Object.defineProperty(r.prototype,"imageTensors",{get:function(){return this._imageTensors},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"canvases",{get:function(){return this._canvases},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"isBatchInput",{get:function(){return this.batchSize>1||this._treatAsBatchInput},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"batchSize",{get:function(){return this._batchSize},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"inputDimensions",{get:function(){return this._inputDimensions},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"inputSize",{get:function(){return this._inputSize},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"reshapedInputDimensions",{get:function(){var t=this;return sr(this.batchSize,0,1).map(function(e,n){return t.getReshapedInputDimensions(n)})},enumerable:!0,configurable:!0}),r.prototype.getInput=function(t){return this.canvases[t]||this.imageTensors[t]},r.prototype.getInputDimensions=function(t){return this._inputDimensions[t]},r.prototype.getInputHeight=function(t){return this._inputDimensions[t][0]},r.prototype.getInputWidth=function(t){return this._inputDimensions[t][1]},r.prototype.getReshapedInputDimensions=function(t){if(typeof this.inputSize!="number")throw new Error("getReshapedInputDimensions - inputSize not set, toBatchTensor has not been called yet");var e=this.getInputWidth(t),n=this.getInputHeight(t);return jm({width:e,height:n},this.inputSize)},r.prototype.toBatchTensor=function(t,e){var n=this;return e===void 0&&(e=!0),this._inputSize=t,X(function(){var a=sr(n.batchSize,0,1).map(function(i){var s=n.getInput(i);if(s instanceof Se){var u=rn(s)?s:s.expandDims();return u=Xm(u,e),(u.shape[1]!==t||u.shape[2]!==t)&&(u=$o.resizeBilinear(u,[t,t])),u.as3D(t,t,3)}if(s instanceof Qe.getEnv().Canvas)return ti.fromPixels(og(s,t,e));throw new Error("toBatchTensor - at batchIdx "+i+", expected input to be instanceof tf.Tensor or instanceof HTMLCanvasElement, instead have "+s)}),o=ft(a.map(function(i){return i.toFloat()})).as4D(n.batchSize,t,t,3);return o})},r})();function Ve(r){return te(this,void 0,void 0,function(){var t,e,n;return ne(this,function(a){switch(a.label){case 0:if(r instanceof ra)return[2,r];if(t=Array.isArray(r)?r:[r],!t.length)throw new Error("toNetInput - empty array passed as input");return e=function(o){return Array.isArray(r)?" at input index "+o+":":""},n=t.map(kc),n.forEach(function(o,i){if(!Is(o)&&!ga(o)&&!rn(o))throw typeof t[i]=="string"?new Error("toNetInput -"+e(i)+" string passed, but could not resolve HTMLElement for element id "+t[i]):new Error("toNetInput -"+e(i)+" expected media to be of type HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | tf.Tensor3D, or to be an element id");if(rn(o)){var s=o.shape[0];if(s!==1)throw new Error("toNetInput -"+e(i)+" tf.Tensor4D with batchSize "+s+" passed, but not supported in input array")}}),[4,Promise.all(n.map(function(o){return Is(o)&&rg(o)}))];case 1:return a.sent(),[2,new ra(n,Array.isArray(r))]}})})}function si(r,t){return te(this,void 0,void 0,function(){var e,n,a,o,i,s,u;return ne(this,function(c){switch(c.label){case 0:return e=Qe.getEnv().Canvas,n=r,r instanceof e?[3,5]:[4,Ve(r)];case 1:if(a=c.sent(),a.batchSize>1)throw new Error("extractFaces - batchSize > 1 not supported");return o=a.getInput(0),o instanceof e?(i=o,[3,4]):[3,2];case 2:return[4,ag(o)];case 3:i=c.sent(),c.label=4;case 4:n=i,c.label=5;case 5:return s=yn(n),u=t.map(function(l){return l instanceof Bt?l.forSize(n.width,n.height).box.floor():l}).map(function(l){return l.clipAtImageBorders(n.width,n.height)}),[2,u.map(function(l){var h=l.x,f=l.y,p=l.width,d=l.height,m=xa({width:p,height:d});return yn(m).putImageData(s.getImageData(h,f,p,d),0,0),m})]}})})}function ui(r,t){return te(this,void 0,void 0,function(){return ne(this,function(e){if(!ga(r)&&!rn(r))throw new Error("extractFaceTensors - expected image tensor to be 3D or 4D");if(rn(r)&&r.shape[0]>1)throw new Error("extractFaceTensors - batchSize > 1 not supported");return[2,X(function(){var n=r.shape.slice(rn(r)?1:0),a=n[0],o=n[1],i=n[2],s=t.map(function(c){return c instanceof Bt?c.forSize(o,a).box:c}).map(function(c){return c.clipAtImageBorders(o,a)}),u=s.map(function(c){var l=c.x,h=c.y,f=c.width,p=c.height;return ec(r.as3D(a,o,i),[h,l,0],[p,f,i])});return u})]})})}function ig(r,t){return te(this,void 0,void 0,function(){var e,n;return ne(this,function(a){switch(a.label){case 0:return e=Qe.getEnv().fetch,[4,e(r,t)];case 1:if(n=a.sent(),!(n.status<400))throw new Error("failed to fetch: ("+n.status+") "+n.statusText+", from url: "+n.url);return[2,n]}})})}function sg(r){return te(this,void 0,void 0,function(){return ne(this,function(t){switch(t.label){case 0:return[4,ig(r)];case 1:return[2,t.sent().json()]}})})}function Sc(r,t){var e=t+"-weights_manifest.json";if(!r)return{modelBaseUri:"",manifestUri:e};if(r==="/")return{modelBaseUri:"/",manifestUri:"/"+e};var n=r.startsWith("http://")?"http://":r.startsWith("https://")?"https://":"";r=r.replace(n,"");var a=r.split("/").filter(function(s){return s}),o=r.endsWith(".json")?a[a.length-1]:e,i=n+(r.endsWith(".json")?a.slice(0,a.length-1):a).join("/");return i=r.startsWith("/")?"/"+i:i,{modelBaseUri:i,manifestUri:i==="/"?"/"+o:i+"/"+o}}function ug(r,t){return te(this,void 0,void 0,function(){var e,n,a,o;return ne(this,function(i){switch(i.label){case 0:return e=Sc(r,t),n=e.manifestUri,a=e.modelBaseUri,[4,sg(n)];case 1:return o=i.sent(),[2,gc.loadWeights(o,a)]}})})}var Kt=(function(){function r(t){this._name=t,this._params=void 0,this._paramMappings=[]}return Object.defineProperty(r.prototype,"params",{get:function(){return this._params},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"paramMappings",{get:function(){return this._paramMappings},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"isLoaded",{get:function(){return!!this.params},enumerable:!0,configurable:!0}),r.prototype.getParamFromPath=function(t){var e=this.traversePropertyPath(t),n=e.obj,a=e.objProp;return n[a]},r.prototype.reassignParamFromPath=function(t,e){var n=this.traversePropertyPath(t),a=n.obj,o=n.objProp;a[o].dispose(),a[o]=e},r.prototype.getParamList=function(){var t=this;return this._paramMappings.map(function(e){var n=e.paramPath;return{path:n,tensor:t.getParamFromPath(n)}})},r.prototype.getTrainableParams=function(){return this.getParamList().filter(function(t){return t.tensor instanceof Hn})},r.prototype.getFrozenParams=function(){return this.getParamList().filter(function(t){return!(t.tensor instanceof Hn)})},r.prototype.variable=function(){var t=this;this.getFrozenParams().forEach(function(e){var n=e.path,a=e.tensor;t.reassignParamFromPath(n,a.variable())})},r.prototype.freeze=function(){var t=this;this.getTrainableParams().forEach(function(e){var n=e.path,a=e.tensor,o=je(a.dataSync());a.dispose(),t.reassignParamFromPath(n,o)})},r.prototype.dispose=function(t){t===void 0&&(t=!0),this.getParamList().forEach(function(e){if(t&&e.tensor.isDisposed)throw new Error("param tensor has already been disposed for path "+e.path);e.tensor.dispose()}),this._params=void 0},r.prototype.serializeParams=function(){return new Float32Array(this.getParamList().map(function(t){var e=t.tensor;return Array.from(e.dataSync())}).reduce(function(t,e){return t.concat(e)}))},r.prototype.load=function(t){return te(this,void 0,void 0,function(){return ne(this,function(e){switch(e.label){case 0:return t instanceof Float32Array?(this.extractWeights(t),[2]):[4,this.loadFromUri(t)];case 1:return e.sent(),[2]}})})},r.prototype.loadFromUri=function(t){return te(this,void 0,void 0,function(){var e;return ne(this,function(n){switch(n.label){case 0:if(t&&typeof t!="string")throw new Error(this._name+".loadFromUri - expected model uri");return[4,ug(t,this.getDefaultModelName())];case 1:return e=n.sent(),this.loadFromWeightMap(e),[2]}})})},r.prototype.loadFromDisk=function(t){return te(this,void 0,void 0,function(){var e,n,a,o,i,s,u,c,l,h;return ne(this,function(f){switch(f.label){case 0:if(t&&typeof t!="string")throw new Error(this._name+".loadFromDisk - expected model file path");return e=Qe.getEnv().readFile,n=Sc(t,this.getDefaultModelName()),a=n.manifestUri,o=n.modelBaseUri,i=function(p){return Promise.all(p.map(function(d){return e(d).then(function(m){return m.buffer})}))},s=gc.weightsLoaderFactory(i),l=(c=JSON).parse,[4,e(a)];case 1:return u=l.apply(c,[f.sent().toString()]),[4,s(u,o)];case 2:return h=f.sent(),this.loadFromWeightMap(h),[2]}})})},r.prototype.loadFromWeightMap=function(t){var e=this.extractParamsFromWeigthMap(t),n=e.paramMappings,a=e.params;this._paramMappings=n,this._params=a},r.prototype.extractWeights=function(t){var e=this.extractParams(t),n=e.paramMappings,a=e.params;this._paramMappings=n,this._params=a},r.prototype.traversePropertyPath=function(t){if(!this.params)throw new Error("traversePropertyPath - model has no loaded params");var e=t.split("/").reduce(function(o,i){if(!o.nextObj.hasOwnProperty(i))throw new Error("traversePropertyPath - object does not have property "+i+", for path "+t);return{obj:o.nextObj,objProp:i,nextObj:o.nextObj[i]}},{nextObj:this.params}),n=e.obj,a=e.objProp;if(!n||!a||!(n[a]instanceof Se))throw new Error("traversePropertyPath - parameter is not a tensor, for path "+t);return{obj:n,objProp:a}},r})();function ht(r,t,e){return X(function(){var n=Ho(r,t.depthwise_filter,t.pointwise_filter,e,"same");return n=de(n,t.bias),n})}function Qa(r,t,e){return e===void 0&&(e=!1),X(function(){var n=De(e?de(mt(r,t.conv0.filters,[2,2],"same"),t.conv0.bias):ht(r,t.conv0,[2,2])),a=ht(n,t.conv1,[1,1]),o=De(de(n,a)),i=ht(o,t.conv2,[1,1]);return De(de(n,de(a,i)))})}function Tr(r,t,e,n){return e===void 0&&(e=!1),n===void 0&&(n=!0),X(function(){var a=De(e?de(mt(r,t.conv0.filters,n?[2,2]:[1,1],"same"),t.conv0.bias):ht(r,t.conv0,n?[2,2]:[1,1])),o=ht(a,t.conv1,[1,1]),i=De(de(a,o)),s=ht(i,t.conv2,[1,1]),u=De(de(a,de(o,s))),c=ht(u,t.conv3,[1,1]);return De(de(a,de(o,de(s,c))))})}function xt(r,t,e,n){return e===void 0&&(e="same"),n===void 0&&(n=!1),X(function(){var a=de(mt(r,t.filters,[1,1],e),t.bias);return n?De(a):a})}function Xt(r,t){Object.keys(r).forEach(function(e){t.some(function(n){return n.originalPath===e})||r[e].dispose()})}function ba(r,t){return function(e,n,a,o){var i=Ze(r(e*n*a*a),[a,a,e,n]),s=Fe(r(n));return t.push({paramPath:o+"/filters"},{paramPath:o+"/bias"}),{filters:i,bias:s}}}function ci(r,t){return function(e,n,a){var o=tn(r(e*n),[e,n]),i=Fe(r(n));return t.push({paramPath:a+"/weights"},{paramPath:a+"/bias"}),{weights:o,bias:i}}}var Dc=(function(){function r(t,e,n){this.depthwise_filter=t,this.pointwise_filter=e,this.bias=n}return r})();function li(r,t){return function(e,n,a){var o=Ze(r(9*e),[3,3,e,1]),i=Ze(r(e*n),[1,1,e,n]),s=Fe(r(n));return t.push({paramPath:a+"/depthwise_filter"},{paramPath:a+"/pointwise_filter"},{paramPath:a+"/bias"}),new Dc(o,i,s)}}function hi(r){return function(t){var e=r(t+"/depthwise_filter",4),n=r(t+"/pointwise_filter",4),a=r(t+"/bias",1);return new Dc(e,n,a)}}function cn(r,t){return function(e,n,a){var o=r[e];if(!ma(o,n))throw new Error("expected weightMap["+e+"] to be a Tensor"+n+"D, instead have "+o);return t.push({originalPath:e,paramPath:a||e}),o}}function $t(r){var t=r;function e(a){var o=t.slice(0,a);return t=t.slice(a),o}function n(){return t}return{extractWeights:e,getRemainingWeights:n}}function Ac(r,t){var e=ba(r,t),n=li(r,t);function a(i,s,u,c){c===void 0&&(c=!1);var l=c?e(i,s,3,u+"/conv0"):n(i,s,u+"/conv0"),h=n(s,s,u+"/conv1"),f=n(s,s,u+"/conv2");return{conv0:l,conv1:h,conv2:f}}function o(i,s,u,c){c===void 0&&(c=!1);var l=a(i,s,u,c),h=l.conv0,f=l.conv1,p=l.conv2,d=n(s,s,u+"/conv3");return{conv0:h,conv1:f,conv2:p,conv3:d}}return{extractDenseBlock3Params:a,extractDenseBlock4Params:o}}function cg(r){var t=[],e=$t(r),n=e.extractWeights,a=e.getRemainingWeights,o=Ac(n,t).extractDenseBlock4Params,i=o(3,32,"dense0",!0),s=o(32,64,"dense1"),u=o(64,128,"dense2"),c=o(128,256,"dense3");if(a().length!==0)throw new Error("weights remaing after extract: "+a().length);return{paramMappings:t,params:{dense0:i,dense1:s,dense2:u,dense3:c}}}function Tc(r){return function(t){var e=r(t+"/filters",4),n=r(t+"/bias",1);return{filters:e,bias:n}}}function Nc(r,t){var e=cn(r,t),n=Tc(e),a=hi(e);function o(s,u){u===void 0&&(u=!1);var c=u?n(s+"/conv0"):a(s+"/conv0"),l=a(s+"/conv1"),h=a(s+"/conv2");return{conv0:c,conv1:l,conv2:h}}function i(s,u){u===void 0&&(u=!1);var c=u?n(s+"/conv0"):a(s+"/conv0"),l=a(s+"/conv1"),h=a(s+"/conv2"),f=a(s+"/conv3");return{conv0:c,conv1:l,conv2:h,conv3:f}}return{extractDenseBlock3Params:o,extractDenseBlock4Params:i}}function lg(r){var t=[],e=Nc(r,t).extractDenseBlock4Params,n={dense0:e("dense0",!0),dense1:e("dense1"),dense2:e("dense2"),dense3:e("dense3")};return Xt(r,t),{params:n,paramMappings:t}}var Fc=(function(r){ue(t,r);function t(){return r.call(this,"FaceFeatureExtractor")||this}return t.prototype.forwardInput=function(e){var n=this.params;if(!n)throw new Error("FaceFeatureExtractor - load model before inference");return X(function(){var a=e.toBatchTensor(112,!0),o=[122.782,117.001,104.298],i=gr(a,o).div(q(255)),s=Tr(i,n.dense0,!0);return s=Tr(s,n.dense1),s=Tr(s,n.dense2),s=Tr(s,n.dense3),s=vr(s,[7,7],[2,2],"valid"),s})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.getDefaultModelName=function(){return"face_feature_extractor_model"},t.prototype.extractParamsFromWeigthMap=function(e){return lg(e)},t.prototype.extractParams=function(e){return cg(e)},t})(Kt);function Dt(r,t){return X(function(){return de(pa(r,t.weights),t.bias)})}function hg(r,t,e){var n=[],a=$t(r),o=a.extractWeights,i=a.getRemainingWeights,s=ci(o,n),u=s(t,e,"fc");if(i().length!==0)throw new Error("weights remaing after extract: "+i().length);return{paramMappings:n,params:{fc:u}}}function fg(r){var t=[],e=cn(r,t);function n(o){var i=e(o+"/weights",2),s=e(o+"/bias",1);return{weights:i,bias:s}}var a={fc:n("fc")};return Xt(r,t),{params:a,paramMappings:t}}function Pc(r){var t={},e={};return Object.keys(r).forEach(function(n){var a=n.startsWith("fc")?e:t;a[n]=r[n]}),{featureExtractorMap:t,classifierMap:e}}var Mc=(function(r){ue(t,r);function t(e,n){var a=r.call(this,e)||this;return a._faceFeatureExtractor=n,a}return Object.defineProperty(t.prototype,"faceFeatureExtractor",{get:function(){return this._faceFeatureExtractor},enumerable:!0,configurable:!0}),t.prototype.runNet=function(e){var n=this,a=this.params;if(!a)throw new Error(this._name+" - load model before inference");return X(function(){var o=e instanceof ra?n.faceFeatureExtractor.forwardInput(e):e;return Dt(o.as2D(o.shape[0],-1),a.fc)})},t.prototype.dispose=function(e){e===void 0&&(e=!0),this.faceFeatureExtractor.dispose(e),r.prototype.dispose.call(this,e)},t.prototype.loadClassifierParams=function(e){var n=this.extractClassifierParams(e),a=n.params,o=n.paramMappings;this._params=a,this._paramMappings=o},t.prototype.extractClassifierParams=function(e){return hg(e,this.getClassifierChannelsIn(),this.getClassifierChannelsOut())},t.prototype.extractParamsFromWeigthMap=function(e){var n=Pc(e),a=n.featureExtractorMap,o=n.classifierMap;return this.faceFeatureExtractor.loadFromWeightMap(a),fg(o)},t.prototype.extractParams=function(e){var n=this.getClassifierChannelsIn(),a=this.getClassifierChannelsOut(),o=a*n+a,i=e.slice(0,e.length-o),s=e.slice(e.length-o);return this.faceFeatureExtractor.extractWeights(i),this.extractClassifierParams(s)},t})(Kt),Ss=["neutral","happy","sad","angry","fearful","disgusted","surprised"],pg=(function(){function r(t){var e=this;if(t.length!==7)throw new Error("FaceExpressions.constructor - expected probabilities.length to be 7, have: "+t.length);Ss.forEach(function(n,a){e[n]=t[a]})}return r.prototype.asSortedArray=function(){var t=this;return Ss.map(function(e){return{expression:e,probability:t[e]}}).sort(function(e,n){return n.probability-e.probability})},r})(),dg=(function(r){ue(t,r);function t(e){return e===void 0&&(e=new Fc),r.call(this,"FaceExpressionNet",e)||this}return t.prototype.forwardInput=function(e){var n=this;return X(function(){return jt(n.runNet(e))})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.predictExpressions=function(e){return te(this,void 0,void 0,function(){var n,a,o,i,s=this;return ne(this,function(u){switch(u.label){case 0:return[4,Ve(e)];case 1:return n=u.sent(),[4,this.forwardInput(n)];case 2:return a=u.sent(),[4,Promise.all(Oe(a).map(function(c){return te(s,void 0,void 0,function(){var l;return ne(this,function(h){switch(h.label){case 0:return[4,c.data()];case 1:return l=h.sent(),c.dispose(),[2,l]}})})}))];case 3:return o=u.sent(),a.dispose(),i=o.map(function(c){return new pg(c)}),[2,n.isBatchInput?i:i[0]]}})})},t.prototype.getDefaultModelName=function(){return"face_expression_model"},t.prototype.getClassifierChannelsIn=function(){return 256},t.prototype.getClassifierChannelsOut=function(){return 7},t})(Mc);function Oc(r,t){var e={expressions:t};return Object.assign({},r,e)}function vg(r){return eg(r)&&r.landmarks instanceof na&&r.unshiftedLandmarks instanceof na&&r.alignedRect instanceof Bt}function fi(r,t){var e=r.detection.box,n=t.shiftBy(e.x,e.y),a=n.align(),o=r.detection.imageDims,i=new Bt(r.detection.score,a.rescale(o.reverse()),o),s={landmarks:n,unshiftedLandmarks:t,alignedRect:i};return Object.assign({},r,s)}function mg(r,t){var e=ba(r,t),n=li(r,t);function a(i,s,u){var c=n(i,s,u+"/separable_conv0"),l=n(s,s,u+"/separable_conv1"),h=e(i,s,1,u+"/expansion_conv");return{separable_conv0:c,separable_conv1:l,expansion_conv:h}}function o(i,s){var u=n(i,i,s+"/separable_conv0"),c=n(i,i,s+"/separable_conv1"),l=n(i,i,s+"/separable_conv2");return{separable_conv0:u,separable_conv1:c,separable_conv2:l}}return{extractConvParams:e,extractSeparableConvParams:n,extractReductionBlockParams:a,extractMainBlockParams:o}}function gg(r,t){var e=[],n=$t(r),a=n.extractWeights,o=n.getRemainingWeights,i=mg(a,e),s=i.extractConvParams,u=i.extractSeparableConvParams,c=i.extractReductionBlockParams,l=i.extractMainBlockParams,h=s(3,32,3,"entry_flow/conv_in"),f=c(32,64,"entry_flow/reduction_block_0"),p=c(64,128,"entry_flow/reduction_block_1"),d={conv_in:h,reduction_block_0:f,reduction_block_1:p},m={};sr(t,0,1).forEach(function(b){m["main_block_"+b]=l(128,"middle_flow/main_block_"+b)});var v=c(128,256,"exit_flow/reduction_block"),g=u(256,512,"exit_flow/separable_conv"),x={reduction_block:v,separable_conv:g};if(o().length!==0)throw new Error("weights remaing after extract: "+o().length);return{paramMappings:e,params:{entry_flow:d,middle_flow:m,exit_flow:x}}}function yg(r,t){var e=cn(r,t),n=Tc(e),a=hi(e);function o(s){var u=a(s+"/separable_conv0"),c=a(s+"/separable_conv1"),l=n(s+"/expansion_conv");return{separable_conv0:u,separable_conv1:c,expansion_conv:l}}function i(s){var u=a(s+"/separable_conv0"),c=a(s+"/separable_conv1"),l=a(s+"/separable_conv2");return{separable_conv0:u,separable_conv1:c,separable_conv2:l}}return{extractConvParams:n,extractSeparableConvParams:a,extractReductionBlockParams:o,extractMainBlockParams:i}}function xg(r,t){var e=[],n=yg(r,e),a=n.extractConvParams,o=n.extractSeparableConvParams,i=n.extractReductionBlockParams,s=n.extractMainBlockParams,u=a("entry_flow/conv_in"),c=i("entry_flow/reduction_block_0"),l=i("entry_flow/reduction_block_1"),h={conv_in:u,reduction_block_0:c,reduction_block_1:l},f={};sr(t,0,1).forEach(function(v){f["main_block_"+v]=s("middle_flow/main_block_"+v)});var p=i("exit_flow/reduction_block"),d=o("exit_flow/separable_conv"),m={reduction_block:p,separable_conv:d};return Xt(r,e),{params:{entry_flow:h,middle_flow:f,exit_flow:m},paramMappings:e}}function Bc(r,t,e){return de(mt(r,t.filters,e,"same"),t.bias)}function Za(r,t,e){e===void 0&&(e=!0);var n=e?De(r):r;return n=ht(n,t.separable_conv0,[1,1]),n=ht(De(n),t.separable_conv1,[1,1]),n=Ue(n,[3,3],[2,2],"same"),n=de(n,Bc(r,t.expansion_conv,[2,2])),n}function bg(r,t){var e=ht(De(r),t.separable_conv0,[1,1]);return e=ht(De(e),t.separable_conv1,[1,1]),e=ht(De(e),t.separable_conv2,[1,1]),e=de(e,r),e}var wg=(function(r){ue(t,r);function t(e){var n=r.call(this,"TinyXception")||this;return n._numMainBlocks=e,n}return t.prototype.forwardInput=function(e){var n=this,a=this.params;if(!a)throw new Error("TinyXception - load model before inference");return X(function(){var o=e.toBatchTensor(112,!0),i=[122.782,117.001,104.298],s=gr(o,i).div(q(256)),u=De(Bc(s,a.entry_flow.conv_in,[2,2]));return u=Za(u,a.entry_flow.reduction_block_0,!1),u=Za(u,a.entry_flow.reduction_block_1),sr(n._numMainBlocks,0,1).forEach(function(c){u=bg(u,a.middle_flow["main_block_"+c])}),u=Za(u,a.exit_flow.reduction_block),u=De(ht(u,a.exit_flow.separable_conv,[1,1])),u})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.getDefaultModelName=function(){return"tiny_xception_model"},t.prototype.extractParamsFromWeigthMap=function(e){return xg(e,this._numMainBlocks)},t.prototype.extractParams=function(e){return gg(e,this._numMainBlocks)},t})(Kt);function Cg(r){var t=[],e=$t(r),n=e.extractWeights,a=e.getRemainingWeights,o=ci(n,t),i=o(512,1,"fc/age"),s=o(512,2,"fc/gender");if(a().length!==0)throw new Error("weights remaing after extract: "+a().length);return{paramMappings:t,params:{fc:{age:i,gender:s}}}}function _g(r){var t=[],e=cn(r,t);function n(o){var i=e(o+"/weights",2),s=e(o+"/bias",1);return{weights:i,bias:s}}var a={fc:{age:n("fc/age"),gender:n("fc/gender")}};return Xt(r,t),{params:a,paramMappings:t}}var aa;(function(r){r.FEMALE="female",r.MALE="male"})(aa||(aa={}));var Eg=(function(r){ue(t,r);function t(e){e===void 0&&(e=new wg(2));var n=r.call(this,"AgeGenderNet")||this;return n._faceFeatureExtractor=e,n}return Object.defineProperty(t.prototype,"faceFeatureExtractor",{get:function(){return this._faceFeatureExtractor},enumerable:!0,configurable:!0}),t.prototype.runNet=function(e){var n=this,a=this.params;if(!a)throw new Error(this._name+" - load model before inference");return X(function(){var o=e instanceof ra?n.faceFeatureExtractor.forwardInput(e):e,i=vr(o,[7,7],[2,2],"valid").as2D(o.shape[0],-1),s=Dt(i,a.fc.age).as1D(),u=Dt(i,a.fc.gender);return{age:s,gender:u}})},t.prototype.forwardInput=function(e){var n=this;return X(function(){var a=n.runNet(e),o=a.age,i=a.gender;return{age:o,gender:jt(i)}})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.predictAgeAndGender=function(e){return te(this,void 0,void 0,function(){var n,a,o,i,s,u,c=this;return ne(this,function(l){switch(l.label){case 0:return[4,Ve(e)];case 1:return n=l.sent(),[4,this.forwardInput(n)];case 2:return a=l.sent(),o=Oe(a.age),i=Oe(a.gender),s=o.map(function(h,f){return{ageTensor:h,genderTensor:i[f]}}),[4,Promise.all(s.map(function(h){var f=h.ageTensor,p=h.genderTensor;return te(c,void 0,void 0,function(){var d,m,v,g,x;return ne(this,function(b){switch(b.label){case 0:return[4,f.data()];case 1:return d=b.sent()[0],[4,p.data()];case 2:return m=b.sent()[0],v=m>.5,g=v?aa.MALE:aa.FEMALE,x=v?m:1-m,f.dispose(),p.dispose(),[2,{age:d,gender:g,genderProbability:x}]}})})}))];case 3:return u=l.sent(),a.age.dispose(),a.gender.dispose(),[2,n.isBatchInput?u:u[0]]}})})},t.prototype.getDefaultModelName=function(){return"age_gender_model"},t.prototype.dispose=function(e){e===void 0&&(e=!0),this.faceFeatureExtractor.dispose(e),r.prototype.dispose.call(this,e)},t.prototype.loadClassifierParams=function(e){var n=this.extractClassifierParams(e),a=n.params,o=n.paramMappings;this._params=a,this._paramMappings=o},t.prototype.extractClassifierParams=function(e){return Cg(e)},t.prototype.extractParamsFromWeigthMap=function(e){var n=Pc(e),a=n.featureExtractorMap,o=n.classifierMap;return this.faceFeatureExtractor.loadFromWeightMap(a),_g(o)},t.prototype.extractParams=function(e){var n=1539,a=e.slice(0,e.length-n),o=e.slice(e.length-n);return this.faceFeatureExtractor.extractWeights(a),this.extractClassifierParams(o)},t})(Kt),Lc=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.postProcess=function(e,n,a){var o=a.map(function(s){var u=s.width,c=s.height,l=n/Math.max(c,u);return{width:u*l,height:c*l}}),i=o.length;return X(function(){var s=function(f,p){return ft([Nt([68],f),Nt([68],p)],1).as2D(1,136).as1D()},u=function(f,p){var d=o[f],m=d.width,v=d.height;return p(m,v)?Math.abs(m-v)/2:0},c=function(f){return u(f,function(p,d){return p<d})},l=function(f){return u(f,function(p,d){return d<p})},h=e.mul(Nt([i,136],n)).sub(ft(Array.from(Array(i),function(f,p){return s(c(p),l(p))}))).div(ft(Array.from(Array(i),function(f,p){return s(o[p].width,o[p].height)})));return h})},t.prototype.forwardInput=function(e){var n=this;return X(function(){var a=n.runNet(e);return n.postProcess(a,e.inputSize,e.inputDimensions.map(function(o){var i=o[0],s=o[1];return{height:i,width:s}}))})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.detectLandmarks=function(e){return te(this,void 0,void 0,function(){var n,a,o,i=this;return ne(this,function(s){switch(s.label){case 0:return[4,Ve(e)];case 1:return n=s.sent(),a=X(function(){return Oe(i.forwardInput(n))}),[4,Promise.all(a.map(function(u,c){return te(i,void 0,void 0,function(){var l,h,f,p,d;return ne(this,function(m){switch(m.label){case 0:return f=(h=Array).from,[4,u.data()];case 1:return l=f.apply(h,[m.sent()]),p=l.filter(function(v,g){return ws(g)}),d=l.filter(function(v,g){return!ws(g)}),[2,new Zm(Array(68).fill(0).map(function(v,g){return new be(p[g],d[g])}),{height:n.getInputHeight(c),width:n.getInputWidth(c)})]}})})}))];case 2:return o=s.sent(),a.forEach(function(u){return u.dispose()}),[2,n.isBatchInput?o:o[0]]}})})},t.prototype.getClassifierChannelsOut=function(){return 136},t})(Mc),Wc=(function(r){ue(t,r);function t(e){return e===void 0&&(e=new Fc),r.call(this,"FaceLandmark68Net",e)||this}return t.prototype.getDefaultModelName=function(){return"face_landmark_68_model"},t.prototype.getClassifierChannelsIn=function(){return 256},t})(Lc);function kg(r){var t=[],e=Nc(r,t).extractDenseBlock3Params,n={dense0:e("dense0",!0),dense1:e("dense1"),dense2:e("dense2")};return Xt(r,t),{params:n,paramMappings:t}}function Rg(r){var t=[],e=$t(r),n=e.extractWeights,a=e.getRemainingWeights,o=Ac(n,t).extractDenseBlock3Params,i=o(3,32,"dense0",!0),s=o(32,64,"dense1"),u=o(64,128,"dense2");if(a().length!==0)throw new Error("weights remaing after extract: "+a().length);return{paramMappings:t,params:{dense0:i,dense1:s,dense2:u}}}var Ig=(function(r){ue(t,r);function t(){return r.call(this,"TinyFaceFeatureExtractor")||this}return t.prototype.forwardInput=function(e){var n=this.params;if(!n)throw new Error("TinyFaceFeatureExtractor - load model before inference");return X(function(){var a=e.toBatchTensor(112,!0),o=[122.782,117.001,104.298],i=gr(a,o).div(q(255)),s=Qa(i,n.dense0,!0);return s=Qa(s,n.dense1),s=Qa(s,n.dense2),s=vr(s,[14,14],[2,2],"valid"),s})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.getDefaultModelName=function(){return"face_feature_extractor_tiny_model"},t.prototype.extractParamsFromWeigthMap=function(e){return kg(e)},t.prototype.extractParams=function(e){return Rg(e)},t})(Kt),Sg=(function(r){ue(t,r);function t(e){return e===void 0&&(e=new Ig),r.call(this,"FaceLandmark68TinyNet",e)||this}return t.prototype.getDefaultModelName=function(){return"face_landmark_68_tiny_model"},t.prototype.getClassifierChannelsIn=function(){return 128},t})(Lc);(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t})(Wc);function Dg(r,t){return de(Ye(r,t.weights),t.biases)}function pi(r,t,e,n,a){a===void 0&&(a="same");var o=t.conv,i=o.filters,s=o.bias,u=mt(r,i,e,a);return u=de(u,s),u=Dg(u,t.scale),n?De(u):u}function Ag(r,t){return pi(r,t,[1,1],!0)}function Uc(r,t){return pi(r,t,[1,1],!1)}function zc(r,t){return pi(r,t,[2,2],!0,"valid")}function Tg(r,t){function e(s,u,c){var l=r(s),h=l.length/(u*c*c);if(Gm(h))throw new Error("depth has to be an integer: "+h+", weights.length: "+l.length+", numFilters: "+u+", filterSize: "+c);return X(function(){return an(Ze(l,[u,h,c,c]),[2,3,1,0])})}function n(s,u,c,l){var h=e(s,u,c),f=Fe(r(u));return t.push({paramPath:l+"/filters"},{paramPath:l+"/bias"}),{filters:h,bias:f}}function a(s,u){var c=Fe(r(s)),l=Fe(r(s));return t.push({paramPath:u+"/weights"},{paramPath:u+"/biases"}),{weights:c,biases:l}}function o(s,u,c,l){var h=n(s,u,c,l+"/conv"),f=a(u,l+"/scale");return{conv:h,scale:f}}function i(s,u,c,l,h){h===void 0&&(h=!1);var f=o((h?.5:1)*s,u,c,l+"/conv1"),p=o(s,u,c,l+"/conv2");return{conv1:f,conv2:p}}return{extractConvLayerParams:o,extractResidualLayerParams:i}}function Ng(r){var t=$t(r),e=t.extractWeights,n=t.getRemainingWeights,a=[],o=Tg(e,a),i=o.extractConvLayerParams,s=o.extractResidualLayerParams,u=i(4704,32,7,"conv32_down"),c=s(9216,32,3,"conv32_1"),l=s(9216,32,3,"conv32_2"),h=s(9216,32,3,"conv32_3"),f=s(36864,64,3,"conv64_down",!0),p=s(36864,64,3,"conv64_1"),d=s(36864,64,3,"conv64_2"),m=s(36864,64,3,"conv64_3"),v=s(147456,128,3,"conv128_down",!0),g=s(147456,128,3,"conv128_1"),x=s(147456,128,3,"conv128_2"),b=s(589824,256,3,"conv256_down",!0),y=s(589824,256,3,"conv256_1"),w=s(589824,256,3,"conv256_2"),C=s(589824,256,3,"conv256_down_out"),S=X(function(){return an(tn(e(256*128),[128,256]),[1,0])});if(a.push({paramPath:"fc"}),n().length!==0)throw new Error("weights remaing after extract: "+n().length);var I={conv32_down:u,conv32_1:c,conv32_2:l,conv32_3:h,conv64_down:f,conv64_1:p,conv64_2:d,conv64_3:m,conv128_down:v,conv128_1:g,conv128_2:x,conv256_down:b,conv256_1:y,conv256_2:w,conv256_down_out:C,fc:S};return{params:I,paramMappings:a}}function Fg(r,t){var e=cn(r,t);function n(i){var s=e(i+"/scale/weights",1),u=e(i+"/scale/biases",1);return{weights:s,biases:u}}function a(i){var s=e(i+"/conv/filters",4),u=e(i+"/conv/bias",1),c=n(i);return{conv:{filters:s,bias:u},scale:c}}function o(i){return{conv1:a(i+"/conv1"),conv2:a(i+"/conv2")}}return{extractConvLayerParams:a,extractResidualLayerParams:o}}function Pg(r){var t=[],e=Fg(r,t),n=e.extractConvLayerParams,a=e.extractResidualLayerParams,o=n("conv32_down"),i=a("conv32_1"),s=a("conv32_2"),u=a("conv32_3"),c=a("conv64_down"),l=a("conv64_1"),h=a("conv64_2"),f=a("conv64_3"),p=a("conv128_down"),d=a("conv128_1"),m=a("conv128_2"),v=a("conv256_down"),g=a("conv256_1"),x=a("conv256_2"),b=a("conv256_down_out"),y=r.fc;if(t.push({originalPath:"fc",paramPath:"fc"}),!Vm(y))throw new Error("expected weightMap[fc] to be a Tensor2D, instead have "+y);var w={conv32_down:o,conv32_1:i,conv32_2:s,conv32_3:u,conv64_down:c,conv64_1:l,conv64_2:h,conv64_3:f,conv128_down:p,conv128_1:d,conv128_2:m,conv256_down:v,conv256_1:g,conv256_2:x,conv256_down_out:b,fc:y};return Xt(r,t),{params:w,paramMappings:t}}function Et(r,t){var e=Ag(r,t.conv1);return e=Uc(e,t.conv2),e=de(e,r),e=De(e),e}function Nr(r,t){var e=zc(r,t.conv1);e=Uc(e,t.conv2);var n=vr(r,2,2,"valid"),a=Ie(n.shape),o=n.shape[3]!==e.shape[3],i=n.shape[1]!==e.shape[1]||n.shape[2]!==e.shape[2];if(i){var s=tr(e.shape);s[1]=1;var u=Ie(s);e=Me([e,u],1);var c=tr(e.shape);c[2]=1;var l=Ie(c);e=Me([e,l],2)}return n=o?Me([n,a],3):n,e=de(n,e),e=De(e),e}var Mg=(function(r){ue(t,r);function t(){return r.call(this,"FaceRecognitionNet")||this}return t.prototype.forwardInput=function(e){var n=this.params;if(!n)throw new Error("FaceRecognitionNet - load model before inference");return X(function(){var a=e.toBatchTensor(150,!0).toFloat(),o=[122.782,117.001,104.298],i=gr(a,o).div(q(256)),s=zc(i,n.conv32_down);s=Ue(s,3,2,"valid"),s=Et(s,n.conv32_1),s=Et(s,n.conv32_2),s=Et(s,n.conv32_3),s=Nr(s,n.conv64_down),s=Et(s,n.conv64_1),s=Et(s,n.conv64_2),s=Et(s,n.conv64_3),s=Nr(s,n.conv128_down),s=Et(s,n.conv128_1),s=Et(s,n.conv128_2),s=Nr(s,n.conv256_down),s=Et(s,n.conv256_1),s=Et(s,n.conv256_2),s=Nr(s,n.conv256_down_out);var u=s.mean([1,2]),c=pa(u,n.fc);return c})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.computeFaceDescriptor=function(e){return te(this,void 0,void 0,function(){var n,a,o,i=this;return ne(this,function(s){switch(s.label){case 0:return[4,Ve(e)];case 1:return n=s.sent(),a=X(function(){return Oe(i.forwardInput(n))}),[4,Promise.all(a.map(function(u){return u.data()}))];case 2:return o=s.sent(),a.forEach(function(u){return u.dispose()}),[2,n.isBatchInput?o:o[0]]}})})},t.prototype.getDefaultModelName=function(){return"face_recognition_model"},t.prototype.extractParamsFromWeigthMap=function(e){return Pg(e)},t.prototype.extractParams=function(e){return Ng(e)},t})(Kt);function Vc(r,t){var e={descriptor:t};return Object.assign({},r,e)}function Gc(r,t){var e={age:t};return Object.assign({},r,e)}function Hc(r,t,e){var n={gender:t,genderProbability:e};return Object.assign({},r,n)}var jc=(function(){function r(t){var e=t===void 0?{}:t,n=e.minFaceSize,a=e.scaleFactor,o=e.maxNumScales,i=e.scoreThresholds,s=e.scaleSteps;if(this._name="MtcnnOptions",this._minFaceSize=n||20,this._scaleFactor=a||.709,this._maxNumScales=o||10,this._scoreThresholds=i||[.6,.7,.7],this._scaleSteps=s,typeof this._minFaceSize!="number"||this._minFaceSize<0)throw new Error(this._name+" - expected minFaceSize to be a number > 0");if(typeof this._scaleFactor!="number"||this._scaleFactor<=0||this._scaleFactor>=1)throw new Error(this._name+" - expected scaleFactor to be a number between 0 and 1");if(typeof this._maxNumScales!="number"||this._maxNumScales<0)throw new Error(this._name+" - expected maxNumScales to be a number > 0");if(!Array.isArray(this._scoreThresholds)||this._scoreThresholds.length!==3||this._scoreThresholds.some(function(u){return typeof u!="number"}))throw new Error(this._name+" - expected scoreThresholds to be an array of numbers of length 3");if(this._scaleSteps&&(!Array.isArray(this._scaleSteps)||this._scaleSteps.some(function(u){return typeof u!="number"})))throw new Error(this._name+" - expected scaleSteps to be an array of numbers")}return Object.defineProperty(r.prototype,"minFaceSize",{get:function(){return this._minFaceSize},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"scaleFactor",{get:function(){return this._scaleFactor},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"maxNumScales",{get:function(){return this._maxNumScales},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"scoreThresholds",{get:function(){return this._scoreThresholds},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"scaleSteps",{get:function(){return this._scaleSteps},enumerable:!0,configurable:!0}),r})();function Og(r,t){function e(u,c){var l=Ze(r(9*u),[3,3,u,1]),h=Fe(r(u)),f=Fe(r(u)),p=Fe(r(u)),d=Fe(r(u));return t.push({paramPath:c+"/filters"},{paramPath:c+"/batch_norm_scale"},{paramPath:c+"/batch_norm_offset"},{paramPath:c+"/batch_norm_mean"},{paramPath:c+"/batch_norm_variance"}),{filters:l,batch_norm_scale:h,batch_norm_offset:f,batch_norm_mean:p,batch_norm_variance:d}}function n(u,c,l,h,f){var p=Ze(r(u*c*l*l),[l,l,u,c]),d=Fe(r(c));return t.push({paramPath:h+"/filters"},{paramPath:h+"/"+(f?"batch_norm_offset":"bias")}),{filters:p,bias:d}}function a(u,c,l,h){var f=n(u,c,l,h,!0),p=f.filters,d=f.bias;return{filters:p,batch_norm_offset:d}}function o(u,c,l){var h=e(u,l+"/depthwise_conv"),f=a(u,c,1,l+"/pointwise_conv");return{depthwise_conv:h,pointwise_conv:f}}function i(){var u=a(3,32,3,"mobilenetv1/conv_0"),c=o(32,64,"mobilenetv1/conv_1"),l=o(64,128,"mobilenetv1/conv_2"),h=o(128,128,"mobilenetv1/conv_3"),f=o(128,256,"mobilenetv1/conv_4"),p=o(256,256,"mobilenetv1/conv_5"),d=o(256,512,"mobilenetv1/conv_6"),m=o(512,512,"mobilenetv1/conv_7"),v=o(512,512,"mobilenetv1/conv_8"),g=o(512,512,"mobilenetv1/conv_9"),x=o(512,512,"mobilenetv1/conv_10"),b=o(512,512,"mobilenetv1/conv_11"),y=o(512,1024,"mobilenetv1/conv_12"),w=o(1024,1024,"mobilenetv1/conv_13");return{conv_0:u,conv_1:c,conv_2:l,conv_3:h,conv_4:f,conv_5:p,conv_6:d,conv_7:m,conv_8:v,conv_9:g,conv_10:x,conv_11:b,conv_12:y,conv_13:w}}function s(){var u=a(1024,256,1,"prediction_layer/conv_0"),c=a(256,512,3,"prediction_layer/conv_1"),l=a(512,128,1,"prediction_layer/conv_2"),h=a(128,256,3,"prediction_layer/conv_3"),f=a(256,128,1,"prediction_layer/conv_4"),p=a(128,256,3,"prediction_layer/conv_5"),d=a(256,64,1,"prediction_layer/conv_6"),m=a(64,128,3,"prediction_layer/conv_7"),v=n(512,12,1,"prediction_layer/box_predictor_0/box_encoding_predictor"),g=n(512,9,1,"prediction_layer/box_predictor_0/class_predictor"),x=n(1024,24,1,"prediction_layer/box_predictor_1/box_encoding_predictor"),b=n(1024,18,1,"prediction_layer/box_predictor_1/class_predictor"),y=n(512,24,1,"prediction_layer/box_predictor_2/box_encoding_predictor"),w=n(512,18,1,"prediction_layer/box_predictor_2/class_predictor"),C=n(256,24,1,"prediction_layer/box_predictor_3/box_encoding_predictor"),S=n(256,18,1,"prediction_layer/box_predictor_3/class_predictor"),I=n(256,24,1,"prediction_layer/box_predictor_4/box_encoding_predictor"),k=n(256,18,1,"prediction_layer/box_predictor_4/class_predictor"),R=n(128,24,1,"prediction_layer/box_predictor_5/box_encoding_predictor"),N=n(128,18,1,"prediction_layer/box_predictor_5/class_predictor"),A={box_encoding_predictor:v,class_predictor:g},L={box_encoding_predictor:x,class_predictor:b},M={box_encoding_predictor:y,class_predictor:w},O={box_encoding_predictor:C,class_predictor:S},V={box_encoding_predictor:I,class_predictor:k},U={box_encoding_predictor:R,class_predictor:N};return{conv_0:u,conv_1:c,conv_2:l,conv_3:h,conv_4:f,conv_5:p,conv_6:d,conv_7:m,box_predictor_0:A,box_predictor_1:L,box_predictor_2:M,box_predictor_3:O,box_predictor_4:V,box_predictor_5:U}}return{extractMobilenetV1Params:i,extractPredictionLayerParams:s}}function Bg(r){var t=[],e=$t(r),n=e.extractWeights,a=e.getRemainingWeights,o=Og(n,t),i=o.extractMobilenetV1Params,s=o.extractPredictionLayerParams,u=i(),c=s(),l=Do(n(5118*4),[1,5118,4]),h={extra_dim:l};if(t.push({paramPath:"output_layer/extra_dim"}),a().length!==0)throw new Error("weights remaing after extract: "+a().length);return{params:{mobilenetv1:u,prediction_layer:c,output_layer:h},paramMappings:t}}function Lg(r,t){var e=cn(r,t);function n(c,l,h){var f=e(c+"/Conv2d_"+l+"_pointwise/weights",4,h+"/filters"),p=e(c+"/Conv2d_"+l+"_pointwise/convolution_bn_offset",1,h+"/batch_norm_offset");return{filters:f,batch_norm_offset:p}}function a(c){var l="mobilenetv1/conv_"+c,h="MobilenetV1/Conv2d_"+c+"_depthwise",f=l+"/depthwise_conv",p=l+"/pointwise_conv",d=e(h+"/depthwise_weights",4,f+"/filters"),m=e(h+"/BatchNorm/gamma",1,f+"/batch_norm_scale"),v=e(h+"/BatchNorm/beta",1,f+"/batch_norm_offset"),g=e(h+"/BatchNorm/moving_mean",1,f+"/batch_norm_mean"),x=e(h+"/BatchNorm/moving_variance",1,f+"/batch_norm_variance");return{depthwise_conv:{filters:d,batch_norm_scale:m,batch_norm_offset:v,batch_norm_mean:g,batch_norm_variance:x},pointwise_conv:n("MobilenetV1",c,p)}}function o(){return{conv_0:n("MobilenetV1",0,"mobilenetv1/conv_0"),conv_1:a(1),conv_2:a(2),conv_3:a(3),conv_4:a(4),conv_5:a(5),conv_6:a(6),conv_7:a(7),conv_8:a(8),conv_9:a(9),conv_10:a(10),conv_11:a(11),conv_12:a(12),conv_13:a(13)}}function i(c,l){var h=e(c+"/weights",4,l+"/filters"),f=e(c+"/biases",1,l+"/bias");return{filters:h,bias:f}}function s(c){var l=i("Prediction/BoxPredictor_"+c+"/BoxEncodingPredictor","prediction_layer/box_predictor_"+c+"/box_encoding_predictor"),h=i("Prediction/BoxPredictor_"+c+"/ClassPredictor","prediction_layer/box_predictor_"+c+"/class_predictor");return{box_encoding_predictor:l,class_predictor:h}}function u(){return{conv_0:n("Prediction",0,"prediction_layer/conv_0"),conv_1:n("Prediction",1,"prediction_layer/conv_1"),conv_2:n("Prediction",2,"prediction_layer/conv_2"),conv_3:n("Prediction",3,"prediction_layer/conv_3"),conv_4:n("Prediction",4,"prediction_layer/conv_4"),conv_5:n("Prediction",5,"prediction_layer/conv_5"),conv_6:n("Prediction",6,"prediction_layer/conv_6"),conv_7:n("Prediction",7,"prediction_layer/conv_7"),box_predictor_0:s(0),box_predictor_1:s(1),box_predictor_2:s(2),box_predictor_3:s(3),box_predictor_4:s(4),box_predictor_5:s(5)}}return{extractMobilenetV1Params:o,extractPredictionLayerParams:u}}function Wg(r){var t=[],e=Lg(r,t),n=e.extractMobilenetV1Params,a=e.extractPredictionLayerParams,o=r["Output/extra_dim"];if(t.push({originalPath:"Output/extra_dim",paramPath:"output_layer/extra_dim"}),!ga(o))throw new Error("expected weightMap['Output/extra_dim'] to be a Tensor3D, instead have "+o);var i={mobilenetv1:n(),prediction_layer:a(),output_layer:{extra_dim:o}};return Xt(r,t),{params:i,paramMappings:t}}function kt(r,t,e){return X(function(){var n=mt(r,t.filters,e,"same");return n=de(n,t.batch_norm_offset),Uo(n,0,6)})}var Ug=.0010000000474974513;function zg(r,t,e){return X(function(){var n=fa(r,t.filters,e,"same");return n=Wu(n,t.batch_norm_mean,t.batch_norm_variance,t.batch_norm_offset,t.batch_norm_scale,Ug),Uo(n,0,6)})}function Vg(r){return[2,4,6,12].some(function(t){return t===r})?[2,2]:[1,1]}function Gg(r,t){return X(function(){var e=null,n=kt(r,t.conv_0,[2,2]),a=[t.conv_1,t.conv_2,t.conv_3,t.conv_4,t.conv_5,t.conv_6,t.conv_7,t.conv_8,t.conv_9,t.conv_10,t.conv_11,t.conv_12,t.conv_13];if(a.forEach(function(o,i){var s=i+1,u=Vg(s);n=zg(n,o.depthwise_conv,u),n=kt(n,o.pointwise_conv,[1,1]),s===11&&(e=n)}),e===null)throw new Error("mobileNetV1 - output of conv layer 11 is null");return{out:n,conv11:e}})}function Hg(r,t,e,n,a){var o=r.shape[0],i=Math.min(e,o),s=t.map(function(l,h){return{score:l,boxIndex:h}}).filter(function(l){return l.score>a}).sort(function(l,h){return h.score-l.score}),u=function(l){return l<=n?1:0},c=[];return s.forEach(function(l){if(!(c.length>=i)){for(var h=l.score,f=c.length-1;f>=0;--f){var p=jg(r,l.boxIndex,c[f]);if(p!==0&&(l.score*=u(p),l.score<=a))break}h===l.score&&c.push(l.boxIndex)}}),c}function jg(r,t,e){var n=r.arraySync(),a=Math.min(n[t][0],n[t][2]),o=Math.min(n[t][1],n[t][3]),i=Math.max(n[t][0],n[t][2]),s=Math.max(n[t][1],n[t][3]),u=Math.min(n[e][0],n[e][2]),c=Math.min(n[e][1],n[e][3]),l=Math.max(n[e][0],n[e][2]),h=Math.max(n[e][1],n[e][3]),f=(i-a)*(s-o),p=(l-u)*(h-c);if(f<=0||p<=0)return 0;var d=Math.max(a,u),m=Math.max(o,c),v=Math.min(i,l),g=Math.min(s,h),x=Math.max(v-d,0)*Math.max(g-m,0);return x/(f+p-x)}function qg(r){var t=Oe(an(r,[1,0])),e=[Le(t[2],t[0]),Le(t[3],t[1])],n=[de(t[0],gt(e[0],q(2))),de(t[1],gt(e[1],q(2)))];return{sizes:e,centers:n}}function Kg(r,t){var e=qg(r),n=e.sizes,a=e.centers,o=Oe(an(t,[1,0])),i=gt(Ye(go(gt(o[2],q(5))),n[0]),q(2)),s=de(Ye(gt(o[0],q(10)),n[0]),a[0]),u=gt(Ye(go(gt(o[3],q(5))),n[1]),q(2)),c=de(Ye(gt(o[1],q(10)),n[1]),a[1]);return an(ft([Le(s,i),Le(c,u),de(s,i),de(c,u)]),[1,0])}function Xg(r,t,e){return X(function(){var n=r.shape[0],a=Kg(yt(On(e.extra_dim,[n,1,1]),[-1,4]),yt(r,[-1,4]));a=yt(a,[n,a.shape[0]/n,4]);var o=Mu(Ft(t,[0,0,1],[-1,-1,-1])),i=Ft(o,[0,0,0],[-1,-1,1]);i=yt(i,[n,i.shape[1]]);var s=Oe(a),u=Oe(i);return{boxes:s,scores:u}})}function An(r,t){return X(function(){var e=r.shape[0],n=yt(xt(r,t.box_encoding_predictor),[e,-1,1,4]),a=yt(xt(r,t.class_predictor),[e,-1,3]);return{boxPredictionEncoding:n,classPrediction:a}})}function $g(r,t,e){return X(function(){var n=kt(r,e.conv_0,[1,1]),a=kt(n,e.conv_1,[2,2]),o=kt(a,e.conv_2,[1,1]),i=kt(o,e.conv_3,[2,2]),s=kt(i,e.conv_4,[1,1]),u=kt(s,e.conv_5,[2,2]),c=kt(u,e.conv_6,[1,1]),l=kt(c,e.conv_7,[2,2]),h=An(t,e.box_predictor_0),f=An(r,e.box_predictor_1),p=An(a,e.box_predictor_2),d=An(i,e.box_predictor_3),m=An(u,e.box_predictor_4),v=An(l,e.box_predictor_5),g=Me([h.boxPredictionEncoding,f.boxPredictionEncoding,p.boxPredictionEncoding,d.boxPredictionEncoding,m.boxPredictionEncoding,v.boxPredictionEncoding],1),x=Me([h.classPrediction,f.classPrediction,p.classPrediction,d.classPrediction,m.classPrediction,v.classPrediction],1);return{boxPredictions:g,classPredictions:x}})}var yr=(function(){function r(t){var e=t===void 0?{}:t,n=e.minConfidence,a=e.maxResults;if(this._name="SsdMobilenetv1Options",this._minConfidence=n||.5,this._maxResults=a||100,typeof this._minConfidence!="number"||this._minConfidence<=0||this._minConfidence>=1)throw new Error(this._name+" - expected minConfidence to be a number between 0 and 1");if(typeof this._maxResults!="number")throw new Error(this._name+" - expected maxResults to be a number")}return Object.defineProperty(r.prototype,"minConfidence",{get:function(){return this._minConfidence},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"maxResults",{get:function(){return this._maxResults},enumerable:!0,configurable:!0}),r})(),qc=(function(r){ue(t,r);function t(){return r.call(this,"SsdMobilenetv1")||this}return t.prototype.forwardInput=function(e){var n=this.params;if(!n)throw new Error("SsdMobilenetv1 - load model before inference");return X(function(){var a=e.toBatchTensor(512,!1).toFloat(),o=Le(Ye(a,q(.007843137718737125)),q(1)),i=Gg(o,n.mobilenetv1),s=$g(i.out,i.conv11,n.prediction_layer),u=s.boxPredictions,c=s.classPredictions;return Xg(u,c,n.output_layer)})},t.prototype.forward=function(e){return te(this,void 0,void 0,function(){var n;return ne(this,function(a){switch(a.label){case 0:return n=this.forwardInput,[4,Ve(e)];case 1:return[2,n.apply(this,[a.sent()])]}})})},t.prototype.locateFaces=function(e,n){return n===void 0&&(n={}),te(this,void 0,void 0,function(){var a,o,i,s,u,c,l,h,f,p,d,m,v,g,x,b,y,w,C,S,I;return ne(this,function(k){switch(k.label){case 0:return a=new yr(n),o=a.maxResults,i=a.minConfidence,[4,Ve(e)];case 1:for(s=k.sent(),u=this.forwardInput(s),c=u.boxes,l=u.scores,h=c[0],f=l[0],p=1;p<c.length;p++)c[p].dispose(),l[p].dispose();return v=(m=Array).from,[4,f.data()];case 2:return d=v.apply(m,[k.sent()]),g=.5,x=Hg(h,d,o,g,i),b=s.getReshapedInputDimensions(0),y=s.inputSize,w=y/b.width,C=y/b.height,S=h.arraySync(),I=x.map(function(R){var N=[Math.max(0,S[R][0]),Math.min(1,S[R][2])].map(function(U){return U*C}),A=N[0],L=N[1],M=[Math.max(0,S[R][1]),Math.min(1,S[R][3])].map(function(U){return U*w}),O=M[0],V=M[1];return new Bt(d[R],new ri(O,A,V-O,L-A),{height:s.getInputHeight(0),width:s.getInputWidth(0)})}),h.dispose(),f.dispose(),[2,I]}})})},t.prototype.getDefaultModelName=function(){return"ssd_mobilenetv1_model"},t.prototype.extractParamsFromWeigthMap=function(e){return Wg(e)},t.prototype.extractParams=function(e){return Bg(e)},t})(Kt);(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t})(qc);var Yg=.4,Jg=[new be(.738768,.874946),new be(2.42204,2.65704),new be(4.30971,7.04493),new be(10.246,4.59428),new be(12.6868,11.8741)],Qg=[new be(1.603231,2.094468),new be(6.041143,7.080126),new be(2.882459,3.518061),new be(4.266906,5.178857),new be(9.041765,10.66308)],Zg=[117.001,114.697,97.404],e0="tiny_yolov2_model",t0="tiny_yolov2_separable_conv_model",Fr=function(r){return typeof r=="number"};function n0(r){if(!r)throw new Error("invalid config: "+r);if(typeof r.withSeparableConvs!="boolean")throw new Error("config.withSeparableConvs has to be a boolean, have: "+r.withSeparableConvs);if(!Fr(r.iouThreshold)||r.iouThreshold<0||r.iouThreshold>1)throw new Error("config.iouThreshold has to be a number between [0, 1], have: "+r.iouThreshold);if(!Array.isArray(r.classes)||!r.classes.length||!r.classes.every(function(t){return typeof t=="string"}))throw new Error("config.classes has to be an array class names: string[], have: "+JSON.stringify(r.classes));if(!Array.isArray(r.anchors)||!r.anchors.length||!r.anchors.map(function(t){return t||{}}).every(function(t){return Fr(t.x)&&Fr(t.y)}))throw new Error("config.anchors has to be an array of { x: number, y: number }, have: "+JSON.stringify(r.anchors));if(r.meanRgb&&(!Array.isArray(r.meanRgb)||r.meanRgb.length!==3||!r.meanRgb.every(Fr)))throw new Error("config.meanRgb has to be an array of shape [number, number, number], have: "+JSON.stringify(r.meanRgb))}function di(r){return X(function(){var t=Ye(r,q(.10000000149011612));return de(De(Le(r,t)),t)})}function Jt(r,t){return X(function(){var e=bn(r,[[0,0],[1,1],[1,1],[0,0]]);return e=mt(e,t.conv.filters,[1,1],"valid"),e=Le(e,t.bn.sub),e=Ye(e,t.bn.truediv),e=de(e,t.conv.bias),di(e)})}function Qt(r,t){return X(function(){var e=bn(r,[[0,0],[1,1],[1,1],[0,0]]);return e=Ho(e,t.depthwise_filter,t.pointwise_filter,[1,1],"valid"),e=de(e,t.bias),di(e)})}function r0(r,t){var e=ba(r,t);function n(i,s){var u=Fe(r(i)),c=Fe(r(i));return t.push({paramPath:s+"/sub"},{paramPath:s+"/truediv"}),{sub:u,truediv:c}}function a(i,s,u){var c=e(i,s,3,u+"/conv"),l=n(s,u+"/bn");return{conv:c,bn:l}}var o=li(r,t);return{extractConvParams:e,extractConvWithBatchNormParams:a,extractSeparableConvParams:o}}function a0(r,t,e,n){var a=$t(r),o=a.extractWeights,i=a.getRemainingWeights,s=[],u=r0(o,s),c=u.extractConvParams,l=u.extractConvWithBatchNormParams,h=u.extractSeparableConvParams,f;if(t.withSeparableConvs){var p=n[0],d=n[1],m=n[2],v=n[3],g=n[4],x=n[5],b=n[6],y=n[7],w=n[8],C=t.isFirstLayerConv2d?c(p,d,3,"conv0"):h(p,d,"conv0"),S=h(d,m,"conv1"),I=h(m,v,"conv2"),k=h(v,g,"conv3"),R=h(g,x,"conv4"),N=h(x,b,"conv5"),A=y?h(b,y,"conv6"):void 0,L=w?h(y,w,"conv7"):void 0,M=c(w||y||b,5*e,1,"conv8");f={conv0:C,conv1:S,conv2:I,conv3:k,conv4:R,conv5:N,conv6:A,conv7:L,conv8:M}}else{var p=n[0],d=n[1],m=n[2],v=n[3],g=n[4],x=n[5],b=n[6],y=n[7],w=n[8],C=l(p,d,"conv0"),S=l(d,m,"conv1"),I=l(m,v,"conv2"),k=l(v,g,"conv3"),R=l(g,x,"conv4"),N=l(x,b,"conv5"),A=l(b,y,"conv6"),L=l(y,w,"conv7"),M=c(w,5*e,1,"conv8");f={conv0:C,conv1:S,conv2:I,conv3:k,conv4:R,conv5:N,conv6:A,conv7:L,conv8:M}}if(i().length!==0)throw new Error("weights remaing after extract: "+i().length);return{params:f,paramMappings:s}}function o0(r,t){var e=cn(r,t);function n(s){var u=e(s+"/sub",1),c=e(s+"/truediv",1);return{sub:u,truediv:c}}function a(s){var u=e(s+"/filters",4),c=e(s+"/bias",1);return{filters:u,bias:c}}function o(s){var u=a(s+"/conv"),c=n(s+"/bn");return{conv:u,bn:c}}var i=hi(e);return{extractConvParams:a,extractConvWithBatchNormParams:o,extractSeparableConvParams:i}}function i0(r,t){var e=[],n=o0(r,e),a=n.extractConvParams,o=n.extractConvWithBatchNormParams,i=n.extractSeparableConvParams,s;if(t.withSeparableConvs){var u=t.filterSizes&&t.filterSizes.length||9;s={conv0:t.isFirstLayerConv2d?a("conv0"):i("conv0"),conv1:i("conv1"),conv2:i("conv2"),conv3:i("conv3"),conv4:i("conv4"),conv5:i("conv5"),conv6:u>7?i("conv6"):void 0,conv7:u>8?i("conv7"):void 0,conv8:a("conv8")}}else s={conv0:o("conv0"),conv1:o("conv1"),conv2:o("conv2"),conv3:o("conv3"),conv4:o("conv4"),conv5:o("conv5"),conv6:o("conv6"),conv7:o("conv7"),conv8:a("conv8")};return Xt(r,e),{params:s,paramMappings:e}}var Ds;(function(r){r[r.XS=224]="XS",r[r.SM=320]="SM",r[r.MD=416]="MD",r[r.LG=608]="LG"})(Ds||(Ds={}));var vi=(function(){function r(t){var e=t===void 0?{}:t,n=e.inputSize,a=e.scoreThreshold;if(this._name="TinyYolov2Options",this._inputSize=n||416,this._scoreThreshold=a||.5,typeof this._inputSize!="number"||this._inputSize%32!==0)throw new Error(this._name+" - expected inputSize to be a number divisible by 32");if(typeof this._scoreThreshold!="number"||this._scoreThreshold<=0||this._scoreThreshold>=1)throw new Error(this._name+" - expected scoreThreshold to be a number between 0 and 1")}return Object.defineProperty(r.prototype,"inputSize",{get:function(){return this._inputSize},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"scoreThreshold",{get:function(){return this._scoreThreshold},enumerable:!0,configurable:!0}),r})(),Kc=(function(r){ue(t,r);function t(e){var n=r.call(this,"TinyYolov2")||this;return n0(e),n._config=e,n}return Object.defineProperty(t.prototype,"config",{get:function(){return this._config},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"withClassScores",{get:function(){return this.config.withClassScores||this.config.classes.length>1},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"boxEncodingSize",{get:function(){return 5+(this.withClassScores?this.config.classes.length:0)},enumerable:!0,configurable:!0}),t.prototype.runTinyYolov2=function(e,n){var a=Jt(e,n.conv0);return a=Ue(a,[2,2],[2,2],"same"),a=Jt(a,n.conv1),a=Ue(a,[2,2],[2,2],"same"),a=Jt(a,n.conv2),a=Ue(a,[2,2],[2,2],"same"),a=Jt(a,n.conv3),a=Ue(a,[2,2],[2,2],"same"),a=Jt(a,n.conv4),a=Ue(a,[2,2],[2,2],"same"),a=Jt(a,n.conv5),a=Ue(a,[2,2],[1,1],"same"),a=Jt(a,n.conv6),a=Jt(a,n.conv7),xt(a,n.conv8,"valid",!1)},t.prototype.runMobilenet=function(e,n){var a=this.config.isFirstLayerConv2d?di(xt(e,n.conv0,"valid",!1)):Qt(e,n.conv0);return a=Ue(a,[2,2],[2,2],"same"),a=Qt(a,n.conv1),a=Ue(a,[2,2],[2,2],"same"),a=Qt(a,n.conv2),a=Ue(a,[2,2],[2,2],"same"),a=Qt(a,n.conv3),a=Ue(a,[2,2],[2,2],"same"),a=Qt(a,n.conv4),a=Ue(a,[2,2],[2,2],"same"),a=Qt(a,n.conv5),a=Ue(a,[2,2],[1,1],"same"),a=n.conv6?Qt(a,n.conv6):a,a=n.conv7?Qt(a,n.conv7):a,xt(a,n.conv8,"valid",!1)},t.prototype.forwardInput=function(e,n){var a=this,o=this.params;if(!o)throw new Error("TinyYolov2 - load model before inference");return X(function(){var i=e.toBatchTensor(n,!1).toFloat();return i=a.config.meanRgb?gr(i,a.config.meanRgb):i,i=i.div(q(256)),a.config.withSeparableConvs?a.runMobilenet(i,o):a.runTinyYolov2(i,o)})},t.prototype.forward=function(e,n){return te(this,void 0,void 0,function(){var a;return ne(this,function(o){switch(o.label){case 0:return a=this.forwardInput,[4,Ve(e)];case 1:return[4,a.apply(this,[o.sent(),n])];case 2:return[2,o.sent()]}})})},t.prototype.detect=function(e,n){return n===void 0&&(n={}),te(this,void 0,void 0,function(){var a,o,i,s,u,c,l,h,f,p,d,m,v,g,x=this;return ne(this,function(b){switch(b.label){case 0:return a=new vi(n),o=a.inputSize,i=a.scoreThreshold,[4,Ve(e)];case 1:return s=b.sent(),[4,this.forwardInput(s,o)];case 2:return u=b.sent(),c=X(function(){return Oe(u)[0].expandDims()}),l={width:s.getInputWidth(0),height:s.getInputHeight(0)},[4,this.extractBoxes(c,s.getReshapedInputDimensions(0),i)];case 3:return h=b.sent(),u.dispose(),c.dispose(),f=h.map(function(y){return y.box}),p=h.map(function(y){return y.score}),d=h.map(function(y){return y.classScore}),m=h.map(function(y){return x.config.classes[y.label]}),v=ur(f.map(function(y){return y.rescale(o)}),p,this.config.iouThreshold,!0),g=v.map(function(y){return new xc(p[y],d[y],m[y],f[y],l)}),[2,g]}})})},t.prototype.getDefaultModelName=function(){return""},t.prototype.extractParamsFromWeigthMap=function(e){return i0(e,this.config)},t.prototype.extractParams=function(e){var n=this.config.filterSizes||t.DEFAULT_FILTER_SIZES,a=n?n.length:void 0;if(a!==7&&a!==8&&a!==9)throw new Error("TinyYolov2 - expected 7 | 8 | 9 convolutional filters, but found "+a+" filterSizes in config");return a0(e,this.config,this.boxEncodingSize,n)},t.prototype.extractBoxes=function(e,n,a){return te(this,void 0,void 0,function(){var o,i,s,u,c,l,h,f,p,d,m,v,g,x,b,y,w,C,S,I,k,R,N,A,L,M,O,V,U,W=this;return ne(this,function(z){switch(z.label){case 0:return o=n.width,i=n.height,s=Math.max(o,i),u=s/o,c=s/i,l=e.shape[1],h=this.config.anchors.length,f=X(function(){var H=e.reshape([l,l,h,W.boxEncodingSize]),j=H.slice([0,0,0,0],[l,l,h,4]),J=H.slice([0,0,0,4],[l,l,h,1]),re=W.withClassScores?jt(H.slice([0,0,0,5],[l,l,h,W.config.classes.length]),3):q(0);return[j,J,re]}),p=f[0],d=f[1],m=f[2],v=[],[4,d.array()];case 1:return g=z.sent(),[4,p.array()];case 2:x=z.sent(),b=0,z.label=3;case 3:if(!(b<l))return[3,12];y=0,z.label=4;case 4:if(!(y<l))return[3,11];w=0,z.label=5;case 5:return w<h?(C=Ja(g[b][y][w][0]),!a||C>a?(S=(y+Ja(x[b][y][w][0]))/l*u,I=(b+Ja(x[b][y][w][1]))/l*c,k=Math.exp(x[b][y][w][2])*this.config.anchors[w].x/l*u,R=Math.exp(x[b][y][w][3])*this.config.anchors[w].y/l*c,N=S-k/2,A=I-R/2,L={row:b,col:y,anchor:w},this.withClassScores?[4,this.extractPredictedClass(m,L)]:[3,7]):[3,9]):[3,10];case 6:return U=z.sent(),[3,8];case 7:U={classScore:1,label:0},z.label=8;case 8:M=U,O=M.classScore,V=M.label,v.push(Ke({box:new ya(N,A,N+k,A+R),score:C,classScore:C*O,label:V},L)),z.label=9;case 9:return w++,[3,5];case 10:return y++,[3,4];case 11:return b++,[3,3];case 12:return p.dispose(),d.dispose(),m.dispose(),[2,v]}})})},t.prototype.extractPredictedClass=function(e,n){return te(this,void 0,void 0,function(){var a,o,i,s;return ne(this,function(u){switch(u.label){case 0:return a=n.row,o=n.col,i=n.anchor,[4,e.array()];case 1:return s=u.sent(),[2,Array(this.config.classes.length).fill(0).map(function(c,l){return s[a][o][i][l]}).map(function(c,l){return{classScore:c,label:l}}).reduce(function(c,l){return c.classScore>l.classScore?c:l})]}})})},t.DEFAULT_FILTER_SIZES=[3,16,32,64,128,256,512,1024,1024],t})(Kt),s0=(function(r){ue(t,r);function t(e){e===void 0&&(e=!0);var n=this,a=Object.assign({},{withSeparableConvs:e,iouThreshold:Yg,classes:["face"]},e?{anchors:Qg,meanRgb:Zg}:{anchors:Jg,withClassScores:!0});return n=r.call(this,a)||this,n}return Object.defineProperty(t.prototype,"withSeparableConvs",{get:function(){return this.config.withSeparableConvs},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"anchors",{get:function(){return this.config.anchors},enumerable:!0,configurable:!0}),t.prototype.locateFaces=function(e,n){return te(this,void 0,void 0,function(){var a;return ne(this,function(o){switch(o.label){case 0:return[4,this.detect(e,n)];case 1:return a=o.sent(),[2,a.map(function(i){return new Bt(i.score,i.relativeBox,{width:i.imageWidth,height:i.imageHeight})})]}})})},t.prototype.getDefaultModelName=function(){return this.withSeparableConvs?t0:e0},t.prototype.extractParamsFromWeigthMap=function(e){return r.prototype.extractParamsFromWeigthMap.call(this,e)},t})(Kc),Xc=(function(r){ue(t,r);function t(){var e=r!==null&&r.apply(this,arguments)||this;return e._name="TinyFaceDetectorOptions",e}return t})(vi),xr=(function(){function r(){}return r.prototype.then=function(t){return te(this,void 0,void 0,function(){var e;return ne(this,function(n){switch(n.label){case 0:return e=t,[4,this.run()];case 1:return[2,e.apply(void 0,[n.sent()])]}})})},r.prototype.run=function(){return te(this,void 0,void 0,function(){return ne(this,function(t){throw new Error("ComposableTask - run is not implemented")})})},r})();function wa(r,t,e,n,a){return a===void 0&&(a=function(o){var i=o.alignedRect;return i}),te(this,void 0,void 0,function(){var o,i,s,u,c;return ne(this,function(l){switch(l.label){case 0:return o=r.map(function(h){return vg(h)?a(h):h.detection}),s=n,s?[3,5]:t instanceof Se?[4,ui(t,o)]:[3,2];case 1:return u=l.sent(),[3,4];case 2:return[4,si(t,o)];case 3:u=l.sent(),l.label=4;case 4:s=u,l.label=5;case 5:return i=s,[4,e(i)];case 6:return c=l.sent(),i.forEach(function(h){return h instanceof Se&&h.dispose()}),[2,c]}})})}function mi(r,t,e,n,a){return te(this,void 0,void 0,function(){var o=this;return ne(this,function(i){return[2,wa([r],t,function(s){return te(o,void 0,void 0,function(){return ne(this,function(u){return[2,e(s[0])]})})},n,a)]})})}function u0(r){return X(function(){return ft(Oe(r,3).reverse(),3)})}var Pr=2,oa=12;function c0(r,t){var e=ba(r,t),n=ci(r,t);function a(c,l){var h=Fe(r(c));return t.push({paramPath:l}),h}function o(c,l,h){h===void 0&&(h=!1);var f=e(c[0],c[1],3,l+"/conv1"),p=a(c[1],l+"/prelu1_alpha"),d=e(c[1],c[2],3,l+"/conv2"),m=a(c[2],l+"/prelu2_alpha"),v=e(c[2],c[3],h?2:3,l+"/conv3"),g=a(c[3],l+"/prelu3_alpha");return{conv1:f,prelu1_alpha:p,conv2:d,prelu2_alpha:m,conv3:v,prelu3_alpha:g}}function i(){var c=o([3,10,16,32],"pnet"),l=e(32,2,1,"pnet/conv4_1"),h=e(32,4,1,"pnet/conv4_2");return Ke(Ke({},c),{conv4_1:l,conv4_2:h})}function s(){var c=o([3,28,48,64],"rnet",!0),l=n(576,128,"rnet/fc1"),h=a(128,"rnet/prelu4_alpha"),f=n(128,2,"rnet/fc2_1"),p=n(128,4,"rnet/fc2_2");return Ke(Ke({},c),{fc1:l,prelu4_alpha:h,fc2_1:f,fc2_2:p})}function u(){var c=o([3,32,64,64],"onet"),l=e(64,128,2,"onet/conv4"),h=a(128,"onet/prelu4_alpha"),f=n(1152,256,"onet/fc1"),p=a(256,"onet/prelu5_alpha"),d=n(256,2,"onet/fc2_1"),m=n(256,4,"onet/fc2_2"),v=n(256,10,"onet/fc2_3");return Ke(Ke({},c),{conv4:l,prelu4_alpha:h,fc1:f,prelu5_alpha:p,fc2_1:d,fc2_2:m,fc2_3:v})}return{extractPNetParams:i,extractRNetParams:s,extractONetParams:u}}function l0(r){var t=$t(r),e=t.extractWeights,n=t.getRemainingWeights,a=[],o=c0(e,a),i=o.extractPNetParams,s=o.extractRNetParams,u=o.extractONetParams,c=i(),l=s(),h=u();if(n().length!==0)throw new Error("weights remaing after extract: "+n().length);return{params:{pnet:c,rnet:l,onet:h},paramMappings:a}}function h0(r,t){var e=cn(r,t);function n(l){var h=e(l+"/weights",4,l+"/filters"),f=e(l+"/bias",1);return{filters:h,bias:f}}function a(l){var h=e(l+"/weights",2),f=e(l+"/bias",1);return{weights:h,bias:f}}function o(l){return e(l,1)}function i(l){var h=n(l+"/conv1"),f=o(l+"/prelu1_alpha"),p=n(l+"/conv2"),d=o(l+"/prelu2_alpha"),m=n(l+"/conv3"),v=o(l+"/prelu3_alpha");return{conv1:h,prelu1_alpha:f,conv2:p,prelu2_alpha:d,conv3:m,prelu3_alpha:v}}function s(){var l=i("pnet"),h=n("pnet/conv4_1"),f=n("pnet/conv4_2");return Ke(Ke({},l),{conv4_1:h,conv4_2:f})}function u(){var l=i("rnet"),h=a("rnet/fc1"),f=o("rnet/prelu4_alpha"),p=a("rnet/fc2_1"),d=a("rnet/fc2_2");return Ke(Ke({},l),{fc1:h,prelu4_alpha:f,fc2_1:p,fc2_2:d})}function c(){var l=i("onet"),h=n("onet/conv4"),f=o("onet/prelu4_alpha"),p=a("onet/fc1"),d=o("onet/prelu5_alpha"),m=a("onet/fc2_1"),v=a("onet/fc2_2"),g=a("onet/fc2_3");return Ke(Ke({},l),{conv4:h,prelu4_alpha:f,fc1:p,prelu5_alpha:d,fc2_1:m,fc2_2:v,fc2_3:g})}return{extractPNetParams:s,extractRNetParams:u,extractONetParams:c}}function f0(r){var t=[],e=h0(r,t),n=e.extractPNetParams,a=e.extractRNetParams,o=e.extractONetParams,i=n(),s=a(),u=o();return Xt(r,t),{params:{pnet:i,rnet:s,onet:u},paramMappings:t}}function ko(r,t){var e=t[0],n=t[1];return{height:Math.floor(e*r),width:Math.floor(n*r)}}function p0(r,t,e){for(var n=e[0],a=e[1],o=oa/r,i=[],s=Math.min(n,a)*o,u=0;s>=12;)i.push(o*Math.pow(t,u)),s=s*t,u+=1;return i}var gi=(function(r){ue(t,r);function t(e,n,a,o){return r.call(this,{left:e,top:n,right:a,bottom:o},!0)||this}return t})(on);function $c(r){return X(function(){return Ye(Le(r,q(127.5)),q(.0078125))})}function Vn(r,t){return X(function(){return de(De(r),Ye(t,Qr(De(Qr(r)))))})}function yi(r,t,e){return e===void 0&&(e=!1),X(function(){var n=xt(r,t.conv1,"valid");return n=Vn(n,t.prelu1_alpha),n=Ue(n,e?[2,2]:[3,3],[2,2],"same"),n=xt(n,t.conv2,"valid"),n=Vn(n,t.prelu2_alpha),n=e?n:Ue(n,[3,3],[2,2],"valid"),n=xt(n,t.conv3,"valid"),n=Vn(n,t.prelu3_alpha),n})}function d0(r,t){return X(function(){var e=yi(r,t,!0),n=xt(e,t.conv4_1,"valid"),a=pt(da(n,3),3),o=jt(Le(n,a),3),i=xt(e,t.conv4_2,"valid");return{prob:o,regions:i}})}function v0(r,t){return X(function(){var e=ko(t,r.shape.slice(1)),n=e.height,a=e.width,o=$o.resizeBilinear(r,[n,a]),i=$c(o);return an(i,[0,2,1,3])})}function m0(r,t,e,n){for(var a=[],o=r.arraySync(),i=0;i<r.shape[0];i++)for(var s=0;s<r.shape[1];s++)o[i][s]>=n&&a.push(new be(s,i));var u=a.map(function(c){var l=new ya(Math.round((c.y*Pr+1)/e),Math.round((c.x*Pr+1)/e),Math.round((c.y*Pr+oa)/e),Math.round((c.x*Pr+oa)/e)),h=o[c.y][c.x],f=t.arraySync(),p=new gi(f[c.y][c.x][0],f[c.y][c.x][1],f[c.y][c.x][2],f[c.y][c.x][3]);return{cell:l,score:h,region:p}});return u}function g0(r,t,e,n,a){a.stage1=[];var o=t.map(function(f){return X(function(){var p={scale:f},d=v0(r,f),m=Date.now(),v=d0(d,n),g=v.prob,x=v.regions;p.pnet=Date.now()-m;var b=Oe(Oe(g,3)[1])[0],y=Oe(x)[0];return{scoresTensor:b,regionsTensor:y,scale:f,statsForScale:p}})}),i=o.map(function(f){var p=f.scoresTensor,d=f.regionsTensor,m=f.scale,v=f.statsForScale,g=m0(p,d,m,e);if(p.dispose(),d.dispose(),!g.length)return a.stage1.push(v),[];var x=Date.now(),b=ur(g.map(function(y){return y.cell}),g.map(function(y){return y.score}),.5);return v.nms=Date.now()-x,v.numBoxes=b.length,a.stage1.push(v),b.map(function(y){return g[y]})}),s=i.reduce(function(f,p){return f.concat(p)},[]),u=[],c=[];if(s.length>0){var l=Date.now(),h=ur(s.map(function(f){return f.cell}),s.map(function(f){return f.score}),.7);a.stage1_nms=Date.now()-l,c=h.map(function(f){return s[f].score}),u=h.map(function(f){return s[f]}).map(function(f){var p=f.cell,d=f.region;return new ya(p.left+d.left*p.width,p.top+d.top*p.height,p.right+d.right*p.width,p.bottom+d.bottom*p.height).toSquare().round()})}return{boxes:u,scores:c}}function Yc(r,t,e){var n=e.width,a=e.height;return te(this,void 0,void 0,function(){var o,i,s,u=this;return ne(this,function(c){switch(c.label){case 0:return o=yn(r),[4,Promise.all(t.map(function(l){return te(u,void 0,void 0,function(){var h,f,p,d,m,v,g,x;return ne(this,function(b){return h=l.padAtBorders(r.height,r.width),f=h.y,p=h.ey,d=h.x,m=h.ex,v=d-1,g=f-1,x=o.getImageData(v,g,m-v,p-g),[2,Qe.isNodejs()?ii(x):createImageBitmap(x)]})})}))];case 1:return i=c.sent(),s=[],i.forEach(function(l){var h=xa({width:n,height:a}),f=yn(h);f.drawImage(l,0,0,n,a);for(var p=f.getImageData(0,0,n,a).data,d=[],m=0;m<p.length;m+=4)d.push(p[m+2]),d.push(p[m+1]),d.push(p[m]);s.push(d)}),[2,s.map(function(l){var h=X(function(){var f=an(Ze(l,[1,n,a,3]),[0,2,1,3]).toFloat();return $c(f)});return h})]}})})}function y0(r,t){return X(function(){var e=yi(r,t),n=yt(e,[e.shape[0],t.fc1.weights.shape[0]]),a=Dt(n,t.fc1),o=Vn(a,t.prelu4_alpha),i=Dt(o,t.fc2_1),s=pt(da(i,1),1),u=jt(Le(i,s),1),c=Dt(o,t.fc2_2),l=Oe(u,1)[1];return{scores:l,regions:c}})}function x0(r,t,e,n,a){return te(this,void 0,void 0,function(){var o,i,s,u,c,l,h,f,p,d,m,v,g,x;return ne(this,function(b){switch(b.label){case 0:return o=Date.now(),[4,Yc(r,t,{width:24,height:24})];case 1:return i=b.sent(),a.stage2_extractImagePatches=Date.now()-o,o=Date.now(),s=i.map(function(y){var w=y0(y,n);return y.dispose(),w}),a.stage2_rnet=Date.now()-o,u=s.length>1?Me(s.map(function(y){return y.scores})):s[0].scores,h=(l=Array).from,[4,u.data()];case 2:return c=h.apply(l,[b.sent()]),u.dispose(),f=c.map(function(y,w){return{score:y,idx:w}}).filter(function(y){return y.score>e}).map(function(y){var w=y.idx;return w}),p=f.map(function(y){return t[y]}),d=f.map(function(y){return c[y]}),m=[],v=[],p.length>0&&(o=Date.now(),g=ur(p,d,.7),a.stage2_nms=Date.now()-o,x=g.map(function(y){var w=s[f[y]].regions.arraySync();return new gi(w[0][0],w[0][1],w[0][2],w[0][3])}),v=g.map(function(y){return d[y]}),m=g.map(function(y,w){return p[y].calibrate(x[w])})),s.forEach(function(y){y.regions.dispose(),y.scores.dispose()}),[2,{boxes:m,scores:v}]}})})}function b0(r,t){return X(function(){var e=yi(r,t);e=Ue(e,[2,2],[2,2],"same"),e=xt(e,t.conv4,"valid"),e=Vn(e,t.prelu4_alpha);var n=yt(e,[e.shape[0],t.fc1.weights.shape[0]]),a=Dt(n,t.fc1),o=Vn(a,t.prelu5_alpha),i=Dt(o,t.fc2_1),s=pt(da(i,1),1),u=jt(Le(i,s),1),c=Dt(o,t.fc2_2),l=Dt(o,t.fc2_3),h=Oe(u,1)[1];return{scores:h,regions:c,points:l}})}function w0(r,t,e,n,a){return te(this,void 0,void 0,function(){var o,i,s,u,c,l,h,f,p,d,m,v,g,x,b;return ne(this,function(y){switch(y.label){case 0:return o=Date.now(),[4,Yc(r,t,{width:48,height:48})];case 1:return i=y.sent(),a.stage3_extractImagePatches=Date.now()-o,o=Date.now(),s=i.map(function(w){var C=b0(w,n);return w.dispose(),C}),a.stage3_onet=Date.now()-o,u=s.length>1?Me(s.map(function(w){return w.scores})):s[0].scores,h=(l=Array).from,[4,u.data()];case 2:return c=h.apply(l,[y.sent()]),u.dispose(),f=c.map(function(w,C){return{score:w,idx:C}}).filter(function(w){return w.score>e}).map(function(w){var C=w.idx;return C}),p=f.map(function(w){var C=s[w].regions.arraySync();return new gi(C[0][0],C[0][1],C[0][2],C[0][3])}),d=f.map(function(w,C){return t[w].calibrate(p[C])}),m=f.map(function(w){return c[w]}),v=[],g=[],x=[],d.length>0&&(o=Date.now(),b=ur(d,m,.7,!1),a.stage3_nms=Date.now()-o,v=b.map(function(w){return d[w]}),g=b.map(function(w){return m[w]}),x=b.map(function(w,C){return Array(5).fill(0).map(function(S,I){var k=s[w].points.arraySync();return new be(k[0][I]*(v[C].width+1)+v[C].left,k[0][I+5]*(v[C].height+1)+v[C].top)})})),s.forEach(function(w){w.regions.dispose(),w.scores.dispose(),w.points.dispose()}),[2,{boxes:v,scores:g,points:x}]}})})}var C0=(function(r){ue(t,r);function t(){return r.call(this,"Mtcnn")||this}return t.prototype.load=function(e){return te(this,void 0,void 0,function(){return ne(this,function(n){return console.warn("mtcnn is deprecated and will be removed soon"),[2,r.prototype.load.call(this,e)]})})},t.prototype.loadFromDisk=function(e){return te(this,void 0,void 0,function(){return ne(this,function(n){return console.warn("mtcnn is deprecated and will be removed soon"),[2,r.prototype.loadFromDisk.call(this,e)]})})},t.prototype.forwardInput=function(e,n){return n===void 0&&(n={}),te(this,void 0,void 0,function(){var a,o,i,s,u,c,l,h,f,p,d,m,v,g,x,b,y,w,C,S,I;return ne(this,function(k){switch(k.label){case 0:if(a=this.params,!a)throw new Error("Mtcnn - load model before inference");if(o=e.canvases[0],!o)throw new Error("Mtcnn - inputCanvas is not defined, note that passing tensors into Mtcnn.forwardInput is not supported yet.");return i={},s=Date.now(),u=X(function(){return u0(pt(ti.fromPixels(o)).toFloat())}),c=function(R){return u.dispose(),i.total=Date.now()-s,R},l=u.shape.slice(1),h=l[0],f=l[1],p=new jc(n),d=p.minFaceSize,m=p.scaleFactor,v=p.maxNumScales,g=p.scoreThresholds,x=p.scaleSteps,b=(x||p0(d,m,[h,f])).filter(function(R){var N=ko(R,[h,f]);return Math.min(N.width,N.height)>oa}).slice(0,v),i.scales=b,i.pyramid=b.map(function(R){return ko(R,[h,f])}),y=Date.now(),[4,g0(u,b,g[0],a.pnet,i)];case 1:return w=k.sent(),i.total_stage1=Date.now()-y,w.boxes.length?(i.stage2_numInputBoxes=w.boxes.length,y=Date.now(),[4,x0(o,w.boxes,g[1],a.rnet,i)]):[2,c({results:[],stats:i})];case 2:return C=k.sent(),i.total_stage2=Date.now()-y,C.boxes.length?(i.stage3_numInputBoxes=C.boxes.length,y=Date.now(),[4,w0(o,C.boxes,g[2],a.onet,i)]):[2,c({results:[],stats:i})];case 3:return S=k.sent(),i.total_stage3=Date.now()-y,I=S.boxes.map(function(R,N){return fi(ai({},new Bt(S.scores[N],new ri(R.left/f,R.top/h,R.width/f,R.height/h),{height:h,width:f})),new Qm(S.points[N].map(function(A){return A.sub(new be(R.left,R.top)).div(new be(R.width,R.height))}),{width:R.width,height:R.height}))}),[2,c({results:I,stats:i})]}})})},t.prototype.forward=function(e,n){return n===void 0&&(n={}),te(this,void 0,void 0,function(){var a;return ne(this,function(o){switch(o.label){case 0:return a=this.forwardInput,[4,Ve(e)];case 1:return[4,a.apply(this,[o.sent(),n])];case 2:return[2,o.sent().results]}})})},t.prototype.forwardWithStats=function(e,n){return n===void 0&&(n={}),te(this,void 0,void 0,function(){var a;return ne(this,function(o){switch(o.label){case 0:return a=this.forwardInput,[4,Ve(e)];case 1:return[2,a.apply(this,[o.sent(),n])]}})})},t.prototype.getDefaultModelName=function(){return"mtcnn_model"},t.prototype.extractParamsFromWeigthMap=function(e){return f0(e)},t.prototype.extractParams=function(e){return l0(e)},t})(Kt),_0=.4,E0=[new be(1.603231,2.094468),new be(6.041143,7.080126),new be(2.882459,3.518061),new be(4.266906,5.178857),new be(9.041765,10.66308)],k0=[117.001,114.697,97.404],R0=(function(r){ue(t,r);function t(){var e=this,n={withSeparableConvs:!0,iouThreshold:_0,classes:["face"],anchors:E0,meanRgb:k0,isFirstLayerConv2d:!0,filterSizes:[3,16,32,64,128,256,512]};return e=r.call(this,n)||this,e}return Object.defineProperty(t.prototype,"anchors",{get:function(){return this.config.anchors},enumerable:!0,configurable:!0}),t.prototype.locateFaces=function(e,n){return te(this,void 0,void 0,function(){var a;return ne(this,function(o){switch(o.label){case 0:return[4,this.detect(e,n)];case 1:return a=o.sent(),[2,a.map(function(i){return new Bt(i.score,i.relativeBox,{width:i.imageWidth,height:i.imageHeight})})]}})})},t.prototype.getDefaultModelName=function(){return"tiny_face_detector_model"},t.prototype.extractParamsFromWeigthMap=function(e){return r.prototype.extractParamsFromWeigthMap.call(this,e)},t})(Kc),Je={ssdMobilenetv1:new qc,tinyFaceDetector:new R0,tinyYolov2:new s0,mtcnn:new C0,faceLandmark68Net:new Wc,faceLandmark68TinyNet:new Sg,faceRecognitionNet:new Mg,faceExpressionNet:new dg,ageGenderNet:new Eg},Jc=(function(r){ue(t,r);function t(e,n,a){var o=r.call(this)||this;return o.parentTask=e,o.input=n,o.extractedFaces=a,o}return t})(xr),xi=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n,a=this;return ne(this,function(o){switch(o.label){case 0:return[4,this.parentTask];case 1:return e=o.sent(),[4,wa(e,this.input,function(i){return te(a,void 0,void 0,function(){return ne(this,function(s){switch(s.label){case 0:return[4,Promise.all(i.map(function(u){return Je.faceExpressionNet.predictExpressions(u)}))];case 1:return[2,s.sent()]}})})},this.extractedFaces)];case 2:return n=o.sent(),[2,e.map(function(i,s){return Oc(i,n[s])})]}})})},t.prototype.withAgeAndGender=function(){return new _i(this,this.input)},t})(Jc),bi=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n;return ne(this,function(a){switch(a.label){case 0:return[4,this.parentTask];case 1:return e=a.sent(),e?[4,mi(e,this.input,function(o){return Je.faceExpressionNet.predictExpressions(o)},this.extractedFaces)]:[2];case 2:return n=a.sent(),[2,Oc(e,n)]}})})},t.prototype.withAgeAndGender=function(){return new Ei(this,this.input)},t})(Jc),wi=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.withAgeAndGender=function(){return new ki(this,this.input)},t.prototype.withFaceDescriptors=function(){return new Ii(this,this.input)},t})(xi),Ci=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.withAgeAndGender=function(){return new Ri(this,this.input)},t.prototype.withFaceDescriptor=function(){return new Si(this,this.input)},t})(bi),Qc=(function(r){ue(t,r);function t(e,n,a){var o=r.call(this)||this;return o.parentTask=e,o.input=n,o.extractedFaces=a,o}return t})(xr),_i=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n,a=this;return ne(this,function(o){switch(o.label){case 0:return[4,this.parentTask];case 1:return e=o.sent(),[4,wa(e,this.input,function(i){return te(a,void 0,void 0,function(){return ne(this,function(s){switch(s.label){case 0:return[4,Promise.all(i.map(function(u){return Je.ageGenderNet.predictAgeAndGender(u)}))];case 1:return[2,s.sent()]}})})},this.extractedFaces)];case 2:return n=o.sent(),[2,e.map(function(i,s){var u=n[s],c=u.age,l=u.gender,h=u.genderProbability;return Gc(Hc(i,l,h),c)})]}})})},t.prototype.withFaceExpressions=function(){return new xi(this,this.input)},t})(Qc),Ei=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n,a,o,i;return ne(this,function(s){switch(s.label){case 0:return[4,this.parentTask];case 1:return e=s.sent(),e?[4,mi(e,this.input,function(u){return Je.ageGenderNet.predictAgeAndGender(u)},this.extractedFaces)]:[2];case 2:return n=s.sent(),a=n.age,o=n.gender,i=n.genderProbability,[2,Gc(Hc(e,o,i),a)]}})})},t.prototype.withFaceExpressions=function(){return new bi(this,this.input)},t})(Qc),ki=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.withFaceExpressions=function(){return new wi(this,this.input)},t.prototype.withFaceDescriptors=function(){return new Ii(this,this.input)},t})(_i),Ri=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.withFaceExpressions=function(){return new Ci(this,this.input)},t.prototype.withFaceDescriptor=function(){return new Si(this,this.input)},t})(Ei),Zc=(function(r){ue(t,r);function t(e,n){var a=r.call(this)||this;return a.parentTask=e,a.input=n,a}return t})(xr),Ii=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n;return ne(this,function(a){switch(a.label){case 0:return[4,this.parentTask];case 1:return e=a.sent(),[4,wa(e,this.input,function(o){return Promise.all(o.map(function(i){return Je.faceRecognitionNet.computeFaceDescriptor(i)}))},null,function(o){return o.landmarks.align(null,{useDlibAlignment:!0})})];case 2:return n=a.sent(),[2,n.map(function(o,i){return Vc(e[i],o)})]}})})},t.prototype.withFaceExpressions=function(){return new wi(this,this.input)},t.prototype.withAgeAndGender=function(){return new ki(this,this.input)},t})(Zc),Si=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n;return ne(this,function(a){switch(a.label){case 0:return[4,this.parentTask];case 1:return e=a.sent(),e?[4,mi(e,this.input,function(o){return Je.faceRecognitionNet.computeFaceDescriptor(o)},null,function(o){return o.landmarks.align(null,{useDlibAlignment:!0})})]:[2];case 2:return n=a.sent(),[2,Vc(e,n)]}})})},t.prototype.withFaceExpressions=function(){return new Ci(this,this.input)},t.prototype.withAgeAndGender=function(){return new Ri(this,this.input)},t})(Zc),el=(function(r){ue(t,r);function t(e,n,a){var o=r.call(this)||this;return o.parentTask=e,o.input=n,o.useTinyLandmarkNet=a,o}return Object.defineProperty(t.prototype,"landmarkNet",{get:function(){return this.useTinyLandmarkNet?Je.faceLandmark68TinyNet:Je.faceLandmark68Net},enumerable:!0,configurable:!0}),t})(xr),I0=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n,a,o,i,s=this;return ne(this,function(u){switch(u.label){case 0:return[4,this.parentTask];case 1:return e=u.sent(),n=e.map(function(c){return c.detection}),this.input instanceof Se?[4,ui(this.input,n)]:[3,3];case 2:return o=u.sent(),[3,5];case 3:return[4,si(this.input,n)];case 4:o=u.sent(),u.label=5;case 5:return a=o,[4,Promise.all(a.map(function(c){return s.landmarkNet.detectLandmarks(c)}))];case 6:return i=u.sent(),a.forEach(function(c){return c instanceof Se&&c.dispose()}),[2,e.map(function(c,l){return fi(c,i[l])})]}})})},t.prototype.withFaceExpressions=function(){return new wi(this,this.input)},t.prototype.withAgeAndGender=function(){return new ki(this,this.input)},t.prototype.withFaceDescriptors=function(){return new Ii(this,this.input)},t})(el),S0=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n,a,o,i;return ne(this,function(s){switch(s.label){case 0:return[4,this.parentTask];case 1:return e=s.sent(),e?(n=e.detection,this.input instanceof Se?[4,ui(this.input,[n])]:[3,3]):[2];case 2:return o=s.sent(),[3,5];case 3:return[4,si(this.input,[n])];case 4:o=s.sent(),s.label=5;case 5:return a=o,[4,this.landmarkNet.detectLandmarks(a[0])];case 6:return i=s.sent(),a.forEach(function(u){return u instanceof Se&&u.dispose()}),[2,fi(e,i)]}})})},t.prototype.withFaceExpressions=function(){return new Ci(this,this.input)},t.prototype.withAgeAndGender=function(){return new Ri(this,this.input)},t.prototype.withFaceDescriptor=function(){return new Si(this,this.input)},t})(el),tl=(function(r){ue(t,r);function t(e,n){n===void 0&&(n=new yr);var a=r.call(this)||this;return a.input=e,a.options=n,a}return t})(xr),nl=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n,a,o;return ne(this,function(i){switch(i.label){case 0:return e=this,n=e.input,a=e.options,a instanceof jc?[4,Je.mtcnn.forward(n,a)]:[3,2];case 1:return[2,i.sent().map(function(s){return s.detection})];case 2:if(o=a instanceof Xc?function(s){return Je.tinyFaceDetector.locateFaces(s,a)}:a instanceof yr?function(s){return Je.ssdMobilenetv1.locateFaces(s,a)}:a instanceof vi?function(s){return Je.tinyYolov2.locateFaces(s,a)}:null,!o)throw new Error("detectFaces - expected options to be instance of TinyFaceDetectorOptions | SsdMobilenetv1Options | MtcnnOptions | TinyYolov2Options");return[2,o(n)]}})})},t.prototype.runAndExtendWithFaceDetections=function(){var e=this;return new Promise(function(n){return te(e,void 0,void 0,function(){var a;return ne(this,function(o){switch(o.label){case 0:return[4,this.run()];case 1:return a=o.sent(),[2,n(a.map(function(i){return ai({},i)}))]}})})})},t.prototype.withFaceLandmarks=function(e){return e===void 0&&(e=!1),new I0(this.runAndExtendWithFaceDetections(),this.input,e)},t.prototype.withFaceExpressions=function(){return new xi(this.runAndExtendWithFaceDetections(),this.input)},t.prototype.withAgeAndGender=function(){return new _i(this.runAndExtendWithFaceDetections(),this.input)},t})(tl),D0=(function(r){ue(t,r);function t(){return r!==null&&r.apply(this,arguments)||this}return t.prototype.run=function(){return te(this,void 0,void 0,function(){var e,n;return ne(this,function(a){switch(a.label){case 0:return[4,new nl(this.input,this.options)];case 1:return e=a.sent(),n=e[0],e.forEach(function(o){o.score>n.score&&(n=o)}),[2,n]}})})},t.prototype.runAndExtendWithFaceDetection=function(){var e=this;return new Promise(function(n){return te(e,void 0,void 0,function(){var a;return ne(this,function(o){switch(o.label){case 0:return[4,this.run()];case 1:return a=o.sent(),[2,n(a?ai({},a):void 0)]}})})})},t.prototype.withFaceLandmarks=function(e){return e===void 0&&(e=!1),new S0(this.runAndExtendWithFaceDetection(),this.input,e)},t.prototype.withFaceExpressions=function(){return new bi(this.runAndExtendWithFaceDetection(),this.input)},t.prototype.withAgeAndGender=function(){return new Ei(this.runAndExtendWithFaceDetection(),this.input)},t})(tl);function A0(r,t){return t===void 0&&(t=new yr),new D0(r,t)}function T0(r,t){return t===void 0&&(t=new yr),new nl(r,t)}function ia(r,t){if(r.length!==t.length)throw new Error("euclideanDistance: arr1.length !== arr2.length");var e=Array.from(r),n=Array.from(t);return Math.sqrt(e.map(function(a,o){return a-n[o]}).reduce(function(a,o){return a+Math.pow(o,2)},0))}(function(){function r(t,e){e===void 0&&(e=.6),this._distanceThreshold=e;var n=Array.isArray(t)?t:[t];if(!n.length)throw new Error("FaceRecognizer.constructor - expected atleast one input");var a=1,o=function(){return"person "+a++};this._labeledDescriptors=n.map(function(i){if(i instanceof Ar)return i;if(i instanceof Float32Array)return new Ar(o(),[i]);if(i.descriptor&&i.descriptor instanceof Float32Array)return new Ar(o(),[i.descriptor]);throw new Error("FaceRecognizer.constructor - expected inputs to be of type LabeledFaceDescriptors | WithFaceDescriptor<any> | Float32Array | Array<LabeledFaceDescriptors | WithFaceDescriptor<any> | Float32Array>")})}return Object.defineProperty(r.prototype,"labeledDescriptors",{get:function(){return this._labeledDescriptors},enumerable:!0,configurable:!0}),Object.defineProperty(r.prototype,"distanceThreshold",{get:function(){return this._distanceThreshold},enumerable:!0,configurable:!0}),r.prototype.computeMeanDistance=function(t,e){return e.map(function(n){return ia(n,t)}).reduce(function(n,a){return n+a},0)/(e.length||1)},r.prototype.matchDescriptor=function(t){var e=this;return this.labeledDescriptors.map(function(n){var a=n.descriptors,o=n.label;return new Es(o,e.computeMeanDistance(t,a))}).reduce(function(n,a){return n.distance<a.distance?n:a})},r.prototype.findBestMatch=function(t){var e=this.matchDescriptor(t);return e.distance<this.distanceThreshold?e:new Es("unknown",e.distance)},r.prototype.toJSON=function(){return{distanceThreshold:this.distanceThreshold,labeledDescriptors:this.labeledDescriptors.map(function(t){return t.toJSON()})}},r.fromJSON=function(t){var e=t.labeledDescriptors.map(function(n){return Ar.fromJSON(n)});return new r(e,t.distanceThreshold)},r})();let eo=null;function N0(){return eo??=Promise.all([Je.tinyFaceDetector.loadFromUri(br),Je.faceLandmark68Net.loadFromUri(br),Je.faceRecognitionNet.loadFromUri(br),Je.faceExpressionNet.loadFromUri(br)]).catch(r=>{throw eo=null,r}),eo}const As=()=>new Xc({inputSize:416,scoreThreshold:.5}),Ts=60,Mr=3,F0=5,Ns=.5,it={minScore:.75,edgeMargin:.04,minHeight:.32,maxHeight:.85,maxCenterOffsetX:.15,maxCenterOffsetY:.18,maxRollDeg:12,minBrightness:65,maxBrightness:215,eyesOpenEar:.2,frontalYaw:.1,stableMove:.03},Fs=r=>({x:r.reduce((t,e)=>t+e.x,0)/r.length,y:r.reduce((t,e)=>t+e.y,0)/r.length}),Ps=r=>{const t=Math.hypot(r[1].x-r[5].x,r[1].y-r[5].y),e=Math.hypot(r[2].x-r[4].x,r[2].y-r[4].y),n=Math.hypot(r[0].x-r[3].x,r[0].y-r[3].y);return n>0?(t+e)/(2*n):0};function P0(r){const t=r.positions,e=Fs(t.slice(36,42)),n=Fs(t.slice(42,48)),a={x:(e.x+n.x)/2},o=Math.hypot(n.x-e.x,n.y-e.y)||1;return{yaw:(t[30].x-a.x)/o,rollDeg:Math.atan2(n.y-e.y,n.x-e.x)*180/Math.PI,ear:Math.min(Ps(t.slice(36,42)),Ps(t.slice(42,48)))}}function M0(r,t,e){try{e.width=24,e.height=24;const a=e.getContext("2d",{willReadFrequently:!0});a.drawImage(r,t.x,t.y,t.width,t.height,0,0,24,24);const{data:o}=a.getImageData(0,0,24,24);let i=0;for(let s=0;s<o.length;s+=4)i+=.299*o[s]+.587*o[s+1]+.114*o[s+2];return i/(o.length/4)}catch{return 128}}function O0(r){const t=r.videoWidth,e=r.videoHeight,n=r.clientWidth||t,a=r.clientHeight||e,o=Math.max(n/t,a/e),i=Math.min(t,n/o),s=Math.min(e,a/o);return{x:(t-i)/2,y:(e-s)/2,width:i,height:s}}function B0(r,t,e){const{x:n=0,y:a=0,width:o,height:i}=t,s=r.detection.box,u=P0(r.landmarks),c=v=>({ok:!1,hint:v,pose:u});if(r.detection.score<it.minScore)return c("Wajah kurang jelas. Hadapkan wajah ke kamera dan pastikan tidak tertutup.");const l=o*it.edgeMargin,h=i*it.edgeMargin,f=(v,g)=>v<n+l||g<a+h||v>n+o-l||g>a+i-h;if(f(s.x,s.y)||f(s.x+s.width,s.y+s.height)||r.landmarks.positions.some(v=>f(v.x,v.y)))return c("Wajah terpotong. Mundur sedikit hingga seluruh wajah masuk ke dalam bingkai.");const p=s.height/i;if(p<it.minHeight)return c("Wajah terlalu jauh. Dekatkan wajah ke kamera.");if(p>it.maxHeight)return c("Wajah terlalu dekat. Mundur sedikit.");const d=(s.x-n+s.width/2)/o-.5,m=(s.y-a+s.height/2)/i-.5;return Math.abs(d)>it.maxCenterOffsetX||Math.abs(m)>it.maxCenterOffsetY?c("Posisikan wajah tepat di tengah bingkai."):Math.abs(u.rollDeg)>it.maxRollDeg?c("Luruskan kepala, jangan dimiringkan."):Math.abs(u.yaw)>it.frontalYaw?c("Hadapkan wajah lurus ke kamera."):e<it.minBrightness?c("Pencahayaan terlalu gelap. Cari tempat yang lebih terang."):e>it.maxBrightness?c("Wajah terlalu silau. Hindari cahaya langsung dari belakang/depan."):u.ear<it.eyesOpenEar?c("Buka mata dan lihat ke kamera."):{ok:!0,hint:null,pose:u}}function L0(r,t,e){if(!r)return!1;const n=r.x+r.width/2-(t.x+t.width/2),a=r.y+r.height/2-(t.y+t.height/2);return Math.hypot(n,a)/e<=it.stableMove&&Math.abs(r.height-t.height)/t.height<=.08}const Ms=.3,W0=.7,U0=3,z0=2,V0=.6,to={minAnisotropy:.05,maxResidual:.02,votesNeeded:3},G0=r=>r.positions.map(t=>[t.x,t.y]),H0=r=>{const t=(i,s)=>{const u=r.slice(i,s);return[u.reduce((c,l)=>c+l[0],0)/u.length,u.reduce((c,l)=>c+l[1],0)/u.length]},[e,n]=t(36,42),[a,o]=t(42,48);return Math.hypot(a-e,o-n)||1},Os=(r,t)=>{const e=a=>a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]),n=e(r);return Math.abs(n)<1e-9?null:[0,1,2].map(a=>e(r.map((o,i)=>o.map((s,u)=>u===a?t[i]:s)))/n)};function j0(r,t){const e=[[0,0,0],[0,0,0],[0,0,0]],n=[0,0,0],a=[0,0,0];r.forEach(([s,u],c)=>{const l=[s,u,1];for(let h=0;h<3;h++){for(let f=0;f<3;f++)e[h][f]+=l[h]*l[f];n[h]+=l[h]*t[c][0],a[h]+=l[h]*t[c][1]}});const o=Os(e,n),i=Os(e,a);return o&&i?{a:o[0],b:o[1],c:o[2],d:i[0],e:i[1],f:i[2]}:null}function q0({a:r,b:t,d:e,e:n}){const a=r*r+t*t+e*e+n*n,o=Math.sqrt(Math.max(0,(r*r+t*t-e*e-n*n)**2+4*(r*e+t*n)**2)),i=Math.sqrt((a+o)/2),s=Math.sqrt(Math.max(1e-12,(a-o)/2));return i/s-1}function K0(){let r=null,t=0,e=0;return{add(n){const a=G0(n);if(!r){r={pts:a,iod:H0(a)};return}const o=j0(a,r.pts);if(!o||q0(o)<to.minAnisotropy)return;Math.sqrt(a.reduce((s,[u,c],l)=>{const[h,f]=r.pts[l];return s+(o.a*u+o.b*c+o.c-h)**2+(o.d*u+o.e*c+o.f-f)**2},0)/a.length)/r.iod<to.maxResidual?t+=1:e+=1},isFlat(){return t>=to.votesNeeded&&t>e*3},reset(){r=null,t=0,e=0}}}function Bs(){const r=K0();let t="neutral",e=0;const n={id:"smile",label:"Senyum",badge:"Senyum 🙂",icon:"🙂",description:"Lihat ke kamera dengan wajah biasa, lalu tersenyum saat diminta.",instruction:"Lihat ke kamera dengan wajah biasa (tidak tersenyum)...",failure:null,referenceDescriptor:null,validate(a){if(n.failure||!a?.landmarks||!a?.expressions)return!1;if(r.add(a.landmarks),r.isFlat())return n.failure="Terdeteksi foto atau layar, bukan wajah asli. Gunakan wajah Anda langsung di depan kamera.",n.instruction=n.failure,!1;const o=a.expressions.happy??0;return t==="neutral"?(e=o<Ms?e+1:0,a.descriptor&&o<Ms&&(n.referenceDescriptor=a.descriptor),e>=U0?(t="smile",e=0,n.instruction="Sekarang tersenyum 🙂"):n.instruction="Lihat ke kamera dengan wajah biasa (tidak tersenyum)...",!1):(e=o>W0?e+1:0,n.instruction=e>0?"Tahan senyum...":"Sekarang tersenyum 🙂",e<z0?!1:a.descriptor&&n.referenceDescriptor&&ia(a.descriptor,n.referenceDescriptor)>V0?(t="neutral",e=0,n.referenceDescriptor=null,r.reset(),n.instruction="Wajah berubah. Ulangi: lihat ke kamera dengan wajah biasa...",!1):!0)}};return n}const Ls=30,X0=20,$0=r=>{switch(r?.name){case"NotAllowedError":return"Izin kamera ditolak. Izinkan akses kamera di pengaturan browser lalu coba lagi.";case"NotFoundError":return"Kamera tidak ditemukan pada perangkat ini.";case"NotReadableError":return"Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.";default:return window.isSecureContext?"Kamera tidak dapat diakses.":"Kamera hanya bisa dipakai melalui HTTPS."}};function Q0({onComplete:r,className:t="",subjectLabel:e="Anda"}){const n=we.useRef(null),a=we.useRef(null),o=we.useRef(typeof document<"u"?document.createElement("canvas"):null),i=we.useRef(null),s=we.useRef(!1),u=we.useRef(null),c=we.useRef([]),l=we.useRef(0),h=we.useRef(null),f=we.useRef(null),p=we.useRef("samples"),d=we.useRef(Bs()),[m,v]=we.useState("loading"),[g,x]=we.useState("samples"),[b,y]=we.useState(null),[w,C]=we.useState(0),[S,I]=we.useState("Menyiapkan kamera..."),[k,R]=we.useState(!1),[N,A]=we.useState(Ts),[L,M]=we.useState(0),[O,V]=we.useState(!1),U=we.useCallback(()=>{s.current=!1,clearTimeout(u.current),i.current?.getTracks().forEach(K=>K.stop()),i.current=null},[]),W=we.useCallback(()=>{c.current=[],l.current=0,h.current=null,f.current=null,p.current="samples",d.current=Bs(),x("samples"),C(0)},[]),z=we.useCallback(K=>{U(),y(K),v("error")},[U]),H=K=>{const Z=document.createElement("canvas");return Z.width=K.videoWidth,Z.height=K.videoHeight,Z.getContext("2d").drawImage(K,0,0,Z.width,Z.height),Z.toDataURL("image/jpeg",.9)},j=(K,Z,oe)=>{const ae=a.current;if(!ae)return;(ae.width!==Z.width||ae.height!==Z.height)&&(ae.width=Z.width,ae.height=Z.height);const ie=ae.getContext("2d");ie.clearRect(0,0,ae.width,ae.height),ie.fillStyle=oe?"rgba(52, 211, 153, 0.95)":"rgba(251, 191, 36, 0.9)",K.forEach(ve=>{ve.landmarks.positions.forEach(ge=>{ie.beginPath(),ie.arc(ge.x,ge.y,Math.max(1.5,Z.width/320),0,Math.PI*2),ie.fill()})})},J=we.useRef(r);J.current=r;const re=we.useCallback(async()=>{U(),v("uploading"),I("Memproses data wajah...");try{await J.current({descriptors:c.current,photo:f.current})}catch(K){y(K?.response?.data?.message||K?.message||"Gagal menyimpan data wajah."),v("error")}},[U]),le=we.useCallback(async K=>{const Z={width:K.videoWidth,height:K.videoHeight},oe=await A0(K,As()).withFaceLandmarks().withFaceExpressions().withFaceDescriptor();if(!oe){j([],Z,!1),R(!1),I("Posisikan seluruh wajah di dalam bingkai.");return}const ae=d.current,ie=ae.validate(oe);if(j([oe],Z,!ae.failure),R(!ae.failure),I(ae.instruction),ae.failure){z(ae.failure);return}if(!ie)return;const ve=c.current[0];if(ve&&ia(ve,oe.descriptor)>Ns+.1){z("Wajah saat verifikasi berbeda dengan wajah yang direkam. Ulangi pendaftaran.");return}await re()},[z,re]),he=we.useCallback(async K=>{if(p.current==="liveness")return le(K);const Z={width:K.videoWidth,height:K.videoHeight},oe=await T0(K,As()).withFaceLandmarks().withFaceDescriptors(),ae=at=>{l.current=0,h.current=null,R(!1),at&&I(at)};if(oe.length===0)return j([],Z,!1),ae("Posisikan seluruh wajah di dalam bingkai.");if(oe.length>1)return j(oe,Z,!1),ae("Terdeteksi lebih dari satu wajah. Pastikan hanya Anda yang ada di depan kamera.");const ie=oe[0],ve=ie.detection.box,ge=M0(K,ve,o.current),Re=B0(ie,O0(K),ge);if(!Re.ok)return j(oe,Z,!1),ae(Re.hint);if(j(oe,Z,!0),R(!0),l.current=L0(h.current,ve,Z.width)?l.current+1:1,h.current=ve,l.current<F0){I("Tahan posisi, jangan bergerak...");return}const _e=Array.from(ie.descriptor),Ee=c.current[0];if(Ee&&ia(Ee,_e)>Ns)return W(),ae("Wajah berbeda terdeteksi. Pendaftaran diulang dari awal.");if(c.current.push(_e),C(c.current.length),f.current||(f.current=H(K)),l.current=0,h.current=null,c.current.length>=Mr){p.current="liveness",x("liveness"),I(d.current.instruction);return}I("Bagus. Tahan sebentar lagi...")},[le,W]);we.useEffect(()=>{if(!O)return;let K=!1;return(async()=>{v("loading"),y(null),W(),A(Ts),I("Memuat model AI wajah...");try{await N0()}catch{K||z("Gagal memuat model AI wajah. Periksa koneksi internet lalu coba lagi.");return}try{const ae=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}}});if(K){ae.getTracks().forEach(ie=>ie.stop());return}i.current=ae,n.current.srcObject=ae,await n.current.play().catch(()=>{})}catch(ae){K||z($0(ae));return}v("camera"),I("Lihat lurus ke kamera dengan wajah tepat di dalam bingkai."),s.current=!0;const oe=async()=>{if(!s.current)return;const ae=n.current;if(ae&&ae.readyState>=2&&ae.videoWidth)try{await he(ae)}catch{}s.current&&(u.current=setTimeout(oe,120))};oe()})(),()=>{K=!0,U()}},[L,O]),we.useEffect(()=>{if(m!=="camera")return;if(N<=0){z(`Waktu habis sebelum wajah terekam lengkap (${w} dari ${Mr} sampel). Cari tempat yang lebih terang, lepas masker atau kacamata gelap, pegang HP setinggi wajah, lalu coba lagi.`);return}const K=setTimeout(()=>A(Z=>Z-1),1e3);return()=>clearTimeout(K)},[m,N,z]);const pe=g==="liveness"?90:Math.round(w/Mr*80);return ye.jsxs("div",{className:`relative bg-black w-full aspect-[3/4] overflow-hidden ${t}`,children:[!O&&ye.jsxs("div",{className:"absolute inset-0 z-40 flex flex-col justify-center overflow-y-auto bg-surface px-5 py-6 text-ink",children:[ye.jsx(ul,{className:"mx-auto h-10 w-10 text-accent",strokeWidth:1.75,"aria-hidden":"true"}),ye.jsx("h3",{className:"mt-3 text-center text-lg font-semibold",children:"Persetujuan data wajah"}),ye.jsxs("ul",{className:"mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-2",children:[ye.jsxs("li",{children:["Foto dan data titik wajah ",e," disimpan ",ye.jsx("strong",{className:"font-semibold text-ink",children:"hanya untuk presensi"})," di SMA Negeri 1 Babat."]}),ye.jsxs("li",{children:["Data disimpan di server sekolah secara privat dan hanya bisa dilihat admin presensi",e==="Anda"?" dan Anda sendiri":"","."]}),ye.jsxs("li",{children:["Data wajah dihapus saat data peserta dihapus atau bila ",e==="Anda"?"Anda":"peserta"," meminta penghapusan kepada admin."]})]}),ye.jsx("p",{className:"mt-3 text-sm text-ink-2",children:"Pendaftaran butuh sekitar 1 menit. Waktunya bisa ditambah bila perlu."}),ye.jsx(il,{variant:"primary",size:"lg",onClick:()=>V(!0),className:"mt-5 w-full",children:"Setuju dan mulai"})]}),ye.jsx("video",{ref:n,autoPlay:!0,muted:!0,playsInline:!0,className:`absolute inset-0 w-full h-full object-cover -scale-x-100 ${m==="camera"?"":"opacity-30"}`}),ye.jsx("canvas",{ref:a,className:"absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"}),m==="camera"&&ye.jsx("div",{className:"absolute inset-0 pointer-events-none flex items-center justify-center",children:ye.jsx("div",{className:`w-[62%] h-[72%] rounded-[50%] border-[3px] transition-colors duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] ${k?"border-emerald-400":"border-white/70 border-dashed"}`})}),m==="camera"&&ye.jsx("div",{className:"absolute top-3 inset-x-3 z-20",children:ye.jsxs("div",{className:"rounded-2xl bg-slate-900/75 backdrop-blur-md border border-white/10 px-3.5 py-2.5 text-white",children:[ye.jsxs("div",{className:"flex items-center justify-between gap-2",children:[ye.jsx("p",{className:"text-xs font-medium text-white/80",children:g==="samples"?"Langkah 1 dari 2 · Wajah menghadap depan":"Langkah 2 dari 2 · Verifikasi wajah hidup"}),ye.jsxs("span",{className:"text-xs font-medium tabular-nums text-white/80",children:["Sisa ",N," detik"]})]}),ye.jsx("p",{className:"mt-0.5 text-base font-semibold leading-snug",children:g==="samples"?"Lihat lurus ke kamera dan tahan posisi":"Wajah biasa dulu, lalu tersenyum saat diminta"})]})}),m==="camera"&&ye.jsxs("div",{className:"absolute bottom-3 inset-x-3 z-20",children:[N<=X0&&ye.jsxs("button",{type:"button",onClick:()=>A(K=>K+Ls),className:"mx-auto mb-2 flex h-10 items-center rounded-full bg-white/90 px-4 text-sm font-semibold text-slate-900 hover:bg-white",children:["Tambah ",Ls," detik"]}),ye.jsx("div",{className:`rounded-xl px-3 py-2 text-center text-sm font-semibold backdrop-blur-md border ${k?"bg-emerald-500/25 border-emerald-300/40 text-emerald-50":"bg-amber-500/25 border-amber-300/40 text-amber-50"}`,children:S}),ye.jsx("div",{className:"mt-2 h-1.5 overflow-hidden rounded-full bg-white/20",role:"progressbar","aria-label":"Progres pendaftaran wajah","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":pe,children:ye.jsx("div",{className:"h-full bg-emerald-400 transition-[width] duration-300 motion-reduce:transition-none",style:{width:`${pe}%`}})}),ye.jsx("p",{className:"mt-1 text-center text-xs font-medium text-white/80","aria-live":"polite",children:g==="samples"?`${w} dari ${Mr} sampel wajah terekam`:"Sampel wajah terekam · memverifikasi wajah hidup"})]}),(m==="loading"||m==="uploading")&&ye.jsxs("div",{className:"absolute inset-0 z-30 flex flex-col items-center justify-center text-white",children:[ye.jsx("div",{className:"mb-3 h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent motion-reduce:animate-none","aria-hidden":"true"}),ye.jsx("p",{className:"text-sm font-medium",role:"status",children:S})]}),m==="error"&&ye.jsxs("div",{className:"absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 px-6 text-center",role:"alert",children:[ye.jsx(sl,{className:"mb-3 h-10 w-10 text-amber-300",strokeWidth:1.75,"aria-hidden":"true"}),ye.jsx("p",{className:"mb-5 text-base font-medium leading-snug text-white",children:b}),ye.jsx("button",{type:"button",onClick:()=>M(K=>K+1),className:"h-12 w-full rounded-xl bg-white px-6 text-base font-semibold text-slate-900 hover:bg-white/90",children:"Coba lagi"})]})]})}export{Q0 as default};
