<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Budget</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li v-if="store.token !== ''" class="nav-item">
            <router-link class="nav-link active" aria-current="page" to="/"
              >Home</router-link
            >
          </li>
          <li v-if="store.token !== ''" class="nav-item dropdown">
            <a
              href="#"
              class="nav-link dropdown-toggle"
              id="navBarDropDown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              >Admin</a
            >

            <ul class="dropdown-menu" aria-labelledby="navBarDropDown">
              <li>
                <router-link
                  class="dropdown-item"
                  to="/admin/dashboard/transactions"
                  >Transactions</router-link
                >
              </li>
              <li>
                <router-link class="dropdown-item" to="/admin/users"
                  >Manage Users</router-link
                >
              </li>
              <li>
                <router-link class="dropdown-item" to="/admin/users/0"
                  >Add User</router-link
                >
              </li>
              <li>
                <router-link class="dropdown-item" to="/admin/dashboard/tags"
                  >Tags</router-link
                >
              </li>
              <li>
                <router-link class="dropdown-item" to="/admin/dashboard/budgets"
                  >Budgets</router-link
                >
              </li>
              <li>
                <router-link class="dropdown-item" to="/admin/dashboard/logs"
                  >Logs</router-link
                >
              </li>
              <li>
                <router-link
                  class="dropdown-item"
                  to="/admin/dashboard/transactions-recurrences"
                  >Transaction Recurrences</router-link
                >
              </li>
            </ul>
          </li>

          <li class="nav-item">
            <router-link v-if="store.token == ''" class="nav-link" to="/login"
              >Login</router-link
            >
            <a
              href="javascript:void(0);"
              v-else
              class="nav-link"
              @click="logout"
              >Logout</a
            >
          </li>
        </ul>

        <span class="navbar-text">
          {{ store.user.first_name ?? "" }}
        </span>
      </div>
    </div>
  </nav>
</template>

<script>
import { store } from "./store.js";
import router from "./../router/index.js";
import Security from "./security.js";

export default {
  data() {
    return {
      store,
    };
  },
  methods: {
    logout() {
      const payload = {
        token: store.token,
      };

      fetch(
        process.env.VUE_APP_API_URL + "/users/logout",
        Security.requestOptions(payload)
      )
        .then((response) => response.json())
        .then((response) => {
          if (response.error) {
            console.log(response.message);
          } else {
            store.token = "";
            store.user = {};

            document.cookie =
              "_site_data=; Path=/; " +
              "SameSite=Strict; Secure; " +
              "Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

            router.push("/login");
          }
        });
    },
  },
};
</script>

<style></style>
