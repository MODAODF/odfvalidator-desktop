<script setup lang="ts">
import { Ref, ref, watch } from 'vue'
import { onMounted } from 'vue'
import { useEnvironmentStore } from '@renderer/stores/environment'
const environment = useEnvironmentStore()

const odfvalidatorPath: Ref<string | null> = ref(null)

onMounted(async () => {
  const response: string | null = await window.api.checkPlatformAndOdfvalidatorPath()
  odfvalidatorPath.value = response
})

async function specifyOdfvalidatorPath() {
  const path = await window.api.specifyOdfvalidatorPath()
  if (path) {
    odfvalidatorPath.value = path
  }
}

watch(odfvalidatorPath, () => {
  if (odfvalidatorPath.value) {
    environment.odfvalidatorPathSpecified = true
  } else {
    environment.odfvalidatorPathSpecified = false
  }
})
</script>

<template>
  <button @click="specifyOdfvalidatorPath">Select the Odfvalidator</button>
  <p v-if="odfvalidatorPath">{{ odfvalidatorPath }}</p>
</template>
