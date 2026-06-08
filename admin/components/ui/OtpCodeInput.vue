<script setup lang="ts">
const model = defineModel<string[]>({ required: true })

const props = withDefaults(
  defineProps<{
    inputId?: string
    boxClass?: string
    ariaLabel?: string
  }>(),
  {
    inputId: 'otp-code',
    boxClass: '',
    ariaLabel: 'One-time verification code',
  },
)

const {
  digits,
  inputRef,
  onInput,
  focusInput,
  startListening,
  fillFromString,
  clearDigits,
} = useOtpAutofill(model.value.length || 6)

watch(
  model,
  (value) => {
    if (value.join('') !== digits.value.join('')) {
      fillFromString(value.join(''))
    }
  },
  { deep: true },
)

watch(
  digits,
  (value) => {
    if (value.join('') !== model.value.join('')) {
      model.value = [...value]
    }
  },
  { deep: true },
)

onMounted(() => {
  fillFromString(model.value.join(''))
  startListening()
  focusInput()
})

defineExpose({
  focus: focusInput,
  clear: clearDigits,
  restartListening: startListening,
})
</script>

<template>
  <div
    class="relative flex justify-between gap-2"
    role="group"
    :aria-label="props.ariaLabel"
    @click="focusInput"
  >
    <input
      :id="props.inputId"
      ref="inputRef"
      type="tel"
      name="one-time-code"
      inputmode="numeric"
      pattern="[0-9]*"
      autocomplete="one-time-code"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      enterkeyhint="done"
      maxlength="6"
      class="otp-autofill-input absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-center text-2xl font-bold tracking-[0.55em] text-transparent caret-brand-primary outline-none"
      :aria-label="props.ariaLabel"
      @input="onInput"
      @focus="startListening"
    >
    <div
      v-for="(digit, index) in digits"
      :key="index"
      class="pointer-events-none relative z-0 flex h-[52px] w-full max-w-[52px] items-center justify-center rounded-xl border text-center text-xl font-bold"
      :class="props.boxClass"
      aria-hidden="true"
    >
      {{ digit }}
    </div>
  </div>
</template>
