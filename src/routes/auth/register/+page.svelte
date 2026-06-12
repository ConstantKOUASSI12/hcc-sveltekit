<!-- src/routes/auth/register/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let loading  = $state(false);
  let showPw   = $state(false);
  let showConf = $state(false);
  let password = $state('');

  function pwStrength(pw: string) {
    let s = 0;
    if (pw.length >= 12)         s++;
    if (pw.length >= 16)         s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const label = s <= 2 ? 'Faible' : s <= 3 ? 'Moyen' : 'Fort';
    const color = s <= 2 ? 'bg-red-400' : s <= 3 ? 'bg-amber-400' : 'bg-green-500';
    return { score: s, label, color };
  }

  let strength = $derived(pwStrength(password));

  function onPasswordInput(e: Event) {
    password = (e.target as HTMLInputElement).value;
  }
</script>

<svelte:head>
  <title>Inscription — HCC</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
  <div class="w-full max-w-lg">

    <!-- Logo -->
    <div class="flex items-center gap-3 mb-8 animate-fade">
      <div class="w-10 h-10 bg-gradient-hcc rounded-xl flex items-center justify-center">
        <span class="font-display text-white text-xl">H</span>
      </div>
      <div>
        <p class="font-display text-hcc-600 text-2xl tracking-widest leading-none">HCC</p>
        <p class="text-gray-400 text-[10px] uppercase tracking-[0.15em]">
          Handball Club de Comines
        </p>
      </div>
    </div>

    <!-- Succès -->
    {#if form?.success}
      <div class="card text-center py-14 animate-fade">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center
                    justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="font-display text-4xl text-gray-900 tracking-wide mb-3">
          COMPTE CRÉÉ
        </h2>
        <p class="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
          Votre compte a été créé dans Flask et Better Auth.
          Un administrateur va valider votre adhésion.
        </p>
        <div class="flex items-center gap-2 justify-center mt-4 text-xs text-gray-400">
          <svg class="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944
                     a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0
                     5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03
                     9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Créé dans Flask + Better Auth
        </div>
        <a href="/auth/login" class="btn-primary mt-6 mx-auto w-fit">
          Se connecter →
        </a>
      </div>

    {:else}
      <div class="mb-7 animate-fade">
        <h1 class="font-display text-5xl text-gray-900 tracking-wide leading-none">
          INSCRIPTION
        </h1>
        <p class="text-gray-400 text-sm mt-2">Rejoignez le Handball Club de Comines</p>
      </div>

      <!-- Erreur globale -->
      {#if form?.error}
        <div class="flex items-start gap-3 bg-red-50 border border-red-200
                    text-red-700 rounded-xl px-4 py-3 text-sm mb-5 animate-fade">
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
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
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
        class="card animate-fade space-y-4"
        style="animation-delay:.06s"
      >
        <!-- Prénom / Nom -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label" for="first_name">Prénom</label>
            <input id="first_name" name="first_name" type="text" class="input"
                   placeholder="Alice"
                   value={form?.values?.first_name ?? ''}
                   disabled={loading} autocomplete="given-name" required/>
          </div>
          <div>
            <label class="label" for="last_name">Nom</label>
            <input id="last_name" name="last_name" type="text" class="input"
                   placeholder="Dupont"
                   value={form?.values?.last_name ?? ''}
                   disabled={loading} autocomplete="family-name" required/>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="label" for="email">Adresse email</label>
          <input id="email" name="email" type="email" class="input"
                 placeholder="alice@email.com"
                 value={form?.values?.email ?? ''}
                 disabled={loading} autocomplete="email" required/>
        </div>

        <!-- Contact -->
        <div>
          <label class="label" for="contact">Téléphone</label>
          <input id="contact" name="contact" type="tel" class="input"
                 placeholder="0600000000"
                 maxlength="10"
                 value={form?.values?.contact ?? ''}
                 disabled={loading} autocomplete="tel" required/>
        </div>

        <!-- Mot de passe -->
        <div>
          <label class="label" for="password">Mot de passe</label>
          <div class="relative">
            <input id="password" name="password" type={showPw ? 'text' : 'password'}
                   class="input pr-12" placeholder="Min. 12 caractères"
                   value={password}
                   oninput={onPasswordInput}
                   disabled={loading} autocomplete="new-password" required/>
            <button type="button" onclick={() => showPw = !showPw}
                    class="absolute right-3.5 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                         8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                         7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
          <!-- Barre de force -->
          {#if password}
            <div class="mt-2 space-y-1">
              <div class="flex gap-1">
                {#each Array(5) as _, i}
                  <div class="h-1 flex-1 rounded-full transition-all
                              {i < strength.score ? strength.color : 'bg-gray-200'}"></div>
                {/each}
              </div>
              <p class="text-xs text-gray-400">
                Force : <span class="font-medium">{strength.label}</span>
              </p>
            </div>
          {/if}
        </div>

        <!-- Confirmation -->
        <div>
          <label class="label" for="confirm">Confirmer le mot de passe</label>
          <div class="relative">
            <input id="confirm" name="confirm"
                   type={showConf ? 'text' : 'password'}
                   class="input pr-12" placeholder="••••••••••••"
                   disabled={loading} autocomplete="new-password" required/>
            <button type="button" onclick={() => showConf = !showConf}
                    class="absolute right-3.5 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                         8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542
                         7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" disabled={loading}
                class="btn-primary w-full justify-center py-3.5 text-base
                       font-semibold tracking-wide disabled:opacity-60
                       disabled:cursor-not-allowed">
          {#if loading}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Création du compte...
          {:else}
            Créer mon compte
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          {/if}
        </button>

        <div class="flex items-center gap-2 justify-center text-[11px] text-gray-400">
          <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944
                     a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0
                     5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03
                     9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Créé dans Flask + Better Auth · Cookie httpOnly
        </div>
      </form>

      <p class="text-center text-sm text-gray-400 mt-5">
        Déjà membre ?
        <a href="/auth/login"
           class="text-hcc-600 font-semibold hover:underline ml-1">
          Se connecter →
        </a>
      </p>
    {/if}
  </div>
</div>
