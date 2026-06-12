
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/admin" | "/api/admin/sync-user" | "/api/auth" | "/api/auth/[...all]" | "/api/session" | "/api/session/token" | "/auth" | "/auth/login" | "/auth/register" | "/dashboard" | "/dashboard/adherents" | "/dashboard/adherents/[id]" | "/dashboard/matchs" | "/dashboard/matchs/[id]" | "/dashboard/news" | "/dashboard/news/[id]" | "/dashboard/pending" | "/dashboard/profile";
		RouteParams(): {
			"/api/auth/[...all]": { all: string };
			"/dashboard/adherents/[id]": { id: string };
			"/dashboard/matchs/[id]": { id: string };
			"/dashboard/news/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { all?: string; id?: string };
			"/api": { all?: string };
			"/api/admin": Record<string, never>;
			"/api/admin/sync-user": Record<string, never>;
			"/api/auth": { all?: string };
			"/api/auth/[...all]": { all: string };
			"/api/session": Record<string, never>;
			"/api/session/token": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/login": Record<string, never>;
			"/auth/register": Record<string, never>;
			"/dashboard": { id?: string };
			"/dashboard/adherents": { id?: string };
			"/dashboard/adherents/[id]": { id: string };
			"/dashboard/matchs": { id?: string };
			"/dashboard/matchs/[id]": { id: string };
			"/dashboard/news": { id?: string };
			"/dashboard/news/[id]": { id: string };
			"/dashboard/pending": Record<string, never>;
			"/dashboard/profile": Record<string, never>
		};
		Pathname(): "/" | "/api/admin/sync-user" | `/api/auth/${string}` & {} | "/api/session/token" | "/auth/login" | "/auth/register" | "/dashboard" | "/dashboard/adherents" | `/dashboard/adherents/${string}` & {} | "/dashboard/matchs" | `/dashboard/matchs/${string}` & {} | "/dashboard/news" | `/dashboard/news/${string}` & {} | "/dashboard/pending" | "/dashboard/profile";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}