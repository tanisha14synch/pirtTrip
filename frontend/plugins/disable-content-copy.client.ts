function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return !!target.closest('input, textarea, select, [contenteditable="true"]')
}

export default defineNuxtPlugin(() => {
  const blockUnlessEditable = (event: Event) => {
    if (!isEditableTarget(event.target)) {
      event.preventDefault()
    }
  }

  const options: AddEventListenerOptions = { capture: true }

  document.addEventListener('selectstart', blockUnlessEditable, options)
  document.addEventListener('copy', blockUnlessEditable, options)
  document.addEventListener('cut', blockUnlessEditable, options)
  document.addEventListener('contextmenu', blockUnlessEditable, options)
  document.addEventListener('dragstart', blockUnlessEditable, options)
})
