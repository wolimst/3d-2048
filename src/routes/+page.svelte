<script lang="ts">
  import { onMount } from 'svelte'
  import { Canvas } from '$lib/ui'
  import { Game, type Direction } from '$lib/game'
  import { persistentStore } from '$lib/stores/localStore'
  import { type Writable } from 'svelte/store'

  let canvas: Canvas | undefined
  let game: Game | undefined

  let loading = true
  let bestScore: Writable<number>

  onMount(() => {
    bestScore = persistentStore('bestScore', 0)
    init()
  })

  function init() {
    loading = true

    const uiContainer = document.getElementById('game')
    if (uiContainer && !canvas) {
      canvas = new Canvas(uiContainer)
      canvas.domElement.addEventListener('shift', shift)
    }

    game = new Game()
    game.init()
    canvas?.applyCube(game.cube)

    loading = false
  }

  function shift(event: Event) {
    if (!canvas || !game) {
      return
    }

    const direction = (event as CustomEvent<Direction>).detail
    const cellEvents = game.shift(direction)
    cellEvents.forEach((event) => canvas?.applyCellEvent(event))

    $bestScore = Math.max($bestScore, game.state.score)

    game = game
  }
</script>

<div class="w-full h-dvh">
  <div
    class="w-full h-[12rem] max-w-md px-4 pt-8 pb-2 mx-auto flex flex-col justify-center"
  >
    <div class="flex items-center gap-2">
      <div class="text-5xl font-black text-[#5d534d] grow">3D 2048</div>

      <div
        class="min-w-20 px-4 py-3 bg-[#a5988b] rounded-md flex flex-col items-center justify-center"
      >
        <div class="font-bold text-[#d8cfc5]">Score</div>
        <div class="text-2xl font-bold text-[#faf8ef]">
          {game?.state.score ?? '...'}
        </div>
      </div>
      <div
        class="min-w-20 px-4 py-3 bg-[#a5988b] rounded-md flex flex-col items-center justify-center"
      >
        <div class="font-bold text-[#d8cfc5]">Best</div>
        <div class="text-2xl font-bold text-[#faf8ef]">
          {$bestScore ?? '...'}
        </div>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-between gap-2">
      <div class="text-[#5e554f] leading-none">
        Join the numbers and get to
        <span class="font-bold text-[#5d534d]">2048!</span>
        {#if !loading && !game?.state.playing}
          <div class="text-lg font-bold text-[#5d534d]">GAME OVER!</div>
        {/if}
      </div>
      <button
        class="min-w-32 px-4 py-3 rounded-md text-[#faf8ef] bg-[#6b635b] hover:bg-[#5d534d] disabled:hover:bg-[#6b635b]"
        on:click={() =>
          (!game?.state.playing ||
            confirm('Are you sure you want to start a new game?')) &&
          init()}
        disabled={loading}
      >
        <span
          class={`font-semibold ${!loading && !game?.state.playing && 'animate-pulse'}`}
        >
          {loading ? 'Loading...' : 'New Game'}
        </span>
      </button>
    </div>
  </div>

  <div id="game" class="w-full h-[calc(100dvh-12rem)] grow rounded-3xl"></div>
</div>
