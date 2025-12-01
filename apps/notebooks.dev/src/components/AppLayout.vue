<template>
  <v-app class="home-container">
    <!-- Responsive App Bar -->
    <v-app-bar
      app
      class="app-bar"
      color="secondary"
      flat
      height="40"
    >
      <v-app-bar-nav-icon class="d-md-none" rounded="0" @click="drawer = !drawer" />
      <v-btn class="ml-0 px-3" rounded="0" @click="router.push('/')">
        <v-img src="@/assets/notebook-logo-alt-lighter.svg" style="width: 150px" />
      </v-btn>

      <v-spacer />

      <!-- Desktop Nav -->
      <div class="d-none d-md-flex nav-buttons align-center">

        <v-btn
          v-for="item in navigation"
          :key="item.path"
          class="mx-1"
          density="comfortable"
          :icon="item.icon"
          :prepend-icon="item.icon"
          rounded="0"
          :to="item.path"
          variant="text"
        />

      </div>
    </v-app-bar>

    <!-- Mobile Drawer -->
    <v-navigation-drawer v-model="drawer" class="d-md-none" temporary>
      <v-list>
        <v-list-item v-for="item in navigation" :key="item.path" :to="item.path">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Hero Workspace -->
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  const drawer = ref(false)
  const router = useRouter()

  const navigation = [
    {
      title: 'Home',
      path: '/',
      icon: 'mdi-home',
    },
    // {
    //   title: 'Explore',
    //   path: '/explore',
    //   icon: 'mdi-magnify',
    // },
  ]
</script>

<style scoped lang="scss">

.logo {
  background: url("@/assets/notebook-logo-alt-lighter.svg");
  width: 160px;
  height: 30px;
  background-size: cover;
  cursor: pointer;
  &:hover {
    background: url("@/assets/notebook-logo-alt-lighter.svg");
    background-size: cover;
  }
}
.home-container {
  background-color: #eeeae3;
  background-image: radial-gradient(rgba(35, 98, 77, 0.2) 1px, transparent 1px);
  background-size: 24px 24px;
  min-height: 100vh;
}

.app-bar {
  //backdrop-filter: blur(6px);
  height:40px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
}

.nav-buttons .v-btn {
  margin-left: 12px;
  font-size: 15px !important;
}

/* -------------------------------------------------
   Mobile Fixes
--------------------------------------------------*/
@media (max-width: 780px) {
  .device-frame {
    padding: 14px; /* thinner bezel */
    border-radius: 14px;
    margin-bottom: 30px;
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.12),
      inset 0 0 4px rgba(255, 255, 255, 0.08);
  }

  .device-frame::before {
    top: 8px;
    width: 8px; /* smaller camera dot */
    height: 8px;
  }
}

.site-title {
  font-family: "Courier New", monospace;
  font-weight: 700;
  font-size: clamp(20px, 4vw, 32px);
}
</style>
