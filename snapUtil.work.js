const pixelTolerance = 10;

const scd = (e, t) => {
var n = e[0] - t[0];
var r = e[1] - t[1];
return n * n + r * r;
};
function itsc(e, t) {
return t.minX <= e.maxX && t.minY <= e.maxY && t.maxX >= e.minX && t.maxY >= e.minY;
}
const sbdst = (e, t) => {
const n = sd2s(pxc_, e.segment);
const r = sd2s(pxc_, t.segment);
return n - r;
};
function sd2s(e, t) {
return scd(e, cos(e, t));
}
function cod(e, t) {
return Math.sqrt(scd(e, t));
}
function cos(e, t) {
var n = e[0];
var r = e[1];
var o = t[0];
var a = t[1];
var i = o[0];
var s = o[1];
var l = a[0];
var c = a[1];
var m = l - i;
var u = c - s;
var d = m === 0 && u === 0 ? 0 : (m * (n - i) + u * (r - s)) / (m * m + u * u || 0);
var x, v;
if (d <= 0) {
x = i;
v = s;
} else if (d >= 1) {
x = l;
v = c;
} else {
x = i + d * m;
v = s + d * u;
}
return [ x, v ];
}
let ns = [];
let pxc_ = [];
const snt = (e, t, n, r, o) => {
ns = [];
pxc_ = t || [];
imlsg(n);
var a = r.getCoordinateFromPixel([ e[0] - pixelTolerance, e[1] + pixelTolerance ]);
var i = r.getCoordinateFromPixel([ e[0] + pixelTolerance, e[1] - pixelTolerance ]);
var s = ol.extent.boundingExtent([ a, i ]);
const l = o ? o.getSource() : undefined;
let c = sntGetInExtent(s, l);
if (!c.length) return null;
c.sort(sbdst);
const m = c[0].segment;
let u = false;
let d = cos(t, m);
let x = r.getPixelFromCoordinate(d);
if (cod(e, x) <= pixelTolerance) {
u = true;
var v = r.getPixelFromCoordinate(m[0]);
var g = r.getPixelFromCoordinate(m[1]);
var f = scd(x, v);
var C = scd(x, g);
var S = Math.sqrt(Math.min(f, C));
if (S <= pixelTolerance) {
d = f > C ? m[1] : m[0];
x = r.getPixelFromCoordinate(d);
}
}
let p = new ol.Feature(new ol.geom.Point(d));
p.setStyle(new ol.style.Style({
image: new ol.style.Circle({
fill: new ol.style.Fill({
color: "#57f8"
}),
radius: 7
})
}));
if (l) {
l.addFeature(p);
}
return d;
};
const sntGetInExtent = (e, t) => {
var n = {
minX: e[0],
minY: e[1],
maxX: e[2],
maxY: e[3]
};
var r = sntSearch(n, t);
return r.map(function(e) {
return e.value;
});
};

const sntSearch = (e, n) => {
let r = [];
for (const o of ns) {
let t = o.value.segment;
if (itsc(e, {
minX: t[0][0] < t[1][0] ? t[0][0] : t[1][0],
minY: t[0][1] < t[1][1] ? t[0][1] : t[1][1],
maxX: t[0][0] > t[1][0] ? t[0][0] : t[1][0],
maxY: t[0][1] > t[1][1] ? t[0][1] : t[1][1]
})) {
r.push(o);
if (n) {
let e = new ol.Feature(new ol.geom.LineString(t));
e.setStyle(new ol.style.Style({
stroke: new ol.style.Stroke({
width: 5,
color: "#70f8"
})
}));
n.addFeature(e);
}
}
}
return r;
};
const imlsg = o => {
var a = o.getGeometry().getCoordinates();
for (var i = 0, e = a.length - 1; i < e; ++i) {
var s = a.slice(i, i + 2);
var l = {
feature: o,
segment: s
};
let [ e, t, n, r ] = ol.extent.boundingExtent(s);
ns.push({
minX: e,
minY: t,
maxX: n,
maxY: r,
value: l
});
}
};