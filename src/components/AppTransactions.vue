<template>
    <div class="container">
        <div class="row">
            <div class="col mb-1 mt-3">
                <h1 class="float-start">Transactions</h1>
                <router-link class="btn btn-success float-end" :to="`/admin/dashboard/transactions/edit/0`">New transaction</router-link>
            </div>
            <hr>
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
                    <tr v-for="t in transactions" :key="t.id">

                        <td>{{ t.name }}</td>
                        <td>{{ t.quote }}</td>
                        <td>{{ t.active }}</td>
                        <td>{{ t.tag.name }}</td>
                        <td>{{ t.budget.name }}</td>
                        <td>
                            <router-link class="btn btn-success" :to="`/admin/dashboard/transactions/details/${t.id}`">DETAILS</router-link>
                        </td>
 
                    </tr>
                </tbody>
            </table>
            <div v-else>
                Loading...
            </div>
        </div>
    </div>
</template>

<script>
import {ref, onMounted, onBeforeMount} from 'vue'
import Security from './security.js'
export default {
    name: 'AppTransactions',
    props: {},
    emits: ['error'],

    setup(props, cxt) {
        let ready = ref(false);
        let transactions = ref({})

        onBeforeMount(() => { Security.requireToken()})
        onMounted(() => {
            fetch(process.env.VUE_APP_API_URL + "/admin/dashboard/transactions", Security.requestOptions())
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    cxt.emit('error', response.message)
                } else {
                    transactions.value = response.data.transactions;
                    ready.value = true;
                }
            }).catch(error => {
                cxt.emit('error', error)
            })
        })
        return {
            transactions,
            ready
        }
    }
}
</script>
