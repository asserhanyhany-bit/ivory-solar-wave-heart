import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DXpLOQFc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-night px-6 text-center text-warm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-lg font-semibold",
				children: "The line dropped"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-uTKDFgE4.css";
var APP_NAME = "NIGHTLINE";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#07070B"
			},
			{
				name: "description",
				content: "Talk to a stranger. Stay a stranger. Anonymous 1:1 text chat."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne:wght@700;800&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-night text-warm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$2 = () => import("./routes-CZK72cOn.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./chat-CzoTwS2Q.mjs");
var Route$2 = createFileRoute("/chat")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./rules-rhoubMP2.mjs");
var Route$1 = createFileRoute("/rules")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var INTEREST_CHIPS = [
	"music",
	"late night",
	"travel",
	"movies",
	"tech",
	"random"
];
var REPORT_REASONS = [
	{
		id: "spam",
		label: "Spam"
	},
	{
		id: "sexual",
		label: "Sexual"
	},
	{
		id: "hate",
		label: "Hate"
	},
	{
		id: "scam",
		label: "Scam"
	},
	{
		id: "other",
		label: "Other"
	}
];
var RATE_WINDOW_MS = 5e3;
var MUTE_MS = 3e3;
var TYPING_DEBOUNCE_MS = 1200;
var POLL_WAIT_MS = 9e3;
function newId() {
	return crypto.randomUUID().replaceAll("-", "").slice(0, 16);
}
function normalizeInterests(chips) {
	return [...new Set(chips.map((c) => c.trim().toLowerCase()).filter((c) => c && c !== "random"))].slice(0, 8);
}
function sharesInterest(a, b) {
	if (a.length === 0 || b.length === 0) return false;
	const other = new Set(b);
	return a.some((x) => other.has(x));
}
var g = globalThis;
function store() {
	g.__nightlineStore ??= {
		sessions: /* @__PURE__ */ new Map(),
		waiting: /* @__PURE__ */ new Map(),
		rooms: /* @__PURE__ */ new Map()
	};
	return g.__nightlineStore;
}
function now() {
	return Date.now();
}
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
function drain(s) {
	const events = s.inbox;
	s.inbox = [];
	return events;
}
function emit(s, event) {
	s.inbox.push(event);
	if (s.inbox.length > 80) s.inbox.splice(0, s.inbox.length - 80);
	if (s.waiter) {
		const wake = s.waiter;
		s.waiter = null;
		wake(drain(s));
	}
}
function partnerOf(room, id) {
	return room.a === id ? room.b : room.a;
}
function getSession(id) {
	const s = store().sessions.get(id);
	if (s) s.lastSeen = now();
	return s;
}
function gc(t) {
	const s = store();
	for (const sess of s.sessions.values()) {
		if (t - sess.lastSeen <= 22e3) continue;
		if (sess.status === "matched" && sess.roomId) endRoom(sess.roomId, sess.id, "partner_left");
		s.waiting.delete(sess.id);
		if (sess.waiter) {
			sess.waiter([]);
			sess.waiter = null;
		}
		s.sessions.delete(sess.id);
	}
}
function canPair(a, b, t) {
	if (a.id === b.id) return false;
	if (a.blocked.has(b.id) || b.blocked.has(a.id)) return false;
	if (!(t - a.joinedWaitAt >= 4e3 || t - b.joinedWaitAt >= 4e3) && (a.lastPartnerId === b.id || b.lastPartnerId === a.id)) return false;
	return true;
}
function pair(a, b) {
	const s = store();
	const roomId = `${a.id.slice(0, 6)}${b.id.slice(0, 6)}${tweak()}`;
	s.rooms.set(roomId, {
		id: roomId,
		a: a.id,
		b: b.id
	});
	for (const sess of [a, b]) {
		sess.status = "matched";
		sess.roomId = roomId;
		s.waiting.delete(sess.id);
	}
	a.lastPartnerId = b.id;
	b.lastPartnerId = a.id;
	emit(a, {
		t: "matched",
		roomId,
		partnerId: b.id,
		interests: b.interests
	});
	emit(b, {
		t: "matched",
		roomId,
		partnerId: a.id,
		interests: a.interests
	});
}
function tweak() {
	return Math.floor(Math.random() * 36 ** 3).toString(36).padStart(3, "0");
}
function tryMatch(me) {
	const t = now();
	const eligible = [...store().waiting.values()].filter((w) => w.id !== me.id && w.status === "searching").sort((x, y) => x.joinedWaitAt - y.joinedWaitAt).filter((w) => canPair(me, w, t));
	if (eligible.length === 0) return;
	const overlap = eligible.find((w) => sharesInterest(me.interests, w.interests));
	if (overlap) {
		pair(me, overlap);
		return;
	}
	const oldest = eligible[0];
	if (t - me.joinedWaitAt >= 3e3 || t - oldest.joinedWaitAt >= 3e3) pair(me, oldest);
}
function endRoom(roomId, fromId, reasonForOther, selfReason) {
	const s = store();
	const room = s.rooms.get(roomId);
	if (!room) return;
	s.rooms.delete(roomId);
	const otherId = partnerOf(room, fromId);
	const self = s.sessions.get(fromId);
	const other = s.sessions.get(otherId);
	if (self && self.roomId === roomId) {
		self.roomId = null;
		self.status = "idle";
		emit(self, {
			t: "ended",
			reason: selfReason ?? "left",
			partnerId: otherId
		});
	}
	if (other && other.roomId === roomId) {
		other.roomId = null;
		other.status = "idle";
		emit(other, {
			t: "ended",
			reason: reasonForOther,
			partnerId: fromId
		});
	}
}
function join(op) {
	const s = store();
	const prev = s.sessions.get(op.id);
	if (prev) {
		if (prev.waiter) {
			const wake = prev.waiter;
			prev.waiter = null;
			wake([]);
		}
		if (prev.roomId) endRoom(prev.roomId, prev.id, "partner_left", "left");
		s.waiting.delete(prev.id);
	}
	const sess = {
		id: op.id,
		interests: op.interests.slice(0, 8),
		lastPartnerId: op.lastPartnerId,
		blocked: new Set(op.blocked.slice(0, 80)),
		roomId: null,
		status: "searching",
		lastSeen: now(),
		joinedWaitAt: now(),
		inbox: [],
		waiter: null,
		recentMsgTs: []
	};
	s.sessions.set(sess.id, sess);
	s.waiting.set(sess.id, sess);
	tryMatch(sess);
	for (const w of s.waiting.values()) if (w.id !== sess.id) tryMatch(w);
	return {
		status: sess.status === "matched" ? "matched" : "searching",
		roomId: sess.roomId,
		events: drain(sess)
	};
}
function poll(id) {
	const sess = getSession(id);
	if (!sess) return Promise.resolve({
		status: "idle",
		roomId: null,
		events: []
	});
	if (sess.status === "searching") tryMatch(sess);
	if (sess.inbox.length > 0) return Promise.resolve({
		status: sess.status === "matched" ? "matched" : sess.status === "searching" ? "searching" : "idle",
		roomId: sess.roomId,
		events: drain(sess)
	});
	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			if (sess.waiter) {
				sess.waiter = null;
				sess.lastSeen = now();
				resolve({
					status: sess.status === "matched" ? "matched" : sess.status === "searching" ? "searching" : "idle",
					roomId: sess.roomId,
					events: drain(sess)
				});
			}
		}, POLL_WAIT_MS);
		sess.waiter = (events) => {
			clearTimeout(timer);
			sess.lastSeen = now();
			resolve({
				status: sess.status === "matched" ? "matched" : sess.status === "searching" ? "searching" : "idle",
				roomId: sess.roomId,
				events
			});
		};
	});
}
function send(op) {
	const sess = getSession(op.id);
	if (!sess || sess.roomId !== op.roomId) return {
		status: "idle",
		roomId: null,
		events: [{
			t: "nack",
			id: op.msgId,
			error: "not in room"
		}]
	};
	const text = op.text.trim().slice(0, 500);
	if (!text) return {
		status: "matched",
		roomId: sess.roomId,
		events: [{
			t: "nack",
			id: op.msgId,
			error: "empty"
		}]
	};
	const t = now();
	sess.recentMsgTs = sess.recentMsgTs.filter((x) => t - x < RATE_WINDOW_MS);
	if (sess.recentMsgTs.length >= 8) return {
		status: "matched",
		roomId: sess.roomId,
		events: [{
			t: "nack",
			id: op.msgId,
			error: "rate"
		}]
	};
	sess.recentMsgTs.push(t);
	const room = store().rooms.get(op.roomId);
	if (!room) return {
		status: "idle",
		roomId: null,
		events: [{
			t: "nack",
			id: op.msgId,
			error: "closed"
		}]
	};
	const other = store().sessions.get(partnerOf(room, sess.id));
	emit(sess, {
		t: "ack",
		id: op.msgId
	});
	if (other) emit(other, {
		t: "msg",
		id: op.msgId,
		from: sess.id,
		text,
		ts: t
	});
	return {
		status: "matched",
		roomId: sess.roomId,
		events: drain(sess)
	};
}
function typing(op) {
	const sess = getSession(op.id);
	if (!sess || sess.roomId !== op.roomId) return {
		status: "idle",
		roomId: null,
		events: []
	};
	const room = store().rooms.get(op.roomId);
	if (!room) return {
		status: "matched",
		roomId: sess.roomId,
		events: []
	};
	const other = store().sessions.get(partnerOf(room, sess.id));
	if (other) emit(other, {
		t: "typing",
		on: op.on
	});
	return {
		status: "matched",
		roomId: sess.roomId,
		events: drain(sess)
	};
}
function skip(id, roomId, reason, otherReason) {
	const sess = getSession(id);
	if (sess?.roomId === roomId) endRoom(roomId, id, otherReason, reason);
	else if (sess) {
		sess.status = "idle";
		store().waiting.delete(id);
	}
	const fresh = store().sessions.get(id);
	return {
		status: "ended",
		roomId: null,
		events: fresh ? drain(fresh) : [{
			t: "ended",
			reason
		}]
	};
}
function leave(id) {
	const s = store();
	const sess = s.sessions.get(id);
	if (!sess) return {
		status: "idle",
		roomId: null,
		events: []
	};
	if (sess.roomId) endRoom(sess.roomId, id, "partner_left", "left");
	s.waiting.delete(id);
	if (sess.waiter) {
		sess.waiter([]);
		sess.waiter = null;
	}
	s.sessions.delete(id);
	return {
		status: "idle",
		roomId: null,
		events: []
	};
}
function cancel(id) {
	const s = store();
	const sess = s.sessions.get(id);
	if (!sess) return {
		status: "idle",
		roomId: null,
		events: []
	};
	if (sess.roomId) endRoom(sess.roomId, id, "partner_left", "left");
	sess.status = "idle";
	sess.roomId = null;
	s.waiting.delete(id);
	if (sess.waiter) {
		const wake = sess.waiter;
		sess.waiter = null;
		wake(drain(sess));
	}
	return {
		status: "idle",
		roomId: null,
		events: []
	};
}
function parseOp(body) {
	if (!body || typeof body !== "object") return null;
	const o = body;
	const op = o.op;
	const id = typeof o.id === "string" ? o.id : "";
	if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return null;
	if (op === "join") return {
		op,
		id,
		interests: Array.isArray(o.interests) ? o.interests.filter((x) => typeof x === "string").slice(0, 8) : [],
		lastPartnerId: typeof o.lastPartnerId === "string" ? o.lastPartnerId : null,
		blocked: Array.isArray(o.blocked) ? o.blocked.filter((x) => typeof x === "string").slice(0, 80) : []
	};
	if (op === "poll" || op === "leave" || op === "cancel") return {
		op,
		id
	};
	if (op === "send") {
		const roomId = typeof o.roomId === "string" ? o.roomId : "";
		const msgId = typeof o.msgId === "string" ? o.msgId : "";
		const text = typeof o.text === "string" ? o.text : "";
		if (!roomId || !msgId) return null;
		return {
			op,
			id,
			roomId,
			msgId,
			text
		};
	}
	if (op === "typing") {
		const roomId = typeof o.roomId === "string" ? o.roomId : "";
		if (!roomId) return null;
		return {
			op,
			id,
			roomId,
			on: Boolean(o.on)
		};
	}
	if (op === "skip" || op === "report") {
		const roomId = typeof o.roomId === "string" ? o.roomId : "";
		if (!roomId) return null;
		if (op === "report") {
			const reason = o.reason;
			if (typeof reason !== "string" || ![
				"spam",
				"sexual",
				"hate",
				"scam",
				"other"
			].includes(reason)) return null;
			return {
				op,
				id,
				roomId,
				reason
			};
		}
		return {
			op,
			id,
			roomId
		};
	}
	return null;
}
async function handleNightline(request) {
	try {
		gc(now());
		if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
		let raw;
		try {
			const text = await request.text();
			raw = text ? JSON.parse(text) : null;
		} catch {
			return json({ error: "invalid JSON" }, 400);
		}
		const op = parseOp(raw);
		if (!op) return json({ error: "invalid request" }, 400);
		if (op.op === "join") return json(join(op));
		if (op.op === "poll") return json(await poll(op.id));
		if (op.op === "send") return json(send(op));
		if (op.op === "typing") return json(typing(op));
		if (op.op === "skip") return json(skip(op.id, op.roomId, "skipped", "partner_left"));
		if (op.op === "report") return json(skip(op.id, op.roomId, "reported", "reported_you"));
		if (op.op === "leave") return json(leave(op.id));
		if (op.op === "cancel") return json(cancel(op.id));
		return json({ error: "unknown op" }, 400);
	} catch (error) {
		console.error("[nightline]", error);
		return json({ error: "line failed" }, 500);
	}
}
var handle = ({ request }) => handleNightline(request);
var Route = createFileRoute("/api/line")({ server: { handlers: {
	GET: handle,
	POST: handle
} } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	ChatRoute: Route$2.update({
		id: "/chat",
		path: "/chat",
		getParentRoute: () => Route$4
	}),
	RulesRoute: Route$1.update({
		id: "/rules",
		path: "/rules",
		getParentRoute: () => Route$4
	}),
	ApiLineRoute: Route.update({
		id: "/api/line",
		path: "/api/line",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { MUTE_MS as a, TYPING_DEBOUNCE_MS as c, sharesInterest as d, newId as l, INTEREST_CHIPS as n, RATE_WINDOW_MS as o, REPORT_REASONS as s, router_exports as t, normalizeInterests as u };
