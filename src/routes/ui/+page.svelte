<script lang="ts">
  import { onMount } from 'svelte'
  import { GameUI } from '$lib/ui'
  import type { Cube } from '$lib/game'

  onMount(() => {
    const uiContainer = document.getElementById('ui-app')
    if (uiContainer) {
      const cube: Cube = [
        [
          [
            { type: 'empty', value: 0 },
            { type: 'number', value: 2 },
            { type: 'number', value: 4 }
          ],
          [
            { type: 'number', value: 8 },
            { type: 'number', value: 16 },
            { type: 'number', value: 32 }
          ],
          [
            { type: 'number', value: 64 },
            { type: 'number', value: 128 },
            { type: 'number', value: 512 }
          ]
        ],
        [
          [
            { type: 'empty', value: 0 },
            { type: 'number', value: 1024 },
            { type: 'number', value: 2048 }
          ],
          [
            { type: 'number', value: 8 },
            { type: 'number', value: 16 },
            { type: 'number', value: 32 }
          ],
          [
            { type: 'number', value: 64 },
            { type: 'number', value: 128 },
            { type: 'number', value: 512 }
          ]
        ],
        [
          [
            { type: 'empty', value: 0 },
            { type: 'number', value: 2 },
            { type: 'number', value: 4 }
          ],
          [
            { type: 'number', value: 8 },
            { type: 'number', value: 16 },
            { type: 'number', value: 32 }
          ],
          [
            { type: 'number', value: 64 },
            { type: 'number', value: 128 },
            { type: 'number', value: 512 }
          ]
        ]
      ]
      new GameUI(uiContainer, cube)
    }
  })
</script>

<h1>test ui</h1>
<div id="ui-app"></div>
