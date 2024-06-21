<template>
  <VContainer>
    <VCard class="mx-auto">
      <VCardTitle class="pb-5">
        <div class="d-flex align-center justify-space-between text-black">
          <div class="d-flex align-center">
            <div class="font-weight-bold text-h6 ml-2"># {{ currentRoom }}</div>
          </div>
          <div class="d-flex align-center">
            <VIcon icon="mdi-account-group-outline" />
          </div>
        </div>
      </VCardTitle>
      <VDivider></VDivider>

      <VCardText class="py-6 px-0">
        <div class="d-flex">
          <!-- Sidebar -->
          <div class="bg-grey-lighten-3 py-4 px-6">
            <div class="d-flex align-center mb-2 px-3 py-2 rounded-md bg-white">
              <VIcon icon="mdi-account-group-outline" />
              <div class="text-body-1 ml-2">Online Users</div>
            </div>
            <v-list>
              <v-list-item v-for="(user, i) in users" :key="i">
                <v-list-item-title>{{ user.username }}</v-list-item-title>
                <VDivider
                  v-if="user.username === route.query.username"
                ></VDivider>
              </v-list-item>
            </v-list>
          </div>
          <!-- Chat -->
          <div
            style="height: 400px"
            class="overflow-y-auto pl-6 flex-fill mr-2"
          >
            <div
              class="bg-transparent w-full mb-3 d-flex"
              v-for="(chat, i) in chats"
              :key="i"
              :class="{
                'justify-center': chat.username === 'bot',
                'justify-end': chat.username === route.query.username,
                'justify-start': chat.username !== route.query.username,
              }"
            >
              <div
                v-if="
                  chat.username !== route.query.username &&
                  chat.username !== 'bot'
                "
                class="mt-3 mr-3"
              >
                <v-avatar>
                  <v-img
                    :src="`https://ui-avatars.com/api/?rounded=true&name=${chat.username}`"
                  ></v-img
                ></v-avatar>
              </div>
              <div
                class="px-6 py-2 w-50 rounded mb-3"
                :class="{
                  'bg-yellow-lighten-4': chat.username === 'bot',
                  'bg-blue-lighten-5': chat.username === route.query.username,
                  'bg-light-green-lighten-4':
                    chat.username !== route.query.username &&
                    chat.username !== 'Vue Chatapp Admin',
                }"
              >
                <div class="d-flex align-center gap-x-3">
                  <div class="text-xs text-primary font-semibold">
                    {{ chat.username }}
                  </div>
                  <div class="text-xs pl-1">{{ chat.time }}</div>
                </div>
                <div class="mt-1 text-body-1">
                  {{ chat.text }}
                </div>
              </div>
              <div
                v-if="
                  chat.username === route.query.username &&
                  chat.username !== 'bot'
                "
                class="mt-3 ml-3"
              >
                <v-avatar>
                  <v-img
                    :src="`https://ui-avatars.com/api/?rounded=true&name=${chat.username}`"
                  ></v-img
                ></v-avatar>
              </div>
            </div>
          </div>
        </div>
      </VCardText>
      <VDivider></VDivider>
      <VCardActions class="pt-6">
        <form class="w-100" @submit.prevent="onSubmit">
          <VTextField
            hide-details
            variant="solo"
            elevation="0"
            rounded="lg"
            v-model="message"
          >
            <template #append-inner>
              <v-btn
                append-icon="mdi-send-circle-outline"
                rounded="lg"
                class="bg-primary text-white px-6"
                @click="onSubmit"
              >
                Send
              </v-btn>
            </template>
          </VTextField>
        </form>
      </VCardActions>
    </VCard>
  </VContainer>
</template>

<script setup lang="ts">
type Chat = {
  username: string;
  text: string;
  time: string;
  room?: string;
};
type User = {
  id: string;
  username: string;
  room: string;
};
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { io, type Socket } from "socket.io-client";
const route = useRoute();
const router = useRouter();

const message = ref("");
const chats = ref<Chat[]>([]);
const users = ref<User[]>([]);
const currentRoom = ref("");
const socket = ref<Socket>();
const onSubmit = async () => {
  socket.value?.emit("chatMessage", message.value);
  await nextTick(() => (message.value = ""));
};
onMounted(() => {
  socket.value = io("http://localhost:4000");
  const { username, room } = route.query as Partial<Chat>;

  if (!username || !room) {
    router.push("/");
  }
  socket.value?.emit("joinRoom", { username, room });
  socket.value?.on("roomUsers", (response: { room: string; users: User[] }) => {
    users.value = response.users;
    currentRoom.value = response.room;
  });
  socket.value?.on("message", (message: Chat) => {
    chats.value.push(message);
  });
});
onBeforeUnmount(() => {
  console.log("[DISCONNECT_BLOCK]");
  socket.value?.disconnect();
});
</script>

<style scoped></style>
