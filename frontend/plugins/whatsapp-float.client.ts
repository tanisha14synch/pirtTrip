import { createVNode, render } from 'vue'
import WhatsAppFloatingButton from '~/components/layout/WhatsAppFloatingButton.vue'

export default defineNuxtPlugin((nuxtApp) => {
  if (document.getElementById('whatsapp-float-mount')) return

  const mountPoint = document.createElement('div')
  mountPoint.id = 'whatsapp-float-mount'
  document.body.appendChild(mountPoint)

  const vnode = createVNode(WhatsAppFloatingButton)
  vnode.appContext = nuxtApp.vueApp._context
  render(vnode, mountPoint)
})
