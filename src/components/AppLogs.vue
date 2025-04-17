<template>
  <div class="container">
    <div class="row">
      <div class="col mb-1 mt-3">
        <h1 class="float-start">Logs</h1>
      </div>
      <hr />
      <table v-if="ready" class="table table-compact table-stripped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Log</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id">
            <td>{{ l.id }}</td>
            <td>{{ l.log }}</td>
            <td>{{ l.created_at }}</td>
            <td>{{ l.updated_at }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>Loading...</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeMount } from "vue";
import Security from "./security.js";
export default {
  name: "AppLogs",
  props: {},
  emits: ["error"],

  setup(props, cxt) {
    let ready = ref(false);
    let logs = ref({});

    onBeforeMount(() => {
      Security.requireToken();
    });
    onMounted(() => {
      fetch(
        process.env.VUE_APP_API_URL + "/admin/dashboard/logs",
        Security.requestOptions()
      )
        .then((response) => response.json())
        .then((response) => {
          if (response.error) {
            cxt.emit("error", response.message);
          } else {
            logs.value = response.data.logs;
            ready.value = true;
          }
        })
        .catch((error) => {
          cxt.emit("error", error);
        });
    });
    return {
      logs,
      ready,
    };
  },
};
</script>
