<template>
  <div class="min-h-screen bg-[#f5f5f5] text-black">
    <AdminSidebar />
    <div class="flex h-screen flex-col overflow-hidden lg:ml-64">
      <nav class="flex shrink-0 gap-2 border-b border-black/10 bg-white p-3 lg:hidden">
        <NuxtLink to="/" class="rounded-lg px-3 py-2 text-sm font-semibold" active-class="bg-orange-50 text-brand-primary">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/vendors" class="rounded-lg px-3 py-2 text-sm font-semibold" active-class="bg-orange-50 text-brand-primary">
          Businesses
        </NuxtLink>
      </nav>
      <AdminTopBar />
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
