<script lang="ts">
  import { onMount } from 'svelte'
  import { GameUI } from '$lib/ui.ts'

  onMount(() => {
    const uiContainer = document.getElementById('ui-app')
    if (uiContainer) {
      new GameUI(uiContainer)
    }
  })
</script>

<h1>test ui</h1>
<div id="ui-app"></div>
