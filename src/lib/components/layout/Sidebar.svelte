<!-- src/lib/components/layout/Sidebar.svelte -->
<script lang="ts">
  import { page }       from '$app/stores';
  import { goto }       from '$app/navigation';
  import { useSession, signOut } from '$lib/auth-client';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import type { User } from '$lib/auth-client';

  let { user = null }: { user?: User | null } = $props();

  const session = useSession();
  let u    = $derived($session.data?.user ?? user);
  let role = $derived(u?.role ?? '');

  type NavItem = { label: string; href: string; icon: string; roles: string[] };

  const navItems: NavItem[] = [
    { label: 'Dashboard',  href: '/dashboard',           icon: 'dashboard', roles: ['admin','coach','player','contributor'] },
    { label: 'Adhérents',  href: '/dashboard/adherents', icon: 'users',     roles: ['admin','coach'] },
    { label: 'En attente', href: '/dashboard/pending',   icon: 'pending',   roles: ['admin'] },
    { label: 'Matchs',     href: '/dashboard/matchs',    icon: 'match',     roles: ['admin','coach','player'] },
    { label: 'Actualités', href: '/dashboard/news',      icon: 'news',      roles: ['admin','coach','player','contributor'] },
    { label: 'Mon profil', href: '/dashboard/profile',   icon: 'profile',   roles: ['admin','coach','player','contributor'] },
  ];

  let filteredNav = $derived(navItems.filter(item => item.roles.includes(role)));
  let currentPath = $derived($page.url.pathname);

  function isActive(href: string, path: string): boolean {
    return path === href || (href !== '/dashboard' && path.startsWith(href));
  }

  function closeSidebar() {
    sidebarOpen.set(false);
  }

  async function handleLogout() {
    closeSidebar();
    await signOut();
    await goto('/auth/login');
  }

  const roleLabels: Record<string, string> = {
    admin:       'Administrateur',
    coach:       'Coach',
    player:      'Joueur',
    contributor: 'Contributeur',
    pending:     'En attente',
  };

  const icons: Record<string, string> = {
    dashboard: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`,
    users:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    pending:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>`,
    match:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    news:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>`,
    profile:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>`,
    logout:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>`,
  };
</script>

<aside class="sidebar" class:open={$sidebarOpen} style="width: var(--sidebar-width)">

  <!-- Logo -->
  <div class="px-6 py-5 border-b border-gray-100">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 bg-gradient-hcc rounded-xl flex items-center justify-center flex-shrink-0">
        <span class="font-display text-white text-lg leading-none">H</span>
      </div>
      <div>
        <div class="font-display text-xl text-hcc-600 leading-none tracking-wide">HCC</div>
        <div class="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
          Handball Comines
        </div>
      </div>
    </div>
  </div>

  <!-- Nav -->
  <nav class="flex-1 px-3 py-4 overflow-y-auto space-y-1">
    {#each filteredNav as item}
      <a href={item.href}
         class="sidebar-link {isActive(item.href, currentPath) ? 'active' : ''}"
         onclick={closeSidebar}>
        <svg class="flex-shrink-0" style="width:18px;height:18px"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {@html icons[item.icon]}
        </svg>
        {item.label}
      </a>
    {/each}
  </nav>

  <!-- User + logout -->
  <div class="px-3 pb-4 border-t border-gray-100 pt-3">
    {#if u}
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
        <div class="w-8 h-8 rounded-full bg-gradient-hcc flex items-center
                    justify-center flex-shrink-0">
          <span class="text-white text-xs font-semibold">
            {u.first_name?.[0] ?? ''}{u.last_name?.[0] ?? ''}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 truncate">
            {u.first_name} {u.last_name}
          </p>
          <p class="text-xs text-gray-400 capitalize">
            {roleLabels[role] ?? role}
          </p>
        </div>
      </div>
    {/if}

    <button onclick={handleLogout}
            class="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
      <svg style="width:18px;height:18px" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        {@html icons.logout}
      </svg>
      Déconnexion
    </button>
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    background: white;
    border-right: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 300ms ease-in-out;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  @media (min-width: 768px) {
    .sidebar {
      transform: translateX(0);
    }
  }
</style>
