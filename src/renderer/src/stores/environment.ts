import { defineStore } from 'pinia'
import { Ref, ref, watch } from 'vue'

export const useEnvironmentStore = defineStore('environment', () => {
  const javaInstalled: Ref<boolean> = ref(false)
  const odfvalidatorPathSpecified: Ref<boolean> = ref(false)

  return { javaInstalled, odfvalidatorPathSpecified }
})
