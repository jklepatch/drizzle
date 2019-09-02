<template>
  <div>
    <drizzle-contract
      contractName="Tuple"
      method="getTuples"
      label="Value"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Tuple',

  computed: mapGetters('drizzle', ['isDrizzleInitialized'])
}
</script>

<style></style>
