<script lang="ts">
  import { onMount } from 'svelte'
  import { GameUI } from '$lib/ui/canvas'
  import type { Cube } from '$lib/game'

  let gameUI: GameUI | null = null
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

  onMount(() => {
    const uiContainer = document.getElementById('ui-app')
    if (uiContainer) {
      gameUI = new GameUI(uiContainer, cube)
    }
  })

  function update() {
    gameUI?.update(cube)
  }
</script>

<h1>test ui</h1>
<div id="ui-app"></div>
<div class="d-flex flex-col">
  {#each cube as layer}
    <div class="d-flex flex-col pad">
      {#each layer as row}
        <div class="d-flex flex-row">
          {#each row as cell}
            <input
              class="input-cell-value"
              type="text"
              maxlength="4"
              bind:value={cell.value}
              on:input={update}
            />
          {/each}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .d-flex {
    display: flex;
  }

  .flex-row {
    flex-direction: row;
  }

  .flex-col {
    flex-direction: column;
  }

  .pad {
    padding: 0.5rem;
  }

  .input-cell-value {
    width: 30px;
  }
</style>
