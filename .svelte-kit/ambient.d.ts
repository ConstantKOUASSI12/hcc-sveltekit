
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const BETTER_AUTH_URL: string;
	export const BETTER_AUTH_SECRET: string;
	export const JWT_SECRET: string;
	export const DATABASE_PROVIDER: string;
	export const DATABASE_URL: string;
	export const SHELL: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const SESSION_MANAGER: string;
	export const QT_ACCESSIBILITY: string;
	export const SNAP_REVISION: string;
	export const XDG_CONFIG_DIRS: string;
	export const CLAUDE_CODE_CHILD_SESSION: string;
	export const XDG_MENU_PREFIX: string;
	export const XDG_CONFIG_DIRS_VSCODE_SNAP_ORIG: string;
	export const GNOME_DESKTOP_SESSION_ID: string;
	export const APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL: string;
	export const SNAP_REAL_HOME: string;
	export const AI_AGENT: string;
	export const SNAP_USER_COMMON: string;
	export const CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING: string;
	export const FONTCONFIG_PATH: string;
	export const CLAUDE_CODE_SESSION_ID: string;
	export const GNOME_SHELL_SESSION_MODE: string;
	export const SSH_AUTH_SOCK: string;
	export const XDG_DATA_HOME: string;
	export const CLAUDE_EFFORT: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const XMODIFIERS: string;
	export const DESKTOP_SESSION: string;
	export const CLAUDE_CODE_ENABLE_TASKS: string;
	export const GDK_PIXBUF_MODULE_FILE: string;
	export const GTK_MODULES: string;
	export const SNAP_EUID: string;
	export const PWD: string;
	export const GSETTINGS_SCHEMA_DIR: string;
	export const XDG_SESSION_DESKTOP: string;
	export const LOGNAME: string;
	export const GTK_EXE_PREFIX: string;
	export const XDG_SESSION_TYPE: string;
	export const COPILOT_OTEL_FILE_EXPORTER_PATH: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const SYSTEMD_EXEC_PID: string;
	export const VSCODE_CODE_CACHE_PATH: string;
	export const XAUTHORITY: string;
	export const NoDefaultCurrentDirectoryInExePath: string;
	export const IM_CONFIG_CHECK_ENV: string;
	export const SNAP_CONTEXT: string;
	export const CLAUDECODE: string;
	export const GJS_DEBUG_TOPICS: string;
	export const HOME: string;
	export const CLAUDE_AGENT_SDK_VERSION: string;
	export const USERNAME: string;
	export const IM_CONFIG_PHASE: string;
	export const LANG: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const VSCODE_IPC_HOOK: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const WAYLAND_DISPLAY: string;
	export const SNAP_ARCH: string;
	export const SNAP_INSTANCE_NAME: string;
	export const SNAP_USER_DATA: string;
	export const VSCODE_CLI: string;
	export const VSCODE_L10N_BUNDLE_LOCATION: string;
	export const INVOCATION_ID: string;
	export const SNAP_LAUNCHER_ARCH_TRIPLET: string;
	export const MANAGERPID: string;
	export const SNAP_UID: string;
	export const CHROME_DESKTOP: string;
	export const GJS_DEBUG_OUTPUT: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const XDG_SESSION_CLASS: string;
	export const COPILOT_OTEL_ENABLED: string;
	export const GTK_PATH: string;
	export const USER: string;
	export const SNAP: string;
	export const GIT_CONFIG_VALUE_0: string;
	export const SNAP_COMMON: string;
	export const CLUTTER_DISABLE_MIPMAPPED_TEXT: string;
	export const SNAP_VERSION: string;
	export const DISPLAY: string;
	export const VSCODE_PID: string;
	export const SHLVL: string;
	export const GDK_PIXBUF_MODULEDIR: string;
	export const LOCPATH: string;
	export const SNAP_LIBRARY_PATH: string;
	export const GSM_SKIP_SSH_AGENT_WORKAROUND: string;
	export const GIT_EDITOR: string;
	export const SNAP_COOKIE: string;
	export const GIT_CONFIG_COUNT: string;
	export const QT_IM_MODULE: string;
	export const APPLICATIONINSIGHTS_CONFIGURATION_CONTENT: string;
	export const VSCODE_CWD: string;
	export const SNAP_DATA: string;
	export const FC_FONTATIONS: string;
	export const VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
	export const XDG_RUNTIME_DIR: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const XDG_DATA_DIRS_VSCODE_SNAP_ORIG: string;
	export const DEBUGINFOD_URLS: string;
	export const MCP_CONNECTION_NONBLOCKING: string;
	export const SNAP_NAME: string;
	export const FONTCONFIG_FILE: string;
	export const ELECTRON_NO_ATTACH_CONSOLE: string;
	export const JOURNAL_STREAM: string;
	export const XDG_DATA_DIRS: string;
	export const GDK_BACKEND: string;
	export const CLAUDE_CODE_EXECPATH: string;
	export const PATH: string;
	export const GDMSESSION: string;
	export const APPLICATION_INSIGHTS_NO_STATSBEAT: string;
	export const GTK_IM_MODULE_FILE: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const VSCODE_NLS_CONFIG: string;
	export const GIO_MODULE_DIR: string;
	export const GIT_CONFIG_KEY_0: string;
	export const GIO_LAUNCHED_DESKTOP_FILE_PID: string;
	export const GIO_LAUNCHED_DESKTOP_FILE: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const COPILOT_OTEL_EXPORTER_TYPE: string;
	export const _: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	export const PUBLIC_API_URL: string;
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		BETTER_AUTH_URL: string;
		BETTER_AUTH_SECRET: string;
		JWT_SECRET: string;
		DATABASE_PROVIDER: string;
		DATABASE_URL: string;
		SHELL: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		SESSION_MANAGER: string;
		QT_ACCESSIBILITY: string;
		SNAP_REVISION: string;
		XDG_CONFIG_DIRS: string;
		CLAUDE_CODE_CHILD_SESSION: string;
		XDG_MENU_PREFIX: string;
		XDG_CONFIG_DIRS_VSCODE_SNAP_ORIG: string;
		GNOME_DESKTOP_SESSION_ID: string;
		APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL: string;
		SNAP_REAL_HOME: string;
		AI_AGENT: string;
		SNAP_USER_COMMON: string;
		CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING: string;
		FONTCONFIG_PATH: string;
		CLAUDE_CODE_SESSION_ID: string;
		GNOME_SHELL_SESSION_MODE: string;
		SSH_AUTH_SOCK: string;
		XDG_DATA_HOME: string;
		CLAUDE_EFFORT: string;
		MEMORY_PRESSURE_WRITE: string;
		ELECTRON_RUN_AS_NODE: string;
		XMODIFIERS: string;
		DESKTOP_SESSION: string;
		CLAUDE_CODE_ENABLE_TASKS: string;
		GDK_PIXBUF_MODULE_FILE: string;
		GTK_MODULES: string;
		SNAP_EUID: string;
		PWD: string;
		GSETTINGS_SCHEMA_DIR: string;
		XDG_SESSION_DESKTOP: string;
		LOGNAME: string;
		GTK_EXE_PREFIX: string;
		XDG_SESSION_TYPE: string;
		COPILOT_OTEL_FILE_EXPORTER_PATH: string;
		VSCODE_ESM_ENTRYPOINT: string;
		SYSTEMD_EXEC_PID: string;
		VSCODE_CODE_CACHE_PATH: string;
		XAUTHORITY: string;
		NoDefaultCurrentDirectoryInExePath: string;
		IM_CONFIG_CHECK_ENV: string;
		SNAP_CONTEXT: string;
		CLAUDECODE: string;
		GJS_DEBUG_TOPICS: string;
		HOME: string;
		CLAUDE_AGENT_SDK_VERSION: string;
		USERNAME: string;
		IM_CONFIG_PHASE: string;
		LANG: string;
		XDG_CURRENT_DESKTOP: string;
		VSCODE_IPC_HOOK: string;
		MEMORY_PRESSURE_WATCH: string;
		WAYLAND_DISPLAY: string;
		SNAP_ARCH: string;
		SNAP_INSTANCE_NAME: string;
		SNAP_USER_DATA: string;
		VSCODE_CLI: string;
		VSCODE_L10N_BUNDLE_LOCATION: string;
		INVOCATION_ID: string;
		SNAP_LAUNCHER_ARCH_TRIPLET: string;
		MANAGERPID: string;
		SNAP_UID: string;
		CHROME_DESKTOP: string;
		GJS_DEBUG_OUTPUT: string;
		GNOME_SETUP_DISPLAY: string;
		XDG_SESSION_CLASS: string;
		COPILOT_OTEL_ENABLED: string;
		GTK_PATH: string;
		USER: string;
		SNAP: string;
		GIT_CONFIG_VALUE_0: string;
		SNAP_COMMON: string;
		CLUTTER_DISABLE_MIPMAPPED_TEXT: string;
		SNAP_VERSION: string;
		DISPLAY: string;
		VSCODE_PID: string;
		SHLVL: string;
		GDK_PIXBUF_MODULEDIR: string;
		LOCPATH: string;
		SNAP_LIBRARY_PATH: string;
		GSM_SKIP_SSH_AGENT_WORKAROUND: string;
		GIT_EDITOR: string;
		SNAP_COOKIE: string;
		GIT_CONFIG_COUNT: string;
		QT_IM_MODULE: string;
		APPLICATIONINSIGHTS_CONFIGURATION_CONTENT: string;
		VSCODE_CWD: string;
		SNAP_DATA: string;
		FC_FONTATIONS: string;
		VSCODE_CRASH_REPORTER_PROCESS_TYPE: string;
		XDG_RUNTIME_DIR: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		XDG_DATA_DIRS_VSCODE_SNAP_ORIG: string;
		DEBUGINFOD_URLS: string;
		MCP_CONNECTION_NONBLOCKING: string;
		SNAP_NAME: string;
		FONTCONFIG_FILE: string;
		ELECTRON_NO_ATTACH_CONSOLE: string;
		JOURNAL_STREAM: string;
		XDG_DATA_DIRS: string;
		GDK_BACKEND: string;
		CLAUDE_CODE_EXECPATH: string;
		PATH: string;
		GDMSESSION: string;
		APPLICATION_INSIGHTS_NO_STATSBEAT: string;
		GTK_IM_MODULE_FILE: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		VSCODE_NLS_CONFIG: string;
		GIO_MODULE_DIR: string;
		GIT_CONFIG_KEY_0: string;
		GIO_LAUNCHED_DESKTOP_FILE_PID: string;
		GIO_LAUNCHED_DESKTOP_FILE: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		COPILOT_OTEL_EXPORTER_TYPE: string;
		_: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		PUBLIC_API_URL: string;
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
