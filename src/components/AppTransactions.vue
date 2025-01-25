<template>
  <div class="container">
    <div class="row">
      <div class="col mb-1 mt-3">
        <h1 class="float-start">Transactions</h1>
        <button class="btn btn-primary float-end m-1" @click="setAllActive">
          Set all active
        </button>
        <router-link
          class="btn btn-success float-end m-1"
          :to="`/admin/dashboard/transactions/edit/0`"
          >New transaction</router-link
        >
      </div>
      <hr />
      <div>
        <h5>All transactions: {{ allTransactionsQuote }}</h5>
        <h5>Active transactions: {{ activeTransactionsQuote }}</h5>
        <h5>Inactive transactions: {{ inactiveTransactionsQuote }}</h5>
      </div>
      <table v-if="ready" class="table table-compact table-stripped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quote</th>
            <th>Active</th>
            <th>Tag</th>
            <th>Budget</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in transactions"
            :key="t.id"
            :class="{ 'table-secondary': !t.active }"
          >
            <td>{{ t.name }}</td>
            <td>{{ t.quote }}</td>
            <td>
              <button
                class="btn"
                :class="{ 'btn-outline-success': t.active }"
                @click="setStatus(t.id, !t.active)"
              >
                {{ t.active ? "Active" : "Inactive" }}
              </button>
            </td>
            <td>{{ t.tag.name }}</td>
            <td>{{ t.budget.name }}</td>
            <td>
              <router-link
                class="btn btn-success"
                :to="`/admin/dashboard/transactions/details/${t.id}`"
                >DETAILS</router-link
              >
            </td>
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
import notie from "notie";

export default {
  name: "AppTransactions",
  props: {},
  emits: ["error", "success"],

  setup(props, cxt) {
    let ready = ref(false);
    let transactions = ref({});
    let allTransactionsQuote = ref(0);
    let activeTransactionsQuote = ref(0);
    let inactiveTransactionsQuote = ref(0);

    onBeforeMount(() => {
      Security.requireToken();
    });
    onMounted(() => {
      fetch(
        process.env.VUE_APP_API_URL + "/admin/dashboard/transactions",
        Security.requestOptions()
      )
        .then((response) => response.json())
        .then((response) => {
          if (response.error) {
            cxt.emit("error", response.message);
          } else {
            transactions.value = response.data.transactions.sort((a, b) => {
              return b.active - a.active;
            });

            recalculateQuotes();

            ready.value = true;
          }
        })
        .catch((error) => {
          cxt.emit("error", error);
        });
    });

    function recalculateQuotes() {
      allTransactionsQuote.value = 0;
      activeTransactionsQuote.value = 0;
      inactiveTransactionsQuote.value = 0;

      transactions.value.forEach((transaction) => {
        allTransactionsQuote.value += parseFloat(transaction.quote) || 0;
        if (transaction.active) {
          activeTransactionsQuote.value += parseFloat(transaction.quote) || 0;
        } else {
          inactiveTransactionsQuote.value += parseFloat(transaction.quote) || 0;
        }
      });
    }

    function setStatus(transactionId, status) {
      const payload = {
        id: transactionId,
        status: status,
      };
      fetch(
        `${process.env.VUE_APP_API_URL}/admin/dashboard/transactions/set-status`,
        Security.requestOptions(payload, "POST")
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            cxt.emit("error", data.message);
          } else {
            cxt.emit("success", "Transaction status updated!");
            transactions.value.forEach((transaction) => {
              if (transaction.id === transactionId) {
                transaction.active = status;
              }
            });
            // Re-sort transactions after status update
            transactions.value = [...transactions.value].sort((a, b) => {
              return b.active - a.active;
            });
            // Recalculate quotes after status update
            recalculateQuotes();
          }
        })
        .catch((error) => {
          cxt.emit("error", error);
        });
    }

    function setAllActive() {
      notie.confirm({
        text: "Are you sure you want to set all transactions to active?",
        submitText: "Yes",
        cancelText: "Cancel",
        submitCallback: () => {
          fetch(
            `${process.env.VUE_APP_API_URL}/admin/dashboard/transactions/set-all-active`,
            Security.requestOptions({}, "POST")
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.error) {
                cxt.emit("error", data.message);
              } else {
                cxt.emit("success", "All transactions set to active!");
                // Update all transactions to active
                transactions.value.forEach((transaction) => {
                  transaction.active = true;
                });
                // Update quotes
                activeTransactionsQuote.value = allTransactionsQuote.value;
                inactiveTransactionsQuote.value = 0;
              }
            })
            .catch((error) => {
              cxt.emit("error", error);
            });
        },
      });
    }

    return {
      transactions,
      ready,
      allTransactionsQuote,
      activeTransactionsQuote,
      inactiveTransactionsQuote,
      setStatus,
      setAllActive,
      recalculateQuotes,
    };
  },
};
</script>
