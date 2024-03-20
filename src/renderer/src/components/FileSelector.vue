<script setup lang="ts">
import { Ref, ref } from 'vue'
import { onMounted } from 'vue'

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
</script>

<template>
  <button v-if="!odfvalidatorPath" @click="specifyOdfvalidatorPath">Select the Odfvalidator</button>
  <p v-if="odfvalidatorPath">{{ odfvalidatorPath }}</p>
</template>
