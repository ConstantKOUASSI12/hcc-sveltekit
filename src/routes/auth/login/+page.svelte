<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import { goto } from '$app/navigation';

  let { form }: { form: ActionData } = $props();

  let loading  = $state(false);
  let showPw   = $state(false);
  let email    = $state('');
  let password = $state('');
</script>

<svelte:head>
  <title>Connexion — HCC</title>
</svelte:head>

<div class="min-h-screen flex">

  <!-- Panneau gauche branding -->
  <div class="hidden lg:flex flex-col justify-between w-[480px] p-12
              bg-gradient-hcc relative overflow-hidden flex-shrink-0">
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      {#each [320, 240, 170, 110] as size}
        <div class="absolute rounded-full border border-white/10"
             style="width:{size}px;height:{size}px;
                    bottom:-{size/4}px;right:-{size/5}px"></div>
      {/each}
    </div>

    <div class="relative z-10 flex items-center gap-4">
      <div class="w-12 h-12 bg-white/15 border border-white/20 rounded-2xl
                  flex items-center justify-center">
        <span class="font-display text-white text-2xl">H</span>
      </div>
      <div>
        <p class="font-display text-white text-3xl tracking-widest">HCC</p>
        <p class="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-0.5">
          Handball Club de Comines
        </p>
      </div>
    </div>

    <div class="relative z-10">
      <h2 class="font-display text-white leading-none tracking-wide text-6xl">
        ESPACE<br/>MEMBRES
      </h2>
      <div class="w-14 h-1 bg-accent-400 rounded-full mt-5 mb-5"></div>
      <p class="text-white/50 text-sm leading-relaxed max-w-xs">
        Gérez vos matchs, suivez les actualités du club
        et restez connecté avec toute l'équipe du H.C.C.
      </p>
      <div class="grid grid-cols-2 gap-3 mt-8">
        {#each [
          { v: '120+', l: 'Adhérents'       },
          { v: '30+',  l: 'Matchs / saison' },
          { v: '15',   l: 'Ans d\'histoire' },
          { v: '🏆',   l: 'Champion rég.'   },
        ] as s}
          <div class="bg-white/8 border border-white/10 rounded-xl p-4">
            <p class="font-display text-white text-2xl tracking-wide">{s.v}</p>
            <p class="text-white/40 text-[11px] mt-0.5">{s.l}</p>
          </div>
        {/each}
      </div>
    </div>

    <p class="relative z-10 text-white/20 text-xs">
      © 2026 HCC — Handball Club de Comines
    </p>
  </div>

  <!-- Panneau droit formulaire -->
  <div class="flex-1 flex items-center justify-center bg-gray-50 p-8">
    <div class="w-full max-w-[420px]">

      <!-- Logo mobile -->
      <div class="flex items-center gap-3 mb-10 lg:hidden">
        <div class="w-10 h-10 bg-gradient-hcc rounded-xl flex items-center justify-center">
          <span class="font-display text-white text-xl">H</span>
        </div>
        <p class="font-display text-hcc-600 text-2xl tracking-widest">HCC</p>
      </div>

      <div class="mb-8 animate-fade">
        <h1 class="font-display text-5xl text-gray-900 tracking-wide leading-none">
          CONNEXION
        </h1>
        <p class="text-gray-400 text-sm mt-2">Accédez à votre espace membre</p>
      </div>

      {#if form?.error}
        <div class="flex items-start gap-3 bg-red-50 border border-red-200
                    text-red-700 rounded-xl px-4 py-3 text-sm mb-5 animate-fade">
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                     1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34
                     16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {form.error}
        </div>
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          return async ({ result, update }) => {
            loading = false;

            if (result.type === 'redirect') {
              await goto(result.location);
              return;
            }

            if (result.type === 'success' && result.data?.success) {
              await goto('/dashboard');
              return;
            }

            await update();
          };
        }}
        class="space-y-4 animate-fade"
        style="animation-delay:.08s"
      >
        <!-- Email -->
        <div>
          <label class="label" for="email">Adresse email</label>
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                        text-gray-400 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0
                       002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <input
              id="email"
              name="email"
              type="email"
              class="input pl-10"
              placeholder="votre@email.com"
              value={form?.email ?? email}
              disabled={loading}
              autocomplete="email"
              required
            />
          </div>
        </div>

        <!-- Mot de passe -->
        <div>
          <label class="label" for="password">Mot de passe</label>
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                        text-gray-400 pointer-events-none"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              class="input pl-10 pr-12"
              placeholder="••••••••••••"
              disabled={loading}
              autocomplete="current-password"
              required
            />
            <button type="button"
                    onclick={() => showPw = !showPw}
                    class="absolute right-3.5 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="2">
                {#if showPw}
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                           0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029
                           m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242
                           4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
                           M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0
                           8.268 2.943 9.543 7a10.025 10.025 0 01-4.132
                           5.411m0 0L21 21"/>
                {:else}
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                           8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                           7-4.477 0-8.268-2.943-9.542-7z"/>
                {/if}
              </svg>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit"
                disabled={loading}
                class="btn-primary w-full justify-center py-3.5 mt-2 text-base
                       font-semibold tracking-wide disabled:opacity-60
                       disabled:cursor-not-allowed">
          {#if loading}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Connexion en cours...
          {:else}
            Se connecter
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          {/if}
        </button>
      </form>

      <!-- Info sécurité -->
      <div class="flex items-center gap-2 justify-center mt-5 text-[11px] text-gray-400">
        <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944
                   a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0
                   5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03
                   9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        Session sécurisée · Cookie httpOnly · Better Auth
      </div>

      <p class="text-center text-sm text-gray-400 mt-5">
        Pas encore membre ?
        <a href="/auth/register"
           class="text-hcc-600 font-semibold hover:underline ml-1">
          Créer un compte →
        </a>
      </p>
    </div>
  </div>
</div>
