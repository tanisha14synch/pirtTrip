<template>
  <svg
    class="how-work-path pointer-events-none h-full w-full"
    viewBox="0 0 1040 880"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <!-- Top row wave: step 1 → 2 → 3 -->
    <path
      d="M 130 250 C 300 200, 420 200, 520 250 C 680 300, 820 240, 910 250"
      stroke="#949494"
      stroke-width="1.8"
      stroke-dasharray="12 12"
      stroke-linecap="round"
      opacity="0.5"
    />

    <!-- 3 down to 4 (right) -->
    <path
      d="M 910 250 L 930 300 L 910 360"
      stroke="#949494"
      stroke-width="1.8"
      stroke-dasharray="12 12"
      stroke-linecap="round"
      opacity="0.5"
    />

    <!-- 4 across to 5 -->
    <path
      d="M 910 360 C 750 380, 550 390, 320 380"
      stroke="#949494"
      stroke-width="1.8"
      stroke-dasharray="12 12"
      stroke-linecap="round"
      opacity="0.5"
    />

    <!-- 5 down to 6 -->
    <path
      d="M 320 380 L 300 430 L 130 480"
      stroke="#949494"
      stroke-width="1.8"
      stroke-dasharray="12 12"
      stroke-linecap="round"
      opacity="0.5"
    />

    <!-- Bottom row: 6 → 7 → 8 -->
    <path
      d="M 130 480 C 300 530, 420 480, 520 510 C 680 560, 820 500, 910 520"
      stroke="#949494"
      stroke-width="1.8"
      stroke-dasharray="12 12"
      stroke-linecap="round"
      opacity="0.5"
    />

    <circle cx="130" cy="250" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
    <circle cx="520" cy="250" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
    <circle cx="910" cy="250" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
    <circle cx="910" cy="360" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
    <circle cx="320" cy="380" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
    <circle cx="130" cy="480" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
    <circle cx="520" cy="510" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
    <circle cx="910" cy="520" r="5" fill="#fff" stroke="#949494" stroke-width="1.5" />
  </svg>
</template>
