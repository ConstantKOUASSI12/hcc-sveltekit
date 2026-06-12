<script lang="ts">
  import { goto }       from '$app/navigation';
  import { onMount }    from 'svelte';
  import { useSession } from '$lib/auth-client';

  const session = useSession();

  onMount(() => {
    if ($session.data) {
      goto('/dashboard');
    } else {
      goto('/auth/login');
    }
  });
</script>