
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	const node_env = globalThis.process?.env?.NODE_ENV;
	var DEV = node_env && !node_env.toLowerCase().startsWith('prod');

	// Store the references to globals in case someone tries to monkey patch these, causing the below
	// to de-opt (this occurs often when using popular extensions).
	var is_array = Array.isArray;
	var index_of = Array.prototype.indexOf;
	var includes = Array.prototype.includes;
	var array_from = Array.from;
	var define_property = Object.defineProperty;
	var get_descriptor = Object.getOwnPropertyDescriptor;
	var get_descriptors = Object.getOwnPropertyDescriptors;
	var object_prototype = Object.prototype;
	var array_prototype = Array.prototype;
	var get_prototype_of = Object.getPrototypeOf;
	var is_extensible = Object.isExtensible;

	const noop = () => {};

	/** @param {Array<() => void>} arr */
	function run_all(arr) {
		for (var i = 0; i < arr.length; i++) {
			arr[i]();
		}
	}

	/**
	 * TODO replace with Promise.withResolvers once supported widely enough
	 * @template [T=void]
	 */
	function deferred() {
		/** @type {(value: T) => void} */
		var resolve;

		/** @type {(reason: any) => void} */
		var reject;

		/** @type {Promise<T>} */
		var promise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});

		// @ts-expect-error
		return { promise, resolve, reject };
	}

	// General flags
	const DERIVED = 1 << 1;
	const EFFECT = 1 << 2;
	const RENDER_EFFECT = 1 << 3;
	/**
	 * An effect that does not destroy its child effects when it reruns.
	 * Runs as part of render effects, i.e. not eagerly as part of tree traversal or effect flushing.
	 */
	const MANAGED_EFFECT = 1 << 24;
	/**
	 * An effect that does not destroy its child effects when it reruns (like MANAGED_EFFECT).
	 * Runs eagerly as part of tree traversal or effect flushing.
	 */
	const BLOCK_EFFECT = 1 << 4;
	const BRANCH_EFFECT = 1 << 5;
	const ROOT_EFFECT = 1 << 6;
	const BOUNDARY_EFFECT = 1 << 7;
	/**
	 * Set on the effect that `pause_effect` was called on, i.e. the root of a paused subtree,
	 * as opposed to its descendants which are merely `INERT`. This allows `resume_effect` on
	 * an ancestor to skip subtrees that were paused for their own reasons (such as a block
	 * whose condition is still false) rather than resurrecting them
	 */
	const PAUSED = 1 << 8;
	/**
	 * Indicates that a reaction is connected to an effect root — either it is an effect,
	 * or it is a derived that is depended on by at least one effect. If a derived has
	 * no dependents, we can disconnect it from the graph, allowing it to either be
	 * GC'd or reconnected later if an effect comes to depend on it again
	 */
	const CONNECTED = 1 << 9;
	const CLEAN = 1 << 10;
	const DIRTY = 1 << 11;
	const MAYBE_DIRTY = 1 << 12;
	const INERT = 1 << 13;
	const DESTROYED = 1 << 14;
	/** Set once a reaction has run for the first time */
	const REACTION_RAN = 1 << 15;
	/** Effect is in the process of getting destroyed. Can be observed in child teardown functions */
	const DESTROYING = 1 << 25;

	// Flags exclusive to effects
	/**
	 * 'Transparent' effects do not create a transition boundary.
	 * This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
	 */
	const EFFECT_TRANSPARENT = 1 << 16;
	const EAGER_EFFECT = 1 << 17;
	const HEAD_EFFECT = 1 << 18;
	const EFFECT_PRESERVED = 1 << 19;
	const USER_EFFECT = 1 << 20;
	const EFFECT_OFFSCREEN = 1 << 25;

	// Flags exclusive to deriveds
	/**
	 * Tells that we marked this derived and its reactions as visited during the "mark as (maybe) dirty"-phase.
	 * Will be lifted during execution of the derived and during checking its dirty state (both are necessary
	 * because a derived might be checked but not executed). This is a pure performance optimization flag and
	 * should not be used for any other purpose!
	 */
	const WAS_MARKED = 1 << 16;

	// Flags used for async
	const REACTION_IS_UPDATING = 1 << 21;
	const ASYNC = 1 << 22;

	const ERROR_VALUE = 1 << 23;

	const STATE_SYMBOL = Symbol('$state');
	/** Marks component export objects, so that `proxy(...)` leaves them untouched */
	const COMPONENT_SYMBOL = Symbol('component');
	const LOADING_ATTR_SYMBOL = Symbol('');
	const PROXY_PATH_SYMBOL = Symbol('proxy path');
	const ATTRIBUTES_CACHE = Symbol('attributes');
	const CLASS_CACHE = Symbol('class');
	const STYLE_CACHE = Symbol('style');
	const TEXT_CACHE = Symbol('text');
	const FORM_RESET_HANDLER = Symbol('form reset');
	/** An anchor might change, via this symbol on the original anchor we can tell HMR about the updated anchor */
	const HMR_ANCHOR = Symbol('hmr anchor');

	/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
	const STALE_REACTION = new (class StaleReactionError extends Error {
		name = 'StaleReactionError';
		message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
	})();
	const ELEMENT_NODE = 1;
	const DOCUMENT_FRAGMENT_NODE = 11;

	const EACH_ITEM_REACTIVE = 1;
	const EACH_INDEX_REACTIVE = 1 << 1;
	/** See EachBlock interface metadata.is_controlled for an explanation what this is */
	const EACH_IS_CONTROLLED = 1 << 2;
	const EACH_IS_ANIMATED = 1 << 3;
	const EACH_ITEM_IMMUTABLE = 1 << 4;

	const TEMPLATE_FRAGMENT = 1;
	const TEMPLATE_USE_IMPORT_NODE = 1 << 1;

	const UNINITIALIZED = Symbol('uninitialized');

	// Dev-time component properties
	const FILENAME = Symbol('filename');

	const NAMESPACE_HTML = 'http://www.w3.org/1999/xhtml';

	/* This file is generated by scripts/process-messages/index.js. Do not edit! */


	var bold$1 = 'font-weight: bold';
	var normal$1 = 'font-weight: normal';

	/**
	 * Detected reactivity loss when reading `%name%`. This happens when state is read in an async function after an earlier `await`
	 * @param {string} name
	 */
	function await_reactivity_loss(name) {
		if (DEV) {
			console.warn(`%c[svelte] await_reactivity_loss\n%cDetected reactivity loss when reading \`${name}\`. This happens when state is read in an async function after an earlier \`await\`\nhttps://svelte.dev/e/await_reactivity_loss`, bold$1, normal$1);
		} else {
			console.warn(`https://svelte.dev/e/await_reactivity_loss`);
		}
	}

	/**
	 * An async derived, `%name%` (%location%) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app
	 * @param {string} name
	 * @param {string} location
	 */
	function await_waterfall(name, location) {
		if (DEV) {
			console.warn(`%c[svelte] await_waterfall\n%cAn async derived, \`${name}\` (${location}) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app\nhttps://svelte.dev/e/await_waterfall`, bold$1, normal$1);
		} else {
			console.warn(`https://svelte.dev/e/await_waterfall`);
		}
	}

	/**
	 * Your `console.%method%` contained `$state` proxies. Consider using `$inspect(...)` or `$state.snapshot(...)` instead
	 * @param {string} method
	 */
	function console_log_state(method) {
		if (DEV) {
			console.warn(`%c[svelte] console_log_state\n%cYour \`console.${method}\` contained \`$state\` proxies. Consider using \`$inspect(...)\` or \`$state.snapshot(...)\` instead\nhttps://svelte.dev/e/console_log_state`, bold$1, normal$1);
		} else {
			console.warn(`https://svelte.dev/e/console_log_state`);
		}
	}

	/**
	 * Reading a derived belonging to a now-destroyed effect may result in stale values
	 */
	function derived_inert() {
		if (DEV) {
			console.warn(`%c[svelte] derived_inert\n%cReading a derived belonging to a now-destroyed effect may result in stale values\nhttps://svelte.dev/e/derived_inert`, bold$1, normal$1);
		} else {
			console.warn(`https://svelte.dev/e/derived_inert`);
		}
	}

	/**
	 * Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `%operator%` will produce unexpected results
	 * @param {string} operator
	 */
	function state_proxy_equality_mismatch(operator) {
		if (DEV) {
			console.warn(`%c[svelte] state_proxy_equality_mismatch\n%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${operator}\` will produce unexpected results\nhttps://svelte.dev/e/state_proxy_equality_mismatch`, bold$1, normal$1);
		} else {
			console.warn(`https://svelte.dev/e/state_proxy_equality_mismatch`);
		}
	}

	/**
	 * A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called
	 */
	function svelte_boundary_reset_noop() {
		if (DEV) {
			console.warn(`%c[svelte] svelte_boundary_reset_noop\n%cA \`<svelte:boundary>\` \`reset\` function only resets the boundary the first time it is called\nhttps://svelte.dev/e/svelte_boundary_reset_noop`, bold$1, normal$1);
		} else {
			console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
		}
	}

	/** @import { TemplateNode } from '#client' */


	/** @param {TemplateNode} node */
	function reset(node) {
		return;
	}

	function next(count = 1) {
	}

	/** @import { Equals } from '#client' */

	/** @type {Equals} */
	function equals(value) {
		return value === this.v;
	}

	/**
	 * @param {unknown} a
	 * @param {unknown} b
	 * @returns {boolean}
	 */
	function safe_not_equal(a, b) {
		return a != a
			? b == b
			: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
	}

	/** @type {Equals} */
	function safe_equals(value) {
		return !safe_not_equal(value, this.v);
	}

	/* This file is generated by scripts/process-messages/index.js. Do not edit! */


	/**
	 * An invariant violation occurred, meaning Svelte's internal assumptions were flawed. This is a bug in Svelte, not your app — please open an issue at https://github.com/sveltejs/svelte, citing the following message: "%message%"
	 * @param {string} message
	 * @returns {never}
	 */
	function invariant_violation(message) {
		if (DEV) {
			const error = new Error(`invariant_violation\nAn invariant violation occurred, meaning Svelte's internal assumptions were flawed. This is a bug in Svelte, not your app — please open an issue at https://github.com/sveltejs/svelte, citing the following message: "${message}"\nhttps://svelte.dev/e/invariant_violation`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/invariant_violation`);
		}
	}

	/**
	 * `%name%(...)` can only be used during component initialisation
	 * @param {string} name
	 * @returns {never}
	 */
	function lifecycle_outside_component(name) {
		if (DEV) {
			const error = new Error(`lifecycle_outside_component\n\`${name}(...)\` can only be used during component initialisation\nhttps://svelte.dev/e/lifecycle_outside_component`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
		}
	}

	/* This file is generated by scripts/process-messages/index.js. Do not edit! */


	/**
	 * Cannot create a `$derived(...)` with an `await` expression outside of an effect tree
	 * @returns {never}
	 */
	function async_derived_orphan() {
		if (DEV) {
			const error = new Error(`async_derived_orphan\nCannot create a \`$derived(...)\` with an \`await\` expression outside of an effect tree\nhttps://svelte.dev/e/async_derived_orphan`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/async_derived_orphan`);
		}
	}

	/**
	 * Using `bind:value` together with a checkbox input is not allowed. Use `bind:checked` instead
	 * @returns {never}
	 */
	function bind_invalid_checkbox_value() {
		if (DEV) {
			const error = new Error(`bind_invalid_checkbox_value\nUsing \`bind:value\` together with a checkbox input is not allowed. Use \`bind:checked\` instead\nhttps://svelte.dev/e/bind_invalid_checkbox_value`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/bind_invalid_checkbox_value`);
		}
	}

	/**
	 * Calling `%method%` on a component instance (of %component%) is no longer valid in Svelte 5
	 * @param {string} method
	 * @param {string} component
	 * @returns {never}
	 */
	function component_api_changed(method, component) {
		if (DEV) {
			const error = new Error(`component_api_changed\nCalling \`${method}\` on a component instance (of ${component}) is no longer valid in Svelte 5\nhttps://svelte.dev/e/component_api_changed`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/component_api_changed`);
		}
	}

	/**
	 * Attempted to instantiate %component% with `new %name%`, which is no longer valid in Svelte 5. If this component is not under your control, set the `compatibility.componentApi` compiler option to `4` to keep it working.
	 * @param {string} component
	 * @param {string} name
	 * @returns {never}
	 */
	function component_api_invalid_new(component, name) {
		if (DEV) {
			const error = new Error(`component_api_invalid_new\nAttempted to instantiate ${component} with \`new ${name}\`, which is no longer valid in Svelte 5. If this component is not under your control, set the \`compatibility.componentApi\` compiler option to \`4\` to keep it working.\nhttps://svelte.dev/e/component_api_invalid_new`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/component_api_invalid_new`);
		}
	}

	/**
	 * A derived value cannot reference itself recursively
	 * @returns {never}
	 */
	function derived_references_self() {
		if (DEV) {
			const error = new Error(`derived_references_self\nA derived value cannot reference itself recursively\nhttps://svelte.dev/e/derived_references_self`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/derived_references_self`);
		}
	}

	/**
	 * Keyed each block has duplicate key `%value%` at indexes %a% and %b%
	 * @param {string} a
	 * @param {string} b
	 * @param {string | undefined | null} [value]
	 * @returns {never}
	 */
	function each_key_duplicate(a, b, value) {
		if (DEV) {
			const error = new Error(`each_key_duplicate\n${value
			? `Keyed each block has duplicate key \`${value}\` at indexes ${a} and ${b}`
			: `Keyed each block has duplicate key at indexes ${a} and ${b}`}\nhttps://svelte.dev/e/each_key_duplicate`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/each_key_duplicate`);
		}
	}

	/**
	 * Keyed each block has key that is not idempotent — the key for item at index %index% was `%a%` but is now `%b%`. Keys must be the same each time for a given item
	 * @param {string} index
	 * @param {string} a
	 * @param {string} b
	 * @returns {never}
	 */
	function each_key_volatile(index, a, b) {
		if (DEV) {
			const error = new Error(`each_key_volatile\nKeyed each block has key that is not idempotent — the key for item at index ${index} was \`${a}\` but is now \`${b}\`. Keys must be the same each time for a given item\nhttps://svelte.dev/e/each_key_volatile`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/each_key_volatile`);
		}
	}

	/**
	 * `%rune%` cannot be used inside an effect cleanup function
	 * @param {string} rune
	 * @returns {never}
	 */
	function effect_in_teardown(rune) {
		if (DEV) {
			const error = new Error(`effect_in_teardown\n\`${rune}\` cannot be used inside an effect cleanup function\nhttps://svelte.dev/e/effect_in_teardown`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/effect_in_teardown`);
		}
	}

	/**
	 * Effect cannot be created inside a `$derived` value that was not itself created inside an effect
	 * @returns {never}
	 */
	function effect_in_unowned_derived() {
		if (DEV) {
			const error = new Error(`effect_in_unowned_derived\nEffect cannot be created inside a \`$derived\` value that was not itself created inside an effect\nhttps://svelte.dev/e/effect_in_unowned_derived`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
		}
	}

	/**
	 * `%rune%` can only be used inside an effect (e.g. during component initialisation)
	 * @param {string} rune
	 * @returns {never}
	 */
	function effect_orphan(rune) {
		if (DEV) {
			const error = new Error(`effect_orphan\n\`${rune}\` can only be used inside an effect (e.g. during component initialisation)\nhttps://svelte.dev/e/effect_orphan`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/effect_orphan`);
		}
	}

	/**
	 * Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
	 * @returns {never}
	 */
	function effect_update_depth_exceeded() {
		if (DEV) {
			const error = new Error(`effect_update_depth_exceeded\nMaximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state\nhttps://svelte.dev/e/effect_update_depth_exceeded`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
		}
	}

	/**
	 * The `%rune%` rune is only available inside `.svelte` and `.svelte.js/ts` files
	 * @param {string} rune
	 * @returns {never}
	 */
	function rune_outside_svelte(rune) {
		if (DEV) {
			const error = new Error(`rune_outside_svelte\nThe \`${rune}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files\nhttps://svelte.dev/e/rune_outside_svelte`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
		}
	}

	/**
	 * Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.
	 * @returns {never}
	 */
	function state_descriptors_fixed() {
		if (DEV) {
			const error = new Error(`state_descriptors_fixed\nProperty descriptors defined on \`$state\` objects must contain \`value\` and always be \`enumerable\`, \`configurable\` and \`writable\`.\nhttps://svelte.dev/e/state_descriptors_fixed`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
		}
	}

	/**
	 * Cannot set prototype of `$state` object
	 * @returns {never}
	 */
	function state_prototype_fixed() {
		if (DEV) {
			const error = new Error(`state_prototype_fixed\nCannot set prototype of \`$state\` object\nhttps://svelte.dev/e/state_prototype_fixed`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
		}
	}

	/**
	 * Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
	 * @returns {never}
	 */
	function state_unsafe_mutation() {
		if (DEV) {
			const error = new Error(`state_unsafe_mutation\nUpdating state inside \`$derived(...)\`, \`$inspect(...)\` or a template expression is forbidden. If the value should not be reactive, declare it without \`$state\`\nhttps://svelte.dev/e/state_unsafe_mutation`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
		}
	}

	/**
	 * A `<svelte:boundary>` `reset` function cannot be called while an error is still being handled
	 * @returns {never}
	 */
	function svelte_boundary_reset_onerror() {
		if (DEV) {
			const error = new Error(`svelte_boundary_reset_onerror\nA \`<svelte:boundary>\` \`reset\` function cannot be called while an error is still being handled\nhttps://svelte.dev/e/svelte_boundary_reset_onerror`);

			error.name = 'Svelte error';

			throw error;
		} else {
			throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
		}
	}

	/** True if experimental.async=true */
	let async_mode_flag = false;
	/** True if we're not certain that we only have Svelte 5 code in the compilation */
	let legacy_mode_flag = false;
	/** True if $inspect.trace is used */
	let tracing_mode_flag = false;

	function enable_legacy_mode_flag() {
		legacy_mode_flag = true;
	}

	/* This file is generated by scripts/process-messages/index.js. Do not edit! */


	var bold = 'font-weight: bold';
	var normal = 'font-weight: normal';

	/**
	 * The following properties cannot be cloned with `$state.snapshot` — the return value contains the originals:
	 * 
	 * %properties%
	 * @param {string | undefined | null} [properties]
	 */
	function state_snapshot_uncloneable(properties) {
		if (DEV) {
			console.warn(
				`%c[svelte] state_snapshot_uncloneable\n%c${properties
				? `The following properties cannot be cloned with \`$state.snapshot\` — the return value contains the originals:

${properties}`
				: 'Value cannot be cloned with `$state.snapshot` — the original value was returned'}\nhttps://svelte.dev/e/state_snapshot_uncloneable`,
				bold,
				normal
			);
		} else {
			console.warn(`https://svelte.dev/e/state_snapshot_uncloneable`);
		}
	}

	/** @import { Snapshot } from './types' */

	/**
	 * In dev, we keep track of which properties could not be cloned. In prod
	 * we don't bother, but we keep a dummy array around so that the
	 * signature stays the same
	 * @type {string[]}
	 */
	const empty = [];

	/**
	 * @template T
	 * @param {T} value
	 * @param {boolean} [skip_warning]
	 * @param {boolean} [no_tojson]
	 * @returns {Snapshot<T>}
	 */
	function snapshot(value, skip_warning = false, no_tojson = false) {
		if (DEV && !skip_warning) {
			/** @type {string[]} */
			const paths = [];

			const copy = clone(value, new Map(), '', paths, null, no_tojson);
			if (paths.length === 1 && paths[0] === '') {
				// value could not be cloned
				state_snapshot_uncloneable();
			} else if (paths.length > 0) {
				// some properties could not be cloned
				const slice = paths.length > 10 ? paths.slice(0, 7) : paths.slice(0, 10);
				const excess = paths.length - slice.length;

				let uncloned = slice.map((path) => `- <value>${path}`).join('\n');
				if (excess > 0) uncloned += `\n- ...and ${excess} more`;

				state_snapshot_uncloneable(uncloned);
			}

			return copy;
		}

		return clone(value, new Map(), '', empty, null, no_tojson);
	}

	/**
	 * @template T
	 * @param {T} value
	 * @param {Map<T, Snapshot<T>>} cloned
	 * @param {string} path
	 * @param {string[]} paths
	 * @param {null | T} [original] The original value, if `value` was produced from a `toJSON` call
	 * @param {boolean} [no_tojson]
	 * @returns {Snapshot<T>}
	 */
	function clone(value, cloned, path, paths, original = null, no_tojson = false) {
		if (typeof value === 'object' && value !== null) {
			var unwrapped = cloned.get(value);
			if (unwrapped !== undefined) return unwrapped;

			if (value instanceof Map) return /** @type {Snapshot<T>} */ (new Map(value));
			if (value instanceof Set) return /** @type {Snapshot<T>} */ (new Set(value));

			if (is_array(value)) {
				var copy = /** @type {Snapshot<any>} */ (Array(value.length));
				cloned.set(value, copy);

				if (original !== null) {
					cloned.set(original, copy);
				}

				for (var i = 0; i < value.length; i += 1) {
					var element = value[i];
					if (i in value) {
						copy[i] = clone(element, cloned, DEV ? `${path}[${i}]` : path, paths, null, no_tojson);
					}
				}

				return copy;
			}

			if (get_prototype_of(value) === object_prototype) {
				/** @type {Snapshot<any>} */
				copy = {};
				cloned.set(value, copy);

				if (original !== null) {
					cloned.set(original, copy);
				}

				for (var key of Object.keys(value)) {
					copy[key] = clone(
						// @ts-expect-error
						value[key],
						cloned,
						DEV ? `${path}.${key}` : path,
						paths,
						null,
						no_tojson
					);
				}

				return copy;
			}

			if (value instanceof Date) {
				// Ensure SvelteDate snapshots are tracked
				value.getTime();
				return /** @type {Snapshot<T>} */ (structuredClone(value));
			}

			if (typeof (/** @type {T & { toJSON?: any } } */ (value).toJSON) === 'function' && !no_tojson) {
				return clone(
					/** @type {T & { toJSON(): any } } */ (value).toJSON(),
					cloned,
					DEV ? `${path}.toJSON()` : path,
					paths,
					// Associate the instance with the toJSON clone
					value
				);
			}
		}

		if (value instanceof EventTarget) {
			// can't be cloned
			return /** @type {Snapshot<T>} */ (value);
		}

		try {
			return /** @type {Snapshot<T>} */ (structuredClone(value));
		} catch (e) {
			if (DEV) {
				paths.push(path);
			}

			return /** @type {Snapshot<T>} */ (value);
		}
	}

	/** @import { Derived, Reaction, Value } from '#client' */

	/**
	 * @param {Value} source
	 * @param {string} label
	 */
	function tag(source, label) {
		source.label = label;
		tag_proxy(source.v, label);

		return source;
	}

	/**
	 * @param {unknown} value
	 * @param {string} label
	 */
	function tag_proxy(value, label) {
		// @ts-expect-error
		value?.[PROXY_PATH_SYMBOL]?.(label);
		return value;
	}

	/**
	 * @param {string} label
	 * @returns {Error & { stack: string } | null}
	 */
	function get_error(label) {
		const error = new Error();
		const stack = get_stack();

		if (stack.length === 0) {
			return null;
		}

		stack.unshift('\n');

		define_property(error, 'stack', {
			value: stack.join('\n')
		});

		define_property(error, 'name', {
			value: label
		});

		return /** @type {Error & { stack: string }} */ (error);
	}

	/**
	 * @returns {string[]}
	 */
	function get_stack() {
		// @ts-ignore - doesn't exist everywhere
		const limit = Error.stackTraceLimit;
		// @ts-ignore - doesn't exist everywhere
		Error.stackTraceLimit = Infinity;
		const stack = new Error().stack;
		// @ts-ignore - doesn't exist everywhere
		Error.stackTraceLimit = limit;

		if (!stack) return [];

		const lines = stack.split('\n');
		const new_lines = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const posixified = line.replaceAll('\\', '/');

			if (line.trim() === 'Error') {
				continue;
			}

			if (line.includes('validate_each_keys')) {
				return [];
			}

			if (posixified.includes('svelte/src/internal') || posixified.includes('node_modules/.vite')) {
				continue;
			}

			new_lines.push(line);
		}

		return new_lines;
	}

	/**
	 * @param {boolean} condition
	 * @param {string} message
	 */
	function invariant(condition, message) {
		if (!DEV) {
			throw new Error('invariant(...) was not guarded by if (DEV)');
		}

		if (!condition) invariant_violation(message);
	}

	/** @import { ComponentContext, DevStackEntry, Effect } from '#client' */

	/** @type {ComponentContext | null} */
	let component_context = null;

	/** @param {ComponentContext | null} context */
	function set_component_context(context) {
		component_context = context;
	}

	/** @type {DevStackEntry | null} */
	let dev_stack = null;

	/** @param {DevStackEntry | null} stack */
	function set_dev_stack(stack) {
		dev_stack = stack;
	}

	/**
	 * Execute a callback with a new dev stack entry
	 * @param {() => any} callback - Function to execute
	 * @param {DevStackEntry['type']} type - Type of block/component
	 * @param {any} component - Component function
	 * @param {number} line - Line number
	 * @param {number} column - Column number
	 * @param {Record<string, any>} [additional] - Any additional properties to add to the dev stack entry
	 * @returns {any}
	 */
	function add_svelte_meta(callback, type, component, line, column, additional) {
		const parent = dev_stack;

		dev_stack = {
			type,
			file: component[FILENAME],
			line,
			column,
			parent,
			...additional
		};

		try {
			return callback();
		} finally {
			dev_stack = parent;
		}
	}

	/**
	 * The current component function. Different from current component context:
	 * ```html
	 * <!-- App.svelte -->
	 * <Foo>
	 *   <Bar /> <!-- context == Foo.svelte, function == App.svelte -->
	 * </Foo>
	 * ```
	 * @type {ComponentContext['function']}
	 */
	let dev_current_component_function = null;

	/** @param {ComponentContext['function']} fn */
	function set_dev_current_component_function(fn) {
		dev_current_component_function = fn;
	}

	/**
	 * @param {Record<string, unknown>} props
	 * @param {any} runes
	 * @param {Function} [fn]
	 * @returns {void}
	 */
	function push(props, runes = false, fn) {
		component_context = {
			p: component_context,
			i: false,
			c: null,
			e: null,
			s: props,
			x: null,
			r: /** @type {Effect} */ (active_effect),
			l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
		};

		if (DEV) {
			// component function
			component_context.function = fn;
			dev_current_component_function = fn;
		}
	}

	/**
	 * @template {Record<string, any>} T
	 * @param {T} [component]
	 * @returns {T}
	 */
	function pop(component) {
		var context = /** @type {ComponentContext} */ (component_context);
		var effects = context.e;

		if (effects !== null) {
			context.e = null;

			for (var fn of effects) {
				create_user_effect(fn);
			}
		}

		if (component !== undefined) {
			context.x = component;
		}

		context.i = true;

		component_context = context.p;

		if (DEV) {
			dev_current_component_function = component_context?.function ?? null;
		}

		return mark_as_component(component);
	}

	/**
	 * Add a symbol to the object (or create one if undefined) to mark it as a component so it isn't proxified.
	 * @param {any} component
	 */
	function mark_as_component(component = {}) {
		define_property(component, COMPONENT_SYMBOL, { value: true });
		return component;
	}

	/** @returns {boolean} */
	function is_runes() {
		return !legacy_mode_flag || (component_context !== null && component_context.l === null);
	}

	/** @type {Array<() => void>} */
	let micro_tasks = [];

	function run_micro_tasks() {
		var tasks = micro_tasks;
		micro_tasks = [];
		run_all(tasks);
	}

	/**
	 * @param {() => void} fn
	 */
	function queue_micro_task(fn) {
		if (micro_tasks.length === 0 && !is_flushing_sync) {
			var tasks = micro_tasks;
			queueMicrotask(() => {
				// If this is false, a flushSync happened in the meantime. Do _not_ run new scheduled microtasks in that case
				// as the ordering of microtasks would be broken at that point - consider this case:
				// - queue_micro_task schedules microtask A to flush task X
				// - synchronously after, flushSync runs, processing task X
				// - synchronously after, some other microtask B is scheduled, but not through queue_micro_task but for example a Promise.resolve() in user code
				// - synchronously after, queue_micro_task schedules microtask C to flush task Y
				// - one tick later, microtask A now resolves, flushing task Y before microtask B, which is incorrect
				// This if check prevents that race condition (that realistically will only happen in tests)
				if (tasks === micro_tasks) run_micro_tasks();
			});
		}

		micro_tasks.push(fn);
	}

	/**
	 * Synchronously run any queued tasks.
	 */
	function flush_tasks() {
		while (micro_tasks.length > 0) {
			run_micro_tasks();
		}
	}

	/** @import { Derived, Signal } from '#client' */

	const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);

	/**
	 * @param {Signal} signal
	 * @param {number} status
	 */
	function set_signal_status(signal, status) {
		signal.f = (signal.f & STATUS_MASK) | status;
	}

	/**
	 * Set a derived's status to CLEAN or MAYBE_DIRTY based on its connection state.
	 * @param {Derived} derived
	 */
	function update_derived_status(derived) {
		// Only mark as MAYBE_DIRTY if disconnected and has dependencies.
		if ((derived.f & CONNECTED) !== 0 || derived.deps === null) {
			set_signal_status(derived, CLEAN);
		} else {
			set_signal_status(derived, MAYBE_DIRTY);
		}
	}

	/** @import { Derived, Effect, Value } from '#client' */

	/**
	 * @param {Value[] | null} deps
	 */
	function clear_marked(deps) {
		if (deps === null) return;

		for (const dep of deps) {
			if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
				continue;
			}

			dep.f ^= WAS_MARKED;

			clear_marked(/** @type {Derived} */ (dep).deps);
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {Set<Effect>} dirty_effects
	 * @param {Set<Effect>} maybe_dirty_effects
	 */
	function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
		if ((effect.f & DIRTY) !== 0) {
			dirty_effects.add(effect);
		} else if ((effect.f & MAYBE_DIRTY) !== 0) {
			maybe_dirty_effects.add(effect);
		}

		// Since we're not executing these effects now, we need to clear any WAS_MARKED flags
		// so that other batches can correctly reach these effects during their own traversal
		clear_marked(effect.deps);

		// mark as clean so they get scheduled if they depend on pending async state
		set_signal_status(effect, CLEAN);
	}

	/** @import { StoreReferencesContainer } from '#client' */
	/** @import { Store } from '#shared' */

	/**
	 * We set this to `true` when updating a store so that we correctly
	 * schedule effects if the update takes place inside a `$:` effect
	 */
	let legacy_is_updating_store = false;

	let listening_to_form_reset = false;

	function add_form_reset_listener() {
		if (!listening_to_form_reset) {
			listening_to_form_reset = true;
			document.addEventListener(
				'reset',
				(evt) => {
					// Needs to happen one tick later or else the dom properties of the form
					// elements have not updated to their reset values yet
					Promise.resolve().then(() => {
						if (!evt.defaultPrevented) {
							for (const e of /**@type {HTMLFormElement} */ (evt.target).elements) {
								/** @type {any} */ (e)[FORM_RESET_HANDLER]?.();
							}
						}
					});
				},
				// In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
				{ capture: true }
			);
		}
	}

	/**
	 * @template T
	 * @param {() => T} fn
	 */
	function without_reactive_context(fn) {
		var previous_reaction = active_reaction;
		var previous_effect = active_effect;
		set_active_reaction(null);
		set_active_effect(null);
		try {
			return fn();
		} finally {
			set_active_reaction(previous_reaction);
			set_active_effect(previous_effect);
		}
	}

	/**
	 * Listen to the given event, and then instantiate a global form reset listener if not already done,
	 * to notify all bindings when the form is reset
	 * @param {HTMLElement} element
	 * @param {string} event
	 * @param {(is_reset?: true) => void} handler
	 * @param {(is_reset?: true) => void} [on_reset]
	 */
	function listen_to_event_and_reset_event(element, event, handler, on_reset = handler) {
		element.addEventListener(event, () => without_reactive_context(handler));
		const prev = /** @type {any} */ (element)[FORM_RESET_HANDLER];
		if (prev) {
			// special case for checkbox that can have multiple binds (group & checked)
			/** @type {any} */ (element)[FORM_RESET_HANDLER] = () => {
				prev();
				on_reset(true);
			};
		} else {
			/** @type {any} */ (element)[FORM_RESET_HANDLER] = () => on_reset(true);
		}

		add_form_reset_listener();
	}

	/** @import { Blocker, Effect, Source, Value } from '#client' */

	/**
	 * @param {Blocker[]} blockers
	 * @param {Array<() => any>} sync
	 * @param {Array<() => Promise<any>>} async
	 * @param {(values: Value[]) => any} fn
	 */
	function flatten(blockers, sync, async, fn) {
		const d = is_runes() ? derived : derived_safe_equal;

		// Filter out already-settled blockers - no need to wait for them
		var pending = blockers.filter((b) => !b.settled);

		var deriveds = sync.map(d);

		if (DEV) {
			deriveds.forEach((d, i) => {
				// TODO this is kinda useful for debugging but a lousy implementation —
				// maybe the compiler could pass through the template string
				d.label = sync[i]
					.toString()
					.replace('() => ', '')
					.replaceAll('$.eager(() => ', '$state.eager(')
					.replace(/\$\.get\((.+?)\)/g, (_, id) => id);
			});
		}

		if (async.length === 0 && pending.length === 0) {
			fn(deriveds);
			return;
		}

		var parent = /** @type {Effect} */ (active_effect);

		var restore = capture();
		var blocker_promise =
			pending.length === 1
				? pending[0].promise
				: pending.length > 1
					? Promise.all(pending.map((b) => b.promise))
					: null;

		/**
		 * @param {Source[]} async
		 */
		function finish(async) {
			if ((parent.f & DESTROYED) !== 0) {
				return;
			}

			restore();

			try {
				fn([...deriveds, ...async]);
			} catch (error) {
				invoke_error_boundary(error, parent);
			}

			unset_context();
		}

		var decrement_pending = increment_pending();

		// Fast path: blockers but no async expressions
		if (async.length === 0) {
			/** @type {Promise<any>} */ (blocker_promise).then(() => finish([])).finally(decrement_pending);
			return;
		}

		// Full path: has async expressions
		function run() {
			Promise.all(async.map((expression) => async_derived(expression)))
				.then(finish)
				.catch((error) => invoke_error_boundary(error, parent))
				.finally(decrement_pending);
		}

		if (blocker_promise) {
			blocker_promise.then(() => {
				restore();
				run();
				unset_context();
			});
		} else {
			run();
		}
	}

	/**
	 * Captures the current effect context so that we can restore it after
	 * some asynchronous work has happened (so that e.g. `await a + b`
	 * causes `b` to be registered as a dependency).
	 */
	function capture() {
		var previous_effect = /** @type {Effect} */ (active_effect);
		var previous_reaction = active_reaction;
		var previous_component_context = component_context;
		var previous_batch = /** @type {Batch} */ (current_batch);

		if (DEV) {
			var previous_dev_stack = dev_stack;
		}

		return function restore(activate_batch = true) {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_component_context);

			if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
				// TODO we only need optional chaining here because `{#await ...}` blocks
				// are anomalous. Once we retire them we can get rid of it
				previous_batch?.activate();
				previous_batch?.apply();
			}

			if (DEV) {
				set_reactivity_loss_tracker(null);
				set_dev_stack(previous_dev_stack);
			}
		};
	}

	function unset_context(deactivate_batch = true) {
		set_active_effect(null);
		set_active_reaction(null);
		set_component_context(null);
		if (deactivate_batch) current_batch?.deactivate();

		if (DEV) {
			set_reactivity_loss_tracker(null);
			set_dev_stack(null);
		}
	}

	/**
	 * @returns {(skip?: boolean) => void}
	 */
	function increment_pending() {
		var effect = /** @type {Effect} */ (active_effect);
		var boundary = effect.b; // undefined if called outside the render tree, e.g. a standalone $effect.root
		var batch = /** @type {Batch} */ (current_batch);
		var blocking = !!boundary?.is_rendered();

		boundary?.update_pending_count(1, batch);
		batch.increment(blocking, effect);

		return () => {
			boundary?.update_pending_count(-1, batch);
			batch.decrement(blocking, effect);
		};
	}

	/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
	/** @import { Batch } from './batch.js'; */
	/** @import { Boundary } from '../dom/blocks/boundary.js'; */

	/**
	 * This allows us to track 'reactivity loss' that occurs when signals
	 * are read after a non-context-restoring `await`. Dev-only
	 * @type {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null}
	 */
	let reactivity_loss_tracker = null;

	/** @param {{ effect: Effect, effect_deps: Set<Value>, warned: boolean } | null} v */
	function set_reactivity_loss_tracker(v) {
		reactivity_loss_tracker = v;
	}

	const recent_async_deriveds = new Set();

	/**
	 * @template V
	 * @param {() => V} fn
	 * @returns {Derived<V>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function derived(fn) {
		var flags = DERIVED | DIRTY;

		if (active_effect !== null) {
			// Since deriveds are evaluated lazily, any effects created inside them are
			// created too late to ensure that the parent effect is added to the tree
			active_effect.f |= EFFECT_PRESERVED;
		}

		/** @type {Derived<V>} */
		const signal = {
			ctx: component_context,
			deps: null,
			effects: null,
			equals,
			f: flags,
			fn,
			reactions: null,
			rv: 0,
			v: /** @type {V} */ (UNINITIALIZED),
			wv: 0,
			parent: active_effect,
			ac: null
		};

		if (DEV && tracing_mode_flag) {
			signal.created = get_error('created at');
		}

		return signal;
	}

	const OBSOLETE = Symbol('obsolete');

	/**
	 * @template V
	 * @param {() => V | Promise<V>} fn
	 * @param {string} [label]
	 * @param {string} [location] If provided, print a warning if the value is not read immediately after update
	 * @returns {Promise<Source<V>>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function async_derived(fn, label, location) {
		let parent = /** @type {Effect | null} */ (active_effect);

		if (parent === null) {
			async_derived_orphan();
		}

		var promise = /** @type {Promise<V>} */ (/** @type {unknown} */ (undefined));
		var signal = source(/** @type {V} */ (UNINITIALIZED));

		if (DEV) signal.label = label ?? fn.toString();

		// only suspend in async deriveds created on initialisation
		var should_suspend = !active_reaction;

		/** @type {Set<ReturnType<typeof deferred<V>>>} */
		var deferreds = new Set();

		async_effect(() => {
			var effect = /** @type {Effect} */ (active_effect);

			if (DEV) {
				reactivity_loss_tracker = { effect, effect_deps: new Set(), warned: false };
			}

			/** @type {ReturnType<typeof deferred<V>>} */
			var d = deferred();
			promise = d.promise;

			try {
				// If this code is changed at some point, make sure to still access the then property
				// of fn() to read any signals it might access, so that we track them as dependencies.
				// We call `unset_context` to undo any `save` calls that happen inside `fn()`
				Promise.resolve(fn())
					.then(d.resolve, (e) => {
						// if the promise was rejected by the user, via `getAbortSignal`, then
						// wait for a subsequent resolution instead of flushing the batch
						if (e !== STALE_REACTION) d.reject(e);
					})
					.finally(unset_context);
			} catch (error) {
				d.reject(error);
				unset_context();
			}

			if (DEV) {
				if (reactivity_loss_tracker) {
					// Reused deps from previous run (indices 0 to skipped_deps-1)
					// We deliberately only track direct dependencies of the async expression to encourage
					// dependencies being directly visible at the point of the expression
					if (effect.deps !== null) {
						for (let i = 0; i < skipped_deps; i += 1) {
							reactivity_loss_tracker.effect_deps.add(effect.deps[i]);
						}
					}

					// New deps discovered this run
					if (new_deps !== null) {
						for (let i = 0; i < new_deps.length; i += 1) {
							reactivity_loss_tracker.effect_deps.add(new_deps[i]);
						}
					}
				}

				reactivity_loss_tracker = null;
			}

			var batch = /** @type {Batch} */ (current_batch);

			if (should_suspend) {
				// we only increment the batch's pending state for updates, not creation, otherwise
				// we will decrement to zero before the work that depends on this promise (e.g. a
				// template effect) has initialized, causing the batch to resolve prematurely
				if ((effect.f & REACTION_RAN) !== 0) {
					var decrement_pending = increment_pending();
				}

				if (
					// boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
					parent.b?.is_rendered()
				) {
					batch.async_deriveds.get(effect)?.reject(OBSOLETE);
				} else {
					// While the boundary is still showing pending, a new run supersedes all older in-flight runs
					// for this async expression. Cancel eagerly so resolution cannot commit stale values.
					for (const d of deferreds.values()) {
						d.reject(OBSOLETE);
					}
				}

				deferreds.add(d);
				batch.async_deriveds.set(effect, d);
			}

			/**
			 * @param {any} value
			 * @param {unknown} error
			 */
			const handler = (value, error = undefined) => {
				if (DEV) {
					reactivity_loss_tracker = null;
				}

				decrement_pending?.();
				deferreds.delete(d);

				if (error === OBSOLETE) return;

				batch.activate();

				if (error) {
					signal.f |= ERROR_VALUE;

					// @ts-expect-error the error is the wrong type, but we don't care
					internal_set(signal, error);
				} else {
					if ((signal.f & ERROR_VALUE) !== 0) {
						signal.f ^= ERROR_VALUE;
					}

					if (DEV && location !== undefined && !signal.equals(value)) {
						recent_async_deriveds.add(signal);

						setTimeout(() => {
							if (recent_async_deriveds.has(signal) && (effect.f & DESTROYED) === 0) {
								await_waterfall(/** @type {string} */ (signal.label), location);
								recent_async_deriveds.delete(signal);
							}
						});
					}

					internal_set(signal, value);
				}

				batch.deactivate();
			};

			d.promise.then(handler, (e) => handler(null, e || 'unknown'));
		});

		teardown(() => {
			for (const d of deferreds) {
				d.reject(OBSOLETE);
			}
		});

		if (DEV) {
			// add a flag that lets this be printed as a derived
			// when using `$inspect.trace()`
			signal.f |= ASYNC;
		}

		return new Promise((fulfil) => {
			/** @param {Promise<V>} p */
			function next(p) {
				function go() {
					if (p === promise) {
						fulfil(signal);
					} else {
						// if the effect re-runs before the initial promise
						// resolves, delay resolution until we have a value
						next(promise);
					}
				}

				p.then(go, go);
			}

			next(promise);
		});
	}

	/**
	 * @template V
	 * @param {() => V} fn
	 * @returns {Derived<V>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function derived_safe_equal(fn) {
		const signal = derived(fn);
		signal.equals = safe_equals;
		return signal;
	}

	/**
	 * @param {Derived} derived
	 * @returns {void}
	 */
	function destroy_derived_effects(derived) {
		var effects = derived.effects;

		if (effects !== null) {
			derived.effects = null;

			for (var i = 0; i < effects.length; i += 1) {
				destroy_effect(/** @type {Effect} */ (effects[i]));
			}
		}
	}

	/**
	 * The currently updating deriveds, used to detect infinite recursion
	 * in dev mode and provide a nicer error than 'too much recursion'
	 * @type {Derived[]}
	 */
	let stack = [];

	/**
	 * @template T
	 * @param {Derived} derived
	 * @returns {T}
	 */
	function execute_derived(derived) {
		var value;
		var prev_active_effect = active_effect;
		var parent = derived.parent;

		if (
			!is_destroying_effect &&
			parent !== null &&
			derived.v !== UNINITIALIZED && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
			(parent.f & (DESTROYED | INERT)) !== 0
		) {
			derived_inert();

			return derived.v;
		}

		set_active_effect(parent);

		if (DEV) {
			let prev_eager_effects = eager_effects;
			set_eager_effects(new Set());
			try {
				if (includes.call(stack, derived)) {
					derived_references_self();
				}

				stack.push(derived);

				derived.f &= ~WAS_MARKED;
				destroy_derived_effects(derived);
				value = update_reaction(derived);
			} finally {
				set_active_effect(prev_active_effect);
				set_eager_effects(prev_eager_effects);
				stack.pop();
			}
		} else {
			try {
				derived.f &= ~WAS_MARKED;
				destroy_derived_effects(derived);
				value = update_reaction(derived);
			} finally {
				set_active_effect(prev_active_effect);
			}
		}

		return value;
	}

	/**
	 * @param {Derived} derived
	 * @returns {void}
	 */
	function update_derived(derived) {
		var value = execute_derived(derived);

		if (!derived.equals(value)) {
			derived.wv = increment_write_version();

			// in a fork, we don't update the underlying value, just `batch_values`.
			// the underlying value will be updated when the fork is committed.
			// otherwise, the next time we get here after a 'real world' state
			// change, `derived.equals` may incorrectly return `true`
			if (!current_batch?.is_fork || derived.deps === null) {
				if (current_batch !== null) {
					// We also write to previous_batch because if it exists, it is a sign that we're
					// currently in the process of flushing effects. These updates to deriveds may belong
					// to the previous batch, not the new one (which can already exist if an earlier
					// effect wrote to a source). This can cause bugs when running batch.#commit() later,
					// but not adding it to current_batch can, too, so we add it to both.
					// See https://github.com/sveltejs/svelte/pull/18117 for more details.
					current_batch.capture(derived, value, true);
					previous_batch?.capture(derived, value, true);
				} else {
					derived.v = value;
				}

				// deriveds without dependencies should never be recomputed
				if (derived.deps === null) {
					set_signal_status(derived, CLEAN);
					return;
				}
			}
		}

		// don't mark derived clean if we're reading it inside a
		// cleanup function, or it will cache a stale value
		if (is_destroying_effect) {
			return;
		}

		// During time traveling we don't want to reset the status so that
		// traversal of the graph in the other batches still happens
		if (batch_values !== null) {
			// only cache the value if we're in a tracking context, otherwise we won't
			// clear the cache in `mark_reactions` when dependencies are updated
			if (effect_tracking() || current_batch?.is_fork) {
				batch_values.set(derived, value);
			}
		} else {
			update_derived_status(derived);
		}
	}

	/**
	 * @param {Derived} derived
	 */
	function freeze_derived_effects(derived) {
		if (derived.effects === null) return;

		for (const e of derived.effects) {
			// if the effect has a teardown function or abort signal, call it
			if (e.teardown || e.ac) {
				e.teardown?.();
				if (e.ac !== null) {
					without_reactive_context(() => {
						/** @type {AbortController} */ (e.ac).abort(STALE_REACTION);
						e.ac = null;
					});
				}

				// make it a noop so it doesn't get called again if the derived
				// is unfrozen. we don't set it to `null`, because the existence
				// of a teardown function is what determines whether the
				// effect runs again during unfreezing (but not for teardown-only effects)
				if (e.fn !== null) e.teardown = noop;

				remove_reactions(e, 0);
				destroy_effect_children(e);
			}
		}
	}

	/**
	 * @param {Derived} derived
	 */
	function unfreeze_derived_effects(derived) {
		if (derived.effects === null) return;

		for (const e of derived.effects) {
			// if the effect was previously frozen — indicated by the presence
			// of a teardown function — unfreeze it
			if (e.teardown && e.fn !== null) {
				update_effect(e);
			}
		}
	}

	/** @import { Fork } from 'svelte' */
	/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */

	/** @type {Batch | null} */
	let first_batch = null;

	/** @type {Batch | null} */
	let last_batch = null;

	/** @type {Batch | null} */
	let current_batch = null;

	/**
	 * This is needed to avoid overwriting inputs
	 * @type {Batch | null}
	 */
	let previous_batch = null;

	/**
	 * When time travelling (i.e. working in one batch, while other batches
	 * still have ongoing work), we ignore the real values of affected
	 * signals in favour of their values within the batch
	 * @type {Map<Value, any> | null}
	 */
	let batch_values = null;

	/** @type {Effect | null} */
	let last_scheduled_effect = null;

	let is_flushing_sync = false;
	let is_processing = false;

	/**
	 * During traversal, this is an array. Newly created effects are (if not immediately
	 * executed) pushed to this array, rather than going through the scheduling
	 * rigamarole that would cause another turn of the flush loop.
	 * @type {Effect[] | null}
	 */
	let collected_effects = null;

	/**
	 * An array of effects that are marked during traversal as a result of a `set`
	 * (not `internal_set`) call. These will be added to the next batch and
	 * trigger another `batch.process()`
	 * @type {Effect[] | null}
	 * @deprecated when we get rid of legacy mode and stores, we can get rid of this
	 */
	let legacy_updates = null;

	var flush_count = 0;

	/** @type {Set<Value>} */
	var source_stacks = new Set();

	let uid = 1;

	class Batch {
		id = uid++;

		/** True as soon as `#process` was called */
		#started = false;

		linked = true;

		/** @type {Batch | null} */
		#prev = null;

		/** @type {Batch | null} */
		#next = null;

		/** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
		async_deriveds = new Map();

		/**
		 * The current values of any signals that are updated in this batch.
		 * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
		 * They keys of this map are identical to `this.#previous`
		 * @type {Map<Value, [any, boolean]>}
		 */
		current = new Map();

		/**
		 * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
		 * They keys of this map are identical to `this.#current`
		 * @type {Map<Value, any>}
		 */
		previous = new Map();

		/**
		 * When the batch is committed (and the DOM is updated), we need to remove old branches
		 * and append new ones by calling the functions added inside (if/each/key/etc) blocks
		 * @type {Set<(batch: Batch) => void>}
		 */
		#commit_callbacks = new Set();

		/**
		 * If a fork is discarded, we need to destroy any effects that are no longer needed
		 * @type {Set<(batch: Batch) => void>}
		 */
		#discard_callbacks = new Set();

		/**
		 * The number of async effects that are currently in flight
		 */
		#pending = 0;

		/**
		 * Async effects that are currently in flight, _not_ inside a pending boundary
		 * @type {Map<Effect, number>}
		 */
		#blocking_pending = new Map();

		/**
		 * A deferred that resolves when the batch is committed, used with `settled()`
		 * TODO replace with Promise.withResolvers once supported widely enough
		 * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
		 */
		#deferred = null;

		/**
		 * The root effects that need to be flushed
		 * @type {Effect[]}
		 */
		#roots = [];

		/**
		 * Effects created while this batch was active.
		 * @type {Effect[]}
		 */
		#new_effects = [];

		/**
		 * Deferred effects (which run after async work has completed) that are DIRTY
		 * @type {Set<Effect>}
		 */
		#dirty_effects = new Set();

		/**
		 * Deferred effects that are MAYBE_DIRTY
		 * @type {Set<Effect>}
		 */
		#maybe_dirty_effects = new Set();

		/**
		 * A map of branches that still exist, but will be destroyed when this batch
		 * is committed — we skip over these during `process`.
		 * The value contains child effects that were dirty/maybe_dirty before being reset,
		 * so they can be rescheduled if the branch survives.
		 * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
		 */
		#skipped_branches = new Map();

		/**
		 * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
		 * @type {Set<Effect>}
		 */
		#unskipped_branches = new Set();

		is_fork = false;

		#decrement_queued = false;

		constructor() {
			// link batch
			if (last_batch === null) {
				first_batch = last_batch = this;
			} else {
				last_batch.#next = this;
				this.#prev = last_batch;
			}

			last_batch = this;
		}

		#is_deferred() {
			if (this.is_fork) return true;

			for (const effect of this.#blocking_pending.keys()) {
				var e = effect;
				var skipped = false;

				while (e.parent !== null) {
					if (this.#skipped_branches.has(e)) {
						skipped = true;
						break;
					}

					e = e.parent;
				}

				if (!skipped) {
					return true;
				}
			}

			return false;
		}

		/**
		 * Add an effect to the #skipped_branches map and reset its children
		 * @param {Effect} effect
		 */
		skip_effect(effect) {
			if (!this.#skipped_branches.has(effect)) {
				this.#skipped_branches.set(effect, { d: [], m: [] });
			}
			this.#unskipped_branches.delete(effect);
		}

		/**
		 * Remove an effect from the #skipped_branches map and reschedule
		 * any tracked dirty/maybe_dirty child effects
		 * @param {Effect} effect
		 * @param {(e: Effect) => void} callback
		 */
		unskip_effect(effect, callback = (e) => this.schedule(e)) {
			var tracked = this.#skipped_branches.get(effect);
			if (tracked) {
				this.#skipped_branches.delete(effect);

				for (var e of tracked.d) {
					set_signal_status(e, DIRTY);
					callback(e);
				}

				for (e of tracked.m) {
					set_signal_status(e, MAYBE_DIRTY);
					callback(e);
				}
			}
			this.#unskipped_branches.add(effect);
		}

		#process() {
			this.#started = true;

			if (flush_count++ > 1000) {
				this.#unlink();
				infinite_loop_guard();
			}

			if (DEV) {
				// track all the values that were updated during this flush,
				// so that they can be reset afterwards
				for (const value of this.current.keys()) {
					source_stacks.add(value);
				}
			}

			// We always reschedule previously-deferred effects, not just when
			// #is_deferred() is true, because traversing the tree could make
			// an if block that contains the last blocking pending effect falsy,
			// causing the block to no longer be deferred.
			for (const e of this.#dirty_effects) {
				this.#maybe_dirty_effects.delete(e);
				set_signal_status(e, DIRTY);
				this.schedule(e);
			}

			for (const e of this.#maybe_dirty_effects) {
				set_signal_status(e, MAYBE_DIRTY);
				this.schedule(e);
			}

			const roots = this.#roots;
			this.#roots = [];

			this.apply();

			/** @type {Effect[]} */
			var effects = (collected_effects = []);

			/** @type {Effect[]} */
			var render_effects = [];

			/**
			 * @type {Effect[]}
			 * @deprecated when we get rid of legacy mode and stores, we can get rid of this
			 */
			var updates = (legacy_updates = []);

			for (const root of roots) {
				try {
					this.#traverse(root, effects, render_effects);
				} catch (e) {
					reset_all(root);
					// If there's no async work left, this branch is now dead and needs
					// to be discarded to not become a zombie that is never cleaned up.
					// See https://github.com/sveltejs/svelte/issues/18221#issuecomment-4497918414
					// for a (non-minimal) reproduction that demonstrates a case where this is necessary
					// to not get follow-up false-positives via "batch has scheduled roots" invariant errors.
					if (!this.#is_deferred()) this.discard();
					throw e;
				}
			}

			// any writes should take effect in a subsequent batch
			current_batch = null;

			if (updates.length > 0) {
				var batch = Batch.ensure();
				for (const e of updates) {
					batch.schedule(e);
				}
			}

			collected_effects = null;
			legacy_updates = null;

			// if the batch has outstanding pending work, stash effects and bail
			if (this.#is_deferred()) {
				this.#defer_effects(render_effects);
				this.#defer_effects(effects);

				for (const [e, t] of this.#skipped_branches) {
					reset_branch(e, t);
				}

				if (updates.length > 0) {
					/** @type {Batch} */ (/** @type {unknown} */ (current_batch)).#process();
				}

				return;
			}

			const earlier_batch = this.#find_earlier_batch();

			if (earlier_batch) {
				// If this batch collected deferred effects during traversal, they still need
				// to run after being merged into the earlier batch.
				this.#defer_effects(render_effects);
				this.#defer_effects(effects);
				earlier_batch.#merge(this);
				return;
			}

			// clear effects. Those that are still needed will be rescheduled through unskipping the skipped branches.
			this.#dirty_effects.clear();
			this.#maybe_dirty_effects.clear();

			// append/remove branches
			for (const fn of this.#commit_callbacks) fn(this);
			this.#commit_callbacks.clear();

			previous_batch = this;
			flush_queued_effects(render_effects);
			flush_queued_effects(effects);
			previous_batch = null;

			this.#deferred?.resolve();

			var next_batch = /** @type {Batch | null} */ (/** @type {unknown} */ (current_batch));

			if (this.#pending === 0 && (this.#roots.length === 0 || next_batch !== null)) {
				this.#unlink();
			}

			// Edge case: During traversal new branches might create effects that run immediately and set state,
			// causing an effect and therefore a root to be scheduled again. We need to traverse the current batch
			// once more in that case - most of the time this will just clean up dirty branches.
			if (this.#roots.length > 0) {
				if (next_batch !== null) {
					const batch = next_batch;
					batch.#roots.push(...this.#roots.filter((r) => !batch.#roots.includes(r)));
				} else {
					next_batch = this;
				}
			}

			if (next_batch !== null) {
				old_values.clear();
				next_batch.#process();
			}
		}

		/**
		 * Traverse the effect tree, executing effects or stashing
		 * them for later execution as appropriate
		 * @param {Effect} root
		 * @param {Effect[]} effects
		 * @param {Effect[]} render_effects
		 */
		#traverse(root, effects, render_effects) {
			root.f ^= CLEAN;

			var effect = root.first;

			while (effect !== null) {
				var flags = effect.f;
				var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
				var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

				var skip = is_skippable_branch || (flags & INERT) !== 0 || this.#skipped_branches.has(effect);

				if (!skip && effect.fn !== null) {
					if (is_branch) {
						effect.f ^= CLEAN;
					} else if ((flags & EFFECT) !== 0) {
						effects.push(effect);
					} else if (is_dirty(effect)) {
						if ((flags & BLOCK_EFFECT) !== 0) this.#maybe_dirty_effects.add(effect);
						update_effect(effect);
					}

					var child = effect.first;

					if (child !== null) {
						effect = child;
						continue;
					}
				}

				while (effect !== null) {
					var next = effect.next;

					if (next !== null) {
						effect = next;
						break;
					}

					effect = effect.parent;
				}
			}
		}

		#find_earlier_batch() {
			var batch = this.#prev;

			while (batch !== null) {
				if (!batch.is_fork) {
					// if the batches are connected, break
					for (const [value, [, is_derived]] of this.current) {
						if (batch.current.has(value) && !is_derived) {
							return batch;
						}
					}
				}

				batch = batch.#prev;
			}

			return null;
		}

		/**
		 * @param {Batch} batch
		 */
		#merge(batch) {
			for (const [source, value] of batch.current) {
				if (!this.previous.has(source) && batch.previous.has(source)) {
					this.previous.set(source, batch.previous.get(source));
				}

				this.current.set(source, value);
			}

			for (const [effect, deferred] of batch.async_deriveds) {
				const d = this.async_deriveds.get(effect);
				if (d) deferred.promise.then(d.resolve).catch(d.reject);
			}

			// Clear them or else those that are still pending might get rejected on discard (after merged-into batch is done).
			// This can happen when batch Y merged into X and Y has a pending boundary and therefore still-pending async deriveds inside.
			batch.async_deriveds.clear();

			// Mark is not guaranteed not touch these, so we transfer them
			this.transfer_effects(batch.#dirty_effects, batch.#maybe_dirty_effects);

			/**
			 * mark all effects that depend on `batch.current`, except the
			 * async effects that we just resolved (TODO unless they depend
			 * on values in this batch that are NOT in the later batch?).
			 * Through this we also will populate the correct #skipped_branches,
			 * oncommit callbacks etc, so we don't need to merge them separately.
			 * @param {Value} value
			 */
			const mark = (value) => {
				var reactions = value.reactions;
				if (reactions === null) return;
				// skip if value is derived and is neither dirty nor maybe dirty. transitive
				// deriveds (a derived depending on another derived) are only MAYBE_DIRTY, so
				// we must continue traversing them to reach the effects that depend on them
				if ((value.f & DERIVED) !== 0 && (value.f & (DIRTY | MAYBE_DIRTY)) === 0) {
					return;
				}

				for (const reaction of reactions) {
					var flags = reaction.f;

					if ((flags & DERIVED) !== 0) {
						mark(/** @type {Derived} */ (reaction));
					} else {
						var effect = /** @type {Effect} */ (reaction);

						if (flags & (ASYNC | BLOCK_EFFECT) && !this.async_deriveds.has(effect)) {
							this.#maybe_dirty_effects.delete(effect);
							set_signal_status(effect, DIRTY);
							this.schedule(effect);
						}
					}
				}
			};

			for (const source of this.current.keys()) {
				mark(source);
			}

			this.oncommit(() => batch.discard());
			batch.#unlink();

			current_batch = this;
			this.#process();
		}

		/**
		 * @param {Effect[]} effects
		 */
		#defer_effects(effects) {
			for (var i = 0; i < effects.length; i += 1) {
				defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
			}
		}

		/**
		 * Associate a change to a given source with the current
		 * batch, noting its previous and current values
		 * @param {Value} source
		 * @param {any} value
		 * @param {boolean} [is_derived]
		 */
		capture(source, value, is_derived = false) {
			if (source.v !== UNINITIALIZED && !this.previous.has(source)) {
				this.previous.set(source, source.v);
			}

			// Don't save errors in `batch_values`, or they won't be thrown in `runtime.js#get`
			if ((source.f & ERROR_VALUE) === 0) {
				this.current.set(source, [value, is_derived]);
				batch_values?.set(source, value);
			}

			if (!this.is_fork) {
				source.v = value;
			}
		}

		activate() {
			current_batch = this;
		}

		deactivate() {
			current_batch = null;
			batch_values = null;
		}

		flush() {
			try {
				if (DEV) {
					source_stacks.clear();
				}

				is_processing = true;
				current_batch = this;

				this.#process();
			} finally {
				flush_count = 0;
				last_scheduled_effect = null;
				collected_effects = null;
				legacy_updates = null;
				is_processing = false;

				current_batch = null;
				batch_values = null;

				old_values.clear();

				if (DEV) {
					for (const source of source_stacks) {
						source.updated = null;
					}
				}
			}
		}

		discard() {
			for (const fn of this.#discard_callbacks) fn(this);
			this.#discard_callbacks.clear();

			for (const deferred of this.async_deriveds.values()) {
				deferred.reject(OBSOLETE);
			}

			this.#unlink();
			this.#deferred?.resolve();
		}

		/**
		 * @param {Effect} effect
		 */
		register_created_effect(effect) {
			this.#new_effects.push(effect);
		}

		#commit() {
			// If there are other pending batches, they now need to be 'rebased' —
			// in other words, we re-run block/async effects with the newly
			// committed state, unless the batch in question has a more
			// recent value for a given source
			for (let batch = first_batch; batch !== null; batch = batch.#next) {
				var is_earlier = batch.id < this.id;

				/** @type {Source[]} */
				var sources = [];

				for (const [source, [value, is_derived]] of this.current) {
					if (batch.current.has(source)) {
						var batch_value = /** @type {[any, boolean]} */ (batch.current.get(source))[0]; // faster than destructuring

						if (is_earlier && value !== batch_value) {
							// bring the value up to date
							batch.current.set(source, [value, is_derived]);
						} else {
							// same value or later batch has more recent value,
							// no need to re-run these effects
							continue;
						}
					}

					sources.push(source);
				}

				if (is_earlier) {
					// TODO do we need to restart these in some cases, instead of
					// immediately resolving them? Likely not because of how this.apply() works.
					for (const [effect, deferred] of this.async_deriveds) {
						const d = batch.async_deriveds.get(effect);
						if (d) deferred.promise.then(d.resolve).catch(d.reject);
					}
				}

				var current = [...batch.current.keys()].filter(
					(source) => !(/** @type {[any, boolean]} */ (batch.current.get(source))[1])
				);

				// If not started yet or no sources to update (which is e.g. possible for the very first batch) then bail
				if (!batch.#started || current.length === 0) continue;

				// Re-run async/block effects that depend on distinct values changed in both batches (ignoring deriveds)
				var others = current.filter((source) => !this.current.has(source));

				if (others.length === 0) {
					if (is_earlier) {
						// this batch is now obsolete and can be discarded
						batch.discard();
					}
				} else if (sources.length > 0) {
					// The microtask queue can contain the batch already scheduled to run right
					// after this one is finished, so throwing the invariant would be wrong here.
					if (DEV && !batch.#decrement_queued) {
						invariant(batch.#roots.length === 0, 'Batch has scheduled roots');
					}

					// A batch was unskipped in a later batch -> tell prior batches to unskip it, too
					if (is_earlier) {
						for (const unskipped of this.#unskipped_branches) {
							batch.unskip_effect(unskipped, (e) => {
								if ((e.f & (BLOCK_EFFECT | ASYNC)) !== 0) {
									batch.schedule(e);
								} else {
									batch.#defer_effects([e]);
								}
							});
						}
					}

					batch.activate();

					/** @type {Set<Value>} */
					var marked = new Set();

					/** @type {Map<Reaction, boolean>} */
					var checked = new Map();

					for (var source of sources) {
						mark_effects(source, others, marked, checked);
					}

					checked = new Map();
					var current_unequal = [...batch.current]
						.filter(([c, v1]) => {
							const v2 = this.current.get(c);
							if (!v2) return true;
							// Either their values are different or one is a derived but not the other
							return v2[0] !== v1[0] || v2[1] !== v1[1];
						})
						.map(([c]) => c);

					if (current_unequal.length > 0) {
						for (const effect of this.#new_effects) {
							if (
								(effect.f & (DESTROYED | INERT | EAGER_EFFECT)) === 0 &&
								depends_on(effect, current_unequal, checked)
							) {
								if ((effect.f & (ASYNC | BLOCK_EFFECT)) !== 0) {
									set_signal_status(effect, DIRTY);
									batch.schedule(effect);
								} else {
									batch.#dirty_effects.add(effect);
								}
							}
						}
					}

					// Only apply and traverse when we know we triggered async work with marking the effects
					// and know this won't run anyway right afterwards
					if (batch.#roots.length > 0 && !batch.#decrement_queued) {
						batch.apply();

						for (var root of batch.#roots) {
							batch.#traverse(root, [], []);
						}

						batch.#roots = [];
					}

					batch.deactivate();
				}
			}
		}

		/**
		 * @param {boolean} blocking
		 * @param {Effect} effect
		 */
		increment(blocking, effect) {
			this.#pending += 1;

			if (blocking) {
				let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
				this.#blocking_pending.set(effect, blocking_pending_count + 1);
			}
		}

		/**
		 * @param {boolean} blocking
		 * @param {Effect} effect
		 */
		decrement(blocking, effect) {
			this.#pending -= 1;

			if (blocking) {
				let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;

				if (blocking_pending_count === 1) {
					this.#blocking_pending.delete(effect);
				} else {
					this.#blocking_pending.set(effect, blocking_pending_count - 1);
				}
			}

			if (this.#decrement_queued) return;
			this.#decrement_queued = true;

			queue_micro_task(() => {
				this.#decrement_queued = false;

				if (this.linked) {
					this.flush();
				}
			});
		}

		/**
		 * @param {Set<Effect>} dirty_effects
		 * @param {Set<Effect>} maybe_dirty_effects
		 */
		transfer_effects(dirty_effects, maybe_dirty_effects) {
			for (const e of dirty_effects) {
				this.#dirty_effects.add(e);
			}

			for (const e of maybe_dirty_effects) {
				this.#maybe_dirty_effects.add(e);
			}

			dirty_effects.clear();
			maybe_dirty_effects.clear();
		}

		/** @param {(batch: Batch) => void} fn */
		oncommit(fn) {
			this.#commit_callbacks.add(fn);
		}

		/** @param {(batch: Batch) => void} fn */
		ondiscard(fn) {
			this.#discard_callbacks.add(fn);
		}

		settled() {
			return (this.#deferred ??= deferred()).promise;
		}

		static ensure() {
			if (current_batch === null) {
				const batch = (current_batch = new Batch());

				if (!is_processing && !is_flushing_sync) {
					queue_micro_task(() => {
						if (!batch.#started) {
							batch.flush();
						}
					});
				}
			}

			return current_batch;
		}

		apply() {
			{
				batch_values = null;
				return;
			}
		}

		/**
		 *
		 * @param {Effect} effect
		 */
		schedule(effect) {
			last_scheduled_effect = effect;

			// defer render effects inside a pending boundary
			// TODO the `REACTION_RAN` check is only necessary because of legacy `$:` effects AFAICT — we can remove later
			if (
				effect.b?.is_pending &&
				(effect.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 &&
				(effect.f & REACTION_RAN) === 0
			) {
				effect.b.defer_effect(effect);
				return;
			}

			var e = effect;

			while (e.parent !== null) {
				e = e.parent;
				var flags = e.f;

				// if the effect is being scheduled because a parent (each/await/etc) block
				// updated an internal source, or because a branch is being unskipped,
				// bail out or we'll cause a second flush
				if (collected_effects !== null && e === active_effect) {

					// in sync mode, render effects run during traversal. in an extreme edge case
					// — namely that we're setting a value inside a derived read during traversal —
					// they can be made dirty after they have already been visited, in which
					// case we shouldn't bail out. we also shouldn't bail out if we're
					// updating a store inside a `$:`, since this might invalidate
					// effects that were already visited
					if (
						(active_reaction === null || (active_reaction.f & DERIVED) === 0) &&
						!legacy_is_updating_store
					) {
						return;
					}
				}

				if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
					if ((flags & CLEAN) === 0) {
						// branch is already dirty, bail
						return;
					}

					e.f ^= CLEAN;
				}
			}

			this.#roots.push(e);
		}

		#unlink() {
			// #merge calls #unlink, discard later on does it again - prevent
			// running it multiple times to not corrupt the linked list
			if (!this.linked) return;

			var prev = this.#prev;
			var next = this.#next;

			if (prev === null) {
				first_batch = next;
			} else {
				prev.#next = next;
			}

			if (next === null) {
				last_batch = prev;
			} else {
				next.#prev = prev;
			}

			this.linked = false;
		}
	}

	// TODO Svelte@6 think about removing the callback argument.
	/**
	 * Synchronously flush any pending updates.
	 * Returns void if no callback is provided, otherwise returns the result of calling the callback.
	 * @template [T=void]
	 * @param {(() => T) | undefined} [fn]
	 * @returns {T}
	 */
	function flushSync(fn) {
		var was_flushing_sync = is_flushing_sync;
		is_flushing_sync = true;

		try {
			var result;

			if (fn) {
				if (current_batch !== null && !current_batch.is_fork) {
					current_batch.flush();
				}

				result = fn();
			}

			while (true) {
				flush_tasks();

				if (current_batch === null) {
					return /** @type {T} */ (result);
				}

				current_batch.flush();
			}
		} finally {
			is_flushing_sync = was_flushing_sync;
		}
	}

	function infinite_loop_guard() {
		if (DEV) {
			var updates = new Map();

			for (const source of /** @type {Batch} */ (current_batch).current.keys()) {
				for (const [stack, update] of source.updated ?? []) {
					var entry = updates.get(stack);

					if (!entry) {
						entry = { error: update.error, count: 0 };
						updates.set(stack, entry);
					}

					entry.count += update.count;
				}
			}

			for (const update of updates.values()) {
				if (update.error) {
					// eslint-disable-next-line no-console
					console.error(update.error);
				}
			}
		}

		try {
			effect_update_depth_exceeded();
		} catch (error) {
			if (DEV) {
				// stack contains no useful information, replace it
				define_property(error, 'stack', { value: '' });
			}

			// Best effort: invoke the boundary nearest the most recent
			// effect and hope that it's relevant to the infinite loop
			invoke_error_boundary(error, last_scheduled_effect);
		}
	}

	/** @type {Set<Effect> | null} */
	let eager_block_effects = null;

	/**
	 * @param {Array<Effect>} effects
	 * @returns {void}
	 */
	function flush_queued_effects(effects) {
		var length = effects.length;
		if (length === 0) return;

		var i = 0;

		while (i < length) {
			var effect = effects[i++];

			if ((effect.f & (DESTROYED | INERT)) === 0 && is_dirty(effect)) {
				eager_block_effects = new Set();

				update_effect(effect);

				// Effects with no dependencies or teardown do not get added to the effect tree.
				// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
				// don't know if we need to keep them until they are executed. Doing the check
				// here (rather than in `update_effect`) allows us to skip the work for
				// immediate effects.
				if (
					effect.deps === null &&
					effect.first === null &&
					effect.nodes === null &&
					effect.teardown === null &&
					effect.ac === null
				) {
					// remove this effect from the graph
					unlink_effect(effect);
				}

				// If update_effect() has a flushSync() in it, we may have flushed another flush_queued_effects(),
				// which already handled this logic and did set eager_block_effects to null.
				if (eager_block_effects?.size > 0) {
					old_values.clear();

					for (const e of eager_block_effects) {
						// Skip eager effects that have already been unmounted
						if ((e.f & (DESTROYED | INERT)) !== 0) continue;

						// Run effects in order from ancestor to descendant, else we could run into nullpointers
						/** @type {Effect[]} */
						const ordered_effects = [e];
						let ancestor = e.parent;
						while (ancestor !== null) {
							if (eager_block_effects.has(ancestor)) {
								eager_block_effects.delete(ancestor);
								ordered_effects.push(ancestor);
							}
							ancestor = ancestor.parent;
						}

						for (let j = ordered_effects.length - 1; j >= 0; j--) {
							const e = ordered_effects[j];
							// Skip eager effects that have already been unmounted
							if ((e.f & (DESTROYED | INERT)) !== 0) continue;
							update_effect(e);
						}
					}

					eager_block_effects.clear();
				}
			}
		}

		eager_block_effects = null;
	}

	/**
	 * This is similar to `mark_reactions`, but it only marks async/block effects
	 * depending on `value` and at least one of the other `sources`, so that
	 * these effects can re-run after another batch has been committed
	 * @param {Value} value
	 * @param {Source[]} sources
	 * @param {Set<Value>} marked
	 * @param {Map<Reaction, boolean>} checked
	 */
	function mark_effects(value, sources, marked, checked) {
		if (marked.has(value)) return;
		marked.add(value);

		if (value.reactions !== null) {
			for (const reaction of value.reactions) {
				const flags = reaction.f;

				if ((flags & DERIVED) !== 0) {
					mark_effects(/** @type {Derived} */ (reaction), sources, marked, checked);
				} else if (
					(flags & (ASYNC | BLOCK_EFFECT)) !== 0 &&
					(flags & DIRTY) === 0 &&
					depends_on(reaction, sources, checked)
				) {
					set_signal_status(reaction, DIRTY);
					schedule_effect(/** @type {Effect} */ (reaction));
				}
			}
		}
	}

	/**
	 * @param {Reaction} reaction
	 * @param {Source[]} sources
	 * @param {Map<Reaction, boolean>} checked
	 */
	function depends_on(reaction, sources, checked) {
		const depends = checked.get(reaction);
		if (depends !== undefined) return depends;

		if (reaction.deps !== null) {
			for (const dep of reaction.deps) {
				if (includes.call(sources, dep)) {
					return true;
				}

				if ((dep.f & DERIVED) !== 0 && depends_on(/** @type {Derived} */ (dep), sources, checked)) {
					checked.set(/** @type {Derived} */ (dep), true);
					return true;
				}
			}
		}

		checked.set(reaction, false);

		return false;
	}

	/**
	 * @param {Effect} effect
	 * @returns {void}
	 */
	function schedule_effect(effect) {
		/** @type {Batch} */ (current_batch).schedule(effect);
	}

	/**
	 * Mark all the effects inside a skipped branch CLEAN, so that
	 * they can be correctly rescheduled later. Tracks dirty and maybe_dirty
	 * effects so they can be rescheduled if the branch survives.
	 * @param {Effect} effect
	 * @param {{ d: Effect[], m: Effect[] }} tracked
	 */
	function reset_branch(effect, tracked) {
		// clean branch = nothing dirty inside, no need to traverse further
		if ((effect.f & BRANCH_EFFECT) !== 0 && (effect.f & CLEAN) !== 0) {
			return;
		}

		if ((effect.f & DIRTY) !== 0) {
			tracked.d.push(effect);
		} else if ((effect.f & MAYBE_DIRTY) !== 0) {
			tracked.m.push(effect);
		}

		set_signal_status(effect, CLEAN);

		var e = effect.first;
		while (e !== null) {
			reset_branch(e, tracked);
			e = e.next;
		}
	}

	/**
	 * Mark an entire effect tree clean following an error
	 * @param {Effect} effect
	 */
	function reset_all(effect) {
		set_signal_status(effect, CLEAN);

		var e = effect.first;
		while (e !== null) {
			reset_all(e);
			e = e.next;
		}
	}

	/** @import { Derived, Effect, Source, Value } from '#client' */

	/** @type {Set<Effect>} */
	let eager_effects = new Set();

	/** @type {Map<Source, any>} */
	const old_values = new Map();

	/**
	 * @param {Set<any>} v
	 */
	function set_eager_effects(v) {
		eager_effects = v;
	}

	let eager_effects_deferred = false;

	function set_eager_effects_deferred() {
		eager_effects_deferred = true;
	}

	/**
	 * @template V
	 * @param {V} v
	 * @param {Error | null} [stack]
	 * @returns {Source<V>}
	 */
	// TODO rename this to `state` throughout the codebase
	function source(v, stack) {
		/** @type {Value} */
		var signal = {
			f: 0, // TODO ideally we could skip this altogether, but it causes type errors
			v,
			reactions: null,
			equals,
			rv: 0,
			wv: 0
		};

		if (DEV && tracing_mode_flag) {
			signal.created = stack ?? get_error('created at');
			signal.updated = null;
			signal.set_during_effect = false;
			signal.trace = null;
		}

		return signal;
	}

	/**
	 * @template V
	 * @param {V} v
	 * @param {Error | null} [stack]
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function state(v, stack) {
		const s = source(v, stack);

		push_reaction_value(s);

		return s;
	}

	/**
	 * @template V
	 * @param {V} initial_value
	 * @param {boolean} [immutable]
	 * @returns {Source<V>}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function mutable_source(initial_value, immutable = false, trackable = true) {
		const s = source(initial_value);
		if (!immutable) {
			s.equals = safe_equals;
		}

		// bind the signal to the component context, in case we need to
		// track updates to trigger beforeUpdate/afterUpdate callbacks
		if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
			(component_context.l.s ??= []).push(s);
		}

		return s;
	}

	/**
	 * @template V
	 * @param {Source<V>} source
	 * @param {V} value
	 * @param {boolean} [should_proxy]
	 * @returns {V}
	 */
	function set(source, value, should_proxy = false) {
		if (
			active_reaction !== null &&
			// since we are untracking the function inside `$inspect.with` we need to add this check
			// to ensure we error if state is set inside an inspect effect
			(!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) &&
			is_runes() &&
			(active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 &&
			(current_sources === null || !current_sources.has(source))
		) {
			state_unsafe_mutation();
		}

		let new_value = should_proxy ? proxy(value) : value;

		if (DEV) {
			tag_proxy(new_value, /** @type {string} */ (source.label));
		}

		return internal_set(source, new_value, legacy_updates);
	}

	/**
	 * @template V
	 * @param {Source<V>} source
	 * @param {V} value
	 * @param {Effect[] | null} [updated_during_traversal]
	 * @returns {V}
	 */
	function internal_set(source, value, updated_during_traversal = null) {
		if (!source.equals(value)) {
			if (is_destroying_effect) {
				old_values.set(source, value);
			} else if (!old_values.has(source)) {
				// only record the value from before the first write in this flush, otherwise a
				// teardown would see the value from before whichever write happened to be last
				old_values.set(source, source.v);
			}

			var batch = Batch.ensure();
			batch.capture(source, value);

			if (DEV) {
				if (active_effect !== null) {
					source.updated ??= new Map();

					// For performance reasons, when not using $inspect.trace, we only start collecting stack traces
					// after the same source has been updated more than 5 times in the same flush cycle.
					const count = (source.updated.get('')?.count ?? 0) + 1;
					source.updated.set('', { error: /** @type {any} */ (null), count });

					if (count > 5) {
						const error = get_error('updated at');

						if (error !== null) {
							let entry = source.updated.get(error.stack);

							if (!entry) {
								entry = { error, count: 0 };
								source.updated.set(error.stack, entry);
							}

							entry.count++;
						}
					}
				}

				if (active_effect !== null) {
					source.set_during_effect = true;
				}
			}

			if ((source.f & DERIVED) !== 0) {
				const derived = /** @type {Derived} */ (source);

				// if we are assigning to a dirty derived we set it to clean/maybe dirty but we also eagerly execute it to track the dependencies
				if ((source.f & DIRTY) !== 0) {
					execute_derived(derived);
				}

				// During time traveling we don't want to reset the status so that
				// traversal of the graph in the other batches still happens
				if (batch_values === null) {
					update_derived_status(derived);
				}
			}

			source.wv = increment_write_version();

			// For debugging, in case you want to know which reactions are being scheduled:
			// log_reactions(source);
			mark_reactions(source, DIRTY, updated_during_traversal);

			// It's possible that the current reaction might not have up-to-date dependencies
			// whilst it's actively running. So in the case of ensuring it registers the reaction
			// properly for itself, we need to ensure the current effect actually gets
			// scheduled. i.e: `$effect(() => x++)`
			if (
				is_runes() &&
				active_effect !== null &&
				(active_effect.f & CLEAN) !== 0 &&
				(active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0
			) {
				if (untracked_writes === null) {
					set_untracked_writes([source]);
				} else {
					untracked_writes.push(source);
				}
			}

			if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
				flush_eager_effects();
			}
		}

		return value;
	}

	function flush_eager_effects() {
		eager_effects_deferred = false;

		for (const effect of eager_effects) {
			// Mark clean inspect-effects as maybe dirty and then check their dirtiness
			// instead of just updating the effects - this way we avoid overfiring.
			if ((effect.f & CLEAN) !== 0) {
				set_signal_status(effect, MAYBE_DIRTY);
			}

			let dirty;

			try {
				dirty = is_dirty(effect);
			} catch {
				// Dirty-checking can evaluate derived dependencies and throw in cases where
				// parent effects are about to destroy this eager effect. Run the effect so
				// its own error handling can deal with transient failures.
				dirty = true;
			}

			if (dirty) {
				update_effect(effect);
			}
		}

		eager_effects.clear();
	}

	/**
	 * Silently (without using `get`) increment a source
	 * @param {Source<number>} source
	 */
	function increment(source) {
		set(source, source.v + 1);
	}

	/**
	 * @param {Value} signal
	 * @param {number} status should be DIRTY or MAYBE_DIRTY
	 * @param {Effect[] | null} updated_during_traversal
	 * @returns {void}
	 */
	function mark_reactions(signal, status, updated_during_traversal) {
		var reactions = signal.reactions;
		if (reactions === null) return;

		var runes = is_runes();
		var length = reactions.length;

		for (var i = 0; i < length; i++) {
			var reaction = reactions[i];
			var flags = reaction.f;

			// In legacy mode, skip the current effect to prevent infinite loops
			if (!runes && reaction === active_effect) continue;

			var not_dirty = (flags & DIRTY) === 0;

			// don't set a DIRTY reaction to MAYBE_DIRTY
			if (not_dirty) {
				set_signal_status(reaction, status);
			}

			if ((flags & EAGER_EFFECT) !== 0) {
				// Eager effects need to run immediately:
				// - for $inspect so that the stack trace makes sense
				// - for $state.eager because they might be without an effect parent
				eager_effects.add(/** @type {Effect} */ (reaction));
			} else if ((flags & DERIVED) !== 0) {
				var derived = /** @type {Derived} */ (reaction);

				batch_values?.delete(derived);

				if ((flags & WAS_MARKED) === 0) {
					// Only connected deriveds being executed outside the update cycle can be reliably unmarked right away
					if (
						flags & CONNECTED &&
						(active_effect === null || (active_effect.f & REACTION_IS_UPDATING) === 0)
					) {
						reaction.f |= WAS_MARKED;
					}

					mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
				}
			} else if (not_dirty) {
				var effect = /** @type {Effect} */ (reaction);

				if ((flags & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
					eager_block_effects.add(effect);
				}

				if (updated_during_traversal !== null) {
					updated_during_traversal.push(effect);
				} else {
					schedule_effect(effect);
				}
			}
		}
	}

	/** @import { Source } from '#client' */

	// TODO move all regexes into shared module?
	const regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

	/**
	 * @template T
	 * @param {T} value
	 * @returns {T}
	 */
	function proxy(value) {
		// if non-proxyable, a component instance, or already a proxy, return `value`
		if (
			typeof value !== 'object' ||
			value === null ||
			STATE_SYMBOL in value ||
			COMPONENT_SYMBOL in value
		) {
			return value;
		}

		const prototype = get_prototype_of(value);

		if (prototype !== object_prototype && prototype !== array_prototype) {
			return value;
		}

		/** @type {Map<any, Source<any>>} */
		var sources = new Map();
		var is_proxied_array = is_array(value);
		var version = state(0);

		var stack = DEV && tracing_mode_flag ? get_error('created at') : null;
		var parent_version = update_version;

		/**
		 * Executes the proxy in the context of the reaction it was originally created in, if any
		 * @template T
		 * @param {() => T} fn
		 */
		var with_parent = (fn) => {
			if (update_version === parent_version) {
				return fn();
			}

			// child source is being created after the initial proxy —
			// prevent it from being associated with the current reaction
			var reaction = active_reaction;
			var version = update_version;

			set_active_reaction(null);
			set_update_version(parent_version);

			var result = fn();

			set_active_reaction(reaction);
			set_update_version(version);

			return result;
		};

		if (is_proxied_array) {
			// We need to create the length source eagerly to ensure that
			// mutations to the array are properly synced with our proxy
			sources.set('length', state(/** @type {any[]} */ (value).length, stack));
			if (DEV) {
				value = /** @type {any} */ (inspectable_array(/** @type {any[]} */ (value)));
			}
		}

		/** Used in dev for $inspect.trace() */
		var path = '';
		let updating = false;
		/** @param {string} new_path */
		function update_path(new_path) {
			if (updating) return;
			updating = true;
			path = new_path;

			tag(version, `${path} version`);

			// rename all child sources and child proxies
			for (const [prop, source] of sources) {
				tag(source, get_label(path, prop));
			}
			updating = false;
		}

		return new Proxy(/** @type {any} */ (value), {
			defineProperty(_, prop, descriptor) {
				if (
					!('value' in descriptor) ||
					descriptor.configurable === false ||
					descriptor.enumerable === false ||
					descriptor.writable === false
				) {
					// we disallow non-basic descriptors, because unless they are applied to the
					// target object — which we avoid, so that state can be forked — we will run
					// afoul of the various invariants
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getOwnPropertyDescriptor#invariants
					state_descriptors_fixed();
				}
				var s = sources.get(prop);
				if (s === undefined) {
					with_parent(() => {
						var s = state(descriptor.value, stack);
						sources.set(prop, s);
						if (DEV && typeof prop === 'string') {
							tag(s, get_label(path, prop));
						}
						return s;
					});
				} else {
					set(s, descriptor.value, true);
				}

				return true;
			},

			deleteProperty(target, prop) {
				var s = sources.get(prop);

				if (s === undefined) {
					if (prop in target) {
						const s = with_parent(() => state(UNINITIALIZED, stack));
						sources.set(prop, s);
						increment(version);

						if (DEV) {
							tag(s, get_label(path, prop));
						}
					}
				} else {
					set(s, UNINITIALIZED);
					increment(version);
				}

				return true;
			},

			get(target, prop, receiver) {
				if (prop === STATE_SYMBOL) {
					return value;
				}

				if (DEV && prop === PROXY_PATH_SYMBOL) {
					return update_path;
				}

				var s = sources.get(prop);
				var exists = prop in target;

				// create a source, but only if it's an own property and not a prototype property
				if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
					s = with_parent(() => {
						var p = proxy(exists ? target[prop] : UNINITIALIZED);
						var s = state(p, stack);

						if (DEV) {
							tag(s, get_label(path, prop));
						}

						return s;
					});

					sources.set(prop, s);
				}

				if (s !== undefined) {
					var v = get(s);
					return v === UNINITIALIZED ? undefined : v;
				}

				return Reflect.get(target, prop, receiver);
			},

			getOwnPropertyDescriptor(target, prop) {
				var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

				if (descriptor && 'value' in descriptor) {
					var s = sources.get(prop);
					if (s) descriptor.value = get(s);
				} else if (descriptor === undefined) {
					var source = sources.get(prop);
					var value = source?.v;

					if (source !== undefined && value !== UNINITIALIZED) {
						return {
							enumerable: true,
							configurable: true,
							value,
							writable: true
						};
					}
				}

				return descriptor;
			},

			has(target, prop) {
				if (prop === STATE_SYMBOL) {
					return true;
				}

				var s = sources.get(prop);
				var has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);

				if (
					s !== undefined ||
					(active_effect !== null && (!has || get_descriptor(target, prop)?.writable))
				) {
					if (s === undefined) {
						s = with_parent(() => {
							var p = has ? proxy(target[prop]) : UNINITIALIZED;
							var s = state(p, stack);

							if (DEV) {
								tag(s, get_label(path, prop));
							}

							return s;
						});

						sources.set(prop, s);
					}

					var value = get(s);
					if (value === UNINITIALIZED) {
						return false;
					}
				}

				return has;
			},

			set(target, prop, value, receiver) {
				var s = sources.get(prop);
				var has = prop in target;

				// variable.length = value -> clear all signals with index >= value
				if (is_proxied_array && prop === 'length') {
					for (var i = value; i < /** @type {Source<number>} */ (s).v; i += 1) {
						var other_s = sources.get(i + '');
						if (other_s !== undefined) {
							set(other_s, UNINITIALIZED);
						} else if (i in target) {
							// If the item exists in the original, we need to create an uninitialized source,
							// else a later read of the property would result in a source being created with
							// the value of the original item at that index.
							other_s = with_parent(() => state(UNINITIALIZED, stack));
							sources.set(i + '', other_s);

							if (DEV) {
								tag(other_s, get_label(path, i));
							}
						}
					}
				}

				// If we haven't yet created a source for this property, we need to ensure
				// we do so otherwise if we read it later, then the write won't be tracked and
				// the heuristics of effects will be different vs if we had read the proxied
				// object property before writing to that property.
				if (s === undefined) {
					if (!has || get_descriptor(target, prop)?.writable) {
						s = with_parent(() => state(undefined, stack));

						if (DEV) {
							tag(s, get_label(path, prop));
						}
						set(s, proxy(value));

						sources.set(prop, s);
					}
				} else {
					has = s.v !== UNINITIALIZED;

					var p = with_parent(() => proxy(value));
					set(s, p);
				}

				var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

				// Set the new value before updating any signals so that any listeners get the new value
				if (descriptor?.set) {
					descriptor.set.call(receiver, value);
				}

				if (!has) {
					// If we have mutated an array directly, we might need to
					// signal that length has also changed. Do it before updating metadata
					// to ensure that iterating over the array as a result of a metadata update
					// will not cause the length to be out of sync.
					if (is_proxied_array && typeof prop === 'string') {
						var ls = /** @type {Source<number>} */ (sources.get('length'));
						var n = Number(prop);

						if (Number.isInteger(n) && n >= ls.v) {
							set(ls, n + 1);
						}
					}

					increment(version);
				}

				return true;
			},

			ownKeys(target) {
				get(version);

				var own_keys = Reflect.ownKeys(target).filter((key) => {
					var source = sources.get(key);
					return source === undefined || source.v !== UNINITIALIZED;
				});

				for (var [key, source] of sources) {
					if (source.v !== UNINITIALIZED && !(key in target)) {
						own_keys.push(key);
					}
				}

				return own_keys;
			},

			setPrototypeOf() {
				state_prototype_fixed();
			}
		});
	}

	/**
	 * @param {string} path
	 * @param {string | symbol} prop
	 */
	function get_label(path, prop) {
		if (typeof prop === 'symbol') return `${path}[Symbol(${prop.description ?? ''})]`;
		if (regex_is_valid_identifier.test(prop)) return `${path}.${prop}`;
		return /^\d+$/.test(prop) ? `${path}[${prop}]` : `${path}['${prop}']`;
	}

	/**
	 * @param {any} value
	 */
	function get_proxied_value(value) {
		try {
			if (value !== null && typeof value === 'object' && STATE_SYMBOL in value) {
				return value[STATE_SYMBOL];
			}
		} catch {
			// the above if check can throw an error if the value in question
			// is the contentWindow of an iframe on another domain, in which
			// case we want to just return the value (because it's definitely
			// not a proxied value) so we don't break any JavaScript interacting
			// with that iframe (such as various payment companies client side
			// JavaScript libraries interacting with their iframes on the same
			// domain)
		}

		return value;
	}

	const ARRAY_MUTATING_METHODS = new Set([
		'copyWithin',
		'fill',
		'pop',
		'push',
		'reverse',
		'shift',
		'sort',
		'splice',
		'unshift'
	]);

	/**
	 * Wrap array mutating methods so $inspect is triggered only once and
	 * to prevent logging an array in intermediate state (e.g. with an empty slot)
	 * @param {any[]} array
	 */
	function inspectable_array(array) {
		return new Proxy(array, {
			get(target, prop, receiver) {
				var value = Reflect.get(target, prop, receiver);
				if (!ARRAY_MUTATING_METHODS.has(/** @type {string} */ (prop))) {
					return value;
				}

				/**
				 * @this {any[]}
				 * @param {any[]} args
				 */
				return function (...args) {
					set_eager_effects_deferred();
					var result = value.apply(this, args);
					flush_eager_effects();
					return result;
				};
			}
		});
	}

	function init_array_prototype_warnings() {
		const array_prototype = Array.prototype;
		// The REPL ends up here over and over, and this prevents it from adding more and more patches
		// of the same kind to the prototype, which would slow down everything over time.
		// @ts-expect-error
		const cleanup = Array.__svelte_cleanup;
		if (cleanup) {
			cleanup();
		}

		const { indexOf, lastIndexOf, includes } = array_prototype;

		array_prototype.indexOf = function (item, from_index) {
			const index = indexOf.call(this, item, from_index);

			if (index === -1) {
				for (let i = from_index ?? 0; i < this.length; i += 1) {
					if (get_proxied_value(this[i]) === item) {
						state_proxy_equality_mismatch('array.indexOf(...)');
						break;
					}
				}
			}

			return index;
		};

		array_prototype.lastIndexOf = function (item, from_index) {
			// we need to specify this.length - 1 because it's probably using something like
			// `arguments` inside so passing undefined is different from not passing anything
			const index = lastIndexOf.call(this, item, from_index ?? this.length - 1);

			if (index === -1) {
				for (let i = 0; i <= (from_index ?? this.length - 1); i += 1) {
					if (get_proxied_value(this[i]) === item) {
						state_proxy_equality_mismatch('array.lastIndexOf(...)');
						break;
					}
				}
			}

			return index;
		};

		array_prototype.includes = function (item, from_index) {
			const has = includes.call(this, item, from_index);

			if (!has) {
				for (let i = 0; i < this.length; i += 1) {
					if (get_proxied_value(this[i]) === item) {
						state_proxy_equality_mismatch('array.includes(...)');
						break;
					}
				}
			}

			return has;
		};

		// @ts-expect-error
		Array.__svelte_cleanup = () => {
			array_prototype.indexOf = indexOf;
			array_prototype.lastIndexOf = lastIndexOf;
			array_prototype.includes = includes;
		};
	}

	/**
	 * @param {any} a
	 * @param {any} b
	 * @param {boolean} equal
	 * @returns {boolean}
	 */
	function strict_equals(a, b, equal = true) {
		// try-catch needed because this tries to read properties of `a` and `b`,
		// which could be disallowed for example in a secure context
		try {
			if ((a === b) !== (get_proxied_value(a) === get_proxied_value(b))) {
				state_proxy_equality_mismatch(equal ? '===' : '!==');
			}
		} catch {}

		return (a === b) === equal;
	}

	/** @import { Effect, TemplateNode } from '#client' */

	// export these for reference in the compiled code, making global name deduplication unnecessary
	/** @type {Window} */
	var $window;

	/** @type {boolean} */
	var is_firefox;

	/** @type {() => Node | null} */
	var first_child_getter;
	/** @type {() => Node | null} */
	var next_sibling_getter;

	/**
	 * Initialize these lazily to avoid issues when using the runtime in a server context
	 * where these globals are not available while avoiding a separate server entry point
	 */
	function init_operations() {
		if ($window !== undefined) {
			return;
		}

		$window = window;
		is_firefox = /Firefox/.test(navigator.userAgent);

		var element_prototype = Element.prototype;
		var node_prototype = Node.prototype;
		var text_prototype = Text.prototype;

		// @ts-ignore
		first_child_getter = get_descriptor(node_prototype, 'firstChild').get;
		// @ts-ignore
		next_sibling_getter = get_descriptor(node_prototype, 'nextSibling').get;

		if (is_extensible(element_prototype)) {
			// the following assignments improve perf of lookups on DOM nodes
			/** @type {any} */ (element_prototype)[CLASS_CACHE] = undefined;
			/** @type {any} */ (element_prototype)[ATTRIBUTES_CACHE] = null;
			/** @type {any} */ (element_prototype)[STYLE_CACHE] = undefined;
			// @ts-expect-error
			element_prototype.__e = undefined;
		}

		if (is_extensible(text_prototype)) {
			/** @type {any} */ (text_prototype)[TEXT_CACHE] = undefined;
		}

		if (DEV) {
			// @ts-expect-error
			element_prototype.__svelte_meta = null;

			init_array_prototype_warnings();
		}
	}

	/**
	 * @param {string} value
	 * @returns {Text}
	 */
	function create_text(value = '') {
		return document.createTextNode(value);
	}

	/**
	 * @template {Node} N
	 * @param {N} node
	 */
	/*@__NO_SIDE_EFFECTS__*/
	function get_first_child(node) {
		return /** @type {TemplateNode | null} */ (first_child_getter.call(node));
	}

	/**
	 * @template {Node} N
	 * @param {N} node
	 */
	/*@__NO_SIDE_EFFECTS__*/
	function get_next_sibling(node) {
		return /** @type {TemplateNode | null} */ (next_sibling_getter.call(node));
	}

	/**
	 * Don't mark this as side-effect-free, hydration needs to walk all nodes
	 * @template {Node} N
	 * @param {N} node
	 * @param {boolean} is_text
	 * @returns {TemplateNode | null}
	 */
	function child(node, is_text) {
		{
			return get_first_child(node);
		}
	}

	/**
	 * `child`, for the very common case of an element with exactly one child. Resetting the
	 * hydration cursor is part of the same step, so the compiler doesn't have to emit a
	 * separate `reset` call for every `<p>{text}</p>` in an app.
	 * Don't mark this as side-effect-free, hydration needs to walk all nodes
	 * @param {TemplateNode} node
	 * @param {boolean} [is_text]
	 * @returns {TemplateNode | null}
	 */
	function only_child(node, is_text = false) {
		{
			return get_first_child(node);
		}
	}

	/**
	 * Don't mark this as side-effect-free, hydration needs to walk all nodes
	 * @param {TemplateNode} node
	 * @param {number} count
	 * @param {boolean} is_text
	 * @returns {TemplateNode | null}
	 */
	function sibling(node, count = 1, is_text = false) {
		let next_sibling = node;

		while (count--) {
			next_sibling = /** @type {TemplateNode} */ (get_next_sibling(next_sibling));
		}

		{
			return next_sibling;
		}
	}

	/**
	 * @template {Node} N
	 * @param {N} node
	 * @returns {void}
	 */
	function clear_text_content(node) {
		node.textContent = '';
	}

	/**
	 * Returns `true` if we're updating the current block, for example `condition` in
	 * an `{#if condition}` block just changed. In this case, the branch should be
	 * appended (or removed) at the same time as other updates within the
	 * current `<svelte:boundary>`
	 */
	function should_defer_append() {
		return false;
	}

	/**
	 * Branching here is intentional and load-bearing for perf. `createElement(tag)`
	 * hits a fast path in Blink that `createElementNS(NAMESPACE_HTML, tag)` doesn't,
	 * and passing an explicit `undefined` as the trailing options arg measurably
	 * slows both APIs. Funnelling every case through a single `createElementNS(ns,
	 * tag, options)` call would be smaller but slower on the HTML path.
	 *
	 * @template {keyof HTMLElementTagNameMap | string} T
	 * @param {T} tag
	 * @param {string} [namespace]
	 * @param {string} [is]
	 * @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element}
	 */
	function create_element(tag, namespace, is) {
		if (namespace == null || namespace === NAMESPACE_HTML) {
			return /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */ (
				is ? document.createElement(tag, { is }) : document.createElement(tag)
			);
		}
		return /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */ (
			is ? document.createElementNS(namespace, tag, { is }) : document.createElementNS(namespace, tag)
		);
	}

	/** @import { Derived, Effect } from '#client' */
	/** @import { Boundary } from './dom/blocks/boundary.js' */

	const adjustments = new WeakMap();

	/**
	 * @param {unknown} error
	 */
	function handle_error(error) {
		var effect = active_effect;

		// for unowned deriveds, don't throw until we read the value
		if (effect === null) {
			/** @type {Derived} */ (active_reaction).f |= ERROR_VALUE;
			return error;
		}

		if (DEV && error instanceof Error && !adjustments.has(error)) {
			adjustments.set(error, get_adjustments(error, effect));
		}

		// if the error occurred while creating this subtree, we let it
		// bubble up until it hits a boundary that can handle it, unless
		// it's an $effect in which case it doesn't run immediately
		if ((effect.f & REACTION_RAN) === 0 && (effect.f & EFFECT) === 0) {
			if (DEV && !effect.parent && error instanceof Error) {
				apply_adjustments(error);
			}

			throw error;
		}

		// otherwise we bubble up the effect tree ourselves
		invoke_error_boundary(error, effect);
	}

	/**
	 * @param {unknown} error
	 * @param {Effect | null} effect
	 */
	function invoke_error_boundary(error, effect) {
		if (effect !== null && (effect.f & DESTROYED) !== 0) {
			return;
		}

		while (effect !== null) {
			// Skip boundaries that are destroyed/destroying and cannot meaningfully handle the error.
			if ((effect.f & BOUNDARY_EFFECT) !== 0 && (effect.f & (DESTROYED | DESTROYING)) === 0) {
				if ((effect.f & REACTION_RAN) === 0) {
					// we are still creating the boundary effect
					throw error;
				}

				try {
					/** @type {Boundary} */ (effect.b).error(error);
					return;
				} catch (e) {
					error = e;
				}
			}

			effect = effect.parent;
		}

		if (DEV && error instanceof Error) {
			apply_adjustments(error);
		}

		throw error;
	}

	/**
	 * Add useful information to the error message/stack in development
	 * @param {Error} error
	 * @param {Effect} effect
	 */
	function get_adjustments(error, effect) {
		const message_descriptor = get_descriptor(error, 'message');

		// if the message was already changed and it's not configurable we can't change it
		// or it will throw a different error swallowing the original error
		if (message_descriptor && !message_descriptor.configurable) return;

		var indent = is_firefox ? '  ' : '\t';
		var component_stack = `\n${indent}in ${effect.fn?.name || '<unknown>'}`;
		var context = effect.ctx;

		while (context !== null) {
			component_stack += `\n${indent}in ${context.function?.[FILENAME].split('/').pop()}`;
			context = context.p;
		}

		return {
			message: error.message + `\n${component_stack}\n`,
			stack: error.stack
				?.split('\n')
				.filter((line) => !line.includes('svelte/src/internal'))
				.join('\n')
		};
	}

	/**
	 * @param {Error} error
	 */
	function apply_adjustments(error) {
		const adjusted = adjustments.get(error);

		if (adjusted) {
			define_property(error, 'message', {
				value: adjusted.message
			});

			define_property(error, 'stack', {
				value: adjusted.stack
			});
		}
	}

	/** @import { Blocker, ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */

	/**
	 * @param {'$effect' | '$effect.pre' | '$inspect'} rune
	 */
	function validate_effect(rune) {
		if (active_effect === null) {
			if (active_reaction === null) {
				effect_orphan(rune);
			}

			effect_in_unowned_derived();
		}

		if (is_destroying_effect) {
			effect_in_teardown(rune);
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {Effect} parent_effect
	 */
	function push_effect(effect, parent_effect) {
		var parent_last = parent_effect.last;
		if (parent_last === null) {
			parent_effect.last = parent_effect.first = effect;
		} else {
			parent_last.next = effect;
			effect.prev = parent_last;
			parent_effect.last = effect;
		}
	}

	/**
	 * @param {number} type
	 * @param {null | (() => void | (() => void))} fn
	 * @returns {Effect}
	 */
	function create_effect(type, fn) {
		var parent = active_effect;

		if (DEV) {
			// Ensure the parent is never an inspect effect
			while (parent !== null && (parent.f & EAGER_EFFECT) !== 0) {
				parent = parent.parent;
			}
		}

		if (parent !== null && (parent.f & INERT) !== 0) {
			type |= INERT;
		}

		/** @type {Effect} */
		var effect = {
			ctx: component_context,
			deps: null,
			nodes: null,
			f: type | DIRTY | CONNECTED,
			first: null,
			fn,
			last: null,
			next: null,
			parent,
			b: parent && parent.b,
			prev: null,
			teardown: null,
			wv: 0,
			ac: null
		};

		if (DEV) {
			effect.component_function = dev_current_component_function;
		}

		current_batch?.register_created_effect(effect);

		/** @type {Effect | null} */
		var e = effect;

		if ((type & EFFECT) !== 0) {
			if (collected_effects !== null) {
				// created during traversal — collect and run afterwards
				collected_effects.push(effect);
			} else {
				// schedule for later
				Batch.ensure().schedule(effect);
			}
		} else if (fn !== null) {
			try {
				update_effect(effect);
			} catch (e) {
				destroy_effect(effect);
				throw e;
			}

			// if an effect doesn't need to be kept in the tree (because it
			// won't re-run, has no DOM, and has no teardown etc)
			// then we skip it and go to its child (if any)
			if (
				e.deps === null &&
				e.teardown === null &&
				e.nodes === null &&
				e.first === e.last && // either `null`, or a singular child
				(e.f & EFFECT_PRESERVED) === 0
			) {
				e = e.first;
				if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
					e.f |= EFFECT_TRANSPARENT;
				}
			}
		}

		if (e !== null) {
			e.parent = parent;

			if (parent !== null) {
				push_effect(e, parent);
			}

			// if we're in a derived, add the effect there too
			if (
				active_reaction !== null &&
				(active_reaction.f & DERIVED) !== 0 &&
				(type & ROOT_EFFECT) === 0
			) {
				var derived = /** @type {Derived} */ (active_reaction);
				(derived.effects ??= []).push(e);
			}
		}

		return effect;
	}

	/**
	 * Internal representation of `$effect.tracking()`
	 * @returns {boolean}
	 */
	function effect_tracking() {
		return active_reaction !== null && !untracking;
	}

	/**
	 * @param {() => void} fn
	 */
	function teardown(fn) {
		const effect = create_effect(RENDER_EFFECT, null);
		set_signal_status(effect, CLEAN);
		effect.teardown = fn;
		return effect;
	}

	/**
	 * Internal representation of `$effect(...)`
	 * @param {() => void | (() => void)} fn
	 */
	function user_effect(fn) {
		validate_effect('$effect');

		if (DEV) {
			define_property(fn, 'name', {
				value: '$effect'
			});
		}

		// Non-nested `$effect(...)` in a component should be deferred
		// until the component is mounted
		var flags = /** @type {Effect} */ (active_effect).f;
		var defer =
			!active_reaction &&
			(flags & BRANCH_EFFECT) !== 0 &&
			component_context !== null &&
			!component_context.i;

		if (defer) {
			// Top-level `$effect(...)` in an unmounted component — defer until mount
			var context = /** @type {ComponentContext} */ (component_context);
			(context.e ??= []).push(fn);
		} else {
			// Everything else — create immediately
			return create_user_effect(fn);
		}
	}

	/**
	 * @param {() => void | (() => void)} fn
	 */
	function create_user_effect(fn) {
		return create_effect(EFFECT | USER_EFFECT, fn);
	}

	/**
	 * An effect root whose children can transition out
	 * @param {() => void} fn
	 * @returns {(options?: { outro?: boolean }) => Promise<void>}
	 */
	function component_root(fn) {
		Batch.ensure();
		const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);

		return (options = {}) => {
			return new Promise((fulfil) => {
				if (options.outro) {
					pause_effect(effect, () => {
						destroy_effect(effect);
						fulfil(undefined);
					});
				} else {
					destroy_effect(effect);
					fulfil(undefined);
				}
			});
		};
	}

	/**
	 * @param {() => void | (() => void)} fn
	 * @returns {Effect}
	 */
	function async_effect(fn) {
		return create_effect(ASYNC | EFFECT_PRESERVED, fn);
	}

	/**
	 * @param {() => void | (() => void)} fn
	 * @returns {Effect}
	 */
	function render_effect(fn, flags = 0) {
		return create_effect(RENDER_EFFECT | flags, fn);
	}

	/**
	 * @param {(...expressions: any) => void | (() => void)} fn
	 * @param {Array<() => any>} sync
	 * @param {Array<() => Promise<any>>} async
	 * @param {Blocker[]} blockers
	 */
	function template_effect(fn, sync = [], async = [], blockers = []) {
		flatten(blockers, sync, async, (values) => {
			create_effect(RENDER_EFFECT, () => {
				fn(...values.map(get));
			});
		});
	}

	/**
	 * @param {(() => void)} fn
	 * @param {number} flags
	 */
	function block(fn, flags = 0) {
		var effect = create_effect(BLOCK_EFFECT | flags, fn);
		if (DEV) {
			effect.dev_stack = dev_stack;
		}
		return effect;
	}

	/**
	 * @param {(() => void)} fn
	 */
	function branch(fn) {
		return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn);
	}

	/**
	 * @param {Effect} effect
	 */
	function execute_effect_teardown(effect) {
		var teardown = effect.teardown;
		if (teardown !== null) {
			const previously_destroying_effect = is_destroying_effect;
			const previous_reaction = active_reaction;
			set_is_destroying_effect(true);
			set_active_reaction(null);
			try {
				teardown.call(null);
			} catch (error) {
				// Route teardown errors through the boundary system so that a live
				// ancestor <svelte:boundary> can handle them. Boundaries that are
				// themselves mid-teardown are skipped by invoke_error_boundary.
				invoke_error_boundary(error, effect.parent);
			} finally {
				set_is_destroying_effect(previously_destroying_effect);
				set_active_reaction(previous_reaction);
			}
		}
	}

	/**
	 * @param {Effect} signal
	 * @param {boolean} remove_dom
	 * @returns {void}
	 */
	function destroy_effect_children(signal, remove_dom = false) {
		var effect = signal.first;
		signal.first = signal.last = null;

		while (effect !== null) {
			const controller = effect.ac;

			if (controller !== null) {
				without_reactive_context(() => {
					controller.abort(STALE_REACTION);
				});
			}

			var next = effect.next;

			if ((effect.f & ROOT_EFFECT) !== 0) {
				// this is now an independent root
				effect.parent = null;
			} else {
				destroy_effect(effect, remove_dom);
			}

			effect = next;
		}
	}

	/**
	 * @param {Effect} signal
	 * @returns {void}
	 */
	function destroy_block_effect_children(signal) {
		var effect = signal.first;

		while (effect !== null) {
			var next = effect.next;
			if ((effect.f & BRANCH_EFFECT) === 0) {
				destroy_effect(effect);
			}
			effect = next;
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {boolean} [remove_dom]
	 * @returns {void}
	 */
	function destroy_effect(effect, remove_dom = true) {
		var removed = false;

		if (
			(remove_dom || (effect.f & HEAD_EFFECT) !== 0) &&
			effect.nodes !== null &&
			effect.nodes.end !== null
		) {
			remove_effect_dom(effect.nodes.start, /** @type {TemplateNode} */ (effect.nodes.end));
			removed = true;
		}

		effect.f |= DESTROYING;
		destroy_effect_children(effect, remove_dom && !removed);
		remove_reactions(effect, 0);

		var transitions = effect.nodes && effect.nodes.t;

		if (transitions !== null) {
			for (const transition of transitions) {
				transition.stop();
			}
		}

		execute_effect_teardown(effect);

		effect.f ^= DESTROYING;
		effect.f |= DESTROYED;

		var parent = effect.parent;

		// If the parent doesn't have any children, then skip this work altogether
		if (parent !== null && parent.first !== null) {
			unlink_effect(effect);
		}

		if (DEV) {
			effect.component_function = null;
		}

		// `first` and `child` are nulled out in destroy_effect_children
		// we don't null out `parent` so that error propagation can work correctly
		effect.next =
			effect.prev =
			effect.teardown =
			effect.ctx =
			effect.deps =
			effect.fn =
			effect.nodes =
			effect.ac =
			effect.b =
				null;
	}

	/**
	 *
	 * @param {TemplateNode | null} node
	 * @param {TemplateNode} end
	 */
	function remove_effect_dom(node, end) {
		while (node !== null) {
			/** @type {TemplateNode | null} */
			var next = node === end ? null : get_next_sibling(node);

			node.remove();
			node = next;
		}
	}

	/**
	 * Detach an effect from the effect tree, freeing up memory and
	 * reducing the amount of work that happens on subsequent traversals
	 * @param {Effect} effect
	 */
	function unlink_effect(effect) {
		var parent = effect.parent;
		var prev = effect.prev;
		var next = effect.next;

		if (prev !== null) prev.next = next;
		if (next !== null) next.prev = prev;

		if (parent !== null) {
			if (parent.first === effect) parent.first = next;
			if (parent.last === effect) parent.last = prev;
		}
	}

	/**
	 * When a block effect is removed, we don't immediately destroy it or yank it
	 * out of the DOM, because it might have transitions. Instead, we 'pause' it.
	 * It stays around (in memory, and in the DOM) until outro transitions have
	 * completed, and if the state change is reversed then we _resume_ it.
	 * A paused effect does not update, and the DOM subtree becomes inert.
	 * @param {Effect} effect
	 * @param {() => void} [callback]
	 * @param {boolean} [destroy]
	 */
	function pause_effect(effect, callback, destroy = true) {
		/** @type {TransitionManager[]} */
		var transitions = [];

		effect.f |= PAUSED;
		pause_children(effect, transitions, true);

		var fn = () => {
			if (destroy) destroy_effect(effect);
			if (callback) callback();
		};

		var remaining = transitions.length;
		if (remaining > 0) {
			var check = () => --remaining || fn();
			for (var transition of transitions) {
				transition.out(check);
			}
		} else {
			fn();
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {TransitionManager[]} transitions
	 * @param {boolean} local
	 */
	function pause_children(effect, transitions, local) {
		if ((effect.f & INERT) !== 0) return;
		effect.f ^= INERT;

		var t = effect.nodes && effect.nodes.t;

		if (t !== null) {
			for (const transition of t) {
				if (transition.is_global || local) {
					transitions.push(transition);
				}
			}
		}

		var child = effect.first;

		while (child !== null) {
			var sibling = child.next;

			// If this child is a root effect, then it will become an independent root when its parent
			// is destroyed, it should therefore not become inert nor partake in transitions.
			if ((child.f & ROOT_EFFECT) === 0) {
				var transparent =
					(child.f & EFFECT_TRANSPARENT) !== 0 ||
					// If this is a branch effect without a block effect parent,
					// it means the parent block effect was pruned. In that case,
					// transparency information was transferred to the branch effect.
					((child.f & BRANCH_EFFECT) !== 0 && (effect.f & BLOCK_EFFECT) !== 0);
				// TODO we don't need to call pause_children recursively with a linked list in place
				// it's slightly more involved though as we have to account for `transparent` changing
				// through the tree.
				pause_children(child, transitions, transparent ? local : false);
			}

			child = sibling;
		}
	}

	/**
	 * The opposite of `pause_effect`. We call this if (for example)
	 * `x` becomes falsy then truthy: `{#if x}...{/if}`
	 * @param {Effect} effect
	 */
	function resume_effect(effect) {
		effect.f &= ~PAUSED;
		resume_children(effect, true);
	}

	/**
	 * @param {Effect} effect
	 * @param {boolean} local
	 */
	function resume_children(effect, local) {
		// this subtree was paused for its own reasons (e.g. a block whose condition
		// is still false) — its controller will resume or destroy it
		if ((effect.f & PAUSED) !== 0) return;

		if ((effect.f & INERT) === 0) return;
		effect.f ^= INERT;

		// If a dependency of this effect changed while it was paused,
		// schedule the effect to update. we don't use `is_dirty`
		// here because we don't want to eagerly recompute a derived like
		// `{#if foo}{foo.bar()}{/if}` if `foo` is now `undefined
		if ((effect.f & CLEAN) === 0) {
			set_signal_status(effect, DIRTY);
			Batch.ensure().schedule(effect); // Assumption: This happens during the commit phase of the batch, causing another flush, but it's safe
		}

		var child = effect.first;

		while (child !== null) {
			var sibling = child.next;
			var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0;
			// TODO we don't need to call resume_children recursively with a linked list in place
			// it's slightly more involved though as we have to account for `transparent` changing
			// through the tree.
			resume_children(child, transparent ? local : false);
			child = sibling;
		}

		var t = effect.nodes && effect.nodes.t;

		if (t !== null) {
			for (const transition of t) {
				if (transition.is_global || local) {
					transition.in();
				}
			}
		}
	}

	/**
	 * @param {Effect} effect
	 * @param {DocumentFragment} fragment
	 */
	function move_effect(effect, fragment) {
		if (!effect.nodes) return;

		/** @type {TemplateNode | null} */
		var node = effect.nodes.start;
		var end = effect.nodes.end;

		while (node !== null) {
			/** @type {TemplateNode | null} */
			var next = node === end ? null : get_next_sibling(node);

			fragment.append(node);
			node = next;
		}
	}

	/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */

	/**
	 * True if updating in an effect context that is reactive (i.e. not branch/root effects)
	 */
	let is_updating_effect = false;

	let is_destroying_effect = false;

	/** @param {boolean} value */
	function set_is_destroying_effect(value) {
		is_destroying_effect = value;
	}

	/** @type {null | Reaction} */
	let active_reaction = null;

	let untracking = false;

	/** @param {null | Reaction} reaction */
	function set_active_reaction(reaction) {
		active_reaction = reaction;
	}

	/** @type {null | Effect} */
	let active_effect = null;

	/** @param {null | Effect} effect */
	function set_active_effect(effect) {
		active_effect = effect;
	}

	/**
	 * When sources are created within a reaction, reading and writing
	 * them within that reaction should not cause a re-run
	 * @type {null | Set<Source>}
	 */
	let current_sources = null;

	/** @param {Value} value */
	function push_reaction_value(value) {
		if (active_reaction !== null && (!async_mode_flag )) {
			(current_sources ??= new Set()).add(value);
		}
	}

	/**
	 * The dependencies of the reaction that is currently being executed. In many cases,
	 * the dependencies are unchanged between runs, and so this will be `null` unless
	 * and until a new dependency is accessed — we track this via `skipped_deps`
	 * @type {null | Value[]}
	 */
	let new_deps = null;

	let skipped_deps = 0;

	/**
	 * Tracks writes that the effect it's executed in doesn't listen to yet,
	 * so that the dependency can be added to the effect later on if it then reads it
	 * @type {null | Source[]}
	 */
	let untracked_writes = null;

	/** @param {null | Source[]} value */
	function set_untracked_writes(value) {
		untracked_writes = value;
	}

	/**
	 * @type {number} Used by sources and deriveds for handling updates.
	 * Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
	 **/
	let write_version = 1;

	/** @type {number} Used to version each read of a source of derived to avoid duplicating dependencies inside a reaction */
	let read_version = 0;

	let update_version = read_version;

	/** @param {number} value */
	function set_update_version(value) {
		update_version = value;
	}

	function increment_write_version() {
		return ++write_version;
	}

	/**
	 * Determines whether a derived or effect is dirty.
	 * If it is MAYBE_DIRTY, will set the status to CLEAN
	 * @param {Reaction} reaction
	 * @returns {boolean}
	 */
	function is_dirty(reaction) {
		var flags = reaction.f;

		if ((flags & DIRTY) !== 0) {
			return true;
		}

		if (flags & DERIVED) {
			reaction.f &= ~WAS_MARKED;
		}

		if ((flags & MAYBE_DIRTY) !== 0) {
			var dependencies = /** @type {Value[]} */ (reaction.deps);
			var length = dependencies.length;

			for (var i = 0; i < length; i++) {
				var dependency = dependencies[i];

				if (is_dirty(/** @type {Derived} */ (dependency))) {
					update_derived(/** @type {Derived} */ (dependency));
				}

				if (dependency.wv > reaction.wv) {
					return true;
				}
			}

			if (
				(flags & CONNECTED) !== 0 &&
				// During time traveling we don't want to reset the status so that
				// traversal of the graph in the other batches still happens
				batch_values === null
			) {
				set_signal_status(reaction, CLEAN);
			}
		}

		return false;
	}

	/**
	 * @param {Value} signal
	 * @param {Effect} effect
	 * @param {boolean} [root]
	 */
	function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
		var reactions = signal.reactions;
		if (reactions === null) return;

		if (current_sources !== null && current_sources.has(signal)) {
			return;
		}

		for (var i = 0; i < reactions.length; i++) {
			var reaction = reactions[i];

			if ((reaction.f & DERIVED) !== 0) {
				schedule_possible_effect_self_invalidation(/** @type {Derived} */ (reaction), effect, false);
			} else if (effect === reaction) {
				if (root) {
					set_signal_status(reaction, DIRTY);
				} else if ((reaction.f & CLEAN) !== 0) {
					set_signal_status(reaction, MAYBE_DIRTY);
				}
				schedule_effect(/** @type {Effect} */ (reaction));
			}
		}
	}

	/** @param {Reaction} reaction */
	function update_reaction(reaction) {
		var previous_deps = new_deps;
		var previous_skipped_deps = skipped_deps;
		var previous_untracked_writes = untracked_writes;
		var previous_reaction = active_reaction;
		var previous_sources = current_sources;
		var previous_component_context = component_context;
		var previous_untracking = untracking;
		var previous_update_version = update_version;

		var flags = reaction.f;

		new_deps = /** @type {null | Value[]} */ (null);
		skipped_deps = 0;
		untracked_writes = null;
		active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;

		current_sources = null;
		set_component_context(reaction.ctx);
		untracking = false;
		update_version = ++read_version;

		if (reaction.ac !== null) {
			without_reactive_context(() => {
				/** @type {AbortController} */ (reaction.ac).abort(STALE_REACTION);
			});

			reaction.ac = null;
		}

		try {
			reaction.f |= REACTION_IS_UPDATING;
			var fn = /** @type {Function} */ (reaction.fn);
			var result = fn();
			reaction.f |= REACTION_RAN;
			var deps = update_dependencies(reaction);

			// If we're inside an effect and we have untracked writes, then we need to
			// ensure that if any of those untracked writes result in re-invalidation
			// of the current effect, then that happens accordingly
			if (
				is_runes() &&
				untracked_writes !== null &&
				!untracking &&
				deps !== null &&
				(reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
			) {
				for (var i = 0; i < /** @type {Source[]} */ (untracked_writes).length; i++) {
					schedule_possible_effect_self_invalidation(
						untracked_writes[i],
						/** @type {Effect} */ (reaction)
					);
				}
			}

			// If we are returning to an previous reaction then
			// we need to increment the read version to ensure that
			// any dependencies in this reaction aren't marked with
			// the same version
			if (previous_reaction !== null && previous_reaction !== reaction) {
				read_version++;

				// update the `rv` of the previous reaction's deps — both existing and new —
				// so that they are not added again
				if (previous_reaction.deps !== null) {
					for (let i = 0; i < previous_skipped_deps; i += 1) {
						previous_reaction.deps[i].rv = read_version;
					}
				}

				if (previous_deps !== null) {
					for (const dep of previous_deps) {
						dep.rv = read_version;
					}
				}

				if (untracked_writes !== null) {
					if (previous_untracked_writes === null) {
						previous_untracked_writes = untracked_writes;
					} else {
						previous_untracked_writes.push(.../** @type {Source[]} */ (untracked_writes));
					}
				}
			}

			if ((reaction.f & ERROR_VALUE) !== 0) {
				reaction.f ^= ERROR_VALUE;
			}

			return result;
		} catch (error) {
			// still commit the deps read before the throw, otherwise deriveds connected by this run keep no reader and the reaction never re-runs when they change
			update_dependencies(reaction);

			return handle_error(error);
		} finally {
			reaction.f ^= REACTION_IS_UPDATING;
			new_deps = previous_deps;
			skipped_deps = previous_skipped_deps;
			untracked_writes = previous_untracked_writes;
			active_reaction = previous_reaction;
			current_sources = previous_sources;
			set_component_context(previous_component_context);
			untracking = previous_untracking;
			update_version = previous_update_version;
		}
	}

	/**
	 * @param {Reaction} reaction
	 */
	function update_dependencies(reaction) {
		var deps = reaction.deps;

		// Don't remove reactions during fork;
		// they must remain for when fork is discarded
		var is_fork = current_batch?.is_fork;

		if (new_deps !== null) {
			var i;

			if (!is_fork) {
				remove_reactions(reaction, skipped_deps);
			}

			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) {
					deps[skipped_deps + i] = new_deps[i];
				}
			} else {
				reaction.deps = deps = new_deps;
			}

			if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
				for (i = skipped_deps; i < deps.length; i++) {
					(deps[i].reactions ??= []).push(reaction);
				}
			}
		} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}

		return deps;
	}

	/**
	 * @template V
	 * @param {Reaction} signal
	 * @param {Value<V>} dependency
	 * @returns {void}
	 */
	function remove_reaction(signal, dependency) {
		let reactions = dependency.reactions;
		if (reactions !== null) {
			var index = index_of.call(reactions, signal);
			if (index !== -1) {
				var new_length = reactions.length - 1;
				if (new_length === 0) {
					reactions = dependency.reactions = null;
				} else {
					// Swap with last element and then remove.
					reactions[index] = reactions[new_length];
					reactions.pop();
				}
			}
		}

		// If the derived has no reactions, then we can disconnect it from the graph,
		// allowing it to either reconnect in the future, or be GC'd by the VM.
		if (
			reactions === null &&
			(dependency.f & DERIVED) !== 0 &&
			// Destroying a child effect while updating a parent effect can cause a dependency to appear
			// to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
			// allows us to skip the expensive work of disconnecting and immediately reconnecting it
			(new_deps === null || !includes.call(new_deps, dependency))
		) {
			var derived = /** @type {Derived} */ (dependency);

			// If we are working with a derived that is owned by an effect, then mark it as being
			// disconnected and remove the mark flag, as it cannot be reliably removed otherwise
			if ((derived.f & CONNECTED) !== 0) {
				derived.f ^= CONNECTED;
				derived.f &= ~WAS_MARKED;
			}

			// In a fork it's possible that a derived is executed and gets reactions, then commits, but is
			// never re-executed. This is possible when the derived is only executed once in the context
			// of a new branch which happens before fork.commit() runs. In this case, the derived still has
			// UNINITIALIZED as its value, and then when it's loosing its reactions we need to ensure it stays
			// DIRTY so it is reexecuted once someone wants its value again.
			if (derived.v !== UNINITIALIZED) {
				update_derived_status(derived);
			}

			// Call abort controller, noone's listening to this derived anymore
			if (derived.ac !== null) {
				without_reactive_context(() => {
					/** @type {AbortController} */ (derived.ac).abort(STALE_REACTION);
					derived.ac = null;
					// ensure it reruns right away next time instead of potentially returning a rejected promise as its value
					set_signal_status(derived, DIRTY);
				});
			}

			// freeze any effects inside this derived
			freeze_derived_effects(derived);

			// Disconnect any reactions owned by this reaction
			remove_reactions(derived, 0);
		}
	}

	/**
	 * @param {Reaction} signal
	 * @param {number} start_index
	 * @returns {void}
	 */
	function remove_reactions(signal, start_index) {
		var dependencies = signal.deps;
		if (dependencies === null) return;

		for (var i = start_index; i < dependencies.length; i++) {
			remove_reaction(signal, dependencies[i]);
		}
	}

	/**
	 * @param {Effect} effect
	 * @returns {void}
	 */
	function update_effect(effect) {
		var flags = effect.f;

		if ((flags & DESTROYED) !== 0) {
			return;
		}

		set_signal_status(effect, CLEAN);

		var previous_effect = active_effect;
		var was_updating_effect = is_updating_effect;

		active_effect = effect;
		is_updating_effect = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0; // Branch/root effects are not reactive contexts

		if (DEV) {
			var previous_component_fn = dev_current_component_function;
			set_dev_current_component_function(effect.component_function);
			var previous_stack = /** @type {any} */ (dev_stack);
			// only block effects have a dev stack, keep the current one otherwise
			set_dev_stack(effect.dev_stack ?? dev_stack);
		}

		try {
			if ((flags & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
				destroy_block_effect_children(effect);
			} else {
				destroy_effect_children(effect);
			}

			execute_effect_teardown(effect);
			var teardown = update_reaction(effect);
			effect.teardown = typeof teardown === 'function' ? teardown : null;
			effect.wv = write_version;

			// In DEV, increment versions of any sources that were written to during the effect,
			// so that they are correctly marked as dirty when the effect re-runs
			if (DEV && tracing_mode_flag && (effect.f & DIRTY) !== 0 && effect.deps !== null) {
				for (var dep of effect.deps) {
					if (dep.set_during_effect) {
						dep.wv = increment_write_version();
						dep.set_during_effect = false;
					}
				}
			}
		} finally {
			is_updating_effect = was_updating_effect;
			active_effect = previous_effect;

			if (DEV) {
				set_dev_current_component_function(previous_component_fn);
				set_dev_stack(previous_stack);
			}
		}
	}

	/**
	 * Returns a promise that resolves once any pending state changes have been applied.
	 * @returns {Promise<void>}
	 */
	async function tick() {

		await Promise.resolve();

		// By calling flushSync we guarantee that any pending state changes are applied after one tick.
		// TODO look into whether we can make flushing subsequent updates synchronously in the future.
		flushSync();
	}

	/**
	 * @template V
	 * @param {Value<V>} signal
	 * @returns {V}
	 */
	function get(signal) {
		var flags = signal.f;
		var is_derived = (flags & DERIVED) !== 0;

		// Register the dependency on the current reaction signal.
		if (active_reaction !== null && !untracking) {
			// if we're in a derived that is being read inside an _async_ derived,
			// it's possible that the effect was already destroyed. In this case,
			// we don't add the dependency, because that would create a memory leak
			var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;

			if (!destroyed && (current_sources === null || !current_sources.has(signal))) {
				var deps = active_reaction.deps;

				if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
					// we're in the effect init/update cycle
					if (signal.rv < read_version) {
						signal.rv = read_version;

						// If the signal is accessing the same dependencies in the same
						// order as it did last time, increment `skipped_deps`
						// rather than updating `new_deps`, which creates GC cost
						if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
							skipped_deps++;
						} else if (new_deps === null) {
							new_deps = [signal];
						} else {
							new_deps.push(signal);
						}
					}
				} else {
					// We're adding a dependency outside the init/update cycle (i.e. after an `await`).
					// We have to deduplicate deps/reactions in this case or remove_reactions could
					// disconnect deps/reactions that are actually still in use (if skip_deps says
					// "disconnect all after this index" and some of the signals are also present in
					// list prior to the cutoff index, i.e. that should be kept).
					active_reaction.deps ??= [];
					if (!includes.call(active_reaction.deps, signal)) {
						active_reaction.deps.push(signal);
					}

					var reactions = signal.reactions;

					if (reactions === null) {
						signal.reactions = [active_reaction];
					} else if (!includes.call(reactions, active_reaction)) {
						reactions.push(active_reaction);
					}
				}
			}
		}

		if (DEV) {
			if (
				!untracking &&
				reactivity_loss_tracker &&
				// By checking that current/previous batch are null we filter out false positives.
				// reactivity_loss_tracker is only reset after a microtask, so if a flush happens
				// before that, we get warnings for things we shouldn't warn on.
				current_batch === null &&
				previous_batch === null &&
				!reactivity_loss_tracker.warned &&
				(reactivity_loss_tracker.effect.f & REACTION_IS_UPDATING) === 0 &&
				!reactivity_loss_tracker.effect_deps.has(signal)
			) {
				reactivity_loss_tracker.warned = true;

				await_reactivity_loss(/** @type {string} */ (signal.label));

				var trace = get_error('traced at');
				// eslint-disable-next-line no-console
				if (trace) console.warn(trace);
			}

			recent_async_deriveds.delete(signal);
		}

		if (is_destroying_effect && old_values.has(signal)) {
			return old_values.get(signal);
		}

		if (is_derived) {
			var derived = /** @type {Derived} */ (signal);

			if (is_destroying_effect) {
				var value = derived.v;

				// if the derived is dirty and has reactions, or depends on the values that just changed, re-execute
				// (a derived can be maybe_dirty due to the effect destroy removing its last reaction)
				if (
					((derived.f & CLEAN) === 0 && derived.reactions !== null) ||
					depends_on_old_values(derived)
				) {
					value = execute_derived(derived);
				}

				old_values.set(derived, value);

				return value;
			}

			// connect disconnected deriveds if we are reading them inside an effect,
			// or inside another derived that is already connected
			var should_connect =
				(derived.f & CONNECTED) === 0 &&
				!untracking &&
				active_reaction !== null &&
				(is_updating_effect || (active_reaction.f & CONNECTED) !== 0);

			var is_new = (derived.f & REACTION_RAN) === 0;

			if (is_dirty(derived)) {
				if (should_connect) {
					// set the flag before `update_derived`, so that the derived
					// is added as a reaction to its dependencies
					derived.f |= CONNECTED;
				}

				update_derived(derived);
			}

			if (should_connect && !is_new) {
				unfreeze_derived_effects(derived);
				reconnect(derived);
			}
		}

		if (batch_values?.has(signal)) {
			return batch_values.get(signal);
		}

		if ((signal.f & ERROR_VALUE) !== 0) {
			throw signal.v;
		}

		return signal.v;
	}

	/**
	 * (Re)connect a disconnected derived, so that it is notified
	 * of changes in `mark_reactions`
	 * @param {Derived} derived
	 */
	function reconnect(derived) {
		derived.f |= CONNECTED;

		if (derived.deps === null) return;

		for (const dep of derived.deps) {
			(dep.reactions ??= []).push(derived);

			if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
				unfreeze_derived_effects(/** @type {Derived} */ (dep));
				reconnect(/** @type {Derived} */ (dep));
			}
		}
	}

	/** @param {Derived} derived */
	function depends_on_old_values(derived) {
		if (derived.v === UNINITIALIZED) return true; // we don't know, so assume the worst
		if (derived.deps === null) return false;

		for (const dep of derived.deps) {
			if (old_values.has(dep)) {
				return true;
			}

			if ((dep.f & DERIVED) !== 0 && depends_on_old_values(/** @type {Derived} */ (dep))) {
				return true;
			}
		}

		return false;
	}

	/**
	 * When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
	 * any state read inside `fn` will not be treated as a dependency.
	 *
	 * ```ts
	 * $effect(() => {
	 *   // this will run when `data` changes, but not when `time` changes
	 *   save(data, {
	 *     timestamp: untrack(() => time)
	 *   });
	 * });
	 * ```
	 * @template T
	 * @param {() => T} fn
	 * @returns {T}
	 */
	function untrack(fn) {
		var previous_untracking = untracking;
		try {
			untracking = true;
			return fn();
		} finally {
			untracking = previous_untracking;
		}
	}

	/**
	 * Subset of delegated events which should be passive by default.
	 * These two are already passive via browser defaults on window, document and body.
	 * But since
	 * - we're delegating them
	 * - they happen often
	 * - they apply to mobile which is generally less performant
	 * we're marking them as passive by default for other elements, too.
	 */
	const PASSIVE_EVENTS = ['touchstart', 'touchmove'];

	/**
	 * Returns `true` if `name` is a passive event
	 * @param {string} name
	 */
	function is_passive_event(name) {
		return PASSIVE_EVENTS.includes(name);
	}

	/** @import { SourceLocation } from '#client' */

	/**
	 * @param {any} fn
	 * @param {string} filename
	 * @param {SourceLocation[]} locations
	 * @returns {any}
	 */
	function add_locations(fn, filename, locations) {
		return (/** @type {any[]} */ ...args) => {
			const dom = fn(...args);

			var node = dom.nodeType === DOCUMENT_FRAGMENT_NODE ? dom.firstChild : dom;
			assign_locations(node, filename, locations);

			return dom;
		};
	}

	/**
	 * @param {Element} element
	 * @param {string} filename
	 * @param {SourceLocation} location
	 */
	function assign_location(element, filename, location) {
		// @ts-expect-error
		element.__svelte_meta = {
			parent: dev_stack,
			loc: { file: filename, line: location[0], column: location[1] }
		};

		if (location[2]) {
			assign_locations(element.firstChild, filename, location[2]);
		}
	}

	/**
	 * @param {Node | null} node
	 * @param {string} filename
	 * @param {SourceLocation[]} locations
	 */
	function assign_locations(node, filename, locations) {
		var i = 0;

		while (node && i < locations.length) {

			if (node.nodeType === ELEMENT_NODE) {
				assign_location(/** @type {Element} */ (node), filename, locations[i++]);
			}

			node = node.nextSibling;
		}
	}

	/**
	 * Used on elements, as a map of event type -> event handler,
	 * and on events themselves to track which element handled an event
	 */
	const event_symbol = Symbol('events');

	/** @type {Set<string>} */
	const all_registered_events = new Set();

	/** @type {Set<(events: Array<string>) => void>} */
	const root_event_handles = new Set();

	/**
	 * @param {string} event_name
	 * @param {EventTarget} dom
	 * @param {EventListener} [handler]
	 * @param {AddEventListenerOptions} [options]
	 */
	function create_event(event_name, dom, handler, options = {}) {
		/**
		 * @this {EventTarget}
		 */
		function target_handler(/** @type {Event} */ event) {
			if (!options.capture) {
				// Only call in the bubble phase, else delegated events would be called before the capturing events
				handle_event_propagation.call(dom, event);
			}
			if (!event.cancelBubble) {
				return without_reactive_context(() => {
					return handler?.call(this, event);
				});
			}
		}

		// Chrome has a bug where pointer events don't work when attached to a DOM element that has been cloned
		// with cloneNode() and the DOM element is disconnected from the document. To ensure the event works, we
		// defer the attachment till after it's been appended to the document. TODO: remove this once Chrome fixes
		// this bug. The same applies to wheel events and touch events.
		if (
			event_name.startsWith('pointer') ||
			event_name.startsWith('touch') ||
			event_name === 'wheel'
		) {
			queue_micro_task(() => {
				dom.addEventListener(event_name, target_handler, options);
			});
		} else {
			dom.addEventListener(event_name, target_handler, options);
		}

		return target_handler;
	}

	/**
	 * @param {string} event_name
	 * @param {Element} dom
	 * @param {EventListener} [handler]
	 * @param {boolean} [capture]
	 * @param {boolean} [passive]
	 * @returns {void}
	 */
	function event(event_name, dom, handler, capture, passive) {
		var options = { capture, passive };
		var target_handler = create_event(event_name, dom, handler, options);

		if (
			dom === document.body ||
			// @ts-ignore
			dom === window ||
			// @ts-ignore
			dom === document ||
			// Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
			dom instanceof HTMLMediaElement
		) {
			teardown(() => {
				dom.removeEventListener(event_name, target_handler, options);
			});
		}
	}

	/**
	 * @param {string} event_name
	 * @param {Element} element
	 * @param {EventListener} [handler]
	 * @returns {void}
	 */
	function delegated(event_name, element, handler) {
		// @ts-expect-error
		(element[event_symbol] ??= {})[event_name] = handler;
	}

	/**
	 * @param {Array<string>} events
	 * @returns {void}
	 */
	function delegate(events) {
		for (var i = 0; i < events.length; i++) {
			all_registered_events.add(events[i]);
		}

		for (var fn of root_event_handles) {
			fn(events);
		}
	}

	// used to store the reference to the currently propagated event
	// to prevent garbage collection between microtasks in Firefox (<= 141)
	// If the event object is GCed too early, the expando __root property
	// set on the event object is lost, causing the event delegation
	// to process the event twice
	let last_propagated_event = null;

	// whether a task is already queued to clear `last_propagated_event`
	let last_propagated_event_clear_scheduled = false;

	/**
	 * @this {EventTarget}
	 * @param {Event} event
	 * @returns {void}
	 */
	function handle_event_propagation(event) {
		var handler_element = this;
		var owner_document = /** @type {Node} */ (handler_element).ownerDocument;
		var event_name = event.type;
		var path = event.composedPath?.() || [];
		var current_target = /** @type {null | Element} */ (path[0] || event.target);

		last_propagated_event = event;

		// The reference is only needed while the event can still reach another
		// delegated root, i.e. during the current (synchronous) dispatch and its
		// microtask checkpoints. Clearing it in a later task preserves the
		// Firefox workaround while making sure the slot doesn't retain the last
		// event forever — through `event.target` it would otherwise keep the
		// entire detached subtree of whatever the user last clicked in alive
		// until the next delegated event happens to arrive.
		if (!last_propagated_event_clear_scheduled) {
			last_propagated_event_clear_scheduled = true;
			setTimeout(() => {
				last_propagated_event_clear_scheduled = false;
				last_propagated_event = null;
			});
		}

		// composedPath contains list of nodes the event has propagated through.
		// We check `event_symbol` to skip all nodes below it in case this is a
		// parent of the `event_symbol` node, which indicates that there's nested
		// mounted apps. In this case we don't want to trigger events multiple times.
		var path_idx = 0;

		// the `last_propagated_event === event` check is redundant, but
		// without it the variable will be DCE'd and things will
		// fail mysteriously in Firefox
		// @ts-expect-error is added below
		var handled_at = last_propagated_event === event && event[event_symbol];

		if (handled_at) {
			var at_idx = path.indexOf(handled_at);
			if (
				at_idx !== -1 &&
				(handler_element === document || handler_element === /** @type {any} */ (window))
			) {
				// This is the fallback document listener or a window listener, but the event was already handled
				// -> ignore, but set handle_at to document/window so that we're resetting the event
				// chain in case someone manually dispatches the same event object again.
				// @ts-expect-error
				event[event_symbol] = handler_element;
				return;
			}

			// We're deliberately not skipping if the index is higher, because
			// someone could create an event programmatically and emit it multiple times,
			// in which case we want to handle the whole propagation chain properly each time.
			// (this will only be a false negative if the event is dispatched multiple times and
			// the fallback document listener isn't reached in between, but that's super rare)
			var handler_idx = path.indexOf(handler_element);
			if (handler_idx === -1) {
				// handle_idx can theoretically be -1 (happened in some JSDOM testing scenarios with an event listener on the window object)
				// so guard against that, too, and assume that everything was handled at this point.
				return;
			}

			if (at_idx <= handler_idx) {
				path_idx = at_idx;
			}
		}

		current_target = /** @type {Element} */ (path[path_idx] || event.target);
		// there can only be one delegated event per element, and we either already handled the current target,
		// or this is the very first target in the chain which has a non-delegated listener, in which case it's safe
		// to handle a possible delegated event on it later (through the root delegation listener for example).
		if (current_target === handler_element) return;

		// Proxy currentTarget to correct target
		define_property(event, 'currentTarget', {
			configurable: true,
			get() {
				return current_target || owner_document;
			}
		});

		// This started because of Chromium issue https://chromestatus.com/feature/5128696823545856,
		// where removal or moving of the DOM can cause sync `blur` events to fire, which can cause logic
		// to run inside the current `active_reaction`, which isn't what we want at all. However, on reflection,
		// it's probably best that all events handled by Svelte have this behaviour, as we don't really want
		// an event handler to run in the context of another reaction or effect.
		var previous_reaction = active_reaction;
		var previous_effect = active_effect;
		set_active_reaction(null);
		set_active_effect(null);

		try {
			/**
			 * @type {unknown}
			 */
			var throw_error;
			/**
			 * @type {unknown[]}
			 */
			var other_errors = [];

			while (current_target !== null) {
				if (current_target === handler_element) break;

				try {
					// @ts-expect-error
					var delegated = current_target[event_symbol]?.[event_name];

					if (
						delegated != null &&
						(!(/** @type {any} */ (current_target).disabled) ||
							// DOM could've been updated already by the time this is reached, so we check this as well
							// -> the target could not have been disabled because it emits the event in the first place
							event.target === current_target)
					) {
						delegated.call(current_target, event);
					}
				} catch (error) {
					if (throw_error) {
						other_errors.push(error);
					} else {
						throw_error = error;
					}
				}
				if (event.cancelBubble) break;

				path_idx++;
				current_target = path_idx < path.length ? /** @type {Element} */ (path[path_idx]) : null;
			}

			if (throw_error) {
				for (let error of other_errors) {
					// Throw the rest of the errors, one-by-one on a microtask
					queueMicrotask(() => {
						throw error;
					});
				}
				throw throw_error;
			}
		} finally {
			// @ts-expect-error is used above
			event[event_symbol] = handler_element;
			// @ts-ignore remove proxy on currentTarget
			delete event.currentTarget;
			set_active_reaction(previous_reaction);
			set_active_effect(previous_effect);
		}
	}

	const policy =
		// We gotta write it like this because after downleveling the pure comment may end up in the wrong location
		globalThis?.window?.trustedTypes &&
		/* @__PURE__ */ globalThis.window.trustedTypes.createPolicy('svelte-trusted-html', {
			/** @param {string} html */
			createHTML: (html) => {
				return html;
			}
		});

	/** @param {string} html */
	function create_trusted_html(html) {
		return /** @type {string} */ (policy?.createHTML(html) ?? html);
	}

	/**
	 * @param {string} html
	 */
	function create_fragment_from_html(html) {
		var elem = create_element('template');
		elem.innerHTML = create_trusted_html(html.replaceAll('<!>', '<!---->')); // XHTML compliance
		return elem.content;
	}

	/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
	/** @import { TemplateStructure } from './types' */

	/**
	 * @param {TemplateNode} start
	 * @param {TemplateNode | null} end
	 */
	function assign_nodes(start, end) {
		var effect = /** @type {Effect} */ (active_effect);
		if (effect.nodes === null) {
			effect.nodes = { start, end, a: null, t: null };
		}
	}

	/**
	 * @param {string} content
	 * @param {number} flags
	 * @returns {() => Node | Node[]}
	 */
	/*#__NO_SIDE_EFFECTS__*/
	function from_html(content, flags) {
		var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
		var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;

		/** @type {Node} */
		var node;

		/**
		 * Whether or not the first item is a text/element node. If not, we need to
		 * create an additional comment node to act as `effect.nodes.start`
		 */
		var has_start = !content.startsWith('<!>');

		return () => {

			if (node === undefined) {
				node = create_fragment_from_html(has_start ? content : '<!>' + content);
				if (!is_fragment) node = /** @type {TemplateNode} */ (get_first_child(node));
			}

			var clone = /** @type {TemplateNode} */ (
				use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
			);

			if (is_fragment) {
				var start = /** @type {TemplateNode} */ (get_first_child(clone));
				var end = /** @type {TemplateNode} */ (clone.lastChild);

				assign_nodes(start, end);
			} else {
				assign_nodes(clone, clone);
			}

			return clone;
		};
	}

	/**
	 * Assign the created (or in hydration mode, traversed) dom elements to the current block
	 * and insert the elements into the dom (in client mode).
	 * @param {Text | Comment | Element} anchor
	 * @param {DocumentFragment | Element} dom
	 */
	function append(anchor, dom) {

		if (anchor === null) {
			// edge case — void `<svelte:element>` with content
			return;
		}

		anchor.before(/** @type {Node} */ (dom));
	}

	/**
	 * Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
	 * It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
	 *
	 * If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
	 * the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
	 *
	 * If `start` returns a cleanup function, it will be called when the effect is destroyed.
	 *
	 * If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
	 * are active, and the returned teardown function will only be called when all effects are destroyed.
	 *
	 * It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
	 *
	 * ```js
	 * import { createSubscriber } from 'svelte/reactivity';
	 * import { on } from 'svelte/events';
	 *
	 * export class MediaQuery {
	 * 	#query;
	 * 	#subscribe;
	 *
	 * 	constructor(query) {
	 * 		this.#query = window.matchMedia(`(${query})`);
	 *
	 * 		this.#subscribe = createSubscriber((update) => {
	 * 			// when the `change` event occurs, re-run any effects that read `this.current`
	 * 			const off = on(this.#query, 'change', update);
	 *
	 * 			// stop listening when all the effects are destroyed
	 * 			return () => off();
	 * 		});
	 * 	}
	 *
	 * 	get current() {
	 * 		// This makes the getter reactive, if read in an effect
	 * 		this.#subscribe();
	 *
	 * 		// Return the current state of the query, whether or not we're in an effect
	 * 		return this.#query.matches;
	 * 	}
	 * }
	 * ```
	 * @param {(update: () => void) => (() => void) | void} start
	 * @since 5.7.0
	 */
	function createSubscriber(start) {
		let subscribers = 0;
		let version = source(0);
		/** @type {(() => void) | void} */
		let stop;

		if (DEV) {
			tag(version, 'createSubscriber version');
		}

		return () => {
			if (effect_tracking()) {
				get(version);

				render_effect(() => {
					if (subscribers === 0) {
						stop = untrack(() => start(() => increment(version)));
					}

					subscribers += 1;

					return () => {
						queue_micro_task(() => {
							// Only count down after a microtask, else we would reach 0 before our own render effect reruns,
							// but reach 1 again when the tick callback of the prior teardown runs. That would mean we
							// re-subcribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
							subscribers -= 1;

							if (subscribers === 0) {
								stop?.();
								stop = undefined;
								// Increment the version to ensure any dependent deriveds are marked dirty when the subscription is picked up again later.
								// If we didn't do this then the comparison of write versions would determine that the derived has a later version than
								// the subscriber, and it would not be re-run.
								increment(version);
							}
						});
					};
				});
			}
		};
	}

	/** @import { Effect, Source, TemplateNode, } from '#client' */

	/**
	 * @typedef {{
	 * 	 onerror?: ((error: unknown, reset: () => void) => void) | null;
	 *   failed?: ((anchor: Node, error: () => unknown, reset: () => () => void) => void) | null;
	 *   pending?: ((anchor: Node) => void) | null;
	 * }} BoundaryProps
	 */

	var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;

	/**
	 * @param {TemplateNode} node
	 * @param {BoundaryProps} props
	 * @param {((anchor: Node) => void)} children
	 * @param {((error: unknown) => unknown) | undefined} [transform_error]
	 * @returns {void}
	 */
	function boundary(node, props, children, transform_error) {
		new Boundary(node, props, children, transform_error);
	}

	class Boundary {
		/** @type {Boundary | null} */
		parent;

		is_pending = false;

		/**
		 * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
		 * Inherited from parent boundary, or defaults to identity.
		 * @type {(error: unknown) => unknown}
		 */
		transform_error;

		/** @type {TemplateNode} */
		#anchor;

		/** @type {TemplateNode | null} */
		#hydrate_open = null;

		/** @type {BoundaryProps} */
		#props;

		/** @type {((anchor: Node) => void)} */
		#children;

		/** @type {Effect} */
		#effect;

		/** @type {Effect | null} */
		#main_effect = null;

		/** @type {Effect | null} */
		#pending_effect = null;

		/** @type {Effect | null} */
		#failed_effect = null;

		/** @type {DocumentFragment | null} */
		#offscreen_fragment = null;

		#local_pending_count = 0;
		#pending_count = 0;
		#pending_count_update_queued = false;

		/** @type {Set<Effect>} */
		#dirty_effects = new Set();

		/** @type {Set<Effect>} */
		#maybe_dirty_effects = new Set();

		/**
		 * A source containing the number of pending async deriveds/expressions.
		 * Only created if `$effect.pending()` is used inside the boundary,
		 * otherwise updating the source results in needless `Batch.ensure()`
		 * calls followed by no-op flushes
		 * @type {Source<number> | null}
		 */
		#effect_pending = null;

		#effect_pending_subscriber = createSubscriber(() => {
			this.#effect_pending = source(this.#local_pending_count);

			if (DEV) {
				tag(this.#effect_pending, '$effect.pending()');
			}

			return () => {
				this.#effect_pending = null;
			};
		});

		/**
		 * @param {TemplateNode} node
		 * @param {BoundaryProps} props
		 * @param {((anchor: Node) => void)} children
		 * @param {((error: unknown) => unknown) | undefined} [transform_error]
		 */
		constructor(node, props, children, transform_error) {
			this.#anchor = node;
			this.#props = props;

			this.#children = (anchor) => {
				var effect = /** @type {Effect} */ (active_effect);

				effect.b = this;
				effect.f |= BOUNDARY_EFFECT;

				children(anchor);
			};

			this.parent = /** @type {Effect} */ (active_effect).b;

			// Inherit transform_error from parent boundary, or use the provided one, or default to identity
			this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);

			this.#effect = block(() => {
				{
					this.#render();
				}
			}, flags);
		}

		#hydrate_resolved_content() {
			try {
				this.#main_effect = branch(() => this.#children(this.#anchor));
			} catch (error) {
				this.error(error);
			}
		}

		/**
		 * @param {unknown} error The deserialized error from the server's hydration comment
		 */
		#hydrate_failed_content(error) {
			const failed = this.#props.failed;
			const { reset, invoke_onerror } = this.#create_reset(error);

			// `onerror` may mutate state, which is disallowed while hydrating
			queue_micro_task(invoke_onerror);

			if (!failed) return;

			this.#failed_effect = branch(() => {
				failed(
					this.#anchor,
					() => error,
					() => reset
				);
			});
		}

		/**
		 * Creates the `reset` function for a failed boundary, along with a function
		 * that invokes `onerror` with it (if provided)
		 * @param {unknown} error
		 * @returns {{ reset: () => void, invoke_onerror: () => void }}
		 */
		#create_reset(error) {
			var did_reset = false;
			var calling_on_error = false;

			const reset = () => {
				if (did_reset) {
					svelte_boundary_reset_noop();
					return;
				}

				did_reset = true;

				if (calling_on_error) {
					svelte_boundary_reset_onerror();
				}

				if (this.#failed_effect !== null) {
					pause_effect(this.#failed_effect, () => {
						this.#failed_effect = null;
					});
				}

				this.#run(() => {
					this.#render();
				});
			};

			const invoke_onerror = () => {
				try {
					calling_on_error = true;
					this.#props.onerror?.(error, reset);
					calling_on_error = false;
				} catch (err) {
					invoke_error_boundary(err, this.#effect && this.#effect.parent);
				}
			};

			return { reset, invoke_onerror };
		}

		#hydrate_pending_content() {
			const pending = this.#props.pending;
			if (!pending) return;

			this.is_pending = true;
			this.#pending_effect = branch(() => pending(this.#anchor));

			queue_micro_task(() => {
				var fragment = (this.#offscreen_fragment = document.createDocumentFragment());
				var anchor = create_text();
				var handled = false;

				fragment.append(anchor);

				this.#main_effect = this.#run(() => {
					try {
						return branch(() => this.#children(anchor));
					} catch (error) {
						try {
							this.error(error);
							handled = true;
						} catch (error) {
							invoke_error_boundary(error, this.#effect.parent);
						}

						return null;
					}
				});

				if (this.#main_effect === null) {
					this.#offscreen_fragment = null;
					if (handled) this.#resolve(/** @type {Batch} */ (current_batch));
					return;
				}

				if (this.#pending_count === 0) {
					this.#anchor.before(fragment);
					this.#offscreen_fragment = null;

					pause_effect(/** @type {Effect} */ (this.#pending_effect), () => {
						this.#pending_effect = null;
					});

					this.#resolve(/** @type {Batch} */ (current_batch));
				}
			});
		}

		#render() {
			try {
				this.is_pending = this.has_pending_snippet();
				this.#pending_count = 0;
				this.#local_pending_count = 0;

				this.#main_effect = branch(() => {
					this.#children(this.#anchor);
				});

				if (this.#pending_count > 0) {
					var fragment = (this.#offscreen_fragment = document.createDocumentFragment());
					move_effect(this.#main_effect, fragment);

					const pending = /** @type {(anchor: Node) => void} */ (this.#props.pending);
					this.#pending_effect = branch(() => pending(this.#anchor));
				} else {
					this.#resolve(/** @type {Batch} */ (current_batch));
				}
			} catch (error) {
				this.error(error);
			}
		}

		/**
		 * @param {Batch} batch
		 */
		#resolve(batch) {
			this.is_pending = false;

			// any effects that were previously deferred should be transferred
			// to the batch, which will flush in the next microtask
			batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
		}

		/**
		 * Defer an effect inside a pending boundary until the boundary resolves
		 * @param {Effect} effect
		 */
		defer_effect(effect) {
			defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
		}

		/**
		 * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
		 * @returns {boolean}
		 */
		is_rendered() {
			return !this.is_pending && (!this.parent || this.parent.is_rendered());
		}

		has_pending_snippet() {
			return !!this.#props.pending;
		}

		/**
		 * @template T
		 * @param {() => T} fn
		 */
		#run(fn) {
			var previous_effect = active_effect;
			var previous_reaction = active_reaction;
			var previous_ctx = component_context;

			set_active_effect(this.#effect);
			set_active_reaction(this.#effect);
			set_component_context(this.#effect.ctx);

			try {
				Batch.ensure();
				return fn();
			} finally {
				set_active_effect(previous_effect);
				set_active_reaction(previous_reaction);
				set_component_context(previous_ctx);
			}
		}

		/**
		 * Updates the pending count associated with the currently visible pending snippet,
		 * if any, such that we can replace the snippet with content once work is done
		 * @param {1 | -1} d
		 * @param {Batch} batch
		 */
		#update_pending_count(d, batch) {
			if (!this.has_pending_snippet()) {
				if (this.parent) {
					this.parent.#update_pending_count(d, batch);
				}

				// if there's no parent, we're in a scope with no pending snippet
				return;
			}

			this.#pending_count += d;

			if (this.#pending_count === 0) {
				this.#resolve(batch);

				if (this.#pending_effect) {
					pause_effect(this.#pending_effect, () => {
						this.#pending_effect = null;
					});
				}

				if (this.#offscreen_fragment) {
					this.#anchor.before(this.#offscreen_fragment);
					this.#offscreen_fragment = null;
				}
			}
		}

		/**
		 * Update the source that powers `$effect.pending()` inside this boundary,
		 * and controls when the current `pending` snippet (if any) is removed.
		 * Do not call from inside the class
		 * @param {1 | -1} d
		 * @param {Batch} batch
		 */
		update_pending_count(d, batch) {
			this.#update_pending_count(d, batch);

			this.#local_pending_count += d;

			if (!this.#effect_pending || this.#pending_count_update_queued) return;
			this.#pending_count_update_queued = true;

			queue_micro_task(() => {
				this.#pending_count_update_queued = false;
				if (this.#effect_pending) {
					internal_set(this.#effect_pending, this.#local_pending_count);
				}
			});
		}

		get_effect_pending() {
			this.#effect_pending_subscriber();
			return get(/** @type {Source<number>} */ (this.#effect_pending));
		}

		/** @param {unknown} error */
		error(error) {
			// If we have nothing to capture the error, or if we hit an error while
			// rendering the fallback, re-throw for another boundary to handle
			if (!this.#props.onerror && !this.#props.failed) {
				throw error;
			}

			if (current_batch?.is_fork) {
				if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
				if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
				if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);

				current_batch.oncommit(() => {
					this.#handle_error(error);
				});
			} else {
				this.#handle_error(error);
			}
		}

		/**
		 * @param {unknown} error
		 */
		#handle_error(error) {
			if (this.#main_effect) {
				destroy_effect(this.#main_effect);
				this.#main_effect = null;
			}

			if (this.#pending_effect) {
				destroy_effect(this.#pending_effect);
				this.#pending_effect = null;
			}

			if (this.#failed_effect) {
				destroy_effect(this.#failed_effect);
				this.#failed_effect = null;
			}

			let failed = this.#props.failed;

			/** @param {unknown} transformed_error */
			const handle_error_result = (transformed_error) => {
				const { reset, invoke_onerror } = this.#create_reset(transformed_error);

				invoke_onerror();

				if (failed) {
					this.#failed_effect = this.#run(() => {
						try {
							return branch(() => {
								// errors in `failed` snippets cause the boundary to error again
								// TODO Svelte 6: revisit this decision, most likely better to go to parent boundary instead
								var effect = /** @type {Effect} */ (active_effect);

								effect.b = this;
								effect.f |= BOUNDARY_EFFECT;

								failed(
									this.#anchor,
									() => transformed_error,
									() => reset
								);
							});
						} catch (error) {
							invoke_error_boundary(error, /** @type {Effect} */ (this.#effect.parent));
							return null;
						}
					});
				}
			};

			queue_micro_task(() => {
				// Run the error through the API-level transformError transform (e.g. SvelteKit's handleError)
				/** @type {unknown} */
				var result;
				try {
					result = this.transform_error(error);
				} catch (e) {
					invoke_error_boundary(e, this.#effect && this.#effect.parent);
					return;
				}

				if (
					result !== null &&
					typeof result === 'object' &&
					typeof (/** @type {any} */ (result).then) === 'function'
				) {
					// transformError returned a Promise — wait for it
					/** @type {any} */ (result).then(
						handle_error_result,
						/** @param {unknown} e */
						(e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
					);
				} else {
					// Synchronous result — handle immediately
					handle_error_result(result);
				}
			});
		}
	}

	/** @import { ComponentContext, Effect, EffectNodes, TemplateNode } from '#client' */
	/** @import { Component, ComponentType, SvelteComponent, MountOptions } from '../../index.js' */

	/**
	 * @param {Element} text
	 * @param {string} value
	 * @returns {void}
	 */
	function set_text(text, value) {
		// For objects, we apply string coercion (which might make things like $state array references in the template reactive) before diffing
		var str = value == null ? '' : typeof value === 'object' ? `${value}` : value;
		// prettier-ignore
		if (str !== (/** @type {any} */ (text)[TEXT_CACHE] ??= text.nodeValue)) {
			/** @type {any} */ (text)[TEXT_CACHE] = str;
			text.nodeValue = `${str}`;
		}
	}

	/**
	 * Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
	 * Transitions will play during the initial render unless the `intro` option is set to `false`.
	 *
	 * @template {Record<string, any>} Props
	 * @template {Record<string, any>} Exports
	 * @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
	 * @param {MountOptions<Props>} options
	 * @returns {Exports}
	 */
	function mount(component, options) {
		return _mount(component, options);
	}

	/** @type {Map<EventTarget, Map<string, number>>} */
	const listeners = new Map();

	/**
	 * @template {Record<string, any>} Exports
	 * @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
	 * @param {MountOptions} options
	 * @returns {Exports}
	 */
	function _mount(
		Component,
		{ target, anchor, props = {}, events, context, intro = true, transformError }
	) {
		init_operations();

		/** @type {Exports} */
		// @ts-expect-error will be defined because the render effect runs synchronously
		var component = undefined;

		var unmount = component_root(() => {
			var anchor_node = anchor ?? target.appendChild(create_text());

			boundary(
				/** @type {TemplateNode} */ (anchor_node),
				{
					pending: () => {}
				},
				(anchor_node) => {
					push({});
					var ctx = /** @type {ComponentContext} */ (component_context);
					if (context) ctx.c = context;

					if (events) {
						// We can't spread the object or else we'd lose the state proxy stuff, if it is one
						/** @type {any} */ (props).$$events = events;
					}
					// @ts-expect-error the public typings are not what the actual function looks like
					component = Component(anchor_node, props) || mark_as_component();

					pop();
				},
				transformError
			);

			// Setup event delegation _after_ component is mounted - if an error would happen during mount, it would otherwise not be cleaned up
			/** @type {Set<string>} */
			var registered_events = new Set();

			/** @param {Array<string>} events */
			var event_handle = (events) => {
				for (var i = 0; i < events.length; i++) {
					var event_name = events[i];

					if (registered_events.has(event_name)) continue;
					registered_events.add(event_name);

					var passive = is_passive_event(event_name);

					// Add the event listener to both the container and the document.
					// The container listener ensures we catch events from within in case
					// the outer content stops propagation of the event.
					//
					// The document listener ensures we catch events that originate from elements that were
					// manually moved outside of the container (e.g. via manual portals).
					for (const node of [target, document]) {
						var counts = listeners.get(node);

						if (counts === undefined) {
							counts = new Map();
							listeners.set(node, counts);
						}

						var count = counts.get(event_name);

						if (count === undefined) {
							node.addEventListener(event_name, handle_event_propagation, { passive });
							counts.set(event_name, 1);
						} else {
							counts.set(event_name, count + 1);
						}
					}
				}
			};

			event_handle(array_from(all_registered_events));
			root_event_handles.add(event_handle);

			return () => {
				for (var event_name of registered_events) {
					for (const node of [target, document]) {
						var counts = /** @type {Map<string, number>} */ (listeners.get(node));
						var count = /** @type {number} */ (counts.get(event_name));

						if (--count == 0) {
							node.removeEventListener(event_name, handle_event_propagation);
							counts.delete(event_name);

							if (counts.size === 0) {
								listeners.delete(node);
							}
						} else {
							counts.set(event_name, count);
						}
					}
				}

				root_event_handles.delete(event_handle);

				if (anchor_node !== anchor) {
					anchor_node.parentNode?.removeChild(anchor_node);
				}
			};
		});

		mounted_components.set(component, unmount);
		return component;
	}

	/**
	 * References of the components that were mounted or hydrated.
	 * Uses a `WeakMap` to avoid memory leaks.
	 */
	let mounted_components = new WeakMap();

	/** @param {Function & { [FILENAME]: string }} target */
	function check_target(target) {
		if (target) {
			component_api_invalid_new(target[FILENAME] ?? 'a component', target.name);
		}
	}

	function legacy_api() {
		const component = component_context?.function;

		/** @param {string} method */
		function error(method) {
			component_api_changed(method, component[FILENAME]);
		}

		return {
			$destroy: () => error('$destroy()'),
			$on: () => error('$on(...)'),
			$set: () => error('$set(...)')
		};
	}

	/** @import { Effect, TemplateNode } from '#client' */

	/**
	 * @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
	 */

	/**
	 * @template Key
	 */
	class BranchManager {
		/** @type {TemplateNode} */
		anchor;

		/** @type {Map<Batch, Key>} */
		#batches = new Map();

		/**
		 * Map of keys to effects that are currently rendered in the DOM.
		 * These effects are visible and actively part of the document tree.
		 * Example:
		 * ```
		 * {#if condition}
		 * 	foo
		 * {:else}
		 * 	bar
		 * {/if}
		 * ```
		 * Can result in the entries `true->Effect` and `false->Effect`
		 * @type {Map<Key, Effect>}
		 */
		#onscreen = new Map();

		/**
		 * Similar to #onscreen with respect to the keys, but contains branches that are not yet
		 * in the DOM, because their insertion is deferred.
		 * @type {Map<Key, Branch>}
		 */
		#offscreen = new Map();

		/**
		 * Keys of effects that are currently outroing
		 * @type {Set<Key>}
		 */
		#outroing = new Set();

		/**
		 * Whether to pause (i.e. outro) on change, or destroy immediately.
		 * This is necessary for `<svelte:element>`
		 */
		#transition = true;

		/**
		 * @param {TemplateNode} anchor
		 * @param {boolean} transition
		 */
		constructor(anchor, transition = true) {
			this.anchor = anchor;
			this.#transition = transition;
		}

		/**
		 * @param {Batch} batch
		 */
		#commit = (batch) => {
			// if this batch was made obsolete, bail
			if (!this.#batches.has(batch)) return;

			var key = /** @type {Key} */ (this.#batches.get(batch));

			var onscreen = this.#onscreen.get(key);

			if (onscreen) {
				// effect is already in the DOM — abort any current outro
				resume_effect(onscreen);
				this.#outroing.delete(key);
			} else {
				// effect is currently offscreen. put it in the DOM
				var offscreen = this.#offscreen.get(key);

				if (offscreen) {
					// effect could have been outro'ed before through a prior batch — resume if necessary
					resume_effect(offscreen.effect);
					this.#onscreen.set(key, offscreen.effect);
					this.#offscreen.delete(key);

					if (DEV) {
						// Tell hmr.js about the anchor it should use for updates,
						// since the initial one will be removed
						/** @type {any} */ (offscreen.fragment.lastChild)[HMR_ANCHOR] = this.anchor;
					}

					// remove the anchor...
					/** @type {TemplateNode} */ (offscreen.fragment.lastChild).remove();

					// ...and append the fragment
					this.anchor.before(offscreen.fragment);
					onscreen = offscreen.effect;
				}
			}

			for (const [b, k] of this.#batches) {
				this.#batches.delete(b);

				if (b === batch) {
					// keep values for newer batches
					break;
				}

				const offscreen = this.#offscreen.get(k);

				if (offscreen) {
					// for older batches, destroy offscreen effects
					// as they will never be committed
					destroy_effect(offscreen.effect);
					this.#offscreen.delete(k);
				}
			}

			// outro/destroy all onscreen effects...
			for (const [k, effect] of this.#onscreen) {
				// ...except the one that was just committed
				//    or those that are already outroing (else the transition is aborted and the effect destroyed right away)
				if (k === key || this.#outroing.has(k)) continue;

				const on_destroy = () => {
					const keys = Array.from(this.#batches.values());

					if (keys.includes(k)) {
						// keep the effect offscreen, as another batch will need it
						var fragment = document.createDocumentFragment();
						move_effect(effect, fragment);

						fragment.append(create_text()); // TODO can we avoid this?

						this.#offscreen.set(k, { effect, fragment });
					} else {
						destroy_effect(effect);
					}

					this.#outroing.delete(k);
					this.#onscreen.delete(k);
				};

				if (this.#transition || !onscreen) {
					this.#outroing.add(k);
					pause_effect(effect, on_destroy, false);
				} else {
					on_destroy();
				}
			}
		};

		/**
		 * @param {Batch} batch
		 */
		#discard = (batch) => {
			this.#batches.delete(batch);

			const keys = Array.from(this.#batches.values());

			for (const [k, branch] of this.#offscreen) {
				if (!keys.includes(k)) {
					destroy_effect(branch.effect);
					this.#offscreen.delete(k);
				}
			}
		};

		/**
		 *
		 * @param {any} key
		 * @param {null | ((target: TemplateNode) => void)} fn
		 */
		ensure(key, fn) {
			var batch = /** @type {Batch} */ (current_batch);
			var defer = should_defer_append();

			if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
				if (defer) {
					var fragment = document.createDocumentFragment();
					var target = create_text();

					fragment.append(target);

					this.#offscreen.set(key, {
						effect: branch(() => fn(target)),
						fragment
					});
				} else {
					this.#onscreen.set(
						key,
						branch(() => fn(this.anchor))
					);
				}
			}

			this.#batches.set(batch, key);

			if (defer) {
				for (const [k, effect] of this.#onscreen) {
					if (k === key) {
						batch.unskip_effect(effect);
					} else {
						batch.skip_effect(effect);
					}
				}

				for (const [k, branch] of this.#offscreen) {
					if (k === key) {
						batch.unskip_effect(branch.effect);
					} else {
						batch.skip_effect(branch.effect);
					}
				}

				batch.oncommit(this.#commit);
				batch.ondiscard(this.#discard);
			} else {

				this.#commit(batch);
			}
		}
	}

	/** @import { TemplateNode } from '#client' */

	/**
	 * @param {TemplateNode} node
	 * @param {(branch: (fn: (anchor: Node) => void, key?: number | false) => void) => void} fn
	 * @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
	 * @returns {void}
	 */
	function if_block(node, fn, elseif = false) {

		var branches = new BranchManager(node);
		var flags = elseif ? EFFECT_TRANSPARENT : 0;

		/**
		 * @param {number | false} key
		 * @param {null | ((anchor: Node) => void)} fn
		 */
		function update_branch(key, fn) {

			branches.ensure(key, fn);
		}

		block(() => {
			var has_branch = false;

			fn((fn, key = 0) => {
				has_branch = true;
				update_branch(key, fn);
			});

			if (!has_branch) {
				update_branch(-1, null);
			}
		}, flags);
	}

	/** @import { EachItem, EachOutroGroup, EachState, Effect, EffectNodes, MaybeSource, Source, TemplateNode, TransitionManager, Value } from '#client' */
	/** @import { Batch } from '../../reactivity/batch.js'; */

	// When making substantive changes to this file, validate them with the each block stress test:
	// https://svelte.dev/playground/1972b2cf46564476ad8c8c6405b23b7b
	// This test also exists in this repo, as `packages/svelte/tests/manual/each-stress-test`

	/**
	 * @param {any} _
	 * @param {number} i
	 */
	function index(_, i) {
		return i;
	}

	/**
	 * Pause multiple effects simultaneously, and coordinate their
	 * subsequent destruction. Used in each blocks
	 * @param {EachState} state
	 * @param {Effect[]} to_destroy
	 * @param {null | Node} controlled_anchor
	 */
	function pause_effects(state, to_destroy, controlled_anchor) {
		/** @type {TransitionManager[]} */
		var transitions = [];
		var length = to_destroy.length;

		/** @type {EachOutroGroup} */
		var group;
		var remaining = to_destroy.length;

		for (var i = 0; i < length; i++) {
			let effect = to_destroy[i];

			pause_effect(
				effect,
				() => {
					if (group) {
						group.pending.delete(effect);
						group.done.add(effect);

						if (group.pending.size === 0) {
							var groups = /** @type {Set<EachOutroGroup>} */ (state.outrogroups);

							destroy_effects(state, array_from(group.done));
							groups.delete(group);

							if (groups.size === 0) {
								state.outrogroups = null;
							}
						}
					} else {
						remaining -= 1;
					}
				},
				false
			);
		}

		if (remaining === 0) {
			// If we're in a controlled each block (i.e. the block is the only child of an
			// element), and we are removing all items, _and_ there are no out transitions,
			// we can use the fast path — emptying the element and replacing the anchor.
			// Skip the fast path when another batch is still pending on this each block:
			// that batch's keys still reference EachItems in `state.items`, which
			// `destroy_effects` needs to preserve offscreen (see #18610).
			var fast_path =
				transitions.length === 0 && controlled_anchor !== null && state.pending.size === 0;

			if (fast_path) {
				var anchor = /** @type {Element} */ (controlled_anchor);
				var parent_node = /** @type {Element} */ (anchor.parentNode);

				clear_text_content(parent_node);
				parent_node.append(anchor);

				state.items.clear();
			}

			destroy_effects(state, to_destroy, !fast_path);
		} else {
			group = {
				pending: new Set(to_destroy),
				done: new Set()
			};

			(state.outrogroups ??= new Set()).add(group);
		}
	}

	/**
	 * @param {EachState} state
	 * @param {Effect[]} to_destroy
	 * @param {boolean} remove_dom
	 */
	function destroy_effects(state, to_destroy, remove_dom = true) {
		/** @type {Set<Effect> | undefined} */
		var preserved_effects;

		// The loop-in-a-loop isn't ideal, but we should only hit this in relatively rare cases
		if (state.pending.size > 0) {
			preserved_effects = new Set();

			for (const keys of state.pending.values()) {
				for (const key of keys) {
					preserved_effects.add(/** @type {EachItem} */ (state.items.get(key)).e);
				}
			}
		}

		for (var i = 0; i < to_destroy.length; i++) {
			var e = to_destroy[i];

			if (preserved_effects?.has(e)) {
				e.f |= EFFECT_OFFSCREEN;

				const fragment = document.createDocumentFragment();
				move_effect(e, fragment);
			} else {
				destroy_effect(to_destroy[i], remove_dom);
			}
		}
	}

	/** @type {TemplateNode} */
	var offscreen_anchor;

	/**
	 * @template V
	 * @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
	 * @param {number} flags
	 * @param {() => V[]} get_collection
	 * @param {(value: V, index: number) => any} get_key
	 * @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>) => void} render_fn
	 * @param {null | ((anchor: Node) => void)} fallback_fn
	 * @returns {void}
	 */
	function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
		var anchor = node;

		/** @type {Map<any, EachItem>} */
		var items = new Map();

		var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;

		if (is_controlled) {
			var parent_node = /** @type {Element} */ (node);

			anchor = parent_node.appendChild(create_text());
		}

		/** @type {Effect | null} */
		var fallback = null;

		// TODO: ideally we could use derived for runes mode but because of the ability
		// to use a store which can be mutated, we can't do that here as mutating a store
		// will still result in the collection array being the same from the store
		var each_array = derived_safe_equal(() => {
			var collection = get_collection();

			return /** @type {V[]} */ (
				is_array(collection) ? collection : collection == null ? [] : array_from(collection)
			);
		});

		if (DEV) {
			tag(each_array, '{#each ...}');
		}

		/** @type {V[]} */
		var array;

		/** @type {Map<Batch, Set<any>>} */
		var pending = new Map();

		var first_run = true;

		/**
		 * @param {Batch} batch
		 */
		function commit(batch) {
			if ((state.effect.f & DESTROYED) !== 0) {
				return;
			}

			state.pending.delete(batch);

			state.fallback = fallback;
			reconcile(state, array, anchor, flags, get_key);

			if (fallback !== null) {
				if (array.length === 0) {
					if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
						resume_effect(fallback);
					} else {
						fallback.f ^= EFFECT_OFFSCREEN;
						move(fallback, null, anchor);
					}
				} else {
					pause_effect(fallback, () => {
						// TODO only null out if no pending batch needs it,
						// otherwise re-add `fallback.fragment` and move the
						// effect into it
						fallback = null;
					});
				}
			}
		}

		/**
		 * @param {Batch} batch
		 */
		function discard(batch) {
			state.pending.delete(batch);
		}

		var effect = block(() => {
			array = /** @type {V[]} */ (get(each_array));
			var length = array.length;

			var keys = new Set();
			var batch = /** @type {Batch} */ (current_batch);
			var defer = should_defer_append();

			for (var index = 0; index < length; index += 1) {

				var value = array[index];
				var key = get_key(value, index);

				if (DEV) {
					// Check that the key function is idempotent (returns the same value when called twice)
					var key_again = get_key(value, index);
					if (key !== key_again) {
						each_key_volatile(String(index), String(key), String(key_again));
					}
				}

				var item = first_run ? null : items.get(key);

				if (item) {
					// update before reconciliation, to trigger any async updates
					if (item.v) internal_set(item.v, value);
					if (item.i) internal_set(item.i, index);

					if (defer) {
						batch.unskip_effect(item.e);
					}
				} else {
					item = create_item(
						items,
						first_run ? anchor : (offscreen_anchor ??= create_text()),
						value,
						key,
						index,
						render_fn,
						flags,
						get_collection
					);

					if (!first_run) {
						item.e.f |= EFFECT_OFFSCREEN;
					}

					items.set(key, item);
				}

				keys.add(key);
			}

			if (length === 0 && fallback_fn && !fallback) {
				if (first_run) {
					fallback = branch(() => fallback_fn(anchor));
				} else {
					fallback = branch(() => fallback_fn((offscreen_anchor ??= create_text())));
					fallback.f |= EFFECT_OFFSCREEN;
				}
			}

			if (length > keys.size) {
				if (DEV) {
					validate_each_keys(array, get_key);
				} else {
					// in prod, the additional information isn't printed, so don't bother computing it
					each_key_duplicate('', '', '');
				}
			}

			if (!first_run) {
				pending.set(batch, keys);

				if (defer) {
					for (const [key, item] of items) {
						if (!keys.has(key)) {
							batch.skip_effect(item.e);
						}
					}

					batch.oncommit(commit);
					batch.ondiscard(discard);
				} else {
					commit(batch);
				}
			}

			// When we mount the each block for the first time, the collection won't be
			// connected to this effect as the effect hasn't finished running yet and its deps
			// won't be assigned. However, it's possible that when reconciling the each block
			// that a mutation occurred and it's made the collection MAYBE_DIRTY, so reading the
			// collection again can provide consistency to the reactive graph again as the deriveds
			// will now be `CLEAN`.
			get(each_array);
		});

		/** @type {EachState} */
		var state = { effect, flags, items, pending, outrogroups: null, fallback };

		first_run = false;
	}

	/**
	 * Skip past any non-branch effects (which could be created with `createSubscriber`, for example) to find the next branch effect
	 * @param {Effect | null} effect
	 * @returns {Effect | null}
	 */
	function skip_to_branch(effect) {
		while (effect !== null && (effect.f & BRANCH_EFFECT) === 0) {
			effect = effect.next;
		}
		return effect;
	}

	/**
	 * Add, remove, or reorder items output by an each block as its input changes
	 * @template V
	 * @param {EachState} state
	 * @param {Array<V>} array
	 * @param {Element | Comment | Text} anchor
	 * @param {number} flags
	 * @param {(value: V, index: number) => any} get_key
	 * @returns {void}
	 */
	function reconcile(state, array, anchor, flags, get_key) {
		var is_animated = (flags & EACH_IS_ANIMATED) !== 0;

		var length = array.length;
		var items = state.items;
		var current = skip_to_branch(state.effect.first);

		/** @type {undefined | Set<Effect>} */
		var seen;

		/** @type {Effect | null} */
		var prev = null;

		/** @type {undefined | Set<Effect>} */
		var to_animate;

		/** @type {Effect[]} */
		var matched = [];

		/** @type {Effect[]} */
		var stashed = [];

		/** @type {V} */
		var value;

		/** @type {any} */
		var key;

		/** @type {Effect | undefined} */
		var effect;

		/** @type {number} */
		var i;

		if (is_animated) {
			for (i = 0; i < length; i += 1) {
				value = array[i];
				key = get_key(value, i);
				effect = /** @type {EachItem} */ (items.get(key)).e;

				// offscreen == coming in now, no animation in that case,
				// else this would happen https://github.com/sveltejs/svelte/issues/17181
				if ((effect.f & EFFECT_OFFSCREEN) === 0) {
					effect.nodes?.a?.measure();
					(to_animate ??= new Set()).add(effect);
				}
			}
		}

		for (i = 0; i < length; i += 1) {
			value = array[i];
			key = get_key(value, i);

			effect = /** @type {EachItem} */ (items.get(key)).e;

			if (state.outrogroups !== null) {
				for (const group of state.outrogroups) {
					group.pending.delete(effect);
					group.done.delete(effect);
				}
			}

			if ((effect.f & INERT) !== 0) {
				resume_effect(effect);
				if (is_animated) {
					effect.nodes?.a?.unfix();
					(to_animate ??= new Set()).delete(effect);
				}
			}

			if ((effect.f & EFFECT_OFFSCREEN) !== 0) {
				effect.f ^= EFFECT_OFFSCREEN;

				if (effect === current) {
					move(effect, null, anchor);
				} else {
					var next = prev ? prev.next : current;

					if (effect === state.effect.last) {
						state.effect.last = effect.prev;
					}

					if (effect.prev) effect.prev.next = effect.next;
					if (effect.next) effect.next.prev = effect.prev;
					link(state, prev, effect);
					link(state, effect, next);

					move(effect, next, anchor);
					prev = effect;

					matched = [];
					stashed = [];

					current = skip_to_branch(prev.next);
					continue;
				}
			}

			if (effect !== current) {
				if (seen !== undefined && seen.has(effect)) {
					if (matched.length < stashed.length) {
						// more efficient to move later items to the front
						var start = stashed[0];
						var j;

						prev = start.prev;

						var a = matched[0];
						var b = matched[matched.length - 1];

						for (j = 0; j < matched.length; j += 1) {
							move(matched[j], start, anchor);
						}

						for (j = 0; j < stashed.length; j += 1) {
							seen.delete(stashed[j]);
						}

						link(state, a.prev, b.next);
						link(state, prev, a);
						link(state, b, start);

						current = start;
						prev = b;
						i -= 1;

						matched = [];
						stashed = [];
					} else {
						// more efficient to move earlier items to the back
						seen.delete(effect);
						move(effect, current, anchor);

						link(state, effect.prev, effect.next);
						link(state, effect, prev === null ? state.effect.first : prev.next);
						link(state, prev, effect);

						prev = effect;
					}

					continue;
				}

				matched = [];
				stashed = [];

				while (current !== null && current !== effect) {
					(seen ??= new Set()).add(current);
					stashed.push(current);
					current = skip_to_branch(current.next);
				}

				if (current === null) {
					continue;
				}
			}

			if ((effect.f & EFFECT_OFFSCREEN) === 0) {
				matched.push(effect);
			}

			prev = effect;
			current = skip_to_branch(effect.next);
		}

		if (state.outrogroups !== null) {
			for (const group of state.outrogroups) {
				if (group.pending.size === 0) {
					destroy_effects(state, array_from(group.done));
					state.outrogroups?.delete(group);
				}
			}

			if (state.outrogroups.size === 0) {
				state.outrogroups = null;
			}
		}

		if (current !== null || seen !== undefined) {
			/** @type {Effect[]} */
			var to_destroy = [];

			if (seen !== undefined) {
				for (effect of seen) {
					if ((effect.f & INERT) === 0) {
						to_destroy.push(effect);
					}
				}
			}

			while (current !== null) {
				// If the each block isn't inert, then inert effects are currently outroing and will be removed once the transition is finished
				if ((current.f & INERT) === 0 && current !== state.fallback) {
					to_destroy.push(current);
				}

				current = skip_to_branch(current.next);
			}

			var destroy_length = to_destroy.length;

			if (destroy_length > 0) {
				var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;

				if (is_animated) {
					for (i = 0; i < destroy_length; i += 1) {
						to_destroy[i].nodes?.a?.measure();
					}

					for (i = 0; i < destroy_length; i += 1) {
						to_destroy[i].nodes?.a?.fix();
					}
				}

				pause_effects(state, to_destroy, controlled_anchor);
			}
		}

		if (is_animated) {
			queue_micro_task(() => {
				if (to_animate === undefined) return;
				for (effect of to_animate) {
					effect.nodes?.a?.apply();
				}
			});
		}
	}

	/**
	 * @template V
	 * @param {Map<any, EachItem>} items
	 * @param {Node} anchor
	 * @param {V} value
	 * @param {unknown} key
	 * @param {number} index
	 * @param {(anchor: Node, item: V | Source<V>, index: number | Value<number>, collection: () => V[]) => void} render_fn
	 * @param {number} flags
	 * @param {() => V[]} get_collection
	 * @returns {EachItem}
	 */
	function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
		var v =
			(flags & EACH_ITEM_REACTIVE) !== 0
				? (flags & EACH_ITEM_IMMUTABLE) === 0
					? mutable_source(value, false, false)
					: source(value)
				: null;

		var i = (flags & EACH_INDEX_REACTIVE) !== 0 ? source(index) : null;

		if (DEV && v) {
			// For tracing purposes, we need to link the source signal we create with the
			// collection + index so that tracing works as intended
			v.trace = () => {
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				get_collection()[i?.v ?? index];
			};
		}

		return {
			v,
			i,
			e: branch(() => {
				render_fn(anchor, v ?? value, i ?? index, get_collection);

				return () => {
					items.delete(key);
				};
			})
		};
	}

	/**
	 * @param {Effect} effect
	 * @param {Effect | null} next
	 * @param {Text | Element | Comment} anchor
	 */
	function move(effect, next, anchor) {
		if (!effect.nodes) return;

		var node = effect.nodes.start;
		var end = effect.nodes.end;

		var dest =
			next && (next.f & EFFECT_OFFSCREEN) === 0
				? /** @type {EffectNodes} */ (next.nodes).start
				: anchor;

		while (node !== null) {
			var next_node = /** @type {TemplateNode} */ (get_next_sibling(node));
			dest.before(node);

			if (node === end) {
				return;
			}

			node = next_node;
		}
	}

	/**
	 * @param {EachState} state
	 * @param {Effect | null} prev
	 * @param {Effect | null} next
	 */
	function link(state, prev, next) {
		if (prev === null) {
			state.effect.first = next;
		} else {
			prev.next = next;
		}

		if (next === null) {
			state.effect.last = prev;
		} else {
			next.prev = prev;
		}
	}

	/**
	 * @param {Array<any>} array
	 * @param {(item: any, index: number) => string} key_fn
	 * @returns {void}
	 */
	function validate_each_keys(array, key_fn) {
		const keys = new Map();
		const length = array.length;

		for (let i = 0; i < length; i++) {
			const key = key_fn(array[i], i);

			if (keys.has(key)) {
				const a = String(keys.get(key));
				const b = String(i);

				/** @type {string | null} */
				let k = String(key);
				if (k.startsWith('[object ')) k = null;

				each_key_duplicate(a, b, k);
			}

			keys.set(key, i);
		}
	}

	const whitespace = [...' \t\n\r\f\u00a0\u000b\ufeff'];

	/**
	 * @param {any} value
	 * @param {string | null} [hash]
	 * @param {Record<string, boolean>} [directives]
	 * @returns {string | null}
	 */
	function to_class(value, hash, directives) {
		var classname = value == null ? '' : '' + value;

		if (hash) {
			classname = classname ? classname + ' ' + hash : hash;
		}

		if (directives) {
			for (var key of Object.keys(directives)) {
				if (directives[key]) {
					classname = classname ? classname + ' ' + key : key;
				} else if (classname.length) {
					var len = key.length;
					var a = 0;

					while ((a = classname.indexOf(key, a)) >= 0) {
						var b = a + len;

						if (
							(a === 0 || whitespace.includes(classname[a - 1])) &&
							(b === classname.length || whitespace.includes(classname[b]))
						) {
							classname = (a === 0 ? '' : classname.substring(0, a)) + classname.substring(b + 1);
						} else {
							a = b;
						}
					}
				}
			}
		}

		return classname === '' ? null : classname;
	}

	/**
	 *
	 * @param {Record<string,any>} styles
	 * @param {boolean} important
	 */
	function append_styles(styles, important = false) {
		var separator = important ? ' !important;' : ';';
		var css = '';

		for (var key of Object.keys(styles)) {
			var value = styles[key];
			if (value != null && value !== '') {
				css += ' ' + key + ': ' + value + separator;
			}
		}

		return css;
	}

	/**
	 * @param {string} name
	 * @returns {string}
	 */
	function to_css_name(name) {
		if (name[0] !== '-' || name[1] !== '-') {
			return name.toLowerCase();
		}
		return name;
	}

	/**
	 * @param {any} value
	 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
	 * @returns {string | null}
	 */
	function to_style(value, styles) {
		if (styles) {
			var new_style = '';

			/** @type {Record<string,any> | undefined} */
			var normal_styles;

			/** @type {Record<string,any> | undefined} */
			var important_styles;

			if (Array.isArray(styles)) {
				normal_styles = styles[0];
				important_styles = styles[1];
			} else {
				normal_styles = styles;
			}

			if (value) {
				// strip comments; surrounding whitespace is handled by the trims below (which is much faster than doing it through regex)
				value = String(value)
					.replaceAll(/\/\*.*?\*\//g, '')
					.trim();

				/** @type {boolean | '"' | "'"} */
				var in_str = false;
				var in_apo = 0;
				var in_comment = false;

				var reserved_names = [];

				if (normal_styles) {
					reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
				}
				if (important_styles) {
					reserved_names.push(...Object.keys(important_styles).map(to_css_name));
				}

				var start_index = 0;
				var name_index = -1;

				const len = value.length;
				for (var i = 0; i < len; i++) {
					var c = value[i];

					if (in_comment) {
						if (c === '/' && value[i - 1] === '*') {
							in_comment = false;
						}
					} else if (in_str) {
						if (in_str === c) {
							in_str = false;
						}
					} else if (c === '/' && value[i + 1] === '*') {
						in_comment = true;
					} else if (c === '"' || c === "'") {
						in_str = c;
					} else if (c === '(') {
						in_apo++;
					} else if (c === ')') {
						in_apo--;
					}

					if (!in_comment && in_str === false && in_apo === 0) {
						if (c === ':' && name_index === -1) {
							name_index = i;
						} else if (c === ';' || i === len - 1) {
							if (name_index !== -1) {
								var name = to_css_name(value.substring(start_index, name_index).trim());

								if (!reserved_names.includes(name)) {
									if (c !== ';') {
										i++;
									}

									var property = value.substring(start_index, i).trim();
									new_style += ' ' + property + ';';
								}
							}

							start_index = i + 1;
							name_index = -1;
						}
					}
				}
			}

			if (normal_styles) {
				new_style += append_styles(normal_styles);
			}

			if (important_styles) {
				new_style += append_styles(important_styles, true);
			}

			new_style = new_style.trim();
			return new_style === '' ? null : new_style;
		}

		return value == null ? null : String(value);
	}

	/**
	 * @param {Element} dom
	 * @param {boolean | number} is_html
	 * @param {string | null} value
	 * @param {string} [hash]
	 * @param {Record<string, any>} [prev_classes]
	 * @param {Record<string, any>} [next_classes]
	 * @returns {Record<string, boolean> | undefined}
	 */
	function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
		var prev = /** @type {any} */ (dom)[CLASS_CACHE];

		if (
			prev !== value ||
			prev === undefined // for edge case of `class={undefined}`
		) {
			var next_class_name = to_class(value, hash, next_classes);

			{
				// Removing the attribute when the value is only an empty string causes
				// performance issues vs simply making the className an empty string. So
				// we should only remove the class if the value is nullish
				// and there no hash/directives :
				if (next_class_name == null) {
					dom.removeAttribute('class');
				} else if (is_html) {
					dom.className = next_class_name;
				} else {
					dom.setAttribute('class', next_class_name);
				}
			}

			/** @type {any} */ (dom)[CLASS_CACHE] = value;
		} else if (next_classes && prev_classes !== next_classes) {
			for (var key in next_classes) {
				var is_present = !!next_classes[key];

				if (prev_classes == null || is_present !== !!prev_classes[key]) {
					dom.classList.toggle(key, is_present);
				}
			}
		}

		return next_classes;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} dom
	 * @param {Record<string, any>} prev
	 * @param {Record<string, any>} next
	 * @param {string} [priority]
	 */
	function update_styles(dom, prev = {}, next, priority) {
		for (var key in next) {
			var value = next[key];

			if (prev[key] !== value) {
				if (next[key] == null) {
					dom.style.removeProperty(key);
				} else {
					dom.style.setProperty(key, value, priority);
				}
			}
		}
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} dom
	 * @param {string | null} value
	 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [prev_styles]
	 * @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [next_styles]
	 */
	function set_style(dom, value, prev_styles, next_styles) {
		var prev = /** @type {any} */ (dom)[STYLE_CACHE];

		if (prev !== value) {
			var next_style_attr = to_style(value, next_styles);

			{
				if (next_style_attr == null) {
					dom.removeAttribute('style');
				} else {
					dom.style.cssText = next_style_attr;
				}
			}

			/** @type {any} */ (dom)[STYLE_CACHE] = value;
		} else if (next_styles) {
			if (Array.isArray(next_styles)) {
				update_styles(dom, prev_styles?.[0], next_styles[0]);
				update_styles(dom, prev_styles?.[1], next_styles[1], 'important');
			} else {
				update_styles(dom, prev_styles, next_styles);
			}
		}

		return next_styles;
	}

	/** @import { Blocker, Effect } from '#client' */

	const IS_CUSTOM_ELEMENT = Symbol('is custom element');
	const IS_HTML = Symbol('is html');

	/**
	 * @param {Element} element
	 * @param {string} attribute
	 * @param {string | null} value
	 * @param {boolean} [skip_warning]
	 */
	function set_attribute(element, attribute, value, skip_warning) {
		var attributes = get_attributes(element);

		if (attributes[attribute] === (attributes[attribute] = value)) return;

		if (attribute === 'loading') {
			// @ts-expect-error
			element[LOADING_ATTR_SYMBOL] = value;
		}

		if (value == null) {
			element.removeAttribute(attribute);
		} else if (typeof value !== 'string' && get_setters(element).has(attribute)) {
			// @ts-ignore
			element[attribute] = value;
		} else {
			element.setAttribute(attribute, value);
		}
	}

	/**
	 *
	 * @param {Element} element
	 */
	function get_attributes(element) {
		return /** @type {Record<string | symbol, unknown>} **/ (
			/** @type {any} */ (element)[ATTRIBUTES_CACHE] ??= {
				[IS_CUSTOM_ELEMENT]: element.nodeName.includes('-'),
				[IS_HTML]: element.namespaceURI === NAMESPACE_HTML
			}
		);
	}

	/** @type {Map<string, Set<string>>} */
	var setters_cache = new Map();

	/** @param {Element} element */
	function get_setters(element) {
		var cache_key = element.getAttribute('is') || element.nodeName;
		var setters = setters_cache.get(cache_key);
		if (setters) return setters;
		setters_cache.set(cache_key, (setters = new Set()));

		var descriptors;
		var proto = element; // In the case of custom elements there might be setters on the instance
		var element_proto = Element.prototype;

		// Stop at Element, from there on there's only unnecessary (and dangerous, like innerHTML) setters we're not interested in
		// Do not use constructor.name here as that's unreliable in some browser environments
		while (element_proto !== proto) {
			descriptors = get_descriptors(proto);

			for (var key in descriptors) {
				if (
					descriptors[key].set &&
					// better safe than sorry, we don't want spread attributes to mess with HTML content
					key !== 'innerHTML' &&
					key !== 'textContent' &&
					key !== 'innerText'
				) {
					setters.add(key);
				}
			}

			proto = get_prototype_of(proto);
		}

		return setters;
	}

	/** @import { Batch } from '../../../reactivity/batch.js' */

	/**
	 * @param {HTMLInputElement} input
	 * @param {() => unknown} get
	 * @param {(value: unknown) => void} set
	 * @returns {void}
	 */
	function bind_value(input, get, set = get) {
		var batches = new WeakSet();

		listen_to_event_and_reset_event(input, 'input', async (is_reset) => {
			if (DEV && input.type === 'checkbox') {
				// TODO should this happen in prod too?
				bind_invalid_checkbox_value();
			}

			/** @type {any} */
			var value = is_reset ? input.defaultValue : input.value;
			value = is_numberlike_input(input) ? to_number(value) : value;
			set(value);

			if (current_batch !== null) {
				batches.add(current_batch);
			}

			// Because `{#each ...}` blocks work by updating sources inside the flush,
			// we need to wait a tick before checking to see if we should forcibly
			// update the input and reset the selection state
			await tick();

			// Respect any validation in accessors
			if (value !== (value = get())) {
				var start = input.selectionStart;
				var end = input.selectionEnd;
				var length = input.value.length;

				// the value is coerced on assignment
				input.value = value ?? '';

				// Restore selection
				if (end !== null) {
					var new_length = input.value.length;
					// If cursor was at end and new input is longer, move cursor to new end
					if (start === end && end === length && new_length > length) {
						input.selectionStart = new_length;
						input.selectionEnd = new_length;
					} else {
						input.selectionStart = start;
						input.selectionEnd = Math.min(end, new_length);
					}
				}
			}
		});

		if (
			// If we are hydrating and the value has since changed,
			// then use the updated value from the input instead.
			// If defaultValue is set, then value == defaultValue
			// TODO Svelte 6: remove input.value check and set to empty string?
			(untrack(get) == null && input.value)
		) {
			set(is_numberlike_input(input) ? to_number(input.value) : input.value);

			if (current_batch !== null) {
				batches.add(current_batch);
			}
		}

		render_effect(() => {
			if (DEV && input.type === 'checkbox') {
				// TODO should this happen in prod too?
				bind_invalid_checkbox_value();
			}

			var value = get();

			if (input === document.activeElement) {
				// In sync mode render effects are executed during tree traversal -> needs current_batch
				// In async mode render effects are flushed once batch resolved, at which point current_batch is null -> needs previous_batch
				var batch = /** @type {Batch} */ (current_batch);

				// Never rewrite the contents of a focused input. We can get here if, for example,
				// an update is deferred because of async work depending on the input:
				//
				// <input bind:value={query}>
				// <p>{await find(query)}</p>
				if (batches.has(batch)) {
					return;
				}
			}

			if (is_numberlike_input(input) && value === to_number(input.value)) {
				// handles 0 vs 00 case (see https://github.com/sveltejs/svelte/issues/9959)
				return;
			}

			if (input.type === 'date' && !value && !input.value) {
				// Handles the case where a temporarily invalid date is set (while typing, for example with a leading 0 for the day)
				// and prevents this state from clearing the other parts of the date input (see https://github.com/sveltejs/svelte/issues/7897)
				return;
			}

			// don't set the value of the input if it's the same to allow
			// minlength to work properly
			if (value !== input.value) {
				// @ts-expect-error the value is coerced on assignment
				input.value = value ?? '';
			}
		});
	}

	/**
	 * @param {HTMLInputElement} input
	 * @param {() => unknown} get
	 * @param {(value: unknown) => void} set
	 * @returns {void}
	 */
	function bind_checked(input, get, set = get) {
		listen_to_event_and_reset_event(input, 'change', (is_reset) => {
			var value = is_reset ? input.defaultChecked : input.checked;
			set(value);
		});

		if (
			// If we are hydrating and the value has since changed,
			// then use the update value from the input instead.
			// If defaultChecked is set, then checked == defaultChecked
			untrack(get) == null
		) {
			set(input.checked);
		}

		render_effect(() => {
			var value = get();
			input.checked = Boolean(value);
		});
	}

	/**
	 * @param {HTMLInputElement} input
	 */
	function is_numberlike_input(input) {
		var type = input.type;
		return type === 'number' || type === 'range';
	}

	/**
	 * @param {string} value
	 */
	function to_number(value) {
		return value === '' ? null : +value;
	}

	/**
	 * @param {string} method
	 * @param  {...any} objects
	 */
	function log_if_contains_state(method, ...objects) {
		untrack(() => {
			try {
				let has_state = false;
				const transformed = [];

				for (const obj of objects) {
					if (obj && typeof obj === 'object' && STATE_SYMBOL in obj) {
						transformed.push(snapshot(obj, true));
						has_state = true;
					} else {
						transformed.push(obj);
					}
				}

				if (has_state) {
					console_log_state(method);

					// eslint-disable-next-line no-console
					console.log('%c[snapshot]', 'color: grey', ...transformed);
				}
			} catch {
				// Errors can occur when trying to snapshot objects with getters that throw or non-enumerable properties.
			}
		});

		return objects;
	}

	/** @import { ComponentContext, ComponentContextLegacy } from '#client' */
	/** @import { EventDispatcher } from './index.js' */
	/** @import { NotFunction } from './internal/types.js' */

	if (DEV) {
		/**
		 * @param {string} rune
		 */
		function throw_rune_error(rune) {
			if (!(rune in globalThis)) {
				// TODO if people start adjusting the "this can contain runes" config through v-p-s more, adjust this message
				/** @type {any} */
				let value; // let's hope noone modifies this global, but belts and braces
				Object.defineProperty(globalThis, rune, {
					configurable: true,
					// eslint-disable-next-line getter-return
					get: () => {
						if (value !== undefined) {
							return value;
						}

						rune_outside_svelte(rune);
					},
					set: (v) => {
						value = v;
					}
				});
			}
		}

		throw_rune_error('$state');
		throw_rune_error('$effect');
		throw_rune_error('$derived');
		throw_rune_error('$inspect');
		throw_rune_error('$props');
		throw_rune_error('$bindable');
	}

	/**
	 * `onMount`, like [`$effect`](https://svelte.dev/docs/svelte/$effect), schedules a function to run as soon as the component has been mounted to the DOM.
	 * Unlike `$effect`, the provided function only runs once.
	 *
	 * It must be called during the component's initialisation (but doesn't need to live _inside_ the component;
	 * it can be called from an external module). If a function is returned _synchronously_ from `onMount`,
	 * it will be called when the component is unmounted.
	 *
	 * `onMount` functions do not run during [server-side rendering](https://svelte.dev/docs/svelte/svelte-server#render).
	 *
	 * @template T
	 * @param {() => NotFunction<T> | Promise<NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		if (component_context === null) {
			lifecycle_outside_component('onMount');
		}

		if (legacy_mode_flag && component_context.l !== null) {
			init_update_callbacks(component_context).m.push(fn);
		} else {
			user_effect(() => {
				const cleanup = untrack(fn);
				if (typeof cleanup === 'function') return /** @type {() => void} */ (cleanup);
			});
		}
	}

	/**
	 * Legacy-mode: Init callbacks object for onMount/beforeUpdate/afterUpdate
	 * @param {ComponentContext} context
	 */
	function init_update_callbacks(context) {
		var l = /** @type {ComponentContextLegacy} */ (context).l;
		return (l.u ??= { a: [], b: [], m: [] });
	}

	// generated during release, do not modify

	const PUBLIC_VERSION = '5';

	if (typeof window !== 'undefined') {
		// @ts-expect-error
		((window.__svelte ??= {}).v ??= new Set()).add(PUBLIC_VERSION);
	}

	enable_legacy_mode_flag();

	Header[FILENAME] = 'src/components/Header.svelte';

	var root$8 = add_locations(from_html(`<header class="header svelte-oiwvqb"><nav class="top-nav svelte-oiwvqb"><a href="#about" class="svelte-oiwvqb">О нас</a> <a href="#works" class="svelte-oiwvqb">Наши работы</a> <a href="#promotions" class="svelte-oiwvqb">Акции</a> <a href="#benefits" class="svelte-oiwvqb">Преимущества</a> <a href="#reviews" class="svelte-oiwvqb">Отзывы</a> <a href="#gallery" class="svelte-oiwvqb">Галерея</a> <a href="#contacts" class="svelte-oiwvqb">Контакты</a></nav> <div class="bottom-bar svelte-oiwvqb"><div class="phone-wrapper svelte-oiwvqb"><img src="/images/phone.svg" alt="Телефон" class="phone-icon svelte-oiwvqb"/> <div class="phones svelte-oiwvqb"><a href="tel:+375297216585" class="svelte-oiwvqb">+375 29 721 65 85 (МТС)</a> <a href="tel:+375293916585" class="svelte-oiwvqb">+375 29 391 65 85 (A1)</a></div></div> <div class="logo svelte-oiwvqb"><strong class="svelte-oiwvqb">OS-DK MEBEL</strong> <span class="svelte-oiwvqb">Мебель на заказ</span></div> <div class="socials svelte-oiwvqb"><a href="https://www.instagram.com/os.mebel/" target="_blank" aria-label="Instagram" class="social-link instagram svelte-oiwvqb"></a></div></div></header>`), Header[FILENAME], [
		[
			4,
			0,
			[
				[
					5,
					4,
					[[6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8]]
				],

				[
					15,
					4,
					[
						[16, 8, [[17, 12], [19, 12, [[20, 16], [21, 16]]]]],
						[25, 8, [[26, 12], [27, 12]]],
						[30, 8, [[31, 12]]]
					]
				]
			]
		]
	]);

	function Header($$anchor, $$props) {
		check_target(new.target);
		push($$props, false, Header);

		var $$exports = { ...legacy_api() };
		var header = root$8();

		append($$anchor, header);

		return pop($$exports);
	}

	Footer[FILENAME] = 'src/components/Footer.svelte';

	var root$7 = add_locations(from_html(`<footer id="contacts" class="footer svelte-1sr6y3t"><div class="container svelte-1sr6y3t"><div class="contacts-col svelte-1sr6y3t"><h2 class="svelte-1sr6y3t">Контакты</h2> <div class="phones svelte-1sr6y3t"><a href="tel:+375293916585" class="svelte-1sr6y3t">+375 29 391 65 85 (A1)</a> <a href="tel:+375297216585" class="svelte-1sr6y3t">+375 29 721 65 85 (МТС)</a></div> <div class="schedule svelte-1sr6y3t"><p class="svelte-1sr6y3t">Режим работы:</p> <p class="svelte-1sr6y3t">С 8:00 до 22:00 (без выходных)</p></div></div> <div class="legal-col svelte-1sr6y3t"><p class="svelte-1sr6y3t">ООО «ОС -ДК ИНВЕСТ»</p> <p class="svelte-1sr6y3t">УНП 693271542</p></div></div></footer>`), Footer[FILENAME], [
		[
			1,
			0,
			[
				[
					2,
					4,
					[
						[
							3,
							8,
							[
								[4, 12],
								[6, 12, [[7, 16], [8, 16]]],
								[11, 12, [[12, 16], [13, 16]]]
							]
						],
						[17, 8, [[18, 12], [19, 12]]]
					]
				]
			]
		]
	]);

	function Footer($$anchor, $$props) {
		check_target(new.target);
		push($$props, false, Footer);

		var $$exports = { ...legacy_api() };
		var footer = root$7();

		append($$anchor, footer);

		return pop($$exports);
	}

	Hero[FILENAME] = 'src/components/Hero.svelte';

	var root$6 = add_locations(from_html(`<section class="hero svelte-juboms"><div class="hero-overlay svelte-juboms"></div> <div class="container svelte-juboms"><div class="hero-content svelte-juboms"><div class="hero-left"><span class="subtitle svelte-juboms">Заполните заявку чтобы получить скидку 10%</span> <h1 class="title svelte-juboms">Мебель любой сложности на заказ</h1> <div class="features-grid svelte-juboms"><div class="feature-item svelte-juboms"><img class="feature-icon svelte-juboms" src="/images/fill-application.png" alt="Шаг 1"/> <p class="svelte-juboms">Заполните заявку на сайте или позвоните нам</p></div> <div class="feature-item svelte-juboms"><img class="feature-icon svelte-juboms" src="/images/recall.png" alt="Шаг 2"/> <p class="svelte-juboms">Перезваниваем вам и обговариваем детали заказа</p></div> <div class="feature-item svelte-juboms"><img class="feature-icon svelte-juboms" src="/images/delivery.png" alt="Шаг 3"/> <p class="svelte-juboms">Осуществляем доставку по указанному вами адресу</p></div> <div class="feature-item svelte-juboms"><img class="feature-icon svelte-juboms" src="/images/pay.svg" alt="Шаг 4"/> <p class="svelte-juboms">Вы производите оплату любым удобным способом</p></div></div></div> <div class="hero-right svelte-juboms"><form class="lead-card svelte-juboms"><h3 class="svelte-juboms">Хочу 10% скидку</h3> <div class="form-group svelte-juboms"><label for="name" class="svelte-juboms"><span class="svelte-juboms">*</span> Имя</label> <input id="name" type="text" required="" class="svelte-juboms"/></div> <div class="form-group svelte-juboms"><label for="phone" class="svelte-juboms"><span class="svelte-juboms">*</span> Телефон</label> <input id="phone" type="tel" placeholder="+375 (__) ___-__-__" required="" class="svelte-juboms"/></div> <div class="checkbox-group svelte-juboms"><input type="checkbox" id="agree" required="" class="svelte-juboms"/> <label for="agree" class="svelte-juboms"><span class="svelte-juboms">*</span> Я согласен на обработку моих <a href="#privacy" class="svelte-juboms">персональных данных</a></label></div> <button type="submit" class="submit-btn svelte-juboms">Отправить заявку</button></form></div></div></div></section>`), Hero[FILENAME], [
		[
			16,
			0,
			[
				[17, 4],
				[
					19,
					4,
					[
						[
							20,
							8,
							[
								[
									21,
									12,
									[
										[22, 16],
										[23, 16],
										[
											25,
											16,
											[
												[26, 20, [[27, 24], [28, 24]]],
												[31, 20, [[32, 24], [33, 24]]],
												[36, 20, [[37, 24], [38, 24]]],
												[41, 20, [[42, 24], [43, 24]]]
											]
										]
									]
								],

								[
									48,
									12,
									[
										[
											49,
											16,
											[
												[50, 20],
												[52, 20, [[53, 24, [[53, 42]]], [54, 24]]],
												[62, 20, [[63, 24, [[63, 43]]], [64, 24]]],
												[73, 20, [[74, 24], [80, 24, [[81, 28], [82, 28]]]]],
												[86, 20]
											]
										]
									]
								]
							]
						]
					]
				]
			]
		]
	]);

	function Hero($$anchor, $$props) {
		check_target(new.target);
		push($$props, true, Hero);

		let name = tag(state(''), 'name');
		let phone = tag(state(''), 'phone');
		let agreed = tag(state(false), 'agreed');

		function handleSubmit(event) {
			event.preventDefault();

			if (!get(agreed)) {
				alert('Пожалуйста, подтвердите согласие на обработку персональных данных');

				return;
			}

			console.log(...log_if_contains_state('log', { name: get(name), phone: get(phone) }));
		}

		var $$exports = { ...legacy_api() };
		var section = root$6();
		var div = sibling(child(section), 2);
		var div_1 = child(div);
		var div_2 = sibling(child(div_1), 2);
		var form = child(div_2);
		var div_3 = sibling(child(form), 2);
		var input = sibling(child(div_3), 2);

		var div_4 = sibling(div_3, 2);
		var input_1 = sibling(child(div_4), 2);

		var div_5 = sibling(div_4, 2);
		var input_2 = child(div_5);
		event('submit', form, handleSubmit);

		bind_value(
			input,
			function get$1() {
				return get(name);
			},
			function set$1($$value) {
				set(name, $$value);
			}
		);

		bind_value(
			input_1,
			function get$1() {
				return get(phone);
			},
			function set$1($$value) {
				set(phone, $$value);
			}
		);

		bind_checked(
			input_2,
			function get$1() {
				return get(agreed);
			},
			function set$1($$value) {
				set(agreed, $$value);
			}
		);

		append($$anchor, section);

		return pop($$exports);
	}

	Benefits[FILENAME] = 'src/components/Benefits.svelte';

	var root$5 = add_locations(from_html(`<div class="benefit-card svelte-1cz2iu8"><div class="icon-wrap svelte-1cz2iu8"><svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12L12 21.5L31.5 2" stroke="#111111" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></div> <p class="benefit-text svelte-1cz2iu8"> </p></div>`), Benefits[FILENAME], [[21, 16, [[22, 20, [[23, 24, [[24, 28]]]]], [27, 20]]]]);
	var root_1$2 = add_locations(from_html(`<section class="benefits svelte-1cz2iu8"><div class="container svelte-1cz2iu8"><h2 class="title svelte-1cz2iu8">Выгодное сотрудничество</h2> <div class="benefits-grid svelte-1cz2iu8"></div></div></section>`), Benefits[FILENAME], [[15, 0, [[16, 4, [[17, 8], [19, 8]]]]]]);

	function Benefits($$anchor, $$props) {
		check_target(new.target);
		push($$props, false, Benefits);

		const benefits = [
			{
				text: '17 лет опыта с самыми разнообразными заказами позволяют обеспечить максимальное качество мебели'
			},

			{
				text: 'Опыт наших сотрудников от 10 лет - мы работаем только с профессиональной командой, готовой к различным вызовам'
			},

			{
				text: 'На всех этапах работы ваш персональный менеджер поможет вам решить все возникающие вопросы'
			}
		];

		var $$exports = { ...legacy_api() };
		var section = root_1$2();
		var div = child(section);
		var div_1 = sibling(child(div), 2);

		add_svelte_meta(
			() => each(div_1, 5, () => benefits, index, ($$anchor, item) => {
				var div_2 = root$5();
				var p = sibling(child(div_2), 2);
				var text = only_child(p, true);

				reset(div_2);
				template_effect(() => set_text(text, get(item).text));
				append($$anchor, div_2);
			}),
			'each',
			Benefits,
			20,
			12
		);
		append($$anchor, section);

		return pop($$exports);
	}

	Works[FILENAME] = 'src/components/Works.svelte';

	var root$4 = add_locations(from_html(`<li class="svelte-1qmoeki"> </li>`), Works[FILENAME], [[69, 32]]);

	var root_1$1 = add_locations(from_html(`<article><div class="image-wrapper svelte-1qmoeki"><img class="svelte-1qmoeki"/></div> <div class="content-wrapper svelte-1qmoeki"><h3 class="card-title svelte-1qmoeki"> </h3> <span class="card-subtitle svelte-1qmoeki"> </span> <p class="card-desc svelte-1qmoeki"> </p> <ul class="points-list svelte-1qmoeki"></ul> <a href="#promotions" class="btn-order svelte-1qmoeki">Отправить заявку</a></div></article>`), Works[FILENAME], [
		[
			57,
			16,
			[
				[58, 20, [[59, 24]]],
				[62, 20, [[63, 24], [64, 24], [65, 24], [67, 24], [73, 24]]]
			]
		]
	]);

	var root_2$1 = add_locations(from_html(`<section id="gallery" class="works-section svelte-1qmoeki"><div class="container svelte-1qmoeki"><div class="header-block svelte-1qmoeki"><h2 class="title svelte-1qmoeki">Наши работы</h2> <p class="subtitle svelte-1qmoeki">Мы готовы выполнить работы по созданию, проектированию и подбору материалов для мебели<br/> любой сложности и сделать все на наивысшем уровне</p></div> <div class="cards-list svelte-1qmoeki"></div></div></section>`), Works[FILENAME], [
		[
			45,
			0,
			[
				[46, 4, [[47, 8, [[48, 12], [49, 12, [[50, 102]]]]], [55, 8]]]
			]
		]
	]);

	function Works($$anchor, $$props) {
		check_target(new.target);
		push($$props, false, Works);

		const works = [
			{
				title: 'Шкафы',
				subtitle: 'Индивидуальный подход к каждому сантиметру',
				description: 'Ищете идеальный шкаф? Мы предлагаем не просто корпус с полками, а систему хранения, встроенную в ваш ритм жизни.',
				points: [
					'Встроенные и корпусные модели: точно встанут в вашу нишу, эркер или вдоль стены.',
					'Любые наполнения: Штанги, выдвижные пантографы, корзины для белья, бережные ящики с доводчиками.',
					'Материалы на выбор: ЛДСП/МДФ Эко-шпон, матовые и глянцевые эмали, фасады из натурального дерева или стекла.',
					'Визуализация 3D: Вы видите точный проект до начала производства.'
				],
				image: '/images/pamela.png',
				reverse: false
			},

			{
				title: 'Гардеробные',
				subtitle: 'Ваше личное пространство для порядка',
				description: 'Мечта о просторной гардеробной теперь доступна не только в больших особняках. Мы организуем грамотное хранение даже на 4-5 квадратных метрах.',
				points: [
					'Открытые и закрытые системы: Модульные конструкции, которые легко трансформируются при смене сезона.',
					'Продуманная эргономика: Каждая вещь на своем месте — от вечерних одежд до аксессуаров и галстуков.',
					'Освещение: Встроенная подсветка, которая делает сборы утром комфортными.',
					'Зеркала и фурнитура: Европейские механизмы, рассчитанные на ежедневную интенсивную нагрузку.'
				],
				image: '/images/lube.png',
				reverse: true
			},

			{
				title: 'Мебель для офиса',
				subtitle: 'Стиль, статус и продуктивность',
				description: 'Офисная мебель — это лицо вашей компании. Мы создаем рабочую атмосферу, в которой сотрудникам комфортно, а партнерам понятно находиться.',
				points: [
					'Для руководителя: Солидные кабинеты из массива или эко-шпона с надежными ручками и встроенными сейфами.',
					'Для сотрудников: Эргономичные столы, удобные кресла с ортопедической спинкой и функциональные тумбы для хранения документов.',
					'Переговорные комнаты: Трансформируемые столы и стулья для совещаний и мозговых штурмов.',
					'Зоны ресепшн: Стойки регистрации, которые создают первое впечатление о вашем бизнесе.'
				],
				image: '/images/korano.png',
				reverse: false
			}
		];

		var $$exports = { ...legacy_api() };
		var section = root_2$1();
		var div = child(section);
		var div_1 = sibling(child(div), 2);

		add_svelte_meta(
			() => each(div_1, 5, () => works, index, ($$anchor, item) => {
				var article = root_1$1();
				let classes;
				var div_2 = child(article);
				var img = only_child(div_2);
				var div_3 = sibling(div_2, 2);
				var h3 = child(div_3);
				var text = only_child(h3, true);
				var span = sibling(h3, 2);
				var text_1 = only_child(span, true);
				var p = sibling(span, 2);
				var text_2 = only_child(p, true);
				var ul = sibling(p, 2);

				add_svelte_meta(
					() => each(ul, 5, () => get(item).points, index, ($$anchor, point) => {
						var li = root$4();
						var text_3 = only_child(li, true);

						template_effect(() => set_text(text_3, get(point)));
						append($$anchor, li);
					}),
					'each',
					Works,
					68,
					28
				);

				reset(ul);
				next(2);
				reset(div_3);
				reset(article);

				template_effect(() => {
					classes = set_class(article, 1, 'work-card svelte-1qmoeki', null, classes, { reverse: get(item).reverse });
					set_attribute(img, 'src', get(item).image);
					set_attribute(img, 'alt', get(item).title);
					set_text(text, get(item).title);
					set_text(text_1, get(item).subtitle);
					set_text(text_2, get(item).description);
				});

				append($$anchor, article);
			}),
			'each',
			Works,
			56,
			12
		);
		append($$anchor, section);

		return pop($$exports);
	}

	PromoDrawer[FILENAME] = 'src/components/PromoDrawer.svelte';

	var root$3 = add_locations(from_html(`<section class="promo-banner svelte-1d02yvq"><div class="banner-overlay svelte-1d02yvq"></div> <div class="container svelte-1d02yvq"><div class="banner-content svelte-1d02yvq"><div class="banner-left svelte-1d02yvq"><h2 class="title svelte-1d02yvq">Дарим<br/> выдвижной ящик!</h2> <p class="desc svelte-1d02yvq">Только до конца месяца при заказе шкафа или гардеробной –<br/> выдвижной ящик в подарок</p></div> <div class="banner-right svelte-1d02yvq"><div class="timer-card svelte-1d02yvq"><p class="timer-header svelte-1d02yvq">До конца акции осталось</p> <div class="timer-display svelte-1d02yvq"><div class="timer-col svelte-1d02yvq"><span class="timer-value svelte-1d02yvq"> </span> <span class="timer-label svelte-1d02yvq">Дней</span></div> <div class="timer-col svelte-1d02yvq"><span class="timer-value svelte-1d02yvq"> </span> <span class="timer-label svelte-1d02yvq">Часов</span></div> <div class="timer-col svelte-1d02yvq"><span class="timer-value svelte-1d02yvq"> </span> <span class="timer-label svelte-1d02yvq">Минут</span></div> <div class="timer-col svelte-1d02yvq"><span class="timer-value svelte-1d02yvq"> </span> <span class="timer-label svelte-1d02yvq">Секунд</span></div></div></div> <div class="action-block svelte-1d02yvq"><p class="action-note svelte-1d02yvq">Поторопитесь! Срок акции ограничен</p> <a href="#promotions" class="btn-order svelte-1d02yvq">Заказать сейчас</a></div></div></div></div></section>`), PromoDrawer[FILENAME], [
		[
			52,
			0,
			[
				[53, 4],
				[
					55,
					4,
					[
						[
							56,
							8,
							[
								[57, 12, [[58, 16, [[59, 25]]], [62, 16, [[63, 77]]]]],
								[
									68,
									12,
									[
										[
											69,
											16,
											[
												[70, 20],
												[
													72,
													20,
													[
														[73, 24, [[74, 28], [75, 28]]],
														[77, 24, [[78, 28], [79, 28]]],
														[81, 24, [[82, 28], [83, 28]]],
														[85, 24, [[86, 28], [87, 28]]]
													]
												]
											]
										],
										[92, 16, [[93, 20], [94, 20]]]
									]
								]
							]
						]
					]
				]
			]
		]
	]);

	function PromoDrawer($$anchor, $$props) {
		check_target(new.target);
		push($$props, true, PromoDrawer);

		let days = tag(state('00'), 'days');
		let hours = tag(state('00'), 'hours');
		let minutes = tag(state('00'), 'minutes');
		let seconds = tag(state('00'), 'seconds');
		const STORAGE_KEY = 'osdk_promo_end_date';
		const DURATION_DAYS = 3;

		onMount(() => {
			let targetTime = localStorage.getItem(STORAGE_KEY);

			if (!targetTime) {
				const now = new Date();

				now.setDate(now.getDate() + DURATION_DAYS);
				targetTime = now.getTime().toString();
				localStorage.setItem(STORAGE_KEY, targetTime);
			}

			const updateTimer = () => {
				const diff = parseInt(targetTime, 10) - Date.now();

				if (diff <= 0) {
					set(days, '00');
					set(hours, '00');
					set(minutes, '00');
					set(seconds, '00');
					clearInterval(timerInterval);

					return;
				}

				const d = Math.floor(diff / (1000 * 60 * 60 * 24));
				const h = Math.floor(diff / (1000 * 60 * 60) % 24);
				const m = Math.floor(diff / (1000 * 60) % 60);
				const s = Math.floor(diff / 1000 % 60);

				set(days, String(d).padStart(2, '0'), true);
				set(hours, String(h).padStart(2, '0'), true);
				set(minutes, String(m).padStart(2, '0'), true);
				set(seconds, String(s).padStart(2, '0'), true);
			};

			updateTimer();

			const timerInterval = setInterval(updateTimer, 1000);

			return () => clearInterval(timerInterval);
		});

		var $$exports = { ...legacy_api() };
		var section = root$3();
		var div = sibling(child(section), 2);
		var div_1 = child(div);
		var div_2 = sibling(child(div_1), 2);
		var div_3 = child(div_2);
		var div_4 = sibling(child(div_3), 2);
		var div_5 = child(div_4);
		var span = child(div_5);
		var text = only_child(span, true);

		var div_6 = sibling(div_5, 2);
		var span_1 = child(div_6);
		var text_1 = only_child(span_1, true);

		var div_7 = sibling(div_6, 2);
		var span_2 = child(div_7);
		var text_2 = only_child(span_2, true);

		var div_8 = sibling(div_7, 2);
		var span_3 = child(div_8);
		var text_3 = only_child(span_3, true);

		template_effect(() => {
			set_text(text, get(days));
			set_text(text_1, get(hours));
			set_text(text_2, get(minutes));
			set_text(text_3, get(seconds));
		});

		append($$anchor, section);

		return pop($$exports);
	}

	About[FILENAME] = 'src/components/About.svelte';

	var root$2 = add_locations(
		from_html(`<section id="about" class="about-section svelte-1pch8ix"><div class="container svelte-1pch8ix"><div class="composition-wrapper svelte-1pch8ix"><div class="photo photo-top-left svelte-1pch8ix"><img src="/images/about-1.png" alt="Интерьер со шкафом" class="svelte-1pch8ix"/></div> <article class="content-card svelte-1pch8ix"><h2 class="title svelte-1pch8ix">О нас</h2> <p class="intro svelte-1pch8ix">Наша компания вот уже более 17 лет работает на рынке услуг по производству мебели.
                    Мы работаем по индивидуальным эскизам и предоставляем своим клиентам качественную,
                    эргономичную мебель по выгодным ценам.</p> <p class="question svelte-1pch8ix">Почему вот уже 17 лет количество благодарных клиентов непрестанно растет, как и наша репутация,
                    а положительные отзывы о нас множатся?</p> <ul class="features-list svelte-1pch8ix"><li class="svelte-1pch8ix"><strong class="svelte-1pch8ix">Качество исполнения</strong> — мы работаем только с качественными материалами.
                        Наши мастера — настоящие профессионалы своего дела, обладающие многолетним опытом.</li> <li class="svelte-1pch8ix"><strong class="svelte-1pch8ix">Гарантия</strong> — если же вы сомневаетесь в качестве продукции,
                        знайте, что на каждый заказ мы предоставляем гарантию.</li> <li class="svelte-1pch8ix"><strong class="svelte-1pch8ix">Оперативность</strong> — вся мебель изготавливается в кратчайшие сроки,
                        а при необходимости возможна реализация сверхсрочных заказов.</li></ul></article> <div class="photo photo-bottom-right svelte-1pch8ix"><img src="/images/about-2.png" alt="Кабинет и рабочее место" class="svelte-1pch8ix"/></div></div></div></section>`),
		About[FILENAME],
		[
			[
				1,
				0,
				[
					[
						2,
						4,
						[
							[
								3,
								8,
								[
									[5, 12, [[6, 16]]],
									[
										10,
										12,
										[
											[11, 16],
											[13, 16],
											[19, 16],
											[
												24,
												16,
												[
													[25, 20, [[26, 24]]],
													[29, 20, [[30, 24]]],
													[33, 20, [[34, 24]]]
												]
											]
										]
									],
									[41, 12, [[42, 16]]]
								]
							]
						]
					]
				]
			]
		]
	);

	function About($$anchor, $$props) {
		check_target(new.target);
		push($$props, false, About);

		var $$exports = { ...legacy_api() };
		var section = root$2();

		append($$anchor, section);

		return pop($$exports);
	}

	CatalogSlider[FILENAME] = 'src/components/CatalogSlider.svelte';

	var root$1 = add_locations(from_html(`<button class="nav-btn prev svelte-r5x04e" aria-label="Предыдущее фото"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M8.5 1.5L2 8L8.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>`), CatalogSlider[FILENAME], [[34, 20, [[35, 24, [[36, 28]]]]]]);
	var root_1 = add_locations(from_html(`<div class="slide svelte-r5x04e"><img loading="lazy" class="svelte-r5x04e"/></div>`), CatalogSlider[FILENAME], [[48, 28, [[49, 32]]]]);
	var root_2 = add_locations(from_html(`<button class="nav-btn next svelte-r5x04e" aria-label="Следующее фото"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M1.5 1.5L8 8L1.5 14.5" stroke="#111111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>`), CatalogSlider[FILENAME], [[57, 20, [[58, 24, [[59, 28]]]]]]);
	var root_3 = add_locations(from_html(`<button></button>`), CatalogSlider[FILENAME], [[68, 28]]);
	var root_4 = add_locations(from_html(`<div class="dots-wrapper svelte-r5x04e"></div>`), CatalogSlider[FILENAME], [[66, 20]]);
	var root_5 = add_locations(from_html(`<div class="slider-container svelte-r5x04e"><!> <div class="slider-window svelte-r5x04e"><div class="slider-track svelte-r5x04e"></div></div> <!> <!></div>`), CatalogSlider[FILENAME], [[31, 12, [[42, 16, [[43, 20]]]]]]);
	var root_6 = add_locations(from_html(`<p class="empty-msg svelte-r5x04e">Фотографии в папку <code class="svelte-r5x04e">src/assets/catalog/</code> пока не добавлены.</p>`), CatalogSlider[FILENAME], [[79, 12, [[79, 52]]]]);
	var root_7 = add_locations(from_html(`<section id="furniture" class="catalog-section svelte-r5x04e"><div class="container svelte-r5x04e"><h2 class="title svelte-r5x04e">Каталог уже установленной мебели</h2> <!></div></section>`), CatalogSlider[FILENAME], [[26, 0, [[27, 4, [[28, 8]]]]]]);

	function CatalogSlider($$anchor, $$props) {
		check_target(new.target);
		push($$props, true, CatalogSlider);

		const imageModules = undefined('/src/assets/catalog/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
		const images = Object.values(imageModules);
		let currentIndex = tag(state(0), 'currentIndex');

		function prevSlide() {
			if (strict_equals(images.length, 0)) return;

			set(currentIndex, (get(currentIndex) - 1 + images.length) % images.length);
		}

		function nextSlide() {
			if (strict_equals(images.length, 0)) return;

			set(currentIndex, (get(currentIndex) + 1) % images.length);
		}

		function goToSlide(index) {
			set(currentIndex, index, true);
		}

		var $$exports = { ...legacy_api() };
		var section = root_7();
		var div = child(section);
		var node = sibling(child(div), 2);

		{
			var consequent_3 = ($$anchor) => {
				var div_1 = root_5();
				var node_1 = child(div_1);

				{
					var consequent = ($$anchor) => {
						var button = root$1();

						delegated('click', button, prevSlide);
						append($$anchor, button);
					};

					add_svelte_meta(
						() => if_block(node_1, ($$render) => {
							if (images.length > 1) $$render(consequent);
						}),
						'if',
						CatalogSlider,
						33,
						16
					);
				}

				var div_2 = sibling(node_1, 2);
				var div_3 = child(div_2);

				add_svelte_meta(
					() => each(div_3, 21, () => images, index, ($$anchor, src, index) => {
						var div_4 = root_1();
						var img = child(div_4);

						set_attribute(img, 'alt', `Установленная мебель ${index + 1}`);
						reset(div_4);
						template_effect(() => set_attribute(img, 'src', get(src)));
						append($$anchor, div_4);
					}),
					'each',
					CatalogSlider,
					47,
					24
				);

				var node_2 = sibling(div_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var button_1 = root_2();

						delegated('click', button_1, nextSlide);
						append($$anchor, button_1);
					};

					add_svelte_meta(
						() => if_block(node_2, ($$render) => {
							if (images.length > 1) $$render(consequent_1);
						}),
						'if',
						CatalogSlider,
						56,
						16
					);
				}

				var node_3 = sibling(node_2, 2);

				{
					var consequent_2 = ($$anchor) => {
						var div_5 = root_4();

						add_svelte_meta(
							() => each(div_5, 21, () => images, index, ($$anchor, _, index) => {
								var button_2 = root_3();
								let classes;

								set_attribute(button_2, 'aria-label', `Перейти к слайду ${index + 1}`);
								template_effect(() => classes = set_class(button_2, 1, 'dot svelte-r5x04e', null, classes, { active: strict_equals(get(currentIndex), index) }));

								delegated('click', button_2, function click() {
									return goToSlide(index);
								});

								append($$anchor, button_2);
							}),
							'each',
							CatalogSlider,
							67,
							24
						);
						append($$anchor, div_5);
					};

					add_svelte_meta(
						() => if_block(node_3, ($$render) => {
							if (images.length > 1) $$render(consequent_2);
						}),
						'if',
						CatalogSlider,
						65,
						16
					);
				}
				template_effect(() => set_style(div_3, `transform: translateX(-${get(currentIndex) * 100}%);`));
				append($$anchor, div_1);
			};

			var alternate = ($$anchor) => {
				var p = root_6();

				append($$anchor, p);
			};

			add_svelte_meta(
				() => if_block(node, ($$render) => {
					if (images.length > 0) $$render(consequent_3); else $$render(alternate, -1);
				}),
				'if',
				CatalogSlider,
				30,
				8
			);
		}
		append($$anchor, section);

		return pop($$exports);
	}

	delegate(['click']);

	App[FILENAME] = 'src/App.svelte';

	var root = add_locations(from_html(`<div class="layout svelte-1n46o8q"><!> <main class="content svelte-1n46o8q"><!> <section id="benefits"><!></section> <section id="works"><!></section> <section id="promotions"><!></section> <section id="about"><!></section> <section id="gallery"><!></section> <section id="reviews" class="placeholder svelte-1n46o8q">Отзывы</section></main> <!></div>`), App[FILENAME], [
		[
			12,
			0,
			[
				[
					15,
					1,
					[[17, 2], [20, 2], [23, 2], [26, 2], [29, 2], [32, 2]]
				]
			]
		]
	]);

	function App($$anchor, $$props) {
		check_target(new.target);
		push($$props, false, App);

		var $$exports = { ...legacy_api() };
		var div = root();
		var node = child(div);

		add_svelte_meta(() => Header(node, {}), 'component', App, 13, 1, { componentTag: 'Header' });

		var main = sibling(node, 2);
		var node_1 = child(main);

		add_svelte_meta(() => Hero(node_1, {}), 'component', App, 16, 2, { componentTag: 'Hero' });

		var section = sibling(node_1, 2);
		var node_2 = child(section);

		add_svelte_meta(() => Benefits(node_2, {}), 'component', App, 18, 3, { componentTag: 'Benefits' });

		var section_1 = sibling(section, 2);
		var node_3 = child(section_1);

		add_svelte_meta(() => Works(node_3, {}), 'component', App, 21, 3, { componentTag: 'Works' });

		var section_2 = sibling(section_1, 2);
		var node_4 = child(section_2);

		add_svelte_meta(() => PromoDrawer(node_4, {}), 'component', App, 24, 3, { componentTag: 'PromoDrawer' });

		var section_3 = sibling(section_2, 2);
		var node_5 = child(section_3);

		add_svelte_meta(() => About(node_5, {}), 'component', App, 27, 3, { componentTag: 'About' });

		var section_4 = sibling(section_3, 2);
		var node_6 = child(section_4);

		add_svelte_meta(() => CatalogSlider(node_6, {}), 'component', App, 30, 3, { componentTag: 'CatalogSlider' });

		var node_7 = sibling(main, 2);

		add_svelte_meta(() => Footer(node_7, { id: 'contacts' }), 'component', App, 35, 1, { componentTag: 'Footer' });
		append($$anchor, div);

		return pop($$exports);
	}

	const app = mount(App, {
	    target: document.body
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
