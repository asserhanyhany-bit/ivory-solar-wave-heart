import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn } from "./wordmark-HT-qZO5w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/storage-DMvxP00p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,color,opacity,box-shadow] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night", {
	variants: {
		variant: {
			primary: "bg-warm text-night hover:bg-warm/90 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_20%,transparent)]",
			violet: "bg-violet text-warm hover:bg-violet/90",
			ghost: "bg-transparent text-warm/80 hover:text-warm hover:bg-warm/5 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_12%,transparent)]",
			danger: "bg-danger/15 text-danger hover:bg-danger/25",
			chip: "bg-ink text-muted hover:text-warm shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_10%,transparent)] data-[on=true]:bg-violet/20 data-[on=true]:text-warm data-[on=true]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-violet)_70%,transparent)]"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-md",
			md: "h-11 px-4 text-sm rounded-lg",
			lg: "h-12 px-6 text-base rounded-lg",
			xl: "h-14 px-8 text-base rounded-xl",
			icon: "size-11 rounded-lg"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = (0, import_react.forwardRef)(function Button({ className, variant, size, staticScale, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		className: cn(buttonVariants({
			variant,
			size
		}), staticScale && "active:not-disabled:scale-100", className),
		...props
	});
});
var AGE_KEY = "nightline.age18";
var SOUND_KEY = "nightline.sound";
var BLOCK_KEY = "nightline.blocked";
var INTERESTS_KEY = "nightline.interests";
function hasAgeConfirm() {
	try {
		return localStorage.getItem(AGE_KEY) === "1";
	} catch {
		return false;
	}
}
function setAgeConfirm(ok) {
	try {
		if (ok) localStorage.setItem(AGE_KEY, "1");
		else localStorage.removeItem(AGE_KEY);
	} catch {}
}
function soundEnabled() {
	try {
		return localStorage.getItem(SOUND_KEY) === "1";
	} catch {
		return false;
	}
}
function setSoundEnabled(on) {
	try {
		localStorage.setItem(SOUND_KEY, on ? "1" : "0");
	} catch {}
}
function readBlocked() {
	try {
		const raw = localStorage.getItem(BLOCK_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((x) => typeof x === "string").slice(-80);
	} catch {
		return [];
	}
}
function addBlocked(id) {
	const next = [.../* @__PURE__ */ new Set([...readBlocked(), id])].slice(-80);
	try {
		localStorage.setItem(BLOCK_KEY, JSON.stringify(next));
	} catch {}
}
function stashInterests(chips) {
	try {
		sessionStorage.setItem(INTERESTS_KEY, JSON.stringify(chips));
	} catch {}
}
function takeInterests() {
	try {
		const raw = sessionStorage.getItem(INTERESTS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((x) => typeof x === "string");
	} catch {
		return [];
	}
}
//#endregion
export { setAgeConfirm as a, stashInterests as c, readBlocked as i, takeInterests as l, addBlocked as n, setSoundEnabled as o, hasAgeConfirm as r, soundEnabled as s, Button as t };
