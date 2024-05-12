<script lang="ts">
  import { onMount } from 'svelte'
  import { Canvas2 } from '$lib/ui'
  import { Game, rotate } from '$lib/game'

  let canvas2: Canvas2
  let game: Game

  onMount(() => {
    const uiContainer = document.getElementById('ui-app')
    if (uiContainer) {
      canvas2 = new Canvas2(uiContainer)
    }

    game = new Game()
    const initEvents = game.init()
    initEvents.forEach((event) => {
      canvas2.applyCellEvent(event)
    })
  })

  function shift() {
    const events = game.shift([1, 0, 0])
    events.forEach((event) => {
      canvas2.applyCellEvent(event)
    })
  }

  function _rotate() {
    const cube = rotate(game.cube, [-1, 0, 0])
    game.cube = cube
    canvas2.applyCube(cube)
  }
</script>

<h1>test ui</h1>
<div id="ui-app"></div>

<button on:click={shift}>Shift</button>
<button on:click={_rotate}>Rotate</button>
